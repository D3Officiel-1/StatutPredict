
'use server';

/**
 * @fileOverview A flow for unpinning a message in a Telegram channel.
 *
 * - unpinTelegramMessage - A function that unpins the message.
 * - UnpinTelegramMessageInput - The input type for the unpinTelegramMessage function.
 * - UnpinTelegramMessageOutput - The return type for the unpinTelegramMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { unpinChatMessage as unpinTelegramMessageService } from '@/services/telegram';

const UnpinTelegramMessageInputSchema = z.object({
  messageId: z.number().describe('The ID of the message to unpin.'),
});
export type UnpinTelegramMessageInput = z.infer<
  typeof UnpinTelegramMessageInputSchema
>;

const UnpinTelegramMessageOutputSchema = z.object({
  success: z.boolean().describe('Whether the message was unpinned successfully.'),
});
export type UnpinTelegramMessageOutput = z.infer<
  typeof UnpinTelegramMessageOutputSchema
>;

export async function unpinTelegramMessage(
  input: UnpinTelegramMessageInput
): Promise<UnpinTelegramMessageOutput> {
  return unpinTelegramMessageFlow(input);
}

const unpinTelegramMessageFlow = ai.defineFlow(
  {
    name: 'unpinTelegramMessageFlow',
    inputSchema: UnpinTelegramMessageInputSchema,
    outputSchema: UnpinTelegramMessageOutputSchema,
  },
  async ({ messageId }) => {
    const chatId = process.env.TELEGRAM_CHANNEL_ID;
    if (!chatId) {
      throw new Error('TELEGRAM_CHANNEL_ID is not set in environment variables.');
    }

    const result = await unpinTelegramMessageService(chatId, messageId);
    
    if (result.ok) {
      return {
        success: true,
      };
    } else {
      console.error('Failed to unpin Telegram message:', result);
      return {
        success: false,
      };
    }
  }
);
