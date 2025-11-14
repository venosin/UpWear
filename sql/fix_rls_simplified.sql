-- ============================================
-- SOLUCIÓN SIMPLIFICADA PARA POLÍTICAS RLS
-- ============================================

-- 1. Eliminar todas las políticas existentes de profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view customer profiles" ON profiles;

-- 2. Deshabilitar temporalmente RLS para poder asignar el rol
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Asignar el rol de admin a tu usuario específico
INSERT INTO profiles (id, full_name, role, email_verified, created_at, updated_at)
VALUES (
  '35788355-5de5-49b6-bd67-70344d107f1a',
  'Steven Palacios',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- 4. Verificar que el perfil fue creado correctamente
SELECT
  id,
  full_name,
  role,
  email_verified,
  created_at,
  updated_at
FROM profiles
WHERE id = '35788355-5de5-49b6-bd67-70344d107f1a';

-- 5. Crear políticas RLS simples SIN recursión y SIN acceso a auth.users
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para usuarios
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- NOTA: Temporalmente sin políticas de admin para que funcione el login
-- Las políticas de admin las podemos agregar después de que el login funcione

COMMIT;