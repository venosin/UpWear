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
    const brandId = resolvedParams.id;
    const updateData = await request.json();

    console.log('🔧 Admin API: Updating brand', brandId, updateData);

    // Validar que la marca existe
    const { data: existingBrand, error: checkError } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .single();

    if (checkError || !existingBrand) {
      console.error('❌ Admin API: Brand not found:', brandId);
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    // Validaciones específicas para actualización
    if (updateData.name && updateData.name.length > 100) {
      console.error('❌ Admin API: Brand name too long');
      return NextResponse.json({ success: false, error: 'Brand name too long (max 100 characters)' }, { status: 400 });
    }

    if (updateData.slug && updateData.slug.length > 120) {
      console.error('❌ Admin API: Brand slug too long');
      return NextResponse.json({ success: false, error: 'Brand slug too long (max 120 characters)' }, { status: 400 });
    }

    if (updateData.country && !/^[A-Z]{2}$/i.test(updateData.country)) {
      console.error('❌ Admin API: Invalid country code format');
      return NextResponse.json({ success: false, error: 'Invalid country code format. Must be ISO 3166-1 alpha-2' }, { status: 400 });
    }

    // Si se actualiza el slug, verificar que sea único (excluyendo el registro actual)
    if (updateData.slug) {
      const { data: existingSlug } = await supabaseAdmin
        .from('brands')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', brandId)
        .single();

      if (existingSlug) {
        console.error('❌ Admin API: Slug already exists:', updateData.slug);
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
      }
    }

    // Si se actualiza el nombre, verificar que sea único (excluyendo el registro actual)
    if (updateData.name) {
      const { data: existingName } = await supabaseAdmin
        .from('brands')
        .select('id')
        .eq('name', updateData.name)
        .neq('id', brandId)
        .single();

      if (existingName) {
        console.error('❌ Admin API: Brand name already exists:', updateData.name);
        return NextResponse.json({ success: false, error: 'Brand name already exists' }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('brands')
      .update(updateData)
      .eq('id', brandId)
      .select()
      .single();

    if (error) {
      console.error('❌ Admin API Error updating brand:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Brand updated successfully');
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
    const brandId = resolvedParams.id;

    console.log('🗑️ Admin API: Deleting brand', brandId);

    // Verificar si hay productos activos usando esta marca
    const { data: activeProducts, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('brand_id', brandId)
      .eq('is_active', true)
      .limit(1);

    if (checkError) {
      console.error('❌ Admin API: Error checking products:', checkError);
      return NextResponse.json({ success: false, error: 'Error checking products' }, { status: 500 });
    }

    if (activeProducts && activeProducts.length > 0) {
      console.error('❌ Admin API: Cannot delete brand with active products');
      return NextResponse.json({
        success: false,
        error: 'Cannot delete brand with active products'
      }, { status: 400 });
    }

    // Soft delete: Actualizar is_active a false
    const { error } = await supabaseAdmin
      .from('brands')
      .update({ is_active: false })
      .eq('id', brandId);

    if (error) {
      console.error('❌ Admin API Error deleting brand:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Brand deleted successfully');
    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
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
    const brandId = resolvedParams.id;

    console.log('📋 Admin API: Fetching brand', brandId);

    // Obtener la marca específica
    const { data: brand, error: brandError } = await supabaseAdmin
      .from('brands')
      .select(`
        id,
        name,
        slug,
        description,
        logo_url,
        banner_url,
        country,
        website_url,
        is_featured,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .eq('id', brandId)
      .single();

    if (brandError || !brand) {
      console.error('❌ Admin API: Brand not found:', brandId);
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    // Obtener conteo de productos asociados
    const { count: productCount } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('is_active', true);

    const brandWithData = {
      ...brand,
      product_count: productCount || 0
    };

    console.log('✅ Admin API: Brand fetched successfully');
    return NextResponse.json({ success: true, data: brandWithData });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}