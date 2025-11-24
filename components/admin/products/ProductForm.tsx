'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Upload, X, Plus, Trash2, Save } from 'lucide-react';
import Image from 'next/image';
import { productService } from '@/services/productService';

/**
 * Interfaz para información básica del producto
 */
interface ProductBasicInfo {
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  gender: string;
  categoryId: number | null;
  brandId: number | null;
}

/**
 * Interfaz para precios del producto
 */
interface ProductPricing {
  priceRegular: number;
  priceSale: number;
  costPrice: number;
  compareAtPrice?: number;
  taxClass: string;
}

/**
 * Interfaz para variantes del producto
 */
interface ProductVariant {
  id?: number;
  sku: string;
  priceOverride?: number;
  stockQuantity: number;
  sizeId?: number;
  colorId?: number;
  condition?: string;
  weight?: number;
  dimensions?: string;
  isActive: boolean;
}

/**
 * Interfaz para imágenes del producto
 */
interface ProductImage {
  id?: number;
  url: string;
  altText: string;
  imageType: 'main' | 'gallery' | 'thumbnail';
  sortOrder?: number;
  file?: File; // Archivo real para subir a Supabase
}

/**
 * Props para el componente ProductForm
 */
interface ProductFormProps {
  initialData?: Partial<{
    basicInfo: ProductBasicInfo;
    pricing: ProductPricing;
  }>;
}

/**
 * Componente de upload de imágenes
 */
