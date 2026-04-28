import { apiGet, apiPost } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentIngredient = {
  name: string;
  lastUsedAt: string;
  useCount: number;
};

type RecentIngredientsResponse = {
  data?: {
    ingredients?: RecentIngredient[];
  };
};

const RECENT_INGREDIENTS_LOCAL_KEY = 'mealmind.recentIngredients.local';
const MAX_RECENT_ITEMS = 100;

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function normalizeRecentList(list: readonly RecentIngredient[]): RecentIngredient[] {
  const byKey = new Map<string, RecentIngredient>();
  for (const row of list) {
    const name = normalizeName(row.name);
    if (!name) {
      continue;
    }
    const key = name.toLowerCase();
    const lastUsedAt = typeof row.lastUsedAt === 'string' ? row.lastUsedAt : new Date().toISOString();
    const useCount = typeof row.useCount === 'number' && Number.isFinite(row.useCount) ? Math.max(1, Math.floor(row.useCount)) : 1;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { name, lastUsedAt, useCount });
      continue;
    }
    const existingTs = Date.parse(existing.lastUsedAt);
    const incomingTs = Date.parse(lastUsedAt);
    const keepIncoming = Number.isFinite(incomingTs) && (!Number.isFinite(existingTs) || incomingTs >= existingTs);
    byKey.set(key, {
      name: keepIncoming ? name : existing.name,
      lastUsedAt: keepIncoming ? lastUsedAt : existing.lastUsedAt,
      useCount: Math.max(existing.useCount, useCount),
    });
  }
  return [...byKey.values()]
    .sort((a, b) => Date.parse(b.lastUsedAt) - Date.parse(a.lastUsedAt))
    .slice(0, MAX_RECENT_ITEMS);
}

async function getLocalRecentIngredients(): Promise<RecentIngredient[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_INGREDIENTS_LOCAL_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as { ingredients?: RecentIngredient[] };
    if (!Array.isArray(parsed.ingredients)) {
      return [];
    }
    return normalizeRecentList(parsed.ingredients);
  } catch {
    return [];
  }
}

async function setLocalRecentIngredients(ingredients: readonly RecentIngredient[]): Promise<void> {
  try {
    const normalized = normalizeRecentList(ingredients);
    await AsyncStorage.setItem(RECENT_INGREDIENTS_LOCAL_KEY, JSON.stringify({ ingredients: normalized }));
  } catch {
    // Keep UI resilient when local storage is unavailable.
  }
}

/** Drop the device-local recent-ingredients cache (e.g. after sign-out or account switch). */
export async function clearLocalRecentIngredients(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_INGREDIENTS_LOCAL_KEY);
  } catch {
    // Ignore — best-effort cleanup.
  }
}

function applyNamesToRecentList(
  current: readonly RecentIngredient[],
  names: readonly string[],
  atIso: string,
): RecentIngredient[] {
  const byKey = new Map<string, RecentIngredient>();
  for (const row of current) {
    const name = normalizeName(row.name);
    if (!name) {
      continue;
    }
    byKey.set(name.toLowerCase(), {
      name,
      lastUsedAt: row.lastUsedAt,
      useCount: row.useCount,
    });
  }
  for (const raw of names) {
    const name = normalizeName(raw);
    if (!name) {
      continue;
    }
    const key = name.toLowerCase();
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { name, lastUsedAt: atIso, useCount: 1 });
      continue;
    }
    byKey.set(key, {
      name,
      lastUsedAt: atIso,
      useCount: existing.useCount + 1,
    });
  }
  return normalizeRecentList([...byKey.values()]);
}

export async function fetchRecentIngredients(limit = 20): Promise<RecentIngredient[]> {
  const local = await getLocalRecentIngredients();
  try {
    const res = await apiGet(`/v1/ingredients/recent?limit=${encodeURIComponent(String(limit))}`);
    if (!res.ok) {
      return local.slice(0, Math.max(1, limit));
    }
    const payload = (await res.json()) as RecentIngredientsResponse;
    const list = payload.data?.ingredients;
    if (!Array.isArray(list)) {
      return local.slice(0, Math.max(1, limit));
    }
    const remote = list
      .filter((row) => typeof row?.name === 'string' && row.name.trim().length > 0)
      .map((row) => ({
        name: normalizeName(row.name),
        lastUsedAt: typeof row.lastUsedAt === 'string' ? row.lastUsedAt : new Date().toISOString(),
        useCount: typeof row.useCount === 'number' && Number.isFinite(row.useCount) ? row.useCount : 1,
      }));
    const merged = normalizeRecentList([...remote, ...local]);
    await setLocalRecentIngredients(merged);
    return merged.slice(0, Math.max(1, limit));
  } catch {
    return local.slice(0, Math.max(1, limit));
  }
}

export async function recordRecentIngredients(ingredients: readonly string[]): Promise<void> {
  const names = ingredients.map((s) => normalizeName(s)).filter((s) => s.length > 0);
  if (names.length === 0) {
    return;
  }

  const nowIso = new Date().toISOString();
  const local = await getLocalRecentIngredients();
  const nextLocal = applyNamesToRecentList(local, names, nowIso);
  await setLocalRecentIngredients(nextLocal);

  try {
    const res = await apiPost('/v1/ingredients/recent', { ingredients: names });
    if (!res.ok) {
      return;
    }
  } catch {
    // Local fallback already updated; silently continue.
  }
}
