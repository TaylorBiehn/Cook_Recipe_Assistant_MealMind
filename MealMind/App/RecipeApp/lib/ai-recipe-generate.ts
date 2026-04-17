import { File, Paths } from 'expo-file-system';

import type { PendingRecipeSearch } from '@/lib/recipe-generation-session';
import { GENERIC_MEAL_IMAGE_PLACEHOLDERS } from '@/lib/recipe-image-placeholders';
import type { StoredProfile } from '@/lib/profile-storage';
import type { MockIngredient, MockRecipe, MockStep } from '@/lib/mealmind-recipe-mocks';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';
const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

/** Only neutral prep/ingredient shots — never design-mock pasta/salmon/pizza URLs that clash with AI titles. */
const FOOD_IMAGE_POOL: readonly string[] = [...GENERIC_MEAL_IMAGE_PLACEHOLDERS];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return Math.abs(h);
}

function foodImageFromFallback(seed: string, index: number): string {
  const i = hashSeed(`${seed}\0${index}`) % FOOD_IMAGE_POOL.length;
  return FOOD_IMAGE_POOL[i];
}

/** Pick a pool URL not yet used (sequential bump) so cards never share the same stock image. */
function pickUniquePoolImage(seed: string, index: number, used: Set<string>): string {
  const n = FOOD_IMAGE_POOL.length;
  const h = hashSeed(`${seed}\0${index}`);
  for (let bump = 0; bump < n; bump++) {
    const url = FOOD_IMAGE_POOL[(h + bump) % n];
    if (!used.has(url)) {
      used.add(url);
      return url;
    }
  }
  const fallback = FOOD_IMAGE_POOL[index % n];
  used.add(fallback);
  return fallback;
}

function getUnsplashAccessKey(): string | undefined {
  return process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY?.trim() || undefined;
}

function isHttpsImageUrl(u: string | null | undefined): u is string {
  return typeof u === 'string' && /^https:\/\//i.test(u.trim());
}

function isRenderableHeroUri(u: string | null | undefined): u is string {
  if (typeof u !== 'string') {
    return false;
  }
  const t = u.trim();
  return /^https:\/\//i.test(t) || /^file:\/\//i.test(t);
}

type RecipeHeroImageMode = 'generated_first' | 'unsplash_first' | 'generated_only' | 'unsplash_only';

function getRecipeHeroImageMode(): RecipeHeroImageMode {
  const raw = process.env.EXPO_PUBLIC_RECIPE_HERO_IMAGE_MODE?.trim().toLowerCase() ?? '';
  if (raw === 'unsplash_first' || raw === 'stock_first') {
    return 'unsplash_first';
  }
  if (raw === 'generated_only' || raw === 'dalle_only') {
    return 'generated_only';
  }
  if (raw === 'unsplash_only' || raw === 'stock_only') {
    return 'unsplash_only';
  }
  if (raw === 'generated_first' || raw === 'dalle_first') {
    return 'generated_first';
  }
  const hasOpenAi = Boolean(process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim());
  return hasOpenAi ? 'generated_first' : 'unsplash_only';
}

function getDalleImageSize(): '1024x1024' | '1792x1024' | '1024x1792' {
  const s = process.env.EXPO_PUBLIC_DALLE_IMAGE_SIZE?.trim();
  if (s === '1792x1024' || s === '1024x1792' || s === '1024x1024') {
    return s;
  }
  return '1024x1024';
}

function getDalleQuality(): 'standard' | 'hd' {
  return process.env.EXPO_PUBLIC_DALLE_IMAGE_QUALITY === 'hd' ? 'hd' : 'standard';
}

