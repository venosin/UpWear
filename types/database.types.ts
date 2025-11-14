/**
 * Tipos generados desde la base de datos Supabase
 * Estos tipos representan la estructura exacta de las tablas SQL
 */

// ==================== TIPOS ENUM ====================

export type UserRole = 'customer' | 'admin' | 'staff';
export type ProductGender = 'men' | 'women' | 'unisex' | 'kids' | 'none';
export type InventoryType = 'single_item' | 'bulk';
export type ProductCondition = 'new' | 'new_with_tags' | 'like_new' | 'good' | 'fair';
export type SizeType = 'clothing' | 'shoes' | 'accessories';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash_on_delivery' | 'card' | 'transfer' | 'wallet';
export type DiscountType = 'percentage' | 'amount';
export type InventoryChangeType = 'sale' | 'restock' | 'manual_adjustment' | 'return' | 'damage';

// ==================== TABLA PRINCIPAL: USERS ====================

export interface DatabaseProfile {
  id: string; // UUID
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  birth_date: string | null; // Date
  gender: ProductGender;
  preferences: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== TABLA: CATEGORIES ====================

export interface DatabaseCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== TABLA: BRANDS ====================

export interface DatabaseBrand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  country: string | null; // ISO 3166-1 alpha-2
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== TABLA: SIZES ====================

export interface DatabaseSize {
  id: number;
  label: string; // S, M, L, 9, 9.5, etc.
  type: SizeType;
  us_size: string | null;
  eu_size: string | null;
  uk_size: string | null;
  cm_size: string | null; // Para zapatos
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string; // timestamp
}

// ==================== TABLA: PRODUCT_CONDITIONS ====================

export interface DatabaseProductCondition {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null; // Nombre del icono
  sort_order: number;
  is_active: boolean;
  created_at: string; // timestamp
}

// ==================== TABLA PRINCIPAL: PRODUCTS ====================

export interface DatabaseProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null; // Para listados y cards
  sku: string | null;
  barcode: string | null;

  // Relaciones
  brand_id: number | null;
  category_id: number | null;
  condition_id: number | null;

  // Atributos
  gender: ProductGender;
  primary_color: string | null;
  secondary_color: string | null;
  material: string | null;
  care_instructions: string | null;

  // Precios
  price_original: number | null; // Precio sin descuento
  price_sale: number; // Precio actual
  cost_price: number | null; // Precio de costo (para admin)

  // Inventarios
  inventory_type: InventoryType;
  track_inventory: boolean;
  stock_quantity: number;
  min_stock_level: number; // Alerta de bajo stock

  // Estado y SEO
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  weight: number | null; // En kg
  dimensions: Record<string, any>; // {length, width, height} en cm

  // SEO y Marketing
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  tags: string[] | null;

  // Métadatos
  metadata: Record<string, any>;
  search_vector: string; // Para búsquedas全文

  // Auditoría
  created_by: string | null; // UUID
  updated_by: string | null; // UUID
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== TABLA: PRODUCT_VARIANTS ====================

export interface DatabaseProductVariant {
  id: number;
  product_id: number;
  size_id: number | null;
  sku: string | null;
  barcode: string | null;

  // Atributos de la variante
  color: string | null;
  color_code: string | null; // HEX color
  material: string | null;
  weight: number | null;
  additional_images: string[] | null; // URLs de imágenes adicionales

  // Precios (pueden diferir del producto base)
  price_override: number | null; // Si es NULL, usa price_sale del producto
  cost_price_override: number | null;

  // Inventario
  stock_quantity: number;
  min_stock_level: number;
  track_inventory: boolean;
  allow_backorder: boolean;

  // Estado
  is_active: boolean;
  sort_order: number;

  // Métadatos
  metadata: Record<string, any>;

  // Auditoría
  created_by: string | null; // UUID
  updated_by: string | null; // UUID
  created_at: string; // timestamp
  updated_at: string; // timestamp;
}

// ==================== TABLA: PRODUCT_IMAGES ====================

export interface DatabaseProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text: string | null;
  title: string | null;

