/**
 * Componente Navbar reutilizable
 * Header principal de navegación con diseño minimalista y profesional
 */

'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X, LogOut, UserCircle, Settings } from 'lucide-react';
import { Button } from './Button';
import { showSuccessToast } from './Toast';
import { LoginModal } from '../login-modal';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ==================== TIPOS ====================

interface NavbarProps {
    cartItems?: number;
}

// ==================== COMPONENTE ====================

export function Navbar({ cartItems = 0 }: NavbarProps) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const navigationItems = [
        { label: 'Tienda', href: '/shop' },
        { label: 'Categorías', href: '/shop/categorias' },
        { label: 'Nuevos', href: '/shop/new-arrivals' },
        { label: 'Ofertas', href: '/shop/ofertas' },
        { label: 'Nosotros', href: '/nosotros' },
    ];

    // Get user session
    useEffect(() => {
        const supabase = createClient();

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Get profile data
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfile(profileData);
            }
        };

        getUser();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }: any) => setProfile(data));
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsUserMenuOpen(false);
        showSuccessToast('Sesión cerrada correctamente');
        router.push('/');
        router.refresh();
    };

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario';
    const displayEmail = user?.email || '';

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

                                {/* User Menu */}
                                {user ? (
                                    <div className="relative" ref={userMenuRef}>
                                        <button
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-[#41423a] flex items-center justify-center text-white font-semibold">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden xl:block text-left">
                                                <p className="text-sm font-medium text-[#1a1b14]">{displayName}</p>
                                                <p className="text-xs text-[#676960]">{displayEmail}</p>
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isUserMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                                                    <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                                                </div>

                                                <Link
                                                    href="/admin/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <UserCircle className="w-4 h-4" />
                                                    Mi Perfil
                                                </Link>

                                                <Link
                                                    href="/admin"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Panel de Control
                                                </Link>

                                                <div className="border-t border-gray-100 mt-2 pt-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Cerrar Sesión
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="border border-[#41423a] text-[#41423a] hover:bg-[#41423a] hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Iniciar Sesión
                                    </button>
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
                                            <span className="text-sm text-[#676960]">Hola, {displayName}</span>
                                            <button
                                                onClick={handleLogout}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Salir
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setIsLoginModalOpen(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="bg-[#41423a] text-white hover:bg-[#1a1b14] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Iniciar Sesión
                                        </button>
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
