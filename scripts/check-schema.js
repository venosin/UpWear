const { createClient } = require('@supabase/supabase-js');

// Load environment variables
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
        process.env[key] = value.replace(/^["']|["']$/g, '');
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

async function checkSchema() {
  console.log('🔍 Checking exact schema of tables...');

  try {
    // Test inserting a product to see what columns are expected
    console.log('\n🧪 Testing product insertion to detect columns...');

    const testProduct = {
      name: 'Test Product',
      sku: 'TEST-001',
      description: 'Test description',
      price: 99.99, // Try 'price' instead of 'price_regular'
      price_regular: 99.99, // Also try this
      is_active: true
    };

    // Try to see what columns exist by attempting a select
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(0);

    if (error) {
      console.log('❌ Products table access error:', error.message);
    } else {
      console.log('✅ Products table is accessible');

      // Try to get column information from PostgreSQL
      const { data: columns, error: columnError } = await supabase
        .rpc('get_table_columns', { table_name: 'products' });

      if (columnError) {
        console.log('⚠️ Could not get column info via RPC:', columnError.message);

        // Alternative: Try a simple insert to see what columns are expected
        console.log('\n🔧 Testing column names...');

        const testFields = [
          'name', 'sku', 'description', 'price', 'price_regular',
          'price_sale', 'cost_price', 'is_active', 'is_featured',
          'created_at', 'updated_at'
        ];

        for (const field of testFields) {
          try {
            const { data, error } = await supabase
              .from('products')
              .select(field)
              .limit(1);

            if (error && error.message.includes('column')) {
              console.log(`❌ Column '${field}' not found`);
            } else {
              console.log(`✅ Column '${field}' exists`);
            }
          } catch (err) {
            console.log(`❌ Column '${field}': Connection error`);
          }
        }
      } else {
        console.log('✅ Table columns:', columns);
      }
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema().catch(console.error);