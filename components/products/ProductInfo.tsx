'use client';

import { useState, useMemo } from 'react';
import { Button } from '@heroui/react';
import { Heart, Share2, Minus, Plus } from 'lucide-react';
import { ProductDetail } from '@/services/shopService';
import { cn } from '@/lib/utils';

interface ProductInfoProps {
    product: ProductDetail;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Extract unique sizes and colors from variants
    const sizes = useMemo(() => {
        const uniqueSizes = new Map();
        product.variants.forEach(v => {
            if (v.size) uniqueSizes.set(v.size_id, v.size.name);
        });
        return Array.from(uniqueSizes.entries()).map(([id, name]) => ({ id, name }));
    }, [product.variants]);

    const colors = useMemo(() => {
        const uniqueColors = new Map();
        product.variants.forEach(v => {
            if (v.color_obj) {
                uniqueColors.set(v.color_obj.name, v.color_obj);
            } else if (v.color) {
                // Fallback if color_obj is missing but color string exists
                uniqueColors.set(v.color, { name: v.color, hex: v.color_code || '#000000' });
            }
        });
        return Array.from(uniqueColors.entries()).map(([name, data]) => ({ id: name, ...data }));
    }, [product.variants]);

    // Check stock for current selection
    const currentVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return product.variants.find(v =>
            v.size_id === selectedSize &&
            (v.color_obj?.name === selectedColor || v.color === selectedColor)
        );
    }, [product.variants, selectedSize, selectedColor]);

    const isOutOfStock = currentVariant ? currentVariant.stock_quantity <= 0 : false;
    const price = currentVariant?.price_override || product.price_sale;

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) return;
        console.log('Add to cart:', {
            productId: product.id,
            variantId: currentVariant?.id,
            quantity
        });
        // TODO: Implement cart context
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div>
                {product.brand && (
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {product.brand.name}
                    </h3>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {product.name}
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-semibold text-gray-900">
                        ${price.toFixed(2)}
                    </span>
                    {product.price_original > price && (
                        <span className="text-lg text-gray-400 line-through">
                            ${product.price_original.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm text-gray-600">
                <p>{product.description}</p>
            </div>

            {/* Variants */}
            <div className="space-y-6">
                {/* Colors */}
                {colors.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                        <div className="flex flex-wrap gap-3">
                            {colors.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setSelectedColor(color.id)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-all relative",
                                        selectedColor === color.id ? "border-black ring-1 ring-black ring-offset-2" : "border-transparent hover:border-gray-300"
                                    )}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                >
                                    {selectedColor === color.id && (
                                        <span className="sr-only">Selected</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sizes */}
                {sizes.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-medium text-gray-900">Size</h3>
                            <button className="text-xs text-gray-500 underline hover:text-black">
                                Size Guide
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {sizes.map((size) => (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedSize(size.id)}
                                    className={cn(
                                        "py-3 text-sm font-medium rounded-lg border transition-all",
                                        selectedSize === size.id
                                            ? "border-black bg-black text-white"
                                            : "border-gray-200 text-gray-900 hover:border-black"
                                    )}
                                >
                                    {size.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex gap-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-3 hover:bg-gray-50 text-gray-600"
                            disabled={quantity <= 1}
                        >
                            <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="p-3 hover:bg-gray-50 text-gray-600"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Add to Cart */}
                    <Button
                        className="flex-1 bg-black text-white font-medium text-lg h-auto py-3 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddToCart}
                        disabled={!selectedSize || !selectedColor || isOutOfStock}
                    >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>

                    {/* Wishlist */}
                    <Button
                        isIconOnly
                        variant="bordered"
                        className="border-gray-200 text-gray-900 hover:border-black hover:bg-gray-50 w-[50px]"
                    >
                        <Heart size={20} />
                    </Button>
                </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Share2 size={16} />
                    <span>Share this product</span>
                </div>
                {/* Add more info items here */}
            </div>
        </div>
    );
}
