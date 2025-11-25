'use client';

/**
 * Layout principal del panel de administración
 * Protegido para usuarios con rol admin/staff
 * Incluye sidebar y navegación consistente con UpWear
 */

import { useState } from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen w-0">
        {/* Header Component */}
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

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