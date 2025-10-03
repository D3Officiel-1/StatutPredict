
'use server';

/**
 * @fileOverview A flow for automatically generating and posting daily summaries to Telegram.
 *
 * - postDailySummary - A function that handles the content generation and posting for all topics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendTelegramMessage } from './send-telegram-message';
import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Application, PricingPlan, DiscountCode, MaintenanceEvent } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ContentTypeSchema = z.enum(['status', 'pricing', 'discounts', 'maintenance']);
type ContentType = z.infer<typeof ContentTypeSchema>;

const DailySummaryInputSchema = z.object({
  contentTypes: z.array(ContentTypeSchema),
});

export async function postDailySummary(
  input: z.infer<typeof DailySummaryInputSchema>
): Promise<{ success: boolean; message: string }> {
  return dailySummaryPosterFlow(input);
}

// Helper function to format date
const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
        return 'Date invalide';
    }
};

const generationPrompt = ai.definePrompt({
    name: 'dailySummaryGenerator',
    input: { schema: z.object({ topic: z.string(), data: z.string() }) },
    prompt: `You are an expert content creator for a Telegram channel called "Statut Predict".
    Your tone is professional, informative, and slightly formal.
    Based on the provided data, generate a compelling and concise post for the channel about the topic of the day.
    The post should be formatted for Telegram using Markdown (e.g., *bold*, _italic_).

    IMPORTANT: If the provided data is empty or indicates "No data available", you MUST output the exact string "NO_POST" and nothing else.

    Topic of the day: {{{topic}}}

    Data:
    {{{data}}}

    Generated Post:
    `,
});


const dailySummaryPosterFlow = ai.defineFlow(
  {
    name: 'dailySummaryPosterFlow',
    inputSchema: DailySummaryInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ contentTypes }) => {
    const results: string[] = [];
    
    for (const contentType of contentTypes) {
        let topic = '';
        let dataForPrompt = 'No data available';
        let postGenerated = false;

        try {
            switch (contentType) {
                case 'status':
                    topic = "Rapport de Statut des Services";
                    const appsSnapshot = await getDocs(query(collection(db, 'applications'), orderBy('name')));
                    const apps: Application[] = appsSnapshot.docs.map(doc => doc.data() as Application);
                    const maintenanceApps = apps.filter(app => app.status); // status: true = maintenance

                    if (maintenanceApps.length > 0) {
                        dataForPrompt = `Les applications suivantes sont actuellement en maintenance : \n${maintenanceApps.map(app => `- ${app.name}`).join('\n')}`;
                    } else {
                        dataForPrompt = "Tous les services sont opérationnels.";
                    }
                    break;

                case 'pricing':
                    topic = "Nos Plans Tarifaires";
                    const pricingAppsSnapshot = await getDocs(query(collection(db, 'applications'), orderBy('name')));
                    const pricingApps: Application[] = pricingAppsSnapshot.docs.map(doc => doc.data() as Application);
                    let pricingData = '';

                    for (const app of pricingApps) {
                        const plansSnapshot = await getDocs(query(collection(db, `applications/${app.id}/plans`), orderBy('price')));
                        if (!plansSnapshot.empty) {
                            pricingData += `\n*${app.name}*:\n`;
                            plansSnapshot.docs.forEach(doc => {
                                const plan = doc.data() as PricingPlan;
                                pricingData += `- _${plan.name}_: ${plan.price} ${plan.currency}/${plan.period}\n`;
                            });
                        }
                    }
                    if (pricingData) {
                        dataForPrompt = pricingData;
                    }
                    break;

                case 'discounts':
                    topic = "Promotions et Codes Bonus";
                    const now = Timestamp.now();
                    const discountsSnapshot = await getDocs(
                        query(
                            collection(db, 'promo'),
                            where('findate', '>=', now),
                            orderBy('findate')
                        )
                    );
                    
                    const activeDiscounts: DiscountCode[] = discountsSnapshot.docs.map(doc => doc.data() as DiscountCode);
                    
                    if (activeDiscounts.length > 0) {
                        dataForPrompt = `Voici les promotions actuellement disponibles :\n` + activeDiscounts.map(d =>
                            `- *${d.code}* : ${d.pourcentage}% de réduction sur le forfait "${d.plan}" jusqu'au ${formatDate(d.findate)}. Titre: ${d.titre}.`
                        ).join('\n');
                    }
                    break;

                case 'maintenance':
                    topic = "Rapport sur les Maintenances";
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);

                    const maintenanceSnapshot = await getDocs(
                        query(
                            collection(db, 'maintenance'),
                            where('date', '>=', Timestamp.fromDate(today)),
                            where('date', '<', Timestamp.fromDate(tomorrow)),
                            orderBy('date')
                        )
                    );

                    const maintenanceEvents: MaintenanceEvent[] = maintenanceSnapshot.docs.map(doc => doc.data() as MaintenanceEvent);
                    
                    if (maintenanceEvents.length > 0) {
                        dataForPrompt = `Maintenances prévues pour aujourd'hui (${formatDate(new Date())}):\n` + maintenanceEvents.map(m =>
                            `- *${m.title}* pour l'application "${m.appName}". Statut: ${m.status}. Description: ${m.description}`
                        ).join('\n');
                    }
                    break;
            }

            // Generate the content
            const { output: generatedContent } = await generationPrompt({ topic, data: dataForPrompt });

            if (!generatedContent || (generatedContent as string).trim() === 'NO_POST') {
                results.push(`Aucun post généré pour: ${topic} (données vides ou décision de l'IA).`);
            } else {
                const messageToSend = generatedContent as unknown as string;
                const sendResult = await sendTelegramMessage({ message: messageToSend });

                if (sendResult.success) {
                    results.push(`Post pour "${topic}" envoyé avec succès.`);
                    postGenerated = true;
                } else {
                    results.push(`Échec de l'envoi du message pour "${topic}".`);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            results.push(`Erreur lors du traitement de ${contentType}: ${errorMessage}`);
        }
         // Add a delay between posts to avoid rate limiting
        if (postGenerated && contentTypes.indexOf(contentType) < contentTypes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
        }
    }

    return { success: true, message: `Rapport d'exécution complet:\n- ${results.join('\n- ')}` };
  }
);
