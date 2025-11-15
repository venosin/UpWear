'use client';

import { useState } from 'react';
import { productService } from '@/services/productService';
import EditProductModal from '@/components/admin/EditProductModal';
import Modal from '@/components/ui/Modal';
import { showSuccessToast, showErrorToast } from '@/components/ui/Toast';

interface ProductActionsProps {
  productId: string;
  productName: string;
  onProductDeleted?: () => void;
  className?: string;
}

export default function ProductActions({
  productId,
  productName,
  onProductDeleted,
  className = ''
}: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await productService.deleteProduct(productId);

      if (result.success) {
        showSuccessToast('Producto eliminado exitosamente');
        setShowDeleteModal(false);
        onProductDeleted?.();
      } else {
        showErrorToast(`Error al eliminar producto: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      showErrorToast('Error inesperado al eliminar producto');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProductUpdated = () => {
    // Refrescar la lista de productos si se proporciona la función
    onProductDeleted?.(); // Reutilizamos la misma función para refrescar
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          {/* Mensaje simple */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Eliminar "{productName}"?
          </h3>

          <p className="text-sm text-red-600 mb-6">
            ⚠️ Esta acción no se puede deshacer
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
              onClick={() => {
                handleDelete();
                setShowDeleteModal(false);
              }}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        productId={productId}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
}