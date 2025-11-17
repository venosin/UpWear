'use client';

import { useState, useEffect } from 'react';
import { categoryService } from '@/services/categoryService';
import Modal from '@/components/ui/Modal';
import { showSuccessToast, showErrorToast } from '@/components/ui/Toast';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
  onCategoryUpdated: () => void;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  categoryId,
  onCategoryUpdated
}: EditCategoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: null as number | null,
    sort_order: 1,
    is_active: true
  });

  useEffect(() => {
    if (isOpen && categoryId) {
      loadCategory();
    }
  }, [isOpen, categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      // Obtener todas las categorías para encontrar la específica
      const categories = await categoryService.getAllCategories();
      const foundCategory = categories.find(c => c.id === categoryId);

      if (foundCategory) {
        setCategory(foundCategory);
        setFormData({
          name: foundCategory.name,
          slug: foundCategory.slug,
          description: foundCategory.description || '',
          image_url: foundCategory.image_url || '',
          parent_id: foundCategory.parent_id || null,
          sort_order: foundCategory.sort_order,
          is_active: foundCategory.is_active
        });
      } else {
        showErrorToast('Categoría no encontrada');
        onClose();
      }
    } catch (error) {
      console.error('Error loading category:', error);
      showErrorToast('Error al cargar la categoría');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorToast('El nombre de la categoría es requerido');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await categoryService.updateCategory(categoryId, formData);

      if (result.success) {
        showSuccessToast('Categoría actualizada exitosamente');
        onCategoryUpdated();
      } else {
        showErrorToast(`Error al actualizar categoría: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      showErrorToast('Error inesperado al actualizar categoría');
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
      slug: prev.slug === category?.slug ?
        value.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
        : prev.slug
    }));
  };

  if (loading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Editar Categoría"
        size="md"
      >
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Cargando categoría...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Categoría"
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
            placeholder="Ej: Camisetas"
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
            placeholder="camisetas"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL amigable para la categoría.
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
            placeholder="Descripción breve de la categoría..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL de Imagen
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Preview"
              className="mt-2 h-16 w-16 object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría Padre
          </label>
          <select
            value={formData.parent_id || ''}
            onChange={(e) => handleInputChange('parent_id', e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Ninguna (Categoría raíz)</option>
            {/* Aquí podrías cargar las categorías existentes dinámicamente */}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Si seleccionas una categoría padre, esta será una subcategoría.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden
            </label>
            <input
              type="number"
              min="1"
              value={formData.sort_order}
              onChange={(e) => handleInputChange('sort_order', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
            {isSubmitting ? 'Actualizando...' : 'Actualizar Categoría'}
          </button>
        </div>
      </form>
    </Modal>
  );
}