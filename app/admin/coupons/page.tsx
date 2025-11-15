'use client';

import { useState, useEffect } from 'react';
import { couponService } from '@/services/couponService';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimum_amount?: number;
  usage_limit?: number;
  usage_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
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
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed_amount',
    value: 0,
    minimum_amount: 0,
    usage_limit: 0,
    expires_at: ''
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
    if (!formData.code.trim() || formData.value <= 0) {
      alert('Código y valor son requeridos, el valor debe ser mayor a 0');
      return;
    }

    if (formData.type === 'percentage' && (formData.value <= 0 || formData.value > 100)) {
      alert('El porcentaje debe estar entre 1 y 100');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await couponService.createCoupon(formData);
      if (result.success) {
        alert('Cupón creado exitosamente');
        setShowCreateModal(false);
        resetForm();
        loadData();
      } else {
        alert(`Error: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error inesperado al crear cupón');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCoupon || !formData.code.trim() || formData.value <= 0) {
      alert('Código y valor son requeridos, el valor debe ser mayor a 0');
      return;
    }

    if (formData.type === 'percentage' && (formData.value <= 0 || formData.value > 100)) {
      alert('El porcentaje debe estar entre 1 y 100');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await couponService.updateCoupon(selectedCoupon.id, formData);
      if (result.success) {
        alert('Cupón actualizado exitosamente');
        setShowEditModal(false);
        resetForm();
        loadData();
      } else {
        alert(`Error: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error inesperado al actualizar cupón');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el cupón "${coupon.code}"?`)) {
      return;
    }

    try {
      const result = await couponService.deleteCoupon(coupon.id);
      if (result.success) {
        alert('Cupón eliminado exitosamente');
        loadData();
      } else {
        alert(`Error: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error inesperado al eliminar cupón');
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minimum_amount: coupon.minimum_amount || 0,
      usage_limit: coupon.usage_limit || 0,
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minimum_amount: 0,
      usage_limit: 0,
      expires_at: ''
    });
    setSelectedCoupon(null);
  };

  const getExpirationStatus = (expiresAt?: string) => {
    if (!expiresAt) return { text: 'Sin expiración', color: 'gray' };

    const expirationDate = new Date(expiresAt);
    const now = new Date();

    if (expirationDate < now) {
      return { text: 'Expirado', color: 'red' };
    } else if (expirationDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) { // 7 days
      return { text: 'Por expirar', color: 'yellow' };
    } else {
      return { text: 'Vigente', color: 'green' };
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
                  const expirationStatus = getExpirationStatus(coupon.expires_at);
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.type === 'percentage'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {coupon.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                        </div>
                        {coupon.minimum_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            Mínimo: ${coupon.minimum_amount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usage_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                        </div>
                        {coupon.usage_limit && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('es-ES') : 'Sin expiración'}
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
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Create/Edit Modal (reusable) */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showCreateModal ? 'Nuevo Cupón' : 'Editar Cupón'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VERANO20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed_amount">Monto Fijo ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor {formData.type === 'percentage' ? '(1-100%)' : '(en dólares)'}*
                </label>
                <input
                  type="number"
                  min={formData.type === 'percentage' ? 1 : 0.01}
                  step={formData.type === 'percentage' ? 1 : 0.01}
                  max={formData.type === 'percentage' ? 100 : undefined}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Mínimo de Compra</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimum_amount}
                  onChange={(e) => setFormData({ ...formData, minimum_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Uso (0 = ilimitado)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={showCreateModal ? handleCreate : handleUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ?
                  (showCreateModal ? 'Creando...' : 'Actualizando...') :
                  (showCreateModal ? 'Crear' : 'Actualizar')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}