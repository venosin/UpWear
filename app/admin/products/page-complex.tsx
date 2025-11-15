/**
 * Página de listado de productos para administración
 * Incluye búsqueda, filtros, paginación y CRUD operations
 * Conectado a Supabase para obtener y gestionar productos
 */

import { createClient } from '@/lib/supabase/server';
import { AdminProductList } from '@/components/admin/products/AdminProductList';
import { Suspense } from 'react';

/**
 * Interfaz para datos de producto
 */
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_regular: number;
  price_sale: number;
  sku: string;
  track_inventory: boolean;
  is_active: boolean;
  is_featured: boolean;
  gender: string;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
  };
  brand?: {
    name: string;
  };
  variants?: {
    id: number;
    sku: string;
    price_override: number;
    stock_quantity: number;
    size?: {
      name: string;
    };
    color?: {
      name: string;
      hex: string;
    };
  }[];
  images?: {
    id: number;
    url: string;
    alt_text: string;
    image_type: string;
    sort_order: number;
  }[];
}

/**
 * Obtiene productos desde Supabase con filtros opcionales
 * @param search - Término de búsqueda
 * @param status - Filtro por estado
 * @param category - Filtro por categoría
 * @returns Promise<Product[]> - Lista de productos
 */
async function getProducts(
  search?: string,
  status?: string,
  category?: string
): Promise<Product[]> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        brand:brands(name),
        product_variants(
          id,
          sku,
          price_override,
          stock_quantity,
          size:sizes(name),
          color:colors(name, hex)
        ),
        product_images(
          id,
          url,
          alt_text,
          image_type,
          sort_order
        )
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (status) {
      if (status === 'active') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      } else if (status === 'featured') {
        query = query.eq('is_featured', true);
      } else if (status === 'out_of_stock') {
        query = query.eq('track_inventory', true).lt('total_stock', 1);
      }
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data as Product[];
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

/**
 * Obtiene categorías para el filtro
 * @returns Promise<{id: number, name: string}[]> - Lista de categorías
 */
async function getCategories() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

/**
 * Página principal de productos
 * Muestra el listado con filtros y opciones de gestión
 */
export default async function AdminProductsPage({
  searchParams
}: {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
}) {
  // Obtener parámetros de búsqueda - Next.js 16 requires await for searchParams
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';
  const status = resolvedSearchParams?.status || '';
  const category = resolvedSearchParams?.category || '';
  const page = parseInt(resolvedSearchParams?.page || '1');

  // Obtener datos en paralelo
  const [products, categories] = await Promise.all([
    getProducts(search, status, category),
    getCategories()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1b14]">Productos</h1>
          <p className="text-[#676960] mt-1">
            Gestiona tu catálogo de productos ({products.length} productos)
          </p>
        </div>

        <a
          href="/admin/products/create"
          className="inline-flex items-center px-4 py-2 bg-[#41423a] text-white font-medium rounded-lg hover:bg-[#1a1b14] transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Producto
        </a>
      </div>

      {/* Componente de listado con Suspense para loading states */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#41423a]"></div>
          </div>
        }
      >
        <AdminProductList
          products={products}
          categories={categories}
          search={search}
          status={status}
          category={category}
          currentPage={page}
        />
      </Suspense>
    </div>
  );
}