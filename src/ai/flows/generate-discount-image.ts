
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
  max: z.number().optional().describe('The maximum number of uses.'),
  people: z.array(z.string()).optional().describe('The number of people who have used the code.'),
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
    const { code, percentage, title, expiryDate, max, people } = input;
    
    const activationsText = max && max > 0 
      ? `
        <text x="1050" y="560" class="activations-label">Activations</text>
        <text x="1050" y="615" class="activations-value">${people?.length || 0} / ${max}</text>
        ` 
      : '';

    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font-family: sans-serif; font-size: 42px; fill: #e0e0e0; font-weight: 600; text-anchor: start; letter-spacing: 0.5px; }
          .bonus-label { font-family: sans-serif; font-size: 28px; fill: #a0a0a0; text-anchor: end; text-transform: uppercase; letter-spacing: 2px; }
          .code { font-family: sans-serif; font-size: 110px; fill: #ffffff; font-weight: 700; text-anchor: middle; letter-spacing: 8px; }
          .percentage-label { font-family: sans-serif; font-size: 28px; fill: #a0a0a0; text-anchor: start; }
          .percentage-value { font-family: sans-serif; font-size: 64px; fill: #ffffff; font-weight: 700; text-anchor: start; }
          .activations-label { font-family: sans-serif; font-size: 28px; fill: #a0a0a0; text-anchor: end; }
          .activations-value { font-family: sans-serif; font-size: 64px; fill: #ffffff; font-weight: 700; text-anchor: end; }
          .expiry { font-family: sans-serif; font-size: 24px; fill: #a0a0a0; text-anchor: middle; }
        </style>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g>
        <text x="100" y="100" class="title">${title}</text>
        <text x="1100" y="100" class="bonus-label">BONUS CODE</text>
        
        <rect x="150" y="220" width="900" height="190" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
        <text x="600" y="350" class="code" filter="url(#glow)">${code}</text>

        <line x1="100" y1="500" x2="1100" y2="500" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        
        <text x="150" y="560" class="percentage-label">Réduction</text>
        <text x="150" y="615" class="percentage-value">${percentage}%</text>
        
        ${activationsText}

        <text x="600" y="600" class="expiry">Expire le ${expiryDate}</text>
      </g>
    </svg>
    `;
    
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
    return { imageUrl: dataUri };
  }
);
