'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { type EmailOtpType } from '@supabase/supabase-js';

export default function ConfirmPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Verificando tu cuenta...');

    useEffect(() => {
        const handleConfirm = async () => {
            const supabase = createClient();
            const hash = window.location.hash;

            // 1. Si hay hash con access_token, Supabase JS Client lo procesa automáticamente.
            // Nosotros solo esperamos un momento y verificamos la sesión.
            if (hash && hash.includes('access_token')) {
                setStatus('Autenticando...');

                // Intentamos obtener la sesión inmediatamente
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setStatus('¡Cuenta verificada! Redirigiendo...');
                    router.push('/');
                    return;
                }

                // Si no, esperamos un poco a que el cliente procese el hash
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (retrySession) {
                        setStatus('¡Cuenta verificada! Redirigiendo...');
                        router.push('/');
                    } else {
                        // Fallback: Si hay token en URL pero no sesión, forzamos ir al home
                        // porque probablemente la cookie ya se estableció
                        console.log('Token detectado, redirigiendo forzosamente...');
                        router.push('/');
                    }
                }, 1000);
                return;
            }

            // 2. Verificar si hay token_hash en Query Params (PKCE Flow)
            const token_hash = searchParams.get('token_hash');
            const type = searchParams.get('type') as EmailOtpType | null;

            if (token_hash && type) {
                setStatus('Validando código...');
                const { error } = await supabase.auth.verifyOtp({
                    type,
                    token_hash,
                });

                if (!error) {
                    setStatus('¡Éxito! Redirigiendo...');
                    router.push('/');
                } else {
                    setStatus('Error: El enlace es inválido o ha expirado.');
                }
                return;
            }

            // 3. Si no hay nada en la URL, verificamos si ya hay sesión
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/');
            } else {
                setStatus('No se encontró código de verificación.');
            }
        };

        handleConfirm();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Confirmación de Cuenta</h2>
                <div className="flex justify-center mb-6">
                    {/* Simple Loading Spinner */}
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </div>
                <p className="text-gray-600">{status}</p>
            </div>
        </div>
    );
}
