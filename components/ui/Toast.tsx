'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    const iconClasses = "h-6 w-6 flex-shrink-0";

    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClasses} text-green-400`} />;
      case 'error':
        return <XCircleIcon className={`${iconClasses} text-red-400`} />;
      case 'warning':
        return <ExclamationCircleIcon className={`${iconClasses} text-yellow-400`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClasses} text-blue-400`} />;
    }
  };

  const getToastStyles = () => {
    const baseStyles = "w-full bg-white shadow-2xl rounded-xl pointer-events-auto ring-2 ring-black/10 overflow-hidden transform transition-all duration-300 ease-in-out border";
    const borderStyles = {
      success: 'border-green-500 bg-green-50',
      error: 'border-red-500 bg-red-50',
      warning: 'border-yellow-500 bg-yellow-50',
      info: 'border-blue-500 bg-blue-50',
    };

    return `${baseStyles} ${borderStyles[toast.type]} ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`;
  };

  return (
    <div className={getToastStyles()}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 break-words">
                {toast.message}
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              className="inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={handleClose}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listen for custom toast events
    const handleShowToast = (event: CustomEvent<Toast>) => {
      const toast = event.detail;

      // Prevenir duplicados: revisar si ya existe un toast con el mismo mensaje
      setToasts(prev => {
        const existingIndex = prev.findIndex(t => t.message === toast.message && t.type === toast.type);
        if (existingIndex !== -1) {
          // Reemplazar el existente en lugar de duplicar
          const newToasts = [...prev];
          newToasts[existingIndex] = toast;
          return newToasts;
        }
        return [...prev, toast];
      });

      // Auto remove after duration
      const duration = toast.duration || 4000;
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, duration);
    };

    window.addEventListener('showToast', handleShowToast as EventListener);

    return () => {
      window.removeEventListener('showToast', handleShowToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-24 right-6 z-[100] space-y-3 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent
            toast={toast}
            onRemove={removeToast}
          />
        </div>
      ))}
    </div>
  );
};

// Helper functions to show toasts
export const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
  // Generate unique ID using timestamp + random number to avoid collisions
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const toast: Toast = { id, type, message, duration };

  window.dispatchEvent(new CustomEvent('showToast', { detail: toast }));
  return id;
};

export const showSuccessToast = (message: string, duration?: number) => {
  return showToast(message, 'success', duration);
};

export const showErrorToast = (message: string, duration?: number) => {
  return showToast(message, 'error', duration);
};

export const showWarningToast = (message: string, duration?: number) => {
  return showToast(message, 'warning', duration);
};

export const showInfoToast = (message: string, duration?: number) => {
  return showToast(message, 'info', duration);
};