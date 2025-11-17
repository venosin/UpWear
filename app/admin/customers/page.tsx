'use client';

import { useState, useEffect } from 'react';
import { customerService } from '@/services/customerService';
import { Profile, CustomerValidation } from '@/types/customers';
import CreateCustomerButton from '@/components/admin/CreateCustomerButton';
import CustomerActions from '@/components/admin/CustomerActions';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllProfiles();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerCreated = () => {
    loadCustomers();
  };

  const handleCustomerUpdated = () => {
    loadCustomers();
  };

  const handleCustomerDeleted = () => {
    loadCustomers();
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'customer': 'Cliente',
      'admin': 'Administrador',
      'staff': 'Staff'
    };
    return roleLabels[role] || role;
  };

  const getGenderLabel = (gender: string) => {
    const genderLabels: Record<string, string> = {
      'men': 'Masculino',
      'women': 'Femenino',
      'unisex': 'Unisex',
      'kids': 'Niños',
      'none': 'No especificado'
    };
    return genderLabels[gender] || gender;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Administra los perfiles de clientes ({customers.length} total)</p>
        </div>
        <CreateCustomerButton onCustomerCreated={handleCustomerCreated} />
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Verificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono Verificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Género
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrado
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p>No hay clientes registrados</p>
                      <p className="text-sm mt-1">Crea un nuevo cliente usando el botón superior</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {customer.avatar_url && (
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name || 'Avatar'}
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.full_name || 'Sin nombre'}
                          </div>
                          {customer.birth_date && (
                            <div className="text-sm text-gray-500">
                              {new Date(customer.birth_date).toLocaleDateString('es-MX')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {customer.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        customer.email_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.email_verified ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        customer.phone_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.phone_verified ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        customer.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : customer.role === 'staff'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getRoleLabel(customer.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getGenderLabel(customer.gender)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString('es-MX')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <CustomerActions
                        customerId={customer.id}
                        customerName={customer.full_name || 'Sin nombre'}
                        onCustomerUpdated={handleCustomerUpdated}
                        onCustomerDeleted={handleCustomerDeleted}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}