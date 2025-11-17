'use client';

import { BaseService } from '@/lib/services/base-service';

/**
 * Servicio para gestionar operaciones CRUD de productos
 * Conecta con Supabase para persistencia real de datos
 */
class ProductService extends BaseService {

  /**
   * Carga categorías activas desde la base de datos
   */
  async getCategories() {
    return this.executeQuery(async () => {
      const { data, error } = await this.supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || this.getMockCategories();
    }, 'getCategories', this.getMockCategories());
  }

  /**
   * Carga marcas activas desde la base de datos
   */
  async getBrands() {
    try {
      const { data, error } = await this.supabase
        .from('brands')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading brands:', error);
        return this.getMockBrands();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBrands:', error);
      return this.getMockBrands();
    }
  }

  /**
   * Carga tallas disponibles
   */
  async getSizes() {
    try {
      const { data, error } = await this.supabase
        .from('sizes')
        .select('id, name, "order"')
        .eq('is_active', true)
        .order('"order"');

      if (error) {
        console.error('Error loading sizes:', error);
        return this.getMockSizes();
      }

      // Si la tabla tiene las nuevas columnas (después de ejecutar SQL)
      if (data && data.length > 0 && data[0].name) {
        return data;
      }

      // Fallback: Si aún no se ejecutó el SQL, usar lógica temporal
      const mockNames = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      return (data || []).map((size, index) => ({
        id: size.id,
        name: mockNames[index % mockNames.length],
        order: index + 1
      }));
    } catch (error) {
      console.error('Error in getSizes:', error);
      return this.getMockSizes();
    }
  }

  /**
   * Carga colores disponibles
   */
  async getColors() {
    try {
      const { data, error } = await this.supabase
        .from('colors')
        .select('id, name, hex')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading colors:', error);
        return this.getMockColors();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getColors:', error);
      return this.getMockColors();
    }
  }

