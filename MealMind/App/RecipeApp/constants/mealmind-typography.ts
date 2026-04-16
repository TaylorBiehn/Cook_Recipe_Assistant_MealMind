/**
 * fontFamily keys must match `useFonts` map keys (Expo Google Fonts postscript names).
 * @see Design/harvest_hearth/DESIGN.md — Plus Jakarta (headlines), Be Vietnam Pro (body/labels).
 */
export const MealMindFonts = {
  headlineExtraBold: 'PlusJakartaSans_800ExtraBold',
  headlineBold: 'PlusJakartaSans_700Bold',
  headlineSemibold: 'PlusJakartaSans_600SemiBold',
  body: 'BeVietnamPro_400Regular',
  bodyMedium: 'BeVietnamPro_500Medium',
  labelSemibold: 'BeVietnamPro_600SemiBold',
} as const;

/** Editorial tight tracking (−0.02em at ~18px headline). */
export const headlineTracking = -0.35;
