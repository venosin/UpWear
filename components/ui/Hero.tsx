/**
 * Componente Hero section para la página principal
 * Diseño inspirado en UI Shop Home(1) con imagen de modelo
 */

'use client';

import Link from 'next/link';
import { Button } from './Button';

// ==================== TIPOS ====================

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

// ==================== COMPONENTE ====================

/**
 * Componente Hero con diseño exacto a UI Shop Home(1)
 * Modelo femenina con ropa de moda
 */
export function Hero({
  title = "NEW COLLECTION",
  subtitle = "THE LATEST ARRIVALS",
  description = "Shop the latest trends with our curated collection of premium fashion",
  backgroundImage,
  ctaText = "SHOP NOW",
  ctaLink = "/shop/new-arrivals",
  secondaryCtaText = "VIEW ALL",
  secondaryCtaLink = "/shop"
}: HeroProps) {
  return (
    <section className="relative w-full bg-white">
      <div className="relative h-screen lg:h-[90vh] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30">
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt="Fashion Model"
              className="w-full h-full object-cover"
              style={{
                objectPosition: 'center center',
                filter: 'brightness(0.95) contrast(1.05)'
              }}
            />
          )}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
          <div className="max-w-2xl lg:max-w-xl">
            {/* Subtitle */}
            <div className="mb-4">
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-gray-100 uppercase">
                {subtitle}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              {title}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 lg:mb-8 leading-relaxed max-w-md">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
              <Link href={ctaLink}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto lg:w-auto px-8 py-3 bg-white text-black hover:bg-gray-100 hover:text-black font-semibold rounded-none uppercase tracking-wider text-sm"
                >
                  {ctaText}
                </Button>
              </Link>

              {secondaryCtaText && (
                <Link href={secondaryCtaLink}>
                  <Button
                    variant="outlined"
                    size="lg"
                    className="w-full sm:w-auto lg:w-auto px-8 py-3 border-white text-white hover:bg-white hover:text-black font-semibold rounded-none uppercase tracking-wider text-sm transition-all duration-300"
                  >
                    {secondaryCtaText}
                  </Button>
                </Link>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-6 lg:mt-8 text-xs sm:text-sm text-white/70">
              Free shipping on orders over $100
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="flex flex-col items-center text-white/60 animate-bounce">
            <span className="text-xs mb-2">Scroll to explore</span>
            <div className="w-0.5 h-4 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;