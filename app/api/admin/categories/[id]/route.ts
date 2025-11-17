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
    const categoryId = resolvedParams.id;
    const updateData = await request.json();

    console.log('🔧 Admin API: Updating category', categoryId, updateData);

    // Validar que la categoría existe
    const { data: existingCategory, error: checkError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single();

    if (checkError || !existingCategory) {
      console.error('❌ Admin API: Category not found:', categoryId);
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('❌ Admin API Error updating category:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Category updated successfully');
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
    const categoryId = resolvedParams.id;

    console.log('🗑️ Admin API: Deleting category', categoryId);

    // Verificar si hay productos activos usando esta categoría
    const { data: activeProducts, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .limit(1);

    if (checkError) {
      console.error('❌ Admin API: Error checking products:', checkError);
      return NextResponse.json({ success: false, error: 'Error checking products' }, { status: 500 });
    }

    if (activeProducts && activeProducts.length > 0) {
      console.error('❌ Admin API: Cannot delete category with active products');
      return NextResponse.json({
        success: false,
        error: 'Cannot delete category with active products'
      }, { status: 400 });
    }

    // Soft delete: Actualizar is_active a false
    const { error } = await supabaseAdmin
      .from('categories')
      .update({ is_active: false })
      .eq('id', categoryId);

    if (error) {
      console.error('❌ Admin API Error deleting category:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Category deleted successfully');
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error during deletion:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error during deletion' }, { status: 500 });
  }
}