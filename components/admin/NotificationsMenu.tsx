'use client';

import { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Tipos para las notificaciones
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    createdAt: Date;
    link?: string;
}

// Datos mockeados iniciales
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Nueva orden recibida',
        message: 'Orden #1234 por $150.00 de Juan Pérez',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // Hace 5 min
        link: '/admin/orders/1234'
    },
    {
        id: '2',
        title: 'Stock bajo',
        message: 'El producto "Camisa Polo Azul" tiene menos de 5 unidades',
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // Hace 2 horas
        link: '/admin/inventory'
    },
    {
        id: '3',
        title: 'Bienvenido al Admin',
        message: 'Has configurado correctamente tu panel de administración',
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Hace 1 día
    }
];

export default function NotificationsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const menuRef = useRef<HTMLDivElement>(null);

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

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'warning': return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
            case 'error': return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
            default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        return `Hace ${diffDays} d`;
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Marcar todas leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No tienes notificaciones
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                                {notification.link && (
                                                    <Link
                                                        href={notification.link}
                                                        className="text-xs text-blue-600 hover:text-blue-800 mt-1.5 inline-block font-medium"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        Ver detalles
                                                    </Link>
                                                )}
                                            </div>
                                            {!notification.read && (
                                                <div className="flex-shrink-0">
                                                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                        <Link
                            href="/admin/notifications"
                            className="text-xs text-gray-600 hover:text-gray-900 font-medium block py-1"
                            onClick={() => setIsOpen(false)}
                        >
                            Ver todas las notificaciones
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
