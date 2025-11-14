# ============================================
# Dockerfile para Tienda de Ropa con Next.js 16
# ============================================

# Etapa 1: Build stage
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# Copiar archivos de package
COPY package*.json ./
COPY yarn.lock* ./

# Instalar dependencias con yarn para mejor caching
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Copiar código fuente
COPY . .

# Generar tipos de Supabase si existen
RUN if [ -f "supabase/types.ts" ]; then echo "Tipos de Supabase encontrados"; else echo "No se encontraron tipos de Supabase"; fi

# Construir la aplicación
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn build

# Etapa 2: Production stage
FROM node:20-alpine AS runner

# Establecer variables de entorno para producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar carpeta pública
COPY --from=builder /app/public ./public

# Copiar archivos build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto 3000
EXPOSE 3000

# Variable de entorno para el puerto
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Iniciar la aplicación
CMD ["node", "server.js"]