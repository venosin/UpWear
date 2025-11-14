'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Users,
  Settings,
  Menu,
  X,
  ChevronDown,
  Store,
  Truck,
  Percent,
  BarChart3,
  LogOut
} from 'lucide-react';

/**
 * Interfaz para los items del menú de navegación
 */
interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: MenuItem[];
}

/**
 * Componente Sidebar para navegación del panel admin
 * Responsivo con mobile menu y submenús expandibles
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  /**
   * Estructura del menú de navegación
   * Organizada por secciones lógicas
   */
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      id: 'products',
      label: 'Productos',
      href: '/admin/products',
      icon: Package,
      children: [
        {
          id: 'products-list',
          label: 'Todos los productos',
          href: '/admin/products',
          icon: Package
        },
        {
          id: 'products-create',
          label: 'Crear producto',
          href: '/admin/products/create',
          icon: Package
        },
        {
          id: 'categories',
          label: 'Categorías',
          href: '/admin/categories',
          icon: Tags
        },
        {
          id: 'brands',
          label: 'Marcas',
          href: '/admin/brands',
          icon: Store
        }
      ]
    },
    {
      id: 'orders',
      label: 'Órdenes',
      href: '/admin/orders',
      icon: ShoppingBag,
      children: [
        {
          id: 'orders-list',
          label: 'Todas las órdenes',
          href: '/admin/orders',
          icon: ShoppingBag
        },
        {
          id: 'orders-pending',
          label: 'Pendientes',
          href: '/admin/orders?status=pending',
          icon: ShoppingBag,
          badge: '5'
        }
      ]
    },
    {
      id: 'customers',
      label: 'Clientes',
      href: '/admin/customers',
      icon: Users
    },
    {
      id: 'inventory',
      label: 'Inventario',
      href: '/admin/inventory',
      icon: Truck
    },
    {
      id: 'coupons',
      label: 'Cupones',
      href: '/admin/coupons',
      icon: Percent
    },
    {
      id: 'analytics',
      label: 'Analíticas',
      href: '/admin/analytics',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'Configuración',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  /**
   * Alterna la expansión de submenús
   * @param menuId - ID del menú a expandir/contraer
   */
  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  /**
   * Verifica si un item está activo basado en la ruta actual
   * @param href - URL del item a verificar
   * @returns boolean - true si está activo
   */
  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  /**
   * Renderiza un item individual del menú
   * @param item - Item del menú a renderizar
   * @param level - Nivel de anidación (para submenús)
   */
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = expandedMenus.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <div key={item.id} className="w-full">
        {/* Item principal */}
        <Link
          href={item.href}
          className={`
            flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg
            transition-all duration-200 group relative
            ${level > 0 ? 'ml-4' : ''}
            ${active
              ? 'bg-[#41423a] text-white shadow-sm'
              : 'text-[#676960] hover:bg-[#b5b6ad]/20 hover:text-[#41423a]'
            }
          `}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleMenu(item.id);
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-[#8e9087]'}`} />
            <span className="truncate">{item.label}</span>
          </div>

          <div className="flex items-center space-x-2">
            {item.badge && (
              <span className="bg-[#b5b6ad] text-[#41423a] text-xs px-2 py-1 rounded-full font-semibold">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''} ${
                  active ? 'text-white' : 'text-[#8e9087]'
                }`}
              />
            )}
          </div>
        </Link>

        {/* Submenús */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-[#41423a] text-white p-3 rounded-lg shadow-lg hover:bg-[#1a1b14] transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1b14] shadow-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b border-[#41423a]/20">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-[#1a1b14]" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">UpWear</span>
              <span className="text-xs text-[#b5b6ad] ml-1">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#41423a]/20">
            <a
              href="/"
              className="flex items-center space-x-3 text-[#b5b6ad] hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-[#41423a]/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Volver a Tienda</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative w-64 bg-[#1a1b14] shadow-xl">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-20 border-b border-[#41423a]/20 px-4">
                <Link href="/admin" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-[#1a1b14]" />
                  </div>
                  <span className="text-xl font-bold text-white tracking-wide">UpWear</span>
                  <span className="text-xs text-[#b5b6ad] ml-1">Admin</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-[#41423a]/20 p-2 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {menuItems.map(item => renderMenuItem(item))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-[#41423a]/20">
                <a
                  href="/"
                  className="flex items-center space-x-3 text-[#b5b6ad] hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-[#41423a]/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Volver a Tienda</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;