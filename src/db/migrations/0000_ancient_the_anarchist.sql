CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_address" text NOT NULL,
	"smart_account_address" text NOT NULL,
	"user_id" text NOT NULL
);
