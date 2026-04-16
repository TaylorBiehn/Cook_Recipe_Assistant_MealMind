import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';

export type ChipItem = { id: string; label: string };

export type ChipRowProps = {
  chips: ChipItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Optional section label above chips. */
  sectionLabel?: string;
  /** Negative horizontal margin so chips scroll to screen edges (home mock `-mx-6`). */
  edgeBleed?: boolean;
};

const OUTLINE_10 = `${MealMindColors.outlineVariant}1A`;

/** Horizontal chip row — secondary “pebble” chips (DESIGN.md); selected uses secondaryContainer. */
export function ChipRow({ chips, selectedId, onSelect, sectionLabel, edgeBleed }: ChipRowProps) {
  const scroll = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, edgeBleed && styles.rowEdgeBleed]}>
      {chips.map((chip) => {
        const selected = chip.id === selectedId;
        return (
          <Pressable
            key={chip.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(chip.id)}
            style={({ pressed }) => [
              styles.chip,
              selected ? styles.chipSelected : styles.chipIdle,
              pressed && styles.chipPressed,
            ]}>
            <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextIdle]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.wrap}>
      {sectionLabel != null ? <Text style={styles.section}>{sectionLabel}</Text> : null}
      {edgeBleed ? <View style={styles.edgeBleed}>{scroll}</View> : scroll}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: MealMindSpace.sm,
  },
  section: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.onSurface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    paddingVertical: 4,
    paddingRight: MealMindSpace.md,
  },
  rowEdgeBleed: {
    paddingLeft: MealMindSpace.lg,
    paddingRight: MealMindSpace.xl,
  },
  edgeBleed: {
    marginHorizontal: -MealMindSpace.lg,
  },
  chip: {
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.sm + 2,
    borderRadius: MealMindRadii.full,
  },
  chipIdle: {
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE_10,
  },
  chipSelected: {
    backgroundColor: MealMindColors.secondaryContainer,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
  },
  chipTextIdle: {
    color: MealMindColors.onSurfaceVariant,
  },
  chipTextSelected: {
    color: MealMindColors.onSecondaryContainer,
  },
});
