import { StyleSheet, Text, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';

export type IngredientRowProps = {
  name: string;
  amount?: string;
};

/** Ingredient line — no divider; spacing only (DESIGN.md lists). */
export function IngredientRow({ name, amount }: IngredientRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      {amount != null ? (
        <Text style={styles.amount}>{amount}</Text>
      ) : (
        <View style={styles.amountPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: MealMindSpace.md,
  },
  name: {
    flex: 1,
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: MealMindColors.onSurface,
  },
  amount: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    paddingHorizontal: MealMindSpace.sm,
    paddingVertical: 6,
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
  },
  amountPlaceholder: {
    minWidth: 48,
  },
});
