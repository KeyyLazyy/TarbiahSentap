const { Client } = require('pg');

const pass = process.argv[2] || '040316namI@';
const connectionString = `postgresql://postgres:${pass}@db.iuyqnqwvpsrzsrdcccoh.supabase.co:5432/postgres`;

async function testConnection() {
  console.log(`Testing direct connection...`);
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`SUCCESS!`);
    await client.end();
  } catch (e) {
    console.log(`Failed: ${e.message}`);
    await client.end();
  }
}

testConnection();
