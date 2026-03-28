CREATE TYPE "public"."aalim_category" AS ENUM('two_year', 'four_year', 'six_year', 'eight_year');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('harf_drag', 'harf_trace', 'sound_match', 'puzzle', 'word_builder', 'harakaat_game', 'reading_race', 'memory_game');--> statement-breakpoint
CREATE TYPE "public"."certificate_type" AS ENUM('course_complete', 'level_complete', 'hafiz', 'aalim', 'faazil');--> statement-breakpoint
CREATE TYPE "public"."chat_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."class_status" AS ENUM('scheduled', 'completed', 'cancelled', 'missed');--> statement-breakpoint
CREATE TYPE "public"."course_type" AS ENUM('nazra', 'hifz', 'arabic', 'aalim');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('trial', 'active', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."hifz_status" AS ENUM('pending', 'in_progress', 'completed', 'needs_revision');--> statement-breakpoint
CREATE TYPE "public"."hifz_type" AS ENUM('sabaq', 'sabqi', 'manzil');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('ur', 'ar', 'en', 'fr', 'id');--> statement-breakpoint
CREATE TYPE "public"."lesson_type" AS ENUM('nazra', 'hifz_sabaq', 'hifz_sabqi', 'hifz_manzil', 'arabic', 'aalim');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('human_ai', 'pure_ai');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'teacher', 'admin');--> statement-breakpoint
CREATE TABLE "aalim_course_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"category_name" "aalim_category" NOT NULL,
	"price_plan1" numeric(10, 2),
	"price_plan2" numeric(10, 2),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "ai_chat_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"role" "chat_role" NOT NULL,
	"content" text NOT NULL,
	"language" "language" DEFAULT 'ur' NOT NULL,
	"course_context" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title_ur" varchar(500),
	"title_ar" varchar(500),
	"title_en" varchar(500),
	"title_fr" varchar(500),
	"title_id" varchar(500),
	"content_ur" text,
	"content_ar" text,
	"content_en" text,
	"content_fr" text,
	"content_id" text,
	"meta_description_en" varchar(300),
	"meta_description_ur" varchar(300),
	"keywords" text[],
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"certificate_type" "certificate_type" NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"certificate_url" text,
	"verified_by" uuid
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"status" "class_status" DEFAULT 'scheduled' NOT NULL,
	"meeting_link" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name_ur" varchar(255) NOT NULL,
	"name_ar" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_fr" varchar(255) NOT NULL,
	"name_id" varchar(255) NOT NULL,
	"description_ur" text,
	"description_ar" text,
	"description_en" text,
	"description_fr" text,
	"description_id" text,
	"course_type" "course_type" NOT NULL,
	"duration_months" integer,
	"price_plan1_monthly" numeric(10, 2),
	"price_plan2_monthly" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"classes_per_week" smallint,
	"aalim_category" "aalim_category",
	"status" "enrollment_status" DEFAULT 'trial' NOT NULL,
	"trial_start_date" timestamp with time zone,
	"trial_end_date" timestamp with time zone,
	"subscription_start_date" timestamp with time zone,
	"stripe_subscription_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hifz_tracker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"surah_number" smallint NOT NULL,
	"ayah_from" smallint NOT NULL,
	"ayah_to" smallint NOT NULL,
	"type" "hifz_type" NOT NULL,
	"status" "hifz_status" DEFAULT 'pending' NOT NULL,
	"last_recited_at" timestamp with time zone,
	"next_revision_at" timestamp with time zone,
	"score" smallint,
	"ai_feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kids_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"level" smallint DEFAULT 1 NOT NULL,
	"score" integer,
	"time_taken_seconds" integer,
	"mistakes_count" integer,
	"haroof_practiced" text[],
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"lesson_number" integer NOT NULL,
	"title_ur" varchar(255),
	"title_ar" varchar(255),
	"title_en" varchar(255),
	"content" jsonb,
	"lesson_type" "lesson_type" NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"teacher_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_id" uuid NOT NULL,
	"referral_code" varchar(50) NOT NULL,
	"reward_months" integer DEFAULT 1 NOT NULL,
	"is_rewarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"review_text" text,
	"is_video" boolean DEFAULT false NOT NULL,
	"video_url" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"ai_moderated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"age" smallint,
	"country" varchar(100),
	"phone" varchar(20),
	"parent_name" varchar(255),
	"parent_phone" varchar(20),
	"parent_whatsapp" varchar(20),
	"plan_type" "plan_type",
	"classes_per_week" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"plan_type" "plan_type" NOT NULL,
	"course_id" uuid NOT NULL,
	"amount_usd" numeric(10, 2),
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"preferred_language" "language" DEFAULT 'ur' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weekly_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"test_date" timestamp with time zone,
	"total_questions" integer,
	"correct_answers" integer,
	"score_percentage" numeric(5, 2),
	"ai_feedback" text,
	"teacher_feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aalim_course_categories" ADD CONSTRAINT "aalim_course_categories_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_history" ADD CONSTRAINT "ai_chat_history_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hifz_tracker" ADD CONSTRAINT "hifz_tracker_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_activities" ADD CONSTRAINT "kids_activities_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_tests" ADD CONSTRAINT "weekly_tests_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;