-- Fixed-window rate-limit buckets for auth server actions.
CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key")
);

-- RLS on, deliberately with no policies: PostgREST roles (anon/authenticated)
-- can neither read nor write these rows. Only the app's postgres connection
-- (which bypasses RLS) maintains them.
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
