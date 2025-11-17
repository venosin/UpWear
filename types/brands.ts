/**
 * Tipos exactos para Brands basados en estructura MCP de Supabase
 */

export interface Brand {
  id: number;                        // BIGSERIAL PRIMARY KEY
  name: string;                      // VARCHAR(100) NOT NULL UNIQUE
  slug: string;                      // VARCHAR(120) UNIQUE NOT NULL
  description?: string | null;       // TEXT NULL
  logo_url?: string | null;          // TEXT NULL
  banner_url?: string | null;        // TEXT NULL
  country?: string | null;           // VARCHAR(2) NULL (ISO 3166-1 alpha-2)
  website_url?: string | null;       // TEXT NULL
  is_featured: boolean;              // BOOLEAN NOT NULL DEFAULT false
  is_active: boolean;                // BOOLEAN NOT NULL DEFAULT true
  metadata: Record<string, any>;     // JSONB NOT NULL DEFAULT '{}'
  created_at: string;                // TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  updated_at: string;                // TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
}

export interface BrandCreate {
  name: string;                      // VARCHAR(100) NOT NULL
  slug?: string;                     // VARCHAR(120) UNIQUE NOT NULL (auto-generated if not provided)
  description?: string | null;       // TEXT NULL
  logo_url?: string | null;          // TEXT NULL
  banner_url?: string | null;        // TEXT NULL
  country?: string | null;           // VARCHAR(2) NULL (ISO 3166-1 alpha-2)
  website_url?: string | null;       // TEXT NULL
  is_featured?: boolean;             // BOOLEAN DEFAULT false
  is_active?: boolean;               // BOOLEAN DEFAULT true
  metadata?: Record<string, any>;    // JSONB DEFAULT '{}'
}

export interface BrandUpdate {
  name?: string;                     // VARCHAR(100) UNIQUE
  slug?: string;                     // VARCHAR(120) UNIQUE
  description?: string | null;       // TEXT
  logo_url?: string | null;          // TEXT
  banner_url?: string | null;        // TEXT
  country?: string | null;           // VARCHAR(2) (ISO 3166-1 alpha-2)
  website_url?: string | null;       // TEXT
  is_featured?: boolean;             // BOOLEAN
  is_active?: boolean;               // BOOLEAN
  metadata?: Record<string, any>;    // JSONB
}

/**
 * Utilidades para validación de campos específicos de Brands
 */
export const BrandValidation = {
  /**
   * Valida que el country code sea ISO 3166-1 alpha-2 (2 caracteres)
   */
  isValidCountryCode: (country: string): boolean => {
    return /^[A-Z]{2}$/i.test(country);
  },

  /**
   * Valida que una URL sea válida (opcional)
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Genera slug a partir del nombre
   */
  generateSlug: (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Lista de country codes ISO 3166-1 alpha-2 más comunes (para dropdown)
   */
  commonCountryCodes: [
    { code: 'US', name: 'United States' },
    { code: 'MX', name: 'Mexico' },
    { code: 'ES', name: 'Spain' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'CL', name: 'Chile' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'AU', name: 'Australia' }
  ] as const
} as const;