'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { RegisterRequest, CustomerValidation } from '@/types/customers';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    birth_date: '',
    gender: 'none',
    accept_terms: false,
    accept_privacy: false,
    subscribe_newsletter: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validaciones
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!CustomerValidation.isValidEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = CustomerValidation.isValidPassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors.join('. ');
      }
    }

    if (!formData.accept_terms) {
      newErrors.accept_terms = 'Debes aceptar los términos y condiciones';
    }

    if (!formData.accept_privacy) {
      newErrors.accept_privacy = 'Debes aceptar la política de privacidad';
    }

    if (formData.phone && !CustomerValidation.isValidPhone(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (formData.birth_date && !CustomerValidation.isValidDate(formData.birth_date)) {
      newErrors.birth_date = 'Formato de fecha inválido. Usa YYYY-MM-DD';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await authService.register(formData);

      if (result.success) {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
        successMessage.innerHTML = `
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h4 class="font-semibold">¡Registro Exitoso!</h4>
              <p class="text-sm mt-1">${result.message}</p>
            </div>
          </div>
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => {
          document.body.removeChild(successMessage);
          router.push('/auth/login');
        }, 4000);
      } else {
        setErrors({ submit: result.error || 'Error al registrar usuario' });
      }
    } catch (error) {
      setErrors({ submit: 'Error de red al registrar usuario' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordRequirements = () => {
    if (!formData.password) return [];
    const validation = CustomerValidation.isValidPassword(formData.password);
    return validation.errors;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">UW</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="tu@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="********"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {formData.password && getPasswordRequirements().length > 0 && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>La contraseña debe contener:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      Al menos 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                      Una mayúscula
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                      Una minúscula
                    </li>
                    <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                      Un número
                    </li>
                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : ''}>
                      Un carácter especial
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.full_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Pérez"
                disabled={isSubmitting}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+52 123 456 7890"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.birth_date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {CustomerValidation.genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Newsletter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletter"
                checked={formData.subscribe_newsletter}
                onChange={(e) => setFormData({ ...formData, subscribe_newsletter: e.target.checked })}
                className="mr-2"
                disabled={isSubmitting}
              />
              <label htmlFor="newsletter" className="text-sm text-gray-700">
                Suscribirme al newsletter de ofertas y novedades
              </label>
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-2">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.accept_terms}
                  onChange={(e) => setFormData({ ...formData, accept_terms: e.target.checked })}
                  className={`mr-2 mt-1 ${errors.accept_terms ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Acepto los{' '}
                  <Link href="/legal/terms" className="text-blue-600 hover:text-blue-500" target="_blank">
                    términos y condiciones
                  </Link>
                </label>
              </div>
              {errors.accept_terms && (
                <p className="text-sm text-red-600 ml-6">{errors.accept_terms}</p>
              )}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={formData.accept_privacy}
                  onChange={(e) => setFormData({ ...formData, accept_privacy: e.target.checked })}
                  className={`mr-2 mt-1 ${errors.accept_privacy ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  Acepto la{' '}
                  <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-500" target="_blank">
                    política de privacidad
                  </Link>
                </label>
              </div>
              {errors.accept_privacy && (
                <p className="text-sm text-red-600 ml-6">{errors.accept_privacy}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}