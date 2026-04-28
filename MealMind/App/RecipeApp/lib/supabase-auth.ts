import type { AuthError } from '@supabase/supabase-js';

import { clearAuthToken } from '@/lib/auth-storage';
import { clearFavorites } from '@/lib/favorites-storage';
import {
  clearLastAuthUserId,
  clearProfileAndOnboardingState,
  getLastAuthUserId,
  setLastAuthUserId,
} from '@/lib/profile-storage';
import { clearLocalRecentIngredients } from '@/lib/recent-ingredients-api';
import { clearLastGeneratedRecipes } from '@/lib/recipe-generation-session';
import { getSupabaseMisconfigurationMessage, supabase } from '@/lib/supabase';

/**
 * Drop device-local caches that were saved per-user but keyed only by device.
 * Without this, a different sign-in inherits the previous user's favorites,
 * ingredient history, and last generated recipes from AsyncStorage.
 */
async function clearUserScopedDeviceCaches(): Promise<void> {
  await Promise.all([
    clearProfileAndOnboardingState(),
    clearFavorites(),
    clearLocalRecentIngredients(),
    clearLastGeneratedRecipes(),
  ]);
}

/** If a different Supabase account signs in, drop stale per-user device caches from the previous user. */
export async function syncLocalStateAfterAuth(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) return;
  const last = await getLastAuthUserId();
  if (last != null && last !== uid) {
    await clearUserScopedDeviceCaches();
  }
  await setLastAuthUserId(uid);
}

/** Sign out and clear local per-user state so the next sign-in starts from a clean slate. */
export async function signOutMealMind(): Promise<void> {
  await supabase.auth.signOut();
  await clearAuthToken();
  await clearUserScopedDeviceCaches();
  await clearLastAuthUserId();
}

function rethrowIfNetworkFailure(err: unknown): never {
  if (err instanceof TypeError) {
    const m = String(err.message ?? '');
    if (m.includes('Network request failed') || m.includes('Failed to fetch')) {
      throw new Error(
        'Could not reach Supabase. Check Wi‑Fi, confirm EXPO_PUBLIC_SUPABASE_URL in .env matches your project (Settings → API), and restart Expo after any .env change.',
      );
    }
  }
  throw err;
}

export function mapSupabaseAuthError(err: AuthError): string {
  const msg = err.message;
  const lower = msg.toLowerCase();
  if (lower.includes('already registered') || lower.includes('user already registered')) {
    return 'That email is already registered.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email, then try signing in.';
  }
  if (lower.includes('rate limit')) {
    return 'Too many sign-up or email attempts. Wait a little while, then try again. (Supabase limits auth emails per hour.)';
  }
  return msg || 'Something went wrong. Please try again.';
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  countryCode: string;
}): Promise<{ session: boolean; needsEmailConfirmation: boolean }> {
  const missing = getSupabaseMisconfigurationMessage();
  if (missing) throw new Error(missing);

  let data;
  let error;
  try {
    const result = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { country_code: input.countryCode },
      },
    });
    data = result.data;
    error = result.error;
  } catch (err) {
    rethrowIfNetworkFailure(err);
  }
  if (error) throw new Error(mapSupabaseAuthError(error));
  if (data.session) {
    await clearUserScopedDeviceCaches();
    await clearLastAuthUserId();
    await syncLocalStateAfterAuth();
    return { session: true, needsEmailConfirmation: false };
  }
  if (data.user) return { session: false, needsEmailConfirmation: true };
  return { session: false, needsEmailConfirmation: false };
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const missing = getSupabaseMisconfigurationMessage();
  if (missing) throw new Error(missing);

  let error;
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    error = result.error;
  } catch (err) {
    rethrowIfNetworkFailure(err);
  }
  if (error) throw new Error(mapSupabaseAuthError(error));
  await syncLocalStateAfterAuth();
}

export async function signOutSupabase(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSupabaseSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
