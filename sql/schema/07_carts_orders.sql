-- ============================================
-- TABLA DE CARRITOS
-- ============================================

CREATE TABLE carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL para carritos de invitados
    session_id VARCHAR(255), -- Para carritos de invitados
    status VARCHAR(20) DEFAULT 'active', -- active, abandoned, converted
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear unique constraint parcial para usuarios autenticados
CREATE UNIQUE INDEX idx_carts_user_active ON carts(user_id) WHERE user_id IS NOT NULL AND status = 'active';

-- ============================================
-- TABLA DE ÍTEMS DEL CARRITO
-- ============================================

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL, -- Precio al momento de agregar
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Evitar items duplicados en el mismo carrito
    UNIQUE(cart_id, product_variant_id)
);

-- Índices para carts
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_carts_created_at ON carts(created_at);

-- Índices para cart_items
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_variant_id ON cart_items(product_variant_id);

-- Triggers para actualizar timestamps
CREATE TRIGGER set_carts_timestamp
BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_cart_items_timestamp
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- TABLA DE DIRECCIONES
-- ============================================

CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(2) DEFAULT 'SV', -- ISO 3166-1 alpha-2
    postal_code VARCHAR(20),
    is_default_billing BOOLEAN DEFAULT false,
    is_default_shipping BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_country ON addresses(country);
CREATE INDEX idx_addresses_is_default_billing ON addresses(is_default_billing);
CREATE INDEX idx_addresses_is_default_shipping ON addresses(is_default_shipping);

-- Trigger para actualizar timestamp
CREATE TRIGGER set_addresses_timestamp
BEFORE UPDATE ON addresses
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- TABLA DE ÓRDENES
-- ============================================

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Formato: ORD-20241114-00123
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL para guest orders
    guest_email VARCHAR(255), -- Para órdenes de invitados
    status order_status DEFAULT 'pending',

    -- Montos
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Dirección y envío
    shipping_address_id BIGINT REFERENCES addresses(id),
    billing_address_id BIGINT REFERENCES addresses(id),
    shipping_method VARCHAR(50),
    tracking_number VARCHAR(100),

    -- Pago
    payment_method payment_method,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_gateway VARCHAR(50), -- stripe, paypal, etc.
    gateway_transaction_id VARCHAR(100),

    -- Notas y metadata
    customer_notes TEXT,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',

    -- Auditoría
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_total_amount ON orders(total_amount);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(MICROSECONDS FROM NOW())::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Trigger para actualizar timestamp
CREATE TRIGGER set_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- RLS para estas tablas (según sea necesario)
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can manage their own cart"
ON carts FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own addresses"
ON addresses FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
ON orders FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);