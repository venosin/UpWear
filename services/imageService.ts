import { createClient } from '@/lib/supabase/client'

export async function uploadProductImage(
  file: File,
  productId: string,
  folder: string = 'products'
): Promise<{ url: string; error: string | null }> {
  try {
    // Usar el cliente centralizado que ya tiene la configuración correcta
    const supabase = createClient()

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Storage upload error:', error)
      return { url: '', error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return { url: publicUrl, error: null }

  } catch (error) {
    console.error('Upload error:', error)
    return { url: '', error: 'Failed to upload image' }
  }
}

export async function deleteProductImage(imagePath: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from('product-images')
      .remove([imagePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

export async function getProductImageUrl(imagePath: string): Promise<string> {
  const supabase = createClient()

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(imagePath)

  return publicUrl
}