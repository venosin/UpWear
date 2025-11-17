'use client';

import { BaseService } from '@/lib/services/base-service';

/**
 * Servicio para gestionar operaciones CRUD de categorías
 * Conecta con Supabase para persistencia real de datos
 */
class CategoryService extends BaseService {

  /**
   * Obtiene todas las categorías activas desde la base de datos
   */
  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          parent_id,
          sort_order,
          is_active,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías (incluyendo inactivas) para admin
   */
  async getAllCategories() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          parent_id,
          sort_order,
          is_active,
          created_at,
          updated_at
        `)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading all categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva categoría usando API Route admin
   */
  async createCategory(categoryData: {
    name: string;
    slug?: string;
    description?: string;
    image_url?: string;
    parent_id?: number;
    sort_order?: number;
    is_active?: boolean;
  }) {
    try {
      console.log('🔧 Creating category via API Route:', categoryData);

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error creating category via API:', result);
        return { success: false, error: result.error || 'Failed to create category' };
      }

      console.log('✅ Category created successfully via API');
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Error in createCategory:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualiza una categoría usando API Route admin
   */
  async updateCategory(categoryId: number, updateData: {
    name?: string;
    slug?: string;
    description?: string;
    image_url?: string;
    parent_id?: number;
    sort_order?: number;
    is_active?: boolean;
  }) {
    try {
      console.log('🔧 Updating category via API Route:', categoryId, updateData);

      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error updating category via API:', result);
        return { success: false, error: result.error || 'Failed to update category' };
      }

      console.log('✅ Category updated successfully via API');
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Error in updateCategory:', error);
      return { success: false, error };
    }
  }

  /**
   * Elimina una categoría (soft delete) usando API Route admin
   */
  async deleteCategory(categoryId: number) {
    try {
      console.log('🗑️ Deleting category via API Route:', categoryId);

      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error deleting category via API:', result);
        return { success: false, error: result.error || 'Failed to delete category' };
      }

      console.log('✅ Category deleted successfully via API');
      return { success: true, message: result.message };
    } catch (error) {
      console.error('❌ Error in deleteCategory:', error);
      return { success: false, error };
    }
  }

  /**
   * Genera slug automáticamente desde el nombre
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
      .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones por un solo guion
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  }
}

// Singleton pattern
export const categoryService = new CategoryService();