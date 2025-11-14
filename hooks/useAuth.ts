/**
 * Hook personalizado para gestión de autenticación
 * Maneja estado del usuario, login, logout y perfil
 */

'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { DatabaseProfile } from '@/types/database.types';
import { supabase } from '@/lib/supabase/client';

// ==================== TIPOS ====================

export interface AuthState {
  user: User | null;
  profile: DatabaseProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

export interface AuthContextType extends AuthState {
  // Métodos de autenticación
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;

  // Métodos de perfil
  updateProfile: (updates: Partial<DatabaseProfile>) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;

  // Utilidades
  refreshSession: () => Promise<void>;
}

// ==================== CONTEXTO ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Estado inicial
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    isStaff: false,
  });

  // ==================== EFECTOS ====================

  /**
   * Efecto para inicializar autenticación al montar el componente
   */
  useEffect(() => {
    initializeAuth();

    // Escuchar cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);

        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        }));

        // Si hay un usuario, cargar su perfil
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            isAdmin: false,
            isStaff: false,
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ==================== MÉTODOS ====================

  /**
   * Inicializa la autenticación verificando la sesión actual
   */
  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      }));

      if (session?.user) {
        await loadProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  /**
   * Carga el perfil del usuario desde la base de datos
   */
  const loadProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      const isAdmin = profile?.role === 'admin';
      const isStaff = profile?.role === 'staff' || isAdmin;

      setAuthState(prev => ({
        ...prev,
        profile,
        isAdmin,
        isStaff,
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  /**
   * Registra un nuevo usuario
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Inicia sesión de usuario
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  /**
   * Restablece la contraseña del usuario
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Actualiza el perfil del usuario
   */
  const updateProfile = async (updates: Partial<DatabaseProfile>) => {
    if (!authState.user) {
      return { error: { message: 'User not authenticated' } as AuthError };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authState.user.id);

      if (!error) {
        await refreshProfile();
      }

      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as AuthError };
    }
  };

  /**
   * Refresca el perfil del usuario desde la base de datos
   */
  const refreshProfile = async () => {
    if (authState.user) {
      await loadProfile(authState.user.id);
    }
  };

  /**
   * Refresca la sesión del usuario
   */
  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.refreshSession();

      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      }));
    } catch (error) {
      console.error('Refresh session error:', error);
    }
  };

  // ==================== CONTEXTO VALUE ====================

  const contextValue: AuthContextType = {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook para usar el contexto de autenticación
 * @returns Contexto de autenticación con estado y métodos
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
}

// ==================== HOOKS ESPECIALIZADOS ====================

/**
 * Hook para verificar si el usuario tiene permisos específicos
 * @returns Funciones para verificar permisos
 */
export function usePermissions() {
  const { isAuthenticated, isAdmin, isStaff } = useAuth();

  return {
    canAccessAdmin: isAuthenticated && isAdmin,
    canAccessStaff: isAuthenticated && (isAdmin || isStaff),
    canEditProducts: isAuthenticated && (isAdmin || isStaff),
    canViewOrders: isAuthenticated && (isAdmin || isStaff),
    canManageUsers: isAuthenticated && isAdmin,
  };
}

/**
 * Hook para obtener información básica del usuario
 * @returns Información del usuario formateada
 */
export function useUserInfo() {
  const { user, profile } = useAuth();

  return {
    id: user?.id,
    email: user?.email,
    fullName: profile?.full_name || user?.user_metadata?.full_name,
    avatar: profile?.avatar_url,
    role: profile?.role,
    phone: profile?.phone,
    isAuthenticated: !!user,
    initials: getInitialials(profile?.full_name || user?.user_metadata?.full_name),
  };
}

// ==================== UTILIDADES ====================

/**
 * Obtiene las iniciales de un nombre
 */
function getInitialials(fullName?: string): string {
  if (!fullName) return 'U';

  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}