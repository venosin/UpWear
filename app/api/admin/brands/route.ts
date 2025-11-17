import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase con SERVICE ROLE KEY para operaciones de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const brandData = await request.json();

    console.log('🔧 Admin API: Creating brand', brandData);

    // Validar datos requeridos
    if (!brandData.name || brandData.name.trim() === '') {
      console.error('❌ Admin API: Brand name is required');
      return NextResponse.json({ success: false, error: 'Brand name is required' }, { status: 400 });
    }

    // Validar longitud del nombre
    if (brandData.name.length > 100) {
      console.error('❌ Admin API: Brand name too long (max 100 characters)');
      return NextResponse.json({ success: false, error: 'Brand name too long (max 100 characters)' }, { status: 400 });
    }

    // Generar slug si no se proporciona
    if (!brandData.slug) {
      brandData.slug = brandData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Validar longitud del slug
    if (brandData.slug.length > 120) {
      console.error('❌ Admin API: Brand slug too long (max 120 characters)');
      return NextResponse.json({ success: false, error: 'Brand slug too long (max 120 characters)' }, { status: 400 });
    }

    // Validar country code si se proporciona
    if (brandData.country && !/^[A-Z]{2}$/i.test(brandData.country)) {
      console.error('❌ Admin API: Invalid country code format');
      return NextResponse.json({ success: false, error: 'Invalid country code format. Must be ISO 3166-1 alpha-2' }, { status: 400 });
    }

    // Establecer valores por defecto
    brandData.is_active = brandData.is_active !== undefined ? brandData.is_active : true;
    brandData.is_featured = brandData.is_featured !== undefined ? brandData.is_featured : false;
    brandData.metadata = brandData.metadata || {};

    // Verificar que el slug sea único
    const { data: existingSlug } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('slug', brandData.slug)
      .single();

    if (existingSlug) {
      console.error('❌ Admin API: Slug already exists:', brandData.slug);
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }

    // Verificar que el nombre sea único
    const { data: existingName } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('name', brandData.name)
      .single();

    if (existingName) {
      console.error('❌ Admin API: Brand name already exists:', brandData.name);
      return NextResponse.json({ success: false, error: 'Brand name already exists' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('brands')
      .insert({
        name: brandData.name,
        slug: brandData.slug,
        description: brandData.description || null,
        logo_url: brandData.logo_url || null,
        banner_url: brandData.banner_url || null,
        country: brandData.country || null,
        website_url: brandData.website_url || null,
        is_featured: brandData.is_featured,
        is_active: brandData.is_active,
        metadata: brandData.metadata
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Admin API Error creating brand:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Brand created successfully');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Admin API: Fetching all brands');

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    let query = supabaseAdmin
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
        `);

    // Aplicar filtros
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }

    // Obtener conteo de productos para cada marca
    const { data, error } = await query
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Admin API Error fetching brands:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Agregar conteo de productos si se solicita
    if (data && data.length > 0) {
      const brandsWithProductCount = await Promise.all(
        data.map(async (brand) => {
          const { count } = await supabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id)
            .eq('is_active', true);

          return {
            ...brand,
            product_count: count || 0
          };
        })
      );

      console.log('✅ Admin API: Brands fetched successfully');
      return NextResponse.json({ success: true, data: brandsWithProductCount });
    }

    console.log('✅ Admin API: Brands fetched successfully');
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}