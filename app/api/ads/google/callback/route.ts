import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { cookies } from 'next/headers';
import { exchangeGoogleCode, getGoogleAdAccounts, saveGoogleAdAccount } from '@/src/lib/ads/google';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect('/admin/ads?error=google_auth_failed');
    }

    // Get organization ID from cookie
    const cookieStore = await cookies();
    const organizationId = cookieStore.get('google_auth_org')?.value;

    if (!organizationId) {
      return NextResponse.redirect('/admin/ads?error=session_expired');
    }

    // Verify user is still authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect('/admin/ads?error=unauthorized');
    }

    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code);
    
    if (!tokens.access_token) {
      return NextResponse.redirect('/admin/ads?error=invalid_token');
    }

    // Get ad accounts
    const accounts = await getGoogleAdAccounts(tokens.access_token, tokens.refresh_token || undefined);

    if (!accounts || accounts.length === 0) {
      return NextResponse.redirect('/admin/ads?error=no_ad_accounts');
    }

    // Save the first ad account (in production, let user choose)
    const account = accounts[0];
    await saveGoogleAdAccount(organizationId, {
      accountId: account.id,
      accountName: account.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
    });

    // Clear the cookie
    const response = NextResponse.redirect('/admin/ads?success=google_connected');
    response.cookies.delete('google_auth_org');

    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect('/admin/ads?error=google_connection_failed');
  }
}