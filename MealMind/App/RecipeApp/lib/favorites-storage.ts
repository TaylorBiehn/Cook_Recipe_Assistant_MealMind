import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MealTypeId } from './meal-taxonomy';

/** A recipe the user explicitly saved. Stored device-local for now. */
export type StoredFavorite = {
  id: string;
  title: string;
  blurb?: string;
  image: string;
  /** Optional meal-type tags so the Favorites filter chips can match against them. */
  mealTypes?: MealTypeId[];
  /** Optional short badges rendered on the favorites card (e.g. "25 Mins"). */
  badgeLabels?: string[];
  /** Optional meta pills under the title (e.g. time, calories, serves). */
  meta?: { icon: 'schedule' | 'local-fire-department' | 'group'; text: string }[];
  /** Unix epoch ms when saved — used for sort order. */
  savedAt: number;
};

const FAVORITES_KEY = 'mealmind.favorites';

function isFavoriteShape(x: unknown): x is StoredFavorite {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.id === 'string' && typeof r.title === 'string' && typeof r.image === 'string';
}

export async function getFavorites(): Promise<StoredFavorite[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (raw == null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFavoriteShape).sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export async function isFavorite(id: string): Promise<boolean> {
  const list = await getFavorites();
  return list.some((f) => f.id === id);
}

export async function addFavorite(entry: Omit<StoredFavorite, 'savedAt'>): Promise<StoredFavorite[]> {
  const list = await getFavorites();
  if (list.some((f) => f.id === entry.id)) {
    return list;
  }
  const next: StoredFavorite[] = [{ ...entry, savedAt: Date.now() }, ...list];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export async function removeFavorite(id: string): Promise<StoredFavorite[]> {
  const list = await getFavorites();
  const next = list.filter((f) => f.id !== id);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_KEY);
}
