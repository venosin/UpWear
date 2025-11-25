/**
 * Homepage - Tienda de Ropa E-commerce
 * Diseño moderno inspirado en Frameblox/Randoblox
 */

'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { shopService, Product } from '@/services/shopService';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newProducts, featured] = await Promise.all([
          shopService.getNewArrivals(6),
          shopService.getFeaturedProducts(3)
        ]);
        setNewArrivals(newProducts);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Moderno y Minimalista */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-upwear.jpg"
            alt="Fashion Hero"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-left">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-300 mb-6 font-medium">
              The Latest Arrivals
            </p>
            <h1 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-none tracking-tight">
              NEW<br />COLLECTION
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-xl leading-relaxed">
              Shop the latest trends with our curated collection of premium fashion
            </p>

            <div className="flex gap-4">
              <Link
                href="/shop/new-arrivals"
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-gray-100 transition-all duration-300"
              >
                Shop Now
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 border-2 border-white text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
              >
                View All
              </Link>
            </div>

            <p className="text-sm text-gray-400 mt-8">
              Free shipping on orders over $100
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* New Drops Section */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tight text-black">
            New Drops
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Brand-out with our latest collections—made designs, premium fabrics, and street-ready fits. Drop every 1st week. New or never. Don't miss out.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newArrivals.slice(0, 3).map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group relative bg-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* NEW Badge */}
                <div className="absolute top-4 left-4 z-10 bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  New
                </div>

                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-200">
                  <img
                    src={product.image_url || '/images/placeholders/product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-black group-hover:text-gray-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-black">
                      ${product.price_sale}
                      {product.price_sale < product.price_original && (
                        <span className="text-lg text-gray-400 line-through ml-2">
                          ${product.price_original}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/shop/new-arrivals"
            className="inline-flex items-center gap-2 text-lg font-bold uppercase tracking-wider hover:gap-4 transition-all"
          >
            View All New Arrivals
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Featured Banner */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
        </div>

        <div className="relative z-10 text-center px-6">
          <h2 className="text-5xl lg:text-7xl font-black mb-6 uppercase tracking-tight">
            Community-Driven<br />Culture
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join a movement of like-minded individuals who define their own style and culture
          </p>
          <Link
            href="/nosotros"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-gray-100 transition-all"
          >
            Explore
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50">
        <div className="mb-16 text-center">
          <h2 className="text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tight text-black">
            Trending Now
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't miss out on what everyone's talking about
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={product.image_url || '/images/placeholders/product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1 text-black">{product.name}</h3>
                <p className="text-2xl font-black text-black">
                  ${product.price_sale}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tight text-black">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Women's", image: "/images/categories/women.jpg", slug: "mujer" },
            { name: "Men's", image: "/images/categories/men.jpg", slug: "hombre" },
            { name: "Accessories", image: "/images/categories/accessories.jpg", slug: "accesorios" },
            { name: "Shoes", image: "/images/categories/shoes.jpg", slug: "calzado" }
          ].map((category) => (
            <Link
              key={category.slug}
              href={`/shop/category/${category.slug}`}
              className="group relative h-80 rounded-2xl overflow-hidden"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}