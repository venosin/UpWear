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

async function analyzeSchema() {
  console.log('🔍 ANALISIS COMPLETO: SCHEMA vs CÓDIGO');
  console.log('='.repeat(50));

  // Definir todas las tablas y columnas que usamos en el código
  const expectedSchema = {
    products: [
      'id', 'name', 'slug', 'sku', 'description', 'short_description',
      'price', 'price_regular', 'price_sale', 'cost_price',
      'track_inventory', 'is_active', 'is_featured', 'gender',
      'category_id', 'brand_id', 'created_at', 'updated_at'
    ],
    categories: [
      'id', 'name', 'description', 'parent_id', 'is_active', 'created_at'
    ],
    brands: [
      'id', 'name', 'description', 'logo_url', 'is_active', 'created_at'
    ],
    colors: [
      'id', 'name', 'hex', 'is_active', 'created_at'
    ],
    sizes: [
      'id', 'name', 'order', 'is_active', 'created_at'
    ],
    product_variants: [
      'id', 'product_id', 'sku', 'price_override', 'stock_quantity',
      'size_id', 'color_id', 'is_active', 'created_at'
    ],
    product_images: [
      'id', 'product_id', 'url', 'alt_text', 'image_type',
      'sort_order', 'is_active', 'created_at'
    ]
  };

  console.log('\n📋 Verificando columnas por tabla...');

  for (const [tableName, expectedColumns] of Object.entries(expectedSchema)) {
    console.log(`\n🏗️ Tabla: ${tableName}`);
    console.log('-'.repeat(30));

    const existingColumns = [];
    const missingColumns = [];

    for (const column of expectedColumns) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select(column)
          .limit(1);

        if (error && error.message.includes('column')) {
          missingColumns.push(column);
        } else {
          existingColumns.push(column);
        }
      } catch (err) {
        missingColumns.push(column);
      }
    }

    console.log(`✅ Columnas existentes (${existingColumns.length}):`);
    existingColumns.forEach(col => console.log(`   + ${col}`));

    if (missingColumns.length > 0) {
      console.log(`❌ Columnas faltantes (${missingColumns.length}):`);
      missingColumns.forEach(col => console.log(`   - ${col}`));
    }

    // Verificar si hay columnas adicionales no esperadas
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (!error && data && data.length > 0) {
        const actualColumns = Object.keys(data[0]);
        const unexpectedColumns = actualColumns.filter(col => !expectedColumns.includes(col));

        if (unexpectedColumns.length > 0) {
          console.log(`⚠️ Columnas inesperadas (${unexpectedColumns.length}):`);
          unexpectedColumns.forEach(col => console.log(`   ? ${col}`));
        }
      }
    } catch (err) {
      console.log('   No se pudo verificar columnas adicionales');
    }
  }

  console.log('\n🎯 ANÁLISIS DE CONSISTENCIA');
  console.log('='.repeat(30));

  // Verificar campos específicos que causaron problemas
  const criticalChecks = [
    {
      table: 'products',
      field: 'price_sale',
      description: 'Campo principal de precio (basado en errores anteriores)'
    },
    {
      table: 'products',
      field: 'price_regular',
      description: 'Precio regular (usado en código anterior)'
    },
    {
      table: 'products',
      field: 'price',
      description: 'Campo simple de precio'
    }
  ];

  for (const check of criticalChecks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select(check.field)
        .limit(1);

      if (error && error.message.includes('column')) {
        console.log(`❌ ${check.table}.${check.field} - NO EXISTE`);
        console.log(`   ${check.description}`);
      } else {
        console.log(`✅ ${check.table}.${check.field} - EXISTE`);
        console.log(`   ${check.description}`);
      }
    } catch (err) {
      console.log(`❌ ${check.table}.${check.field} - ERROR DE CONEXIÓN`);
    }
  }

  console.log('\n💡 RECOMENDACIONES');
  console.log('='.repeat(30));
  console.log('1. Si faltan columnas importantes, ejecutar los scripts SQL');
  console.log('2. Si hay nombres inconsistentes, actualizar el código');
  console.log('3. Crear datos de prueba manualmente antes de usar CRUD');
  console.log('4. Verificar constraints y relaciones entre tablas');
}

analyzeSchema().catch(console.error);