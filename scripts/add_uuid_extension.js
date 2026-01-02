import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load backend .env
const envPath = path.resolve('apps/backend/.env');
dotenv.config({ path: envPath });

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    await client.connect();
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('UUID extension added.');
    await client.end();
  } catch (err) {
    console.error('Error:', err);
  }
})();