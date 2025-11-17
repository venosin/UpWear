import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LoginRequest } from '@/types/customers';

// Crear cliente de Supabase con SERVICE ROLE KEY para operaciones de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    console.log('🔐 Auth API: User login attempt', { email: body.email });

    // Validar datos requeridos
    if (!body.email || !body.password) {
      console.error('❌ Auth API: Email and password are required');
      return NextResponse.json({
        success: false,
        error: 'Email y contraseña son requeridos'
      }, { status: 400 });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      console.error('❌ Auth API: Invalid email format');
      return NextResponse.json({
        success: false,
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    // Autenticar usuario
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (authError || !authData.user || !authData.session) {
      console.error('❌ Auth API: Authentication failed', authError);
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas'
      }, { status: 401 });
    }

    // Obtener perfil completo del usuario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        role,
        avatar_url,
        email_verified,
        phone_verified,
        birth_date,
        gender,
        preferences,
        metadata,
        created_at,
        updated_at
      `)
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Auth API: Error fetching user profile', profileError);
      // El usuario existe en auth pero no tiene perfil, esto es inconsistente
      return NextResponse.json({
        success: false,
        error: 'Error al obtener perfil de usuario'
      }, { status: 500 });
    }

    console.log('✅ Auth API: User logged in successfully', {
      userId: authData.user.id,
      email: body.email,
      emailVerified: profile.email_verified
    });

    return NextResponse.json({
      success: true,
      message: profile.email_verified
        ? 'Inicio de sesión exitoso'
        : 'Inicio de sesión exitoso. Por favor verifica tu email para activar todas las funciones.',
      user: profile,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      },
      needsEmailVerification: !profile.email_verified
    });

  } catch (error) {
    console.error('❌ Auth API: Unexpected error during login:', error);
    return NextResponse.json({
      success: false,
      error: 'Error inesperado durante el inicio de sesión'
    }, { status: 500 });
  }
}