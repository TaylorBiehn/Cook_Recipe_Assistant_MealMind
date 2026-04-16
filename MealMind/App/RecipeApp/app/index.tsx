import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { getGetStartedSeen, getIntroSeen, getOnboardingComplete } from '@/lib/profile-storage';

type BootTarget = 'intro' | 'get-started' | 'onboarding' | 'tabs' | null;

/**
 * Entry: get-started (step 14) → onboarding → tabs.
 * “Browse popular” on get-started skips onboarding with profile defaults.
 */
export default function Index() {
  const [target, setTarget] = useState<BootTarget>(null);

  useEffect(() => {
    void Promise.all([getIntroSeen(), getGetStartedSeen(), getOnboardingComplete()]).then(
      ([introSeen, started, onboardingDone]) => {
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
        setTarget('onboarding');
      }
      },
    );
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

  if (target === 'intro') {
    return <Redirect href="/intro" />;
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
