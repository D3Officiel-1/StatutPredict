
'use server';

/**
 * @fileOverview A flow for automatically generating and posting daily summaries to Telegram.
 *
 * - postDailySummary - A function that handles the content generation and posting based on a specific topic.
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
export type ContentType = z.infer<typeof ContentTypeSchema>;

const DailySummaryInputSchema = z.object({
  contentType: ContentTypeSchema,
});

export async function postDailySummary(
  input: z.infer<typeof DailySummaryInputSchema>
): Promise<{ success: boolean; message?: string }> {
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
    outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
  },
  async ({ contentType }) => {
    let topic = '';
    let dataForPrompt = 'No data available';

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
            console.log(`No post generated for topic: ${topic} because data was empty or model decided not to post.`);
            return { success: true, message: 'No information to post.' };
        }
        
        const messageToSend = generatedContent as unknown as string;

        // Send the generated content to Telegram
        const sendResult = await sendTelegramMessage({
            message: messageToSend,
        });

        if (sendResult.success) {
            return {
                success: true,
                message: `Post for topic "${topic}" sent successfully.`,
            };
        } else {
            throw new Error(`Failed to send Telegram message for topic "${topic}".`);
        }
    } catch (error) {
        console.error(`Error in dailySummaryPosterFlow for ${contentType}:`, error);
        return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred.' };
    }
  }
);
