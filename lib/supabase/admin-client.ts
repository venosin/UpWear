import { createBrowserClient } from "@supabase/ssr";

let adminSupabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createAdminClient() {
  // Singleton pattern para evitar múltiples instancias
  if (adminSupabaseClient) {
    return adminSupabaseClient;
  }

  adminSupabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Usar la service role key para operaciones de admin
  );

  return adminSupabaseClient;
}