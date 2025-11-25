'use client';

import { useEffect, useState } from 'react';
import RegisterModalContent from '@/components/auth/RegisterModalContent';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Hero from '@/components/ui/Hero';
import CategoryGrid from '@/components/categories/CategoryGrid';
import { shopService, Product } from '@/services/shopService';
import Link from 'next/link';

export default function RegisterPage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const [arrivals, featured] = await Promise.all([
        shopService.getNewArrivals(3),
        shopService.getFeaturedProducts(4)
      ]);
      setNewArrivals(arrivals);
      setFeaturedProducts(featured);
    };
    loadProducts();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background: Home Page Content */}
      <div className="relative">
        <Navbar />

        {/* Hero Section */}
        <section className="relative h-[600px] bg-black overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/hero-upwear.jpg"
              alt="Fashion Hero"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-none">
                Redefine
                <br />
                Your Style
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-lg">
                Descubre la colección más exclusiva de streetwear premium. Diseños únicos que marcan tendencia.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/shop"
                  className="bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  Explorar Colección
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* New Drops Section - Preview */}
        <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tight text-black">
              New Drops
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Brand-out with our latest collections—made designs, premium fabrics, and street-ready fits.
            </p>
          </div>

          {newArrivals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newArrivals.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute top-4 left-4 z-10 bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                    New
                  </div>
                  <div className="aspect-[3/4] overflow-hidden bg-gray-200">
                    <img
                      src={product.image_url || '/images/placeholders/product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-black group-hover:text-gray-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="text-2xl font-bold text-black">
                      ${product.price_sale}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Footer />
      </div>

      {/* Foreground: Register Modal */}
      <RegisterModalContent />
    </div>
  );
}