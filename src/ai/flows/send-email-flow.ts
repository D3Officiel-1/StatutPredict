
'use server';

/**
 * @fileOverview A flow for sending various types of emails to users.
 *
 * - sendEmail - A function that handles sending emails.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as brevo from '@getbrevo/brevo';

const SendEmailInputSchema = z.object({
  to: z.object({
    email: z.string().email(),
    name: z.string(),
  }),
  subject: z.string(),
  htmlContent: z.string(),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput): Promise<void> {
  return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const apiInstance = new brevo.TransactionalEmailsApi();
    
    // Configure API key authorization: api-key
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY!;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = input.subject;
    sendSmtpEmail.htmlContent = input.htmlContent;
    sendSmtpEmail.sender = { name: 'Statut Predict', email: 'no-reply@statut.predict.com' };
    sendSmtpEmail.to = [ { email: input.to.email, name: input.to.name } ];

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Email sent successfully to ${input.to.email}`);
    } catch (error) {
        console.error('Error sending email via Brevo:', error);
        throw new Error('Failed to send email.');
    }
  }
);
