'use client';

import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/services/shopService';

interface ProductGridProps {
    products: Product[];
    columns?: 2 | 3 | 4;
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    if (!products || products.length === 0) {
        return (
            <div className="w-full py-12 text-center">
                <p className="text-gray-500">No products found.</p>
            </div>
        );
    }

    return (
        <div className={`grid ${gridCols[columns]} gap-x-6 gap-y-10`}>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price_sale={product.price_sale}
                    price_original={product.price_original}
                    image_url={product.image_url}
                    is_new={product.is_new}
                    category={product.category_name}
                />
            ))}
        </div>
    );
}