function buildDalleRecipeHeroPrompt(
  profile: StoredProfile | null,
  pending: PendingRecipeSearch,
  r: MockRecipe,
): string {
  const ing = r.ingredients
    .map((x) => x.name.trim())
    .filter(Boolean)
    .slice(0, 14)
    .join(', ');
  const userIng = pending.ingredients.map((x) => x.trim()).filter(Boolean).join(', ');
  const iq = r.imageQuery?.trim() ?? r.title;
  const profileBit = profile
    ? `Dietary preference: ${profile.dietaryPreference}. ${profile.allergies.length ? `Do not show or imply these allergens: ${profile.allergies.join(', ')}. ` : ''}Preferred cuisines: ${profile.cuisines.slice(0, 5).join(', ') || 'varied'}. Spice level: ${profile.spicyLevel}. Calorie focus: ${profile.calorieFocus}.`
    : 'Balanced, family-friendly meal.';
  const filterBit = `Meal occasion: ${pending.mealTypeLabel.trim() || 'meal'}. Home filters — time: ${pending.cookingTimeLabel.trim() || 'any'}; cooking style: ${pending.cookingStyleLabel.trim() || 'general'}.`;
  const ingredientsBit = userIng ? `The user typed these ingredients on the search screen — reflect them in the plate where realistic: ${userIng}.` : '';

  const body = `Photorealistic professional food photograph of one finished dish only, overhead or three-quarter angle. Dish name: "${r.title}". The food on the plate must clearly match: ${iq}. Visible components should include: ${ing}. ${filterBit} ${ingredientsBit} ${profileBit} No people, hands, faces, chefs, kitchens with humans, text, logos, labels, or packaging. Neutral table or linen, soft natural light, sharp focus on the food, appetizing restaurant-style plating appropriate for the occasion.`;
  return body.slice(0, 3800);
}

async function persistOpenAiImageToCache(remoteUrl: string, recipeId: string): Promise<string> {
  const safeId = recipeId.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80);
  const destination = new File(Paths.cache, `mealmind-hero-${safeId}-${Date.now()}.png`);
  try {
    const saved = await File.downloadFileAsync(remoteUrl, destination, { idempotent: true });
    return saved.uri;
  } catch {
    return remoteUrl;
  }
}

async function generateOpenAiRecipeHeroImage(
  profile: StoredProfile | null,
  pending: PendingRecipeSearch,
  recipe: MockRecipe,
): Promise<string | null> {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  if (!key) {
    return null;
  }
  const prompt = buildDalleRecipeHeroPrompt(profile, pending, recipe);
  try {
    const res = await fetch(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: getDalleImageSize(),
        quality: getDalleQuality(),
        response_format: 'url',
      }),
    });
    const json = (await res.json()) as { error?: { message?: string }; data?: Array<{ url?: string }> };
    if (!res.ok) {
      if (__DEV__) {
        console.warn('[ai-recipe] DALL-E image:', json.error?.message ?? res.status);
      }
      return null;
    }
    const remote = json.data?.[0]?.url?.trim();
    if (!isHttpsImageUrl(remote)) {
      return null;
    }
    return persistOpenAiImageToCache(remote, recipe.id);
  } catch (e) {
    if (__DEV__) {
      console.warn('[ai-recipe] DALL-E image request failed:', e);
    }
    return null;
  }
}

async function resolveHeroFromUnsplash(
  r: MockRecipe,
  phrase: string,
  used: Set<string>,
): Promise<string | null> {
  const key = getUnsplashAccessKey();
  if (!key) {
    return null;
  }
  const iq = r.imageQuery?.trim() ?? '';
  const ing = ingSnippet(r);
  const rawVariants = [
    iq ? `${iq} ${r.title}` : null,
    iq ? `${iq} cooked plated meal` : null,
    `${r.title} ${ing} plated dish`,
    `${phrase} plated meal`,
    `${r.title} ${ing} recipe food`,
    ing ? `${ing} ${r.title} homemade` : `${r.title} food close up`,
  ].filter((x): x is string => Boolean(x?.trim()));
  const seenQ = new Set<string>();
  const queryVariants: string[] = [];
  for (const q of rawVariants) {
    const k = q.trim().toLowerCase();
    if (!seenQ.has(k)) {
      seenQ.add(k);
      queryVariants.push(q.trim());
    }
  }
  for (const qv of queryVariants) {
    try {
      const candidates = await fetchUnsplashSearchPhotoUrls(qv, 25);
      for (const remote of candidates) {
        if (!used.has(remote)) {
          return remote;
        }
      }
      const remote = await fetchUnsplashFoodPhotoUrl(qv);
      if (remote && !used.has(remote)) {
        return remote;
      }
    } catch {
      /* try next variant */
    }
  }
  return null;
}

