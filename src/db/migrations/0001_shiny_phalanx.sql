CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"authentication_methods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evm_accounts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evm_smart_accounts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"solana_accounts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "users" USING btree ("user_id");
--> statement-breakpoint
-- Populate users table with existing user IDs from accounts
INSERT INTO "users" ("user_id", "authentication_methods", "evm_accounts", "evm_smart_accounts", "solana_accounts")
SELECT DISTINCT "user_id", '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
FROM "accounts"
WHERE "user_id" NOT IN (SELECT "user_id" FROM "users");
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;