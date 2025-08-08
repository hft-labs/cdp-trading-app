import { db } from './index';
import { sql } from 'drizzle-orm';

const checkTables = async () => {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check what tables exist
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
    
    // Try to check if balance_history table exists specifically
    try {
      const balanceHistoryCheck = await db.execute(sql`SELECT 1 FROM balance_history LIMIT 1`);
      console.log('✅ balance_history table exists');
    } catch (error) {
      console.log('❌ balance_history table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
};

checkTables(); 