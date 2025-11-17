'use client';

import { useState } from 'react';
import { customerService } from '@/services/customerService';
import { ProfileCreate, CustomerValidation } from '@/types/customers';
import Modal from '@/components/ui/Modal';
import { showSuccessToast, showErrorToast } from '@/components/ui/Toast';

interface CreateCustomerButtonProps {
  onCustomerCreated: () => void;
}

export default function CreateCustomerButton({ onCustomerCreated }: CreateCustomerButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ProfileCreate>({
    full_name: '',
    phone: '',
    role: 'customer',
    avatar_url: '',
    birth_date: '',
    gender: 'none',
    preferences: {},
    metadata: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validaciones
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }

    if (formData.phone && !CustomerValidation.isValidPhone(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (formData.birth_date && !CustomerValidation.isValidDate(formData.birth_date)) {
      newErrors.birth_date = 'Formato de fecha inválido. Usa YYYY-MM-DD';
    }

    if (formData.avatar_url && !CustomerValidation.isValidImage(formData.avatar_url)) {
      newErrors.avatar_url = 'URL de imagen inválida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await customerService.createProfile(formData);

      if (result.success) {
        setShowModal(false);
        setFormData({
          full_name: '',
          phone: '',
          role: 'customer',
          avatar_url: '',
          birth_date: '',
          gender: 'none',
          preferences: {},
          metadata: {}
        });
        onCustomerCreated();
        showSuccessToast('Cliente creado exitosamente');
      } else {
        setErrors({ submit: result.error as string || 'Error al crear cliente' });
      }
    } catch (error) {
      setErrors({ submit: 'Error inesperado al crear cliente' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setErrors({});
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nuevo Cliente
      </button>

      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title="Nuevo Cliente"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.full_name || ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Juan Pérez"
              disabled={isSubmitting}
              required
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+52 123 456 7890"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del Avatar
            </label>
            <input
              type="url"
              value={formData.avatar_url || ''}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.avatar_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://ejemplo.com/avatar.jpg"
              disabled={isSubmitting}
            />
            {errors.avatar_url && (
              <p className="mt-1 text-sm text-red-600">{errors.avatar_url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.birth_date || ''}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                errors.birth_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.birth_date && (
              <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {CustomerValidation.genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {CustomerValidation.roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
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
              {isSubmitting ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}