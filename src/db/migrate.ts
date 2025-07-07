import { db } from './index';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import path from 'node:path';

const main = async () => {
  try {
    const migrationsFolder = path.join(process.cwd(), 'src', 'db', 'migrations');
    await migrate(db, { migrationsFolder });
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

main(); 