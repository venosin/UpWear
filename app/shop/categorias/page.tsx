'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import CategoryGrid from '@/components/ui/CategoryGrid';
import SectionHeader from '@/components/ui/SectionHeader';
import { createClient } from '@/lib/supabase/client';

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    imageAlt: string;
    isNew?: boolean;
}

export default function CategoriasPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('active', true)
                    .is('parent_id', null) // Solo categorías principales
                    .order('sort_order', { ascending: true });

                if (error) throw error;

                const formattedCategories: Category[] = (data || []).map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    image: cat.image_url || '/images/placeholders/category.jpg',
                    imageAlt: cat.description || cat.name,
                    isNew: cat.created_at && new Date(cat.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }));

                setCategories(formattedCategories);
            } catch (error) {
                console.error('Error loading categories:', error);
                // Fallback a categorías mock
                setCategories([
                    {
                        id: '1',
                        name: "Ropa de Mujer",
                        slug: "mujer",
                        image: "/images/categories/women.jpg",
                        imageAlt: "Colección de moda femenina",
                        isNew: true
                    },
                    {
                        id: '2',
                        name: "Ropa de Hombre",
                        slug: "hombre",
                        image: "/images/categories/men.jpg",
                        imageAlt: "Colección de moda masculina"
                    },
                    {
                        id: '3',
                        name: "Accesorios",
                        slug: "accesorios",
                        image: "/images/categories/accessories.jpg",
                        imageAlt: "Accesorios de moda"
                    },
                    {
                        id: '4',
                        name: "Calzado",
                        slug: "calzado",
                        image: "/images/categories/shoes.jpg",
                        imageAlt: "Colección de calzado"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SectionHeader
                    title="Todas las Categorías"
                    subtitle="Explora"
                    centered
                />

                <p className="text-center text-gray-600 mt-4 mb-12 max-w-2xl mx-auto">
                    Encuentra exactamente lo que buscas navegando por nuestras categorías de productos.
                </p>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                ) : (
                    <CategoryGrid categories={categories} />
                )}
            </div>

            <Footer />
        </main>
    );
}
