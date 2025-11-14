# 📁 Estructura del Proyecto - Tienda de Ropa

## 📋 Resumen
Proyecto de e-commerce para tienda de ropa con Next.js 16, Tailwind CSS v4, HeroUI, y Supabase.

## 🗂️ Estructura de Carpetas

```
login-with-supabase/
├── 📂 app/                          # App Router de Next.js 13+
│   ├── 📁 (auth)/                   # Rutas de autenticación
│   │   ├── 📄 login/
│   │   └── 📄 register/
│   ├── 📁 (shop)/                   # Rutas principales del shop
│   │   ├── 📄 page.tsx             # Homepage
│   │   ├── 📄 products/
│   │   ├── 📄 product/[slug]/
│   │   ├── 📄 categories/
│   │   ├── 📄 category/[slug]/
│   │   ├── 📄 cart/
│   │   ├── 📄 checkout/
│   │   ├── 📄 account/
│   │   ├── 📄 wishlist/
│   │   └── 📄 search/
│   ├── 📁 (admin)/                  # Panel de administración
│   │   ├── 📄 dashboard/
│   │   ├── 📄 products/
│   │   ├── 📄 orders/
│   │   ├── 📄 customers/
│   │   └── 📄 analytics/
│   ├── 📁 api/                      # Rutas de API
│   │   ├── 📄 auth/
│   │   ├── 📄 products/
│   │   ├── 📄 orders/
│   │   ├── 📄 cart/
│   │   └── 📄 checkout/
│   ├── 📄 layout.tsx                # Layout principal
│   ├── 📄 globals.css               # Estilos globales
│   ├── 📄 providers.tsx             # Providers (HeroUI, Theme, etc.)
│   └── 📄 loading.tsx               # Loading global
│
├── 📂 src/                          # Código fuente
│   ├── 📁 components/               # Componentes React
│   │   ├── 📁 ui/                   # Componentes UI base
│   │   │   ├── 📄 Button.tsx
│   │   │   ├── 📄 Input.tsx
│   │   │   ├── 📄 Card.tsx
│   │   │   ├── 📄 Modal.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 forms/                # Componentes de formularios
│   │   │   ├── 📄 LoginForm.tsx
│   │   │   ├── 📄 RegisterForm.tsx
│   │   │   ├── 📄 CheckoutForm.tsx
│   │   │   └── 📄 ProductForm.tsx
│   │   ├── 📁 layouts/              # Layout components
│   │   │   ├── 📄 Header.tsx
│   │   │   ├── 📄 Footer.tsx
│   │   │   ├── 📄 Sidebar.tsx
│   │   │   └── 📄 ShopLayout.tsx
│   │   ├── 📁 features/             # Componentes de características
│   │   │   ├── 📁 product/
│   │   │   │   ├── 📄 ProductCard.tsx
│   │   │   │   ├── 📄 ProductList.tsx
│   │   │   │   ├── 📄 ProductDetail.tsx
│   │   │   │   └── 📄 ProductFilters.tsx
│   │   │   ├── 📁 cart/
│   │   │   │   ├── 📄 CartItem.tsx
│   │   │   │   ├── 📄 CartSummary.tsx
│   │   │   │   └── 📄 CartSidebar.tsx
│   │   │   └── 📁 auth/
│   │   │       ├── 📄 UserProfile.tsx
│   │   │       └── 📄 UserMenu.tsx
│   │   └── 📄 index.ts              # Export centralizado
│   │
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── 📄 useAuth.ts            # Autenticación
│   │   ├── 📄 useCart.ts            # Carrito de compras
│   │   ├── 📄 useProducts.ts        # Productos
│   │   ├── 📄 useOrders.ts          # Órdenes
│   │   ├── 📄 useWishlist.ts        # Lista de deseos
│   │   ├── 📄 useDebounce.ts        # Utilidad
│   │   └── 📄 index.ts
│   │
│   ├── 📁 lib/                      # Librerías y configuraciones
│   │   ├── 📄 supabase/             # Configuración de Supabase
│   │   │   ├── 📄 client.ts         # Cliente de Supabase
│   │   │   ├── 📄 server.ts         # Configuración server-side
│   │   │   ├── 📄 auth.ts           # Helper de autenticación
│   │   │   └── 📄 database.ts       # Tipos de la base de datos
│   │   ├── 📄 stripe/               # Configuración de Stripe
│   │   ├── 📄 email/                # Configuración de emails
│   │   ├── 📄 storage/              # Configuración de storage
│   │   └── 📄 utils.ts              # Utilidades generales
│   │
│   ├── 📁 services/                 # Servicios de API
│   │   ├── 📄 api.ts                # Cliente HTTP base
│   │   ├── 📄 products.service.ts   # Servicio de productos
│   │   ├── 📄 orders.service.ts     # Servicio de órdenes
│   │   ├── 📄 auth.service.ts       # Servicio de autenticación
│   │   ├── 📄 cart.service.ts       # Servicio de carrito
│   │   ├── 📄 upload.service.ts     # Servicio de archivos
│   │   └── 📄 index.ts
│   │
│   ├── 📁 store/                    # Estado global (si se necesita)
│   │   ├── 📄 cart-store.ts         # Estado del carrito
│   │   ├── 📄 auth-store.ts         # Estado de autenticación
│   │   ├── 📄 ui-store.ts           # Estado de UI
│   │   └── 📄 index.ts
│   │
│   ├── 📁 types/                    # Tipos TypeScript
│   │   ├── 📄 database.types.ts     # Tipos de la BD
│   │   ├── 📄 api.types.ts          # Tipos de API
│   │   ├── 📄 ui.types.ts           # Tipos de UI
│   │   ├── 📄 auth.types.ts         # Tipos de auth
│   │   ├── 📄 product.types.ts      # Tipos de productos
│   │   └── 📄 index.ts
│   │
│   ├── 📁 utils/                    # Utilidades puras
│   │   ├── 📄 formatters.ts         # Formato de datos
│   │   ├── 📄 validators.ts         # Validaciones
│   │   ├── 📄 constants.ts          # Constantes
│   │   ├── 📄 helpers.ts            # Helper functions
│   │   ├── 📄 seo.ts                # SEO utilities
│   │   └── 📄 index.ts
│   │
│   ├── 📁 constants/                # Constantes del proyecto
│   │   ├── 📄 app.constants.ts      # Configuración de la app
│   │   ├── 📄 api.constants.ts      # Endpoints y configs
│   │   └── 📄 index.ts
│   │
│   ├── 📁 config/                   # Configuraciones
│   │   ├── 📄 env.config.ts         # Variables de entorno
│   │   ├── 📄 site.config.ts        # Configuración del sitio
│   │   └── 📄 index.ts
│   │
│   ├── 📁 locales/                  # Internacionalización
│   │   ├── 📁 es/
│   │   │   └── 📄 common.json       # Traducciones español
│   │   ├── 📁 en/
│   │   │   └── 📄 common.json       # Traducciones inglés
│   │   └── 📄 index.ts
│   │
│   ├── 📁 styles/                   # Estilos específicos
│   │   ├── 📄 globals.css           # Estilos globales adicionales
│   │   ├── 📄 components.css        # Estilos de componentes
│   │   └── 📄 animations.css        # Animaciones CSS
│   │
│   └── 📁 images/                   # Imágenes estáticas
│       ├── 📁 icons/                # Iconos
│       ├── 📁 logos/                # Logos
│       └── 📁 placeholders/         # Imágenes placeholder
│
├── 📂 sql/                          # Archivos SQL para Supabase
│   ├── 📁 schema/                   # Esquema de la base de datos
│   │   ├── 📄 00_extensions.sql
│   │   ├── 📄 01_users.sql
│   │   ├── 📄 02_categories.sql
│   │   ├── ┓ ... (otras tablas)
│   │   └── 📄 99_functions_triggers.sql
│   ├── 📁 seed/                     # Datos iniciales
│   │   ├── 📄 01_brands.sql
│   │   ├── 📄 02_categories.sql
│   │   └── 📄 03_sample_products.sql
│   └── 📁 migrations/               # Migraciones futuras
│
├── 📂 docs/                         # Documentación
│   ├── 📁 api/                      # Documentación de API
│   ├── 📁 database/                 # Documentación de BD
│   ├── 📁 deployment/               # Guías de deploy
│   └── 📁 ui/                       # Guías de UI/UX
│
├── 📂 scripts/                      # Scripts de utilidad
│   ├── 📄 seed-db.js               # Script para poblar BD
│   ├── 📄 migrate-db.js            # Script de migraciones
│   └── 📄 deploy.sh                # Script de deploy
│
├── 📂 public/                       # Archivos públicos
│   ├── 📁 images/                   # Imágenes públicas
│   ├── 📁 icons/                    # Favicons
│   └── 📄 robots.txt               # SEO
│
├── 🐳 Docker/                       # Configuraciones de Docker
│   ├── 📄 Dockerfile               # Docker de la app
│   ├── 📄 docker-compose.yml       # Compose con servicios
│   └── 📄 nginx.conf               # Configuración de Nginx
│
├── ⚙️ Archivos de configuración
│   ├── 📄 next.config.ts           # Config Next.js
│   ├── 📄 tailwind.config.ts       # Config Tailwind CSS
│   ├── 📄 tsconfig.json            # Config TypeScript
│   ├── 📄 eslint.config.mjs        # Config ESLint
│   ├── 📄 postcss.config.mjs       # Config PostCSS
│   ├── 📄 package.json             # Dependencias
│   └── 📄 .env.local               # Variables de entorno (local)
│
└── 📄 README.md                     # Documentación del proyecto
```

