import { apiGet, apiPost } from '@/lib/api';

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

export async function fetchRecentIngredients(limit = 20): Promise<RecentIngredient[]> {
  const res = await apiGet(`/v1/ingredients/recent?limit=${encodeURIComponent(String(limit))}`);
  if (!res.ok) {
    return [];
  }
  const payload = (await res.json()) as RecentIngredientsResponse;
  const list = payload.data?.ingredients;
  if (!Array.isArray(list)) {
    return [];
  }
  return list
    .filter((row) => typeof row?.name === 'string' && row.name.trim().length > 0)
    .map((row) => ({
      name: row.name.trim(),
      lastUsedAt: typeof row.lastUsedAt === 'string' ? row.lastUsedAt : new Date().toISOString(),
      useCount: typeof row.useCount === 'number' && Number.isFinite(row.useCount) ? row.useCount : 1,
    }));
}

export async function recordRecentIngredients(ingredients: readonly string[]): Promise<void> {
  const names = ingredients.map((s) => s.trim()).filter((s) => s.length > 0);
  if (names.length === 0) {
    return;
  }
  const res = await apiPost('/v1/ingredients/recent', { ingredients: names });
  if (!res.ok) {
    throw new Error(`Could not record ingredients (${res.status})`);
  }
}
