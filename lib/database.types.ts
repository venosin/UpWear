// ============================================
// CONFIGURATION MANAGEMENT TYPES
// ============================================

export type SettingValueType = 'string' | 'number' | 'boolean' | 'json';
export type SettingCategory = 'general' | 'ecommerce' | 'payment' | 'shipping' | 'email' | 'social' | 'seo' | 'inventory' | 'maintenance';
export type InputType = 'text' | 'textarea' | 'number' | 'email' | 'url' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'password' | 'file';

export interface DatabaseSiteSetting {
  id: number;
  key: string;
  category: SettingCategory;
  value: string | null;
  value_type: SettingValueType;
  default_value: string | null;
  display_name: string;
  description: string | null;
  placeholder: string | null;
  is_required: boolean;
  is_public: boolean;
  validation_rules: Record<string, any>;
  input_type: InputType;
  input_options: Record<string, any>;
  group_name: string | null;
  sort_order: number;
  last_modified_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicSiteSetting {
  key: string;
  value: string | null;
  value_type: SettingValueType;
  default_value: string | null;
}

export interface AdminSettingByCategory {
  id: number;
  key: string;
  category: SettingCategory;
  display_name: string;
  description: string | null;
  value: string | null;
  default_value: string | null;
  value_type: SettingValueType;
  is_public: boolean;
  input_type: InputType;
  input_options: Record<string, any>;
  group_name: string | null;
  sort_order: number;
  is_required: boolean;
  placeholder: string | null;
  validation_rules: Record<string, any>;
  updated_at: string;
}

// ============================================
// COUPONS MANAGEMENT TYPES
// ============================================

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';
export type CouponStatus = 'active' | 'inactive' | 'expired' | 'limited';

export interface DatabaseCoupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  minimum_amount: number | null;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  used_count: number;
  valid_from: string | null;
  valid_to: string | null;
  applicable_products: number[] | null;
  applicable_categories: number[] | null;
  excluded_products: number[] | null;
  excluded_categories: number[] | null;
  first_time_customers_only: boolean;
  is_active: boolean;
  is_public: boolean;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCouponUsage {
  id: number;
  coupon_id: number;
  user_id: string | null;
  order_id: number;
  discount_amount: number;
  order_total: number;
  created_at: string;
}

// ============================================
// INVENTORY MANAGEMENT TYPES
// ============================================

export type InventoryChangeType = 'sale' | 'restock' | 'return' | 'adjustment' | 'damage' | 'transfer' | 'manual_adjustment';

export interface DatabaseInventoryLog {
  id: number;
  product_variant_id: number;
  change: number;
  previous_quantity: number | null;
  new_quantity: number | null;
  reason: InventoryChangeType;
  reference_id: number | null;
  reference_type: string | null;
  notes: string | null;
  cost_price: number | null;
  created_by: string | null;
  created_at: string;
}

// Extended ProductVariant with inventory info
export interface ProductVariantWithInventory {
  id: number;
  product_id: number | null;
  size_id: number | null;
  sku: string | null;
  barcode: string | null;
  color: string | null;
  color_code: string | null;
  material: string | null;
  weight: number | null;
  additional_images: string[] | null;
  price_override: number | null;
  cost_price_override: number | null;
  stock_quantity: number | null;
  min_stock_level: number | null;
  track_inventory: boolean | null;
  allow_backorder: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  metadata: any | null;
  created_by: string | null;
  updated_by: string | null;
  color_id: number | null;
  created_at: string | null;
  updated_at: string | null;

  // Computed fields
  current_stock: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_updated: string | null;
  low_stock_threshold: number;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export type EventType = 'page_view' | 'add_to_cart' | 'remove_from_cart' | 'purchase' | 'search' | 'product_view' | 'category_view' | 'checkout_start' | 'checkout_complete' | 'user_register' | 'user_login';

export interface DatabaseAnalyticsEvent {
  id: number;
  event_type: EventType;
  user_id: string | null;
  session_id: string | null;
  properties: Record<string, any>;
  created_at: string;
}

export type AdminAction = 'created' | 'updated' | 'deleted' | 'viewed' | 'exported' | 'imported' | 'published' | 'unpublished' | 'approved' | 'rejected';

export interface DatabaseAdminActivityLog {
  id: number;
  admin_id: string;
  action: AdminAction;
  entity: string;
  entity_id: number | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  notes: string | null;
  created_at: string;
}

// ============================================
// FORM TYPES FOR UI COMPONENTS
// ============================================

export interface SiteSettingForm {
  id?: number;
  key: string;
  category: SettingCategory;
  display_name: string;
  description?: string;
  value: string | number | boolean | any[];
  value_type: SettingValueType;
  default_value?: string | number | boolean;
  is_public?: boolean;
  is_required?: boolean;
  input_type: InputType;
  input_options?: Record<string, any>;
  group_name?: string;
  sort_order?: number;
  placeholder?: string;
  validation_rules?: Record<string, any>;
}

export interface CouponForm {
  id?: number;
  code: string;
  name: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  minimum_amount?: number;
  usage_limit?: number;
  usage_limit_per_user?: number;
  valid_from?: Date | null;
  valid_to?: Date | null;
  applicable_products?: number[];
  applicable_categories?: number[];
  excluded_products?: number[];
  excluded_categories?: number[];
  first_time_customers_only?: boolean;
  is_active?: boolean;
  is_public?: boolean;
}

export interface InventoryAdjustmentForm {
  product_variant_id: number;
  change_type: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: InventoryChangeType;
  notes?: string;
  cost_price?: number;
}

// ============================================
// DASHBOARD AND ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_revenue: number;
  today_revenue: number;
  total_customers: number;
  new_customers_today: number;
  active_coupons: number;
  used_coupons_today: number;
}

export interface SalesAnalytics {
  date: string;
  orders: number;
  revenue: number;
  customers: number;
  average_order_value: number;
}

export interface ProductAnalytics {
  product_id: number;
  product_name: string;
  views: number;
  sales: number;
  revenue: number;
  conversion_rate: number;
  stock_quantity: number;
}

export interface CouponAnalytics {
  coupon_id: number;
  coupon_code: string;
  usage_count: number;
  discount_amount: number;
  revenue_generated: number;
  average_order_value: number;
}

// ============================================
// UTILITY TYPES
// ============================================

export type SettingGroup = {
  name: string;
  display_name: string;
  settings: AdminSettingByCategory[];
};

export type SettingsByCategory = {
  [category in SettingCategory]: SettingGroup[];
};

export type CouponValidationResult = {
  valid: boolean;
  coupon?: DatabaseCoupon;
  discount_amount: number;
  error_message?: string;
};

export type InventoryStatus = {
  product_variant_id: number;
  current_quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  needs_restock: boolean;
  last_change: string | null;
};