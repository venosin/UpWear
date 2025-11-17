import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase con SERVICE ROLE KEY para operaciones de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const categoryData = await request.json();

    console.log('🔧 Admin API: Creating category', categoryData);

    // Validar datos requeridos
    if (!categoryData.name || categoryData.name.trim() === '') {
      console.error('❌ Admin API: Category name is required');
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    // Generar slug si no se proporciona
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Obtener el próximo sort_order si no se proporciona
    if (!categoryData.sort_order) {
      const { data: lastCategory } = await supabaseAdmin
        .from('categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

      categoryData.sort_order = lastCategory && lastCategory.length > 0 ? lastCategory[0].sort_order + 1 : 1;
    }

    // Establecer valores por defecto
    categoryData.is_active = categoryData.is_active !== undefined ? categoryData.is_active : true;

    // Verificar que el slug sea único
    const { data: existingSlug } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', categoryData.slug)
      .single();

    if (existingSlug) {
      console.error('❌ Admin API: Slug already exists:', categoryData.slug);
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
    }

    // Verificar que el nombre sea único
    const { data: existingName } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', categoryData.name)
      .single();

    if (existingName) {
      console.error('❌ Admin API: Category name already exists:', categoryData.name);
      return NextResponse.json({ success: false, error: 'Category name already exists' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || null,
        image_url: categoryData.image_url || null,
        parent_id: categoryData.parent_id || null,
        sort_order: categoryData.sort_order,
        is_active: categoryData.is_active,
        metadata: categoryData.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Admin API Error creating category:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Category created successfully');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Admin API: Fetching all categories');

    // Obtener todas las categorías (incluyendo inactivas) para admin
    const { data, error } = await supabaseAdmin
      .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          parent_id,
          sort_order,
          is_active,
          created_at,
          updated_at
        `)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
      console.error('❌ Admin API Error fetching categories:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Categories fetched successfully');
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 });
  }
}