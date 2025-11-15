import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function checkDatabase() {
  console.log('🔍 Checking Supabase connection...');

  try {
    // Test basic connection
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Connection error:', error);
      return;
    }
    console.log('✅ Connection successful');

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
      } else if (data && data.length > 0) {
        console.log('✅ Products table columns:', Object.keys(data[0]));
      } else {
        console.log('✅ Products table exists but is empty');
      }
    } catch (err) {
      console.log('❌ Could not check products schema');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase();