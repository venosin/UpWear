'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserCircleIcon, KeyIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const supabase = createClient();

    // Form states
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    setUser(user);
                    // Intentar cargar perfil extendido si existe
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        setFullName(profile.full_name || '');
                        setPhone(profile.phone || '');
                    } else {
                        // Fallback a metadata si no hay perfil
                        setFullName(user.user_metadata?.full_name || '');
                        setPhone(user.user_metadata?.phone || '');
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                toast.error('Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [supabase]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setUpdating(true);
        try {
            // 1. Actualizar metadata de auth
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName, phone }
            });

            if (authError) throw authError;

            // 2. Actualizar tabla profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    phone: phone,
                    updated_at: new Date().toISOString()
                });

            if (profileError) throw profileError;

            toast.success('Perfil actualizado correctamente');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Error al actualizar el perfil');
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setUpdating(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast.success('Contraseña actualizada correctamente');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            toast.error(error.message || 'Error al cambiar la contraseña');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Gestiona tu información personal y seguridad de la cuenta.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Columna Izquierda: Tarjeta de Resumen */}
                <div className="md:col-span-1">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <span className="text-3xl font-bold text-blue-600">
                                {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{fullName || 'Usuario'}</h3>
                        <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {user?.role === 'authenticated' ? 'Administrador' : 'Usuario'}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Formularios */}
                <div className="md:col-span-2 space-y-8">

                    {/* Información Personal */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                Información Personal
                            </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                                <EnvelopeIcon className="h-4 w-4" />
                                            </span>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 bg-gray-100 text-gray-500 sm:text-sm"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">El email no se puede cambiar directamente.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {updating ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Seguridad */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                                <KeyIcon className="h-5 w-5 text-gray-400" />
                                Seguridad
                            </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirmar Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updating || !newPassword}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        {updating ? 'Actualizando...' : 'Actualizar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
