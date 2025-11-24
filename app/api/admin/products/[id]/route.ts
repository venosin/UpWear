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
    const productId = resolvedParams.id;
    const updateData = await request.json();

    console.log('🔧 Admin API: Updating product', productId, updateData);

    // Mapear price_regular a price_original para la base de datos
    const dbUpdateData: any = {};

    // Mapear campos manualmente
    if (updateData.name !== undefined) dbUpdateData.name = updateData.name;
    if (updateData.slug !== undefined) dbUpdateData.slug = updateData.slug;
    if (updateData.sku !== undefined) dbUpdateData.sku = updateData.sku;
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
    if (updateData.short_description !== undefined) dbUpdateData.short_description = updateData.short_description;
    if (updateData.price_regular !== undefined) dbUpdateData.price_original = updateData.price_regular;
    if (updateData.price_sale !== undefined) dbUpdateData.price_sale = updateData.price_sale;
    if (updateData.cost_price !== undefined) dbUpdateData.cost_price = updateData.cost_price;
    if (updateData.is_active !== undefined) dbUpdateData.is_active = updateData.is_active;
    if (updateData.is_featured !== undefined) dbUpdateData.is_featured = updateData.is_featured;
    if (updateData.gender !== undefined) dbUpdateData.gender = updateData.gender;
    if (updateData.category_id !== undefined) dbUpdateData.category_id = updateData.category_id;
    if (updateData.brand_id !== undefined) dbUpdateData.brand_id = updateData.brand_id;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(dbUpdateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ Admin API Error updating product:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log('✅ Admin API: Product updated successfully');
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
    const productId = resolvedParams.id;

    console.log('🗑️ Admin API: Deleting product', productId);

    // 1. Primero obtener imágenes para eliminarlas del storage
    const { data: images, error: imagesError } = await supabaseAdmin
      .from('product_images')
      .select('url')
      .eq('product_id', productId)
      .eq('is_active', true);

    if (imagesError) {
      console.error('❌ Admin API: Error getting product images:', imagesError);
      // Continuamos con la eliminación aunque falle obtener imágenes
    }

    // 2. Eliminar imágenes del storage (si existen)
    if (images && images.length > 0) {
      for (const image of images) {
        try {
          // Extraer el path relativo del archivo desde la URL completa
          let imagePath = '';
          if (image.url && image.url.includes('product-images/')) {
            imagePath = image.url.split('product-images/')[1];
          } else if (image.url) {
            // Fallback si solo se guardó el nombre
            imagePath = image.url.split('/').pop() || '';
          }

          if (imagePath) {
            await supabaseAdmin.storage
              .from('product-images')
              .remove([imagePath]);
          }
        } catch (storageError) {
          console.warn('⚠️ Admin API: Failed to delete storage image:', image.url);
          // Continuamos aunque falle eliminar del storage
        }
      }
    }

    // 3. Soft delete: Eliminar imágenes de la base de datos
    const { error: deleteImagesError } = await supabaseAdmin
      .from('product_images')
      .update({ is_active: false })
      .eq('product_id', productId);

    if (deleteImagesError) {
      console.error('❌ Admin API: Error deleting product images:', deleteImagesError);
      return NextResponse.json({ success: false, error: deleteImagesError.message }, { status: 400 });
    }

    // 4. Soft delete: Eliminar variantes del producto
    const { error: deleteVariantsError } = await supabaseAdmin
      .from('product_variants')
      .update({ is_active: false })
      .eq('product_id', productId);

    if (deleteVariantsError) {
      console.error('❌ Admin API: Error deleting product variants:', deleteVariantsError);
      return NextResponse.json({ success: false, error: deleteVariantsError.message }, { status: 400 });
    }

    // 5. Soft delete: Eliminar el producto
    const { error: deleteProductError } = await supabaseAdmin
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);

    if (deleteProductError) {
      console.error('❌ Admin API: Error deleting product:', deleteProductError);
      return NextResponse.json({ success: false, error: deleteProductError.message }, { status: 400 });
    }

    console.log('✅ Admin API: Product deleted successfully');
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Admin API: Unexpected error during deletion:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error during deletion' }, { status: 500 });
  }
}