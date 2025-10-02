
'use server';

/**
 * @fileOverview A flow for sending a message to a Telegram channel.
 *
 * - sendTelegramMessage - A function that sends the message.
 * - SendTelegramMessageInput - The input type for the sendTelegramMessage function.
 * - SendTelegramMessageOutput - The return type for the sendTelegramMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendMessage as sendTelegramMessageService } from '@/services/telegram';

const SendTelegramMessageInputSchema = z.object({
  message: z.string().describe('The message to send to the Telegram channel.'),
});
export type SendTelegramMessageInput = z.infer<
  typeof SendTelegramMessageInputSchema
>;

const SendTelegramMessageOutputSchema = z.object({
  success: z.boolean().describe('Whether the message was sent successfully.'),
  messageId: z.number().optional().describe('The ID of the sent message.'),
});
export type SendTelegramMessageOutput = z.infer<
  typeof SendTelegramMessageOutputSchema
>;

export async function sendTelegramMessage(
  input: SendTelegramMessageInput
): Promise<SendTelegramMessageOutput> {
  return sendTelegramMessageFlow(input);
}

const sendTelegramMessageFlow = ai.defineFlow(
  {
    name: 'sendTelegramMessageFlow',
    inputSchema: SendTelegramMessageInputSchema,
    outputSchema: SendTelegramMessageOutputSchema,
  },
  async (input) => {
    const chatId = process.env.TELEGRAM_CHANNEL_ID;
    if (!chatId) {
      throw new Error('TELEGRAM_CHANNEL_ID is not set in environment variables.');
    }

    const result = await sendTelegramMessageService(chatId, input.message);
    
    if (result.ok) {
      return {
        success: true,
        messageId: result.result.message_id,
      };
    } else {
      console.error('Failed to send Telegram message:', result);
      return {
        success: false,
      };
    }
  }
);
