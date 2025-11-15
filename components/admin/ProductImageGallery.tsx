'use client'

import { useState } from 'react'
import { deleteProductImage } from '@/services/imageService'
import Image from 'next/image'

interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text?: string
  image_type: string
  sort_order: number
  is_active: boolean
}

interface ProductImageGalleryProps {
  productId: string
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  className?: string
}

export default function ProductImageGallery({
  productId,
  images,
  onImagesChange,
  className = ''
}: ProductImageGalleryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteImage = async (image: ProductImage) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return
    }

    setDeletingId(image.id)

    try {
      // Extract file path from URL
      const imagePath = image.image_url.split('/').pop() || ''

      // Delete from storage
      await deleteProductImage(imagePath)

      // Update local state
      const updatedImages = images.filter(img => img.id !== image.id)
      onImagesChange(updatedImages)
    } catch (error) {
      alert('Failed to delete image. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetAsCover = (image: ProductImage) => {
    // Update sort_order to make this image first
    const updatedImages = images.map(img => ({
      ...img,
      sort_order: img.id === image.id ? 0 : img.sort_order + 1
    }))

    // Sort by sort_order
    const sortedImages = updatedImages.sort((a, b) => a.sort_order - b.sort_order)
    onImagesChange(sortedImages)
  }

  const handleUpdateAltText = (imageId: string, altText: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, alt_text: altText } : img
    )
    onImagesChange(updatedImages)
  }

  if (images.length === 0) {
    return (
      <div className={`text-center py-8 border-2 border-dashed border-gray-200 rounded-lg ${className}`}>
        <div className="text-gray-400">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm">No images uploaded yet</p>
          <p className="text-xs text-gray-500">Upload images to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Product Images ({images.length})
        </h3>
        <div className="text-sm text-gray-500">
          First image will be the cover image
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`
              relative group border rounded-lg overflow-hidden bg-gray-50
              ${index === 0 ? 'ring-2 ring-blue-500' : 'border-gray-200'}
            `}
          >
            {index === 0 && (
              <div className="absolute top-0 left-0 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-br-lg">
                Cover
              </div>
            )}

            <div className="aspect-square relative">
              <Image
                src={image.image_url}
                alt={image.alt_text || `Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            <div className="p-3 space-y-2">
              <input
                type="text"
                value={image.alt_text || ''}
                onChange={(e) => handleUpdateAltText(image.id, e.target.value)}
                placeholder="Alt text for accessibility"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {index !== 0 && (
                  <button
                    onClick={() => handleSetAsCover(image)}
                    className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Set as Cover
                  </button>
                )}

                <button
                  onClick={() => handleDeleteImage(image)}
                  disabled={deletingId === image.id}
                  className="flex-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === image.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>First image is automatically used as the cover/preview image</li>
          <li>Alt text helps with SEO and accessibility</li>
          <li>Images should be at least 800x800px for best quality</li>
        </ul>
      </div>
    </div>
  )
}