import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type ViewStyle } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';

export type GlowButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** Optional icon after label (e.g. Material symbol as Text). */
  trailing?: ReactNode;
  style?: ViewStyle;
};

/** Primary CTA — 135° glow gradient primary → primaryContainer (DESIGN.md). */
export function GlowButton({ label, trailing, style, disabled, ...rest }: GlowButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...rest}>
      <LinearGradient
        colors={[MealMindColors.primary, MealMindColors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <Text style={styles.label}>{label}</Text>
        {trailing != null ? <View style={styles.trail}>{trailing}</View> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: MealMindRadii.lg,
    overflow: 'hidden',
    ...MealMindShadow.glowCta,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: MealMindSpace.md + 4,
    paddingHorizontal: MealMindSpace.xl + 8,
    gap: MealMindSpace.sm,
  },
  label: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    letterSpacing: headlineTracking,
    color: MealMindColors.onPrimary,
  },
  trail: {
    marginLeft: 4,
  },
});
