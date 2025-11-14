/**
 * Homepage - Tienda de Ropa E-commerce
 * Diseño pixel perfect inspirado en UI Shop Home(1)
 * Arquitectura limpia con componentes reutilizables
 */

'use client';

import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/ui/Hero';
import CategoryGrid from '@/components/ui/CategoryGrid';
import Footer from '@/components/ui/Footer';

// Mock data for categories
const categories = [
  {
    id: 'womens-clothing',
    name: "Women's Clothing",
    slug: "womens",
    image: "/api/placeholder/womens-fashion.jpg",
    imageAlt: "Women's fashion collection",
    isNew: true
  },
  {
    id: 'mens-clothing',
    name: "Men's Clothing",
    slug: "mens",
    image: "/api/placeholder/mens-fashion.jpg",
    imageAlt: "Men's fashion collection"
  },
  {
    id: 'accessories',
    name: "Accessories",
    slug: "accessories",
    image: "/api/placeholder/accessories.jpg",
    imageAlt: "Fashion accessories"
  },
  {
    id: 'shoes',
    name: "Shoes",
    slug: "shoes",
    image: "/api/placeholder/shoes.jpg",
    imageAlt: "Shoes collection"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section - Exactamente como Home(1) */}
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
      <CategoryGrid categories={categories} />

      {/* Footer */}
      <Footer />
    </main>
  );
}