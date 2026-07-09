import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookiesToSet = { name: string; value: string; options: CookieOptions }[];

/** Routes reachable without a session. Everything else requires auth. */
const PUBLIC_PATHS = ['/login', '/signup'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/auth');
}

/**
 * Refreshes the Supabase auth session on every request, forwards the refreshed
 * cookies to both the browser and downstream Server Components, and enforces
 * default-deny route protection: unauthenticated requests are redirected to
 * /login except for the auth routes themselves. Called from `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Unconfigured environment (fresh clone, no .env): there can be no session,
  // so keep default-deny — serve the public auth pages, redirect the rest —
  // instead of crashing on client creation. Production fails at boot before
  // this point (src/lib/env.ts).
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isPublicPath(request.nextUrl.pathname)) return supabaseResponse;
    return redirectPreservingCookies(request, supabaseResponse, '/login');
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: refresh the session. Do not run logic between client creation
  // and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    return redirectPreservingCookies(request, supabaseResponse, '/login');
  }

  if (user && PUBLIC_PATHS.includes(pathname)) {
    return redirectPreservingCookies(request, supabaseResponse, '/');
  }

  return supabaseResponse;
}

/**
 * Redirect while carrying over any auth cookies the session refresh just set —
 * dropping them would sign the user out or force another refresh round-trip.
 */
function redirectPreservingCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  const response = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}
