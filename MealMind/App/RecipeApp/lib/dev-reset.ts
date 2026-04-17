import { signOutMealMind } from '@/lib/supabase-auth';

/** Clears Supabase session, legacy token key, and onboarding/profile draft flags (dev testing). */
export async function resetAppForDev(): Promise<void> {
  await signOutMealMind();
}
