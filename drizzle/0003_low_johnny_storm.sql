CREATE TYPE "public"."client_type" AS ENUM('individual', 'company');--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "type" "client_type" DEFAULT 'individual' NOT NULL;