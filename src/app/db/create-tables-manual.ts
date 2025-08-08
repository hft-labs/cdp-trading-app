import { db } from './index';
import { sql } from 'drizzle-orm';

const createTablesManually = async () => {
  try {
    console.log('🔄 Creating tables manually...');
    
    // Create accounts table
    console.log('📋 Creating accounts table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "wallet_address" text NOT NULL,
        "network" text DEFAULT 'base' NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    
    // Create tokens table
    console.log('📋 Creating tokens table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "tokens" (
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
      )
    `);
    
    // Create token_balances table
    console.log('📋 Creating token_balances table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "token_balances" (
        "id" serial PRIMARY KEY NOT NULL,
        "account_id" integer NOT NULL,
        "token_id" integer NOT NULL,
        "balance_amount" numeric(30, 18) NOT NULL,
        "balance_usd" numeric(20, 8) NOT NULL,
        "token_price_usd" numeric(20, 8) NOT NULL,
        "last_updated" timestamp DEFAULT now() NOT NULL
      )
    `);
    
    // Create balance_history table
    console.log('📋 Creating balance_history table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "balance_history" (
        "id" serial PRIMARY KEY NOT NULL,
        "account_id" integer NOT NULL,
        "token_id" integer NOT NULL,
        "balance_amount" numeric(30, 18) NOT NULL,
        "balance_usd" numeric(20, 8) NOT NULL,
        "token_price_usd" numeric(20, 8) NOT NULL,
        "recorded_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    
    // Create transactions table
    console.log('📋 Creating transactions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "transactions" (
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
      )
    `);
    
    // Add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');
    await db.execute(sql`
      ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_account_id_accounts_id_fk" 
      FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action
    `);
    
    await db.execute(sql`
      ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_token_id_tokens_id_fk" 
      FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action
    `);
    
    await db.execute(sql`
      ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_account_id_accounts_id_fk" 
      FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action
    `);
    
    await db.execute(sql`
      ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_token_id_tokens_id_fk" 
      FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action
    `);
    
    // Add indexes
    console.log('📊 Adding indexes...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "user_wallet_idx" ON "accounts" USING btree ("user_id","wallet_address")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "wallet_idx" ON "accounts" USING btree ("wallet_address")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "account_token_time_idx" ON "balance_history" USING btree ("account_id","token_id","recorded_at")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "time_idx" ON "balance_history" USING btree ("recorded_at")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "account_token_idx" ON "token_balances" USING btree ("account_id","token_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "account_idx" ON "token_balances" USING btree ("account_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "symbol_idx" ON "tokens" USING btree ("symbol")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "contract_idx" ON "tokens" USING btree ("contract_address")`);
    
    console.log('✅ Tables created successfully!');
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Existing tables:');
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach((row: any) => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('  No tables found');
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTablesManually(); 