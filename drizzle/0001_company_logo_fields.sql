ALTER TABLE "companies" ADD COLUMN "logo_status" text DEFAULT 'pending';
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_source" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_original_url" text;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_updated_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_error" text;
