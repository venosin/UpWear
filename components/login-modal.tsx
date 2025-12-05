'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './login-form';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Modal Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-[#1a1b14]">Welcome to UpWear</h2>
            <p className="mt-2 text-sm text-[#676960]">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <LoginForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}

export default LoginModal;