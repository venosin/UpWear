import { BaseService } from './BaseService';
import {
  DatabaseAnalyticsEvent,
  DatabaseAdminActivityLog,
  EventType,
  AdminAction,
  DashboardStats,
  SalesAnalytics,
  ProductAnalytics
} from '@/lib/database.types';

/**
 * Servicio mejorado para gestión de estadísticas y analíticas con MCP validation
 */
class AnalyticsService extends BaseService<DatabaseAnalyticsEvent> {
  constructor() {
    super('analytics_events');
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

  // ============================================
  // NUEVOS MÉTODOS MCP (MCP Enhanced)
  // ============================================

  /**
   * MCP: Valida que todas las tablas de analytics existan y tengan los campos correctos
   */
  async validateAnalyticsTablesWithMCP(): Promise<{
    valid: boolean;
    errors: string[];
    tableInfo: {
      analytics_events: { exists: boolean; columns: string[] };
      admin_activity_logs: { exists: boolean; columns: string[] };
      orders: { exists: boolean; columns: string[] };
      order_items: { exists: boolean; columns: string[] };
      coupons: { exists: boolean; columns: string[] };
      coupon_usage: { exists: boolean; columns: string[] };
    }
  }> {
    const errors: string[] = [];
    const tableInfo: any = {
      analytics_events: { exists: false, columns: [] },
      admin_activity_logs: { exists: false, columns: [] },
      orders: { exists: false, columns: [] },
      order_items: { exists: false, columns: [] },
      coupons: { exists: false, columns: [] },
      coupon_usage: { exists: false, columns: [] }
    };

    try {
      // Verificar tabla analytics_events
      try {
        const { data: eventsData, error: eventsError } = await this.supabase
          .from('analytics_events')
          .select('*')
          .limit(1);

        if (eventsError) {
          errors.push(`analytics_events table error: ${eventsError.message}`);
        } else {
          tableInfo.analytics_events.exists = true;
          if (eventsData && eventsData.length > 0) {
            tableInfo.analytics_events.columns = Object.keys(eventsData[0]);
          } else {
            tableInfo.analytics_events.columns = ['id', 'event_type', 'user_id', 'session_id', 'properties', 'created_at'];
          }
        }
      } catch (error) {
        errors.push(`Failed to check analytics_events table: ${error}`);
      }

      // Verificar tabla admin_activity_logs
      try {
        const { data: logsData, error: logsError } = await this.supabase
          .from('admin_activity_logs')
          .select('*')
          .limit(1);

        if (logsError) {
          errors.push(`admin_activity_logs table error: ${logsError.message}`);
        } else {
          tableInfo.admin_activity_logs.exists = true;
          if (logsData && logsData.length > 0) {
            tableInfo.admin_activity_logs.columns = Object.keys(logsData[0]);
          } else {
            tableInfo.admin_activity_logs.columns = ['id', 'admin_id', 'action', 'entity', 'entity_id', 'old_values', 'new_values', 'ip_address', 'user_agent', 'notes', 'created_at'];
          }
        }
      } catch (error) {
        errors.push(`Failed to check admin_activity_logs table: ${error}`);
      }

      // Verificar tabla orders
      try {
        const { data: ordersData, error: ordersError } = await this.supabase
          .from('orders')
          .select('id, total_amount, status, user_id, created_at')
          .limit(1);

        if (ordersError) {
          errors.push(`orders table error: ${ordersError.message}`);
        } else {
          tableInfo.orders.exists = true;
          tableInfo.orders.columns = ['id', 'total_amount', 'status', 'user_id', 'created_at'];
        }
      } catch (error) {
        errors.push(`Failed to check orders table: ${error}`);
      }

      // Verificar tabla order_items
      try {
        const { data: itemsData, error: itemsError } = await this.supabase
          .from('order_items')
          .select('id, product_id, quantity, unit_price, total_price')
          .limit(1);

        if (itemsError) {
          errors.push(`order_items table error: ${itemsError.message}`);
        } else {
          tableInfo.order_items.exists = true;
          tableInfo.order_items.columns = ['id', 'product_id', 'quantity', 'unit_price', 'total_price'];
        }
      } catch (error) {
        errors.push(`Failed to check order_items table: ${error}`);
      }

      // Verificar tabla coupons
      try {
        const { data: couponsData, error: couponsError } = await this.supabase
          .from('coupons')
          .select('id, code, is_active, created_at')
          .limit(1);

        if (couponsError) {
          errors.push(`coupons table error: ${couponsError.message}`);
        } else {
          tableInfo.coupons.exists = true;
          tableInfo.coupons.columns = ['id', 'code', 'is_active', 'created_at'];
        }
      } catch (error) {
        errors.push(`Failed to check coupons table: ${error}`);
      }

      // Verificar tabla coupon_usage
      try {
        const { data: usageData, error: usageError } = await this.supabase
          .from('coupon_usage')
          .select('id, coupon_id, user_id, order_id, created_at')
          .limit(1);

        if (usageError) {
          errors.push(`coupon_usage table error: ${usageError.message}`);
        } else {
          tableInfo.coupon_usage.exists = true;
          tableInfo.coupon_usage.columns = ['id', 'coupon_id', 'user_id', 'order_id', 'created_at'];
        }
      } catch (error) {
        errors.push(`Failed to check coupon_usage table: ${error}`);
      }

      return {
        valid: errors.length === 0,
        errors,
        tableInfo
      };
    } catch (error) {
      errors.push(`MCP validation error: ${error}`);
      return { valid: false, errors, tableInfo };
    }
  }

  /**
   * MCP: Track analytics events con validación de tabla
   */
  async trackEvent(
    eventType: EventType,
    properties: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      // Validar primero que la tabla existe
      const validation = await this.validateAnalyticsTablesWithMCP();
      if (!validation.tableInfo.analytics_events.exists) {
        console.warn('analytics_events table does not exist, skipping event tracking');
        return;
      }

      const eventData: any = {
        event_type: eventType,
        properties: typeof properties === 'object' ? properties : {},
        created_at: new Date().toISOString()
      };

      if (userId) eventData.user_id = userId;
      if (sessionId) eventData.session_id = sessionId;

      const { error } = await this.supabase
        .from('analytics_events')
        .insert(eventData);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // No lanzar error para no romper el flujo principal
    }
  }

