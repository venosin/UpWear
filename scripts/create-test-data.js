const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function createTestData() {
  console.log('🌱 CREANDO DATOS DE PRUEBA');
  console.log('='.repeat(30));

  try {
    // 1. Crear categorías
    console.log('\n📁 Creando categorías...');
    const categories = [
      { name: 'Camisetas', description: 'Camisetas y blusas de diversos estilos' },
      { name: 'Pantalones', description: 'Pantalones, jeans y pantalones cortos' },
      { name: 'Vestidos', description: 'Vestidos para diferentes ocasiones' },
      { name: 'Chaquetas', description: 'Chaquetas, abrigos y sweaters' },
      { name: 'Accesorios', description: 'Bolsos, cinturones y otros accesorios' }
    ];

    for (const category of categories) {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select();

      if (error) {
        console.log(`❌ Error creando categoría ${category.name}:`, error.message);
      } else {
        console.log(`✅ Categoría creada: ${category.name} (ID: ${data[0].id})`);
      }
    }

    // 2. Crear marcas
    console.log('\n🏷️ Creando marcas...');
    const brands = [
      { name: 'UpWear', description: 'Nuestra marca principal' },
      { name: 'Urban Style', description: 'Ropa urbana moderna' },
      { name: 'Classic Fit', description: 'Ropa clásica y elegante' }
    ];

    for (const brand of brands) {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select();

      if (error) {
        console.log(`❌ Error creando marca ${brand.name}:`, error.message);
      } else {
        console.log(`✅ Marca creada: ${brand.name} (ID: ${data[0].id})`);
      }
    }

    // 3. Crear colores
    console.log('\n🎨 Creando colores...');
    const colors = [
      { name: 'Negro', hex: '#000000' },
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Gris', hex: '#808080' },
      { name: 'Azul', hex: '#0000FF' },
      { name: 'Rojo', hex: '#FF0000' },
      { name: 'Verde', hex: '#00FF00' }
    ];

    for (const color of colors) {
      const { data, error } = await supabase
        .from('colors')
        .insert(color)
        .select();

      if (error) {
        console.log(`❌ Error creando color ${color.name}:`, error.message);
      } else {
        console.log(`✅ Color creado: ${color.name} (ID: ${data[0].id})`);
      }
    }

    // 4. Crear tallas (solo con ID, las tablas no tienen name)
    console.log('\n📏 Creando tallas...');
    // La tabla sizes solo tiene id, is_active, created_at
    const sizes = [1, 2, 3, 4, 5, 6]; // IDs para XS, S, M, L, XL, XXL

    for (const sizeId of sizes) {
      const { data, error } = await supabase
        .from('sizes')
        .insert({ id: sizeId })
        .select();

      if (error) {
        console.log(`❌ Error creando talla ID ${sizeId}:`, error.message);
      } else {
        console.log(`✅ Talla creada: ID ${sizeId}`);
      }
    }

    // 5. Obtener IDs para crear productos
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .limit(1);

    const { data: brandsData } = await supabase
      .from('brands')
      .select('id, name')
      .eq('is_active', true)
      .limit(1);

    // 6. Crear productos de prueba
    console.log('\n👕 Creando productos de prueba...');
    const products = [
      {
        name: 'Camiseta Básica UpWear',
        slug: 'camiseta-basica-upwear',
        sku: 'UW-TSHIRT-001',
        description: 'Camiseta básica de algodón 100% con diseño minimalista. Perfecta para el día a día.',
        short_description: 'Camiseta básica cómoda y versátil',
        price_sale: 29.99,
        cost_price: 12.50,
        track_inventory: true,
        is_active: true,
        is_featured: true,
        gender: 'unisex',
        category_id: categoriesData?.[0]?.id || null,
        brand_id: brandsData?.[0]?.id || null
      },
      {
        name: 'Pantalón Jeans Clásico',
        slug: 'pantalon-jeans-clasico',
        sku: 'UW-JEANS-001',
        description: 'Pantalón jeans de corte recto con five pockets. Fabricado en denim de alta calidad.',
        short_description: 'Jeans clásicos y duraderos',
        price_sale: 79.99,
        cost_price: 35.00,
        track_inventory: true,
        is_active: true,
        is_featured: false,
        gender: 'men',
        category_id: categoriesData?.[0]?.id || null,
        brand_id: brandsData?.[0]?.id || null
      }
    ];

    for (const product of products) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select();

      if (error) {
        console.log(`❌ Error creando producto ${product.name}:`, error.message);
      } else {
        console.log(`✅ Producto creado: ${product.name} (ID: ${data[0].id})`);

        // 7. Crear variantes para este producto
        const variants = [
          {
            product_id: data[0].id,
            sku: `${product.sku}-S`,
            price_override: null,
            stock_quantity: 50,
            size_id: 2, // S
            is_active: true
          },
          {
            product_id: data[0].id,
            sku: `${product.sku}-M`,
            price_override: null,
            stock_quantity: 75,
            size_id: 3, // M
            is_active: true
          },
          {
            product_id: data[0].id,
            sku: `${product.sku}-L`,
            price_override: null,
            stock_quantity: 50,
            size_id: 4, // L
            is_active: true
          }
        ];

        for (const variant of variants) {
          const { data: variantData, error: variantError } = await supabase
            .from('product_variants')
            .insert(variant)
            .select();

          if (variantError) {
            console.log(`❌ Error creando variante ${variant.sku}:`, variantError.message);
          } else {
            console.log(`   ✅ Variante creada: ${variant.sku} (Stock: ${variant.stock_quantity})`);
          }
        }
      }
    }

    console.log('\n🎉 DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('='.repeat(40));
    console.log('Ahora puedes probar el CRUD de productos');
    console.log('Visita: http://localhost:3000/admin/products');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

createTestData().catch(console.error);