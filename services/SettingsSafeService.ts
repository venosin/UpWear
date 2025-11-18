import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

/**
 * Service de Settings con manejo seguro de errores para enums faltantes
 */
export class SettingsSafeService {
  private supabase = supabase;

  async getPublicSettings() {
    try {
      const { data, error } = await this.supabase
        .from('public_site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching public settings:', error);
        // Fallback a valores por defecto
        return this.getDefaultPublicSettings();
      }
      return data || this.getDefaultPublicSettings();
    } catch (error) {
      console.error('Error in getPublicSettings:', error);
      return this.getDefaultPublicSettings();
    }
  }

  async getAdminSettings() {
    try {
      // Primero verificar si la tabla existe
      const tableExists = await this.checkTableExists('site_settings');
      if (!tableExists) {
        console.warn('site_settings table does not exist, returning empty settings');
        return [];
      }

      const { data, error } = await this.supabase
        .from('admin_settings_by_category')
        .select('*')
        .order('category, group_name, sort_order');

      if (error) {
        console.error('Error fetching admin settings:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error in getAdminSettings:', error);
      return [];
    }
  }

  async updateSetting(key: string, value: any) {
    try {
      const tableExists = await this.checkTableExists('site_settings');
      if (!tableExists) {
        console.warn('site_settings table does not exist, skipping update');
        return false;
      }

      const { error } = await this.supabase
        .from('site_settings')
        .update({ value: this.formatValueForStorage(value), updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) {
        console.error(`Error updating setting ${key}:`, error);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error in updateSetting ${key}:`, error);
      return false;
    }
  }

  async getSettingsByCategory(category: string) {
    try {
      const tableExists = await this.checkTableExists('site_settings');
      if (!tableExists) {
        return [];
      }

      const { data, error } = await this.supabase
        .from('admin_settings_by_category')
        .select('*')
        .eq('category', category)
        .order('group_name, sort_order');

      if (error) {
        console.error(`Error fetching settings for category ${category}:`, error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error(`Error in getSettingsByCategory ${category}:`, error);
      return [];
    }
  }

  // ============================================
  // VALIDACIÓN SEGURA
  // ============================================

  async validateSettingsWithMCP() {
    try {
      const results = {
        table_exists: false,
        columns_exist: false,
        public_settings: 0,
        essential_settings: 0,
        errors: [] as string[]
      };

      // 1. Verificar si tabla existe
      results.table_exists = await this.checkTableExists('site_settings');

      if (!results.table_exists) {
        results.errors.push('site_settings table does not exist');
        return results;
      }

      // 2. Verificar columnas principales
      results.columns_exist = await this.checkColumnExists('site_settings', 'key') &&
                            await this.checkColumnExists('site_settings', 'value') &&
                            await this.checkColumnExists('site_settings', 'is_public');

      if (!results.columns_exist) {
        results.errors.push('Essential columns missing in site_settings');
      }

      // 3. Contar settings públicos
      const publicCount = await this.supabase
        .from('site_settings')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      results.public_settings = publicCount.count || 0;

      // 4. Verificar settings esenciales
      const essentialKeys = ['site_name', 'site_email', 'currency_code', 'tax_rate'];
      const { data: settings, error: settingsError } = await this.supabase
        .from('site_settings')
        .select('key')
        .in('key', essentialKeys);

      if (settingsError) {
        results.errors.push('Error fetching essential settings');
      } else {
        results.essential_settings = settings?.length || 0;
      }

      return {
        ...results,
        valid: results.errors.length === 0,
        table_info: {
          table_exists: results.table_exists,
          columns_exist: results.columns_exist,
          public_settings: results.public_settings,
          essential_settings: results.essential_settings
        }
      };
    } catch (error) {
      console.error('Error validating settings with MCP:', error);
      return {
        table_exists: false,
        columns_exist: false,
        public_settings: 0,
        essential_settings: 0,
        errors: [`Validation error: ${error}`],
        valid: false
      };
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .single();

      return !!data;
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  private async checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .eq('column_name', columnName)
        .single();

      return !!data;
    } catch (error) {
      console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
      return false;
    }
  }

  private formatValueForStorage(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private getDefaultPublicSettings() {
    return [
      { key: 'site_name', value: 'UpWear', value_type: 'string' },
      { key: 'currency_code', value: 'USD', value_type: 'string' },
      { key: 'currency_symbol', value: '$', value_type: 'string' },
      { key: 'default_language', value: 'es', value_type: 'string' }
    ];
  }
}

// Exportar instancia única
export const settingsSafeService = new SettingsSafeService();