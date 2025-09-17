'use server';

/**
 * @fileOverview A flow for generating a maintenance message for an application.
 *
 * - generateMaintenanceMessage - A function that generates a maintenance message.
 * - MaintenanceMessageInput - The input type for the generateMaintenanceMessage function.
 * - MaintenanceMessageOutput - The return type for the generateMaintenanceMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaintenanceMessageInputSchema = z.object({
  appName: z.string().describe('The name of the application going into maintenance.'),
});
export type MaintenanceMessageInput = z.infer<
  typeof MaintenanceMessageInputSchema
>;

const MaintenanceMessageOutputSchema = z.object({
  message: z
    .string()
    .describe(
      'A user-friendly maintenance message.'
    ),
});
export type MaintenanceMessageOutput = z.infer<
  typeof MaintenanceMessageOutputSchema
>;

export async function generateMaintenanceMessage(
  input: MaintenanceMessageInput
): Promise<MaintenanceMessageOutput> {
  return generateMaintenanceMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'maintenanceMessagePrompt',
  input: {schema: MaintenanceMessageInputSchema},
  output: {schema: MaintenanceMessageOutputSchema},
  prompt: `You are an expert in writing user-friendly maintenance notifications.

Generate a short, clear, and empathetic maintenance message for the application named '{{{appName}}}'.

The message should inform users that the service is temporarily unavailable due to maintenance and apologize for the inconvenience. Keep it concise and professional.
`,
});

const generateMaintenanceMessageFlow = ai.defineFlow(
  {
    name: 'generateMaintenanceMessageFlow',
    inputSchema: MaintenanceMessageInputSchema,
    outputSchema: MaintenanceMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
