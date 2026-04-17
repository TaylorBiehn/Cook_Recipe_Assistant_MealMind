import type { ScanIngredientItem } from '@/lib/scan-mock-ingredients';

const MEALDB_ING_BASE = 'https://www.themealdb.com/images/ingredients';
const WIKI_UA = 'MealMindRecipeApp/1.0 (ingredient thumbnails; contact: app)';

function titleCaseWords(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ')
    .trim();
}

function mealDbCandidates(name: string): string[] {
  const t = name.trim();
  if (!t) {
    return [];
  }
  const variants = new Set<string>();
  variants.add(t);
  variants.add(titleCaseWords(t));
  variants.add(t.toLowerCase());
  variants.add(t.replace(/\s+/g, '_'));
  const first = t.split(/[\s,]+/)[0];
  if (first && first !== t) {
    variants.add(titleCaseWords(first));
  }
  const urls: string[] = [];
  for (const v of variants) {
    if (!v) {
      continue;
    }
    urls.push(`${MEALDB_ING_BASE}/${encodeURIComponent(v)}-Small.png`);
  }
  return urls;
}

async function urlIsReachableImage(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': WIKI_UA },
    });
    if (res.ok) {
      const ct = res.headers.get('content-type') ?? '';
      return ct.startsWith('image/');
    }
  } catch {
    /* try GET */
  }
  try {
    const res = await fetch(url, { headers: { 'User-Agent': WIKI_UA } });
    if (!res.ok) {
      return false;
    }
    const ct = res.headers.get('content-type') ?? '';
    return ct.startsWith('image/');
  } catch {
    return false;
  }
}

async function tryMealDb(name: string): Promise<string | null> {
  for (const url of mealDbCandidates(name)) {
    if (await urlIsReachableImage(url)) {
      return url;
    }
  }
  return null;
}

type WikiSearchJson = {
  query?: { search?: Array<{ title: string }> };
};

type WikiImageJson = {
  query?: {
    pages?: Record<
      string,
      {
        imageinfo?: Array<{ thumburl?: string; url?: string }>;
      }
    >;
  };
};

async function tryWikimediaCommons(name: string): Promise<string | null> {
  const q = `${name.trim()} food`;
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=1`;

  try {
    const sRes = await fetch(searchUrl, { headers: { 'User-Agent': WIKI_UA } });
    if (!sRes.ok) {
      return null;
    }
    const sJson = (await sRes.json()) as WikiSearchJson;
    const title = sJson.query?.search?.[0]?.title;
    if (!title) {
      return null;
    }

    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=256`;
    const iRes = await fetch(infoUrl, { headers: { 'User-Agent': WIKI_UA } });
    if (!iRes.ok) {
      return null;
    }
    const iJson = (await iRes.json()) as WikiImageJson;
    const pages = iJson.query?.pages;
    if (!pages) {
      return null;
    }
    const page = Object.values(pages)[0];
    const info = page?.imageinfo?.[0];
    const thumb = info?.thumburl ?? info?.url;
    return thumb ?? null;
  } catch {
    return null;
  }
}

/**
 * Best-effort stock photo for an ingredient name (no API key).
 * TheMealDB first (fast, curated pantry photos), then Wikimedia Commons search.
 */
export async function resolveIngredientThumbnail(name: string): Promise<string | null> {
  const meal = await tryMealDb(name);
  if (meal) {
    return meal;
  }
  const wiki = await tryWikimediaCommons(name);
  return wiki;
}

export async function enrichScanItemsWithThumbnails(items: ScanIngredientItem[]): Promise<ScanIngredientItem[]> {
  const resolved = await Promise.all(
    items.map(async (row) => {
      const thumb = await resolveIngredientThumbnail(row.name);
      return thumb ? { ...row, thumbnailUrl: thumb } : row;
    }),
  );
  return resolved;
}
