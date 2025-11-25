'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductGrid from '@/components/products/ProductGrid';
import SectionHeader from '@/components/ui/SectionHeader';
import { shopService, Product } from '@/services/shopService';

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'featured'>('all');

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                let data: Product[] = [];

                switch (filter) {
                    case 'new':
                        data = await shopService.getNewArrivals(12);
                        break;
                    case 'featured':
                        data = await shopService.getFeaturedProducts(12);
                        break;
                    default:
                        data = await shopService.getAllProducts();
                        break;
                }

                setProducts(data);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [filter]);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SectionHeader
                    title="Tienda"
                    subtitle="Explora"
                    centered
                />

                <p className="text-center text-gray-600 mt-4 mb-8 max-w-2xl mx-auto">
                    Descubre nuestra colección completa de productos premium
                </p>

                {/* Filters */}
                <div className="flex justify-center gap-4 mb-12">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('new')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === 'new'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Nuevos
                    </button>
                    <button
                        onClick={() => setFilter('featured')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === 'featured'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Destacados
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                ) : products.length > 0 ? (
                    <ProductGrid products={products} />
                ) : (
                    <div className="text-center py-20">
                        <div className="max-w-md mx-auto">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay productos disponibles</h3>
                            <p className="mt-2 text-gray-500">Vuelve pronto para ver nuestros productos.</p>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
