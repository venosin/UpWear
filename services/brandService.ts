'use client';

import { BaseService } from '@/lib/services/base-service';
import { Brand, BrandCreate, BrandUpdate, BrandValidation } from '@/types/brands';

/**
 * Servicio para gestionar operaciones CRUD de marcas
 * Conecta con Supabase para persistencia real de datos
 */
class BrandService extends BaseService {

  /**
   * Obtiene todas las marcas activas desde la base de datos
   */
  async getBrands(): Promise<Brand[]> {
    try {
      const { data, error } = await this.supabase
        .from('brands')
        .select(`
          id,
          name,
          slug,
          description,
          logo_url,
          banner_url,
          country,
          website_url,
          is_featured,
          is_active,
          metadata,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading brands:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBrands:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las marcas (incluyendo inactivas) para admin
   */
  async getAllBrands(): Promise<Brand[]> {
    try {
      const { data, error } = await this.supabase
        .from('brands')
        .select(`
          id,
          name,
          slug,
          description,
          logo_url,
          banner_url,
          country,
          website_url,
          is_featured,
          is_active,
          metadata,
          created_at,
          updated_at
        `)
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading all brands:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllBrands:', error);
      throw error;
    }
  }

  /**
   * Obtiene marcas destacadas
   */
  async getFeaturedBrands(): Promise<Brand[]> {
    try {
      const { data, error } = await this.supabase
        .from('brands')
        .select(`
          id,
          name,
          slug,
          description,
          logo_url,
          banner_url,
          country,
          website_url,
          is_featured,
          is_active,
          metadata,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading featured brands:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeaturedBrands:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva marca usando API Route admin
   */
  async createBrand(brandData: BrandCreate) {
    try {
      console.log('🔧 Creating brand via API Route:', brandData);

      // Validaciones específicas
      if (!brandData.name || brandData.name.trim() === '') {
        return { success: false, error: { message: 'Brand name is required' } };
      }

      // Validar country si se proporciona
      if (brandData.country && !BrandValidation.isValidCountryCode(brandData.country)) {
        return { success: false, error: { message: 'Invalid country code. Must be ISO 3166-1 alpha-2 (2 characters)' } };
      }

      // Validar URLs si se proporcionan
      if (brandData.logo_url && !BrandValidation.isValidUrl(brandData.logo_url)) {
        return { success: false, error: { message: 'Invalid logo URL' } };
      }

      if (brandData.banner_url && !BrandValidation.isValidUrl(brandData.banner_url)) {
        return { success: false, error: { message: 'Invalid banner URL' } };
      }

      if (brandData.website_url && !BrandValidation.isValidUrl(brandData.website_url)) {
        return { success: false, error: { message: 'Invalid website URL' } };
      }

      // Generar slug si no se proporciona
      if (!brandData.slug) {
        brandData.slug = BrandValidation.generateSlug(brandData.name);
      }

      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error creating brand via API:', result);
        return { success: false, error: result.error || 'Failed to create brand' };
      }

      console.log('✅ Brand created successfully via API');
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Error in createBrand:', error);
      return { success: false, error };
    }
  }

  /**
   * Actualiza una marca usando API Route admin
   */
  async updateBrand(brandId: number, updateData: BrandUpdate) {
    try {
      console.log('🔧 Updating brand via API Route:', brandId, updateData);

      // Validaciones específicas
      if (updateData.country && !BrandValidation.isValidCountryCode(updateData.country)) {
        return { success: false, error: { message: 'Invalid country code. Must be ISO 3166-1 alpha-2 (2 characters)' } };
      }

      if (updateData.logo_url && !BrandValidation.isValidUrl(updateData.logo_url)) {
        return { success: false, error: { message: 'Invalid logo URL' } };
      }

      if (updateData.banner_url && !BrandValidation.isValidUrl(updateData.banner_url)) {
        return { success: false, error: { message: 'Invalid banner URL' } };
      }

      if (updateData.website_url && !BrandValidation.isValidUrl(updateData.website_url)) {
        return { success: false, error: { message: 'Invalid website URL' } };
      }

      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error updating brand via API:', result);
        return { success: false, error: result.error || 'Failed to update brand' };
      }

      console.log('✅ Brand updated successfully via API');
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Error in updateBrand:', error);
      return { success: false, error };
    }
  }

  /**
   * Elimina una marca (soft delete) usando API Route admin
   */
  async deleteBrand(brandId: number) {
    try {
      console.log('🗑️ Deleting brand via API Route:', brandId);

      // Verificar si hay productos activos usando esta marca
      const response = await fetch(`/api/admin/brands/${brandId}`);
      const brandData = await response.json();

      if (brandData.success && brandData.data && brandData.data.product_count > 0) {
        return {
          success: false,
          error: { message: 'Cannot delete brand with active products' }
        };
      }

      const deleteResponse = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await deleteResponse.json();

      if (!deleteResponse.ok) {
        console.error('❌ Error deleting brand via API:', result);
        return { success: false, error: result.error || 'Failed to delete brand' };
      }

      console.log('✅ Brand deleted successfully via API');
      return { success: true, message: result.message };
    } catch (error) {
      console.error('❌ Error in deleteBrand:', error);
      return { success: false, error };
    }
  }

  /**
   * Busca marcas por nombre
   */
  async searchBrands(query: string): Promise<Brand[]> {
    try {
      const { data, error } = await this.supabase
        .from('brands')
        .select(`
          id,
          name,
          slug,
          description,
          logo_url,
          banner_url,
          country,
          website_url,
          is_featured,
          is_active,
          metadata,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error searching brands:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchBrands:', error);
      throw error;
    }
  }
}

// Singleton pattern
export const brandService = new BrandService();