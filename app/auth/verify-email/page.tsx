'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VerifyEmailPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const supabase = createClient();

            // Obtener el hash de la URL (contiene el token de confirmación)
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const type = hashParams.get('type');

            if (type === 'signup' && accessToken) {
                // El email ya fue confirmado por Supabase automáticamente
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    setStatus('error');
                    setMessage('Error al verificar el email. Por favor, intenta de nuevo.');
                    return;
                }

                setStatus('success');
                setMessage('¡Email confirmado exitosamente!');

                // Redirigir a la home después de 2 segundos
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                setStatus('error');
                setMessage('Link de verificación inválido o expirado.');
            }
        };

        verifyEmail();
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-6"></div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificando email...</h1>
                        <p className="text-gray-600">Por favor espera un momento</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Email Confirmado!</h1>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Redirigiendo a la página principal...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
                            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error de Verificación</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            Volver al inicio
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
