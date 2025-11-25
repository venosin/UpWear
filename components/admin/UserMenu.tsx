'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    // Datos de usuario (temporalmente hardcodeados, idealmente vendrían de un contexto o hook de auth)
    const user = {
        name: 'Admin User',
        email: 'admin@upwear.com',
        initials: 'A',
        role: 'Administrator'
    };

    // Cerrar al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push('/'); // Redirigir a la página pública
            router.refresh();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform active:scale-95"
            >
                <span className="sr-only">Abrir menú de usuario</span>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-sm border border-gray-600">
                    <span className="text-white text-sm font-medium">{user.initials}</span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-100">
                    {/* Header del menú */}
                    <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {user.role}
                        </span>
                    </div>

                    {/* Opciones */}
                    <div className="py-1">
                        <Link
                            href="/admin/profile"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Mi Perfil
                        </Link>
                        <Link
                            href="/admin/settings"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setIsOpen(false)}
                        >
                            <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Configuración
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="py-1">
                        <button
                            onClick={handleLogout}
                            className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
