/**
 * MealMind / “The Culinary Curator” palette (Design/harvest_hearth/DESIGN.md).
 * Light-first; avoid pure black — use onSurface.
 */
export const MealMindColors = {
  surface: '#fef8f5',
  surfaceContainer: '#f2edea',
  surfaceContainerLow: '#f8f2f0',
  surfaceContainerHigh: '#ede7e4',
  surfaceContainerLowest: '#ffffff',
  primary: '#8f4e00',
  primaryContainer: '#ff9f43',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#6d3a00',
  primaryFixed: '#ffdcc2',
  onPrimaryFixedVariant: '#6d3a00',
  secondary: '#566342',
  secondaryContainer: '#d7e5bb',
  /** Home hero blob tint (`Design/home_screen/code.html`). */
  secondaryFixed: '#dae8be',
  onSecondaryContainer: '#5a6745',
  /** Recipe “family tip” / secondary emphasis (`profile_settings` / `recipe_detail`). */
  onSecondaryFixedVariant: '#3f4b2c',
  tertiary: '#665e49',
  tertiaryContainer: '#c0b59c',
  tertiaryFixed: '#eee1c7',
  onTertiaryFixed: '#211b0b',
  onTertiaryFixedVariant: '#4e4633',
  /** Suggested-card decorative circle. */
  tertiaryFixedDim: '#d1c5ac',
  onTertiaryContainer: '#4e4733',
  onSurface: '#1d1b1a',
  onSurfaceVariant: '#544437',
  /** From registration mock — used for subtle “Add ingredient” pill tint. */
  outline: '#877365',
  outlineVariant: '#dac2b1',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  /** Alias for design token `surface-container-highest` (matches high tier in palette). */
  surfaceContainerHighest: '#e7e1df',
} as const;

export type MealMindColorName = keyof typeof MealMindColors;