type UnsplashPhotoMeta = {
  urls?: { regular?: string; small?: string; thumb?: string };
  description?: string | null;
  alt_description?: string | null;
};

/** Skip stock where Unsplash metadata clearly signals people or non-dish scenes. */
const UNSPLASH_HUMAN_OR_PORTRAIT_RE =
  /\b(wom[ae]n|female|male|man|men|person|people|chef|chefs|cook|portrait|selfie|model|girl|boy|child|children|kid|kids|mother|father|parent|family|couple|smiling|laughing|waiter|waitress|bartender|homemaker|housewife)\b/i;
const UNSPLASH_NON_DISH_SCENE_RE =
  /\b(grocery|supermarket|market shelf|\bmarket\b|shopping|\bcart\b|aisle|cashier|deli counter|farmers market|produce section|warehouse|factory|delivery|truck|office|wedding|gym|yoga|restaurant interior|dining room with people)\b/i;

function unsplashMetaText(p: UnsplashPhotoMeta): string {
  return `${p.description ?? ''} ${p.alt_description ?? ''}`.trim();
}

function isAcceptableUnsplashFoodHit(p: UnsplashPhotoMeta): boolean {
  const text = unsplashMetaText(p);
  if (text.length === 0) {
    return true;
  }
  const t = text.toLowerCase();
  if (UNSPLASH_HUMAN_OR_PORTRAIT_RE.test(t)) {
    return false;
  }
  if (UNSPLASH_NON_DISH_SCENE_RE.test(t)) {
    return false;
  }
  return true;
}

/** Steer search/random toward overhead plated food (not cooks, kitchens with people, or shops). */
function dishOnlyUnsplashQuery(core: string): string {
  const hint =
    'plated dish overhead table top view food styling single plate bowl meal studio culinary';
  const merged = `${core.replace(/\s+/g, ' ').trim()} ${hint}`.replace(/\s+/g, ' ').trim();
  return merged.slice(0, 240);
}

