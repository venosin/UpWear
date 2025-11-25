'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { RegisterRequest, CustomerValidation } from '@/types/customers';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function RegisterModalContent() {
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
        if (!formData.email.trim()) newErrors.email = 'El email es requerido';
        else if (!CustomerValidation.isValidEmail(formData.email)) newErrors.email = 'Formato de email inválido';

        if (!formData.password.trim()) newErrors.password = 'La contraseña es requerida';
        else {
            const passwordValidation = CustomerValidation.isValidPassword(formData.password);
            if (!passwordValidation.valid) newErrors.password = passwordValidation.errors.join('. ');
        }

        if (!formData.accept_terms) newErrors.accept_terms = 'Debes aceptar los términos';
        if (!formData.accept_privacy) newErrors.accept_privacy = 'Debes aceptar la privacidad';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const result = await authService.register(formData);

            if (result.success) {
                // Éxito
                const successMessage = document.createElement('div');
                successMessage.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md animate-in slide-in-from-top-5';
                successMessage.innerHTML = `
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <div>
              <h4 class="font-bold">¡Cuenta creada!</h4>
              <p class="text-sm opacity-90">Por favor inicia sesión.</p>
            </div>
          </div>
        `;
                document.body.appendChild(successMessage);
                setTimeout(() => {
                    if (document.body.contains(successMessage)) {
                        document.body.removeChild(successMessage);
                    }
                    // Redirigir al home
                    router.back(); // Intentar volver atrás primero (para cerrar el modal interceptado)
                }, 2000);
            } else {
                setErrors({ submit: result.error || 'Error al registrar usuario' });
            }
        } catch (error) {
            setErrors({ submit: 'Error de red al registrar usuario' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Estilos
    const inputClass = "w-full px-4 py-3 border border-[#b5b6ad] rounded-lg text-[#41423a] bg-white focus:ring-2 focus:ring-[#41423a] focus:border-[#41423a] outline-none transition-all placeholder-[#8e9087]";
    const labelClass = "block text-sm font-medium text-[#676960] mb-1";
    const errorClass = "text-xs text-red-500 mt-1";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => router.back()} />

            <div className="flex min-h-full items-center justify-center p-4">
                {/* Modal Card */}
                <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-50">

                    {/* Close Button */}
                    <button
                        onClick={() => router.back()}
                        className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <div className="p-8 md:p-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#1a1b14]">Crea tu cuenta</h2>
                            <p className="mt-2 text-[#676960]">Únete a UpWear y disfruta de beneficios exclusivos</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Email */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={inputClass}
                                        placeholder="tu@email.com"
                                        disabled={isSubmitting}
                                    />
                                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Contraseña *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className={`${inputClass} pr-10`}
                                            placeholder="Mínimo 8 caracteres"
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className={errorClass}>{errors.password}</p>}
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className={labelClass}>Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className={inputClass}
                                        placeholder="Juan Pérez"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={labelClass}>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={inputClass}
                                        placeholder="+52 ..."
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Birth Date */}
                                <div>
                                    <label className={labelClass}>Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                        className={inputClass}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className={labelClass}>Género</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                                        className={inputClass}
                                        disabled={isSubmitting}
                                    >
                                        <option value="none">Prefiero no decir</option>
                                        <option value="men">Masculino</option>
                                        <option value="women">Femenino</option>
                                        <option value="unisex">Otro</option>
                                    </select>
                                </div>
                            </div>

                            {/* Terms & Privacy */}
                            <div className="space-y-3 pt-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.accept_terms}
                                        onChange={(e) => setFormData({ ...formData, accept_terms: e.target.checked })}
                                        className="mt-1 w-4 h-4 text-[#41423a] border-gray-300 rounded focus:ring-[#41423a]"
                                        disabled={isSubmitting}
                                    />
                                    <span className={`text-sm ${errors.accept_terms ? 'text-red-500' : 'text-[#676960]'}`}>
                                        Acepto los <a href="/legal/terms" className="text-[#41423a] hover:underline font-medium" target="_blank">términos y condiciones</a>
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.accept_privacy}
                                        onChange={(e) => setFormData({ ...formData, accept_privacy: e.target.checked })}
                                        className="mt-1 w-4 h-4 text-[#41423a] border-gray-300 rounded focus:ring-[#41423a]"
                                        disabled={isSubmitting}
                                    />
                                    <span className={`text-sm ${errors.accept_privacy ? 'text-red-500' : 'text-[#676960]'}`}>
                                        Acepto la <a href="/legal/privacy" className="text-[#41423a] hover:underline font-medium" target="_blank">política de privacidad</a>
                                    </span>
                                </label>
                            </div>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#41423a] text-white hover:bg-[#1a1b14] disabled:bg-[#8e9087] font-semibold py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg transform active:scale-[0.99]"
                            >
                                {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                            </button>

                            {/* Footer */}
                            <div className="text-center pt-2">
                                <p className="text-sm text-[#676960]">
                                    ¿Ya tienes una cuenta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="font-medium text-[#41423a] hover:underline"
                                    >
                                        Inicia sesión
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
