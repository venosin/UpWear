'use client';

import { BaseService } from '@/lib/services/base-service';

/**
 * Servicio para gestionar operaciones CRUD de clientes
 * Conecta con Supabase para persistencia real de datos
 */
class CustomerService extends BaseService {

  /**
   * Obtiene todos los clientes
   */
  async getCustomers() {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading customers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCustomers:', error);
      return [];
    }
  }

  /**
   * Crea un nuevo cliente
   */
  async createCustomer(customerData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .insert({
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          email: customerData.email.toLowerCase(),
          phone: customerData.phone || null,
          birth_date: customerData.birth_date || null,
          gender: customerData.gender || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createCustomer:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualiza un cliente existente
   */
  async updateCustomer(customerId: string, updateData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    is_active?: boolean;
  }) {
    try {
      const updateFields = { ...updateData };
      if (updateFields.email) {
        updateFields.email = updateFields.email.toLowerCase();
      }

      const { error } = await this.supabase
        .from('customers')
        .update(updateFields)
        .eq('id', customerId);

      if (error) {
        console.error('Error updating customer:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      return { success: false, error };
    }
  }

  /**
   * Elimina un cliente (soft delete)
   */
  async deleteCustomer(customerId: string) {
    try {
      // Verificar si el cliente tiene órdenes
      const { data: orders, error: checkError } = await this.supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1);

      if (checkError) {
        console.error('Error checking orders:', checkError);
        return { success: false, error: checkError };
      }

      if (orders && orders.length > 0) {
        return {
          success: false,
          error: { message: 'No se puede eliminar un cliente que tiene órdenes asociadas' }
        };
      }

      // Soft delete
      const { error } = await this.supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', customerId);

      if (error) {
        console.error('Error deleting customer:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene estadísticas de clientes
   */
  async getCustomerStats() {
    try {
      const { data: totalCustomers } = await this.supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: newCustomersThisMonth } = await this.supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      return {
        totalCustomers: totalCustomers?.length || 0,
        newCustomersThisMonth: newCustomersThisMonth?.length || 0
      };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      return {
        totalCustomers: 0,
        newCustomersThisMonth: 0
      };
    }
  }
}

// Exportar singleton
export const customerService = new CustomerService();
export { CustomerService };
export default CustomerService;