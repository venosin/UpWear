import { createClient } from '@supabase/supabase-js'

export async function uploadProductImage(
  file: File,
  productId: string,
  folder: string = 'products'
): Promise<{ url: string; error: string | null }> {
  try {
    // Create Supabase client for storage operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('upwear-images')
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
      .from('upwear-images')
      .getPublicUrl(fileName)

    return { url: publicUrl, error: null }

  } catch (error) {
    console.error('Upload error:', error)
    return { url: '', error: 'Failed to upload image' }
  }
}

export async function deleteProductImage(imagePath: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.storage
      .from('upwear-images')
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { publicUrl } } = supabase.storage
    .from('upwear-images')
    .getPublicUrl(imagePath)

  return publicUrl
}