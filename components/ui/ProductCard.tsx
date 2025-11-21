'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardBody, CardFooter, Button } from '@heroui/react';
import { Heart, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
    id: number;
    name: string;
    slug: string;
    price_sale: number;
    price_original: number;
    image_url: string;
    is_new?: boolean;
    category?: string;
}

export default function ProductCard({
    name,
    slug,
    price_sale,
    price_original,
    image_url,
    is_new,
    category
}: ProductCardProps) {
    const discountPercentage = price_original > price_sale
        ? Math.round(((price_original - price_sale) / price_original) * 100)
        : 0;

    return (
        <Card className="w-full border-none shadow-none hover:shadow-md transition-shadow duration-300 group bg-transparent">
            <CardBody className="p-0 overflow-hidden relative aspect-[3/4] rounded-2xl bg-gray-100">
                <Link href={`/shop/product/${slug}`} className="w-full h-full block">
                    <Image
                        src={image_url}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {is_new && (
                        <span className="px-3 py-1 text-xs font-bold bg-white text-black rounded-full shadow-sm">
                            NEW
                        </span>
                    )}
                    {discountPercentage > 0 && (
                        <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full shadow-sm">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <Button
                        isIconOnly
                        className="bg-white/90 backdrop-blur-sm text-black hover:bg-black hover:text-white rounded-full shadow-sm w-9 h-9 min-w-0"
                        aria-label="Add to wishlist"
                    >
                        <Heart size={18} />
                    </Button>
                    <Button
                        isIconOnly
                        className="bg-white/90 backdrop-blur-sm text-black hover:bg-black hover:text-white rounded-full shadow-sm w-9 h-9 min-w-0"
                        aria-label="Add to cart"
                    >
                        <ShoppingBag size={18} />
                    </Button>
                </div>
            </CardBody>

            <CardFooter className="flex flex-col items-start px-0 pt-4 pb-0 bg-transparent">
                {category && (
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{category}</p>
                )}
                <Link href={`/shop/product/${slug}`} className="w-full">
                    <h3 className="text-base font-medium text-gray-900 line-clamp-1 group-hover:text-gray-600 transition-colors">
                        {name}
                    </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-semibold text-gray-900">
                        ${price_sale.toFixed(2)}
                    </span>
                    {price_original > price_sale && (
                        <span className="text-sm text-gray-400 line-through">
                            ${price_original.toFixed(2)}
                        </span>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
