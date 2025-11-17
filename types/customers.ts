/**
 * Tipos exactos para Customers (Profiles) basados en estructura MCP de Supabase
 */

// Enums basados en la base de datos
export type UserRole = 'customer' | 'admin' | 'staff';
export type ProductGender = 'men' | 'women' | 'unisex' | 'kids' | 'none';

export interface Profile {
  id: string;                        // UUID REFERENCES auth.users(id) PRIMARY KEY
  full_name?: string;                 // TEXT NULL
  phone?: string;                     // TEXT NULL
  role: UserRole;                     // user_role NOT NULL DEFAULT 'customer'
  avatar_url?: string;                // TEXT NULL
  email_verified: boolean;            // BOOLEAN NOT NULL DEFAULT false
  phone_verified: boolean;            // BOOLEAN NOT NULL DEFAULT false
  birth_date?: string;                // DATE NULL (YYYY-MM-DD)
  gender: ProductGender;               // product_gender NOT NULL DEFAULT 'none'
  preferences: Record<string, any>;   // JSONB NOT NULL DEFAULT '{}'
  metadata: Record<string, any>;      // JSONB NOT NULL DEFAULT '{}'
  created_at: string;                // TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  updated_at: string;                // TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
}

export interface ProfileCreate {
  full_name?: string;                 // TEXT NULL
  phone?: string;                     // TEXT NULL
  role?: UserRole;                     // user_role DEFAULT 'customer'
  avatar_url?: string;                // TEXT NULL
  birth_date?: string;                // DATE NULL (YYYY-MM-DD)
  gender?: ProductGender;               // product_gender DEFAULT 'none'
  preferences?: Record<string, any>;   // JSONB DEFAULT '{}'
  metadata?: Record<string, any>;      // JSONB DEFAULT '{}'
}

export interface ProfileUpdate {
  full_name?: string;                 // TEXT
  phone?: string;                     // TEXT
  role?: UserRole;                     // user_role
  avatar_url?: string;                // TEXT
  email_verified?: boolean;            // BOOLEAN
  phone_verified?: boolean;            // BOOLEAN
  birth_date?: string;                // DATE (YYYY-MM-DD)
  gender?: ProductGender;               // product_gender
  preferences?: Record<string, any>;   // JSONB
  metadata?: Record<string, any>;      // JSONB
}

/**
 * Interfaces para registro de usuarios
 */
export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  gender?: ProductGender;
  accept_terms: boolean;
  accept_privacy: boolean;
  subscribe_newsletter?: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

/**
 * Interfaces para login
 */
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: Profile;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}

/**
 * Utilidades para validación de campos específicos de Customers
 */
export const CustomerValidation = {
  /**
   * Valida formato de email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida formato de teléfono (formato internacional)
   */
  isValidPhone: (phone: string): boolean => {
    // Permite formatos como +1234567890, 123-456-7890, (123) 456-7890
    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Valida formato de fecha (YYYY-MM-DD)
   */
  isValidDate: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  },

  /**
   * Valida fortaleza de contraseña
   */
  isValidPassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Valida que una URL sea una imagen válida
   */
  isValidImage: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
      return imageExtensions.test(urlObj.pathname);
    } catch {
      return false;
    }
  },

  /**
   * Formatea número de teléfono
   */
  formatPhone: (phone: string): string => {
    // Remover todos los caracteres excepto números y +
    return phone.replace(/[^\d+]/g, '');
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
   * Opciones de género para formularios
   */
  genderOptions: [
    { value: 'none', label: 'Prefiero no decir' },
    { value: 'men', label: 'Masculino' },
    { value: 'women', label: 'Femenino' },
    { value: 'unisex', label: 'Unisex' },
    { value: 'kids', label: 'Niños' }
  ] as const,

  /**
   * Opciones de rol para administradores
   */
  roleOptions: [
    { value: 'customer', label: 'Cliente' },
    { value: 'admin', label: 'Administrador' },
    { value: 'staff', label: 'Staff' }
  ] as const
} as const;