
import { postCommunityContent } from '@/ai/flows/community-post-generator';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await postCommunityContent();
    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      throw new Error(result.message || 'Failed to post community content.');
    }
  } catch (error) {
    console.error('Error in community post cron job:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
