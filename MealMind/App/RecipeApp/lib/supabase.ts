import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '[MealMind] Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (e.g. in .env) for Supabase auth.',
  );
}

/** If set, show this instead of a generic "Network request failed" from fetch. */
export function getSupabaseMisconfigurationMessage(): string | null {
  const url = supabaseUrl.trim();
  const key = supabaseAnonKey.trim();
  if (!url || !key) {
    return 'Supabase is not configured. In MealMind/App/RecipeApp the file must be named exactly .env (not .env. with an extra dot). Copy .env.example to .env, add your Supabase URL and anon key (Settings → API), then stop and restart Expo.';
  }
  const urlLower = url.toLowerCase();
  if (!urlLower.startsWith('https://') || urlLower.includes('your_project') || urlLower.includes('placeholder.supabase.co')) {
    return 'EXPO_PUBLIC_SUPABASE_URL must be your real project URL (https://… from Supabase → Settings → API).';
  }
  const keyLower = key.toLowerCase();
  if (keyLower.includes('your_anon') || keyLower === 'placeholder-anon-key' || key.length < 20) {
    return 'EXPO_PUBLIC_SUPABASE_ANON_KEY must be the anon public key from Supabase → Settings → API (not the service role key).';
  }
  return null;
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