function ImageUpload({
  images,
  onImagesChange,
  isUploading
}: {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  isUploading: boolean;
}) {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Crear URL temporal para preview
        const tempUrl = URL.createObjectURL(file);

        const newImage: ProductImage = {
          url: tempUrl,
          altText: file.name,
          imageType: 'gallery',
          sortOrder: images.length,
          file: file // Guardamos el archivo real
        };

        onImagesChange([...images, newImage]);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      imageType: i === index ? 'main' : 'gallery'
    }));
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-[#b5b6ad] rounded-lg p-6 text-center">
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploading}
        />

        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <Upload className="w-12 h-12 text-[#8e9087]" />
          <div className="text-sm text-[#676960]">
            {isUploading ? 'Subiendo imágenes...' : 'Haga clic para subir imágenes o arrástrelas aquí'}
          </div>
          <p className="text-xs text-[#8e9087]">
            PNG, JPG, GIF hasta 10MB por imagen
          </p>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square bg-[#b5b6ad]/10 rounded-lg overflow-hidden">
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={image.altText}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-[#8e9087]" />
                  </div>
                )}

                {/* Badge de tipo de imagen */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${image.imageType === 'main'
                    ? 'bg-[#41423a] text-white'
                    : 'bg-[#b5b6ad] text-[#41423a]'
                    }`}>
                    {image.imageType === 'main' ? 'Principal' : 'Galería'}
                  </span>
                </div>

                {/* Controles */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    {image.imageType !== 'main' && (
                      <button
                        onClick={() => setMainImage(index)}
                        className="p-1 bg-[#41423a] text-white rounded hover:bg-[#1a1b14]"
                        title="Establecer como imagen principal"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => removeImage(index)}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Eliminar imagen"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Componente para agregar variantes
 */
function VariantsSection({
  variants,
  onVariantsChange,
  availableSizes,
  availableColors,
  availableConditions
}: {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  availableSizes: Array<{ id: number; name: string }>;
  availableColors: Array<{ id: number; name: string; hex: string }>;
  availableConditions: Array<{ id: number; name: string }>;
}) {
  const addVariant = () => {
    const newVariant: ProductVariant = {
      sku: '',
      priceOverride: 0,
      stockQuantity: 0,
      isActive: true
    };

    onVariantsChange([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onVariantsChange(newVariants);
  };

  return (
    <Card className="bg-white border-[#b5b6ad]/30">
      <CardHeader>
        <CardTitle className="text-[#1a1b14]">Variantes del Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {variants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#676960] mb-4">
                No hay variantes configuradas
              </p>
              <Button
                onClick={addVariant}
                className="bg-[#41423a] text-white hover:bg-[#1a1b14]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Variante
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="border border-[#b5b6ad]/30 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[#1a1b14]">Variante {index + 1}</h4>
                    <Button
                      onClick={() => removeVariant(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#676960] mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="w-full px-3 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
                        placeholder="SKU-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#676960] mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#676960] mb-2">
                        Precio Override
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.priceOverride}
                        onChange={(e) => updateVariant(index, 'priceOverride', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#676960] mb-2">
                        Talla
                      </label>
                      <select
                        value={variant.sizeId || ''}
                        onChange={(e) => updateVariant(index, 'sizeId', parseInt(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
                      >
                        <option value="">Seleccionar talla</option>
                        {availableSizes.map((size) => (
                          <option key={size.id} value={size.id}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#676960] mb-2">
                        Color
                      </label>
                      <select
                        value={variant.colorId || ''}
                        onChange={(e) => updateVariant(index, 'colorId', parseInt(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
                      >
                        <option value="">Seleccionar color</option>
                        {availableColors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#676960] mb-2">
                        Estado
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                          className="rounded text-[#41423a] focus:ring-[#41423a]"
                        />
                        <span className="text-sm text-[#676960]">Activa</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={addVariant}
                variant="bordered"
                className="w-full border-[#41423a] text-[#41423a] hover:bg-[#41423a] hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Variante
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente principal del formulario de productos
 * Incluye todas las secciones y validaciones
 */
export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Estado del formulario
  const [basicInfo, setBasicInfo] = useState<ProductBasicInfo>({
    name: initialData?.basicInfo?.name || '',
    slug: initialData?.basicInfo?.slug || '',
    sku: initialData?.basicInfo?.sku || '',
    description: initialData?.basicInfo?.description || '',
    shortDescription: initialData?.basicInfo?.shortDescription || '',
    isActive: initialData?.basicInfo?.isActive ?? true,
    isFeatured: initialData?.basicInfo?.isFeatured ?? false,
    gender: initialData?.basicInfo?.gender || 'unisex',
    categoryId: initialData?.basicInfo?.categoryId ?? null,
    brandId: initialData?.basicInfo?.brandId ?? null
  });

  const [pricing, setPricing] = useState<ProductPricing>({
    priceRegular: initialData?.pricing?.priceRegular ?? 0,
    priceSale: initialData?.pricing?.priceSale ?? 0,
    costPrice: initialData?.pricing?.costPrice ?? 0,
    taxClass: 'standard'
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Datos reales de la base de datos
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [availableBrands, setAvailableBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [availableSizes, setAvailableSizes] = useState<Array<{ id: number; name: string }>>([]);
  const [availableColors, setAvailableColors] = useState<Array<{ id: number; name: string; hex: string }>>([]);
  const [availableConditions] = useState<Array<{ id: number; name: string }>>([
    { id: 1, name: 'Nuevo' },
    { id: 2, name: 'Nuevo con etiquetas' },
    { id: 3, name: 'Casi nuevo' },
    { id: 4, name: 'Buen estado' }
  ]);

  // Cargar datos desde Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        console.log('🔄 Loading data from Supabase...');

        const [categories, brands, sizes, colors] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
          productService.getSizes(),
          productService.getColors()
        ]);

        setAvailableCategories(categories);
        setAvailableBrands(brands);
        setAvailableSizes(sizes);
        setAvailableColors(colors);

        console.log('✅ Data loaded successfully:', {
          categories: categories.length,
          brands: brands.length,
          sizes: sizes.length,
          colors: colors.length
        });

      } catch (error) {
        console.error('❌ Error loading data:', error);
        setErrors({ load: 'Error al cargar datos desde la base de datos' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Generar slug automáticamente desde el nombre y SKU
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove all non-word chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-'); // Remove multiple hyphens
  }, []);

  // Generar SKU automáticamente
  const generateSKU = useCallback(() => {
    if (basicInfo.categoryId && availableCategories.length > 0) {
      const category = availableCategories.find(c => c.id === basicInfo.categoryId);
      return productService.generateSKU(basicInfo.name, category?.name);
    }
    return productService.generateSKU(basicInfo.name);
  }, [basicInfo.name, basicInfo.categoryId, availableCategories]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar información básica
    if (!basicInfo.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!basicInfo.sku.trim()) {
      newErrors.sku = 'El SKU es requerido';
    }

    if (!basicInfo.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!basicInfo.slug.trim()) {
      newErrors.slug = 'El slug URL es requerido';
    }

    // Validar precios
    if (pricing.priceRegular <= 0) {
      newErrors.priceRegular = 'El precio regular debe ser mayor a 0';
    }

    if (pricing.priceSale < 0) {
      newErrors.priceSale = 'El precio de venta no puede ser negativo';
    }

    // Validar que al menos una imagen esté configurada como principal (si hay imágenes)
    if (images.length > 0) {
      const hasMainImage = images.some(img => img.imageType === 'main');
      if (!hasMainImage) {
        newErrors.images = 'Debes seleccionar una imagen principal';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('🚀 Creating product with real connection...');

      const result = await productService.createProduct({
        basicInfo,
        pricing,
        images,
        variants
      });

      if (result.success) {
        console.log('✅ Product created successfully:', result.data);

        // Redirigir al listado de productos
        router.push('/admin/products');
      } else {
        console.error('❌ Error creating product:', result.error);
        setErrors({ submit: result.error || 'Error al crear el producto' });
      }

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setErrors({ submit: 'Error inesperado al crear el producto. Por favor intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#b5b6ad] border-t-[#41423a] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#676960]">Cargando configuración del formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error de carga */}
      {errors.load && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-800">{errors.load}</p>
          </CardContent>
        </Card>
      )}

      {/* Información Básica */}
      <Card className="bg-white border-[#b5b6ad]/30">
        <CardHeader>
          <CardTitle className="text-[#1a1b14]">Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#676960] mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => {
                    setBasicInfo({ ...basicInfo, name: e.target.value });
                    // Auto-generar slug
                    if (!basicInfo.slug || basicInfo.slug === '') {
                      setBasicInfo(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087] ${errors.name ? 'border-red-300' : 'border-[#b5b6ad]'
                    }`}
                  placeholder="Camiseta UpWear Classic"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#676960] mb-2">
                  SKU *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={basicInfo.sku}
                    onChange={(e) => setBasicInfo({ ...basicInfo, sku: e.target.value })}
                    className={`flex-1 px-4 py-2 border rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087] ${errors.sku ? 'border-red-300' : 'border-[#b5b6ad]'
                      }`}
                    placeholder="UW-001"
                  />
                  <button
                    type="button"
                    onClick={() => setBasicInfo({ ...basicInfo, sku: generateSKU() })}
                    className="px-4 py-2 bg-[#b5b6ad] text-[#1a1b14] rounded-lg hover:bg-[#8e9087] transition-colors text-sm font-medium"
                    title="Generar SKU automáticamente"
                  >
                    🎲
                  </button>
                </div>
                {errors.sku && (
                  <p className="text-sm text-red-600">{errors.sku}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#676960] mb-2">
                  Slug URL
                </label>
                <input
                  type="text"
                  value={basicInfo.slug}
                  onChange={(e) => setBasicInfo({ ...basicInfo, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087]"
                  placeholder="camiseta-upwear-classic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#676960] mb-2">
                  Género
                </label>
                <select
                  value={basicInfo.gender}
                  onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
                >
                  <option value="men">Hombre</option>
                  <option value="women">Mujer</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Niños</option>
                  <option value="none">Sin especificar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#676960] mb-2">
                Descripción Corta
              </label>
              <input
                type="text"
                value={basicInfo.shortDescription}
                onChange={(e) => setBasicInfo({ ...basicInfo, shortDescription: e.target.value })}
                className="w-full px-4 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087]"
                placeholder="Breve descripción para el producto"
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#676960] mb-2">
                  Categoría
                </label>
                <select
                  value={basicInfo.categoryId || ''}
                  onChange={(e) => setBasicInfo({ ...basicInfo, categoryId: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Seleccionar categoría</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {isLoading && (
                  <p className="text-xs text-[#8e9087] mt-1">Cargando categorías...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#676960] mb-2">
                  Marca
                </label>
                <select
                  value={basicInfo.brandId || ''}
                  onChange={(e) => setBasicInfo({ ...basicInfo, brandId: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Seleccionar marca</option>
                  {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {isLoading && (
                  <p className="text-xs text-[#8e9087] mt-1">Cargando marcas...</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#676960] mb-2">
                Descripción Completa *
              </label>
              <textarea
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087] ${errors.description ? 'border-red-300' : 'border-[#b5b6ad]'
                  }`}
                placeholder="Describe el producto detalladamente, incluyendo materiales, características, etc."
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={basicInfo.isActive}
                  onChange={(e) => setBasicInfo({ ...basicInfo, isActive: e.target.checked })}
                  className="rounded text-[#41423a] focus:ring-[#41423a]"
                />
                <span className="text-sm text-[#676960]">Producto Activo</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={basicInfo.isFeatured}
                  onChange={(e) => setBasicInfo({ ...basicInfo, isFeatured: e.target.checked })}
                  className="rounded text-[#41423a] focus:ring-[#41423a]"
                />
                <span className="text-sm text-[#676960]">Producto Destacado</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Precios */}
      <Card className="bg-white border-[#b5b6ad]/30">
        <CardHeader>
          <CardTitle className="text-[#1a1b14]">Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#676960] mb-2">
                Precio Principal *
              </label>
              <input
                type="number"
                step="0.01"
                value={pricing.priceRegular}
                onChange={(e) => setPricing({ ...pricing, priceRegular: parseFloat(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087] ${errors.priceRegular ? 'border-red-300' : 'border-[#b5b6ad]'
                  }`}
                placeholder="99.99"
              />
              {errors.priceRegular && (
                <p className="text-sm text-red-600">{errors.priceRegular}</p>
              )}
              <p className="text-xs text-[#8e9087] mt-1">Este será el precio del producto</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#676960] mb-2">
                Precio en Oferta (opcional)
              </label>
              <input
                type="number"
                step="0.01"
                value={pricing.priceSale}
                onChange={(e) => setPricing({ ...pricing, priceSale: parseFloat(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087] ${errors.priceSale ? 'border-red-300' : 'border-[#b5b6ad]'
                  }`}
                placeholder="79.99"
              />
              {errors.priceSale && (
                <p className="text-sm text-red-600">{errors.priceSale}</p>
              )}
              <p className="text-xs text-[#8e9087] mt-1">Si hay oferta, ingrese precio aquí</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#676960] mb-2">
                Precio de Costo
              </label>
              <input
                type="number"
                step="0.01"
                value={pricing.costPrice}
                onChange={(e) => setPricing({ ...pricing, costPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent placeholder-[#8e9087]"
                placeholder="45.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#676960] mb-2">
                Clase de Impuesto
              </label>
              <select
                value={pricing.taxClass}
                onChange={(e) => setPricing({ ...pricing, taxClass: e.target.value })}
                className="w-full px-4 py-2 border border-[#b5b6ad] rounded-lg text-sm text-[#1a1b14] focus:outline-none focus:ring-2 focus:ring-[#41423a] focus:border-transparent"
              >
                <option value="standard">Estándar (10%)</option>
                <option value="reduced">Reducido (5%)</option>
                <option value="zero">Exento (0%)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imágenes */}
      <Card className="bg-white border-[#b5b6ad]/30">
        <CardHeader>
          <CardTitle className="text-[#1a1b14]">Imágenes del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            isUploading={isUploading}
          />
        </CardContent>
      </Card>

      {/* Variantes */}
      <VariantsSection
        variants={variants}
        onVariantsChange={setVariants}
        availableSizes={availableSizes}
        availableColors={availableColors}
        availableConditions={availableConditions}
      />

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="bordered"
          onClick={() => router.push('/admin/products')}
          className="border-[#41423a] text-[#41423a] hover:bg-[#41423a] hover:text-white"
        >
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#41423a] text-white hover:bg-[#1a1b14] disabled:bg-[#8e9087]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Crear Producto
            </>
          )}
        </Button>
      </div>

      {/* Error de envío */}
      {Object.keys(errors).length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <h4 className="text-red-800 font-medium mb-2">Error al crear producto</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>• {message}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}