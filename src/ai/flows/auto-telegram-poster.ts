
'use server';

/**
 * @fileOverview A flow for automatically generating and posting content to Telegram.
 *
 * - autoPostToTelegram - A function that handles the content generation and posting.
 * - AutoPostToTelegramInput - The input type for the autoPostToTelegram function.
 * - AutoPostToTelegramOutput - The return type for the autoPostToTelegram function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendTelegramMessage } from './send-telegram-message';

const AutoPostToTelegramInputSchema = z.object({
  topic: z.string().describe('The topic for the post to be generated.'),
});
export type AutoPostToTelegramInput = z.infer<
  typeof AutoPostToTelegramInputSchema
>;

const AutoPostToTelegramOutputSchema = z.object({
  success: z.boolean().describe('Whether the message was sent successfully.'),
  messageId: z.number().optional().describe('The ID of the sent message.'),
  generatedContent: z.string().describe('The content that was generated and posted.'),
});
export type AutoPostToTelegramOutput = z.infer<
  typeof AutoPostToTelegramOutputSchema
>;

export async function autoPostToTelegram(
  input: AutoPostToTelegramInput
): Promise<AutoPostToTelegramOutput> {
  return autoTelegramPosterFlow(input);
}

const generationPrompt = ai.definePrompt({
    name: 'autoPostContentGenerator',
    input: { schema: z.object({ topic: z.string() }) },
    prompt: `You are an expert content creator for Telegram channels.
    Generate a compelling and engaging post about the following topic: {{{topic}}}.
    The post should be concise, informative, and formatted for Telegram (e.g., using bold, italics, etc., but with Markdown syntax).
    `,
});


const autoTelegramPosterFlow = ai.defineFlow(
  {
    name: 'autoTelegramPosterFlow',
    inputSchema: AutoPostToTelegramInputSchema,
    outputSchema: AutoPostToTelegramOutputSchema,
  },
  async (input) => {
    // 1. Generate the content
    const { output: generatedContentResponse } = await generationPrompt(input);
    if (!generatedContentResponse) {
        throw new Error('Failed to generate content from AI.');
    }
    const generatedContent = generatedContentResponse as unknown as string; // Adjust based on actual output type if structured

    // 2. Send the generated content to Telegram
    const sendResult = await sendTelegramMessage({
      message: generatedContent,
    });

    if (sendResult.success) {
      return {
        success: true,
        messageId: sendResult.messageId,
        generatedContent: generatedContent,
      };
    } else {
      return {
        success: false,
        generatedContent: generatedContent,
      };
    }
  }
);