async function fetchUnsplashFoodPhotoUrl(query: string): Promise<string | null> {
  const key = getUnsplashAccessKey();
  if (!key) {
    return null;
  }
  const q = dishOnlyUnsplashQuery(`${query} food photography`);
  for (let orient of ['squarish', 'landscape'] as const) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(q)}&orientation=${orient}&content_filter=high`;
      const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return null;
        }
        break;
      }
      const data = (await res.json()) as UnsplashPhotoMeta;
      if (!isAcceptableUnsplashFoodHit(data)) {
        continue;
      }
      const raw = data.urls?.regular ?? data.urls?.small ?? null;
      if (isHttpsImageUrl(raw)) {
        return raw.trim();
      }
    }
  }
  return null;
}

async function fetchUnsplashSearchPhotoUrlsOriented(
  query: string,
  perPage: number,
  orientation: 'squarish' | 'landscape',
): Promise<string[]> {
  const key = getUnsplashAccessKey();
  if (!key) {
    return [];
  }
  const q = dishOnlyUnsplashQuery(query.replace(/\s+/g, ' ').trim());
  if (!q) {
    return [];
  }
  const n = Math.min(Math.max(perPage, 1), 30);
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${n}&orientation=${orientation}&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { results?: UnsplashPhotoMeta[] };
  const withMeta: string[] = [];
  const noMeta: string[] = [];
  for (const row of data.results ?? []) {
    if (!isAcceptableUnsplashFoodHit(row)) {
      continue;
    }
    const raw = row.urls?.regular ?? row.urls?.small ?? row.urls?.thumb;
    if (!isHttpsImageUrl(raw)) {
      continue;
    }
    const u = raw.trim();
    if (unsplashMetaText(row).length > 0) {
      withMeta.push(u);
    } else {
      noMeta.push(u);
    }
  }
  return [...withMeta, ...noMeta];
}

/** Search: squarish first (flat-lay plates), then landscape if everything was filtered out. */
async function fetchUnsplashSearchPhotoUrls(query: string, perPage: number): Promise<string[]> {
  const squarish = await fetchUnsplashSearchPhotoUrlsOriented(query, perPage, 'squarish');
  if (squarish.length > 0) {
    return squarish;
  }
  return fetchUnsplashSearchPhotoUrlsOriented(query, perPage, 'landscape');
}

function pantryNoise(name: string): boolean {
  return /\b(salt|pepper|oil|water|stock|spice|herbs?)\b/i.test(name);
}

/** Phrase for Unsplash: lead with model imageQuery (dish-specific), then title + ingredients. */
function buildImageSearchPhrase(r: MockRecipe, index: number): string {
  const ing = r.ingredients
    .map((x) => x.name.trim())
    .filter((n) => n.length > 0 && !pantryNoise(n))
    .slice(0, 6)
    .join(' ');
  const iq = r.imageQuery?.trim() ?? '';
  const parts = [iq, r.title, ing, `meal ${index + 1}`].filter((p) => p.length > 0);
  return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 200);
}

type HeroImageContext = {
  profile: StoredProfile | null;
  pending: PendingRecipeSearch;
};

/**
 * Resolves hero + video thumb: DALL·E 3 (optional) from profile + filters + ingredients, then Unsplash, then static pool.
 */
async function resolveRecipeHeroImages(recipes: MockRecipe[], ctx: HeroImageContext): Promise<MockRecipe[]> {
  const used = new Set<string>();
  const out: MockRecipe[] = [];
  const mode = getRecipeHeroImageMode();

  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    const phrase = buildImageSearchPhrase(r, i);
    let hero: string | null = null;

    const tryDalle = async (): Promise<string | null> => {
      if (mode === 'unsplash_only') {
        return null;
      }
      const g = await generateOpenAiRecipeHeroImage(ctx.profile, ctx.pending, r);
      return g && isRenderableHeroUri(g) ? g : null;
    };

    const tryUnsplash = async (): Promise<string | null> => {
      if (mode === 'generated_only') {
        return null;
      }
      return resolveHeroFromUnsplash(r, phrase, used);
    };

    if (mode === 'generated_first' || mode === 'generated_only') {
      hero = await tryDalle();
      if (hero) {
        used.add(hero);
      }
      if (!hero && mode === 'generated_first') {
        hero = await tryUnsplash();
        if (hero) {
          used.add(hero);
        }
      }
    } else if (mode === 'unsplash_first') {
      hero = await tryUnsplash();
      if (hero) {
        used.add(hero);
      }
      if (!hero) {
        hero = await tryDalle();
        if (hero) {
          used.add(hero);
        }
      }
    } else {
      hero = await tryUnsplash();
      if (hero) {
        used.add(hero);
      }
    }

    if (!isRenderableHeroUri(hero)) {
      hero = pickUniquePoolImage(`${r.id}|${phrase}`, i, used);
    }

    out.push({ ...r, heroImage: hero, videoThumb: hero });
  }

  return out;
}

function ingSnippet(r: MockRecipe): string {
  return r.ingredients
    .map((x) => x.name.trim())
    .filter((n) => n.length > 0 && !pantryNoise(n))
    .slice(0, 3)
    .join(' ');
}

function getOpenAiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim() || undefined;
}

function getGeminiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || undefined;
}

function getChatModel(): string {
  return process.env.EXPO_PUBLIC_RECIPE_AI_MODEL?.trim() || DEFAULT_CHAT_MODEL;
}

function getGeminiModel(): string {
  return process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function profileToPrompt(p: StoredProfile): string {
  const lines: string[] = [];
  lines.push(`Country/region code: ${p.countryCode}`);
  lines.push(`Cooking skill: ${p.skillLevel}; experience: ${p.cookingExperience}; kitchen comfort: ${p.kitchenComfort}`);
  lines.push(`Dietary preference: ${p.dietaryPreference}`);
  if (p.vegetarianFocus) {
    lines.push('User prefers vegetarian-focused meals.');
  }
  if (p.pescetarianFriendly) {
    lines.push('Pescetarian-friendly options are OK.');
  }
  if (p.allergies.length) {
    lines.push(`Allergies (never include): ${p.allergies.join(', ')}`);
  }
  if (p.avoidFoods.length) {
    lines.push(`Foods to avoid: ${p.avoidFoods.join(', ')}`);
  }
  if (p.dislikes.length) {
    lines.push(`Dislikes: ${p.dislikes.join(', ')}`);
  }
  if (p.preferences.length) {
    lines.push(`Likes / preferences: ${p.preferences.join(', ')}`);
  }
  if (p.cuisines.length) {
    lines.push(`Preferred cuisines: ${p.cuisines.join(', ')}`);
  }
  lines.push(`Spice tolerance: ${p.spicyLevel}; calorie focus: ${p.calorieFocus}`);
  lines.push(`Wellness goal: ${p.wellnessGoal}`);
  if (p.kitchenEquipment.length) {
    lines.push(`Kitchen equipment: ${p.kitchenEquipment.join(', ')}`);
  }
  lines.push(`Typical cooking schedule: ${p.cookingSchedule}`);
  if (p.flavorProfile.length) {
    lines.push(`Flavor preferences: ${p.flavorProfile.join(', ')}`);
  }
  return lines.join('\n');
}

function buildSystemPrompt(): string {
  return `You are MealMind's recipe assistant. You output realistic, cookable recipes as JSON only (no markdown).

