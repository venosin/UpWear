# Instrucciones para Arreglar la Subida de Imágenes

## Problema Actual
Las imágenes NO se están subiendo a Supabase Storage cuando se crea un producto. Solo se crean URLs temporales (blob:) que no persisten.

## Solución

### Paso 1: Modificar la interfaz ProductImage
En `components/admin/products/ProductForm.tsx`, línea 57-63:

```typescript
interface ProductImage {
  id?: number;
  url: string;
  altText: string;
  imageType: 'main' | 'gallery' | 'thumbnail';
  sortOrder?: number;
  file?: File; // ← AGREGAR ESTA LÍNEA
}
```

### Paso 2: Modificar ImageUpload para guardar el archivo File
En `components/admin/products/ProductForm.tsx`, línea 87-105, cambiar `handleFileUpload`:

```typescript
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files ? Array.from(event.target.files) : [];

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const tempUrl = URL.createObjectURL(file);

      const newImage: ProductImage = {
        url: tempUrl,
        altText: file.name,
        imageType: 'gallery',
        sortOrder: images.length,
        file: file // ← AGREGAR ESTA LÍNEA para guardar el archivo
      };

      onImagesChange([...images, newImage]);
    }
  }
};
```

### Paso 3: Modificar productService.createProduct para subir imágenes
En `services/productService.ts`, línea 161-166, reemplazar el TODO con código real:

```typescript
// 3. Subir imágenes a Supabase Storage
if (productData.images && productData.images.length > 0) {
  console.log('📸 Uploading images to Supabase Storage...');
  
  const { uploadProductImage } = await import('@/services/imageService');
  
  for (let i = 0; i < productData.images.length; i++) {
    const img = productData.images[i];
    
    // Solo subir si tiene un archivo File (imágenes nuevas)
    if (img.file) {
      console.log(`Uploading image ${i + 1}/${productData.images.length}:`, img.altText);
      
      const { url, error } = await uploadProductImage(
        img.file,
        product.id.toString(),
        'products'
      );

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }

      // Guardar la URL real en la base de datos
      const { error: dbError } = await this.supabase
        .from('product_images')
        .insert({
          product_id: product.id,
          url: url, // URL real de Supabase Storage
          alt_text: img.altText || '',
          image_type: img.imageType,
          order_index: i,
          is_active: true
        });

      if (dbError) {
        console.error('Error saving image to database:', dbError);
      } else {
        console.log('✅ Image uploaded and saved:', url);
      }
    }
  }
}
```

### Paso 4: Arreglar el problema del género "male"

El error muestra que se está enviando "male" pero el enum espera "men". 

**Opción A: Verificar el valor en el estado inicial**
En `ProductForm.tsx` línea 418, el valor por defecto es correcto ('unisex'), pero verifica que cuando seleccionas "Hombre" en el formulario, esté enviando "men" y no "male".

**Opción B: Agregar console.log para debug**
En `services/productService.ts`, línea 129, agregar:

```typescript
console.log('🔍 Gender value being sent:', productData.basicInfo.gender);
gender: productData.basicInfo.gender,
```

Esto te dirá exactamente qué valor se está enviando.

## Verificación

Después de hacer estos cambios:

1. Reinicia el servidor de desarrollo
2. Crea un nuevo producto con imagen
3. Verifica en Supabase Storage (bucket `product-images`) que la imagen se subió
4. Verifica en la tabla `product_images` que se guardó la URL correcta
5. Verifica que la imagen aparezca al editar el producto

## Notas Importantes

- Las imágenes se subirán a: `product-images/{productId}/{timestamp}.{ext}`
- El bucket `product-images` debe existir en Supabase Storage y ser público
- Si el bucket no existe, créalo desde el panel de Supabase con políticas públicas de lectura
