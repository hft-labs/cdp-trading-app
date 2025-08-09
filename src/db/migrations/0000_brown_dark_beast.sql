CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"wallet_address" text NOT NULL,
	"network" text DEFAULT 'base' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "balance_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"token_id" integer NOT NULL,
	"balance_amount" numeric(30, 18) NOT NULL,
	"balance_usd" numeric(20, 8) NOT NULL,
	"token_price_usd" numeric(20, 8) NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"token_id" integer NOT NULL,
	"balance_amount" numeric(30, 18) NOT NULL,
	"balance_usd" numeric(20, 8) NOT NULL,
	"token_price_usd" numeric(20, 8) NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"contract_address" text NOT NULL,
	"decimals" integer NOT NULL,
	"network" text DEFAULT 'base' NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_type" text NOT NULL,
	"description" text NOT NULL,
	"value_usd" numeric(20, 8),
	"asset_amount" numeric(30, 18),
	"asset_symbol" text,
	"wallet_address" text NOT NULL,
	"counterparty_address" text,
	"transaction_hash" text,
	"block_number" text,
	"gas_fee" numeric(30, 18),
	"gas_fee_usd" numeric(20, 8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"block_timestamp" timestamp,
	"is_successful" boolean DEFAULT true,
	"user_id" text NOT NULL,
	"network" text DEFAULT 'ethereum'
);
--> statement-breakpoint
ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_wallet_idx" ON "accounts" USING btree ("user_id","wallet_address");--> statement-breakpoint
CREATE INDEX "wallet_idx" ON "accounts" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "account_token_time_idx" ON "balance_history" USING btree ("account_id","token_id","recorded_at");--> statement-breakpoint
CREATE INDEX "time_idx" ON "balance_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "account_token_idx" ON "token_balances" USING btree ("account_id","token_id");--> statement-breakpoint
CREATE INDEX "account_idx" ON "token_balances" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "symbol_idx" ON "tokens" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "contract_idx" ON "tokens" USING btree ("contract_address");