## 🏗️ Patrones de Arquitectura

### 1. **Clean Architecture**
- **Capa de Presentación**: Components, Pages, Layouts
- **Capa de Lógica**: Hooks, Services, Store
- **Capa de Datos**: Lib (Supabase), Types

### 2. **Feature-First Structure**
Cada característica principal tiene sus propios componentes y servicios:
- `src/components/features/product/`
- `src/components/features/cart/`
- `src/components/features/auth/`

### 3. **Configuration Management**
- `src/config/` para configuraciones centralizadas
- `src/constants/` para constantes de la aplicación
- Variables de entorno en `.env.local`

### 4. **Type Safety**
- Tipos TypeScript para todo
- `src/types/` con tipos centralizados
- Tipos generados desde Supabase

## 🚀 Flujo de Trabajo

1. **Desarrollo**: `npm run dev` con Turbopack
2. **Build**: `npm run build` para producción
3. **Deploy**: Usando Docker o Vercel
4. **Testing**: `npm run test` (cuando se implemente)

## 📝 Convenciones

### **Nomenclatura**
- **Componentes**: PascalCase (`ProductCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useProducts.ts`)
- **Servicios**: camelCase con sufijo `.service.ts`
- **Tipos**: camelCase con sufijo `.types.ts`
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### **Imports Organizados**
1. React y Next.js
2. Librerías externas
3. Componentes internos
4. Servicios y hooks
5. Tipos y utilidades

### **Comentarios**
- Documentar funciones complejas
- Explicar lógica de negocio
- Comentarios en español para contexto local

## 🔐 Seguridad

- **RLS (Row Level Security)** en todas las tablas
- **Variables de entorno** para datos sensibles
- **Validaciones** en cliente y servidor
- **TypeScript** para type safety

## 🌍 Internacionalización

- **Estructura de locales** en `src/locales/`
- **i18n** con next-intl o similar
- **Soporte** para español (principal) e inglés

## 📊 Monitoreo y Debugging

- **Logs de errores** centralizados
- **Analytics** para comportamiento de usuarios
- **Performance monitoring**
- **Error boundaries** en React