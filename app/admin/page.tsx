/**
 * Dashboard principal del panel de administración
 * Muestra estadísticas clave y métricas del negocio
 * Temporalmente con datos de ejemplo hasta arreglar Supabase SSR
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/Card';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock
} from 'lucide-react';

/**
 * Interfaz para las estadísticas del dashboard
 */
interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: number;
  lowStockItems: number;
}

/**
 * Componente de tarjeta de estadística
 * Muestra métricas clave con iconos y tendencias
 */
function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600'
  };

  return (
    <Card className="bg-white border-[#b5b6ad]/30 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#676960]">{title}</p>
              <p className="text-2xl font-bold text-[#1a1b14]">{value}</p>
            </div>
          </div>

          {trend && trendValue && (
            <div className={`flex items-center space-x-1 text-sm ${trendColors[trend]}`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Obtiene estadísticas del dashboard
 * TODO: Implementar conexión real con Supabase cuando el cliente SSR funcione
 * @returns Promise<DashboardStats> - Estadísticas del negocio
 */
async function getDashboardStats(): Promise<DashboardStats> {
  console.log('Using temporary dashboard stats due to Supabase SSR issue');

  // Datos de ejemplo temporal para que el dashboard funcione sin errores
  // TODO: Implementar conexión real cuando el cliente SSR funcione
  return {
    totalProducts: 12,
    activeProducts: 10,
    totalOrders: 48,
    pendingOrders: 5,
    totalRevenue: 2475.50,
    totalCustomers: 23,
    recentOrders: 8,
    lowStockItems: 3
  };
}

/**
 * Componente Quick Actions
 * Proporciona accesos rápidos a acciones comunes
 */
function QuickActions() {
  const actions = [
    {
      title: 'Crear Producto',
      description: 'Agregar un nuevo producto al catálogo',
      href: '/admin/products/create',
      icon: Package,
      color: 'blue' as const
    },
    {
      title: 'Ver Órdenes',
      description: 'Gestionar órdenes pendientes',
      href: '/admin/orders',
      icon: ShoppingBag,
      color: 'green' as const
    },
    {
      title: 'Gestionar Categorías',
      description: 'Organizar categorías de productos',
      href: '/admin/categories',
      icon: Eye,
      color: 'yellow' as const
    },
    {
      title: 'Ver Clientes',
      description: 'Administrar base de clientes',
      href: '/admin/customers',
      icon: Users,
      color: 'red' as const
    }
  ];

  return (
    <Card className="bg-white border-[#b5b6ad]/30">
      <CardHeader>
        <CardTitle className="text-[#1a1b14]">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <a
                key={index}
                href={action.href}
                className="p-4 border border-[#b5b6ad]/30 rounded-lg hover:bg-[#b5b6ad]/10 transition-colors group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg bg-${action.color}-50 text-${action.color}-600 group-hover:bg-${action.color}-100`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-[#1a1b14] group-hover:text-[#41423a]">
                    {action.title}
                  </h3>
                </div>
                <p className="text-sm text-[#676960]">{action.description}</p>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Página principal del dashboard
 * Muestra estadísticas, métricas y acciones rápidas
 */
export default async function AdminDashboard() {
  // Obtener estadísticas (usando datos temporales)
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1a1b14]">Dashboard</h1>
        <p className="text-[#676960] mt-1">
          Resumen general del negocio y métricas clave
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Productos"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
          trend="up"
          trendValue="+12%"
        />

        <StatsCard
          title="Órdenes Totales"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="green"
          trend="up"
          trendValue="+8%"
        />

        <StatsCard
          title="Clientes"
          value={stats.totalCustomers}
          icon={Users}
          color="red"
          trend="up"
          trendValue="+15%"
        />

        <StatsCard
          title="Revenue Total"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="yellow"
          trend="up"
          trendValue="+23%"
        />
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Productos Activos"
          value={`${stats.activeProducts}/${stats.totalProducts}`}
          icon={Package}
          color="blue"
        />

        <StatsCard
          title="Órdenes Pendientes"
          value={stats.pendingOrders}
          icon={Clock}
          color="yellow"
        />

        <StatsCard
          title="Órdenes Recientes (7 días)"
          value={stats.recentOrders}
          icon={TrendingUp}
          color="green"
        />

        <StatsCard
          title="Stock Bajo"
          value={stats.lowStockItems}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Acciones Rápidas */}
      <QuickActions />
    </div>
  );
}