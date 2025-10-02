
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
        <text x="1020" y="540" class="activations-label">Activations</text>
        <text x="1020" y="585" class="activations-value">${people?.length || 0} / ${max}</text>
        ` 
      : '';


    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="background" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1c253c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="code-panel-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.15)" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)" />
        </linearGradient>
        
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <style>
          .title { font-family: 'Inter', 'Arial', sans-serif; font-size: 32px; fill: #e0e0e0; font-weight: 600; text-anchor: start; letter-spacing: 0.5px; }
          .bonus-label { font-family: 'Inter', 'Arial', sans-serif; font-size: 24px; fill: #a0a0a0; text-anchor: end; text-transform: uppercase; letter-spacing: 2px; }
          
          .code { font-family: 'Inter', 'Arial', sans-serif; font-size: 90px; fill: #ffffff; font-weight: 700; text-anchor: middle; letter-spacing: 8px; }
          
          .percentage-label { font-family: 'Inter', 'Arial', sans-serif; font-size: 24px; fill: #a0a0a0; text-anchor: start; }
          .percentage-value { font-family: 'Inter', 'Arial', sans-serif; font-size: 56px; fill: #ffffff; font-weight: 700; text-anchor: start; }
          
          .activations-label { font-family: 'Inter', 'Arial', sans-serif; font-size: 24px; fill: #a0a0a0; text-anchor: end; }
          .activations-value { font-family: 'Inter', 'Arial', sans-serif; font-size: 56px; fill: #ffffff; font-weight: 700; text-anchor: end; }

          .expiry { font-family: 'Inter', 'Arial', sans-serif; font-size: 20px; fill: #a0a0a0; text-anchor: middle; position: absolute; bottom: 20px;}
        </style>
        
        <clipPath id="ticket-clip">
          <path d="M40,0 h1120 a10,10 0 0 1 10,10 v5 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v10 a5,5 0 0 0 0,10 v5 a10,10 0 0 1 -10,10 H40 a10,10 0 0 1 -10,-10 v-5 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-10 a5,5 0 0 0 0,-10 v-5 a10,10 0 0 1 10,-10 z M1100, 30 a10,10 0 0 1 20,0 v20 a10,10 0 0 1 -20,0 z" />
        </clipPath>
      </defs>
      
      <rect width="1200" height="630" fill="url(#background)" clip-path="url(#ticket-clip)" />
      
      <!-- Grid pattern -->
      <path d="M-100 315 H 1300 M 600 0 V 630" stroke="rgba(255,255,255,0.03)" stroke-width="2" />

      <g clip-path="url(#ticket-clip)">
        <text x="80" y="90" class="title">${title}</text>
        <text x="1120" y="90" class="bonus-label">BONUS CODE</text>
        
        <rect x="180" y="240" width="840" height="150" rx="20" fill="url(#code-panel-bg)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
        <text x="600" y="340" class="code" filter="url(#glow)">${code}</text>

        <line x1="80" y1="480" x2="1120" y2="480" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        
        <text x="180" y="540" class="percentage-label">Réduction</text>
        <text x="180" y="585" class="percentage-value">${percentage}%</text>
        
        ${activationsText}

        <text x="600" y="610" class="expiry">Expire le ${expiryDate}</text>
      </g>
    </svg>
    `;
    
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
    return { imageUrl: dataUri };
  }
);
