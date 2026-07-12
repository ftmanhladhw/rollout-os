/**
 * Outbound destinations for the pitch page. The app entry (`/`) is auth-gated —
 * middleware sends an unauthenticated visitor to `/login` — which is the correct
 * "Launch Demo" behaviour for an investor without an account.
 */
export const links = {
  app: '/',
  github: 'https://github.com/ftmanhladhw/rollout-os',
  thesis: 'https://github.com/ftmanhladhw/rollout-os/blob/main/docs/02_product_thesis.md',
  architecture:
    'https://github.com/ftmanhladhw/rollout-os/blob/main/docs/04_architecture_specification.md',
} as const;
