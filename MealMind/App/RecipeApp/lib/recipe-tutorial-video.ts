import type { MockRecipe } from '@/lib/mealmind-recipe-mocks';

const YT_SEARCH_API = 'https://www.googleapis.com/youtube/v3/search';

function pantryNoise(name: string): boolean {
  return /\b(salt|pepper|oil|water|stock|spice|herbs?)\b/i.test(name);
}

/**
 * Search phrase aligned with the generated recipe: prefers model `tutorialSearchQuery`,
 * else title + main ingredients + hints (matches the dish, not a random query).
 */
export function buildTutorialSearchQuery(recipe: MockRecipe): string {
  const fromAi = recipe.tutorialSearchQuery?.trim();
  if (fromAi) {
    return fromAi.replace(/\s+/g, ' ');
  }
  const ing = recipe.ingredients
    .map((x) => x.name.trim())
    .filter((n) => n.length > 0 && !pantryNoise(n))
    .slice(0, 6)
    .join(' ');
  const hints = recipe.tags
    .slice(1)
    .map((t) => t.label)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
  const iq = recipe.imageQuery?.trim() ?? '';
  const parts = [recipe.title, ing, hints, iq, 'recipe how to cook tutorial'].filter((p) => p.length > 0);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function youtubeResultsUrl(q: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

/** Sync URL for tests or when you only need the search page (no API). */
export function getRecipeTutorialLaunchUrl(recipe: MockRecipe): string {
  const direct = recipe.tutorialVideoUrl?.trim();
  if (direct && /^https:\/\//i.test(direct)) {
    return direct;
  }
  return youtubeResultsUrl(buildTutorialSearchQuery(recipe));
}

/**
 * Opens the best match: optional direct URL, else top YouTube search result if
 * `EXPO_PUBLIC_YOUTUBE_API_KEY` is set (enable YouTube Data API v3 on the key),
 * else YouTube results for `buildTutorialSearchQuery`.
 */
export async function resolveRecipeTutorialUrl(recipe: MockRecipe): Promise<string> {
  const direct = recipe.tutorialVideoUrl?.trim();
  if (direct && /^https:\/\//i.test(direct)) {
    return direct;
  }

  const q = buildTutorialSearchQuery(recipe);
  const key = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY?.trim();
  if (key) {
    try {
      const params = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        maxResults: '1',
        order: 'relevance',
        videoEmbeddable: 'true',
        safeSearch: 'moderate',
        q,
        key,
      });
      const res = await fetch(`${YT_SEARCH_API}?${params}`);
      if (res.ok) {
        const data = (await res.json()) as {
          items?: Array<{ id?: { videoId?: string } }>;
          error?: { message?: string };
        };
        if (data.error?.message && __DEV__) {
          console.warn('[recipe-video] YouTube API:', data.error.message);
        }
        const vid = data.items?.[0]?.id?.videoId;
        if (vid) {
          return `https://www.youtube.com/watch?v=${vid}`;
        }
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[recipe-video] YouTube search failed:', e);
      }
    }
  }

  return youtubeResultsUrl(q);
}
