import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_COMPLETE_KEY = 'mealmind.onboardingComplete';
export const GET_STARTED_SEEN_KEY = 'mealmind.getStartedSeen';
export const PROFILE_DRAFT_KEY = 'mealmind.profileDraft';

export type KitchenComfort = 'quick_simple' | 'balanced' | 'ambitious';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

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
};

function isSkillLevel(x: unknown): x is SkillLevel {
  return x === 'beginner' || x === 'intermediate' || x === 'advanced';
}

function isKitchenComfort(x: unknown): x is KitchenComfort {
  return x === 'quick_simple' || x === 'balanced' || x === 'ambitious';
}

function parseProfile(raw: string): StoredProfile | null {
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      countryCode: typeof p.countryCode === 'string' ? p.countryCode : 'WORLDWIDE',
      skillLevel: isSkillLevel(p.skillLevel) ? p.skillLevel : 'beginner',
      kitchenComfort: isKitchenComfort(p.kitchenComfort) ? p.kitchenComfort : 'balanced',
      preferences: Array.isArray(p.preferences)
        ? p.preferences.filter((x): x is string => typeof x === 'string')
        : [],
      dislikes: Array.isArray(p.dislikes) ? p.dislikes.filter((x): x is string => typeof x === 'string') : [],
      vegetarianFocus: Boolean(p.vegetarianFocus),
      pescetarianFriendly: Boolean(p.pescetarianFriendly),
    };
  } catch {
    return null;
  }
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
  await AsyncStorage.multiRemove([ONBOARDING_COMPLETE_KEY, GET_STARTED_SEEN_KEY]);
}
