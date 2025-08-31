import { NextRequest, NextResponse } from 'next/server';
import { trackEmailOpen } from '@/src/lib/marketing/analytics';

// 1x1 transparent pixel
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign');
    const contactId = searchParams.get('contact');

    if (campaignId && contactId) {
      // Track the open asynchronously
      trackEmailOpen(campaignId, contactId).catch(console.error);
    }

    // Return tracking pixel
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Tracking pixel error:', error);
    // Still return the pixel even if tracking fails
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
      },
    });
  }
}