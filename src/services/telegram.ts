
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
 * @param parseMode Optional parse mode for the message (e.g., MarkdownV2).
 * @returns The result from the Telegram API.
 */
export async function sendMessage(chatId: string, text: string, parseMode?: string) {
  const body: {
    chat_id: string;
    text: string;
    parse_mode?: string;
  } = {
    chat_id: chatId,
    text: text,
  };

  if (parseMode) {
    body.parse_mode = parseMode;
  }

  return await callTelegramApi('sendMessage', body);
}


/**
 * Sends a photo to a specific Telegram chat.
 * @param chatId The ID of the chat to send the photo to.
 * @param photoUrl The URL of the photo to send.
 * @param caption The caption for the photo.
 * @param replyMarkup Optional inline keyboard markup.
 * @param hasSpoiler Optional flag to send the photo as a spoiler.
 * @returns The result from the Telegram API.
 */
export async function sendPhoto(
  chatId: string,
  photoUrl: string,
  caption: string,
  replyMarkup?: object,
  hasSpoiler?: boolean
) {
  const body: {
    chat_id: string;
    photo: string;
    caption: string;
    parse_mode: string;
    reply_markup?: object;
    has_spoiler?: boolean;
  } = {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption,
    parse_mode: 'MarkdownV2',
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }
  
  if (hasSpoiler) {
    body.has_spoiler = true;
  }

  return await callTelegramApi('sendPhoto', body);
}

/**
 * Pins a message in a specific Telegram chat.
 * @param chatId The ID of the chat where the message should be pinned.
 * @param messageId The ID of the message to pin.
 * @returns The result from the Telegram API.
 */
export async function pinChatMessage(chatId: string, messageId: number) {
  return await callTelegramApi('pinChatMessage', {
    chat_id: chatId,
    message_id: messageId,
    disable_notification: true,
  });
}

/**
 * Unpins a message in a specific Telegram chat.
 * @param chatId The ID of the chat where the message should be unpinned.
 * @param messageId The ID of the message to unpin.
 * @returns The result from the Telegram API.
 */
export async function unpinChatMessage(chatId: string, messageId: number) {
  return await callTelegramApi('unpinChatMessage', {
    chat_id: chatId,
    message_id: messageId,
  });
}
