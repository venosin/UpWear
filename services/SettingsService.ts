import { BaseService } from './BaseService';
import {
  DatabaseSiteSetting,
  PublicSiteSetting,
  AdminSettingByCategory,
  SiteSettingForm,
  SettingCategory,
  SettingsByCategory,
  SettingGroup
} from '@/lib/database.types';

export class SettingsService extends BaseService<DatabaseSiteSetting> {
  constructor() {
    super('site_settings');
  }

  // ============================================
  // PUBLIC SETTINGS (for frontend)
  // ============================================

  async getPublicSettings(): Promise<PublicSiteSetting[]> {
    try {
      const { data, error } = await this.supabase
        .from('public_site_settings')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching public settings:', error);
      throw error;
    }
  }

  async getPublicSettingByKey(key: string): Promise<PublicSiteSetting | null> {
    try {
      const { data, error } = await this.supabase
        .from('public_site_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching public setting ${key}:`, error);
      throw error;
    }
  }

  // ============================================
  // ADMIN SETTINGS (full CRUD)
  // ============================================

  async getAllAdminSettings(): Promise<AdminSettingByCategory[]> {
    try {
      const { data, error } = await this.supabase
        .from('admin_settings_by_category')
        .select('*')
        .order('category')
        .order('group_name')
        .order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      throw error;
    }
  }

  async getSettingsByCategory(category: SettingCategory): Promise<AdminSettingByCategory[]> {
    try {
      const { data, error } = await this.supabase
        .from('admin_settings_by_category')
        .select('*')
        .eq('category', category)
        .order('group_name')
        .order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching settings for category ${category}:`, error);
      throw error;
    }
  }

  async getSettingByKey(key: string): Promise<DatabaseSiteSetting | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      throw error;
    }
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  async createSetting(formData: SiteSettingForm): Promise<DatabaseSiteSetting> {
    try {
      const settingData = {
        key: formData.key,
        category: formData.category,
        display_name: formData.display_name,
        description: formData.description || null,
        value: this.formatValueForStorage(formData.value, formData.value_type),
        value_type: formData.value_type,
        default_value: formData.default_value ? this.formatValueForStorage(formData.default_value, formData.value_type) : null,
        is_public: formData.is_public || false,
        is_required: formData.is_required || false,
        input_type: formData.input_type,
        input_options: formData.input_options || {},
        group_name: formData.group_name || null,
        sort_order: formData.sort_order || 0,
        placeholder: formData.placeholder || null,
        validation_rules: formData.validation_rules || {},
        created_by: await this.getCurrentUserId()
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(settingData)
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await this.logActivity('created', 'setting', data.id, null, data);

      return data;
    } catch (error) {
      console.error('Error creating setting:', error);
      throw error;
    }
  }

  async updateSetting(id: number, formData: Partial<SiteSettingForm>): Promise<DatabaseSiteSetting> {
    try {
      // Get old value for logging
      const oldSetting = await this.getById(id);
      if (!oldSetting) throw new Error('Setting not found');

      const updateData: any = {
        last_modified_by: await this.getCurrentUserId()
      };

      // Only update provided fields
      if (formData.display_name !== undefined) updateData.display_name = formData.display_name;
      if (formData.description !== undefined) updateData.description = formData.description;
      if (formData.value !== undefined && formData.value_type !== undefined) {
        updateData.value = this.formatValueForStorage(formData.value, formData.value_type);
      }
      if (formData.is_public !== undefined) updateData.is_public = formData.is_public;
      if (formData.is_required !== undefined) updateData.is_required = formData.is_required;
      if (formData.input_options !== undefined) updateData.input_options = formData.input_options;
      if (formData.group_name !== undefined) updateData.group_name = formData.group_name;
      if (formData.sort_order !== undefined) updateData.sort_order = formData.sort_order;
      if (formData.placeholder !== undefined) updateData.placeholder = formData.placeholder;
      if (formData.validation_rules !== undefined) updateData.validation_rules = formData.validation_rules;

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await this.logActivity('updated', 'setting', id, oldSetting, data);

      return data;
    } catch (error) {
      console.error(`Error updating setting ${id}:`, error);
      throw error;
    }
  }

  async deleteSetting(id: number): Promise<void> {
    try {
      // Get setting for logging
      const setting = await this.getById(id);
      if (!setting) throw new Error('Setting not found');

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log the activity
      await this.logActivity('deleted', 'setting', id, setting, null);
    } catch (error) {
      console.error(`Error deleting setting ${id}:`, error);
      throw error;
    }
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async updateMultipleSettings(settings: { id: number; value: any }[]): Promise<DatabaseSiteSetting[]> {
    try {
      const results: DatabaseSiteSetting[] = [];

      for (const setting of settings) {
        const currentSetting = await this.getById(setting.id);
        if (!currentSetting) continue;

        const updated = await this.updateSetting(setting.id, {
          value: setting.value,
          value_type: currentSetting.value_type as any
        });
        results.push(updated);
      }

      return results;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  }

  async exportSettingsByCategory(category?: SettingCategory): Promise<AdminSettingByCategory[]> {
    try {
      let query = this.supabase
        .from('admin_settings_by_category')
        .select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('category').order('group_name').order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  formatValueForStorage(value: any, valueType: string): string {
    switch (valueType) {
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return value.toString();
      case 'json':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  formatValueForDisplay(value: string | null, valueType: string): any {
    if (!value) return null;

    switch (valueType) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseFloat(value);
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      default:
        return value;
    }
  }

  getSettingsGroupedByCategory(settings: AdminSettingByCategory[]): SettingsByCategory {
    const grouped: SettingsByCategory = {
      general: [],
      ecommerce: [],
      payment: [],
      shipping: [],
      email: [],
      social: [],
      seo: [],
      inventory: [],
      maintenance: []
    };

    settings.forEach(setting => {
      let group = grouped[setting.category].find(g => g.name === setting.group_name);

      if (!group) {
        group = {
          name: setting.group_name || 'General',
          display_name: setting.group_name || 'General',
          settings: []
        };
        grouped[setting.category].push(group);
      }

      group.settings.push(setting);
    });

    return grouped;
  }

  async validateSettingKey(key: string, excludeId?: number): Promise<boolean> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('id')
        .eq('key', key);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error validating setting key:', error);
      return false;
    }
  }

  // ============================================
  // VALIDATION WITH MCP
  // ============================================

  async validateSettingsWithMCP(): Promise<{
    valid: boolean;
    errors: string[];
    missing_settings: string[]
  }> {
    const errors: string[] = [];
    const missing_settings: string[] = [];

    try {
      // Check if settings table exists
      const { error: tableError } = await this.supabase
        .from('site_settings')
        .select('id')
        .limit(1);

      if (tableError) {
        errors.push(`Settings table error: ${tableError.message}`);
        return { valid: false, errors, missing_settings };
      }

      // Check essential settings
      const essentialSettings = [
        'site_name',
        'site_email',
        'currency_code',
        'tax_rate'
      ];

      for (const key of essentialSettings) {
        const { data, error } = await this.supabase
          .from('site_settings')
          .select('key, value')
          .eq('key', key)
          .single();

        if (error || !data) {
          missing_settings.push(key);
        }
      }

      return {
        valid: errors.length === 0 && missing_settings.length === 0,
        errors,
        missing_settings
      };
    } catch (error) {
      errors.push(`MCP validation error: ${error}`);
      return { valid: false, errors, missing_settings };
    }
  }
}

// Export singleton instance
export const settingsService = new SettingsService();