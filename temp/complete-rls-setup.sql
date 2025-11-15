-- TODO COMPLETO DE CONFIGURACIÓN RLS Y COLORS - UN SOLO BLOQUE
-- Copiar y pegar este comando completo en el editor SQL de Supabase

-- 1. Crear tabla colors si no existe
CREATE TABLE IF NOT EXISTS colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hex VARCHAR(7) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar colores básicos para testing
INSERT INTO colors (name, hex, is_active) VALUES
    ('Negro Puro', '#000000', true),
    ('Blanco Nieve', '#FFFFFF', true),
    ('Gris Humo', '#6B7280', true),
    ('Azul Marino', '#1E40AF', true),
    ('Azul Rey', '#2563EB', true),
    ('Rojo Intenso', '#DC2626', true),
    ('Borgoña', '#7C2D12', true),
    ('Verde Bosque', '#14532D', true),
    ('Verde Menta', '#059669', true),
    ('Mostaza', '#A16207', true),
    ('Terracota', '#C2410C', true),
    ('Rosa Pastel', '#F9A8D4', true);

-- 3. Crear políticas RLS para productos
CREATE POLICY "Enable select for all authenticated users" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for all authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Crear políticas RLS para tablas relacionadas
CREATE POLICY "Enable full access for variants" ON product_variants
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable full access for images" ON product_images
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable full access for colors" ON colors
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Asegurar que RLS esté habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;