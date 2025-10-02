
'use server';

/**
 * @fileOverview A flow for generating an image for a discount code.
 *
 * - generateDiscountImage - A function that generates the image.
 * - GenerateDiscountImageInput - The input type for the generateDiscountImage function.
 * - GenerateDiscountImageOutput - The return type for the generateDiscountImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiscountImageInputSchema = z.object({
  code: z.string().describe('The discount code.'),
  percentage: z.string().describe('The discount percentage.'),
  title: z.string().describe('The title of the promotion.'),
  expiryDate: z.string().describe('The expiry date of the discount code.'),
});
export type GenerateDiscountImageInput = z.infer<
  typeof GenerateDiscountImageInputSchema
>;

const GenerateDiscountImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'A text description of the generated image.'
    ),
});
export type GenerateDiscountImageOutput = z.infer<
  typeof GenerateDiscountImageOutputSchema
>;

export async function generateDiscountImage(
  input: GenerateDiscountImageInput
): Promise<GenerateDiscountImageOutput> {
  return generateDiscountImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'discountImagePrompt',
  input: {schema: GenerateDiscountImageInputSchema},
  prompt: `
  Generate a detailed text description for a visually appealing, premium, and modern promotional image for a discount code.
  The description should be so vivid that an image generation AI could create the image from it.
  The image should be clean, eye-catching, and suitable for a high-end gaming or tech application.

  Key elements to include in the image description:
  - The discount percentage, very prominent: {{{percentage}}}% OFF
  - The discount code, clearly readable: {{{code}}}
  - The title of the promotion: {{{title}}}
  - The expiration date: "Expires on {{{expiryDate}}}"

  Style guidelines for the description:
  - Describe a dark theme, with colors like deep blue, purple, or dark gray as a background.
  - Describe glowing effects for the text, especially for the percentage and the code.
  - Describe a modern and sharp font.
  - Describe a balanced and professional layout.
  - The overall feeling should be exclusive and exciting.
  - Do not include any logos or brand names in the description.
  - The aspect ratio should be 16:9.
  `,
});

const generateDiscountImageFlow = ai.defineFlow(
  {
    name: 'generateDiscountImageFlow',
    inputSchema: GenerateDiscountImageInputSchema,
    outputSchema: GenerateDiscountImageOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
        prompt: prompt(input),
    });

    return { imageUrl: text };
  }
);
