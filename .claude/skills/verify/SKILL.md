---
name: verify
description: Build, run, and drive Rollout OS end-to-end to verify a change against the real app (auth included).
---

# Verifying Rollout OS changes

## Build & launch

```bash
nvm use && npm install        # Node 22 required (engine-strict)
npm run dev                   # http://localhost:3000
```

- Start the dev server **outside any sandbox** — the session middleware calls
  Supabase on every request; blocked DNS makes _every_ route 500 with
  `missing required error components, refreshing...` at the router level.
- If port 3000 is taken, Next silently moves to 3001 — check
  `lsof -nP -iTCP:3000 -sTCP:LISTEN` for an orphaned server before diagnosing
  anything else.

## Getting past auth

Middleware is default-deny; every non-auth route needs a session. The reliable
recipe (built-in SMTP does not deliver, so never wait for emails):

1. Create a **throwaway confirmed user** with the admin API (service role key
   is in `.env`): `admin.auth.admin.createUser({ email, password, email_confirm: true })`.
2. Sign in through the real `/login` form (`#email`, `#password`,
   `button[type=submit]`) — this exercises the real cookie flow.
3. **Delete the user afterwards** (`admin.auth.admin.deleteUser(id)`), in a
   `finally` block. Never print `.env` values.

## Driving the UI

- No Playwright browsers are cached on this machine and the CDN may be
  DNS-blocked — use installed Chrome instead:
  `chromium.launch({ channel: 'chrome', headless: true })` (playwright npm
  package installs fine from the registry).
- A working end-to-end script (login → shell → nav → theme → mobile sheet →
  sign-out, with per-step PASS/FAIL output) exists as a template from the
  app-shell verification; recreate the same shape in the session scratchpad.
- Radix animations run ~300–500ms: wait for a state change (URL, class on
  `<html>`, element hidden) before screenshotting popovers/sheets or you
  capture mid-fade frames.

## Flows worth driving

- Signed-out `/` and any app route → redirect to `/login` (default-deny).
- Sidebar nav ↔ breadcrumb ↔ `aria-current` stay in sync.
- Theme: `.dark` lands on `<html>` and survives reload (next-themes).
- Mobile (375px): sidebar hidden, hamburger sheet navigates and closes,
  `document.documentElement.scrollWidth <= window.innerWidth`.
- Sign out via user menu → back to `/login`.
