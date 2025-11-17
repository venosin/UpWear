'use client';

import { BaseService } from '@/lib/services/base-service';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '@/types/customers';

/**
 * Servicio para gestionar operaciones de autenticación
 * Conecta con API Routes para operaciones seguras
 */
class AuthService extends BaseService {

  /**
   * Registra un nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log('🔐 Registering user via API Route:', userData.email);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error registering user via API:', result);
        return {
          success: false,
          error: result.error || 'Failed to register user',
          message: result.message
        };
      }

      console.log('✅ User registered successfully via API');
      return {
        success: true,
        message: result.message,
        user: result.user
      };
    } catch (error) {
      console.error('❌ Error in register:', error);
      return {
        success: false,
        error: 'Network error during registration'
      };
    }
  }

  /**
   * Inicia sesión de usuario
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Logging in user via API Route:', credentials.email);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error logging in via API:', result);
        return {
          success: false,
          error: result.error || 'Failed to login',
          message: result.message
        };
      }

      // Guardar tokens en localStorage si remember_me está activado
      if (credentials.remember_me && result.session) {
        localStorage.setItem('supabase_access_token', result.session.access_token);
        localStorage.setItem('supabase_refresh_token', result.session.refresh_token);
        localStorage.setItem('supabase_expires_at', result.session.expires_at.toString());
      }

      console.log('✅ User logged in successfully via API');
      return {
        success: true,
        message: result.message,
        user: result.user,
        session: result.session
      };
    } catch (error) {
      console.error('❌ Error in login:', error);
      return {
        success: false,
        error: 'Network error during login'
      };
    }
  }

  /**
   * Cierra sesión de usuario
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Logging out user');

      // Cerrar sesión con Supabase
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        console.error('❌ Error signing out with Supabase:', error);
        return { success: false, error: error.message };
      }

      // Limpiar localStorage
      localStorage.removeItem('supabase_access_token');
      localStorage.removeItem('supabase_refresh_token');
      localStorage.removeItem('supabase_expires_at');

      console.log('✅ User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error in logout:', error);
      return {
        success: false,
        error: 'Network error during logout'
      };
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Obtiene el usuario actual autenticado
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  /**
   * Restaura la sesión desde localStorage
   */
  async restoreSession(): Promise<{ success: boolean; error?: string }> {
    try {
      const accessToken = localStorage.getItem('supabase_access_token');
      const refreshToken = localStorage.getItem('supabase_refresh_token');

      if (!accessToken || !refreshToken) {
        return { success: false, error: 'No session data found' };
      }

      // Intentar restaurar la sesión con los tokens guardados
      const { data, error } = await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('❌ Error restoring session:', error);
        // Limpiar tokens inválidos
        localStorage.removeItem('supabase_access_token');
        localStorage.removeItem('supabase_refresh_token');
        localStorage.removeItem('supabase_expires_at');
        return { success: false, error: error.message };
      }

      console.log('✅ Session restored successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error restoring session:', error);
      return {
        success: false,
        error: 'Network error while restoring session'
      };
    }
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Sending password reset email:', email);

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Password reset email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error in resetPassword:', error);
      return {
        success: false,
        error: 'Network error while sending reset email'
      };
    }
  }

  /**
   * Actualiza la contraseña del usuario
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Updating user password');

      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Error updating password:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Password updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error in updatePassword:', error);
      return {
        success: false,
        error: 'Network error while updating password'
      };
    }
  }

  /**
   * Verifica el email del usuario actual
   */
  async verifyEmail(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 Sending email verification');

      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: (await this.getCurrentUser())?.email || '',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
        }
      });

      if (error) {
        console.error('❌ Error sending verification email:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Verification email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error in verifyEmail:', error);
      return {
        success: false,
        error: 'Network error while sending verification email'
      };
    }
  }
}

// Singleton pattern
export const authService = new AuthService();