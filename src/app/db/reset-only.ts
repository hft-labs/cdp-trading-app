import { db } from './index';
import { sql } from 'drizzle-orm';

const resetDatabaseOnly = async () => {
  try {
    console.log('🔄 Starting database reset (no seeding)...');

    // Drop all tables in the correct order (respecting foreign key constraints)
    console.log('🗑️ Dropping existing tables...');
    await db.execute(sql`DROP TABLE IF EXISTS "balance_history" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "token_balances" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "transactions" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "accounts" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "tokens" CASCADE`);

    console.log('✅ Tables dropped successfully');

    // Run migrations to recreate tables
    console.log('🏗️ Running migrations...');
    const { migrate } = await import('drizzle-orm/neon-http/migrator');
    const path = await import('node:path');
    const migrationsFolder = path.join(process.cwd(), 'src', 'app', 'db', 'migrations');
    await migrate(db, { migrationsFolder });

    console.log('✅ Migrations completed');
    console.log('🎉 Database reset completed successfully!');
    console.log('📝 Database is now empty and ready for manual seeding if needed.');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  }
};

resetDatabaseOnly(); 