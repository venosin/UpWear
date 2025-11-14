-- ============================================
-- ARREGLO DE POLÍTICAS RLS PARA TABLA PROFILES
-- ============================================

-- 1. Eliminar todas las políticas existentes de profiles para evitar recursión
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff can view customer profiles" ON profiles;

-- 2. Crear nuevas políticas sin recursión
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. Políticas para administradores (sin recursión)
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- 4. Asignar manualmente el rol de admin al usuario
UPDATE profiles
SET role = 'admin',
    updated_at = NOW()
WHERE id = '35788355-5de5-49b6-bd67-70344d107f1a';

-- 5. Verificar el resultado
SELECT
  p.id,
  p.role,
  p.full_name,
  p.updated_at
FROM profiles p
WHERE p.id = '35788355-5de5-49b6-bd67-70344d107f1a';

-- 6. También actualizar el metadata del usuario en auth.users
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE id = '35788355-5de5-49b6-bd67-70344d107f1a';

COMMIT;