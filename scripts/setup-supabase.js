#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * Run this script to set up your database schema on Supabase
 *
 * Usage: node scripts/setup-supabase.js
 *
 * Make sure to set your DATABASE_URL in .env first
 */

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'apps', 'backend', '.env.production') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.production');
  console.log('Please set up your Supabase database first and add DATABASE_URL to apps/backend/.env.production');
  process.exit(1);
}

async function setupDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'docs', 'DATABASE_SCHEMA.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found at docs/DATABASE_SCHEMA.sql');
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Read schema file');

    // Split SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
        } catch (error) {
          // Continue on errors (tables might already exist)
          console.log(`⚠️ Statement ${i + 1} failed (continuing):`, error.message);
        }
      }
    }

    console.log('🎉 Database setup completed!');
    console.log('✅ Your Supabase database is ready for deployment');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
console.log('🚀 Starting Supabase database setup...');
setupDatabase();