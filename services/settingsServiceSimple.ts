import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

/**
 * Settings Service - Versión simple como la usábamos antes
 */
class SettingsService {
  private supabase = supabase;

  // ============================================
  // GETTER METHODS
  // ============================================

  async getPublicSettings() {
    try {
      const { data, error } = await this.supabase
        .from('public_site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching public settings:', error);
        return this.getDefaultSettings();
      }

      return data || this.getDefaultSettings();
    } catch (error) {
      console.error('Error in getPublicSettings:', error);
      return this.getDefaultSettings();
    }
  }

  async getAllSettings() {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('*')
        .order('category, group_name, sort_order');

      if (error) {
        console.error('Error fetching all settings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSettings:', error);
      return [];
    }
  }

  async getSettingByKey(key: string) {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching setting ${key}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error in getSettingByKey ${key}:`, error);
      return null;
    }
  }

  async getSettingsByCategory(category: string) {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
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
  // CRUD OPERATIONS
  // ============================================

  async updateSetting(key: string, value: any) {
    try {
      const { error } = await this.supabase
        .from('site_settings')
        .update({
          value: this.formatValue(value),
          updated_at: new Date().toISOString()
        })
        .eq('key', key);

      if (error) {
        console.error(`Error updating setting ${key}:`, error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error(`Error in updateSetting ${key}:`, error);
      return { success: false, error };
    }
  }

  async createSetting(settingData: any) {
    try {
      const { data, error } = await this.supabase
        .from('site_settings')
        .insert({
          ...settingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating setting:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createSetting:', error);
      return { success: false, error };
    }
  }

  async deleteSetting(key: string) {
    try {
      const { error } = await this.supabase
        .from('site_settings')
        .delete()
        .eq('key', key);

      if (error) {
        console.error(`Error deleting setting ${key}:`, error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error(`Error in deleteSetting ${key}:`, error);
      return { success: false, error };
    }
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  async updateMultipleSettings(updates: { key: string; value: any }[]) {
    try {
      const results = [];

      for (const update of updates) {
        const result = await this.updateSetting(update.key, update.value);
        results.push({ key: update.key, ...result });
      }

      return results;
    } catch (error) {
      console.error('Error in updateMultipleSettings:', error);
      return updates.map(update => ({
        key: update.key,
        success: false,
        error
      }));
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  formatValue(value: any): string {
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

  parseValue(value: string, type: string): any {
    if (type === 'boolean') {
      return value === 'true';
    }
    if (type === 'number') {
      return parseFloat(value);
    }
    if (type === 'json') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  }

  getDefaultSettings() {
    return [
      { key: 'site_name', value: 'UpWear', value_type: 'string' },
      { key: 'site_email', value: 'contact@upwear.com', value_type: 'string' },
      { key: 'currency_code', value: 'USD', value_type: 'string' },
      { key: 'currency_symbol', value: '$', value_type: 'string' },
      { key: 'tax_rate', value: '16.00', value_type: 'string' }
    ];
  }

  // ============================================
  // VALIDATION (MCP STYLE)
  // ============================================

  async validateSettings() {
    try {
      const results = {
        tableExists: false,
        publicViewExists: false,
        totalSettings: 0,
        publicSettings: 0,
        categories: 0,
        errors: [] as string[]
      };

      // Check if table exists
      const { count, error: tableError } = await this.supabase
        .from('site_settings')
        .select('*', { count: 'exact', head: true });

      if (tableError) {
        results.errors.push('site_settings table not accessible');
        return results;
      }

      results.tableExists = true;
      results.totalSettings = count || 0;

      // Check public view
      const { count: publicCount, error: viewError } = await this.supabase
        .from('public_site_settings')
        .select('*', { count: 'exact', head: true });

      if (!viewError) {
        results.publicViewExists = true;
        results.publicSettings = publicCount || 0;
      }

      // Count categories
      const { data: settings } = await this.supabase
        .from('site_settings')
        .select('category');

      if (settings) {
        results.categories = new Set(settings.map(s => s.category)).size;
      }

      return {
        ...results,
        valid: results.errors.length === 0 && results.totalSettings > 0
      };
    } catch (error) {
      return {
        tableExists: false,
        publicViewExists: false,
        totalSettings: 0,
        publicSettings: 0,
        categories: 0,
        errors: [String(error)],
        valid: false
      };
    }
  }
}

// Exportar singleton
export const settingsService = new SettingsService();
export default SettingsService;