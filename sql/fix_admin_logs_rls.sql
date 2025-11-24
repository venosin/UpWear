-- Corregir políticas RLS para admin_activity_logs
-- El error ocurría porque la tabla tenía RLS habilitado pero ninguna política definida,
-- lo que bloqueaba todas las operaciones por defecto.

-- 1. Permitir a los administradores INSERTAR logs
CREATE POLICY "Admins can insert activity logs"
ON admin_activity_logs FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 2. Permitir a los administradores VER logs
CREATE POLICY "Admins can view activity logs"
ON admin_activity_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Opcional: Si quieres que los admins puedan borrar logs (generalmente no se recomienda para auditoría)
-- CREATE POLICY "Admins can delete activity logs" ...
