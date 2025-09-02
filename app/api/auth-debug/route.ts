import { createClient } from '@/src/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Check cookies
    const cookieStore = cookies();
    const authCookies = cookieStore.getAll().filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('auth')
    );
    
    // Test database connection
    let dbStatus = 'Unknown';
    let dbError = null;
    try {
      const { data, error } = await supabase
        .from('Organization')
        .select('count')
        .limit(1);
      
      if (error) {
        dbStatus = 'Error';
        dbError = error.message;
      } else {
        dbStatus = 'Connected';
      }
    } catch (e) {
      dbStatus = 'Failed';
      dbError = e instanceof Error ? e.message : 'Unknown error';
    }
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      auth: {
        hasSession: !!session,
        sessionError: sessionError?.message || null,
        hasUser: !!user,
        userError: userError?.message || null,
        userId: user?.id || null,
        userEmail: user?.email || null,
        sessionExpiry: session?.expires_at || null,
      },
      cookies: {
        count: authCookies.length,
        names: authCookies.map(c => c.name),
      },
      database: {
        status: dbStatus,
        error: dbError,
      },
      troubleshooting: {
        tip1: 'If hasSession is true but you want to test login, clear cookies',
        tip2: 'If environment vars are false, set them in Vercel dashboard',
        tip3: 'Database should show "Connected" if env vars are correct',
        tip4: 'Use incognito mode to test fresh login',
      }
    };
    
    return NextResponse.json(debugInfo, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}