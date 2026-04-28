/**
 * "Explore More Categories" on Results double-taps → Home chip filters via `explore` query param.
 */
export type ExploreHomePresetSlug =
  | 'main-meals'
  | 'light-bites'
  | 'desserts'
  | 'drinks'
  | 'healthy'
  | 'quick-meals';

export const EXPLORE_CATEGORY_CHIPS: { label: string; slug: ExploreHomePresetSlug }[] = [
  { label: 'Main Meals', slug: 'main-meals' },
  { label: 'Light Bites', slug: 'light-bites' },
  { label: 'Desserts', slug: 'desserts' },
  { label: 'Drinks', slug: 'drinks' },
  { label: 'Healthy', slug: 'healthy' },
  { label: 'Quick Meals', slug: 'quick-meals' },
];

/** Omitted keys keep the user's current chip selection. */
export type ExploreNavigatePatch = Partial<{
  mealTypeId: string;
  cookingStyleId: string | null;
}>;

export function homeFiltersFromExploreSlug(slug: ExploreHomePresetSlug): ExploreNavigatePatch {
  switch (slug) {
    case 'main-meals':
      return { mealTypeId: 'lunch', cookingStyleId: null };
    case 'light-bites':
      return { mealTypeId: 'snacks', cookingStyleId: null };
    case 'desserts':
      return { mealTypeId: 'dessert', cookingStyleId: null };
    case 'drinks':
      return { mealTypeId: 'drinks', cookingStyleId: null };
    case 'healthy':
      return { cookingStyleId: 'healthy' };
    case 'quick-meals':
      return { cookingStyleId: 'quick' };
  }
}

export function exploreSlugFromRaw(value: string | undefined): ExploreHomePresetSlug | null {
  if (!value) return null;
  const v = value.trim();
  const hit = EXPLORE_CATEGORY_CHIPS.find((c) => c.slug === v);
  return hit?.slug ?? null;
}
