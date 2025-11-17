'use client';

import { useState } from 'react';
import { brandService } from '@/services/brandService';
import EditBrandModal from '@/components/admin/EditBrandModal';
import Modal from '@/components/ui/Modal';
import { showSuccessToast, showErrorToast } from '@/components/ui/Toast';

interface BrandActionsProps {
  brandId: number;
  brandName: string;
  onBrandDeleted?: () => void;
  onBrandUpdated?: () => void;
  className?: string;
}

export default function BrandActions({
  brandId,
  brandName,
  onBrandDeleted,
  onBrandUpdated,
  className = ''
}: BrandActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await brandService.deleteBrand(brandId);

      if (result.success) {
        showSuccessToast('Marca eliminada exitosamente');
        setShowDeleteModal(false);
        onBrandDeleted?.();
      } else {
        showErrorToast(`Error al eliminar marca: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      showErrorToast('Error inesperado al eliminar marca');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBrandUpdated = () => {
    setShowEditModal(false);
    onBrandUpdated?.();
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Edit Button */}
      <button
        onClick={() => setShowEditModal(true)}
        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
      >
        Editar
      </button>

      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={isDeleting}
        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Eliminando...' : 'Eliminar'}
      </button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="p-4 text-center">
          {/* Icono de advertencia */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          {/* Mensaje simple */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Eliminar "{brandName}"?
          </h3>

          <p className="text-sm text-red-600 mb-6">
            ⚠️ Esta acción no se puede deshacer. La marca se marcará como inactiva.
          </p>

          {/* Botones */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Brand Modal */}
      <EditBrandModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        brandId={brandId}
        onBrandUpdated={handleBrandUpdated}
      />
    </div>
  );
}