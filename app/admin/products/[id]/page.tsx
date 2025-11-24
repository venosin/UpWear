'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { productService } from '@/services/productService';
import ProductEditClient from './ProductEditClient';

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

export default function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar datos del producto
      const productData = await productService.getProductById(productId);
      if (!productData) {
        notFound();
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-2">Update product details and manage images</p>
      </div>

      <ProductEditClient
        product={product}
        images={images}
        categories={categories}
        brands={brands}
        sizes={sizes}
        colors={colors}
      />
    </div>
  );
}