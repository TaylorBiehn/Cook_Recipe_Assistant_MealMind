import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';

export type MealMindFlowHeaderProps = {
  title: string;
  /** Subtle bottom hairline like registration mock (`border-outline-variant/10`). */
  showBottomDivider?: boolean;
};

/** Stack flow screens: back + title (matches design top bar pattern). */
export function MealMindFlowHeader({ title, showBottomDivider }: MealMindFlowHeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.row, showBottomDivider && styles.rowDivider]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.md,
    backgroundColor: MealMindColors.surface,
  },
  back: {
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 18,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
  },
  spacer: {
    width: 24,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}26`,
  },
});
