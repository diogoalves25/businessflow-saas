import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { getGoogleOAuthUrl } from '@/src/lib/ads/google';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization and check Premium access
    const membership = await prisma.userOrganization.findFirst({
      where: { 
        userId: user.id,
        user: { role: 'admin' }
      },
      include: { organization: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found or not an admin' },
        { status: 404 }
      );
    }

    // Check if user has Premium plan
    if (!canAccessFeature(membership.organization.stripePriceId, 'hasAds')) {
      return NextResponse.json(
        { error: 'Ads management requires Premium plan' },
        { status: 403 }
      );
    }

    // Store organization ID in session for callback
    const response = NextResponse.redirect(
      getGoogleOAuthUrl(membership.organization.id)
    );

    // Set secure cookie with organization ID
    response.cookies.set('google_auth_org', membership.organization.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.redirect('/admin/ads?error=auth_failed');
  }
}