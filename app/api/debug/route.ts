import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    supabase: {
      status: 'unknown' as string,
      error: null as string | null
    },
    auth: {
      user: null as any,
      error: null as string | null
    }
  };

  try {
    const supabase = await createClient();
    
    // Test Supabase connection
    const { data, error } = await supabase
      .from('Organization')
      .select('id')
      .limit(1);
    
    if (error) {
      debug.supabase.status = 'error';
      debug.supabase.error = error.message;
    } else {
      debug.supabase.status = 'connected';
    }

    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      debug.auth.error = authError.message;
    } else {
      debug.auth.user = user ? { id: user.id, email: user.email } : null;
    }
  } catch (e) {
    debug.supabase.status = 'initialization_failed';
    debug.supabase.error = e instanceof Error ? e.message : 'Unknown error';
  }

  return NextResponse.json(debug);
}