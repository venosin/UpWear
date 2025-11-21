'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
    images: { url: string; alt_text: string }[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails - Left side on desktop, Bottom on mobile */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:h-[600px] scrollbar-hide">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                            "relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                            selectedImage === index ? "border-black" : "border-transparent hover:border-gray-300"
                        )}
                    >
                        <Image
                            src={image.url}
                            alt={image.alt_text || `Product thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative aspect-[3/4] md:h-[600px] bg-gray-50 rounded-2xl overflow-hidden">
                <Image
                    src={images[selectedImage].url}
                    alt={images[selectedImage].alt_text || 'Product image'}
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
}
