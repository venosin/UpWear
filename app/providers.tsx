'use client'

import { HeroUIProvider } from '@heroui/react'
import ToastProvider from '@/components/ui/ToastProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </HeroUIProvider>
  )
}