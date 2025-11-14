-- ============================================
-- TABLA DE TALLAS
-- ============================================

CREATE TABLE sizes (
    id BIGSERIAL PRIMARY KEY,
    label VARCHAR(20) NOT NULL, -- S, M, L, 9, 9.5, etc.
    type size_type NOT NULL,
    us_size VARCHAR(10),
    eu_size VARCHAR(10),
    uk_size VARCHAR(10),
    cm_size VARCHAR(10), -- Para zapatos
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sizes_type ON sizes(type);
CREATE INDEX idx_sizes_label ON sizes(label);
CREATE INDEX idx_sizes_sort_order ON sizes(sort_order);
CREATE UNIQUE INDEX idx_sizes_type_label ON sizes(type, label);

-- ============================================
-- TABLA DE CONDICIONES DE PRODUCTOS
-- ============================================

CREATE TABLE product_conditions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(60) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Nombre del icono
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_product_conditions_slug ON product_conditions(slug);
CREATE INDEX idx_product_conditions_active ON product_conditions(is_active);

-- RLS para sizes
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active sizes"
ON sizes FOR SELECT
USING (is_active = true);

-- RLS para product_conditions
ALTER TABLE product_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active conditions"
ON product_conditions FOR SELECT
USING (is_active = true);