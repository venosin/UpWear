import { Metadata } from 'next';
import SettingsManagementSimple from '@/components/admin/SettingsManagementSimple';

export const metadata: Metadata = {
  title: 'Configuración del Sitio - UpWear Admin',
  description: 'Gestiona la configuración general, precios, impuestos y más.',
};

export default function SettingsPage() {
  return <SettingsManagementSimple />;
}