import { BaseService } from './BaseService';
import {
  DatabaseInventoryLog,
  ProductVariantWithInventory,
  InventoryChangeType,
  InventoryAdjustmentForm,
  InventoryStatus
} from '@/lib/database.types';

/**
 * Servicio mejorado para gestión de inventario con MCP validation
 */
class InventoryService extends BaseService<DatabaseInventoryLog> {
  constructor() {
    super('inventory_logs');
  }

  /**
   * Obtiene el inventario completo con información de productos
   */
  async getInventory() {
    try {
      // Usar solo los campos que realmente existen en la tabla
      const { data, error } = await this.supabase
        .from('product_variants')
        .select(`
          id,
          product_id,
          size_id,
          sku,
          barcode,
          color,
          color_code,
          stock_quantity,
          price_override,
          cost_price_override,
          track_inventory,
          allow_backorder,
          is_active,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading inventory:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInventory:', error);
      return [];
    }
  }

  /**
   * Obtiene variantes de un producto específico
   */
  async getProductVariants(productId: string) {
    try {
      const { data, error } = await this.supabase
        .from('product_variants')
        .select(`
          *,
          sizes (
            id,
            name
          ),
          colors (
            id,
            name,
            hex
          )
        `)
        .eq('product_id', productId)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading product variants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProductVariants:', error);
      return [];
    }
  }

  /**
   * Actualiza el stock de una variante
   */
  async updateStock(variantId: string, quantity: number, operation: 'set' | 'add' | 'subtract' = 'set') {
    try {
      let newQuantity = quantity;
      if (operation === 'add' || operation === 'subtract') {
        // Obtener cantidad actual
        const { data: currentVariant } = await this.supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variantId)
          .single();

        if (currentVariant) {
          if (operation === 'add') {
            newQuantity = currentVariant.stock_quantity + quantity;
          } else {
            newQuantity = Math.max(0, currentVariant.stock_quantity - quantity);
          }
        }
      }

      const { error } = await this.supabase
        .from('product_variants')
        .update({
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', variantId);

      if (error) {
        console.error('Error updating stock:', error);
        return { success: false, error };
      }

      return { success: true, newQuantity };
    } catch (error) {
      console.error('Error in updateStock:', error);
      return { success: false, error };
    }
  }

  /**
   * Crea una nueva variante de producto
   */
  async createVariant(variantData: {
    product_id: string;
    sku: string;
    size_id?: string;
    color_id?: string;
    stock_quantity: number;
    price_override?: number;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('product_variants')
        .insert({
          product_id: variantData.product_id,
          sku: variantData.sku,
          size_id: variantData.size_id || null,
          color_id: variantData.color_id || null,
          stock_quantity: variantData.stock_quantity,
          price_override: variantData.price_override || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating variant:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createVariant:', error);
      return { success: false, error };
    }
  }

  /**
   * Elimina una variante (soft delete)
   */
  async deleteVariant(variantId: string) {
    try {
      const { error } = await this.supabase
        .from('product_variants')
        .update({ is_active: false })
        .eq('id', variantId);

      if (error) {
        console.error('Error deleting variant:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteVariant:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene estadísticas de inventario
   */
  async getInventoryStats() {
    try {
      const { data: lowStock } = await this.supabase
        .from('product_variants')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .lt('stock_quantity', 10);

      const { data: outOfStock } = await this.supabase
        .from('product_variants')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('stock_quantity', 0);

      const { data: totalVariants } = await this.supabase
        .from('product_variants')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        lowStock: lowStock?.length || 0,
        outOfStock: outOfStock?.length || 0,
        totalVariants: totalVariants?.length || 0
      };
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        lowStock: 0,
        outOfStock: 0,
        totalVariants: 0
      };
    }
  }

  /**
   * Obtiene productos con bajo stock
   */
  async getLowStockProducts() {
    try {
      const { data, error } = await this.supabase
        .from('product_variants')
        .select(`
          *,
          products (
            id,
            name,
            sku
          )
        `)
        .eq('is_active', true)
        .lt('stock_quantity', 10)
        .order('stock_quantity', { ascending: true });

      if (error) {
        console.error('Error loading low stock products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLowStockProducts:', error);
      return [];
    }
  }

  /**
   * Genera SKU automático para variante
   */
  generateVariantSKU(productSKU: string, size?: string, color?: string): string {
    const parts = [productSKU];
    if (size) parts.push(size.toUpperCase());
    if (color) parts.push(color.toUpperCase().substring(0, 3));
    return parts.join('-');
  }

  // ============================================
  // NUEVOS MÉTODOS MCP (MCP Enhanced)
  // ============================================

  /**
   * Obtiene inventario con estado completo para una variante
   */
  async getProductVariantInventory(variantId: number): Promise<ProductVariantWithInventory | null> {
    try {
      // Get product variant with current stock
      const { data: variant, error: variantError } = await this.supabase
        .from('product_variants')
        .select('*')
        .eq('id', variantId)
        .single();

      if (variantError) throw variantError;

      // Get latest inventory log to determine current stock
      const { data: latestLog, error: logError } = await this.supabase
        .from('inventory_logs')
        .select('new_quantity, created_at')
        .eq('product_variant_id', variantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const currentStock = latestLog?.new_quantity || variant.stock_quantity || 0;
      const lowStockThreshold = 10; // This could be a setting

      const variantWithInventory: ProductVariantWithInventory = {
        ...variant,
        current_stock: currentStock,
        stock_status: this.getStockStatus(currentStock, lowStockThreshold),
        last_updated: latestLog?.created_at || null,
        low_stock_threshold: lowStockThreshold
      };

      return variantWithInventory;
    } catch (error) {
      console.error(`Error fetching inventory for variant ${variantId}:`, error);
      throw error;
    }
  }

  /**
   * Ajusta inventario con logging completo
   */
  async adjustInventory(formData: InventoryAdjustmentForm): Promise<DatabaseInventoryLog> {
    try {
      const currentInventory = await this.getProductVariantInventory(formData.product_variant_id);
      if (!currentInventory) {
        throw new Error('Product variant not found');
      }

      let newQuantity: number;
      let change: number;

      switch (formData.change_type) {
        case 'increase':
          change = Math.abs(formData.quantity);
          newQuantity = currentInventory.current_stock + change;
          break;
        case 'decrease':
          change = -Math.abs(formData.quantity);
          newQuantity = currentInventory.current_stock - change;
          if (newQuantity < 0) {
            throw new Error('Cannot decrease inventory below zero');
          }
          break;
        case 'set':
          newQuantity = formData.quantity;
          change = newQuantity - currentInventory.current_stock;
          break;
        default:
          throw new Error('Invalid change type');
      }

      const logData = {
        product_variant_id: formData.product_variant_id,
        change,
        previous_quantity: currentInventory.current_stock,
        new_quantity: newQuantity,
        reason: formData.reason,
        reference_id: null,
        reference_type: 'manual_adjustment',
        notes: formData.notes || null,
        cost_price: formData.cost_price || null,
        created_by: await this.getCurrentUserId()
      };

      const { data, error } = await this.supabase
        .from('inventory_logs')
        .insert(logData)
        .select()
        .single();

      if (error) throw error;

      // Update product variant stock quantity
      await this.supabase
        .from('product_variants')
        .update({ stock_quantity: newQuantity })
        .eq('id', formData.product_variant_id);

      // Log the activity
      await this.logActivity('updated', 'inventory', data.id,
        { previous_quantity: currentInventory.current_stock },
        { new_quantity: newQuantity, change, reason: formData.reason });

      return data;
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      throw error;
    }
  }

  /**
   * Registra venta de inventario
   */
  async recordSale(productVariantId: number, quantity: number, orderId: number): Promise<void> {
    try {
      const currentInventory = await this.getProductVariantInventory(productVariantId);
      if (!currentInventory) {
        throw new Error('Product variant not found');
      }

      if (currentInventory.current_stock < quantity) {
        throw new Error('Insufficient inventory');
      }

      const newQuantity = currentInventory.current_stock - quantity;
      const change = -quantity;

      const logData = {
        product_variant_id: productVariantId,
        change,
        previous_quantity: currentInventory.current_stock,
        new_quantity: newQuantity,
        reason: 'sale' as InventoryChangeType,
        reference_id: orderId,
        reference_type: 'order',
        notes: `Sale from order ${orderId}`,
        created_by: await this.getCurrentUserId()
      };

      const { error } = await this.supabase
        .from('inventory_logs')
        .insert(logData);

      if (error) throw error;

      // Update product variant stock quantity
      await this.supabase
        .from('product_variants')
        .update({ stock_quantity: newQuantity })
        .eq('id', productVariantId);
    } catch (error) {
      console.error('Error recording sale:', error);
      throw error;
    }
  }

  /**
   * Obtiene logs de inventario
   */
  async getInventoryLogs(variantId?: number, limit: number = 50): Promise<DatabaseInventoryLog[]> {
    try {
      let query = this.supabase
        .from('inventory_logs')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (variantId) {
        query = query.eq('product_variant_id', variantId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      throw error;
    }
  }

  /**
   * Obtiene resumen de inventario
   */
  async getInventorySummary(): Promise<{
    total_variants: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    total_value: number;
  }> {
    try {
      const allInventories = await this.getInventory();

      const summary = allInventories.reduce((acc, inventory) => {
        acc.total_variants++;

        const stock = inventory.stock_quantity || 0;
        const status = this.getStockStatus(stock, 10);

        switch (status) {
          case 'in_stock':
            acc.in_stock++;
            break;
          case 'low_stock':
            acc.low_stock++;
            break;
          case 'out_of_stock':
            acc.out_of_stock++;
            break;
        }

        // Calculate inventory value (estimate 60% of price as cost)
        const unitCost = (inventory.price_override || inventory.products?.[0]?.base_price || 0) * 0.6;
        acc.total_value += stock * unitCost;

        return acc;
      }, {
        total_variants: 0,
        in_stock: 0,
        low_stock: 0,
        out_of_stock: 0,
        total_value: 0
      });

      return summary;
    } catch (error) {
      console.error('Error generating inventory summary:', error);
      throw error;
    }
  }

  /**
   * Valida inventario con MCP
   */
  async validateInventoryWithMCP(): Promise<{
    valid: boolean;
    errors: string[];
    inconsistencies: Array<{
      variant_id: number;
      variant_stock: number;
      calculated_stock: number;
    }>
  }> {
    const errors: string[] = [];
    const inconsistencies: Array<{
      variant_id: number;
      variant_stock: number;
      calculated_stock: number;
    }> = [];

    try {
      // Check if tables exist
      const { error: variantError } = await this.supabase
        .from('product_variants')
        .select('id')
        .limit(1);

      if (variantError) {
        errors.push(`Product variants table error: ${variantError.message}`);
      }

      const { error: logError } = await this.supabase
        .from('inventory_logs')
        .select('id')
        .limit(1);

      if (logError) {
        errors.push(`Inventory logs table error: ${logError.message}`);
      }

      if (errors.length > 0) {
        return { valid: false, errors, inconsistencies };
      }

      // Check for inconsistencies
      const { data: variants, error: fetchError } = await this.supabase
        .from('product_variants')
        .select('id, stock_quantity')
        .limit(100);

      if (fetchError) throw fetchError;

      for (const variant of variants || []) {
        try {
          const inventory = await this.getProductVariantInventory(variant.id);
          if (inventory && inventory.current_stock !== variant.stock_quantity) {
            inconsistencies.push({
              variant_id: variant.id,
              variant_stock: variant.stock_quantity,
              calculated_stock: inventory.current_stock
            });
          }
        } catch (error) {
          continue;
        }
      }

      return {
        valid: errors.length === 0 && inconsistencies.length === 0,
        errors,
        inconsistencies
      };
    } catch (error) {
      errors.push(`MCP validation error: ${error}`);
      return { valid: false, errors, inconsistencies };
    }
  }

  /**
   * Helper method to determine stock status
   */
  private getStockStatus(quantity: number, lowStockThreshold: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= lowStockThreshold) return 'low_stock';
    return 'in_stock';
  }
}

// Exportar singleton
export const inventoryService = new InventoryService();
export { InventoryService };
export default InventoryService;