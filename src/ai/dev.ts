import { config } from 'dotenv';
config();

import '@/ai/flows/intelligent-notification-suggestions.ts';
import '@/ai/flows/maintenance-message-generator.ts';
import '@/ai/flows/generate-discount-image.ts';
import '@/ai/flows/send-telegram-message.ts';
import '@/ai/flows/send-telegram-story.ts';
import '@/ai/flows/auto-telegram-poster.ts';
import '@/ai/flows/daily-summary-poster.ts';
import '@/ai/flows/pin-telegram-message.ts';
import '@/ai/flows/unpin-telegram-message.ts';
