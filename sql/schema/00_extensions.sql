-- ============================================
-- EXTENSIONS Y CONFIGURACIÓN INICIAL
-- ============================================

-- Habilitar UUID extension para generar IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar trigram para búsquedas de texto eficientes
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Habilitar unaccent para búsquedas sin acentos
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Configuración de zona horaria
SET timezone = 'America/El_Salvador';

-- Crear tipos personalizados ENUM
DO $$ BEGIN
    -- Tipos de usuario
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');

    -- Tipos de producto
    CREATE TYPE product_gender AS ENUM ('men', 'women', 'unisex', 'kids', 'none');
    CREATE TYPE inventory_type AS ENUM ('single_item', 'bulk');
    CREATE TYPE product_condition AS ENUM ('new', 'new_with_tags', 'like_new', 'good', 'fair');

    -- Tipos de tallas
    CREATE TYPE size_type AS ENUM ('clothing', 'shoes', 'accessories');

    -- Estados de órdenes
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

    -- Métodos de pago
    CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'card', 'transfer', 'wallet');

    -- Tipos de descuento
    CREATE TYPE discount_type AS ENUM ('percentage', 'amount');

    -- Tipos de cambio de inventario
    CREATE TYPE inventory_change_type AS ENUM ('sale', 'restock', 'manual_adjustment', 'return', 'damage');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;