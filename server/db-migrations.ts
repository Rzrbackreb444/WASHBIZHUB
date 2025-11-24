// ========================================
// DATABASE MIGRATION SYSTEM
// ========================================
//
// Ensures critical tables exist on server startup
// - Auto-creates missing tables using SQL
// - Idempotent (safe to run multiple times)
// - Graceful error handling
//
// Production Note: For complex migrations, use a migration tool
// This is for basic table existence checks only
//
// ========================================

import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Ensure cleanbiUsage table exists
 * Creates with proper indexes for quota queries
 */
async function ensureCleanbiUsageTable(): Promise<boolean> {
  try {
    // Check if table exists
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cleanbi_usage'
      );
    `);
    
    const exists = result.rows[0]?.exists;
    
    if (exists) {
      console.log('✅ cleanbi_usage table exists');
      return true;
    }
    
    // Create table with indexes
    console.log('📦 Creating cleanbi_usage table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cleanbi_usage (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        report_type VARCHAR NOT NULL,
        month VARCHAR NOT NULL,
        used_count INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Composite index for fast quota queries
        CONSTRAINT cleanbi_usage_user_month_type_unique UNIQUE(user_id, month, report_type)
      );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_cleanbi_usage_user_month 
        ON cleanbi_usage(user_id, month);
      
      CREATE INDEX IF NOT EXISTS idx_cleanbi_usage_month 
        ON cleanbi_usage(month);
    `);
    
    console.log('✅ cleanbi_usage table created successfully');
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to ensure cleanbi_usage table: ${error.message}`);
    return false;
  }
}

/**
 * Run all database migrations/checks
 * Called on server startup
 */
export async function runDatabaseMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');
  
  try {
    await ensureCleanbiUsageTable();
    // Add more table checks here as needed
    
    console.log('✅ Database migrations complete');
  } catch (error: any) {
    console.error(`❌ Database migration failed: ${error.message}`);
    // Don't throw - allow server to start even if migrations fail
    // Individual features will handle missing tables gracefully
  }
}

/**
 * Health check for critical tables
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  tables: Record<string, boolean>;
  errors: string[];
}> {
  const tables: Record<string, boolean> = {};
  const errors: string[] = [];
  
  try {
    // Check users table (critical)
    const usersCheck = await db.execute(sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');`);
    tables.users = (usersCheck.rows[0] as any)?.exists ?? false;
    
    // Check cleanbiUsage table
    const cleanbiCheck = await db.execute(sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cleanbi_usage');`);
    tables.cleanbi_usage = (cleanbiCheck.rows[0] as any)?.exists ?? false;
    
    // Check cleanbiScores table
    const scoresCheck = await db.execute(sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cleanbi_scores');`);
    tables.cleanbi_scores = (scoresCheck.rows[0] as any)?.exists ?? false;
    
    const allHealthy = Object.values(tables).every(exists => exists);
    
    if (!allHealthy) {
      errors.push('Some critical tables are missing');
    }
    
    return {
      healthy: allHealthy,
      tables,
      errors
    };
  } catch (error: any) {
    return {
      healthy: false,
      tables,
      errors: [error.message]
    };
  }
}