  // Orden y tipo
  order_index: number;
  image_type: string; // main, gallery, thumbnail, detail

  // Tamaño y optimización
  width: number | null;
  height: number | null;
  file_size: number | null; // En bytes
  format: string | null; // jpg, png, webp

  // Metadatos
  metadata: Record<string, any>;

  created_at: string; // timestamp
}

// ==================== TABLA: CARTS ====================

export interface DatabaseCart {
  id: string; // UUID
  user_id: string | null; // NULL para carritos de invitados
  session_id: string | null; // Para carritos de invitados
  status: string; // active, abandoned, converted
  metadata: Record<string, any>;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== TABLA: CART_ITEMS ====================

export interface DatabaseCartItem {
  id: number;
  cart_id: string; // UUID
  product_variant_id: number;
  quantity: number;
  unit_price: number; // Precio al momento de agregar
  total_price: number; // Generado siempre como quantity * unit_price
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== TABLA: ADDRESSES ====================

export interface DatabaseAddress {
  id: number;
  user_id: string; // UUID
  full_name: string;
  phone: string | null;
  company: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string; // ISO 3166-1 alpha-2
  postal_code: string | null;
  is_default_billing: boolean;
  is_default_shipping: boolean;
  metadata: Record<string, any>;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== TABLA: ORDERS ====================

export interface DatabaseOrder {
  id: number;
  order_number: string; // Formato: ORD-20241114-00123
  user_id: string | null; // NULL para guest orders
  guest_email: string | null; // Para órdenes de invitados
  status: OrderStatus;

  // Montos
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;

  // Dirección y envío
  shipping_address_id: number | null;
  billing_address_id: number | null;
  shipping_method: string | null;
  tracking_number: string | null;

  // Pago
  payment_method: PaymentMethod | null;
  payment_status: string;
  payment_gateway: string | null; // stripe, paypal, etc.
  gateway_transaction_id: string | null;

  // Notas y metadata
  customer_notes: string | null;
  admin_notes: string | null;
  metadata: Record<string, any>;

  // Auditoría
  created_by: string | null; // UUID
  updated_by: string | null; // UUID
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== TABLA: ORDER_ITEMS ====================

export interface DatabaseOrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_variant_id: number;

  // Información del producto al momento de la compra
  product_name: string;
  product_sku: string | null;
  variant_sku: string | null;
  product_image: string | null; // URL de la imagen principal al momento de compra
  variant_attributes: Record<string, any>; // color, talla, etc.

  // Cantidades y precios
  quantity: number;
  unit_price: number;
  total_price: number; // Generado siempre como quantity * unit_price
  discount_amount: number;
  tax_amount: number;

  // Estado del item
  status: string; // pending, processing, shipped, delivered, cancelled
  fulfillment_status: string; // pending, processing, shipped, delivered

  // Metadatos
  metadata: Record<string, any>;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

// ==================== UTILIDADES DE BASE DE DATOS ====================

/**
 * Tipo que representa cualquier fila de la base de datos
 * Con propiedades comunes como created_at y updated_at
 */
export interface DatabaseRow {
  created_at: string; // timestamp
  updated_at?: string; // timestamp (opcional)
}

/**
 * Tipos de joins útiles
 */
export interface ProductWithVariants extends DatabaseProduct {
  variants: DatabaseProductVariant[];
  images: DatabaseProductImage[];
  brand: DatabaseBrand | null;
  category: DatabaseCategory | null;
  condition: DatabaseProductCondition | null;
}

export interface CartWithItems extends DatabaseCart {
  items: (DatabaseCartItem & {
    product_variant: DatabaseProductVariant & {
      product: DatabaseProduct;
    };
  })[];
}

export interface OrderWithItems extends DatabaseOrder {
  items: DatabaseOrderItem[];
  user: DatabaseProfile | null;
  shipping_address: DatabaseAddress | null;
  billing_address: DatabaseAddress | null;
}