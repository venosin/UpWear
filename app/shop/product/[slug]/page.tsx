import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { shopService } from '@/services/shopService';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductGrid from '@/components/products/ProductGrid';
import SectionHeader from '@/components/ui/SectionHeader';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await shopService.getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    // Fetch related products
    const relatedProducts = product.category
        ? await shopService.getRelatedProducts(product.category_id as number, product.id)
        : [];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-black">Home</Link>
                    <ChevronRight size={16} className="mx-2" />
                    <Link href="/shop" className="hover:text-black">Shop</Link>
                    {product.category && (
                        <>
                            <ChevronRight size={16} className="mx-2" />
                            <Link href={`/shop/category/${product.category.slug}`} className="hover:text-black">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight size={16} className="mx-2" />
                    <span className="text-black font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* Product Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
                    <ProductGallery images={product.images} />
                    <ProductInfo product={product} />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mb-24">
                        <SectionHeader title="You May Also Like" />
                        <ProductGrid products={relatedProducts} />
                    </section>
                )}
            </div>

            <Footer />
        </main>
    );
}
