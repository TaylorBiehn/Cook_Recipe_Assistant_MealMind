import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { getGetStartedSeen, getOnboardingComplete } from '@/lib/profile-storage';

type BootTarget = 'get-started' | 'onboarding' | 'tabs' | null;

/**
 * Entry: get-started (step 14) → onboarding → tabs.
 * “Browse popular” on get-started skips onboarding with profile defaults.
 */
export default function Index() {
  const [target, setTarget] = useState<BootTarget>(null);

  useEffect(() => {
    void Promise.all([getGetStartedSeen(), getOnboardingComplete()]).then(([started, onboardingDone]) => {
      if (onboardingDone) {
        setTarget('tabs');
        return;
      }
      if (!started) {
        setTarget('get-started');
      } else {
        setTarget('onboarding');
      }
    });
  }, []);

  if (target === null) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={MealMindColors.primary} />
      </View>
    );
  }

  if (target === 'get-started') {
    return <Redirect href="/get-started" />;
  }

  if (target === 'onboarding') {
    return <Redirect href="/onboarding" />;
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
