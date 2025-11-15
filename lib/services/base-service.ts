import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin-client';

/**
 * Clase base para servicios con Supabase
 * Centraliza la configuración y manejo de errores comunes
 */
export abstract class BaseService {
  protected supabase: ReturnType<typeof createClient>;
  protected adminSupabase: ReturnType<typeof createAdminClient>;

  constructor() {
    this.supabase = createClient();
    this.adminSupabase = createAdminClient();
    this.testConnection();
  }

  /**
   * Verifica la conexión a Supabase
   */
  protected async testConnection(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        console.warn('⚠️ Supabase connection test failed:', error.message);
      } else {
        console.log('✅ Supabase connection test passed');
      }
    } catch (error) {
      console.warn('⚠️ Supabase connection error:', error);
    }
  }

  /**
   * Maneja errores de manera consistente
   */
  protected handleError(error: any, context: string, fallbackResult?: any) {
    console.error(`❌ ${context}:`, error);
    return fallbackResult || [];
  }

  /**
   * Ejecuta una consulta con manejo de errores
   */
  protected async executeQuery<T>(
    query: () => Promise<T>,
    context: string,
    fallbackResult?: T
  ): Promise<T> {
    try {
      return await query();
    } catch (error) {
      return this.handleError(error, context, fallbackResult);
    }
  }

  /**
   * Maneja respuestas de la base de datos
   */
  protected handleResponse<T>(
    data: T | null,
    error: any,
    context: string
  ): { success: boolean; data?: T; error?: any } {
    if (error) {
      return {
        success: false,
        error: error.message || `Error in ${context}`
      };
    }

    return {
      success: true,
      data
    };
  }
}