'use client';

import { useState, useEffect } from 'react';
import { brandService } from '@/services/brandService';
import Modal from '@/components/ui/Modal';
import { showSuccessToast, showErrorToast } from '@/components/ui/Toast';
import { Brand, BrandValidation } from '@/types/brands';

interface EditBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: number;
  onBrandUpdated: () => void;
}

export default function EditBrandModal({
  isOpen,
  onClose,
  brandId,
  onBrandUpdated
}: EditBrandModalProps) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    banner_url: '',
    country: '',
    website_url: '',
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    if (isOpen && brandId) {
      loadBrand();
    }
  }, [isOpen, brandId]);

  const loadBrand = async () => {
    try {
      setLoading(true);
      // Obtener todas las marcas para encontrar la específica
      const brands = await brandService.getAllBrands();
      const foundBrand = brands.find(b => b.id === brandId);

      if (foundBrand) {
        setBrand(foundBrand);
        setFormData({
          name: foundBrand.name,
          slug: foundBrand.slug,
          description: foundBrand.description || '',
          logo_url: foundBrand.logo_url || '',
          banner_url: foundBrand.banner_url || '',
          country: foundBrand.country || '',
          website_url: foundBrand.website_url || '',
          is_featured: foundBrand.is_featured,
          is_active: foundBrand.is_active
        });
      } else {
        showErrorToast('Marca no encontrada');
        onClose();
      }
    } catch (error) {
      console.error('Error loading brand:', error);
      showErrorToast('Error al cargar la marca');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorToast('El nombre de la marca es requerido');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await brandService.updateBrand(brandId, formData);

      if (result.success) {
        showSuccessToast('Marca actualizada exitosamente');
        onBrandUpdated();
      } else {
        showErrorToast(`Error al actualizar marca: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      showErrorToast('Error inesperado al actualizar marca');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-generar slug cuando cambia el nombre
  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      // Solo auto-generar slug si el actual fue generado automáticamente
      slug: prev.slug === brand?.slug ?
        BrandValidation.generateSlug(value)
        : prev.slug
    }));
  };

  if (loading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Editar Marca"
        size="md"
      >
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Cargando marca...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Marca"
      size="md"
    >
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Nike, Adidas, Zara"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="nike"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL amigable para la marca.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descripción breve de la marca..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Logo
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://ejemplo.com/logo.jpg"
            />
            {formData.logo_url && (
              <img
                src={formData.logo_url}
                alt="Logo Preview"
                className="mt-2 h-12 w-12 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Banner
            </label>
            <input
              type="url"
              value={formData.banner_url}
              onChange={(e) => handleInputChange('banner_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://ejemplo.com/banner.jpg"
            />
            {formData.banner_url && (
              <img
                src={formData.banner_url}
                alt="Banner Preview"
                className="mt-2 h-12 w-20 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar país</option>
              {BrandValidation.commonCountryCodes.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Código ISO 3166-1 alpha-2
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sitio Web
            </label>
            <input
              type="url"
              value={formData.website_url}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://ejemplo.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destacada
            </label>
            <select
              value={formData.is_featured ? 'true' : 'false'}
              onChange={(e) => handleInputChange('is_featured', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Las marcas destacadas aparecen en la página principal
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar Marca'}
          </button>
        </div>
      </form>
    </Modal>
  );
}