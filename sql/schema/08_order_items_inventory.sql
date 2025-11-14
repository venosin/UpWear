-- ============================================
-- TABLA DE ÍTEMS DE ÓRDENES
-- ============================================

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE RESTRICT,
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,

    -- Información del producto al momento de la compra
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(100),
    variant_sku VARCHAR(100),
    product_image TEXT, -- URL de la imagen principal al momento de compra
    variant_attributes JSONB, -- color, talla, etc.

    -- Cantidades y precios
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,

    -- Estado del item
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    fulfillment_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, shipped, delivered

    -- Metadatos
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_product_variant_id ON order_items(product_variant_id);
CREATE INDEX idx_order_items_status ON order_items(status);

-- Trigger para actualizar timestamp
CREATE TRIGGER set_order_items_timestamp
BEFORE UPDATE ON order_items
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- TABLA DE REGISTRO DE INVENTARIO
-- ============================================

CREATE TABLE inventory_logs (
    id BIGSERIAL PRIMARY KEY,
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    change INTEGER NOT NULL, -- Positivo para entrada, negativo para salida
    previous_quantity INTEGER,
    new_quantity INTEGER,
    reason inventory_change_type NOT NULL,
    reference_id BIGINT, -- ID relacionado (ej: order_id, restock_id)
    reference_type VARCHAR(50), -- order, manual_adjustment, return, etc.

    -- Información adicional
    notes TEXT,
    cost_price DECIMAL(10,2), -- Precio de costo si aplica

    -- Auditoría
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_inventory_logs_product_variant_id ON inventory_logs(product_variant_id);
CREATE INDEX idx_inventory_logs_reason ON inventory_logs(reason);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at);
CREATE INDEX idx_inventory_logs_created_by ON inventory_logs(created_by);

-- ============================================
-- TABLA DE WISHLISTS (Lista de deseos)
-- ============================================

CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'My Wishlist',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, name)
);

-- ============================================
-- TABLA DE ÍTEMS DE WISHLIST
-- ============================================

CREATE TABLE wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    wishlist_id BIGINT REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    notes TEXT,
    priority INTEGER DEFAULT 0, -- 0 = normal, 1 = high priority
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear unique constraints para evitar duplicados
CREATE UNIQUE INDEX idx_wishlist_items_unique_product
ON wishlist_items(wishlist_id, product_id)
WHERE product_variant_id IS NULL;

CREATE UNIQUE INDEX idx_wishlist_items_unique_variant
ON wishlist_items(wishlist_id, product_id, product_variant_id)
WHERE product_variant_id IS NOT NULL;

-- Índices para wishlists
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_is_public ON wishlists(is_public);
CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items(product_id);

-- Triggers para timestamps
CREATE TRIGGER set_wishlists_timestamp
BEFORE UPDATE ON wishlists
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- RLS para wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can manage their own wishlists"
ON wishlists FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public wishlists"
ON wishlists FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can manage their own wishlist items"
ON wishlist_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM wishlists w
        WHERE w.id = wishlist_items.wishlist_id AND w.user_id = auth.uid()
    )
);