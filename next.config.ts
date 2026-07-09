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
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
