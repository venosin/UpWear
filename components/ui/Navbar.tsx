/**
 * Componente Navbar reutilizable
 * Header principal de navegación con diseño minimalista y profesional
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { Button } from './Button';
import { LoginModal } from '../login-modal';

// ==================== TIPOS ====================

interface NavbarProps {
  user?: {
    name: string;
    avatar?: string;
  };
  cartItems?: number;
}

// ==================== COMPONENTE ====================

/**
 * Componente Navbar con navegación responsive
 * Incluye búsqueda, carrito, wishlist y autenticación
 * Actualizado con paleta de colores UpWear
 */
export function Navbar({ user, cartItems = 0 }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navigationItems = [
    { label: 'Tienda', href: '/shop' },
    { label: 'Categorías', href: '/categories' },
    { label: 'Nuevos', href: '/shop/new-arrivals' },
    { label: 'Ofertas', href: '/shop/sale' },
    { label: 'Nosotros', href: '/about' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#b5b6ad]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-32">
            {/* Logo */}
            <Link href="/" className="text-3xl font-bold text-[#1a1b14] hover:text-[#41423a] transition-colors tracking-wide">
              UpWear
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-16">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[#676960] hover:text-[#1a1b14] font-medium text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-12 pl-16">
            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-lg">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8e9087] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full pl-12 pr-4 py-3 border border-[#b5b6ad] rounded-lg text-sm text-[#41423a] bg-white focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087]"
                />
              </div>
            </div>

            {/* Desktop User Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="text-[#676960] hover:text-[#1a1b14] relative group transition-colors"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-[#b5b6ad] text-[#41423a] text-xs rounded-full w-4 h-4 flex items-center justify-center group-hover:bg-[#8e9087]">
                  0
                </span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="text-[#676960] hover:text-[#1a1b14] relative group transition-colors"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#41423a] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartItems}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[#676960]">Hola, {user.name}</span>
                  <Link href="/account">
                    <div className="w-8 h-8 rounded-full bg-[#b5b6ad] flex items-center justify-center hover:bg-[#8e9087] transition-colors">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-[#41423a]" />
                      )}
                    </div>
                  </Link>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="border-[#41423a] text-[#41423a] hover:bg-[#41423a] hover:text-white"
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-[#676960] hover:text-[#1a1b14] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-[#b5b6ad]/30">
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8e9087] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full pl-12 pr-4 py-3 border border-[#b5b6ad] rounded-lg text-sm text-[#41423a] bg-white focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087]"
                  />
                </div>

                {/* Mobile Navigation */}
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-[#676960] hover:text-[#1a1b14] hover:bg-[#b5b6ad]/20 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile User Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#b5b6ad]/30">
                  <div className="flex items-center space-x-6">
                    <Link
                      href="/wishlist"
                      className="text-[#676960] hover:text-[#1a1b14] relative"
                    >
                      <Heart className="w-5 h-5" />
                    </Link>

                    <Link
                      href="/cart"
                      className="text-[#676960] hover:text-[#1a1b14] relative"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#41423a] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                          {cartItems}
                        </span>
                      )}
                    </Link>
                  </div>

                  {user ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-[#676960]">Hola, {user.name}</span>
                      <Link href="/account">
                        <div className="w-8 h-8 rounded-full bg-[#b5b6ad] flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-[#41423a]" />
                          )}
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-[#41423a] text-white hover:bg-[#1a1b14]"
                    >
                      Iniciar Sesión
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default Navbar;