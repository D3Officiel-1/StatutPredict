
'use server';

/**
 * @fileOverview A flow for automatically generating and posting engaging community content to Telegram.
 *
 * - postCommunityContent - A function that handles the content generation and posting.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendTelegramMessage } from './send-telegram-message';

const CommunityPostOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export async function postCommunityContent(): Promise<z.infer<typeof CommunityPostOutputSchema>> {
  return communityPostGeneratorFlow();
}

const generationPrompt = ai.definePrompt({
    name: 'communityPostGenerator',
    prompt: `You are an expert Community Manager for a Telegram channel about an ecosystem of apps called "Predict".
    The ecosystem includes apps for sports predictions ("JetPredict"), movie/series predictions ("XalaFlix"), and general service status tracking.
    Your goal is to increase community engagement.
    
    Generate one single, short, and engaging post for the Telegram channel.
    The post can be one of the following, chosen at random:
    - A mini-game related to predictions (e.g., "Guess the score of the next big match", "Predict the next plot twist in [Popular Series]").
    - A poll question to gather opinions (e.g., "Which app feature do you use the most?", "What new type of prediction would you like to see?").
    - An open-ended question to spark discussion (e.g., "What's the most surprising prediction you've ever gotten right?").
    - A fun fact related to predictions, statistics, or the topics of the apps.

    Keep the tone friendly, fun, and concise. Use Telegram's Markdown for formatting (e.g., *bold*, _italic_).
    Ensure the post encourages users to comment and interact.
    
    Example Output 1 (Mini-Game):
    *⚽️ MINI-JEU DU JOUR ⚽️*
    
    Quel sera le score exact du match de ce soir entre le Real Madrid et le FC Barcelone ? 🧐
    
    Écrivez votre prédiction en commentaire ! Le premier à trouver le score exact remportera le titre de "Predict Champion" de la semaine ! 🏆👇
    
    Example Output 2 (Poll):
    *📊 SONDAGE DE LA COMMUNAUTÉ 📊*
    
    Quelle fonctionnalité de JetPredict utilisez-vous le plus ?
    
    A) L'analyse des matchs à venir
    B) Les statistiques des équipes
    C) Le suivi de vos prédictions passées
    D) Autre (dites-le nous en commentaire !)
    
    Votez et discutez-en ci-dessous ! 👇
    `,
});


const communityPostGeneratorFlow = ai.defineFlow(
  {
    name: 'communityPostGeneratorFlow',
    outputSchema: CommunityPostOutputSchema,
  },
  async () => {
    
    // 1. Generate the content
    const { output: generatedContent } = await generationPrompt();

    if (!generatedContent || (generatedContent as string).trim() === '') {
        return { success: false, message: "L'IA n'a pas généré de contenu." };
    }

    // 2. Send to Telegram
    const messageToSend = generatedContent as unknown as string;
    const sendResult = await sendTelegramMessage({ message: messageToSend, parse_mode: 'Markdown' }); // Use Markdown for better compatibility with Telegram formatting

    if (sendResult.success) {
      return {
        success: true,
        message: `Post communautaire envoyé avec succès (ID: ${sendResult.messageId}).`,
      };
    } else {
      return {
        success: false,
        message: "Échec de l'envoi du post communautaire sur Telegram.",
      };
    }
  }
);
