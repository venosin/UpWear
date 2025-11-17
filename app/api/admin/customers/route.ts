import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase con SERVICE ROLE KEY para operaciones de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();

    console.log('🔧 Admin API: Creating customer profile', profileData);

    // Validar datos requeridos
    if (!profileData.email) {
      console.error('❌ Admin API: Email is required for profile creation');
      return NextResponse.json({ success: false, error: 'Email is required for profile creation through admin' }, { status: 400 });
    }

    // Validar email si se proporciona
    if (profileData.phone && !/^[\\+]?[(]?[0-9]{1,3}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?([0-9]{1,9})$/.test(profileData.phone)) {
      console.error('❌ Admin API: Invalid phone number format');
      return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
    }

    // Validar fecha de nacimiento si se proporciona
    if (profileData.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(profileData.birth_date)) {
      console.error('❌ Admin API: Invalid birth date format. Use YYYY-MM-DD');
      return NextResponse.json({ success: false, error: 'Invalid birth date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Validar URL de avatar si se proporciona
    if (profileData.avatar_url && !/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(profileData.avatar_url)) {
      console.error('❌ Admin API: Invalid avatar URL format');
      return NextResponse.json({ success: false, error: 'Invalid avatar URL format' }, { status: 400 });
    }

    // Validar que el rol sea válido
    const validRoles = ['customer', 'admin', 'staff'];
    if (profileData.role && !validRoles.includes(profileData.role)) {
      console.error('❌ Admin API: Invalid role');
      return NextResponse.json({ success: false, error: 'Invalid role. Must be customer, admin, or staff' }, { status: 400 });
    }

    // Validar que el género sea válido
    const validGenders = ['men', 'women', 'unisex', 'kids', 'none'];
    if (profileData.gender && !validGenders.includes(profileData.gender)) {
      console.error('❌ Admin API: Invalid gender');
      return NextResponse.json({ success: false, error: 'Invalid gender. Must be men, women, unisex, kids, or none' }, { status: 400 });
    }

    // Establecer valores por defecto
    profileData.role = profileData.role || 'customer';
    profileData.gender = profileData.gender || 'none';
    profileData.email_verified = profileData.email_verified !== undefined ? profileData.email_verified : false;
    profileData.phone_verified = profileData.phone_verified !== undefined ? profileData.phone_verified : false;
    profileData.preferences = profileData.preferences || {};
    profileData.metadata = profileData.metadata || {};

    // Verificar que el email sea único
    const { data: existingEmail } = await supabaseAdmin
      .auth.admin.listUsers({
        filters: {
          email: profileData.email
        },
        page: 1,
        perPage: 1
      });

    if (existingEmail && existingEmail.users && existingEmail.users.length > 0) {
      console.error('❌ Admin API: Email already exists in auth system');
      return NextResponse.json({ success: false, error: 'Email already exists in auth system' }, { status: 400 });
    }

    // Verificar que no exista ya un perfil para este ID de auth.users
    // Nota: Esto debería manejarse cuando se crea el perfil junto con el auth user

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: profileData.id, // UUID del usuario de auth.users
        full_name: profileData.full_name || null,
        phone: profileData.phone || null,
        role: profileData.role,
        avatar_url: profileData.avatar_url || null,
        email_verified: profileData.email_verified,
        phone_verified: profileData.phone_verified,
        birth_date: profileData.birth_date || null,
        gender: profileData.gender,
        preferences: profileData.preferences,
        metadata: profileData.metadata
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Admin API Error creating profile:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Customer profile created successfully');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Admin API: Fetching all customer profiles');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabaseAdmin
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
        `);

    // Aplicar filtros
    if (!includeInactive) {
      // Nota: No hay campo is_active en profiles según el schema
      // Los perfiles se consideran activos por defecto
    }

    if (role && ['customer', 'admin', 'staff'].includes(role)) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Obtener perfiles
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Admin API Error fetching profiles:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Enriquecer con datos adicionales si es necesario
    const profilesWithStats = data ? await Promise.all(
      data.map(async (profile) => {
        // Obtener conteo de pedidos
        const { count: orderCount } = await supabaseAdmin
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        return {
          ...profile,
          order_count: orderCount || 0
        };
      })
    ) : [];

    console.log('✅ Admin API: Customer profiles fetched successfully');
    return NextResponse.json({ success: true, data: profilesWithStats });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}