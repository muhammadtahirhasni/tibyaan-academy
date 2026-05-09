-- Phase 15 manual migration: new enums, tables, and columns
-- Run this once against the Neon database

-- New enum types
DO $$ BEGIN
  CREATE TYPE "public"."progress_rating" AS ENUM('excellent', 'good', 'average', 'needs_improvement');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."assignment_type" AS ENUM('test', 'assignment');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."assignment_frequency" AS ENUM('daily', 'weekly', 'one_time');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."assignment_status" AS ENUM('pending', 'submitted', 'graded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."complaint_category" AS ENUM('teacher', 'schedule', 'technical', 'fees', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."complaint_status" AS ENUM('new', 'in_review', 'resolved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."change_request_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add zoom_link to teacher_student_matches
ALTER TABLE "teacher_student_matches" ADD COLUMN IF NOT EXISTS "zoom_link" text;

-- New table: progress_entries
CREATE TABLE IF NOT EXISTS "progress_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "match_id" uuid REFERENCES "teacher_student_matches"("id") ON DELETE SET NULL,
  "lesson_covered" varchar(500) NOT NULL,
  "rating" "progress_rating" NOT NULL,
  "notes" text,
  "entry_date" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- New table: tests_assignments
CREATE TABLE IF NOT EXISTS "tests_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" "assignment_type" NOT NULL,
  "title" varchar(500) NOT NULL,
  "description" text,
  "frequency" "assignment_frequency" DEFAULT 'one_time' NOT NULL,
  "due_date" timestamp with time zone,
  "status" "assignment_status" DEFAULT 'pending' NOT NULL,
  "teacher_grade" varchar(100),
  "teacher_feedback" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- New table: student_complaints
CREATE TABLE IF NOT EXISTS "student_complaints" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "subject" varchar(500) NOT NULL,
  "category" "complaint_category" NOT NULL,
  "description" text NOT NULL,
  "status" "complaint_status" DEFAULT 'new' NOT NULL,
  "admin_notes" text,
  "resolved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- New table: schedule_change_requests
CREATE TABLE IF NOT EXISTS "schedule_change_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "match_id" uuid NOT NULL REFERENCES "teacher_student_matches"("id") ON DELETE CASCADE,
  "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "new_schedule" jsonb NOT NULL,
  "reason" text,
  "status" "change_request_status" DEFAULT 'pending' NOT NULL,
  "admin_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- New table: admin_class_recordings
CREATE TABLE IF NOT EXISTS "admin_class_recordings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "uploaded_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" varchar(500) NOT NULL,
  "recording_url" text NOT NULL,
  "class_date" timestamp with time zone NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
