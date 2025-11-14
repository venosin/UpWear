/**
 * Página de creación de productos
 * Formulario completo para agregar nuevos productos al catálogo
 * Conectado a Supabase para persistir datos
 */

import { ProductForm } from '@/components/admin/products/ProductForm';
import Link from 'next/link';

/**
 * Página principal para crear productos
 * Muestra formulario con validaciones y configuración
 */
export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1b14]">Crear Producto</h1>
          <p className="text-[#676960] mt-1">
            Agrega un nuevo producto a tu catálogo
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center px-4 py-2 border border-[#b5b6ad] text-[#41423a] font-medium rounded-lg hover:bg-[#b5b6ad]/10 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a productos
        </Link>
      </div>

      {/* Formulario */}
      <ProductForm />
    </div>
  );
}