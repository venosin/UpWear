import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

/**
 * Base Service para operaciones comunes de base de datos
 */
export abstract class BaseService<T> {
  protected tableName: string;
  protected supabase = supabase;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Obtiene ID de usuario actual para logging
   */
  protected async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Log de actividad para auditoría
   */
  protected async logActivity(
    action: string,
    entity: string,
    entityId: number | null,
    oldValues: any = null,
    newValues: any = null
  ): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      // Solo intentar loggear si la tabla admin_activity_logs existe
      const { error } = await this.supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: userId,
          action,
          entity,
          entity_id: entityId,
          old_values: oldValues,
          new_values: newValues,
          created_at: new Date().toISOString()
        });

      // Ignorar errores si la tabla no existe
      if (error && error.code !== 'PGRST116') {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error in logActivity:', error);
      // No lanzar error para no romper el flujo principal
    }
  }

  /**
   * Métodos CRUD básicos
   */
  async getAll(limit: number = 100): Promise<T[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw error;
    }
  }

  async getById(id: number): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${this.tableName} ${id}:`, error);
      throw error;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Error updating ${this.tableName} ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting ${this.tableName} ${id}:`, error);
      throw error;
    }
  }
}

export default BaseService;