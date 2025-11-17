'use client';

import { useState } from 'react';
import { customerService } from '@/services/customerService';
import { ProfileUpdate, CustomerValidation } from '@/types/customers';
import Modal from '@/components/ui/Modal';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '@/components/ui/Toast';

interface CustomerActionsProps {
  customerId: string;
  customerName: string;
  onCustomerUpdated: () => void;
  onCustomerDeleted: () => void;
}

export default function CustomerActions({
  customerId,
  customerName,
  onCustomerUpdated,
  onCustomerDeleted
}: CustomerActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProfileUpdate>({
    full_name: '',
    phone: '',
    role: 'customer',
    avatar_url: '',
    email_verified: false,
    phone_verified: false,
    birth_date: '',
    gender: 'none',
    preferences: {},
    metadata: {}
  });

  const handleEdit = async () => {
    const newErrors: Record<string, string> = {};

    // Validaciones
    if (formData.full_name && !formData.full_name.trim()) {
      newErrors.full_name = 'El nombre no puede estar vacío';
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
      const result = await customerService.updateProfile(customerId, formData);

      if (result.success) {
        setShowEditModal(false);
        onCustomerUpdated();
        showSuccessToast('Cliente actualizado exitosamente');
      } else {
        setErrors({ submit: result.error as string || 'Error al actualizar cliente' });
      }
    } catch (error) {
      setErrors({ submit: 'Error inesperado al actualizar cliente' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirmDialog(
      'Eliminar Cliente',
      `¿Estás seguro de que quieres eliminar al cliente "${customerName}"? Esta acción no se puede deshacer.`,
      'danger'
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const result = await customerService.deleteProfile(customerId);

      if (result.success) {
        showSuccessToast('Cliente eliminado exitosamente');
      } else {
        showErrorToast(result.error as string || 'Error al eliminar cliente');
      }
    } catch (error) {
      showErrorToast('Error inesperado al eliminar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = () => {
    // Load current customer data
    customerService.getProfileById(customerId).then(customer => {
      if (customer) {
        setFormData({
          full_name: customer.full_name || '',
          phone: customer.phone || '',
          role: customer.role,
          avatar_url: customer.avatar_url || '',
          email_verified: customer.email_verified,
          phone_verified: customer.phone_verified,
          birth_date: customer.birth_date || '',
          gender: customer.gender,
          preferences: customer.preferences,
          metadata: customer.metadata
        });
        setShowEditModal(true);
      }
    });
  };

  const closeEditModal = () => {
    if (!isSubmitting) {
      setShowEditModal(false);
      setErrors({});
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Edit Button */}
        <button
          onClick={openEditModal}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Editar
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={isSubmitting}
          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Editar Cliente"
        size="md"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
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

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.email_verified}
                onChange={(e) => setFormData({ ...formData, email_verified: e.target.checked })}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700">Email verificado</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.phone_verified}
                onChange={(e) => setFormData({ ...formData, phone_verified: e.target.checked })}
                className="mr-2"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700">Teléfono verificado</span>
            </label>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeEditModal}
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
              {isSubmitting ? 'Actualizando...' : 'Actualizar Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}