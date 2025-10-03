
import { postDailySummary } from '@/ai/flows/daily-summary-poster';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await postDailySummary({ contentTypes: ['status', 'pricing', 'discounts', 'maintenance'] });
    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      throw new Error(result.message || 'Failed to post daily summary.');
    }
  } catch (error) {
    console.error('Error in daily summary cron job:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
