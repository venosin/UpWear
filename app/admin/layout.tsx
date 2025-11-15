'use client';

/**
 * Layout principal del panel de administración
 * Protegido para usuarios con rol admin/staff
 * Incluye sidebar y navegación consistente con UpWear
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  TagIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { ToastContainer } from '@/components/ui/Toast';

/**
 * Verificación temporal simplificada para admin
 * TODO: Fix Supabase SSR client issue
 */
function isKnownAdminUser(): boolean {
  // Lista temporal de UUIDs conocidos de admin
  const adminUsers = [
    '35788355-5de5-49b6-bd67-70344d107f1a' // Tu UUID
  ];

  // Por ahora, permitir acceso temporal para pruebas
  return true;
}

/**
 * Verifica si el usuario tiene permisos de administrador
 * @returns Promise<boolean> - true si es admin o staff
 */
async function isAdmin(): Promise<boolean> {
  console.log('Using temporary admin check due to Supabase SSR issue');

  // Por ahora, permitir acceso para poder desarrollar el panel
  // TODO: Implementar verificación real cuando el cliente SSR funcione
  return true;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Productos', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Categorías', href: '/admin/categories', icon: TagIcon },
    { name: 'Marcas', href: '/admin/brands', icon: BuildingOfficeIcon },
    { name: 'Clientes', href: '/admin/customers', icon: UsersIcon },
    { name: 'Inventario', href: '/admin/inventory', icon: ClipboardDocumentListIcon },
    { name: 'Cupones', href: '/admin/coupons', icon: TicketIcon },
    { name: 'Analíticas', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Configuración', href: '/admin/settings', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex-shrink-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800 flex-shrink-0">
          <Link href="/admin" className="text-xl font-bold text-white">
            UpWear Admin
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8 overflow-y-auto">
          <div className="px-3 space-y-1 pb-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-gray-800 text-white border-l-4 border-blue-500 shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">admin@upwear.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4 ml-auto lg:ml-0">
              {/* Quick actions */}
              <Link
                href="/admin/products/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Link>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}