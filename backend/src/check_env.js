const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { isSupabaseEnabled } = require('./services/supabase');

console.log("isSupabaseEnabled:", isSupabaseEnabled);
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "SET" : "UNSET");
