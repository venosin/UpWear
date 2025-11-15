'use client';

import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  customersThisMonth: number;
}

interface ProductStats {
  total: number;
  featured: number;
  lowStock: number;
  outOfStock: number;
  byCategory: Array<{ name: string; count: number }>;
}

interface CustomerStats {
  total: number;
  newThisMonth: number;
  active: number;
  byGender: Array<{ name: string; count: number }>;
}

interface CouponStats {
  active: number;
  totalUsage: number;
  estimatedSavings: number;
}

interface TrendData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  price_regular: number;
  sku: string;
  sales: number;
  revenue: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [couponStats, setCouponStats] = useState<CouponStats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [
        dashboardData,
        productData,
        customerData,
        couponData,
        trendData,
        topProductsData
      ] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getProductStats(),
        analyticsService.getCustomerStats(),
        analyticsService.getCouponStats(),
        analyticsService.getTrendData(30),
        analyticsService.getTopProducts()
      ]);

      setDashboardStats(dashboardData);
      setProductStats(productData);
      setCustomerStats(customerData);
      setCouponStats(couponData);
      setTrendData(trendData);
      setTopProducts(topProductsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analíticas</h1>
        <p className="text-gray-600 mt-2">
          Resumen del rendimiento de tu tienda
        </p>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Productos</dt>
                <dd className="text-lg font-medium text-gray-900">{dashboardStats?.totalProducts || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pedidos este mes</dt>
                <dd className="text-lg font-medium text-gray-900">{dashboardStats?.ordersThisMonth || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Ingresos este mes</dt>
                <dd className="text-lg font-medium text-gray-900">${(dashboardStats?.revenueThisMonth || 0).toFixed(2)}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Clientes nuevos</dt>
                <dd className="text-lg font-medium text-gray-900">{dashboardStats?.customersThisMonth || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Productos</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total productos:</span>
              <span className="font-medium">{productStats?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Productos destacados:</span>
              <span className="font-medium">{productStats?.featured || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock bajo:</span>
              <span className="font-medium text-yellow-600">{productStats?.lowStock || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sin stock:</span>
              <span className="font-medium text-red-600">{productStats?.outOfStock || 0}</span>
            </div>
          </div>

          {productStats?.byCategory && productStats.byCategory.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Productos por Categoría</h4>
              <div className="space-y-2">
                {productStats.byCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category.name}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(category.count / (productStats.total || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Clientes</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total clientes:</span>
              <span className="font-medium">{customerStats?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nuevos este mes:</span>
              <span className="font-medium text-green-600">{customerStats?.newThisMonth || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Clientes activos:</span>
              <span className="font-medium">{customerStats?.active || 0}</span>
            </div>
          </div>

          {customerStats?.byGender && customerStats.byGender.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Clientes por Género</h4>
              <div className="space-y-2">
                {customerStats.byGender.map((gender, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{gender.name}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(gender.count / (customerStats.total || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{gender.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price_regular.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.sales}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.revenue.toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay datos de ventas disponibles</p>
        )}
      </div>

      {/* Coupon Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Cupones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{couponStats?.active || 0}</div>
            <div className="text-sm text-gray-600">Cupones Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{couponStats?.totalUsage || 0}</div>
            <div className="text-sm text-gray-600">Usos Totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${(couponStats?.estimatedSavings || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Ahorro Estimado</div>
          </div>
        </div>
      </div>
    </div>
  );
}