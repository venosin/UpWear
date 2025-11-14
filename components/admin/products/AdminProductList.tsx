'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Package,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '../Card';

/**
 * Props para el componente AdminProductList
 */
interface AdminProductListProps {
  products: any[];
  categories: any[];
  search: string;
  status: string;
  category: string;
  currentPage: number;
}

/**
 * Componente de productos paginados con Lazy Loading
 * Optimizado para rendimiento con large datasets
 */
function ProductGrid({
  products,
  currentPage,
  productsPerPage
}: {
  products: any[];
  currentPage: number;
  productsPerPage: number;
}) {
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <>
      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-[#b5b6ad]/30 rounded-lg">
          <div className="text-sm text-[#676960]">
            Mostrando {startIndex + 1}-{Math.min(endIndex, products.length)} de {products.length} productos
          </div>
          <div className="flex items-center space-x-2">
            {currentPage > 1 && (
              <Link
                href={`/admin/products?page=${currentPage - 1}`}
                className="px-3 py-1 text-sm border border-[#b5b6ad] rounded hover:bg-[#b5b6ad]/10 transition-colors"
              >
                Anterior
              </Link>
            )}
            <span className="px-3 py-1 text-sm bg-[#41423a] text-white rounded">
              {currentPage}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/admin/products?page=${currentPage + 1}`}
                className="px-3 py-1 text-sm border border-[#b5b6ad] rounded hover:bg-[#b5b6ad]/10 transition-colors"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Componente de tarjeta de producto individual
 * Muestra información clave y acciones rápidas
 */
function ProductCard({ product }: { product: any }) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Obtener imagen principal o placeholder
  const mainImage = product.product_images?.find((img: any) => img.image_type === 'main');
  const imageUrl = mainImage?.url || null;

  // Calcular stock total
  const totalStock = product.product_variants?.reduce((sum: number, variant: any) =>
    sum + (variant.stock_quantity || 0), 0
  ) || 0;

  // Determinar stock status
  const stockStatus = totalStock === 0 ? 'out_of_stock' :
                     totalStock < 10 ? 'low_stock' : 'in_stock';

  const statusColors = {
    out_of_stock: 'bg-red-100 text-red-700 border-red-200',
    low_stock: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    in_stock: 'bg-green-100 text-green-700 border-green-200'
  };

  const statusLabels = {
    out_of_stock: 'Sin stock',
    low_stock: 'Stock bajo',
    in_stock: 'En stock'
  };

  return (
    <div className="bg-white border border-[#b5b6ad]/30 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen del producto */}
      <div className="aspect-square bg-[#b5b6ad]/20 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-[#8e9087]" />
          </div>
        )}

        {/* Overlay con estado del stock */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${statusColors[stockStatus as keyof typeof statusColors]}`}>
            {statusLabels[stockStatus as keyof typeof statusLabels]}
          </span>
        </div>

        {/* Menú de acciones */}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 bg-white/90 backdrop-blur-sm rounded-md hover:bg-white transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-[#41423a]" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-[#b5b6ad]/30 z-10">
                <div className="py-1">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex items-center px-4 py-2 text-sm text-[#676960] hover:bg-[#b5b6ad]/10 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className="flex items-center px-4 py-2 text-sm text-[#676960] hover:bg-[#b5b6ad]/10 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver en tienda
                  </Link>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <div className="space-y-2">
          {/* Nombre y SKU */}
          <div>
            <h3 className="font-semibold text-[#1a1b14] line-clamp-1">{product.name}</h3>
            <p className="text-xs text-[#8e9087]">SKU: {product.sku}</p>
          </div>

          {/* Categoría y marca */}
          <div className="flex items-center justify-between text-xs text-[#676960]">
            {product.category && (
              <span className="bg-[#b5b6ad]/20 px-2 py-1 rounded">
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <span className="font-medium">{product.brand.name}</span>
            )}
          </div>

          {/* Precios */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-[#41423a]">
                ${product.price_sale?.toFixed(2) || '0.00'}
              </p>
              {product.price_regular && product.price_regular !== product.price_sale && (
                <p className="text-sm text-[#8e9087] line-through">
                  ${product.price_regular.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Estado y variantes */}
          <div className="flex items-center justify-between text-xs">
            <span className={`px-2 py-1 rounded ${
              product.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {product.is_active ? 'Activo' : 'Inactivo'}
            </span>
            {product.product_variants && (
              <span className="text-[#676960]">
                {product.product_variants.length} variant{product.product_variants.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente principal de listado de productos
 * Incluye filtros, búsqueda y grid de productos
 */
export function AdminProductList({
  products,
  categories,
  search,
  status,
  category,
  currentPage
}: AdminProductListProps) {
  const [searchTerm, setSearchTerm] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const productsPerPage = 12;

  // Filtrar productos basado en los parámetros
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [products, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8e9087] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar productos por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#b5b6ad] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087]"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-[#41423a] text-[#41423a] hover:bg-[#41423a] hover:text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Filtros adicionales */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#b5b6ad]/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por estado */}
                <div>
                  <label className="block text-sm font-medium text-[#676960] mb-2">
                    Estado
                  </label>
                  <select className="w-full px-3 py-2 border border-[#b5b6ad] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#41423a]">
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    <option value="featured">Destacados</option>
                    <option value="out_of_stock">Sin stock</option>
                  </select>
                </div>

                {/* Filtro por categoría */}
                <div>
                  <label className="block text-sm font-medium text-[#676960] mb-2">
                    Categoría
                  </label>
                  <select className="w-full px-3 py-2 border border-[#b5b6ad] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#41423a]">
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por ordenamiento */}
                <div>
                  <label className="block text-sm font-medium text-[#676960] mb-2">
                    Ordenar por
                  </label>
                  <select className="w-full px-3 py-2 border border-[#b5b6ad] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#41423a]">
                    <option value="created_desc">Más recientes primero</option>
                    <option value="created_asc">Más antiguos primero</option>
                    <option value="name_asc">Nombre A-Z</option>
                    <option value="name_desc">Nombre Z-A</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas del listado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-[#41423a]" />
              <div>
                <p className="text-2xl font-bold text-[#1a1b14]">{products.length}</p>
                <p className="text-sm text-[#676960]">Total productos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1b14]">
                  {products.filter(p => p.is_active).length}
                </p>
                <p className="text-sm text-[#676960]">Productos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1b14]">
                  {products.filter(p => p.is_featured).length}
                </p>
                <p className="text-sm text-[#676960]">Destacados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1b14]">
                  {products.filter(p => {
                    const totalStock = p.product_variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) || 0;
                    return totalStock === 0;
                  }).length}
                </p>
                <p className="text-sm text-[#676960]">Sin stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de productos */}
      {filteredProducts.length > 0 ? (
        <ProductGrid
          products={filteredProducts}
          currentPage={currentPage}
          productsPerPage={productsPerPage}
        />
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-[#b5b6ad] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1a1b14] mb-2">No se encontraron productos</h3>
            <p className="text-[#676960] mb-4">
              {searchTerm
                ? `No hay productos que coincidan con "${searchTerm}"`
                : 'No hay productos en el catálogo'
              }
            </p>
            <a
              href="/admin/products/create"
              className="inline-flex items-center px-4 py-2 bg-[#41423a] text-white font-medium rounded-lg hover:bg-[#1a1b14] transition-colors"
            >
              Crear primer producto
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}