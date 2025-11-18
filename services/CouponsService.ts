import { BaseService } from './BaseService';
import {
  DatabaseCoupon,
  DatabaseCouponUsage,
  CouponForm,
  DiscountType,
  CouponValidationResult,
  CouponAnalytics
} from '@/lib/database.types';

export class CouponsService extends BaseService<DatabaseCoupon> {
  constructor() {
    super('coupons');
  }

  // ============================================
  // COUPONS CRUD OPERATIONS
  // ============================================

  async getAllCoupons(): Promise<DatabaseCoupon[]> {
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }

  async getActiveCoupons(): Promise<DatabaseCoupon[]> {
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .or('valid_from.is.null,valid_from.lte.now()')
        .or('valid_to.is.null,valid_to.gte.now()')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      throw error;
    }
  }

  async getPublicCoupons(): Promise<DatabaseCoupon[]> {
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .or('valid_from.is.null,valid_from.lte.now()')
        .or('valid_to.is.null,valid_to.gte.now()')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching public coupons:', error);
      throw error;
    }
  }

  async getCouponById(id: number): Promise<DatabaseCoupon | null> {
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*, profiles(email, full_name)')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching coupon ${id}:`, error);
      throw error;
    }
  }

  async getCouponByCode(code: string): Promise<DatabaseCoupon | null> {
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching coupon ${code}:`, error);
      throw error;
    }
  }

  async createCoupon(formData: CouponForm): Promise<DatabaseCoupon> {
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        minimum_amount: formData.minimum_amount || null,
        usage_limit: formData.usage_limit || null,
        usage_limit_per_user: formData.usage_limit_per_user || null,
        valid_from: formData.valid_from?.toISOString() || null,
        valid_to: formData.valid_to?.toISOString() || null,
        applicable_products: formData.applicable_products || null,
        applicable_categories: formData.applicable_categories || null,
        excluded_products: formData.excluded_products || null,
        excluded_categories: formData.excluded_categories || null,
        first_time_customers_only: formData.first_time_customers_only || false,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        is_public: formData.is_public !== undefined ? formData.is_public : true,
        metadata: {},
        created_by: await this.getCurrentUserId()
      };

      const { data, error } = await this.supabase
        .from('coupons')
        .insert(couponData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Coupon code already exists');
        }
        throw error;
      }

      // Log the activity
      await this.logActivity('created', 'coupon', data.id, null, data);

      return data;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  }

  async updateCoupon(id: number, formData: Partial<CouponForm>): Promise<DatabaseCoupon> {
    try {
      const oldCoupon = await this.getCouponById(id);
      if (!oldCoupon) throw new Error('Coupon not found');

      const updateData: any = {};

      if (formData.name !== undefined) updateData.name = formData.name;
      if (formData.description !== undefined) updateData.description = formData.description;
      if (formData.discount_type !== undefined) updateData.discount_type = formData.discount_type;
      if (formData.discount_value !== undefined) updateData.discount_value = formData.discount_value;
      if (formData.minimum_amount !== undefined) updateData.minimum_amount = formData.minimum_amount;
      if (formData.usage_limit !== undefined) updateData.usage_limit = formData.usage_limit;
      if (formData.usage_limit_per_user !== undefined) updateData.usage_limit_per_user = formData.usage_limit_per_user;
      if (formData.valid_from !== undefined) updateData.valid_from = formData.valid_from?.toISOString() || null;
      if (formData.valid_to !== undefined) updateData.valid_to = formData.valid_to?.toISOString() || null;
      if (formData.applicable_products !== undefined) updateData.applicable_products = formData.applicable_products;
      if (formData.applicable_categories !== undefined) updateData.applicable_categories = formData.applicable_categories;
      if (formData.excluded_products !== undefined) updateData.excluded_products = formData.excluded_products;
      if (formData.excluded_categories !== undefined) updateData.excluded_categories = formData.excluded_categories;
      if (formData.first_time_customers_only !== undefined) updateData.first_time_customers_only = formData.first_time_customers_only;
      if (formData.is_active !== undefined) updateData.is_active = formData.is_active;
      if (formData.is_public !== undefined) updateData.is_public = formData.is_public;

      const { data, error } = await this.supabase
        .from('coupons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await this.logActivity('updated', 'coupon', id, oldCoupon, data);

      return data;
    } catch (error) {
      console.error(`Error updating coupon ${id}:`, error);
      throw error;
    }
  }

  async deleteCoupon(id: number): Promise<void> {
    try {
      const coupon = await this.getCouponById(id);
      if (!coupon) throw new Error('Coupon not found');

      const { error } = await this.supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log the activity
      await this.logActivity('deleted', 'coupon', id, coupon, null);
    } catch (error) {
      console.error(`Error deleting coupon ${id}:`, error);
      throw error;
    }
  }

  // ============================================
  // COUPON VALIDATION
  // ============================================

  async validateCoupon(
    code: string,
    userId?: string,
    orderAmount: number = 0,
    productIds: number[] = [],
    categoryIds: number[] = []
  ): Promise<CouponValidationResult> {
    try {
      const coupon = await this.getCouponByCode(code);
      if (!coupon) {
        return {
          valid: false,
          discount_amount: 0,
          error_message: 'Cupón no encontrado'
        };
      }

      // Check if coupon is active
      if (!coupon.is_active) {
        return {
          valid: false,
          coupon,
          discount_amount: 0,
          error_message: 'Cupón inactivo'
        };
      }

      // Check validity dates
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return {
          valid: false,
          coupon,
          discount_amount: 0,
          error_message: 'Cupón aún no es válido'
        };
      }

      if (coupon.valid_to && new Date(coupon.valid_to) < now) {
        return {
          valid: false,
          coupon,
          discount_amount: 0,
          error_message: 'Cupón expirado'
        };
      }

      // Check minimum amount
      if (coupon.minimum_amount && orderAmount < coupon.minimum_amount) {
        return {
          valid: false,
          coupon,
          discount_amount: 0,
          error_message: `Monto mínimo requerido: $${coupon.minimum_amount}`
        };
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return {
          valid: false,
          coupon,
          discount_amount: 0,
          error_message: 'Cupón ha alcanzado su límite de uso'
        };
      }

      // Check per-user limit if userId provided
      if (userId && coupon.usage_limit_per_user) {
        const userUsageCount = await this.getUserCouponUsageCount(coupon.id, userId);
        if (userUsageCount >= coupon.usage_limit_per_user) {
          return {
            valid: false,
            coupon,
            discount_amount: 0,
            error_message: 'Has alcanzado el límite de uso para este cupón'
          };
        }
      }

      // Check first-time customer restriction
      if (coupon.first_time_customers_only && userId) {
        const isFirstTimeCustomer = await this.isFirstTimeCustomer(userId);
        if (!isFirstTimeCustomer) {
          return {
            valid: false,
            coupon,
            discount_amount: 0,
            error_message: 'Cupón válido solo para primer compra'
          };
        }
      }

      // Check product/category restrictions
      if (coupon.applicable_products && coupon.applicable_products.length > 0) {
        const hasApplicableProduct = productIds.some(id => coupon.applicable_products!.includes(id));
        if (!hasApplicableProduct) {
          return {
            valid: false,
            coupon,
            discount_amount: 0,
            error_message: 'Cupón no aplica a los productos seleccionados'
          };
        }
      }

      if (coupon.excluded_products && coupon.excluded_products.length > 0) {
        const hasExcludedProduct = productIds.some(id => coupon.excluded_products!.includes(id));
        if (hasExcludedProduct) {
          return {
            valid: false,
            coupon,
            discount_amount: 0,
            error_message: 'Cupón no aplica a algunos productos en el carrito'
          };
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      switch (coupon.discount_type) {
        case 'percentage':
          discountAmount = orderAmount * (coupon.discount_value / 100);
          break;
        case 'fixed_amount':
          discountAmount = Math.min(coupon.discount_value, orderAmount);
          break;
        case 'free_shipping':
          discountAmount = 0; // Handled separately in shipping calculation
          break;
      }

      return {
        valid: true,
        coupon,
        discount_amount: discountAmount
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        discount_amount: 0,
        error_message: 'Error validando cupón'
      };
    }
  }

  // ============================================
  // COUPON USAGE TRACKING
  // ============================================

  async useCoupon(couponId: number, userId: string, orderId: number, orderTotal: number, discountAmount: number): Promise<void> {
    try {
      // Record coupon usage
      const { error: usageError } = await this.supabase
        .from('coupon_usage')
        .insert({
          coupon_id: couponId,
          user_id: userId,
          order_id: orderId,
          discount_amount: discountAmount,
          order_total: orderTotal
        });

      if (usageError) throw usageError;

      // Update coupon usage count
      const { error: updateError } = await this.supabase
        .from('coupons')
        .update({
          used_count: this.supabase.raw('used_count + 1')
        })
        .eq('id', couponId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error recording coupon usage:', error);
      throw error;
    }
  }

  async getCouponUsage(couponId: number): Promise<DatabaseCouponUsage[]> {
    try {
      const { data, error } = await this.supabase
        .from('coupon_usage')
        .select('*, profiles(email, full_name), orders(id, created_at)')
        .eq('coupon_id', couponId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching usage for coupon ${couponId}:`, error);
      throw error;
    }
  }

  async getUserCouponUsageCount(couponId: number, userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('coupon_usage')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', couponId)
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting user coupon usage count:', error);
      return 0;
    }
  }

  // ============================================
  // COUPON ANALYTICS
  // ============================================

  async getCouponAnalytics(couponId: number): Promise<CouponAnalytics> {
    try {
      const { data: usage, error } = await this.supabase
        .from('coupon_usage')
        .select('discount_amount, order_total')
        .eq('coupon_id', couponId);

      if (error) throw error;

      const totalUsage = usage?.length || 0;
      const totalDiscount = usage?.reduce((sum, use) => sum + use.discount_amount, 0) || 0;
      const totalRevenue = usage?.reduce((sum, use) => sum + use.order_total, 0) || 0;
      const averageOrderValue = totalUsage > 0 ? totalRevenue / totalUsage : 0;

      return {
        coupon_id: couponId,
        coupon_code: '', // Will be filled by caller
        usage_count: totalUsage,
        discount_amount: totalDiscount,
        revenue_generated: totalRevenue,
        average_order_value: averageOrderValue
      };
    } catch (error) {
      console.error(`Error getting analytics for coupon ${couponId}:`, error);
      throw error;
    }
  }

  async getAllCouponsAnalytics(): Promise<CouponAnalytics[]> {
    try {
      const coupons = await this.getAllCoupons();
      const analytics = await Promise.all(
        coupons.map(async (coupon) => {
          const analytic = await this.getCouponAnalytics(coupon.id);
          return {
            ...analytic,
            coupon_code: coupon.code
          };
        })
      );
      return analytics;
    } catch (error) {
      console.error('Error getting all coupons analytics:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private async isFirstTimeCustomer(userId: string): Promise<boolean> {
    try {
      const { count, error } = await this.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'cancelled');

      if (error) throw error;
      return (count || 0) === 0;
    } catch (error) {
      console.error('Error checking if user is first-time customer:', error);
      return false;
    }
  }

  async validateCouponCode(code: string, excludeId?: number): Promise<boolean> {
    try {
      let query = this.supabase
        .from('coupons')
        .select('id')
        .eq('code', code.toUpperCase());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error validating coupon code:', error);
      return false;
    }
  }

  async generateUniqueCouponCode(baseName: string): Promise<string> {
    let code = baseName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
    let counter = 1;
    let uniqueCode = code;

    while (!(await this.validateCouponCode(uniqueCode))) {
      uniqueCode = `${code}${counter}`.substring(0, 12);
      counter++;
    }

    return uniqueCode;
  }

  // ============================================
  // VALIDATION WITH MCP
  // ============================================

  async validateCouponsWithMCP(): Promise<{
    valid: boolean;
    errors: string[];
    issues: Array<{
      coupon_id: number;
      issue: string;
      severity: 'warning' | 'error';
    }>
  }> {
    const errors: string[] = [];
    const issues: Array<{
      coupon_id: number;
      issue: string;
      severity: 'warning' | 'error';
    }> = [];

    try {
      // Check if tables exist
      const { error: couponError } = await this.supabase
        .from('coupons')
        .select('id')
        .limit(1);

      if (couponError) {
        errors.push(`Coupons table error: ${couponError.message}`);
        return { valid: false, errors, issues };
      }

      const { error: usageError } = await this.supabase
        .from('coupon_usage')
        .select('id')
        .limit(1);

      if (usageError) {
        errors.push(`Coupon usage table error: ${usageError.message}`);
      }

      // Check for issues in coupons
      const { data: coupons, error: fetchError } = await this.supabase
        .from('coupons')
        .select('id, code, valid_from, valid_to, usage_limit, used_count, is_active')
        .limit(100);

      if (fetchError) throw fetchError;

      for (const coupon of coupons || []) {
        // Check for expired coupons still active
        if (coupon.valid_to && new Date(coupon.valid_to) < new Date() && coupon.is_active) {
          issues.push({
            coupon_id: coupon.id,
            issue: 'Coupon has expired but is still active',
            severity: 'warning'
          });
        }

        // Check for coupons with usage limit reached but still active
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit && coupon.is_active) {
          issues.push({
            coupon_id: coupon.id,
            issue: 'Coupon has reached usage limit but is still active',
            severity: 'warning'
          });
        }

        // Check for future valid dates
        if (coupon.valid_from && new Date(coupon.valid_from) > new Date() && !coupon.is_active) {
          issues.push({
            coupon_id: coupon.id,
            issue: 'Coupon has future valid date but is inactive',
            severity: 'warning'
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        issues
      };
    } catch (error) {
      errors.push(`MCP validation error: ${error}`);
      return { valid: false, errors, issues };
    }
  }
}

// Export singleton instance
export const couponsService = new CouponsService();