/**
 * Public runtime config. Values come from EXPO_PUBLIC_* env vars
 * (apps/app/.env.local in dev, EAS / hosting secrets in prod) — never committed.
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const isSupabaseConfigured = env.supabaseUrl !== '' && env.supabaseAnonKey !== '';
