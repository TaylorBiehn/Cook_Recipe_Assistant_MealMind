import { StyleSheet, Text, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';

export type MealMindStepBlockProps = {
  stepNumber: number;
  title?: string;
  instruction: string;
  /** “Kitchen mode” — highlighted active step (DESIGN.md). */
  active?: boolean;
};

export function MealMindStepBlock({ stepNumber, title, instruction, active }: MealMindStepBlockProps) {
  return (
    <View style={[styles.card, active ? styles.cardActive : styles.cardIdle]}>
      <View style={styles.inner}>
        <Text style={[styles.index, active ? styles.indexActive : styles.indexIdle]}>{String(stepNumber).padStart(2, '0')}</Text>
        <View style={styles.copy}>
          {title != null ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.body}>{instruction}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    marginBottom: MealMindSpace.md,
  },
  cardIdle: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
  },
  cardActive: {
    backgroundColor: `${MealMindColors.tertiaryContainer}33`,
    borderLeftWidth: 4,
    borderLeftColor: MealMindColors.primary,
  },
  inner: {
    flexDirection: 'row',
    gap: MealMindSpace.md,
  },
  index: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: headlineTracking,
  },
  indexActive: {
    color: `${MealMindColors.primary}55`,
  },
  indexIdle: {
    color: `${MealMindColors.outlineVariant}cc`,
  },
  copy: {
    flex: 1,
    gap: MealMindSpace.xs,
  },
  title: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.onSurface,
  },
  body: {
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: MealMindColors.onSurfaceVariant,
  },
});
