const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        process.env[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
      }
    });

    console.log('✅ Environment variables loaded');
  } catch (error) {
    console.log('❌ Could not load .env file:', error.message);
  }
}

loadEnvFile();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking Supabase connection...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  try {
    // Check what tables exist
    console.log('\n📋 Checking available tables...');

    const tables = [
      'products',
      'categories',
      'brands',
      'colors',
      'sizes',
      'product_variants',
      'product_images'
    ];

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': ${count} records`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Connection error`);
      }
    }

    // Check products schema if table exists
    console.log('\n🏗️ Checking products table schema...');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (error) {
        console.log('❌ Products table error:', error.message);
        console.log('Error details:', error);
      } else if (data && data.length > 0) {
        console.log('✅ Products table columns:', Object.keys(data[0]));
      } else {
        console.log('✅ Products table exists but is empty');
      }
    } catch (err) {
      console.log('❌ Could not check products schema:', err.message);
    }

    // Try to create a test product to check column names
    console.log('\n🧪 Testing product creation schema...');
    try {
      const testProduct = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test description',
        price: 99.99,
        is_active: true
      };

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(0); // Just check schema, not insert

      console.log('Schema check completed');

    } catch (err) {
      console.log('❌ Schema test error:', err.message);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase().catch(console.error);