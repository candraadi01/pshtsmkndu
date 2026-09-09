import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { hasSupabaseConfig, publicConfig } from "@/lib/config";

/**
 * Public client for unauthenticated read queries with optional fallback.
 */
export function createOptionalSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) return null;
  return createClient(publicConfig.supabaseUrl!, publicConfig.supabaseAnonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Authenticated SSR client for Server Actions and authenticated Server Components.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eqvclzfiomyoxmjztqca.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored if called from a pure Server Component render
        }
      },
    },
  });
}