  /**
   * Crea un nuevo producto en la base de datos
   */
  async createProduct(productData: any) {
    try {
      console.log('🚀 Creating product with data:', productData);

      // 1. Crear el producto principal
      const { data: product, error: productError } = await this.supabase
        .from('products')
        .insert({
          name: productData.basicInfo.name,
          slug: productData.basicInfo.slug,
          sku: productData.basicInfo.sku,
          description: productData.basicInfo.description,
          short_description: productData.basicInfo.shortDescription,
          price_original: productData.pricing.priceRegular, // Precio normal (mapeado a price_original)
          price_sale: productData.pricing.priceSale || 0, // Precio en oferta
          cost_price: productData.pricing.costPrice,
          track_inventory: true, // Por defecto activar tracking
          is_active: productData.basicInfo.isActive,
          is_featured: productData.basicInfo.isFeatured,
          gender: productData.basicInfo.gender,
          category_id: productData.basicInfo.categoryId,
          brand_id: productData.basicInfo.brandId
        })
        .select()
        .single();

      if (productError) {
        console.error('❌ Error creating product:', productError);
        throw new Error(`Error creating product: ${productError.message}`);
      }

      console.log('✅ Product created successfully:', product);

      // 2. Crear variantes si hay
      if (productData.variants && productData.variants.length > 0) {
        const variants = productData.variants.map((variant: any) => ({
          product_id: product.id,
          sku: variant.sku,
          price_override: variant.priceOverride,
          stock_quantity: variant.stockQuantity,
          size_id: variant.sizeId,
          color_id: variant.colorId || null, // Ahora debería existir después del SQL
          is_active: variant.isActive
        }));

        const { error: variantsError } = await this.adminSupabase
          .from('product_variants')
          .insert(variants);

        if (variantsError) {
          console.error('❌ Error creating variants:', variantsError);
          throw new Error(`Error creating variants: ${variantsError.message}`);
        }

        console.log('✅ Variants created successfully');
      }

      // 3. Subir imágenes (TODO: Implementar upload a Supabase Storage)
      if (productData.images && productData.images.length > 0) {
        console.log('📸 Images to upload:', productData.images);
        // TODO: Implementar upload real a Supabase Storage
        // Por ahora solo log
      }

      return {
        success: true,
        data: product,
        message: 'Producto creado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error in createProduct:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(productId: string, updateData: {
    name?: string;
    slug?: string;
    sku?: string;
    description?: string;
    short_description?: string;
    price_regular?: number;
    price_sale?: number;
    cost_price?: number;
    is_active?: boolean;
    is_featured?: boolean;
    gender?: string;
    category_id?: string | null;
    brand_id?: string | null;
  }) {
    try {
      console.log('🔧 Updating product with data:', updateData);

      // Usar API route de admin para actualizar con SERVICE ROLE KEY
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Error updating product:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ Product updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene un producto por su ID
   */
  async getProductById(productId: string) {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          brand:brands(name)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error loading product:', error);
        return null;
      }

      // Mapear las columnas de la base de datos al formato esperado
      if (data) {
        return {
          ...data,
          price_regular: data.price_original || data.price_regular, // Mapear price_original a price_regular
        };
      }

      return data;
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  }

  /**
   * Obtiene imágenes de un producto
   */
  async getProductImages(productId: string) {
    try {
      const { data, error } = await this.supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading product images:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProductImages:', error);
      return [];
    }
  }

  /**
   * Guarda imágenes de producto en la base de datos
   */
  async saveProductImages(productId: string, images: Array<{
    image_url: string;
    alt_text?: string;
    image_type?: string;
    sort_order?: number;
  }>) {
    try {
      const imagesToInsert = images.map((img, index) => ({
        product_id: productId,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        image_type: img.image_type || 'product',
        sort_order: img.sort_order !== undefined ? img.sort_order : index,
        is_active: true
      }));

      const { data, error } = await this.supabase
        .from('product_images')
        .insert(imagesToInsert)
        .select();

      if (error) {
        console.error('Error saving product images:', error);
        throw new Error(`Error saving images: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in saveProductImages:', error);
      throw error;
    }
  }

  /**
   * Actualiza información de una imagen
   */
  async updateProductImage(imageId: string, updates: {
    alt_text?: string;
    sort_order?: number;
    is_active?: boolean;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('product_images')
        .update(updates)
        .eq('id', imageId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product image:', error);
        throw new Error(`Error updating image: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateProductImage:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen (soft delete)
   */
  async deleteProductImage(imageId: string) {
    try {
      const { error } = await this.supabase
        .from('product_images')
        .update({ is_active: false })
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting product image:', error);
        throw new Error(`Error deleting image: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      throw error;
    }
  }

  /**
   * Actualiza el orden de las imágenes de un producto
   */
  async updateImageOrder(productId: string, imageOrders: Array<{
    id: string;
    sort_order: number;
  }>) {
    try {
      const updates = imageOrders.map(({ id, sort_order }) =>
        this.supabase
          .from('product_images')
          .update({ sort_order })
          .eq('id', id)
      );

      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(updates);

      return { success: true };
    } catch (error) {
      console.error('Error in updateImageOrder:', error);
      throw error;
    }
  }

  /**
   * Elimina un producto y sus imágenes asociadas
   */
  async deleteProduct(productId: string) {
    try {
      console.log('🗑️ Deleting product via API Route:', productId);

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error deleting product via API:', result);
        return { success: false, error: result.error || 'Failed to delete product' };
      }

      console.log('✅ Product deleted successfully via API');
      return { success: true, message: result.message };
    } catch (error) {
      console.error('❌ Error in deleteProduct:', error);
      return { success: false, error };
    }
  }

  /**
   * Genera SKU automáticamente
   */
  generateSKU(productName: string, category?: string): string {
    const prefix = category ? category.toUpperCase().substring(0, 3) : 'UW';
    const suffix = productName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${suffix}-${random}`;
  }

  // Métodos fallback con datos de ejemplo
  private getMockCategories() {
    return [
      { id: 1, name: 'Camisetas' },
      { id: 2, name: 'Pantalones' },
      { id: 3, name: 'Vestidos' },
      { id: 4, name: 'Chaquetas' },
      { id: 5, name: 'Accesorios' }
    ];
  }

  private getMockBrands() {
    return [
      { id: 1, name: 'UpWear' },
      { id: 2, name: 'Nike' },
      { id: 3, name: 'Adidas' },
      { id: 4, name: 'Puma' },
      { id: 5, name: 'Reebok' }
    ];
  }

  private getMockSizes() {
    return [
      { id: 1, name: 'XS', order: 1 },
      { id: 2, name: 'S', order: 2 },
      { id: 3, name: 'M', order: 3 },
      { id: 4, name: 'L', order: 4 },
      { id: 5, name: 'XL', order: 5 },
      { id: 6, name: 'XXL', order: 6 }
    ];
  }

  private getMockColors() {
    return [
      { id: 1, name: 'Negro', hex: '#000000' },
      { id: 2, name: 'Blanco', hex: '#FFFFFF' },
      { id: 3, name: 'Gris', hex: '#808080' },
      { id: 4, name: 'Azul', hex: '#0000FF' },
      { id: 5, name: 'Rojo', hex: '#FF0000' },
      { id: 6, name: 'Verde', hex: '#00FF00' }
    ];
  }
}

// Exportar singleton
export const productService = new ProductService();

// Exportar también la clase y el default
export { ProductService };
export default ProductService;