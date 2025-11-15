'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * Servicio para gestionar operaciones CRUD de productos
 * Conecta con Supabase para persistencia real de datos
 */
class ProductService {
  private supabase;

  constructor() {
    // Agregar logging para debug
    console.log('🔑 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Using anon key:', !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Test connection immediately
    this.testConnection();
  }

  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        console.log('❌ Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connection test passed');
      }
    } catch (err) {
      console.log('❌ Supabase connection error:', err);
    }
  }

  /**
   * Carga categorías activas desde la base de datos
   */
  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        return this.getMockCategories();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return this.getMockCategories();
    }
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
          price_regular: productData.pricing.priceRegular, // Precio normal
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

        const { error: variantsError } = await this.supabase
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