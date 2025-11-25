'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductGrid from '@/components/products/ProductGrid';
import SectionHeader from '@/components/ui/SectionHeader';
import { shopService, Product } from '@/services/shopService';

export default function OfertasPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                // Obtener productos con descuento (sale_price < regular_price)
                const allProducts = await shopService.getAllProducts();
                const onSale = allProducts.filter(p =>
                    p.sale_price && p.sale_price < p.regular_price
                );
                setProducts(onSale);
            } catch (error) {
                console.error('Error loading offers:', error);
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
                    title="Ofertas Especiales"
                    subtitle="Ahorra Ahora"
                    centered
                />

                <p className="text-center text-gray-600 mt-4 mb-12 max-w-2xl mx-auto">
                    Aprovecha nuestras ofertas exclusivas. Descuentos de hasta 50% en productos seleccionados.
                </p>

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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay ofertas disponibles</h3>
                            <p className="mt-2 text-gray-500">Vuelve pronto para ver nuestras próximas promociones.</p>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
