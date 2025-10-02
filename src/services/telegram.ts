
/**
 * @fileOverview A service for interacting with the Telegram Bot API.
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org';

async function callTelegramApi(method: string, body: object) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables.');
  }

  const url = `${TELEGRAM_API_BASE}/bot${botToken}/${method}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error(`Telegram API error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Telegram API request failed: ${errorBody.description || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Telegram API:', error);
    throw error;
  }
}

/**
 * Sends a message to a specific Telegram chat.
 * @param chatId The ID of the chat to send the message to.
 * @param text The text of the message to send.
 * @returns The result from the Telegram API.
 */
export async function sendMessage(chatId: string, text: string) {
  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text: text,
  });
}
