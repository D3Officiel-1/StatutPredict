
'use server';

/**
 * @fileOverview A flow for sending a story (photo with caption) to a Telegram channel.
 *
 * - sendTelegramStory - A function that sends the story.
 * - SendTelegramStoryInput - The input type for the sendTelegramStory function.
 * - SendTelegramStoryOutput - The return type for the sendTelegramStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendPhoto as sendTelegramPhotoService } from '@/services/telegram';

const SendTelegramStoryInputSchema = z.object({
  caption: z.string().describe('The caption for the photo.'),
  photoUrl: z.string().url().describe('The URL of the photo to send.'),
  buttonTitle: z.string().optional().describe('The title for the optional call-to-action button.'),
  buttonUrl: z.string().url().optional().describe('The URL for the optional call-to-action button.'),
});
export type SendTelegramStoryInput = z.infer<
  typeof SendTelegramStoryInputSchema
>;

const SendTelegramStoryOutputSchema = z.object({
  success: z.boolean().describe('Whether the story was sent successfully.'),
  messageId: z.number().optional().describe('The ID of the sent message.'),
});
export type SendTelegramStoryOutput = z.infer<
  typeof SendTelegramStoryOutputSchema
>;

export async function sendTelegramStory(
  input: SendTelegramStoryInput
): Promise<SendTelegramStoryOutput> {
  return sendTelegramStoryFlow(input);
}

const sendTelegramStoryFlow = ai.defineFlow(
  {
    name: 'sendTelegramStoryFlow',
    inputSchema: SendTelegramStoryInputSchema,
    outputSchema: SendTelegramStoryOutputSchema,
  },
  async (input) => {
    const chatId = process.env.TELEGRAM_CHANNEL_ID;
    if (!chatId) {
      throw new Error('TELEGRAM_CHANNEL_ID is not set in environment variables.');
    }

    let replyMarkup;
    if (input.buttonTitle && input.buttonUrl) {
      replyMarkup = {
        inline_keyboard: [[{ text: input.buttonTitle, url: input.buttonUrl }]],
      };
    }

    const result = await sendTelegramPhotoService(
      chatId,
      input.photoUrl,
      input.caption,
      replyMarkup
    );
    
    if (result.ok) {
      return {
        success: true,
        messageId: result.result.message_id,
      };
    } else {
      console.error('Failed to send Telegram story:', result);
      return {
        success: false,
      };
    }
  }
);