Hard rules:
- Obey USER PROFILE allergies and dietary preference — never include allergens or forbidden foods.
- Obey the FILTER CONSTRAINTS block literally (meal type, time band, cooking style, ingredients).
- Recipe titles and ingredient lists must describe the same dish — no random unrelated cuisines.
- Every recipe must include imageQuery: English keywords for ONE finished plated dish only — what the eater sees on the plate or in the bowl (e.g. sausage slices, mushrooms, skillet sauce, noodles). FORBIDDEN in imageQuery: any person, face, hand, chef, home cook, portrait, grocery store, market aisle, shopping, raw produce display, kitchen scene with humans, or "making/cooking" action — only the cooked meal as served.
- Do NOT use concepts like buffet, salad bar, mezze spread, grazing board, or multi-compartment platter.
- imageQuery MUST repeat the main proteins, starches, and vegetables from the title and ingredient list (e.g. mushroom pork stir-fry → include mushroom, pork, stir fry; beef sausage → beef, sausage). Wrong foods in imageQuery cause wrong stock photos — be literal.
- Protein consistency: if the title names a specific meat or main protein (chicken, beef, pork, fish, tofu, etc.), imageQuery and ingredients must use that same protein — never substitute a different animal (e.g. chicken stir-fry must not use beef or pork as the hero protein in text or keywords).
- tutorialSearchQuery must describe the same dish as title and ingredients so a video search finds matching tutorials (not a generic or unrelated dish).
- When the user listed ingredients, imageQuery MUST name the main visible foods (e.g. chicken, cucumber) plus the dish format (salad bowl, lettuce wrap, stir-fry on rice).
- Pantry staples allowed in addition to listed ingredients: oil, salt, pepper, common dried herbs, garlic, onion, lemon, basic spices, water, stock cubes.
- Use clear amounts and numbered steps.
- JSON only, no markdown.`;
}

function filterConstraintsBlock(pending: PendingRecipeSearch): string {
  const lines: string[] = [];
  const { mealTypeLabel, cookingTimeLabel, cookingStyleLabel, ingredients } = pending;

  if (mealTypeLabel.trim()) {
    const mt = mealTypeLabel.trim();
    lines.push(
      `MEAL TYPE (“${mt}”) — mandatory: All 3 recipes must fit this occasion. Breakfast = morning foods; Lunch = midday plates; Dinner = evening mains; Snacks = small plates, handhelds, light bites, or quick apps — not full heavy roasts.`,
      `TAGS — mandatory: tags[0].label must be exactly "${mt}" (same wording as the user’s meal type chip — if they chose Lunch, do not use Breakfast). Use tags[1] and tags[2] for dish hints only (e.g. One-pan, Wrap).`,
    );
  }

  const time = cookingTimeLabel.trim();
  if (time) {
    if (time.includes('<15') || /^under\s*15/i.test(time)) {
      lines.push(
        `COOKING TIME (“${time}”) — mandatory: Each recipe’s timeLabel must be 15 minutes or less total (prep + active cooking). Keep techniques fast (skillet, microwave-safe shortcuts, no long braises).`,
      );
    } else if (time.includes('30+') || /30\s*\+\s*min/i.test(time)) {
      lines.push(
        `COOKING TIME (“${time}”) — mandatory: Each recipe should read as a ~30+ minute dish; timeLabel must be at least about 30 minutes (or honestly longer if the dish needs it).`,
      );
    } else if (time.includes('15-30') || time.includes('15–30')) {
      lines.push(
        `COOKING TIME (“${time}”) — mandatory: Each recipe’s timeLabel must fall between 15 and 30 minutes total.`,
      );
    } else {
      lines.push(`COOKING TIME (“${time}”) — mandatory: Match total kitchen time to this band honestly in timeLabel.`);
    }
  }

  if (cookingStyleLabel.trim()) {
    lines.push(
      `COOKING STYLE (“${cookingStyleLabel}”) — mandatory: All recipes reflect this. Quick Meals = minimal steps; Family Meals = shareable, kid-friendly angles; Budget Friendly = low-cost ingredients; Healthy = balanced, lighter where possible.`,
    );
  }

  const ing = ingredients.map((s) => s.trim()).filter(Boolean);
  if (ing.length > 0) {
    const list = ing.join(', ');
    lines.push(
      `INGREDIENTS ON HAND — mandatory: The user typed: ${list}.`,
      `- Every one of these items must appear by name or clear synonym in at least one recipe’s ingredient list across the set of 3 (cover the whole list between the three recipes).`,
      `- For each recipe, at least half of the ingredient lines must be from this list (plus allowed pantry staples).`,
      `- Titles must sound like dishes built around these foods — not unrelated concepts.`,
      `- For each recipe, imageQuery must include at least two words from the user’s ingredient list (or direct synonyms) plus the dish type so a photo search matches this exact meal.`,
    );
  } else {
    lines.push(
      'No ingredients typed — suggest 3 practical recipes using common pantry staples; still obey meal type and time constraints.',
    );
  }

  return lines.join('\n');
}

function buildUserPrompt(
  profile: StoredProfile | null,
  pending: PendingRecipeSearch,
  opts?: { excludeRecipeTitles?: string[] },
): string {
  const profileBlock =
    profile != null
      ? `USER PROFILE (from onboarding — apply every line):\n${profileToPrompt(profile)}\n`
      : `USER PROFILE: not saved on this device yet — use balanced family-friendly defaults, but still obey FILTER CONSTRAINTS below strictly.\n`;

  const constraints = filterConstraintsBlock(pending);
  const exclude =
    opts?.excludeRecipeTitles != null && opts.excludeRecipeTitles.length > 0
      ? `\nALREADY SHOWN — generate different dishes (new titles; not renames of): ${opts.excludeRecipeTitles.slice(0, 20).join(' | ')}\n`
      : '';

  return `${profileBlock}
