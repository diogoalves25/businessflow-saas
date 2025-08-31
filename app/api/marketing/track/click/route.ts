import { NextRequest, NextResponse } from 'next/server';
import { trackLinkClick } from '@/src/lib/marketing/analytics';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaign');
    const contactId = searchParams.get('contact');
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Track the click if campaign and contact are provided
    if (campaignId && contactId) {
      trackLinkClick(campaignId, contactId, url).catch(console.error);
    }

    // Redirect to the actual URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Click tracking error:', error);
    // Redirect to home page on error
    return NextResponse.redirect(new URL('/', request.url));
  }
}