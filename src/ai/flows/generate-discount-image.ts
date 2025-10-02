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
      'The data URI of the generated image.'
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
  Generate a visually appealing, premium, and modern promotional image for a discount code.
  The image should be clean, eye-catching, and suitable for a high-end gaming or tech application.

  Key elements to include in the image:
  - The discount percentage, very prominent: {{{percentage}}}% OFF
  - The discount code, clearly readable: {{{code}}}
  - The title of the promotion: {{{title}}}
  - The expiration date: "Expires on {{{expiryDate}}}"

  Style guidelines:
  - Use a dark theme, with colors like deep blue, purple, or dark gray as a background.
  - Use glowing effects for the text, especially for the percentage and the code.
  - The font should be modern and sharp.
  - The layout should be balanced and professional.
  - The overall feeling should be exclusive and exciting.
  - Do not include any logos or brand names.
  - Aspect ratio should be 16:9.
  `,
});

const generateDiscountImageFlow = ai.defineFlow(
  {
    name: 'generateDiscountImageFlow',
    inputSchema: GenerateDiscountImageInputSchema,
    outputSchema: GenerateDiscountImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: prompt(input),
    });

    if (!media.url) {
        throw new Error('Image generation failed.');
    }
    
    return { imageUrl: media.url };
  }
);
