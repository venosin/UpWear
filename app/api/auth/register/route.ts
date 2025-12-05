import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RegisterRequest, CustomerValidation } from '@/types/customers';

// Crear cliente de Supabase con SERVICE ROLE KEY para operaciones de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    console.log('🔐 Auth API: User registration attempt', { email: body.email });

    // Validar datos requeridos
    if (!body.email || !body.password) {
      console.error('❌ Auth API: Email and password are required');
      return NextResponse.json({
        success: false,
        error: 'Email y contraseña son requeridos'
      }, { status: 400 });
    }

    if (!body.accept_terms || !body.accept_privacy) {
      console.error('❌ Auth API: Terms and privacy acceptance required');
      return NextResponse.json({
        success: false,
        error: 'Debes aceptar los términos y condiciones y la política de privacidad'
      }, { status: 400 });
    }

    // Validar formato de email
    if (!CustomerValidation.isValidEmail(body.email)) {
      console.error('❌ Auth API: Invalid email format');
      return NextResponse.json({
        success: false,
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    // Validar contraseña
    const passwordValidation = CustomerValidation.isValidPassword(body.password);
    if (!passwordValidation.valid) {
      console.error('❌ Auth API: Weak password', passwordValidation.errors);
      return NextResponse.json({
        success: false,
        error: passwordValidation.errors.join('. ')
      }, { status: 400 });
    }

    // Validar teléfono si se proporciona
    if (body.phone && !CustomerValidation.isValidPhone(body.phone)) {
      console.error('❌ Auth API: Invalid phone format');
      return NextResponse.json({
        success: false,
        error: 'Formato de teléfono inválido'
      }, { status: 400 });
    }

    // Validar fecha de nacimiento si se proporciona
    if (body.birth_date && !CustomerValidation.isValidDate(body.birth_date)) {
      console.error('❌ Auth API: Invalid birth date format');
      return NextResponse.json({
        success: false,
        error: 'Formato de fecha de nacimiento inválido. Usa YYYY-MM-DD'
      }, { status: 400 });
    }

    // Crear usuario en auth.users directamente (Supabase maneja duplicados)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: false, // ⚠️ Requiere confirmación de email (SMTP Configurado)
      user_metadata: {
        full_name: body.full_name || null,
        phone: body.phone || null,
        birth_date: body.birth_date || null,
        gender: body.gender || 'none',
        accept_terms: body.accept_terms,
        accept_privacy: body.accept_privacy,
        subscribe_newsletter: body.subscribe_newsletter || false,
        registration_source: 'web'
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Auth API Error creating auth user:', authError);

      // Si el error es de email duplicado, dar un mensaje más claro
      if (authError?.message?.includes('already') || authError?.message?.includes('duplicate')) {
        return NextResponse.json({
          success: false,
          error: 'El email ya está registrado'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: authError?.message || 'Error al crear usuario'
      }, { status: 400 });
    }

    // 📧 ENVIAR CORREO DE CONFIRMACIÓN MANUALMENTE
    // admin.createUser no envía correos, así que lo disparamos aquí.
    const { error: emailError } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: body.email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/confirm`
      }
    });

    if (emailError) {
      console.error('⚠️ Auth API: Error sending confirmation email:', emailError);
    } else {
      console.log('✅ Auth API: Confirmation email sent successfully');
    }

    // Crear perfil en la tabla profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: body.full_name || null,
        phone: body.phone || null,
        role: 'customer', // Todos los registros son clientes por defecto
        avatar_url: null,
        email_verified: false, // Se verifica cuando confirman el email
        phone_verified: false,
        birth_date: body.birth_date || null,
        gender: body.gender || 'none',
        preferences: {
          newsletter: body.subscribe_newsletter || false,
          language: 'es-MX'
        },
        metadata: {
          registration_source: 'web',
          accept_terms: body.accept_terms,
          accept_privacy: body.accept_privacy,
          registration_ip: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Auth API Error creating profile:', profileError);
      // Si falla la creación del perfil, intentar eliminar el usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({
        success: false,
        error: profileError.message || 'Error al crear perfil de usuario'
      }, { status: 400 });
    }

    console.log('✅ Auth API: User registered successfully', {
      userId: authData.user.id,
      email: body.email
    });

    return NextResponse.json({
      success: true,
      message: '¡Cuenta creada! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: body.full_name
      },
      needsEmailVerification: true
    });

  } catch (error: any) {
    console.error('❌ Auth API: Unexpected error during registration:', error);
    return NextResponse.json({
      success: false,
      error: 'Error inesperado durante el registro'
    }, { status: 500 });
  }
}