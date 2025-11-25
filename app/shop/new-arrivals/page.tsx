'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductGrid from '@/components/products/ProductGrid';
import SectionHeader from '@/components/ui/SectionHeader';
import { shopService, Product } from '@/services/shopService';

export default function NewArrivalsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await shopService.getNewArrivals(12);
                setProducts(data);
            } catch (error) {
                console.error('Error loading new arrivals:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SectionHeader
                    title="New Arrivals"
                    subtitle="Just In"
                    centered
                />

                <p className="text-center text-gray-600 mt-4 mb-12 max-w-2xl mx-auto">
                    Descubre las últimas tendencias y novedades en moda. Actualizamos nuestra colección semanalmente.
                </p>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                ) : products.length > 0 ? (
                    <ProductGrid products={products} />
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No hay productos nuevos en este momento.</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
