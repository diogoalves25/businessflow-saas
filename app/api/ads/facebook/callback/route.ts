import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { cookies } from 'next/headers';
import { exchangeFacebookCode, getFacebookAdAccounts, saveFacebookAdAccount } from '@/src/lib/ads/facebook';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      console.error('Facebook OAuth error:', error);
      return NextResponse.redirect('/admin/ads?error=facebook_auth_failed');
    }

    // Get organization ID from cookie
    const cookieStore = await cookies();
    const organizationId = cookieStore.get('fb_auth_org')?.value;

    if (!organizationId) {
      return NextResponse.redirect('/admin/ads?error=session_expired');
    }

    // Verify user is still authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect('/admin/ads?error=unauthorized');
    }

    // Exchange code for access token
    const accessToken = await exchangeFacebookCode(code);

    // Get ad accounts
    const accounts = await getFacebookAdAccounts(accessToken);

    if (!accounts || accounts.length === 0) {
      return NextResponse.redirect('/admin/ads?error=no_ad_accounts');
    }

    // Save the first ad account (in production, let user choose)
    const account = accounts[0];
    await saveFacebookAdAccount(organizationId, {
      accountId: account.id,
      accountName: account.name,
      accessToken,
    });

    // Clear the cookie
    const response = NextResponse.redirect('/admin/ads?success=facebook_connected');
    response.cookies.delete('fb_auth_org');

    return response;
  } catch (error) {
    console.error('Facebook callback error:', error);
    return NextResponse.redirect('/admin/ads?error=facebook_connection_failed');
  }
}