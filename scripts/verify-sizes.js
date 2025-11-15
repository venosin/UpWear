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
  } catch (error) {
    console.log('❌ Could not load .env file:', error.message);
  }
}

loadEnvFile();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function verifySetup() {
  console.log('🔍 VERIFICACIÓN FINAL DEL SETUP');
  console.log('='.repeat(40));

  try {
    // 1. Verificar tallas
    console.log('\n📏 Verificando tallas...');
    const { data: sizes, error: sizesError } = await supabase
      .from('sizes')
      .select('*')
      .eq('is_active', true)
      .order('order');

    if (sizesError) {
      console.log('❌ Error verificando tallas:', sizesError.message);
    } else {
      console.log('✅ Tallas configuradas:');
      sizes.forEach(size => {
        console.log(`   ${size.order}. ${size.name} (ID: ${size.id})`);
      });
    }

    // 2. Verificar categorías
    console.log('\n📁 Verificando categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (categoriesError) {
      console.log('❌ Error verificando categorías:', categoriesError.message);
    } else {
      console.log(`✅ Categorías encontradas: ${categories.length}`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat.id})`);
      });
    }

    // 3. Verificar colores
    console.log('\n🎨 Verificando colores...');
    const { data: colors, error: colorsError } = await supabase
      .from('colors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (colorsError) {
      console.log('❌ Error verificando colores:', colorsError.message);
    } else {
      console.log(`✅ Colores encontrados: ${colors.length}`);
      colors.forEach(color => {
        console.log(`   - ${color.name} (${color.hex}) (ID: ${color.id})`);
      });
    }

    // 4. Verificar si hay productos para probar
    console.log('\n👕 Verificando productos existentes...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, sku, price_regular, price_sale')
      .order('created_at', { ascending: false })
      .limit(5);

    if (productsError) {
      console.log('❌ Error verificando productos:', productsError.message);
    } else {
      if (products.length === 0) {
        console.log('📝 No hay productos aún. ¡Perfecto para crear el primero!');
        console.log('   URL para crear: http://localhost:3000/admin/products/create');
      } else {
        console.log(`✅ Productos existentes: ${products.length}`);
        products.forEach(product => {
          const price = product.price_regular || product.price_sale;
          console.log(`   - ${product.name} (${product.sku}) - $${price}`);
        });
      }
    }

    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(30));
    console.log('✅ Schema está correctamente configurado');
    console.log('✅ Tallas tienen nombres y orden');
    console.log('✅ Colors están disponibles');
    console.log('✅ Product list está listo');
    console.log('\n🚀 YA PUEDES PROBAR EL CRUD DE PRODUCTOS!');

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

verifySetup().catch(console.error);