'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CreateProductButtonProps {
  className?: string;
}

/**
 * Componente cliente para botón de crear producto
 * Soluciona el problema de event handlers en Server Components
 */
export function CreateProductButton({ className = "" }: CreateProductButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/admin/products/create"
      className="inline-flex items-center px-4 py-2 bg-[#41423a] text-white font-medium rounded-lg hover:bg-[#1a1b14] transition-colors"
      style={{
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ marginRight: '8px' }}>+</span>
      Crear Producto
    </Link>
  );
}