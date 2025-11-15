'use client';

import { useState } from 'react';
import { productService } from '@/services/productService';
import { uploadProductImage } from '@/services/imageService';
import ImageUpload from '@/components/admin/ImageUpload';
import ProductImageGallery from '@/components/admin/ProductImageGallery';
import { showSuccessToast, showErrorToast } from '@/components/ui/Toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description?: string;
  price_regular: number;
  price_sale: number;
  cost_price: number;
  is_active: boolean;
  is_featured: boolean;
  gender: string;
  category_id?: string;
  brand_id?: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  image_type: string;
  sort_order: number;
  is_active: boolean;
}

interface ProductEditClientProps {
  product: Product;
  images: ProductImage[];
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  sizes: Array<{ id: string; name: string; order: number }>;
  colors: Array<{ id: string; name: string; hex: string }>;
  onUpdateComplete?: () => void;
}

export default function ProductEditClient({
  product,
  images: initialImages,
  categories,
  brands,
  sizes,
  colors,
  onUpdateComplete
}: ProductEditClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description || '',
    shortDescription: product.short_description || '',
    priceRegular: product.price_regular,
    priceSale: product.price_sale,
    costPrice: product.cost_price,
    isActive: product.is_active,
    isFeatured: product.is_featured,
    gender: product.gender,
    categoryId: product.category_id || '',
    brandId: product.brand_id || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Actualizar información del producto
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        description: formData.description,
        short_description: formData.shortDescription,
        price_regular: formData.priceRegular, // El productService se encargará de mapearlo a price_original
        price_sale: formData.priceSale,
        cost_price: formData.costPrice,
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        gender: formData.gender,
        category_id: formData.categoryId || null,
        brand_id: formData.brandId || null
      };

      const { error } = await productService.updateProduct(product.id, updateData);

      if (error) {
        showErrorToast(`Error: ${error.message}`);
      } else {
        showSuccessToast('Product updated successfully!');
        onUpdateComplete?.();

        // Guardar cambios en las imágenes (alt text y orden)
        const imageUpdates = images.map((img, index) => ({
          id: img.id,
          alt_text: img.alt_text,
          sort_order: index
        }));

        for (const update of imageUpdates) {
          await productService.updateProductImage(update.id, {
            alt_text: update.alt_text,
            sort_order: update.sort_order
          });
        }
      }
    } catch (error) {
      showErrorToast('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      // Guardar imagen en la base de datos
      const savedImages = await productService.saveProductImages(product.id, [{
        image_url: imageUrl,
        alt_text: '',
        sort_order: images.length
      }]);

      if (savedImages.length > 0) {
        setImages(prev => [...prev, savedImages[0]]);
      }
    } catch (error) {
      console.error('Error saving image to database:', error);
      showErrorToast('Error saving image to database');
    }
  };

  const handleImageUploadError = (error: string) => {
    showErrorToast(`Upload error: ${error}`);
  };

  return (
    <div className="space-y-8">
      {/* Product Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL-friendly)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <select
              name="brandId"
              value={formData.brandId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a brand</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regular Price ($) *
            </label>
            <input
              type="number"
              name="priceRegular"
              value={formData.priceRegular}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Price ($)
            </label>
            <input
              type="number"
              name="priceSale"
              value={formData.priceSale}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost Price ($)
            </label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>

        {/* Upload Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Images</h3>
          <ImageUpload
            productId={product.id}
            onUploadComplete={handleImageUpload}
            onUploadError={handleImageUploadError}
          />
        </div>

        {/* Gallery Section */}
        <ProductImageGallery
          productId={product.id}
          images={images}
          onImagesChange={setImages}
        />
      </div>

      {/* Status Options */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Status Options</h2>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-900">Active (visible to customers)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-900">Featured (show on homepage)</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {saveMessage && (
            <div className={`text-sm ${
              saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>

        <button
          onClick={handleSaveProduct}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}