import type { Router } from 'expo-router';

import { showAuthSuccessToast } from '@/lib/mealmind-toast';
import {
  getGetStartedSeen,
  getIntroSeen,
  getOnboardingComplete,
  hydrateLocalFlagsFromRemoteProfile,
} from '@/lib/profile-storage';
import { fetchMealMindProfile } from '@/lib/supabase-profile';

/**
 * After any successful Supabase sign-in (email or OAuth), mirror the same routing as the email flow.
 */
export async function navigateAfterSuccessfulAuth(router: Router): Promise<void> {
  const remote = await fetchMealMindProfile();
  if (remote) {
    await hydrateLocalFlagsFromRemoteProfile(remote);
  }
  const onboardingDone = await getOnboardingComplete();
  if (onboardingDone) {
    showAuthSuccessToast('Signed in', 'Welcome back.');
    router.replace('/(tabs)');
    return;
  }
  const introSeen = await getIntroSeen();
  if (!introSeen) {
    showAuthSuccessToast('Signed in', "Let's personalize MealMind.");
    router.replace('/intro');
    return;
  }
  const started = await getGetStartedSeen();
  showAuthSuccessToast('Signed in', "Let's personalize MealMind.");
  router.replace(!started ? '/get-started' : '/(tabs)');
}
