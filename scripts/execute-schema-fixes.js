const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
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
    console.log('Project Ref:', process.env.SUPABASE_PROJECT_REF);
    console.log('Access Token:', process.env.SUPABASE_ACCESS_TOKEN ? 'Configured' : 'Missing');
  } catch (error) {
    console.log('❌ Could not load .env file:', error.message);
  }
}

loadEnvFile();

console.log('\n🔧 EJECUCIÓN AUTOMÁTICA DE SCHEMA');
console.log('='.repeat(45));

// Comandos SQL a ejecutar
const sqlCommands = [
  {
    name: 'Add missing columns to products',
    sql: `ALTER TABLE products
ADD COLUMN IF NOT EXISTS price_regular DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT;`
  },
  {
    name: 'Fix sizes table',
    sql: `ALTER TABLE sizes
ADD COLUMN IF NOT EXISTS name VARCHAR(50) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

UPDATE sizes SET name = 'XS', "order" = 1 WHERE id = 1;
UPDATE sizes SET name = 'S', "order" = 2 WHERE id = 2;
UPDATE sizes SET name = 'M', "order" = 3 WHERE id = 3;
UPDATE sizes SET name = 'L', "order" = 4 WHERE id = 4;
UPDATE sizes SET name = 'XL', "order" = 5 WHERE id = 5;
UPDATE sizes SET name = 'XXL', "order" = 6 WHERE id = 6;`
  },
  {
    name: 'Fix product_variants table',
    sql: `ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS color_id INTEGER;`
  },
  {
    name: 'Fix product_images table',
    sql: `ALTER TABLE product_images
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`
  },
  {
    name: 'Create performance indexes',
    sql: `CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);`
  }
];

console.log('\n📝 SQL Commands prepared:', sqlCommands.length);
console.log('\n⚠️  Estos comandos necesitan ser ejecutados manualmente en el dashboard de Supabase:');
console.log('   1. Ve a https://app.supabase.com/project/zkbqjwwqnctqszijmxdx/sql');
console.log('   2. Copia y ejecuta cada comando individualmente\n');

sqlCommands.forEach((cmd, index) => {
  console.log(`\n${index + 1}. ${cmd.name}:`);
  console.log('```sql');
  console.log(cmd.sql);
  console.log('```');
});

console.log('\n💡 Después de ejecutar estos comandos, podremos:');
console.log('   ✅ Usar price_regular correctamente');
console.log('   ✅ Tener nombres de tallas (XS, S, M, L, XL, XXL)');
console.log('   ✅ Asociar colores a variantes');
console.log('   ✅ Ordenar imágenes correctamente');
console.log('   ✅ Consultas rápidas con índices');