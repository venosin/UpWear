import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase con SERVICE ROLE KEY para operaciones de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const updateData = await request.json();

    console.log('🔧 Admin API: Updating customer profile', userId, updateData);

    // Validar que el perfil existe
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError || !existingProfile) {
      console.error('❌ Admin API: Profile not found:', userId);
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Validaciones específicas para actualización
    if (updateData.phone && !/^[\\+]?[(]?[0-9]{1,3}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?([0-9]{1,9})$/.test(updateData.phone)) {
      console.error('❌ Admin API: Invalid phone number format');
      return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
    }

    if (updateData.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(updateData.birth_date)) {
      console.error('❌ Admin API: Invalid birth date format');
      return NextResponse.json({ success: false, error: 'Invalid birth date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    if (updateData.avatar_url && !/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(updateData.avatar_url)) {
      console.error('❌ Admin API: Invalid avatar URL format');
      return NextResponse.json({ success: false, error: 'Invalid avatar URL format' }, { status: 400 });
    }

    // Validar que el rol sea válido si se actualiza
    if (updateData.role) {
      const validRoles = ['customer', 'admin', 'staff'];
      if (!validRoles.includes(updateData.role)) {
        console.error('❌ Admin API: Invalid role');
        return NextResponse.json({ success: false, error: 'Invalid role. Must be customer, admin, or staff' }, { status: 400 });
      }
    }

    // Validar que el género sea válido si se actualiza
    if (updateData.gender) {
      const validGenders = ['men', 'women', 'unisex', 'kids', 'none'];
      if (!validGenders.includes(updateData.gender)) {
        console.error('❌ Admin API: Invalid gender');
        return NextResponse.json({ success: false, error: 'Invalid gender. Must be men, women, unisex, kids, or none' }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Admin API Error updating profile:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Customer profile updated successfully');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    console.log('🗑️ Admin API: Deleting customer profile', userId);

    // Verificar que el perfil existe
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (checkError || !existingProfile) {
      console.error('❌ Admin API: Profile not found:', userId);
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // No permitir eliminar perfiles de administradores a menos que sea explícitamente solicitado
    if (existingProfile.role === 'admin') {
      const { searchParams } = new URL(request.url);
      const forceDelete = searchParams.get('force') === 'true';

      if (!forceDelete) {
        console.error('❌ Admin API: Cannot delete admin profile without force parameter');
        return NextResponse.json({
          success: false,
          error: 'Cannot delete admin profile. Use ?force=true parameter if you are certain.'
        }, { status: 403 });
      }
    }

    // Verificar si el usuario tiene órdenes activas
    const { data: activeOrders } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'paid', 'processing', 'shipped'])
      .limit(1);

    if (activeOrders && activeOrders.length > 0) {
      console.error('❌ Admin API: Cannot delete customer with active orders');
      return NextResponse.json({
        success: false,
        error: 'Cannot delete customer with active orders'
      }, { status: 400 });
    }

    // Verificar si el usuario tiene carritos activos
    const { data: activeCarts } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    if (activeCarts && activeCarts.length > 0) {
      console.error('❌ Admin API: Cannot delete customer with active carts');
      return NextResponse.json({
        success: false,
        error: 'Cannot delete customer with active carts'
      }, { status: 400 });
    }

    // Soft delete: Eliminar el usuario de auth.users y el perfil quedará huérfano
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('❌ Admin API Error deleting auth user:', deleteError);
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 400 });
    }

    console.log('✅ Admin API: Customer profile and auth user deleted successfully');
    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error during deletion:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error during deletion' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    console.log('📋 Admin API: Fetching customer profile', userId);

    // Obtener el perfil específico
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
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ Admin API: Profile not found:', userId);
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Obtener datos adicionales
    const [orderCount, cartCount] = await Promise.all([
      // Conteo de órdenes
      supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id),

      // Conteo de carritos activos
      supabaseAdmin
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'active')
    ]);

    const profileWithStats = {
      ...profile,
      order_count: orderCount?.count || 0,
      active_cart_count: cartCount?.count || 0
    };

    console.log('✅ Admin API: Customer profile fetched successfully');
    return NextResponse.json({ success: true, data: profileWithStats });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}