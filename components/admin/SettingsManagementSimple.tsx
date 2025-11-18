'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Switch, Select, SelectItem, Card, CardBody, CardHeader, Divider, Chip, Avatar } from '@heroui/react';
import { useToast } from '@/components/ui/ToastProvider';
import {
  CogIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  TruckIcon,
  EnvelopeIcon,
  PhoneIcon,
  TagIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Setting {
  id: number;
  key: string;
  category: string;
  display_name: string;
  description: string;
  value: string;
  value_type: string;
  is_public: boolean;
  input_type: string;
  group_name: string;
  sort_order: number;
  placeholder?: string;
}

export default function SettingsManagementSimple() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const toast = useToast();

  // Valores por defecto si no hay conexión
  const defaultSettings: Setting[] = [
    {
      id: 1,
      key: 'site_name',
      category: 'general',
      display_name: 'Nombre del Sitio',
      description: 'Nombre de la tienda',
      value: 'UpWear',
      value_type: 'string',
      is_public: true,
      input_type: 'text',
      group_name: 'Información Básica',
      sort_order: 1
    },
    {
      id: 2,
      key: 'site_email',
      category: 'general',
      display_name: 'Email de Contacto',
      description: 'Email principal del sitio',
      value: 'contact@upwear.com',
      value_type: 'string',
      is_public: true,
      input_type: 'email',
      group_name: 'Información Básica',
      sort_order: 2
    },
    {
      id: 3,
      key: 'currency_code',
      category: 'general',
      display_name: 'Moneda',
      description: 'Código de moneda',
      value: 'USD',
      value_type: 'string',
      is_public: true,
      input_type: 'select',
      group_name: 'Configuración Regional',
      sort_order: 3
    },
    {
      id: 4,
      key: 'tax_rate',
      category: 'ecommerce',
      display_name: 'Tasa de Impuestos',
      description: 'Porcentaje de impuestos (%)',
      value: '16.00',
      value_type: 'string',
      is_public: false,
      input_type: 'number',
      group_name: 'Configuración de Ventas',
      sort_order: 1
    }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Intentar cargar desde Supabase
      const response = await fetch('/api/settings');

      if (response.ok) {
        const data = await response.json();
        setSettings(data.length > 0 ? data : defaultSettings);
        toast.success('Configuración cargada correctamente');
      } else {
        // Si falla, usar valores por defecto
        setSettings(defaultSettings);
        toast.warning('Usando configuración por defecto');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
      toast.info('Modo offline - configuración local');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(true);

      // Update local state immediately for better UX
      setSettings(prev => prev.map(setting =>
        setting.key === key ? { ...setting, value: String(value) } : setting
      ));

      // Try to save to backend (but don't fail if it doesn't work)
      try {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        });

        if (response.ok) {
          toast.success('Configuración guardada');
        } else {
          toast.warning('Guardado localmente');
        }
      } catch (backendError) {
        console.warn('Backend not available:', backendError);
        toast.info('Guardado localmente');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Error al actualizar configuración');
    } finally {
      setSaving(false);
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = {};
    }
    if (!acc[setting.category][setting.group_name || 'General']) {
      acc[setting.category][setting.group_name || 'General'] = [];
    }
    acc[setting.category][setting.group_name || 'General'].push(setting);
    return acc;
  }, {} as any);

  const categories = Object.keys(groupedSettings);

  const renderSettingInput = (setting: Setting) => {
    const value = setting.value;

    switch (setting.input_type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={setting.input_type}
            value={value}
            placeholder={setting.placeholder}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            isDisabled={saving}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            placeholder={setting.placeholder}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            isDisabled={saving}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            placeholder={setting.placeholder}
            onChange={(e) => updateSetting(setting.key, parseFloat(e.target.value) || 0)}
            isDisabled={saving}
          />
        );

      case 'select':
        const currencyOptions = [
          { key: 'USD', label: 'USD - Dólar Americano' },
          { key: 'EUR', label: 'EUR - Euro' },
          { key: 'MXN', label: 'MXN - Peso Mexicano' }
        ];

        return (
          <Select
            selectedKeys={[value]}
            placeholder={setting.placeholder}
            onSelectionChange={(keys) => updateSetting(setting.key, Array.from(keys)[0])}
            isDisabled={saving}
          >
            {currencyOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        );

      case 'checkbox':
        return (
          <Switch
            isSelected={value === 'true'}
            onValueChange={(checked) => updateSetting(setting.key, checked)}
            isDisabled={saving}
          />
        );

      default:
        return (
          <Input
            value={value}
            placeholder={setting.placeholder}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            isDisabled={saving}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <CogIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Sitio</h1>
            <p className="text-gray-600">
              Gestiona la configuración general, precios, impuestos y más.
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              color={activeCategory === category ? "primary" : "default"}
              variant={activeCategory === category ? "solid" : "flat"}
              onPress={() => setActiveCategory(category)}
              size="lg"
              className="text-gray-800 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {getCategoryDisplayName(category)}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Settings Groups */}
      {groupedSettings[activeCategory] && Object.entries(groupedSettings[activeCategory]).map(([groupName, groupSettings]: [string, any[]]) => (
        <Card key={groupName} className="mb-6 bg-white shadow-sm border border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
          </CardHeader>
          <CardBody className="bg-white">
            <div className="space-y-6">
              {groupSettings.map((setting) => (
                <div key={setting.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {setting.display_name}
                      {setting.is_public && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Público
                        </span>
                      )}
                    </label>
                    {setting.description && (
                      <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
                    )}
                  </div>
                  <div>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}

      {/* Status indicator */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-sm font-medium text-blue-900">
            Configuración funcionando en modo seguro {settings.length === defaultSettings.length && '(offline)'}
          </span>
        </div>
      </div>

      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm">Guardando configuración...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(category: string) {
  const iconComponents: { [key: string]: any } = {
    general: <GlobeAltIcon className="h-5 w-5" />,
    ecommerce: <CurrencyDollarIcon className="h-5 w-5" />,
    payment: <CurrencyDollarIcon className="h-5 w-5" />,
    shipping: <TruckIcon className="h-5 w-5" />,
    email: <EnvelopeIcon className="h-5 w-5" />,
    social: <TagIcon className="h-5 w-5" />,
    seo: <GlobeAltIcon className="h-5 w-5" />,
    inventory: <LockClosedIcon className="h-5 w-5" />,
    maintenance: <CogIcon className="h-5 w-5" />
  };
  return iconComponents[category] || <CogIcon className="h-5 w-5" />;
}

function getCategoryDisplayName(category: string): string {
  const categoryNames: { [key: string]: string } = {
    general: 'Información General',
    ecommerce: 'E-commerce',
    payment: 'Pagos',
    shipping: 'Envíos',
    email: 'Email',
    social: 'Redes Sociales',
    seo: 'SEO',
    inventory: 'Inventario',
    maintenance: 'Mantenimiento'
  };
  return categoryNames[category] || category;
}