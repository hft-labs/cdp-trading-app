import { db } from './index';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import path from 'node:path';
import fs from 'fs';

const main = async () => {
  try {
    console.log('🔄 Starting verbose migration...');
    
    const migrationsFolder = path.join(process.cwd(), 'src', 'app', 'db', 'migrations');
    console.log('📁 Migrations folder:', migrationsFolder);
    
    // Check if migrations folder exists
    if (!fs.existsSync(migrationsFolder)) {
      console.error('❌ Migrations folder does not exist');
      return;
    }
    
    // List files in migrations folder
    const files = fs.readdirSync(migrationsFolder);
    console.log('📄 Files in migrations folder:', files);
    
    // Check if meta folder exists
    const metaFolder = path.join(migrationsFolder, 'meta');
    if (fs.existsSync(metaFolder)) {
      const metaFiles = fs.readdirSync(metaFolder);
      console.log('📄 Files in meta folder:', metaFiles);
    }
    
    console.log('🏗️ Running migrations...');
    await migrate(db, { migrationsFolder });
    console.log('✅ Migrations completed');
    
    // Check tables after migration
    console.log('🔍 Checking tables after migration...');
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables after migration:');
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach((row: any) => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('  No tables found');
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
};

main(); 