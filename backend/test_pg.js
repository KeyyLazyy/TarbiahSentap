const { Client } = require('pg');

const regions = [
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-south-1',     // Mumbai
  'us-east-1',      // N. Virginia
  'us-west-1',      // N. California
  'eu-central-1',   // Frankfurt
];

const pass = process.argv[2] || '040316namI@';

async function testConnection() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.iuyqnqwvpsrzsrdcccoh:${pass}@${host}:6543/postgres`;
    
    console.log(`Testing ${host}...`);
    const client = new Client({ connectionString });
    try {
      await client.connect();
      const res = await client.query('SELECT NOW()');
      console.log(`SUCCESS! Region is ${region}`);
      console.log(`Connection string to use: ${connectionString}`);
      await client.end();
      return;
    } catch (e) {
      console.log(`Failed for ${region}: ${e.message}`);
      await client.end();
    }
  }
}

testConnection();
