import { createClient } from '@supabase/supabase-js';

/**
 * Servicio para gestionar operaciones CRUD de cupones
 */
class CouponService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }

  /**
   * Obtiene todos los cupones
   */
  async getCoupons() {
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading coupons:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCoupons:', error);
      return [];
    }
  }

  /**
   * Crea un nuevo cupón
   */
  async createCoupon(couponData: {
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    minimum_amount?: number;
    usage_limit?: number;
    usage_count?: number;
    expires_at?: string;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .insert({
          code: couponData.code.toUpperCase(),
          type: couponData.type,
          value: couponData.value,
          minimum_amount: couponData.minimum_amount || null,
          usage_limit: couponData.usage_limit || null,
          usage_count: couponData.usage_count || 0,
          expires_at: couponData.expires_at || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating coupon:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createCoupon:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualiza un cupón existente
   */
  async updateCoupon(couponId: string, updateData: {
    code?: string;
    type?: 'percentage' | 'fixed_amount';
    value?: number;
    minimum_amount?: number;
    usage_limit?: number;
    expires_at?: string;
    is_active?: boolean;
  }) {
    try {
      const updateFields = { ...updateData };
      if (updateFields.code) {
        updateFields.code = updateFields.code.toUpperCase();
      }

      const { error } = await this.supabase
        .from('coupons')
        .update(updateFields)
        .eq('id', couponId);

      if (error) {
        console.error('Error updating coupon:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateCoupon:', error);
      return { success: false, error };
    }
  }

  /**
   * Elimina un cupón (soft delete)
   */
  async deleteCoupon(couponId: string) {
    try {
      const { error } = await this.supabase
        .from('coupons')
        .update({ is_active: false })
        .eq('id', couponId);

      if (error) {
        console.error('Error deleting coupon:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteCoupon:', error);
      return { success: false, error };
    }
  }

  /**
   * Valida si un cupón es usable
   */
  async validateCoupon(code: string, cartTotal: number) {
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { valid: false, reason: 'Cupón no encontrado o inactivo' };
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, reason: 'Cupón expirado' };
      }

      // Check minimum amount
      if (data.minimum_amount && cartTotal < data.minimum_amount) {
        return { valid: false, reason: `Mínimo de compra requerido: $${data.minimum_amount}` };
      }

      // Check usage limit
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        return { valid: false, reason: 'Límite de usos alcanzado' };
      }

      return { valid: true, coupon: data };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { valid: false, reason: 'Error al validar cupón' };
    }
  }

  /**
   * Incrementa el contador de uso de un cupón
   */
  async incrementUsage(couponId: string) {
    try {
      const { error } = await this.supabase
        .from('coupons')
        .update({ usage_count: this.supabase.rpc('increment', { x: 1, column_name: 'usage_count' }) })
        .eq('id', couponId);

      if (error) {
        console.error('Error incrementing usage:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene estadísticas de cupones
   */
  async getCouponStats() {
    try {
      const { data: activeCoupons } = await this.supabase
        .from('coupons')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: expiredCoupons } = await this.supabase
        .from('coupons')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .lt('expires_at', new Date().toISOString());

      const { data: totalUsage } = await this.supabase
        .from('coupons')
        .select('usage_count');

      const totalUsageCount = totalUsage?.reduce((sum, coupon) => sum + coupon.usage_count, 0) || 0;

      return {
        activeCoupons: activeCoupons?.length || 0,
        expiredCoupons: expiredCoupons?.length || 0,
        totalUsage: totalUsageCount
      };
    } catch (error) {
      console.error('Error getting coupon stats:', error);
      return {
        activeCoupons: 0,
        expiredCoupons: 0,
        totalUsage: 0
      };
    }
  }
}

// Exportar singleton
export const couponService = new CouponService();
export { CouponService };
export default CouponService;