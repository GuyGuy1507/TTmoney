import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load backend .env (try multiple relative paths)
const candidateEnvPaths = [
  path.resolve(process.cwd(), '..', '..', 'apps', 'backend', '.env'), // when run from apps/backend
  path.resolve(process.cwd(), '..', 'apps', 'backend', '.env'),
  path.resolve(process.cwd(), 'apps', 'backend', '.env'),
  path.resolve(process.cwd(), 'apps\backend\.env'),
  path.resolve(process.cwd(), 'apps/backend/.env'),
  path.resolve(process.cwd(), 'apps/backend/.env')
];
let envPath = null;
for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) { envPath = p; break; }
}
if (!envPath) {
  console.error('.env not found in expected locations:', candidateEnvPaths);
  process.exit(1);
}
dotenv.config({ path: envPath });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

async function ensureDatabase() {
  const client = new Client({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: 'postgres' });
  await client.connect();
  const res = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', ['ttmoney']);
  if (res.rowCount === 0) {
    console.log('Creating database ttmoney...');
    await client.query('CREATE DATABASE ttmoney');
    console.log('Database created.');
  } else {
    console.log('Database ttmoney already exists.');
  }
  await client.end();
}

async function applySchema() {
  const repoRoot = path.resolve(path.dirname(envPath), '..', '..');
  const schemaPath = path.join(repoRoot, 'docs', 'DATABASE_SCHEMA.md');
  if (!fs.existsSync(schemaPath)) {
    console.warn('Schema file not found:', schemaPath);
    return;
  }
  const content = fs.readFileSync(schemaPath, 'utf8');
  const regex = /```sql([\s\S]*?)```/g;
  const blocks = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    blocks.push(m[1].trim());
  }
  if (blocks.length === 0) {
    console.log('No SQL blocks found in schema file.');
    return;
  }
  const client = new Client({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: 'ttmoney' });
  await client.connect();
  for (const block of blocks) {
    try {
      console.log('Applying SQL block...');
      await client.query(block);
    } catch (err) {
      console.error('SQL execution error (continuing):', err.message);
    }
  }
  await client.end();
}

(async () => {
  try {
    await ensureDatabase();
    await applySchema();
    console.log('DB setup finished.');
    process.exit(0);
  } catch (err) {
    console.error('DB setup failed:', err.message);
    process.exit(2);
  }
})();
