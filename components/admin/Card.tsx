/**
 * Componente Card reutilizable para el panel de administración
 * Diseño consistente con la paleta UpWear
 * Soporta diferentes variantes y personalizaciones
 */

import { cn } from '@/lib/utils';
import { ReactNode, HTMLAttributes } from 'react';

/**
 * Props para el componente Card
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

/**
 * Props para el componente CardHeader
 */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Props para el componente CardTitle
 */
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Props para el componente CardContent
 */
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Props para el componente CardFooter
 */
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Componente Card principal
 * Contenedor base para todas las variantes de card
 */
export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'bg-white border border-[#b5b6ad]/30',
    outlined: 'bg-transparent border-2 border-[#b5b6ad]',
    elevated: 'bg-white border border-[#b5b6ad]/30 shadow-lg'
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-200',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Componente CardHeader
 * Sección superior del card con título y acciones opcionales
 */
export function CardHeader({
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-[#b5b6ad]/20 bg-[#f8f9fa]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Componente CardTitle
 * Título del card con estilos consistentes
 */
export function CardTitle({
  children,
  className,
  as: Component = 'h3',
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        'text-lg font-semibold text-[#1a1b14] tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Componente CardContent
 * Contenido principal del card
 */
export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn(
        'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Componente CardFooter
 * Sección inferior del card para acciones o información adicional
 */
export function CardFooter({
  children,
  className,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-[#b5b6ad]/20 bg-[#f8f9fa]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Exportar todos los componentes como un namespace para facilidad de uso
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;