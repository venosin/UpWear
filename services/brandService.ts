import { createClient } from '@supabase/supabase-js';

/**
 * Servicio para gestionar operaciones CRUD de marcas
 */
class BrandService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }

  /**
   * Obtiene todas las marcas
   */
  async getBrands() {
    try {
      const { data, error } = await this.supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading brands:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBrands:', error);
      return [];
    }
  }

  /**
   * Crea una nueva marca
   */
  async createBrand(brandData: {
    name: string;
    slug?: string;
    description?: string;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('brands')
        .insert({
          name: brandData.name,
          slug: brandData.slug || this.generateSlug(brandData.name),
          description: brandData.description || '',
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating brand:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createBrand:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualiza una marca existente
   */
  async updateBrand(brandId: string, updateData: {
    name?: string;
    slug?: string;
    description?: string;
    is_active?: boolean;
  }) {
    try {
      const { error } = await this.supabase
        .from('brands')
        .update(updateData)
        .eq('id', brandId);

      if (error) {
        console.error('Error updating brand:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateBrand:', error);
      return { success: false, error };
    }
  }

  /**
   * Elimina una marca (soft delete)
   */
  async deleteBrand(brandId: string) {
    try {
      // Verificar si hay productos usando esta marca
      const { data: products, error: checkError } = await this.supabase
        .from('products')
        .select('id')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .limit(1);

      if (checkError) {
        console.error('Error checking products:', checkError);
        return { success: false, error: checkError };
      }

      if (products && products.length > 0) {
        return {
          success: false,
          error: { message: 'No se puede eliminar una marca que tiene productos activos' }
        };
      }

      // Soft delete
      const { error } = await this.supabase
        .from('brands')
        .update({ is_active: false })
        .eq('id', brandId);

      if (error) {
        console.error('Error deleting brand:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteBrand:', error);
      return { success: false, error };
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
export const brandService = new BrandService();
export { BrandService };
export default BrandService;