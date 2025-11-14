/**
 * Hooks personalizados centralizados
 * Exportación principal de todos los hooks del proyecto
 */

// Hooks principales de la aplicación
export { useAuth } from './useAuth';
export { useCart } from './useCart';
export { useProducts } from './useProducts';
export { useOrders } from './useOrders';
export { useWishlist } from './useWishlist';

// Hooks de UI y utilidades
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useToggle } from './useToggle';
export { useOnClickOutside } from './useOnClickOutside';

// Hooks de formularios
export { useFormField } from './useFormField';
export { useFormValidation } from './useFormValidation';

// Hooks de API y datos
export { useApiRequest } from './useApiRequest';
export { useInfiniteScroll } from './useInfiniteScroll';

// Re-exportar tipos si es necesario
export type { AuthState, CartState, ProductsState } from '../types';