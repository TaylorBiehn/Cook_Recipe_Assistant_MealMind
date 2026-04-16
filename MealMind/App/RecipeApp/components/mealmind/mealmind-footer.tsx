import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';

const appVersion = Constants.expoConfig?.version ?? '1.0.0';

export function MealMindFooter() {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottom, MealMindSpace.sm) }]}>
      <View style={styles.row}>
        <Text style={styles.brand}>MealMind</Text>
        <Text style={styles.meta}>v{appVersion}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: MealMindColors.surfaceContainerHigh,
    backgroundColor: MealMindColors.surface,
    paddingHorizontal: MealMindSpace.md,
    paddingTop: MealMindSpace.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: MealMindColors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  meta: {
    fontFamily: MealMindFonts.body,
    fontSize: 12,
    color: MealMindColors.outline,
  },
});
