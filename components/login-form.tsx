'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast } from './ui/Toast';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // 1. Autenticar usuario
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Verificar rol del usuario (versión simplificada)
      if (authData.user) {
        console.log('User authenticated:', authData.user.email);

        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single();

          console.log('Profile data:', profile);
          console.log('Profile error:', profileError);

          if (!profileError && profile) {
            console.log('User role:', profile.role);
            // Redirigir según el rol
            if (profile.role === 'admin' || profile.role === 'staff') {
              console.log('Redirecting to admin dashboard...');
              showSuccessToast('¡Bienvenido al panel de administración!');
              router.push('/admin');
            } else {
              console.log('Redirecting to home...');
              showSuccessToast('¡Bienvenido de nuevo!');
              router.push('/');
            }
          } else {
            console.log('Profile not found, redirecting to home...');
            showSuccessToast('¡Bienvenido de nuevo!');
            router.push('/');
          }

          if (onSuccess) onSuccess();

        } catch (error) {
          console.error('Error checking profile:', error);
          console.log('Redirecting to home due to error...');
          showSuccessToast('¡Bienvenido de nuevo!');
          router.push('/');
          if (onSuccess) onSuccess();
        }
      }
    } catch (error: any) {
      setError(error.message || 'Ocurrió un error durante el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#676960] mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#b5b6ad] rounded-lg text-[#41423a] bg-white focus:ring-2 focus:ring-[#41423a] focus:border-[#41423a] outline-none transition-all placeholder-[#8e9087]"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#676960] mb-2">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#b5b6ad] rounded-lg text-[#41423a] bg-white focus:ring-2 focus:ring-[#41423a] focus:border-[#41423a] outline-none transition-all placeholder-[#8e9087]"
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#41423a] text-white hover:bg-[#1a1b14] disabled:bg-[#8e9087] font-semibold py-3"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#676960]">
          ¿No tienes cuenta?{' '}
          <a href="/auth/register" className="font-medium text-[#41423a] hover:text-[#1a1b14] underline">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;