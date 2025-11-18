'use client';

import { useState, useEffect } from 'react';
import { couponService } from '@/services/couponService';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number | null;
  minimum_amount?: number | null;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  used_count: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  applicable_products?: number[] | null;
  applicable_categories?: number[] | null;
  excluded_products?: number[] | null;
  excluded_categories?: number[] | null;
  first_time_customers_only?: boolean;
  is_active: boolean | null;
  is_public: boolean | null;
  metadata?: any;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CouponStats {
  activeCoupons: number;
  expiredCoupons: number;
  totalUsage: number;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats>({ activeCoupons: 0, expiredCoupons: 0, totalUsage: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_shipping',
    discount_value: 0,
    minimum_amount: 0,
    usage_limit: 0,
    usage_limit_per_user: 0,
    valid_from: '',
    valid_to: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [couponsData, statsData] = await Promise.all([
        couponService.getCoupons(),
        couponService.getCouponStats()
      ]);
      setCoupons(couponsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validación mejorada
    if (!formData.code.trim()) {
      toast.error('El código del cupón es requerido');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('El nombre del cupón es requerido');
      return;
    }

    if (!formData.discount_value || formData.discount_value <= 0) {
      toast.error('El valor del descuento es requerido y debe ser mayor a 0');
      return;
    }

    if (formData.discount_type === 'percentage' && (formData.discount_value <= 0 || formData.discount_value > 100)) {
      toast.error('El porcentaje debe estar entre 1 y 100');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await couponService.createCoupon(formData);
      if (result.success) {
        toast.success('Cupón creado exitosamente');
        setShowCreateModal(false);
        resetForm();
        loadData();
      } else {
        toast.error(`Error: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Error inesperado al crear cupón');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    // Validación mejorada
    if (!selectedCoupon) {
      toast.error('No se ha seleccionado ningún cupón para editar');
      return;
    }

    if (!formData.code.trim()) {
      toast.error('El código del cupón es requerido');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('El nombre del cupón es requerido');
      return;
    }

    if (!formData.discount_value || formData.discount_value <= 0) {
      toast.error('El valor del descuento es requerido y debe ser mayor a 0');
      return;
    }

    if (formData.discount_type === 'percentage' && (formData.discount_value <= 0 || formData.discount_value > 100)) {
      toast.error('El porcentaje debe estar entre 1 y 100');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await couponService.updateCoupon(selectedCoupon.id, formData);
      if (result.success) {
        toast.success('Cupón actualizado exitosamente');
        setShowEditModal(false);
        resetForm();
        loadData();
      } else {
        toast.error(`Error: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Error inesperado al actualizar cupón');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;

    setDeletingCoupon(true);
    try {
      const result = await couponService.deleteCoupon(selectedCoupon.id.toString());
      if (result.success) {
        toast.success('Cupón eliminado exitosamente');
        setShowDeleteModal(false);
        setSelectedCoupon(null);
        loadData();
      } else {
        toast.error(`Error: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Error inesperado al eliminar cupón');
    } finally {
      setDeletingCoupon(false);
    }
  };

  const openDeleteModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value || 0,
      minimum_amount: coupon.minimum_amount || 0,
      usage_limit: coupon.usage_limit || 0,
      usage_limit_per_user: coupon.usage_limit_per_user || 0,
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_to: coupon.valid_to ? coupon.valid_to.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      minimum_amount: 0,
      usage_limit: 0,
      usage_limit_per_user: 0,
      valid_from: '',
      valid_to: ''
    });
    setSelectedCoupon(null);
  };

  const getExpirationStatus = (validFrom?: string | null, validTo?: string | null) => {
    if (!validTo) return { text: 'Sin expiración', color: 'gray' };

    try {
      const expirationDate = new Date(validTo);
      const now = new Date();

      // Verificar si la fecha es válida
      if (isNaN(expirationDate.getTime())) {
        return { text: 'Fecha inválida', color: 'red' };
      }

      if (expirationDate < now) {
        return { text: 'Expirado', color: 'red' };
      } else if (expirationDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) { // 7 days
        return { text: 'Por expirar', color: 'yellow' };
      } else {
        return { text: 'Vigente', color: 'green' };
      }
    } catch (error) {
      console.error('Error parsing expiration date:', error);
      return { text: 'Error en fecha', color: 'red' };
    }
  };

  const getStatusBadgeClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cupones</h1>
          <p className="text-gray-600 mt-2">
            Gestiona códigos de descuento ({stats.activeCoupons} activos, {stats.totalUsage} usos totales)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo Cupón
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Cupones Activos</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.activeCoupons}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Cupones Expirados</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.expiredCoupons}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Usos Totales</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalUsage}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cupones</h3>
            <p className="text-gray-500">Comienza creando tu primer cupón de descuento</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => {
                  const expirationStatus = getExpirationStatus(coupon.valid_from, coupon.valid_to);
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                        {coupon.name && (
                          <div className="text-xs text-gray-500">{coupon.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.discount_type === 'percentage'
                            ? 'bg-blue-100 text-blue-800'
                            : coupon.discount_type === 'fixed_amount'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {coupon.discount_type === 'percentage' ? 'Porcentaje' :
                           coupon.discount_type === 'fixed_amount' ? 'Monto Fijo' : 'Envío Gratis'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.discount_value !== null && coupon.discount_value !== undefined
                            ? coupon.discount_type === 'percentage'
                              ? `${coupon.discount_value}%`
                              : coupon.discount_type === 'free_shipping'
                              ? 'Envío Gratis'
                              : `$${coupon.discount_value.toFixed(2)}`
                            : 'N/A'
                          }
                        </div>
                        {coupon.minimum_amount && coupon.minimum_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            Mínimo: ${coupon.minimum_amount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                        </div>
                        {coupon.usage_limit && coupon.usage_limit > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.valid_to && !isNaN(new Date(coupon.valid_to).getTime())
                            ? new Date(coupon.valid_to).toLocaleDateString('es-ES')
                            : 'Sin expiración'
                          }
                        </div>
                        <div className={`text-xs ${getStatusBadgeClass(expirationStatus.color)} rounded px-1 py-0.5 inline-block mt-1`}>
                          {expirationStatus.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteModal(coupon)}
                          className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors ml-2"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
        }}
        title={showCreateModal ? 'Nuevo Cupón' : 'Editar Cupón'}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VERANO20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Cupón *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descuento de Verano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Describe los beneficios y condiciones de este cupón"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Descuento</label>
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed_amount">Monto Fijo ($)</option>
              <option value="free_shipping">Envío Gratis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor {formData.discount_type === 'percentage' ? '(1-100%)' :
                     formData.discount_type === 'free_shipping' ? '(opcional)' : '(en dólares)'}*
            </label>
            <input
              type="number"
              min={formData.discount_type === 'percentage' ? 1 : formData.discount_type === 'fixed_amount' ? 0.01 : 0}
              step={formData.discount_type === 'percentage' ? 1 : 0.01}
              max={formData.discount_type === 'percentage' ? 100 : undefined}
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={formData.discount_type === 'percentage' ? '20' : formData.discount_type === 'fixed_amount' ? '10.00' : '0'}
              disabled={formData.discount_type === 'free_shipping'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto Mínimo de Compra</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.minimum_amount}
              onChange={(e) => setFormData({ ...formData, minimum_amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Límite de Uso (0 = ilimitado)</label>
            <input
              type="number"
              min="0"
              value={formData.usage_limit}
              onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio (Opcional)</label>
            <input
              type="date"
              value={formData.valid_from}
              onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Expiración (Opcional)</label>
            <input
              type="date"
              value={formData.valid_to}
              onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
          <button
            onClick={() => {
              showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
            }}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={showCreateModal ? handleCreate : handleUpdate}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {isSubmitting ?
              (showCreateModal ? 'Creando...' : 'Actualizando...') :
              (showCreateModal ? 'Crear Cupón' : 'Actualizar Cupón')
            }
          </button>
        </div>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Eliminar "{selectedCoupon?.code}"?
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Esta acción desactivará el cupón "{selectedCoupon?.name}".
            Podrás volver a activarlo más tarde si lo necesitas.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deletingCoupon}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deletingCoupon}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {deletingCoupon ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}