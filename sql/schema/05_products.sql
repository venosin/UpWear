-- ============================================
-- TABLA DE PRODUCTOS (Principal)
-- ============================================

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT, -- Para listados y cards
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(50),

    -- Relaciones
    brand_id BIGINT REFERENCES brands(id) ON DELETE SET NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    condition_id BIGINT REFERENCES product_conditions(id) ON DELETE SET NULL,

    -- Atributos
    gender product_gender DEFAULT 'none',
    primary_color VARCHAR(50),
    secondary_color VARCHAR(50),
    material TEXT,
    care_instructions TEXT,

    -- Precios
    price_original DECIMAL(10,2), -- Precio sin descuento
    price_sale DECIMAL(10,2) NOT NULL, -- Precio actual
    cost_price DECIMAL(10,2), -- Precio de costo (para admin)

    -- Inventarios
    inventory_type inventory_type DEFAULT 'single_item',
    track_inventory BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0, -- Alerta de bajo stock

    -- Estado y SEO
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_digital BOOLEAN DEFAULT false,
    weight DECIMAL(8,2), -- En kg
    dimensions JSONB, -- {length, width, height} en cm

    -- SEO y Marketing
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords TEXT[],
    tags TEXT[],

    -- Métadatos
    metadata JSONB DEFAULT '{}',
    search_vector tsvector, -- Para búsquedas全文

    -- Auditoría
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_price_sale ON products(price_sale);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);

-- Índice de búsqueda全文
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);

-- Trigger para actualizar el vector de búsqueda
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_search_vector
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Trigger para actualizar updated_at
CREATE TRIGGER set_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all products"
ON products FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Staff can view and update products"
ON products FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);

CREATE POLICY "Staff can update products"
ON products FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);