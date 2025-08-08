import { db } from './index';

async function createTables() {
  console.log('🔨 Creating balance tracking tables...');

  try {
    // Create accounts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "wallet_address" text NOT NULL,
        "network" text DEFAULT 'base' NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Created accounts table');

    // Create tokens table
    await db.execute(`
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
      );
    `);
    console.log('✅ Created tokens table');

    // Create token_balances table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "token_balances" (
        "id" serial PRIMARY KEY NOT NULL,
        "account_id" integer NOT NULL,
        "token_id" integer NOT NULL,
        "balance_amount" numeric(30, 18) NOT NULL,
        "balance_usd" numeric(20, 8) NOT NULL,
        "token_price_usd" numeric(20, 8) NOT NULL,
        "last_updated" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Created token_balances table');

    // Create balance_history table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "balance_history" (
        "id" serial PRIMARY KEY NOT NULL,
        "account_id" integer NOT NULL,
        "token_id" integer NOT NULL,
        "balance_amount" numeric(30, 18) NOT NULL,
        "balance_usd" numeric(20, 8) NOT NULL,
        "token_price_usd" numeric(20, 8) NOT NULL,
        "recorded_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Created balance_history table');

    // Create indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS "user_wallet_idx" ON "accounts" ("user_id", "wallet_address")`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "wallet_idx" ON "accounts" ("wallet_address")`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "symbol_idx" ON "tokens" ("symbol")`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "contract_idx" ON "tokens" ("contract_address")`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "account_token_idx" ON "token_balances" ("account_id", "token_id")`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "account_idx" ON "token_balances" ("account_id")`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "account_token_time_idx" ON "balance_history" ("account_id", "token_id", "recorded_at")`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "time_idx" ON "balance_history" ("recorded_at")`);
    console.log('✅ Created indexes');

    // Add foreign key constraints (without IF NOT EXISTS for constraints)
    try {
      await db.execute(`ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`);
    } catch (e) {
      console.log('ℹ️  Foreign key constraint already exists for token_balances.account_id');
    }
    
    try {
      await db.execute(`ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "tokens"("id") ON DELETE CASCADE`);
    } catch (e) {
      console.log('ℹ️  Foreign key constraint already exists for token_balances.token_id');
    }
    
    try {
      await db.execute(`ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`);
    } catch (e) {
      console.log('ℹ️  Foreign key constraint already exists for balance_history.account_id');
    }
    
    try {
      await db.execute(`ALTER TABLE "balance_history" ADD CONSTRAINT "balance_history_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "tokens"("id") ON DELETE CASCADE`);
    } catch (e) {
      console.log('ℹ️  Foreign key constraint already exists for balance_history.token_id');
    }
    console.log('✅ Added foreign key constraints');

    console.log('🎉 All tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('✅ Table creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Table creation failed:', error);
      process.exit(1);
    });
}

export { createTables }; 