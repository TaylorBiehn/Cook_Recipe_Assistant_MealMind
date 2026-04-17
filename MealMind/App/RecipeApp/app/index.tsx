import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import {
  getGetStartedSeen,
  getIntroSeen,
  getOnboardingComplete,
  hydrateLocalFlagsFromRemoteProfile,
  setOnboardingComplete,
} from '@/lib/profile-storage';
import { getSupabaseSession } from '@/lib/supabase-auth';
import { fetchMealMindProfile } from '@/lib/supabase-profile';

type BootTarget = 'signup' | 'intro' | 'get-started' | 'tabs' | null;

/**
 * Entry: Supabase session → (first-time only) intro wizard → get-started → tabs.
 * Returning users hydrate progress from `profiles` so they skip the 12-step flow.
 * Without a session, user is sent to sign up first.
 */
export default function Index() {
  const [target, setTarget] = useState<BootTarget>(null);

  useEffect(() => {
    void (async () => {
      const session = await getSupabaseSession();
      if (!session) {
        setTarget('signup');
        return;
      }
      const remote = await fetchMealMindProfile();
      if (remote) {
        await hydrateLocalFlagsFromRemoteProfile(remote);
      }
      const [introSeen, started, onboardingDone] = await Promise.all([
        getIntroSeen(),
        getGetStartedSeen(),
        getOnboardingComplete(),
      ]);
      if (!introSeen) {
        setTarget('intro');
        return;
      }
      if (onboardingDone) {
        setTarget('tabs');
        return;
      }
      if (!started) {
        setTarget('get-started');
      } else {
        if (!onboardingDone) {
          void setOnboardingComplete();
        }
        setTarget('tabs');
      }
    })();
  }, []);

  if (target === null) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={MealMindColors.primary} />
      </View>
    );
  }

  if (target === 'signup') {
    return <Redirect href="/signup" />;
  }

  if (target === 'get-started') {
    return <Redirect href="/get-started" />;
  }

  if (target === 'intro') {
    return <Redirect href="/intro" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MealMindColors.surface,
  },
});
