-- ============================================
-- TABLA DE CONFIGURACIÓN DEL SITIO
-- ============================================

CREATE TABLE site_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- general, payment, shipping, email, social, seo, etc.

    -- Valores
    value TEXT,
    value_type setting_value_type DEFAULT 'string', -- string, number, boolean, json
    default_value TEXT,

    -- Información de configuración
    display_name VARCHAR(200),
    description TEXT,
    placeholder VARCHAR(200),

    -- Validaciones
    is_required BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false, -- Accessible en frontend público
    validation_rules JSONB DEFAULT '{}', -- Reglas de validación adicionales

    -- UI Configuration
    input_type VARCHAR(50) DEFAULT 'text', -- text, textarea, number, email, url, select, checkbox, radio, file
    input_options JSONB DEFAULT '{}', -- Opciones para selects, radios, etc.
    group_name VARCHAR(100), -- Agrupación en UI
    sort_order INTEGER DEFAULT 0,

    -- Control de cambios
    last_modified_by UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE INDEX idx_site_settings_category ON site_settings(category);
CREATE INDEX idx_site_settings_is_public ON site_settings(is_public);
CREATE INDEX idx_site_settings_group_name ON site_settings(group_name);
CREATE INDEX idx_site_settings_sort_order ON site_settings(sort_order);

-- Trigger para actualizar timestamp
CREATE TRIGGER set_site_settings_timestamp
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- DATOS INICIALES DE CONFIGURACIÓN
-- ============================================

INSERT INTO site_settings (key, category, display_name, description, value, default_value, value_type, is_public, input_type, group_name, sort_order) VALUES
-- General Settings
('site_name', 'general', 'Nombre del Sitio', 'Nombre de la tienda', 'UpWear', 'UpWear', 'string', true, 'text', 'Información Básica', 1),
('site_description', 'general', 'Descripción del Sitio', 'Descripción breve para SEO', 'Tienda de ropa premium', 'Tu tienda de ropa premium', 'string', true, 'textarea', 'Información Básica', 2),
('site_email', 'general', 'Email de Contacto', 'Email principal del sitio', 'contact@upwear.com', 'contact@example.com', 'string', true, 'email', 'Información Básica', 3),
('site_phone', 'general', 'Teléfono', 'Teléfono de contacto', NULL, NULL, 'string', true, 'text', 'Información Básica', 4),
('site_address', 'general', 'Dirección', 'Dirección física', NULL, NULL, 'string', true, 'textarea', 'Información Básica', 5),

-- Currency & Locale
('currency_code', 'general', 'Moneda', 'Código de moneda', 'USD', 'USD', 'string', true, 'select', 'Configuración Regional', 1),
('currency_symbol', 'general', 'Símbolo de Moneda', 'Símbolo de moneda', '$', '$', 'string', true, 'text', 'Configuración Regional', 2),
('default_language', 'general', 'Idioma por Defecto', 'Idioma principal del sitio', 'es', 'es', 'string', true, 'select', 'Configuración Regional', 3),
('timezone', 'general', 'Zona Horaria', 'Zona horaria del servidor', 'America/Mexico_City', 'America/Mexico_City', 'string', false, 'select', 'Configuración Regional', 4),

-- E-commerce Settings
('tax_rate', 'ecommerce', 'Tasa de Impuestos', 'Porcentaje de impuestos (%)', '16.00', '0.00', 'number', false, 'number', 'Configuración de Ventas', 1),
('shipping_cost', 'ecommerce', 'Costo de Envío', 'Costo base de envío', '0.00', '0.00', 'number', false, 'number', 'Configuración de Ventas', 2),
('free_shipping_threshold', 'ecommerce', 'Envío Gratis a partir de', 'Monto mínimo para envío gratis', '1000.00', '1000.00', 'number', true, 'number', 'Configuración de Ventas', 3),
('enable_guest_checkout', 'ecommerce', 'Permitir Checkout Invitado', 'Permitir compras sin registro', 'true', 'false', 'boolean', false, 'checkbox', 'Configuración de Ventas', 4),
('order_confirmation_email', 'ecommerce', 'Email de Confirmación', 'Habilitar email de confirmación de pedido', 'true', 'true', 'boolean', false, 'checkbox', 'Configuración de Ventas', 5),

-- Inventory Settings
('track_inventory', 'inventory', 'Rastrear Inventario', 'Habilitar seguimiento de inventario', 'true', 'true', 'boolean', false, 'checkbox', 'Gestión de Inventario', 1),
('low_stock_threshold', 'inventory', 'Umbral de Stock Bajo', 'Alertar cuando el stock sea menor a', '10', '10', 'number', false, 'number', 'Gestión de Inventario', 2),
('allow_backorder', 'inventory', 'Permitir Backorder', 'Permitir venta de productos sin stock', 'false', 'false', 'boolean', false, 'checkbox', 'Gestión de Inventario', 3),
('out_of_stock_message', 'inventory', 'Mensaje Sin Stock', 'Mensaje a mostrar cuando no hay stock', 'Agotado temporalmente', 'Sin stock', 'string', true, 'text', 'Gestión de Inventario', 4),

