'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

// ==================== COMPONENTE ====================

/**
 * Footer component con diseño moderno y paleta UpWear
 * Incluye enlaces, contacto y redes sociales
 */
export function Footer() {
  return (
    <footer className="bg-[#1a1b14] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">UpWear</h3>
            <p className="text-[#8e9087] text-sm leading-relaxed mb-6">
              Tu tienda de ropa de confianza con las últimas tendencias y la mejor calidad en moda.
            </p>
            {/* Redes sociales */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-[#676960] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[#676960] hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[#676960] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Tienda</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-[#8e9087] hover:text-white text-sm transition-colors">
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link href="/shop/new-arrivals" className="text-[#8e9087] hover:text-white text-sm transition-colors">
                  Nuevos ingresos
                </Link>
              </li>
              <li>
                <Link href="/shop/sale" className="text-[#8e9087] hover:text-white text-sm transition-colors">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-[#8e9087] hover:text-white text-sm transition-colors">
                  Categorías
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Ayuda</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-[#8e9087] hover:text-white text-sm transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-[#8e9087] hover:text-white text-sm transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-[#8e9087] hover:text-white text-sm transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#8e9087] hover:text-white text-sm transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-[#8e9087]">
                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>contacto@upwear.com</span>
              </div>
              <div className="flex items-center text-sm text-[#8e9087]">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start text-sm text-[#8e9087]">
                <MapPin className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
                <span>123 Fashion Street<br />Ciudad de Moda, CP 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#41423a]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[#8e9087] order-2 md:order-1 mt-4 md:mt-0">
              © 2024 UpWear. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-sm order-1 md:order-2">
              <Link href="/privacy" className="text-[#8e9087] hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link href="/terms" className="text-[#8e9087] hover:text-white transition-colors">
                Términos
              </Link>
              <Link href="/cookies" className="text-[#8e9087] hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;