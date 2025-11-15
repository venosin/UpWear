import { createClient } from '@supabase/supabase-js';

/**
 * Servicio para gestionar operaciones CRUD de categorías
 */
class CategoryService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }

  /**
   * Obtiene todas las categorías
   */
  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  /**
   * Crea una nueva categoría
   */
  async createCategory(categoryData: {
    name: string;
    slug?: string;
    description?: string;
    sort_order?: number;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          slug: categoryData.slug || this.generateSlug(categoryData.name),
          description: categoryData.description || '',
          sort_order: categoryData.sort_order || await this.getNextSortOrder(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createCategory:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualiza una categoría existente
   */
  async updateCategory(categoryId: string, updateData: {
    name?: string;
    slug?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  }) {
    try {
      const { error } = await this.supabase
        .from('categories')
        .update(updateData)
        .eq('id', categoryId);

      if (error) {
        console.error('Error updating category:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return { success: false, error };
    }
  }

  /**
   * Elimina una categoría (soft delete)
   */
  async deleteCategory(categoryId: string) {
    try {
      // Verificar si hay productos usando esta categoría
      const { data: products, error: checkError } = await this.supabase
        .from('products')
        .select('id')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .limit(1);

      if (checkError) {
        console.error('Error checking products:', checkError);
        return { success: false, error: checkError };
      }

      if (products && products.length > 0) {
        return {
          success: false,
          error: { message: 'No se puede eliminar una categoría que tiene productos activos' }
        };
      }

      // Soft delete
      const { error } = await this.supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene el próximo sort_order
   */
  async getNextSortOrder(): Promise<number> {
    try {
      const { data } = await this.supabase
        .from('categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

      return data && data.length > 0 ? (data[0].sort_order + 1) : 1;
    } catch (error) {
      console.error('Error getting next sort order:', error);
      return 1;
    }
  }

  /**
   * Genera slug a partir del nombre
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

// Exportar singleton
export const categoryService = new CategoryService();
export { CategoryService };
export default CategoryService;