'use client';

import Link from 'next/link';
import { Bars3Icon, PlusIcon } from '@heroicons/react/24/outline';
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';

interface AdminHeaderProps {
    onOpenSidebar: () => void;
}

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-30 relative">
            <div className="flex items-center justify-between h-16 px-6">
                {/* Mobile menu button */}
                <button
                    onClick={onOpenSidebar}
                    className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                    <span className="sr-only">Abrir menú lateral</span>
                    <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Right side actions */}
                <div className="flex items-center space-x-4 ml-auto lg:ml-0 w-full justify-end">
                    {/* Quick Action: New Product */}
                    <Link
                        href="/admin/products/create"
                        className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nuevo Producto
                    </Link>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                    {/* Notifications */}
                    <NotificationsMenu />

                    {/* User Menu */}
                    <UserMenu />
                </div>
            </div>
        </div>
    );
}
