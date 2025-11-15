'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { productService } from '@/services/productService';
import ProductEditClient from './ProductEditClient';
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

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onProductUpdated?: () => void;
}

export default function EditProductModal({
  isOpen,
  onClose,
  productId,
  onProductUpdated
}: EditProductModalProps) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    if (isOpen && productId) {
      loadData();
    }
  }, [isOpen, productId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar datos del producto
      const productData = await productService.getProductById(productId);
      if (!productData) {
        showErrorToast('Product not found');
        onClose();
        return;
      }
      setProduct(productData);

      // Cargar imágenes del producto
      const imagesData = await productService.getProductImages(productId);
      setImages(imagesData);

      // Cargar datos para formularios
      const [categoriesData, brandsData, sizesData, colorsData] = await Promise.all([
        productService.getCategories(),
        productService.getBrands(),
        productService.getSizes(),
        productService.getColors()
      ]);

      setCategories(categoriesData);
      setBrands(brandsData);
      setSizes(sizesData);
      setColors(colorsData);

    } catch (error) {
      console.error('Error loading product data:', error);
      showErrorToast('Error loading product data');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleProductUpdated = () => {
    showSuccessToast('Product updated successfully!');
    onProductUpdated?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Product"
      size="xl"
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : product ? (
        <ProductEditClient
          product={product}
          images={images}
          categories={categories}
          brands={brands}
          sizes={sizes}
          colors={colors}
          onUpdateComplete={handleProductUpdated}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Product not found</p>
        </div>
      )}
    </Modal>
  );
}