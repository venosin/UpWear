/**
 * Componente CategoryGrid para mostrar categorías de productos
 * Diseño responsive con overlays y hover effects
 */

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// ==================== TIPOS ====================

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  imageAlt?: string;
  isNew?: boolean;
}

interface CategoryGridProps {
  categories: Category[];
  className?: string;
}

// ==================== COMPONENTE ====================

/**
 * Grid de categorías con diseño responsive y overlays
 * Hover effects y transiciones suaves
 */
export function CategoryGrid({ categories, className }: CategoryGridProps) {
  return (
    <section className={cn('py-12 sm:py-16 lg:py-20 bg-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections across different categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group relative block aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Background with placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Category Image</p>
                </div>
              </div>

              {/* Actual Image */}
              {category.image && (
                <img
                  src={category.image}
                  alt={category.imageAlt || category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="text-center px-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 group-hover:mb-2 transition-all duration-300">
                    {category.name}
                  </h3>
                  <div className="w-12 h-0.5 bg-white group-hover:w-16 transition-all duration-300"></div>
                </div>
              </div>

              {/* New Badge */}
              {category.isNew && (
                <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded uppercase tracking-wider">
                  New
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 font-medium text-sm transition-colors duration-200"
          >
            View All Categories
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4-4m4 4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;