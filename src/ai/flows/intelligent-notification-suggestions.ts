'use server';

/**
 * @fileOverview A flow for generating intelligent notification suggestions based on current events.
 *
 * - generateNotificationSuggestions - A function that generates notification suggestions.
 * - NotificationSuggestionsInput - The input type for the generateNotificationSuggestions function.
 * - NotificationSuggestionsOutput - The return type for the generateNotificationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NotificationSuggestionsInputSchema = z.object({
  currentEvents: z
    .string()
    .describe(
      'A description of current events that might be relevant for notifications.'
    ),
  appType: z.string().describe('The type of application to send notifications to.'),
});
export type NotificationSuggestionsInput = z.infer<
  typeof NotificationSuggestionsInputSchema
>;

const NotificationSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of suggested notification messages based on current events.'
    ),
});
export type NotificationSuggestionsOutput = z.infer<
  typeof NotificationSuggestionsOutputSchema
>;

export async function generateNotificationSuggestions(
  input: NotificationSuggestionsInput
): Promise<NotificationSuggestionsOutput> {
  return generateNotificationSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'notificationSuggestionsPrompt',
  input: {schema: NotificationSuggestionsInputSchema},
  output: {schema: NotificationSuggestionsOutputSchema},
  prompt: `You are an expert notification generator for a given application type.

You will receive a description of current events and the type of application you will be sending notifications to. Based on this information, generate a list of notification suggestions that would be useful and relevant to the users of the application.

Current Events: {{{currentEvents}}}
Application Type: {{{appType}}}

Suggestions (List):
`,
});

const generateNotificationSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateNotificationSuggestionsFlow',
    inputSchema: NotificationSuggestionsInputSchema,
    outputSchema: NotificationSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
