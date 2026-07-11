import type { NextConfig } from 'next';

/**
 * Security headers applied to every route. Supabase auth runs same-origin
 * (cookies, no iframes), so a strict baseline is safe here.
 */
const securityHeaders = [
  // Enforce HTTPS for two years, including subdomains.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // Never MIME-sniff responses.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // The app must not be embedded in frames (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Send the origin only on cross-origin requests.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // No sensors/camera/mic needed by this app.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Report-only CSP first: observe violations without breaking anything,
  // then promote to enforcing once the report stream is clean. Next.js
  // injects inline scripts/styles, hence 'unsafe-inline' (a nonce-based
  // enforcing policy is the follow-up); connect-src covers Supabase auth.
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