FILTER CONSTRAINTS:
${constraints}
${exclude}
Return a JSON object with key "recipes" containing exactly 3 recipes. Each recipe must have:
- id: unique string, lowercase letters numbers and hyphens only (e.g. "lemon-herb-chicken-skillet")
- title: short appetizing title
- subtitle: one line for card subtitle
- timeLabel: like "25 mins" (realistic for the dish)
- difficultyLabel: Easy | Medium | Hard
- servingsLabel: e.g. "4 servings"
- kcalLabel: rough estimate e.g. "420 kcal"
- tags: array of 1-3 items with "label" (short) and "variant" either "secondary" or "tertiary"
- ingredients: array of { "name", "amount" } with 4-12 items
- familyTip: one practical sentence
- steps: array of 3-5 items with "n" ("01","02",...), "title", "body" (2-4 sentences)
- nutrition: array of 3-5 { "label", "value" } e.g. Protein / Carbs / Fats / Fiber
- imageQuery: 5–12 keywords: the cooked dish on a plate or in a bowl only (overhead or close-up food). No people, hands, chefs, kitchens with humans, groceries, or market scenes. No buffet / bar / spread. Must align with title and ingredients; include user’s key ingredients when provided in FILTER CONSTRAINTS.
- tutorialSearchQuery: one line (8–18 words) to find a YouTube cooking video for THIS EXACT DISH — include the dish as in title plus 2–4 main ingredient names (e.g. chicken, cucumber) and words like "recipe" or "how to cook". Must not describe a different meal than title + ingredients.

