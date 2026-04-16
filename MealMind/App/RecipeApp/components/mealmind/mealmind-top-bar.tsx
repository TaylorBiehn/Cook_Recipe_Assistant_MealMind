import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';

export type MealMindTopBarProps = ViewProps & {
  title: string;
  /** Optional right actions (icons / menu). */
  right?: ReactNode;
};

/**
 * Top app bar — solid surface (culinary glass + blur can be added with expo-blur later).
 */
export function MealMindTopBar({ title, right, style, ...rest }: MealMindTopBarProps) {
  return (
    <View style={[styles.bar, style]} {...rest}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {right != null ? <View style={styles.right}>{right}</View> : <View style={styles.rightSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.md,
    backgroundColor: MealMindColors.surface,
  },
  title: {
    flex: 1,
    fontFamily: MealMindFonts.headlineSemibold,
    fontSize: 18,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
  },
  right: {
    marginLeft: MealMindSpace.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
  },
  rightSpacer: {
    width: MealMindSpace.sm,
  },
});
