/**
 * Componente Button reutilizable y accesible
 * Soporta múltiples variantes, tamaños y estados
 */

'use client';

import { Button as HeroUIButton } from '@heroui/react';
import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ==================== TIPOS ====================

export interface ButtonProps {
  children: ReactNode;
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
  href?: string; // Si se proporciona, se renderizará como link
  target?: string;
  rel?: string;
}

// ==================== COMPONENTE ====================

/**
 * Componente Button con múltiples variantes y opciones de personalización
 * Basado en HeroUI Button con envoltorio para consistencia
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      color = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      type = 'button',
      className,
      onClick,
      href,
      target,
      rel,
      ...props
    },
    ref
  ) => {
    // Renderizar contenido con icono
    const renderContent = () => {
      const content = (
        <>
          {loading && (
            <span className="animate-spin">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
          )}

          {!loading && icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}

          <span className={loading ? 'opacity-0' : ''}>{children}</span>

          {!loading && icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      );

      return content;
    };

    // Clases base y variantes
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // Tamaños
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',

        // Full width
        'w-full': fullWidth,

        // Loading state
        'relative': loading,
      },
      className
    );

    // Props para HeroUIButton
    const buttonProps = {
      ref,
      variant,
      color,
      size,
      disabled: disabled || loading,
      type,
      className: baseClasses,
      onClick,
      href,
      target,
      rel,
      isLoading: loading,
      ...props,
    };

    return (
      <HeroUIButton {...buttonProps}>
        {renderContent()}
      </HeroUIButton>
    );
  }
);

Button.displayName = 'Button';

// ==================== VARIANTES PREDEFINIDAS ====================

/**
 * Botón primario con estilo de llamada a la acción
 */
export const PrimaryButton = (props: Omit<ButtonProps, 'color'>) => (
  <Button {...props} color="primary" />
);

/**
 * Botón secundario para acciones menos importantes
 */
export const SecondaryButton = (props: Omit<ButtonProps, 'color'>) => (
  <Button {...props} color="secondary" variant="bordered" />
);

/**
 * Botón de peligro para acciones destructivas
 */
export const DangerButton = (props: Omit<ButtonProps, 'color'>) => (
  <Button {...props} color="danger" />
);

/**
 * Botón de éxito para acciones positivas
 */
export const SuccessButton = (props: Omit<ButtonProps, 'color'>) => (
  <Button {...props} color="success" />
);

/**
 * Botón de outline estilo mínimo
 */
export const OutlineButton = (props: ButtonProps) => (
  <Button {...props} variant="bordered" />
);

/**
 * Botón de ghost estilo transparente
 */
export const GhostButton = (props: ButtonProps) => (
  <Button {...props} variant="light" />
);

/**
 * Botón de icono (circular, sin texto)
 */
export const IconButton = ({
  children,
  size = 'md',
  className,
  ...props
}: Omit<ButtonProps, 'children'> & { children: ReactNode }) => (
  <Button
    {...props}
    size={size}
    className={cn(
      'rounded-full p-2',
      {
        'p-1.5': size === 'sm',
        'p-2': size === 'md',
        'p-3': size === 'lg',
      },
      className
    )}
  >
    {children}
  </Button>
);

// ==================== EXPORTACIONES ====================

export default Button;