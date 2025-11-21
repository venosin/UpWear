/**
 * Homepage - Tienda de Ropa E-commerce
 * Diseño pixel perfect inspirado en UI Shop Home(2)
 * Arquitectura limpia con componentes reutilizables
 */

'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/ui/Hero';
import CategoryGrid from '@/components/ui/CategoryGrid';
import Footer from '@/components/ui/Footer';
import SectionHeader from '@/components/ui/SectionHeader';
import ProductGrid from '@/components/products/ProductGrid';
import { shopService, Product } from '@/services/shopService';

// Mock data for categories (could be moved to service later)
const categories = [
  {
    id: 'womens-clothing',
    name: "Women's Clothing",
    slug: "womens",
    image: "/images/categories/women.jpg",
    imageAlt: "Women's fashion collection",
    isNew: true
  },
  {
    id: 'mens-clothing',
    name: "Men's Clothing",
    slug: "mens",
    image: "/images/categories/men.jpg",
    imageAlt: "Men's fashion collection"
  },
  {
    id: 'accessories',
    name: "Accessories",
    slug: "accessories",
    image: "/images/categories/accessories.jpg",
    imageAlt: "Fashion accessories"
  },
  {
    id: 'shoes',
    name: "Shoes",
    slug: "shoes",
    image: "/images/categories/shoes.jpg",
    imageAlt: "Shoes collection"
  }
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newProducts, featured] = await Promise.all([
          shopService.getNewArrivals(4),
          shopService.getFeaturedProducts(4)
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
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <Hero
        title="NEW COLLECTION"
        subtitle="THE LATEST ARRIVALS"
        description="Shop the latest trends with our curated collection of premium fashion"
        ctaText="SHOP NOW"
        ctaLink="/shop/new-arrivals"
        secondaryCtaText="VIEW ALL"
        secondaryCtaLink="/shop"
      />

      {/* Categories Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <SectionHeader
          title="Shop by Category"
          centered
        />
        <CategoryGrid categories={categories} />
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto bg-gray-50">
        <SectionHeader
          title="New Arrivals"
          subtitle="Just In"
          linkText="View All"
          linkUrl="/shop/new-arrivals"
        />
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <ProductGrid products={newArrivals} />
        )}
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <SectionHeader
          title="Trending Now"
          subtitle="Don't Miss Out"
          linkText="View Collection"
          linkUrl="/shop/featured"
        />
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <ProductGrid products={featuredProducts} />
        )}
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}