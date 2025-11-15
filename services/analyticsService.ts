import { createClient } from '@supabase/supabase-js';

/**
 * Servicio para gestionar estadísticas y analíticas
 */
class AnalyticsService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }

  /**
   * Obtiene estadísticas generales del dashboard
   */
  async getDashboardStats() {
    try {
      const [
        productsResult,
        activeProductsResult,
        ordersResult,
        revenueResult,
        customersResult
      ] = await Promise.all([
        // Total products
        this.supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),

        // Active products
        this.supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('is_featured', true),

        // Orders this month
        this.supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

        // Revenue this month (simulated - orders table may not exist yet)
        this.supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

        // Customers this month
        this.supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      const totalProducts = productsResult.count || 0;
      const activeProducts = activeProductsResult.count || 0;
      const ordersThisMonth = ordersResult.count || 0;
      const customersThisMonth = customersResult.count || 0;

      // Calculate revenue from orders
      const revenueThisMonth = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      return {
        totalProducts,
        activeProducts,
        ordersThisMonth,
        revenueThisMonth,
        customersThisMonth
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        ordersThisMonth: 0,
        revenueThisMonth: 0,
        customersThisMonth: 0
      };
    }
  }

  /**
   * Obtiene estadísticas de productos
   */
  async getProductStats() {
    try {
      const [
        totalProducts,
        featuredProducts,
        lowStockProducts,
        outOfStockProducts,
        productsByCategory
      ] = await Promise.all([
        this.supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),

        this.supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('is_featured', true),

        this.supabase
          .from('product_variants')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .lt('stock_quantity', 10)
          .gt('stock_quantity', 0),

        this.supabase
          .from('product_variants')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('stock_quantity', 0),

        this.supabase
          .from('products')
          .select(`
            categories (
              id,
              name
            )
          `)
          .eq('is_active', true)
      ]);

      // Count products by category
      const categoryCount: { [key: string]: number } = {};
      productsByCategory.data?.forEach(product => {
        const categoryName = product.categories?.name || 'Sin categoría';
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
      });

      return {
        total: totalProducts.count || 0,
        featured: featuredProducts.count || 0,
        lowStock: lowStockProducts.count || 0,
        outOfStock: outOfStockProducts.count || 0,
        byCategory: Object.entries(categoryCount).map(([name, count]) => ({ name, count }))
      };
    } catch (error) {
      console.error('Error getting product stats:', error);
      return {
        total: 0,
        featured: 0,
        lowStock: 0,
        outOfStock: 0,
        byCategory: []
      };
    }
  }

  /**
   * Obtiene estadísticas de clientes
   */
  async getCustomerStats() {
    try {
      const [
        totalCustomers,
        newCustomersThisMonth,
        activeCustomers,
        customersByGender
      ] = await Promise.all([
        this.supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),

        this.supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

        // Active customers = customers with orders (simulation)
        this.supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),

        this.supabase
          .from('customers')
          .select('gender')
          .eq('is_active', true)
      ]);

      // Count customers by gender
      const genderCount = customersByGender.data?.reduce((acc, customer) => {
        const gender = customer.gender || 'not_specified';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const formattedGenderCount = [
        { name: 'Masculino', count: genderCount.male || 0 },
        { name: 'Femenino', count: genderCount.female || 0 },
        { name: 'Otro', count: genderCount.other || 0 },
        { name: 'No especificado', count: genderCount.not_specified || 0 }
      ];

      return {
        total: totalCustomers.count || 0,
        newThisMonth: newCustomersThisMonth.count || 0,
        active: activeCustomers.count || 0,
        byGender: formattedGenderCount
      };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      return {
        total: 0,
        newThisMonth: 0,
        active: 0,
        byGender: []
      };
    }
  }

  /**
   * Obtiene estadísticas de cupones
   */
  async getCouponStats() {
    try {
      const [
        activeCoupons,
        usedCoupons,
        totalSavings
      ] = await Promise.all([
        this.supabase
          .from('coupons')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),

        this.supabase
          .from('coupons')
          .select('usage_count')
          .eq('is_active', true),

        // This would be calculated from actual order data with coupon usage
        // For now, simulating with coupon usage count
        this.supabase
          .from('coupons')
          .select('value, type, usage_count')
          .eq('is_active', true)
      ]);

      const totalUsage = usedCoupons.data?.reduce((sum, coupon) => sum + coupon.usage_count, 0) || 0;

      // Calculate estimated savings (simulation)
      const estimatedSavings = totalSavings.data?.reduce((sum, coupon) => {
        if (coupon.type === 'percentage') {
          // Assume average order of $100 for percentage coupons
          return sum + (coupon.value / 100) * 100 * coupon.usage_count;
        } else {
          return sum + coupon.value * coupon.usage_count;
        }
      }, 0) || 0;

      return {
        active: activeCoupons.count || 0,
        totalUsage,
        estimatedSavings
      };
    } catch (error) {
      console.error('Error getting coupon stats:', error);
      return {
        active: 0,
        totalUsage: 0,
        estimatedSavings: 0
      };
    }
  }

  /**
   * Obtiene datos para gráficos de tendencias
   */
  async getTrendData(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // This would typically come from orders data
      // For now, creating mock trend data
      const trendData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trendData.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 5000) + 1000, // Mock data
          orders: Math.floor(Math.random() * 50) + 10 // Mock data
        });
      }

      return trendData;
    } catch (error) {
      console.error('Error getting trend data:', error);
      return [];
    }
  }

  /**
   * Obtiene productos más vendidos (simulado)
   */
  async getTopProducts() {
    try {
      // This would typically come from order_items data
      // For now, returning featured products as "top sellers"
      const { data, error } = await this.supabase
        .from('products')
        .select('id, name, price_regular, sku')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error getting top products:', error);
        return [];
      }

      // Add mock sales data
      return (data || []).map(product => ({
        ...product,
        sales: Math.floor(Math.random() * 100) + 20,
        revenue: product.price_regular * (Math.floor(Math.random() * 100) + 20)
      }));
    } catch (error) {
      console.error('Error getting top products:', error);
      return [];
    }
  }
}

// Exportar singleton
export const analyticsService = new AnalyticsService();
export { AnalyticsService };
export default AnalyticsService;