Do not include heroImage URLs.`;
}

function extractJson(text: string): unknown {
  const t = text.trim();
  try {
    return JSON.parse(t) as unknown;
  } catch {
    /* continue */
  }
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  const raw = (fence ? fence[1] : t).trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) {
    throw new Error('No JSON in model response');
  }
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

function isTagVariant(v: unknown): v is 'secondary' | 'tertiary' {
  return v === 'secondary' || v === 'tertiary';
}

function normalizeRecipe(raw: unknown, index: number): MockRecipe | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const r = raw as Record<string, unknown>;
  const title = typeof r.title === 'string' ? r.title.trim() : '';
  if (!title) {
    return null;
  }
  const idRaw = typeof r.id === 'string' ? r.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') : '';
  const id = idRaw.length > 2 ? idRaw : `ai-${Date.now()}-${index}`;

  const ingredients: MockIngredient[] = [];
  if (Array.isArray(r.ingredients)) {
    for (const row of r.ingredients) {
      if (row && typeof row === 'object' && 'name' in row) {
        const name = typeof (row as { name?: string }).name === 'string' ? (row as { name: string }).name.trim() : '';
        const amount =
          typeof (row as { amount?: string }).amount === 'string'
            ? (row as { amount: string }).amount.trim()
            : 'as needed';
        if (name) {
          ingredients.push({ name, amount });
        }
      }
    }
  }
  if (ingredients.length === 0) {
    ingredients.push({ name: 'See steps', amount: '—' });
  }

  const steps: MockStep[] = [];
  if (Array.isArray(r.steps)) {
    for (const row of r.steps) {
      if (row && typeof row === 'object') {
        const n = typeof (row as { n?: string }).n === 'string' ? (row as { n: string }).n : String(steps.length + 1);
        const st = typeof (row as { title?: string }).title === 'string' ? (row as { title: string }).title : 'Step';
        const body = typeof (row as { body?: string }).body === 'string' ? (row as { body: string }).body : '';
        steps.push({ n, title: st, body });
      }
    }
  }
  if (steps.length === 0) {
    steps.push({ n: '01', title: 'Cook', body: 'Follow timing for your ingredients until done.', active: true });
  }

  const tags: MockRecipe['tags'] = [];
  if (Array.isArray(r.tags)) {
    for (const t of r.tags) {
      if (t && typeof t === 'object' && 'label' in t) {
        const label = typeof (t as { label?: string }).label === 'string' ? (t as { label: string }).label : '';
        const variant = (t as { variant?: string }).variant;
        if (label && isTagVariant(variant)) {
          tags.push({ label, variant });
        } else if (label) {
          tags.push({ label, variant: 'secondary' });
        }
      }
    }
  }
  if (tags.length === 0) {
    tags.push({ label: 'AI pick', variant: 'secondary' });
  }

  const nutrition: { label: string; value: string }[] = [];
  if (Array.isArray(r.nutrition)) {
    for (const row of r.nutrition) {
      if (row && typeof row === 'object' && 'label' in row && 'value' in row) {
        const label = typeof (row as { label?: string }).label === 'string' ? (row as { label: string }).label : '';
        const value = typeof (row as { value?: string }).value === 'string' ? (row as { value: string }).value : '';
        if (label && value) {
          nutrition.push({ label, value });
        }
      }
    }
  }
  if (nutrition.length === 0) {
    nutrition.push({ label: 'Energy', value: 'See meal' });
  }

  const subtitle = typeof r.subtitle === 'string' ? r.subtitle.trim() : title;
  const timeLabel = typeof r.timeLabel === 'string' ? r.timeLabel.trim() : '30 mins';
  const difficultyLabel = typeof r.difficultyLabel === 'string' ? r.difficultyLabel.trim() : 'Easy';
  const servingsLabel = typeof r.servingsLabel === 'string' ? r.servingsLabel.trim() : '4 servings';
  const kcalLabel = typeof r.kcalLabel === 'string' ? r.kcalLabel.trim() : '—';
  const familyTip =
    typeof r.familyTip === 'string' && r.familyTip.trim().length > 0
      ? r.familyTip.trim()
      : 'Taste and adjust salt before serving.';

  const imageQueryRaw = typeof r.imageQuery === 'string' ? r.imageQuery.trim() : '';
  const imageQuery = imageQueryRaw.length > 0 ? imageQueryRaw : undefined;
  const tutorialSearchQueryRaw =
    typeof r.tutorialSearchQuery === 'string' ? r.tutorialSearchQuery.trim().replace(/\s+/g, ' ') : '';
  const tutorialSearchQuery =
    tutorialSearchQueryRaw.length > 0 ? tutorialSearchQueryRaw.slice(0, 240) : undefined;
  const heroFallback = foodImageFromFallback(`${id}|${imageQuery ?? title}`, index);

  const recipe: MockRecipe = {
    id,
    title,
    subtitle,
    heroImage: heroFallback,
    videoThumb: heroFallback,
    timeLabel,
    difficultyLabel,
    servingsLabel,
    kcalLabel,
    tags,
    ingredients,
    familyTip,
    steps,
    nutrition,
    ...(imageQuery ? { imageQuery } : {}),
    ...(tutorialSearchQuery ? { tutorialSearchQuery } : {}),
  };
  return recipe;
}

function parseRecipesPayload(json: unknown): MockRecipe[] {
  if (!json || typeof json !== 'object' || !('recipes' in json)) {
    return [];
  }
  const { recipes } = json as { recipes?: unknown };
  if (!Array.isArray(recipes)) {
    return [];
  }
  const out: MockRecipe[] = [];
  recipes.forEach((row, i) => {
    const m = normalizeRecipe(row, i);
    if (m) {
      out.push(m);
    }
  });
  return out;
}

async function openAiGenerateRecipes(system: string, user: string): Promise<MockRecipe[]> {
  const key = getOpenAiKey();
  if (!key) {
    throw new Error('No OpenAI API key');
  }
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: getChatModel(),
      temperature: 0.4,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const json = (await res.json()) as { error?: { message?: string }; choices?: Array<{ message?: { content?: string } }> };
  if (!res.ok) {
    throw new Error(json.error?.message ?? `OpenAI ${res.status}`);
  }
  const text = json.choices?.[0]?.message?.content?.trim() ?? '';
  if (!text) {
    throw new Error('Empty OpenAI response');
  }
  return parseRecipesPayload(extractJson(text));
}

async function geminiGenerateRecipes(system: string, user: string): Promise<MockRecipe[]> {
  const key = getGeminiKey();
  if (!key) {
    throw new Error('No Gemini API key');
  }
  const model = getGeminiModel();
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Gemini ${res.status}`);
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('')?.trim() ?? '';
  if (!text) {
    throw new Error('Empty Gemini response');
  }
  return parseRecipesPayload(extractJson(text));
}

/**
 * Generate up to 3 full recipes from profile + home filters + ingredients.
 * Tries OpenAI first, then Gemini. Returns [] if no keys or parsing yields nothing.
 */
export async function generateRecipesFromContext(
  pending: PendingRecipeSearch,
  profile: StoredProfile | null,
  opts?: { excludeRecipeTitles?: string[] },
): Promise<MockRecipe[]> {
  const system = buildSystemPrompt();
  const user = buildUserPrompt(profile, pending, opts);

  const pack = async (raw: MockRecipe[]): Promise<MockRecipe[]> => {
    const top = raw.slice(0, 3);
    if (top.length === 0) {
      return [];
    }
    return resolveRecipeHeroImages(top, { profile, pending });
  };

  if (getOpenAiKey()) {
    try {
      const r = await openAiGenerateRecipes(system, user);
      if (r.length > 0) {
        return await pack(r);
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[ai-recipe] OpenAI failed, trying Gemini if available:', e);
      }
    }
  }

  if (getGeminiKey()) {
    try {
      const r = await geminiGenerateRecipes(system, user);
      if (r.length > 0) {
        return await pack(r);
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[ai-recipe] Gemini failed:', e);
      }
    }
  }

  return [];
}
