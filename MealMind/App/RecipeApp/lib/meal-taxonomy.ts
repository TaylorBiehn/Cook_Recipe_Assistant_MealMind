/**
 * Shared taxonomy for meal types + cooking styles.
 *
 * Both the Home ingredient flow and the Favorites filter chips read from here so
 * the two surfaces stay in sync when we extend the lists.
 */

export type MealTypeId =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snacks'
  | 'brunch'
  | 'dessert'
  | 'drinks'
  | 'side';

export type CookingStyleId =
  | 'quick'
  | 'family'
  | 'budget'
  | 'healthy'
  | 'comfort'
  | 'one_pot'
  | 'meal_prep'
  | 'no_cook';

export type CookingTimeId = '15' | '30' | '45';

export type MealChip<Id extends string> = { id: Id; label: string };

export const MEAL_TYPE_CHIPS: MealChip<MealTypeId>[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'brunch', label: 'Brunch' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'side', label: 'Sides' },
];

export const COOKING_STYLE_CHIPS: MealChip<CookingStyleId>[] = [
  { id: 'quick', label: 'Quick Meals' },
  { id: 'family', label: 'Family Meals' },
  { id: 'budget', label: 'Budget Friendly' },
  { id: 'healthy', label: 'Healthy' },
  { id: 'comfort', label: 'Comfort Food' },
  { id: 'one_pot', label: 'One Pot' },
  { id: 'meal_prep', label: 'Meal Prep' },
  { id: 'no_cook', label: 'No Cook' },
];

export const COOKING_TIME_CHIPS: MealChip<CookingTimeId>[] = [
  { id: '15', label: '<15 min' },
  { id: '30', label: '15-30 min' },
  { id: '45', label: '30+ min' },
];

/** Filter chips on the Favorites tab. "All Favorites" sits in front of the meal types. */
export const FAVORITES_FILTER_CHIPS: { id: 'all' | MealTypeId; label: string }[] = [
  { id: 'all', label: 'All Favorites' },
  ...MEAL_TYPE_CHIPS.map((c) => ({ id: c.id, label: c.label })),
];

/**
 * Best-effort map from a user-facing label ("Breakfast", "Snacks", "Sides") or AI tag
 * to a canonical {@link MealTypeId}. Returns `undefined` when we cannot confidently match.
 */
export function mealTypeIdFromLabel(label: string | undefined | null): MealTypeId | undefined {
  if (!label) return undefined;
  const v = label.trim().toLowerCase();
  if (!v) return undefined;
  if (v.startsWith('breakfast')) return 'breakfast';
  if (v.startsWith('brunch')) return 'brunch';
  if (v.startsWith('lunch')) return 'lunch';
  if (v.startsWith('dinner') || v.startsWith('supper')) return 'dinner';
  if (v.startsWith('dessert') || v.includes('sweet')) return 'dessert';
  if (v.startsWith('drink') || v.includes('beverage') || v.includes('smoothie')) return 'drinks';
  if (v.startsWith('side') || v.startsWith('sides')) return 'side';
  if (v.startsWith('snack') || v.includes('appetizer') || v.includes('bite')) return 'snacks';
  return undefined;
}
