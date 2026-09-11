-- APPLIED TO PRODUCTION (Neon) 2026-09-11 via:
--   psql "$DIRECT_URL" --single-transaction -v ON_ERROR_STOP=1 -f <this file>
-- This is the safe, idempotent version (identical to docs/migration-0002-safe.sql).
-- The originally generated 0002 dropped and recreated enum types and failed on
-- production (enum label "approved" already exists; enrollment_requests already exists).
-- Production has NO drizzle migration history table: do not run `db:migrate`
-- against it — it would attempt 0000 first and fail on the first CREATE TYPE.
--
-- =============================================================================
-- SAFE replacement for drizzle/0002_mean_agent_brand.sql         (NOT YET RUN)
-- =============================================================================
-- Produces the same end schema as 0002, but:
--   * never DROPs a type, so no column is ever left as plain text,
--   * never casts existing rows through a value that no longer exists,
--   * is idempotent — safe on a database built from the migrations, built by
--     phase15_manual.sql, built by `db:push`, or already half-migrated,
--   * runs as ONE transaction: any error rolls every statement back.
--
-- Run with:   psql "$DIRECT_URL" --single-transaction -v ON_ERROR_STOP=1 -f docs/migration-0002-safe.sql
-- Do NOT paste it into a SQL editor that autocommits statement by statement.
-- =============================================================================

-- ── 1. New enum for the review workflow ─────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "public"."content_status" AS ENUM
    ('draft', 'pending_review', 'published', 'rejected', 'needs_revision');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. schedule_request_status gains 'approved' (no-op if already there) ────
ALTER TYPE "public"."schedule_request_status" ADD VALUE IF NOT EXISTS 'approved' BEFORE 'suggested';

-- ── 3. enrollment_requests (no-op if the table already exists) ──────────────
-- NOTE: IF NOT EXISTS skips silently even if an existing table has different
-- columns. The verification query at the bottom checks the columns.
CREATE TABLE IF NOT EXISTS "enrollment_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "whatsapp" varchar(50) NOT NULL,
  "country" varchar(100) NOT NULL,
  "course" varchar(100) NOT NULL,
  "plan" varchar(50) NOT NULL,
  "message" text,
  "locale" varchar(10) DEFAULT 'en' NOT NULL,
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ── 4. post_country_links (new) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "post_country_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "country" varchar(60) NOT NULL,
  "post_type" varchar(20) NOT NULL,
  "post_slug" varchar(255) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ── 5. assignment_frequency: 'one_time' → 'once', IN PLACE ──────────────────
-- Replaces 0002's text-cast / DROP TYPE / CREATE TYPE / cast-back, which fails
-- on every row still holding the old default 'one_time'.
-- RENAME VALUE rewrites no rows: every existing 'one_time' row simply reads
-- back as 'once'. Skipped if the rename has already happened.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
             WHERE t.typname = 'assignment_frequency' AND e.enumlabel = 'one_time')
     AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
             WHERE t.typname = 'assignment_frequency' AND e.enumlabel = 'once')
  THEN
    ALTER TYPE "public"."assignment_frequency" RENAME VALUE 'one_time' TO 'once';
  END IF;
END $$;
ALTER TABLE "tests_assignments" ALTER COLUMN "frequency" SET DEFAULT 'once';

-- ── 6. progress_rating: deliberately UNCHANGED ──────────────────────────────
-- 0002 drops 'average'. Postgres cannot remove an enum label without
-- recreating the type, and any row rated 'average' would then fail to cast.
-- The app no longer writes 'average', so an unused label is harmless.
-- Leave it; remove it later only after confirming zero rows use it.

-- ── 7. Review-workflow columns on blog_posts and daily_dars ─────────────────
-- ADD COLUMN with a constant default is metadata-only in PG 11+: no rewrite.
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "status" "content_status" DEFAULT 'pending_review' NOT NULL;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "review_note" text;
ALTER TABLE "daily_dars" ADD COLUMN IF NOT EXISTS "status" "content_status" DEFAULT 'pending_review' NOT NULL;
ALTER TABLE "daily_dars" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid;
ALTER TABLE "daily_dars" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
ALTER TABLE "daily_dars" ADD COLUMN IF NOT EXISTS "review_note" text;

DO $$ BEGIN
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_reviewed_by_users_id_fk"
    FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "daily_dars" ADD CONSTRAINT "daily_dars_reviewed_by_users_id_fk"
    FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 8. Recitation fields on teacher_videos (nullable, instant) ──────────────
ALTER TABLE "teacher_videos" ADD COLUMN IF NOT EXISTS "surah_name" varchar(120);
ALTER TABLE "teacher_videos" ADD COLUMN IF NOT EXISTS "surah_number" integer;
ALTER TABLE "teacher_videos" ADD COLUMN IF NOT EXISTS "ayah_from" integer;
ALTER TABLE "teacher_videos" ADD COLUMN IF NOT EXISTS "ayah_to" integer;

-- ── 9. Backfill: whatever is live now stays live ────────────────────────────
-- Only promotes rows still on the column default, so re-running this later
-- (e.g. right after deploy, to catch posts the OLD code published in between)
-- never overwrites a human's rejected / needs_revision decision.
UPDATE "daily_dars" SET "status" = 'published' WHERE "is_published" = true AND "status" = 'pending_review';
UPDATE "blog_posts" SET "status" = 'published' WHERE "is_published" = true AND "status" = 'pending_review';

-- ── 10. Indexes ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "daily_dars_status_idx" ON "daily_dars" ("status");
CREATE INDEX IF NOT EXISTS "blog_posts_status_idx" ON "blog_posts" ("status");
CREATE INDEX IF NOT EXISTS "post_country_links_country_created_idx" ON "post_country_links" ("country", "created_at");

-- =============================================================================
-- Verification — run AFTER, outside the transaction. Expected results inline.
-- =============================================================================
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'enrollment_requests' ORDER BY ordinal_position;       -- 11 columns, as above
-- SELECT frequency, count(*) FROM tests_assignments GROUP BY 1;               -- no 'one_time'
-- SELECT is_published, status, count(*) FROM blog_posts GROUP BY 1,2;          -- true ⇒ published
-- SELECT is_published, status, count(*) FROM daily_dars GROUP BY 1,2;          -- true ⇒ published
