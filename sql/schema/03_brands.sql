-- ============================================
-- TABLA DE MARCAS
-- ============================================

CREATE TABLE brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    country VARCHAR(2), -- ISO 3166-1 alpha-2
    website_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_featured ON brands(is_featured);
CREATE INDEX idx_brands_active ON brands(is_active);
CREATE INDEX idx_brands_country ON brands(country);

-- Trigger para actualizar updated_at
CREATE TRIGGER set_brands_timestamp
BEFORE UPDATE ON brands
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Anyone can view active brands"
ON brands FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage brands"
ON brands FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);