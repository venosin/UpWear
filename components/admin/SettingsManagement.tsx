'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Switch, Select, SelectItem, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { settingsService } from '@/services/settingsServiceSimple';
import { useToast } from '@/components/ui/ToastProvider';

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
  validation_rules?: any;
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const toast = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAllSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      const result = await settingsService.updateSetting(key, value);

      if (result.success) {
        // Update local state
        setSettings(prev => prev.map(setting =>
          setting.key === key ? { ...setting, value: settingsService.formatValue(value) } : setting
        ));
        toast.success('Configuración actualizada');
      } else {
        toast.error('Error al actualizar configuración');
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
    const value = settingsService.parseValue(setting.value, setting.value_type);

    switch (setting.input_type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={setting.input_type}
            value={value as string}
            placeholder={setting.placeholder}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            isDisabled={saving}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value as string}
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
            value={value as number}
            placeholder={setting.placeholder}
            onChange={(e) => updateSetting(setting.key, parseFloat(e.target.value) || 0)}
            isDisabled={saving}
          />
        );

      case 'select':
        const options = setting.validation_rules?.options || [
          { key: 'USD', label: 'USD - Dólar Americano' },
          { key: 'EUR', label: 'EUR - Euro' },
          { key: 'MXN', label: 'MXN - Peso Mexicano' }
        ];

        return (
          <Select
            selectedKeys={[value as string]}
            placeholder={setting.placeholder}
            onSelectionChange={(keys) => updateSetting(setting.key, Array.from(keys)[0])}
            isDisabled={saving}
          >
            {options.map((option: any) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label || option.key}
              </SelectItem>
            ))}
          </Select>
        );

      case 'checkbox':
        return (
          <Switch
            isSelected={value as boolean}
            onValueChange={(checked) => updateSetting(setting.key, checked)}
            isDisabled={saving}
          />
        );

      default:
        return (
          <Input
            value={value as string}
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⚙️ Configuración del Sitio</h1>
        <p className="text-gray-600">
          Gestiona la configuración general, precios, impuestos y más.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              color={activeCategory === category ? "primary" : "default"}
              variant={activeCategory === category ? "solid" : "flat"}
              onPress={() => setActiveCategory(category)}
              size="sm"
            >
              {getCategoryDisplayName(category)}
            </Button>
          ))}
        </div>
      </div>

      {/* Settings Groups */}
      {groupedSettings[activeCategory] && Object.entries(groupedSettings[activeCategory]).map(([groupName, groupSettings]: [string, any[]]) => (
        <Card key={groupName} className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">{groupName}</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {groupSettings.map((setting) => (
                <div key={setting.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setting.display_name}
                      {setting.is_public && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Público
                        </span>
                      )}
                    </label>
                    {setting.description && (
                      <p className="text-sm text-gray-500 mb-2">{setting.description}</p>
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