import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_COMPLETE_KEY = 'mealmind.onboardingComplete';
export const GET_STARTED_SEEN_KEY = 'mealmind.getStartedSeen';
export const INTRO_SEEN_KEY = 'mealmind.introSeen';
export const PROFILE_DRAFT_KEY = 'mealmind.profileDraft';

export type KitchenComfort = 'quick_simple' | 'balanced' | 'ambitious';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type WellnessGoal =
  | 'eat_healthier'
  | 'save_time'
  | 'lose_weight'
  | 'gain_muscle'
  | 'maintain_weight'
  | 'reduce_waste'
  | 'budget'
  | 'unsure';

export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'low_carb'
  | 'high_protein'
  | 'gluten_free'
  | 'dairy_free'
  | 'other';

export type CookingExperience = 'new' | 'home_cook' | 'confident' | 'pro';

export type StoredProfile = {
  countryCode: string;
  skillLevel: SkillLevel;
  /** Default when not collected in onboarding (balanced). */
  kitchenComfort: KitchenComfort;
  preferences: string[];
  dislikes: string[];
  /** Edited on Profile only; default false (non-vegetarian). */
  vegetarianFocus: boolean;
  pescetarianFriendly: boolean;
  /** Intro wizard fields (Design/onboarding). */
  wellnessGoal: WellnessGoal;
  dietaryPreference: DietaryPreference;
  cuisines: string[];
  allergies: string[];
  avoidFoods: string[];
  cookingExperience: CookingExperience;
  kitchenEquipment: string[];
  cookingSchedule: string;
  flavorProfile: string[];
  spicyLevel: 'mild' | 'medium' | 'hot';
  calorieFocus: 'no_preference' | 'lower' | 'balanced' | 'higher';
};

function isSkillLevel(x: unknown): x is SkillLevel {
  return x === 'beginner' || x === 'intermediate' || x === 'advanced';
}

function isKitchenComfort(x: unknown): x is KitchenComfort {
  return x === 'quick_simple' || x === 'balanced' || x === 'ambitious';
}

function isWellnessGoal(x: unknown): x is WellnessGoal {
  return (
    x === 'eat_healthier' ||
    x === 'save_time' ||
    x === 'lose_weight' ||
    x === 'gain_muscle' ||
    x === 'maintain_weight' ||
    x === 'reduce_waste' ||
    x === 'budget' ||
    x === 'unsure'
  );
}

function isDietaryPreference(x: unknown): x is DietaryPreference {
  return (
    x === 'none' ||
    x === 'vegetarian' ||
    x === 'vegan' ||
    x === 'keto' ||
    x === 'low_carb' ||
    x === 'high_protein' ||
    x === 'gluten_free' ||
    x === 'dairy_free' ||
    x === 'other'
  );
}

function isCookingExperience(x: unknown): x is CookingExperience {
  return x === 'new' || x === 'home_cook' || x === 'confident' || x === 'pro';
}

function parseStringArray(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string') : [];
}

function parseProfile(raw: string): StoredProfile | null {
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      countryCode: typeof p.countryCode === 'string' ? p.countryCode : 'WORLDWIDE',
      skillLevel: isSkillLevel(p.skillLevel) ? p.skillLevel : 'beginner',
      kitchenComfort: isKitchenComfort(p.kitchenComfort) ? p.kitchenComfort : 'balanced',
      preferences: parseStringArray(p.preferences),
      dislikes: parseStringArray(p.dislikes),
      vegetarianFocus: Boolean(p.vegetarianFocus),
      pescetarianFriendly: Boolean(p.pescetarianFriendly),
      wellnessGoal: isWellnessGoal(p.wellnessGoal) ? p.wellnessGoal : 'unsure',
      dietaryPreference: isDietaryPreference(p.dietaryPreference) ? p.dietaryPreference : 'none',
      cuisines: parseStringArray(p.cuisines),
      allergies: parseStringArray(p.allergies),
      avoidFoods: parseStringArray(p.avoidFoods),
      cookingExperience: isCookingExperience(p.cookingExperience) ? p.cookingExperience : 'home_cook',
      kitchenEquipment: parseStringArray(p.kitchenEquipment),
      cookingSchedule: typeof p.cookingSchedule === 'string' ? p.cookingSchedule : 'flexible',
      flavorProfile: parseStringArray(p.flavorProfile),
      spicyLevel: p.spicyLevel === 'hot' || p.spicyLevel === 'medium' || p.spicyLevel === 'mild' ? p.spicyLevel : 'medium',
      calorieFocus:
        p.calorieFocus === 'no_preference' ||
        p.calorieFocus === 'lower' ||
        p.calorieFocus === 'balanced' ||
        p.calorieFocus === 'higher'
          ? p.calorieFocus
          : 'no_preference',
    };
  } catch {
    return null;
  }
}

export async function getIntroSeen(): Promise<boolean> {
  const v = await AsyncStorage.getItem(INTRO_SEEN_KEY);
  return v === '1';
}

export async function setIntroSeen(): Promise<void> {
  await AsyncStorage.setItem(INTRO_SEEN_KEY, '1');
}

export async function getOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
  return v === '1';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, '1');
}

export async function getGetStartedSeen(): Promise<boolean> {
  const v = await AsyncStorage.getItem(GET_STARTED_SEEN_KEY);
  return v === '1';
}

export async function setGetStartedSeen(): Promise<void> {
  await AsyncStorage.setItem(GET_STARTED_SEEN_KEY, '1');
}

export async function getProfile(): Promise<StoredProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_DRAFT_KEY);
  if (raw == null) return null;
  return parseProfile(raw);
}

export async function setProfile(profile: StoredProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(profile));
}

export async function clearOnboardingForDev(): Promise<void> {
  // Dev-only helper: wipe onboarding gating flags and the saved draft so you can retest flows.
  await AsyncStorage.multiRemove([INTRO_SEEN_KEY, ONBOARDING_COMPLETE_KEY, GET_STARTED_SEEN_KEY, PROFILE_DRAFT_KEY]);
}
