/**
 * Página simple de administración de productos
 * Sin dependencias complejas para evitar errores de importación
 */

import { createClient } from '@/lib/supabase/server';
import { CreateProductButton } from '@/components/admin/CreateProductButton';

interface Product {
  id: number;
  name: string;
  sku: string;
  price_regular: number;
  price_sale: number;
  cost_price: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Obtiene productos desde Supabase
 */
async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, price_regular, price_sale, cost_price, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

/**
 * Página principal de administración de productos
 */
export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a1b14',
            margin: 0
          }}>
            Productos
          </h1>
          <p style={{
            color: '#676960',
            marginTop: '8px',
            margin: '8px 0 0 0'
          }}>
            Gestiona tu catálogo de productos ({products.length} productos)
          </p>
        </div>

        <CreateProductButton />
      </div>

      {/* Tabla de productos */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {products.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#676960'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#1a1b14'
            }}>
              No hay productos aún
            </h3>
            <p style={{ margin: 0 }}>
              Comienza creando tu primer producto
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Nombre
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    SKU
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Precio
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Estado
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Creado
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{
                    borderBottom: '1px solid #e5e7eb',
                    ':hover': { backgroundColor: '#f9fafb' }
                  }}>
                    <td style={{
                      padding: '16px',
                      fontWeight: '500',
                      color: '#1a1b14'
                    }}>
                      {product.name}
                    </td>
                    <td style={{
                      padding: '16px',
                      color: '#676960',
                      fontFamily: 'monospace'
                    }}>
                      {product.sku}
                    </td>
                    <td style={{
                      padding: '16px',
                      color: '#1a1b14',
                      fontWeight: '500'
                    }}>
                      <div>
                        {product.price_regular ? `$${product.price_regular.toFixed(2)}` : '$0.00'}
                        {product.price_sale && product.price_sale > 0 && (
                          <div style={{
                            fontSize: '12px',
                            color: '#dc2626',
                            textDecoration: 'line-through'
                          }}>
                            Was: ${product.price_regular.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: product.is_active ? '#dcfce7' : '#fef2f2',
                        color: product.is_active ? '#166534' : '#dc2626'
                      }}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px',
                      color: '#676960',
                      fontSize: '14px'
                    }}>
                      {new Date(product.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#676960'
      }}>
        <strong>Conexión Supabase:</strong> {
          products.length > 0
            ? '✅ Conectado correctamente'
            : '⚠️ No se encontraron productos o hay problemas de conexión'
        }
      </div>
    </div>
  );
}