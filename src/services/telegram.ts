
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
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`Telegram API error: ${response.status} ${response.statusText}`, responseData);
      throw new Error(`Telegram API request failed: ${(responseData as any).description || 'Unknown error'}`);
    }

    return responseData;
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

/**
 * Sends a photo to a specific Telegram chat.
 * @param chatId The ID of the chat to send the photo to.
 * @param photoUrl The URL of the photo to send.
 * @param caption The caption for the photo.
 * @param replyMarkup Optional inline keyboard markup.
 * @returns The result from the Telegram API.
 */
export async function sendPhoto(
  chatId: string,
  photoUrl: string,
  caption: string,
  replyMarkup?: object
) {
  const body: {
    chat_id: string;
    photo: string;
    caption: string;
    reply_markup?: object;
  } = {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption,
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  return await callTelegramApi('sendPhoto', body);
}
