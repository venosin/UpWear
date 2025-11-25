import { createClient } from '@/lib/supabase/client';

export interface Product {
  id: number;
  name: string;
  slug: string;
  price_sale: number;
  price_original: number;
  image_url: string;
  category_name?: string;
  is_new?: boolean;
}

export interface ProductVariant {
  id: number;
  size_id: number;
  color?: string;
  color_code?: string;
  stock_quantity: number;
  price_override?: number;
  sku: string;
  size?: { name: string };
  // UI helper
  color_obj?: { name: string; hex: string };
}

export interface ProductDetail extends Product {
  description: string;
  images: { url: string; alt_text: string }[];
  variants: ProductVariant[];
  brand?: { name: string };
  category?: { name: string; slug: string };
}

class ShopService {
  private supabase = createClient();

  /**
   * Get featured products for the homepage
   */
  async getFeaturedProducts(limit = 4): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price_sale,
          price_original,
          is_featured,
          created_at,
          images:product_images(url)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit);

      if (error) {
        console.error('Error fetching featured products:', error);
        return [];
      }

      return this.mapProducts(data);
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      return [];
    }
  }

  /**
   * Get new arrivals (most recent products)
   */
  async getNewArrivals(limit = 4): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price_sale,
          price_original,
          created_at,
          images:product_images(url)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching new arrivals:', error);
        return [];
      }

      return this.mapProducts(data);
    } catch (error) {
      console.error('Error in getNewArrivals:', error);
      return [];
    }
  }

  /**
   * Get full product details by slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetail | null> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          images:product_images(url, alt_text, sort_order),
          brand:brands(name),
          category:categories(name, slug),
          variants:product_variants(
            id,
            size_id,
            color,
            color_code,
            stock_quantity,
            price_override,
            sku,
            size:sizes(name)
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product by slug:', JSON.stringify(error, null, 2));
        return null;
      }

      // Sort images by sort_order
      const sortedImages = (data.images || []).sort((a: any, b: any) =>
        (a.sort_order || 0) - (b.sort_order || 0)
      );

      // Map variants to include color object for UI consistency
      const variants = (data.variants || []).map((v: any) => ({
        ...v,
        color_obj: v.color ? { name: v.color, hex: v.color_code || '#000000' } : null
      }));

      return {
        ...data,
        price_sale: data.price_sale,
        price_original: data.price_original || data.price_sale,
        image_url: sortedImages[0]?.url || '/images/placeholders/product-placeholder.jpg',
        images: sortedImages,
        variants: variants
      };
    } catch (error) {
      console.error('Error in getProductBySlug:', error);
      return null;
    }
  }

  /**
   * Get related products (same category)
   */
  async getRelatedProducts(categoryId: number, excludeProductId: number, limit = 4): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price_sale,
          price_original,
          created_at,
          images:product_images(url)
        `)
        .eq('category_id', categoryId)
        .neq('id', excludeProductId)
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        console.error('Error fetching related products:', error);
        return [];
      }

      return this.mapProducts(data);
    } catch (error) {
      console.error('Error in getRelatedProducts:', error);
      return [];
    }
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price_sale,
          price_original,
          created_at,
          images:product_images(url)
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching all products:', error);
        return [];
      }

      return this.mapProducts(data);
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      return [];
    }
  }

  /**
   * Helper to map database results to Product interface
   */
  private mapProducts(data: any[]): Product[] {
    return data.map(item => {
      // Get the first image or a placeholder
      const imageUrl = item.images && item.images.length > 0
        ? item.images[0].url
        : '/images/placeholders/product-placeholder.jpg';

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        price_sale: item.price_sale,
        price_original: item.price_original || item.price_sale,
        image_url: imageUrl,
        is_new: this.isNewProduct(item.created_at)
      };
    });
  }

  /**
   * Check if a product is considered "new" (e.g., created in the last 30 days)
   */
  private isNewProduct(createdAt: string): boolean {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }
}

export const shopService = new ShopService();
