
'use server';

/**
 * @fileOverview A flow for pinning a message in a Telegram channel.
 *
 * - pinTelegramMessage - A function that pins the message.
 * - PinTelegramMessageInput - The input type for the pinTelegramMessage function.
 * - PinTelegramMessageOutput - The return type for the pinTelegramMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { pinChatMessage as pinTelegramMessageService } from '@/services/telegram';

const PinTelegramMessageInputSchema = z.object({
  messageId: z.number().describe('The ID of the message to pin.'),
});
export type PinTelegramMessageInput = z.infer<
  typeof PinTelegramMessageInputSchema
>;

const PinTelegramMessageOutputSchema = z.object({
  success: z.boolean().describe('Whether the message was pinned successfully.'),
});
export type PinTelegramMessageOutput = z.infer<
  typeof PinTelegramMessageOutputSchema
>;

export async function pinTelegramMessage(
  input: PinTelegramMessageInput
): Promise<PinTelegramMessageOutput> {
  return pinTelegramMessageFlow(input);
}

const pinTelegramMessageFlow = ai.defineFlow(
  {
    name: 'pinTelegramMessageFlow',
    inputSchema: PinTelegramMessageInputSchema,
    outputSchema: PinTelegramMessageOutputSchema,
  },
  async ({ messageId }) => {
    const chatId = process.env.TELEGRAM_CHANNEL_ID;
    if (!chatId) {
      throw new Error('TELEGRAM_CHANNEL_ID is not set in environment variables.');
    }

    const result = await pinTelegramMessageService(chatId, messageId);

    if (result.ok) {
      return {
        success: true,
      };
    } else {
      console.error('Failed to pin Telegram message:', result);
      return {
        success: false,
      };
    }
  }
);