-- Payment Settings
('payment_methods', 'payment', 'Métodos de Pago', 'Métodos de pago habilitados', '["card", "paypal"]', '["card"]', 'json', true, 'multiselect', 'Configuración de Pagos', 1),
('stripe_public_key', 'payment', 'Stripe Public Key', 'Clave pública de Stripe', NULL, NULL, 'string', false, 'text', 'Configuración de Pagos', 2),
('stripe_secret_key', 'payment', 'Stripe Secret Key', 'Clave secreta de Stripe', NULL, NULL, 'string', false, 'password', 'Configuración de Pagos', 3),
('paypal_client_id', 'payment', 'PayPal Client ID', 'Client ID de PayPal', NULL, NULL, 'string', false, 'text', 'Configuración de Pagos', 4),
('paypal_client_secret', 'payment', 'PayPal Client Secret', 'Client secret de PayPal', NULL, NULL, 'string', false, 'password', 'Configuración de Pagos', 5),

-- Social Media
('facebook_url', 'social', 'Facebook', 'URL de Facebook', NULL, NULL, 'string', true, 'url', 'Redes Sociales', 1),
('twitter_url', 'social', 'Twitter', 'URL de Twitter', NULL, NULL, 'string', true, 'url', 'Redes Sociales', 2),
('instagram_url', 'social', 'Instagram', 'URL de Instagram', NULL, NULL, 'string', true, 'url', 'Redes Sociales', 3),
('youtube_url', 'social', 'YouTube', 'URL de YouTube', NULL, NULL, 'string', true, 'url', 'Redes Sociales', 4),

-- SEO Settings
('meta_title', 'seo', 'Meta Title', 'Título por defecto para SEO', 'UpWear - Tienda de Ropa Premium', 'UpWear - Tu Tienda', 'string', true, 'text', 'SEO', 1),
('meta_description', 'seo', 'Meta Description', 'Descripción por defecto para SEO', 'Descubre la mejor selección de ropa premium', 'Tu tienda de ropa favorita', 'string', true, 'textarea', 'SEO', 2),
('meta_keywords', 'seo', 'Meta Keywords', 'Palabras clave para SEO', 'ropa, moda, premium, tienda', 'tienda, ropa, moda', 'string', true, 'text', 'SEO', 3),
('google_analytics_id', 'seo', 'Google Analytics ID', 'ID de seguimiento de Google Analytics', NULL, NULL, 'string', false, 'text', 'SEO', 4),
('google_tag_manager_id', 'seo', 'Google Tag Manager ID', 'ID de Google Tag Manager', NULL, NULL, 'string', false, 'text', 'SEO', 5),

-- Maintenance
('maintenance_mode', 'maintenance', 'Modo Mantenimiento', 'Activar modo de mantenimiento', 'false', 'false', 'boolean', false, 'checkbox', 'Mantenimiento', 1),
('maintenance_message', 'maintenance', 'Mensaje Mantenimiento', 'Mensaje durante el mantenimiento', 'Estamos en mantenimiento, vuelve pronto', 'Sitio en mantenimiento', 'string', true, 'textarea', 'Mantenimiento', 2),

-- Email Configuration
('smtp_host', 'email', 'SMTP Host', 'Servidor SMTP', NULL, NULL, 'string', false, 'text', 'Configuración Email', 1),
('smtp_port', 'email', 'SMTP Port', 'Puerto SMTP', '587', '587', 'number', false, 'number', 'Configuración Email', 2),
('smtp_username', 'email', 'SMTP Username', 'Usuario SMTP', NULL, NULL, 'string', false, 'text', 'Configuración Email', 3),
('smtp_password', 'email', 'SMTP Password', 'Contraseña SMTP', NULL, NULL, 'string', false, 'password', 'Configuración Email', 4),
('smtp_from_email', 'email', 'Email From', 'Email para envíos', NULL, NULL, 'string', false, 'email', 'Configuración Email', 5),
('smtp_from_name', 'email', 'From Name', 'Nombre para envíos', 'UpWear', 'UpWear', 'string', false, 'text', 'Configuración Email', 6);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Anyone can view public settings"
ON site_settings FOR SELECT
USING (is_public = true);

CREATE POLICY "Admins can manage all settings"
ON site_settings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Authenticated users can view public settings"
ON site_settings FOR SELECT
USING (
    auth.uid() IS NOT NULL AND is_public = true
);

-- ============================================
-- VIEWS ÚTILES
-- ============================================

-- Vista para settings públicos (optimizada para frontend)
CREATE VIEW public_site_settings AS
SELECT
    key,
    value,
    value_type,
    default_value
FROM site_settings
WHERE is_public = true;

-- Vista para settings por categoría (para admin UI)
CREATE VIEW admin_settings_by_category AS
SELECT
    id,
    key,
    category,
    display_name,
    description,
    value,
    default_value,
    value_type,
    is_public,
    input_type,
    input_options,
    group_name,
    sort_order,
    is_required,
    placeholder,
    validation_rules,
    updated_at
FROM site_settings
ORDER BY category, group_name, sort_order;