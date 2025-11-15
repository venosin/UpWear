import { createClient } from '@supabase/supabase-js';

/**
 * Servicio para gestionar operaciones de inventario
 */
class InventoryService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }

  /**
   * Obtiene el inventario completo con información de productos
   */
  async getInventory() {
    try {
      const { data, error } = await this.supabase
        .from('product_variants')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            is_active
          ),
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
        .order('created_at', { ascending: false });

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
}

// Exportar singleton
export const inventoryService = new InventoryService();
export { InventoryService };
export default InventoryService;