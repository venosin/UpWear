-- ============================================
-- TABLA DE VARIANTES DE PRODUCTOS
-- ============================================

CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    size_id BIGINT REFERENCES sizes(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(50),

    -- Atributos de la variante
    color VARCHAR(50),
    color_code VARCHAR(7), -- HEX color
    material TEXT,
    weight DECIMAL(8,2),
    additional_images TEXT[], -- URLs de imágenes adicionales

    -- Precios (pueden diferir del producto base)
    price_override DECIMAL(10,2), -- Si es NULL, usa price_sale del producto
    cost_price_override DECIMAL(10,2),

    -- Inventario
    stock_quantity INTEGER DEFAULT 1,
    min_stock_level INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT true,
    allow_backorder BOOLEAN DEFAULT false,

    -- Estado
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,

    -- Métadatos
    metadata JSONB DEFAULT '{}',

    -- Auditoría
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(product_id, size_id, color) -- Evita variantes duplicadas
);

-- Índices
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_size_id ON product_variants(size_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_color ON product_variants(color);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);
CREATE INDEX idx_product_variants_stock ON product_variants(stock_quantity);
CREATE INDEX idx_product_variants_sort_order ON product_variants(sort_order);

-- Trigger para actualizar updated_at
CREATE TRIGGER set_product_variants_timestamp
BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- TABLA DE IMÁGENES DE PRODUCTOS
-- ============================================

CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    title VARCHAR(200),

    -- Orden y tipo
    order_index INTEGER DEFAULT 0,
    image_type VARCHAR(20) DEFAULT 'main', -- main, gallery, thumbnail, detail

    -- Tamaño y optimización
    width INTEGER,
    height INTEGER,
    file_size INTEGER, -- En bytes
    format VARCHAR(10), -- jpg, png, webp

    -- Metadatos
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_order_index ON product_images(order_index);
CREATE INDEX idx_product_images_type ON product_images(image_type);

-- RLS para product_variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active product variants"
ON product_variants FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage product variants"
ON product_variants FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- RLS para product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images"
ON product_images FOR SELECT
USING (true); -- Las imágenes son públicas

CREATE POLICY "Admins can manage product images"
ON product_images FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);