
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
  people: z.array(z.string()).optional().describe('The people who have used the code.'),
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
        <text x="980" y="560" class="activations-label">Activations</text>
        <text x="980" y="615" class="activations-value">${people?.length || 0} / ${max}</text>
      `
      : '';

    // Perforations (left + right) -> on génère les <circle> puis on les met dans le mask pour "découper"
    const perforationRadius = 10;
    const spacing = 28;
    const startY = 80;
    const endY = 550;
    const count = Math.floor((endY - startY) / spacing) + 1;
    const leftPerfs = Array.from({ length: count })
      .map((_, i) => `<circle cx="34" cy="${startY + i * spacing}" r="${perforationRadius}" fill="black"/>`)
      .join('');
    const rightPerfs = Array.from({ length: count })
      .map((_, i) => `<circle cx="1166" cy="${startY + i * spacing}" r="${perforationRadius}" fill="black"/>`)
      .join('');

    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <!-- Gradients -->
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#081124"/>
          <stop offset="60%" stop-color="#071827"/>
          <stop offset="100%" stop-color="#00040a"/>
        </linearGradient>

        <linearGradient id="codeGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
          <stop offset="45%" stop-color="rgba(255,255,255,0.08)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </linearGradient>

        <radialGradient id="holo" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
        </radialGradient>

        <!-- Drop shadow for card -->
        <filter id="cardShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="24" stdDeviation="40" flood-color="#000" flood-opacity="0.5"/>
        </filter>

        <!-- Glow for code -->
        <filter id="codeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- Mask to create ticket perforation cutouts -->
        <mask id="ticketMask">
          <!-- Visible area (white) -->
          <rect width="1200" height="630" rx="28" ry="28" fill="white"/>
          <!-- Black circles = holes -->
          ${leftPerfs}
          ${rightPerfs}
        </mask>

        <style>
          .title { font-family: sans-serif; font-size: 40px; fill: #e6f4ff; font-weight: 700; letter-spacing: 0.6px; }
          .bonus-label { font-family: sans-serif; font-size: 20px; fill: #9ab7c9; text-anchor: end; text-transform: uppercase; letter-spacing: 2px; }
          .code { font-family: 'Menlo', 'Courier New', monospace; font-size: 110px; fill: #ffffff; font-weight: 900; text-anchor: middle; letter-spacing: 10px; }
          .percentage-label { font-family: sans-serif; font-size: 22px; fill: #9ab7c9; }
          .percentage-value { font-family: sans-serif; font-size: 56px; fill: #ffffff; font-weight: 800; }
          .activations-label { font-family: sans-serif; font-size: 22px; fill: #9ab7c9; text-anchor: end; }
          .activations-value { font-family: sans-serif; font-size: 56px; fill: #ffffff; font-weight: 800; text-anchor: end; }
          .expiry { font-family: sans-serif; font-size: 20px; fill: #9ab7c9; text-anchor: middle; }
        </style>
      </defs>

      <!-- Card background + shadow -->
      <g filter="url(#cardShadow)">
        <rect x="0" y="0" width="1200" height="630" rx="28" fill="url(#bgGrad)"/>
      </g>

      <!-- All content clipped by ticket mask (creates perforation holes) -->
      <g mask="url(#ticketMask)">

        <!-- Subtle vignette overlay for depth -->
        <rect x="0" y="0" width="1200" height="630" rx="28" fill="rgba(0,0,0,0.18)"/>

        <!-- Header -->
        <text x="86" y="96" class="title">${title}</text>
        <text x="1114" y="90" class="bonus-label">BONUS CODE</text>

        <!-- Big glossy code box -->
        <g transform="translate(150,220)">
          <!-- outer stroke -->
          <rect x="0" y="0" width="900" height="190" rx="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          <!-- inner soft inset -->
          <rect x="6" y="6" width="888" height="178" rx="16" fill="rgba(10,14,22,0.25)"/>
          <!-- glossy strip on top -->
          <rect x="6" y="6" width="888" height="90" rx="16" fill="url(#codeGloss)" opacity="0.9"/>
          <!-- faint reflective border -->
          <rect x="6" y="6" width="888" height="178" rx="16" fill="none" stroke="rgba(255,255,255,0.03)" />
          <!-- subtle inner shadow (top) -->
          <rect x="0" y="0" width="900" height="190" rx="20" fill="none" style="filter: url(#codeGlow); opacity:0.06" />
          <!-- the code text centered -->
          <text x="450" y="125" class="code" filter="url(#codeGlow)">${code}</text>
        </g>

        <!-- Divider line -->
        <line x1="100" y1="500" x2="1100" y2="500" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

        <!-- Left column: reduction -->
        <text x="150" y="560" class="percentage-label">Réduction</text>
        <text x="150" y="620" class="percentage-value">${percentage}%</text>

        <!-- Right column: activations (optionnel) -->
        ${activationsText}

        <!-- Expiry center -->
        <text x="600" y="608" class="expiry">Expire le ${expiryDate}</text>
        
        <!-- App Logo -->
        <g transform="translate(1010, 490)">
            <rect x="0" y="0" width="150" height="60" rx="30" fill="url(#holo)" opacity="0.2"/>
            <image href="https://i.postimg.cc/jS25XGKL/Capture-d-cran-2025-09-03-191656-4-removebg-preview.png" x="45" y="0" height="60" width="60" />
        </g>

        <!-- Tiny product logo / shine bottom-right -->
        <g transform="translate(1000,500)">
          <ellipse cx="48" cy="24" rx="44" ry="24" fill="rgba(255,255,255,0.03)"/>
        </g>

      </g> <!-- end mask group -->

      <!-- Add subtle outer stroke to card to mimic printed ticket edge -->
      <rect x="1.5" y="1.5" width="1197" height="627" rx="28" fill="none" stroke="rgba(255,255,255,0.02)"/>

    </svg>
    `;

    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    return { imageUrl: dataUri };
  }
);

    