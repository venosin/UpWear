-- ============================================
-- TABLA DE CUPONES DE DESCUENTO
-- ============================================

CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Tipo y valor del descuento
    discount_type discount_type NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2), -- Monto mínimo para aplicar el cupón

    -- Límites de uso
    usage_limit INTEGER, -- Límite total de usos
    usage_limit_per_user INTEGER, -- Límite por usuario
    used_count INTEGER DEFAULT 0,

    -- Validez
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,

    -- Restricciones
    applicable_products BIGINT[], -- IDs de productos específicos
    applicable_categories BIGINT[], -- IDs de categorías específicas
    excluded_products BIGINT[], -- Productos excluidos
    excluded_categories BIGINT[], -- Categorías excluidas
    first_time_customers_only BOOLEAN DEFAULT false,

    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- Visible públicamente

    -- Métadatos
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE USO DE CUPONES
-- ============================================

CREATE TABLE coupon_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(10,2) NOT NULL,
    order_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Evitar uso duplicado del mismo cupón en la misma orden
    UNIQUE(coupon_id, order_id)
);

-- Índices para coupons
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX idx_coupons_valid_to ON coupons(valid_to);

-- Índices para coupon_usage
CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_created_at ON coupon_usage(created_at);

-- Trigger para actualizar timestamp
CREATE TRIGGER set_coupons_timestamp
BEFORE UPDATE ON coupons
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- TABLA DE LOGS DE ACTIVIDAD DE ADMIN
-- ============================================

CREATE TABLE admin_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- created, updated, deleted, viewed, etc.
    entity VARCHAR(50) NOT NULL, -- product, order, user, category, etc.
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_entity ON admin_activity_logs(entity);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

-- ============================================
-- TABLA DE ANALYTICS (Estadísticas básicas)
-- ============================================

CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- page_view, add_to_cart, purchase, etc.
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(255), -- Para usuarios no autenticados
    properties JSONB DEFAULT '{}', -- Datos adicionales del evento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para analytics
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- RLS para estas tablas
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view active public coupons"
ON coupons FOR SELECT
USING (is_active = true AND is_public = true);

CREATE POLICY "Admins can manage all coupons"
ON coupons FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can view their own coupon usage"
ON coupon_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all coupon usage"
ON coupon_usage FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);