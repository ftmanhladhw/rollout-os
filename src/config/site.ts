/**
 * Static, non-secret configuration for the application shell.
 * Product/domain configuration does not live here — this is only the app chrome.
 */
export const siteConfig = {
  name: 'Rollout OS',
  description:
    'The operational workspace for enterprise rollouts — plan, track, and govern multi-tenant rollouts from a single source of truth.',
} as const;

export type SiteConfig = typeof siteConfig;
