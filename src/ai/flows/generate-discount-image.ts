
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
      'A data URI of the generated image.'
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

const generateDiscountImageFlow = ai.defineFlow(
  {
    name: 'generateDiscountImageFlow',
    inputSchema: GenerateDiscountImageInputSchema,
    outputSchema: GenerateDiscountImageOutputSchema,
  },
  async (input) => {
    const { code, percentage, title, expiryDate } = input;

    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="background" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a1221;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a233a;stop-opacity:1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <style>
          .title { font-family: 'Arial', sans-serif; font-size: 40px; fill: #e0e0e0; font-weight: bold; text-anchor: middle; text-transform: uppercase; letter-spacing: 2px; }
          .percentage { font-family: 'Arial Black', sans-serif; font-size: 180px; fill: url(#percentage-gradient); font-weight: 900; text-anchor: middle; filter: url(#glow); }
          .code-label { font-family: 'Arial', sans-serif; font-size: 30px; fill: #a0a0a0; text-anchor: middle; text-transform: uppercase; letter-spacing: 1px; }
          .code { font-family: 'Arial Black', sans-serif; font-size: 80px; fill: #ffffff; font-weight: bold; text-anchor: middle; text-shadow: 0 0 10px #fff, 0 0 20px #fff; }
          .expiry { font-family: 'Arial', sans-serif; font-size: 24px; fill: #a0a0a0; text-anchor: middle; }
        </style>
        <linearGradient id="percentage-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#00ffff; stop-opacity:1"/>
            <stop offset="100%" style="stop-color:#00b8b8; stop-opacity:1"/>
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#background)" />
      
      <!-- Grid pattern -->
      <path d="M0 40 L1200 40 M0 80 L1200 80 M0 120 L1200 120 M0 160 L1200 160 M0 200 L1200 200 M0 240 L1200 240 M0 280 L1200 280 M0 320 L1200 320 M0 360 L1200 360 M0 400 L1200 400 M0 440 L1200 440 M0 480 L1200 480 M0 520 L1200 520 M0 560 L1200 560 M0 600 L1200 600 M40 0 L40 630 M80 0 L80 630 M120 0 L120 630 M160 0 L160 630 M200 0 L200 630 M240 0 L240 630 M280 0 L280 630 M320 0 L320 630 M360 0 L360 630 M400 0 L400 630 M440 0 L440 630 M480 0 L480 630 M520 0 L520 630 M560 0 L560 630 M600 0 L600 630 M640 0 L640 630 M680 0 L680 630 M720 0 L720 630 M760 0 L760 630 M800 0 L800 630 M840 0 L840 630 M880 0 L880 630 M920 0 L920 630 M960 0 L960 630 M1000 0 L1000 630 M1040 0 L1040 630 M1080 0 L1080 630 M1120 0 L1120 630 M1160 0 L1160 630" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

      <text x="600" y="90" class="title">${title}</text>
      
      <text x="600" y="280" class="percentage">${percentage}% OFF</text>
      
      <text x="600" y="380" class="code-label">Utilisez le code</text>
      <text x="600" y="460" class="code">${code}</text>

      <text x="600" y="560" class="expiry">Expire le ${expiryDate}</text>
    </svg>
    `;
    
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
    return { imageUrl: dataUri };
  }
);

    