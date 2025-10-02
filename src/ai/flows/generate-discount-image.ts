
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
          .title { font-family: 'Inter', 'Arial', sans-serif; font-size: 42px; fill: #e0e0e0; font-weight: 600; text-anchor: start; letter-spacing: 0.5px; }
          .bonus-label { font-family: 'Inter', 'Arial', sans-serif; font-size: 28px; fill: #a0a0a0; text-anchor: end; text-transform: uppercase; letter-spacing: 2px; }
          
          .code { font-family: 'Inter', 'Arial', sans-serif; font-size: 110px; fill: #ffffff; font-weight: 700; text-anchor: middle; letter-spacing: 8px; }
          
          .percentage-label { font-family: 'Inter', 'Arial', sans-serif; font-size: 28px; fill: #a0a0a0; text-anchor: start; }
          .percentage-value { font-family: 'Inter', 'Arial', sans-serif; font-size: 64px; fill: #ffffff; font-weight: 700; text-anchor: start; }
          
          .activations-label { font-family: 'Inter', 'Arial', sans-serif; font-size: 28px; fill: #a0a0a0; text-anchor: end; }
          .activations-value { font-family: 'Inter', 'Arial', sans-serif; font-size: 64px; fill: #ffffff; font-weight: 700; text-anchor: end; }

          .expiry { font-family: 'Inter', 'Arial', sans-serif; font-size: 24px; fill: #a0a0a0; text-anchor: middle; position: absolute; bottom: 20px;}
        </style>
        
        <path id="ticket-path" d="M50,10 h1100 a10,10 0 0 1 10,10 v600 a10,10 0 0 1 -10,10 H50 a10,10 0 0 1 -10,-10 v-600 a10,10 0 0 1 10,-10 z
           M 1150 50 C 1140 50, 1140 70, 1150 70 L 1150 570 C 1140 570, 1140 590, 1150 590
           M 50 50 C 60 50, 60 70, 50 70 L 50 570 C 60 570, 60 590, 50 590"
        />

        <clipPath id="ticket-clip">
            <use xlink:href="#ticket-path"/>
        </clipPath>
      </defs>
      
      <rect width="1200" height="630" fill="url(#background)" clip-path="url(#ticket-clip)" />
      
      <g clip-path="url(#ticket-clip)">
        <text x="100" y="100" class="title">${title}</text>
        <text x="1100" y="100" class="bonus-label">BONUS CODE</text>
        
        <rect x="150" y="220" width="900" height="190" rx="20" fill="url(#code-panel-bg)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
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
