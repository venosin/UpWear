'use client';

import { BaseService } from '@/lib/services/base-service';
import { Profile, ProfileCreate, ProfileUpdate, CustomerValidation } from '@/types/customers';

/**
 * Servicio para gestionar operaciones CRUD de clientes (perfiles)
 * Conecta con Supabase para persistencia real de datos
 */
class CustomerService extends BaseService {

  /**
   * Obtiene todos los perfiles (solo para admin)
   */
  async getAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          role,
          avatar_url,
          email_verified,
          phone_verified,
          birth_date,
          gender,
          preferences,
          metadata,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading profiles:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllProfiles:', error);
      throw error;
    }
  }

  /**
   * Obtiene un perfil específico por ID
   */
  async getProfileById(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          role,
          avatar_url,
          email_verified,
          phone_verified,
          birth_date,
          gender,
          preferences,
          metadata,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfileById:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getCurrentProfile(): Promise<Profile | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) {
        return null;
      }

      return await this.getProfileById(user.id);
    } catch (error) {
      console.error('Error getting current profile:', error);
      throw error;
    }
  }

  /**
   * Busca perfiles por nombre o email
   */
  async searchProfiles(query: string): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          role,
          avatar_url,
          email_verified,
          phone_verified,
          birth_date,
          gender,
          preferences,
          metadata,
          created_at,
          updated_at
        `)
        .or(`full_name.ilike.%${query}%, phone.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching profiles:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchProfiles:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo perfil usando API Route admin
   */
  async createProfile(profileData: ProfileCreate) {
    try {
      console.log('🔧 Creating profile via API Route:', profileData);

      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error creating profile via API:', result);
        return { success: false, error: result.error || 'Failed to create profile' };
      }

      console.log('✅ Profile created successfully via API');
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Error in createProfile:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualiza un perfil usando API Route admin
   */
  async updateProfile(userId: string, updateData: ProfileUpdate) {
    try {
      console.log('🔧 Updating profile via API Route:', userId, updateData);

      // Validaciones específicas
      if (updateData.phone && !CustomerValidation.isValidPhone(updateData.phone)) {
        return { success: false, error: { message: 'Invalid phone number format' } };
      }

      if (updateData.birth_date && !CustomerValidation.isValidDate(updateData.birth_date)) {
        return { success: false, error: { message: 'Invalid date format. Use YYYY-MM-DD' } };
      }

      if (updateData.avatar_url && !CustomerValidation.isValidImage(updateData.avatar_url)) {
        return { success: false, error: { message: 'Invalid image URL format' } };
      }

      const response = await fetch(`/api/admin/customers/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error updating profile via API:', result);
        return { success: false, error: result.error || 'Failed to update profile' };
      }

      console.log('✅ Profile updated successfully via API');
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Error in updateProfile:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  async updateCurrentProfile(updateData: ProfileUpdate) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) {
        return { success: false, error: { message: 'User not authenticated' } };
      }

      return await this.updateProfile(user.id, updateData);
    } catch (error) {
      console.error('Error updating current profile:', error);
      return { success: false, error };
    }
  }

  /**
   * Elimina un perfil (soft delete) usando API Route admin
   */
  async deleteProfile(userId: string) {
    try {
      console.log('🗑️ Deleting profile via API Route:', userId);

      // Verificar si el usuario tiene órdenes activas
      const response = await fetch(`/api/admin/customers/${userId}/check-orders`);
      const orderData = await response.json();

      if (orderData.success && orderData.data?.activeOrders > 0) {
        return {
          success: false,
          error: { message: 'Cannot delete customer with active orders' }
        };
      }

      const deleteResponse = await fetch(`/api/admin/customers/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await deleteResponse.json();

      if (!deleteResponse.ok) {
        console.error('❌ Error deleting profile via API:', result);
        return { success: false, error: result.error || 'Failed to delete profile' };
      }

      console.log('✅ Profile deleted successfully via API');
      return { success: true, message: result.message };
    } catch (error) {
      console.error('❌ Error in deleteProfile:', error);
      return { success: false, error };
    }
  }

  /**
   * Verifica email de usuario
   */
  async verifyEmail(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/customers/${userId}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return response.ok && result.success;
    } catch (error) {
      console.error('Error verifying email:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de clientes
   */
  async getCustomerStats() {
    try {
      const response = await fetch('/api/admin/customers/stats');
      const result = await response.json();
      return response.ok ? result.data : null;
    } catch (error) {
      console.error('Error getting customer stats:', error);
      return null;
    }
  }
}

// Singleton pattern
export const customerService = new CustomerService();