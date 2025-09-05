import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Handle custom domains and subdomains
  const currentHost = hostname
    .replace(`:${process.env.PORT || 3000}`, '')
    .replace('.localhost', '')
    .replace('.businessflow.app', '');

  // Check if it's a custom domain or subdomain (not main domain)
  const isMainDomain = 
    currentHost === 'localhost' ||
    currentHost === 'businessflow.app' ||
    currentHost === 'app.businessflow.com' ||
    currentHost === '';

  if (!isMainDomain) {
    // Check if it's a subdomain (organizationId.businessflow.app)
    const isSubdomain = hostname.includes('.businessflow.app') || hostname.includes('.localhost');
    
    if (isSubdomain) {
      // Extract organization ID from subdomain
      const organizationId = currentHost;
      
      // Rewrite to the booking widget page with organizationId
      url.pathname = `/booking/widget`;
      url.searchParams.set('organizationId', organizationId);
      
      return NextResponse.rewrite(url);
    } else {
      // It's a custom domain
      url.pathname = `/booking/widget`;
      url.searchParams.set('customDomain', currentHost);
      
      return NextResponse.rewrite(url);
    }
  }

  // Continue with normal Supabase authentication flow
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, continue without authentication
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedRoutes = ['/admin', '/dashboard']
  const authRoutes = ['/login', '/signup']
  
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    // Redirect to login if trying to access protected route without authentication
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && user) {
    // Redirect to dashboard if trying to access auth routes while authenticated
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}