  /**
   * MCP: Log admin activity con validación
   */
  async logAdminActivity(
    adminId: string,
    action: AdminAction,
    entity: string,
    entityId: number | null,
    oldValues: Record<string, any> | null = null,
    newValues: Record<string, any> | null = null,
    notes?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Validar primero que la tabla existe
      const validation = await this.validateAnalyticsTablesWithMCP();
      if (!validation.tableInfo.admin_activity_logs.exists) {
        console.warn('admin_activity_logs table does not exist, skipping activity logging');
        return;
      }

      const logData: any = {
        admin_id: adminId,
        action,
        entity,
        entity_id: entityId,
        created_at: new Date().toISOString()
      };

      if (oldValues) logData.old_values = oldValues;
      if (newValues) logData.new_values = newValues;
      if (notes) logData.notes = notes.substring(0, 1000); // Limitar longitud
      if (ipAddress) logData.ip_address = ipAddress;
      if (userAgent) logData.user_agent = userAgent.substring(0, 500); // Limitar longitud

      const { error } = await this.supabase
        .from('admin_activity_logs')
        .insert(logData);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging admin activity:', error);
      throw error;
    }
  }

  /**
   * MCP: Obtiene dashboard stats con validación de tablas
   */
  async getDashboardStatsWithMCP(): Promise<DashboardStats> {
    try {
      const validation = await this.validateAnalyticsTablesWithMCP();

      // Valores por defecto
      const stats: DashboardStats = {
        total_products: 0,
        active_products: 0,
        low_stock_products: 0,
        out_of_stock_products: 0,
        total_orders: 0,
        pending_orders: 0,
        completed_orders: 0,
        total_revenue: 0,
        today_revenue: 0,
        total_customers: 0,
        new_customers_today: 0,
        active_coupons: 0,
        used_coupons_today: 0
      };

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Solo ejecutar queries si las tablas existen
      if (validation.tableInfo.orders.exists) {
        try {
          const { count: totalOrders } = await this.supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

          stats.total_orders = totalOrders || 0;

          const { data: completedOrders } = await this.supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'completed');

          if (completedOrders) {
            stats.completed_orders = completedOrders.length;
            stats.total_revenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          }

          const { data: todayCompletedOrders } = await this.supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'completed')
            .gte('created_at', todayStart.toISOString());

          if (todayCompletedOrders) {
            stats.today_revenue = todayCompletedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          }
        } catch (error) {
          console.error('Error fetching order stats:', error);
        }
      }

      if (validation.tableInfo.coupons.exists) {
        try {
          const { count: activeCoupons } = await this.supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

          stats.active_coupons = activeCoupons || 0;
        } catch (error) {
          console.error('Error fetching coupon stats:', error);
        }
      }

      if (validation.tableInfo.coupon_usage.exists) {
        try {
          const { count: usedCouponsToday } = await this.supabase
            .from('coupon_usage')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart.toISOString());

          stats.used_coupons_today = usedCouponsToday || 0;
        } catch (error) {
          console.error('Error fetching coupon usage stats:', error);
        }
      }

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Retornar valores por defecto en caso de error
      return {
        total_products: 0,
        active_products: 0,
        low_stock_products: 0,
        out_of_stock_products: 0,
        total_orders: 0,
        pending_orders: 0,
        completed_orders: 0,
        total_revenue: 0,
        today_revenue: 0,
        total_customers: 0,
        new_customers_today: 0,
        active_coupons: 0,
        used_coupons_today: 0
      };
    }
  }

  /**
   * MCP: Limpieza de eventos antiguos con validación
   */
  async cleanupOldEvents(daysToKeep: number = 90): Promise<number> {
    try {
      const validation = await this.validateAnalyticsTablesWithMCP();
      if (!validation.tableInfo.analytics_events.exists) {
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { count, error } = await this.supabase
        .from('analytics_events')
        .delete('*', { count: 'exact' })
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error cleaning up old events:', error);
      return 0;
    }
  }
}

// Exportar singleton
export const analyticsService = new AnalyticsService();
export { AnalyticsService };
export default AnalyticsService;