
import { postDailySummary } from '@/ai/flows/daily-summary-poster';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET() {
  try {
    const result = await postDailySummary({ contentType: 'status' });
    if (result.success) {
      return NextResponse.json({ message: result.message || 'Status summary posted successfully.' });
    } else {
      throw new Error(result.message || 'Failed to post status summary.');
    }
  } catch (error) {
    console.error('Error in status cron job:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
