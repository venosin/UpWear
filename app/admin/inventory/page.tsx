'use client';

import { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';

interface InventoryItem {
  id: string;
  product_id: string;
  sku: string;
  stock_quantity: number;
  price_override?: number;
  size_id?: string;
  color_id?: string;
  is_active: boolean;
  created_at: string;
  products: {
    id: string;
    name: string;
    sku: string;
    is_active: boolean;
  };
  sizes?: {
    id: string;
    name: string;
  };
  colors?: {
    id: string;
    name: string;
    hex: string;
  };
}

interface InventoryStats {
  lowStock: number;
  outOfStock: number;
  totalVariants: number;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ lowStock: 0, outOfStock: 0, totalVariants: 0 });
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockForm, setStockForm] = useState({
    quantity: 0,
    operation: 'set' as 'set' | 'add' | 'subtract'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [inventoryData, statsData] = await Promise.all([
        inventoryService.getInventory(),
        inventoryService.getInventoryStats()
      ]);
      setInventory(inventoryData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || stockForm.quantity < 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await inventoryService.updateStock(
        selectedItem.id,
        stockForm.quantity,
        stockForm.operation
      );

      if (result.success) {
        alert('Stock actualizado exitosamente');
        setShowStockModal(false);
        setStockForm({ quantity: 0, operation: 'set' });
        setSelectedItem(null);
        loadData();
      } else {
        alert(`Error: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('Error inesperado al actualizar stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStockModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockForm({
      quantity: item.stock_quantity,
      operation: 'set'
    });
    setShowStockModal(true);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Sin Stock', color: 'red' };
    if (quantity < 10) return { text: 'Stock Bajo', color: 'yellow' };
    return { text: 'En Stock', color: 'green' };
  };

  const getStockBadgeClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-600 mt-2">
          Gestiona el stock de productos ({stats.totalVariants} variantes totales)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Variantes</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalVariants}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Stock Bajo</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.lowStock}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Sin Stock</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.outOfStock}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay variantes en inventario</h3>
            <p className="text-gray-500">Las variantes aparecerán aquí cuando se creen productos con diferentes tallas o colores</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU Variante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Talla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
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
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item.stock_quantity);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.products.name}</div>
                        <div className="text-sm text-gray-500">{item.products.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.sizes?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.colors?.hex && (
                            <div
                              className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                              style={{ backgroundColor: item.colors.hex }}
                            />
                          )}
                          <div className="text-sm text-gray-900">{item.colors?.name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${item.price_override ? item.price_override.toFixed(2) : 'Default'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.stock_quantity} unidades
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockBadgeClass(stockStatus.color)}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openStockModal(item)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ajustar Stock
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

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajustar Stock - {selectedItem.products.name}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                SKU: {selectedItem.sku} | Stock actual: {selectedItem.stock_quantity} unidades
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operación
                </label>
                <select
                  value={stockForm.operation}
                  onChange={(e) => setStockForm({ ...stockForm, operation: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="set">Establecer cantidad</option>
                  <option value="add">Agregar unidades</option>
                  <option value="subtract">Restar unidades</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              {stockForm.operation !== 'set' && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  Nuevo stock: <strong>
                    {stockForm.operation === 'add'
                      ? selectedItem.stock_quantity + stockForm.quantity
                      : Math.max(0, selectedItem.stock_quantity - stockForm.quantity)
                    } unidades
                  </strong>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStockModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}