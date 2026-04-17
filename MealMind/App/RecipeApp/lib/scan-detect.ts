import * as FileSystem from 'expo-file-system/legacy';

import { cloneDefaultScanIngredients, type ScanIngredientItem } from '@/lib/scan-mock-ingredients';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

/**
 * Strict vision prompt: reduces hallucinated staples (e.g. "cherry tomatoes" when not visible).
 */
const SCAN_PROMPT = `You are looking at ONE user photo of food storage or groceries: fridge interior, pantry shelves, counter, jars, produce, etc.

TASK: List ONLY ingredients you can justify as DIRECTLY VISIBLE in this exact image.

STRICT RULES:
- Do NOT add common foods that are not clearly visible (no guessing "onions" or "tomatoes" because they are typical).
- If you see leafy greens but cannot tell spinach vs lettuce, use a safe name like "Leafy greens" and say so in detail.
- For labeled jars/bottles/cartons: use the readable product type (e.g. "Chickpeas", "Orange juice") from the label when possible; if text is unreadable, use a neutral name like "Dry legumes in jar".
- For cut produce or packages: name what you see (e.g. "Salmon fillet", "Sliced mushrooms") not a different cut.
- Merge duplicates (same item twice in frame).
- Order roughly by how prominent/large the item is in the photo (most prominent first).
- Between 1 and 15 items. If the scene has no food, return {"ingredients":[]}.

OUTPUT: ONLY valid JSON, no markdown, no backticks, no extra text:
{"ingredients":[{"name":"string","detail":"string"}]}

For "detail": short factual line — category • what you see (e.g. "Produce • green leaves in crisper", "Beverage • carton visible"). Never invent quantities you cannot see.`;

class GeminiScanError extends Error {
  constructor(
    readonly httpStatus: number,
    message: string,
  ) {
    super(message);
    this.name = 'GeminiScanError';
  }
}

class OpenAiScanError extends Error {
  constructor(
    readonly httpStatus: number,
    message: string,
  ) {
    super(message);
    this.name = 'OpenAiScanError';
  }
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Short, toast-friendly messages; avoids dumping long Google URLs. */
function mapGeminiFailure(status: number, rawMessage: string): GeminiScanError {
  const m = rawMessage.trim();
  const low = m.toLowerCase();
  const looksRateLimited =
    status === 429 ||
    low.includes('resource exhausted') ||
    low.includes('quota') ||
    low.includes('rate limit');

  if (looksRateLimited) {
    return new GeminiScanError(
      429,
      'Gemini hit your rate or usage limit (common on the free tier). Wait a few minutes, scan less often, or turn on billing in Google AI Studio. Check usage under your API key project.',
    );
  }
  if (status === 400) {
    const short = m.length > 180 ? `${m.slice(0, 180)}…` : m;
    return new GeminiScanError(400, short || 'The request was not accepted (400). Check model name and API version.');
  }
  if (status === 401 || status === 403) {
    return new GeminiScanError(
      status,
      'API key was rejected. Confirm EXPO_PUBLIC_GEMINI_API_KEY, restart Expo, and enable the Generative Language API for that Google Cloud project.',
    );
  }
  if (status >= 500) {
    return new GeminiScanError(status, 'Gemini servers are busy. Try again in a moment.');
  }
  const short = m.length > 220 ? `${m.slice(0, 220)}…` : m;
  return new GeminiScanError(status, short || `Request failed (${status}).`);
}

function mapOpenAiFailure(status: number, rawMessage: string): OpenAiScanError {
  const m = rawMessage.trim();
  const low = m.toLowerCase();
  const looksRateLimited =
    status === 429 || low.includes('rate limit') || low.includes('too many requests');

  if (looksRateLimited) {
    return new OpenAiScanError(
      429,
      'OpenAI rate or usage limit reached. Wait a few minutes, try a cheaper model (gpt-4o-mini), or check billing at platform.openai.com.',
    );
  }
  if (status === 401) {
    return new OpenAiScanError(401, 'OpenAI API key was rejected. Check EXPO_PUBLIC_OPENAI_API_KEY and restart Expo.');
  }
  if (status === 403) {
    return new OpenAiScanError(403, 'OpenAI denied this request (403). Confirm the key has vision access and billing if required.');
  }
  if (status === 400) {
    const short = m.length > 180 ? `${m.slice(0, 180)}…` : m;
    return new OpenAiScanError(400, short || 'OpenAI rejected the request (400). Check EXPO_PUBLIC_OPENAI_VISION_MODEL.');
  }
  if (status >= 500) {
    return new OpenAiScanError(status, 'OpenAI is temporarily unavailable. Try again shortly.');
  }
  const short = m.length > 220 ? `${m.slice(0, 220)}…` : m;
  return new OpenAiScanError(status, short || `OpenAI request failed (${status}).`);
}

type GeminiPart = { text?: string };
type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
    safetyRatings?: unknown;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

function getGeminiApiKey(): string | undefined {
  const k = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  return k || undefined;
}

function getGeminiModel(): string {
  return process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_OPENAI_VISION_MODEL = 'gpt-4o-mini';

function getOpenAiApiKey(): string | undefined {
  const k = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  return k || undefined;
}

function getOpenAiVisionModel(): string {
  return process.env.EXPO_PUBLIC_OPENAI_VISION_MODEL?.trim() || DEFAULT_OPENAI_VISION_MODEL;
}

type ScanProvider = 'openai' | 'gemini';

/** Order of providers to try. OpenAI first when both keys exist unless `EXPO_PUBLIC_INGREDIENT_SCAN_PROVIDER=gemini_first`. */
function getProviderChain(): ScanProvider[] {
  const hasO = Boolean(getOpenAiApiKey());
  const hasG = Boolean(getGeminiApiKey());
  const raw = process.env.EXPO_PUBLIC_INGREDIENT_SCAN_PROVIDER?.trim().toLowerCase() ?? '';

  if (raw === 'openai') {
    return hasO ? ['openai'] : hasG ? ['gemini'] : [];
  }
  if (raw === 'gemini') {
    return hasG ? ['gemini'] : hasO ? ['openai'] : [];
  }
  if (raw === 'gemini_first') {
    const c: ScanProvider[] = [];
    if (hasG) {
      c.push('gemini');
    }
    if (hasO) {
      c.push('openai');
    }
    return c;
  }
  const c: ScanProvider[] = [];
  if (hasO) {
    c.push('openai');
  }
  if (hasG) {
    c.push('gemini');
  }
  return c;
}

function isProviderFallbackWorthy(e: unknown): boolean {
  if (e instanceof GeminiScanError && (e.httpStatus === 429 || e.httpStatus >= 500)) {
    return true;
  }
  if (e instanceof OpenAiScanError && (e.httpStatus === 429 || e.httpStatus >= 500)) {
    return true;
  }
  return false;
}

function guessMimeType(uri: string): string {
  const lower = uri.split('?')[0]?.toLowerCase() ?? '';
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lower.endsWith('.gif')) {
    return 'image/gif';
  }
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
    return 'image/heic';
  }
  return 'image/jpeg';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image blob'));
    reader.onloadend = () => {
      const s = reader.result;
      if (typeof s !== 'string') {
        reject(new Error('Unexpected FileReader result'));
        return;
      }
      const comma = s.indexOf(',');
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    reader.readAsDataURL(blob);
  });
}

async function imageUriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  const trimmed = uri.trim();

  if (trimmed.startsWith('data:')) {
    const m = /^data:([^;,]+)[^,]*;base64,(.+)$/i.exec(trimmed);
    if (!m) {
      throw new Error('Unsupported data URI (expected base64)');
    }
    return { mimeType: m[1].trim(), base64: m[2].replace(/\s/g, '') };
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) {
    const res = await fetch(trimmed);
    if (!res.ok) {
      throw new Error(`Failed to fetch image (${res.status})`);
    }
    const blob = await res.blob();
    const mimeType = blob.type && blob.type.length > 0 ? blob.type : guessMimeType(trimmed);
    const base64 = await blobToBase64(blob);
    return { base64, mimeType };
  }

  const base64 = await FileSystem.readAsStringAsync(trimmed, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { base64, mimeType: guessMimeType(trimmed) };
}

function extractJsonObject(text: string): unknown {
  const t = text.trim();
  try {
    return JSON.parse(t) as unknown;
  } catch {
    /* fall through — model sometimes wraps JSON */
  }
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  const raw = (fence ? fence[1] : t).trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) {
    throw new Error('No JSON object in model response');
  }
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

function normalizeIngredients(parsed: unknown): Array<{ name: string; detail: string }> {
  if (!parsed || typeof parsed !== 'object' || !('ingredients' in parsed)) {
    return [];
  }
  const { ingredients } = parsed as { ingredients?: unknown };
  if (!Array.isArray(ingredients)) {
    return [];
  }
  const out: Array<{ name: string; detail: string }> = [];
  for (const row of ingredients) {
    if (!row || typeof row !== 'object') {
      continue;
    }
    const name = 'name' in row && typeof row.name === 'string' ? row.name.trim() : '';
    if (!name) {
      continue;
    }
    const detailRaw = 'detail' in row && typeof row.detail === 'string' ? row.detail.trim() : '';
    out.push({ name, detail: detailRaw || 'Pantry' });
  }
  return out;
}

async function geminiScanImage(
  apiKey: string,
  model: string,
  base64: string,
  mimeType: string,
): Promise<string> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [
      {
        parts: [{ text: SCAN_PROMPT }, { inline_data: { mime_type: mimeType, data: base64 } }],
      },
    ],
    generationConfig: {
      temperature: 0.15,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          ingredients: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                detail: { type: 'STRING' },
              },
              required: ['name', 'detail'],
            },
          },
        },
        required: ['ingredients'],
      },
    },
  };

  const runOnce = async (): Promise<string> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as GeminiResponse;
    if (!res.ok) {
      const raw = json.error?.message ?? JSON.stringify(json).slice(0, 400);
      throw mapGeminiFailure(res.status, raw);
    }

    if (json.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the image (${json.promptFeedback.blockReason}). Try another photo.`);
    }

    const candidate = json.candidates?.[0];
    if (!candidate) {
      throw new Error('Gemini returned no candidates. The image may have been blocked by safety filters.');
    }
    if (candidate.finishReason === 'SAFETY') {
      throw new Error('This image could not be scanned for safety reasons. Try a different photo.');
    }

    const text =
      candidate.content?.parts?.map((p) => p.text).join('')?.trim() ?? '';
    if (!text) {
      throw new Error('Gemini returned empty text');
    }
    return text;
  };

  try {
    return await runOnce();
  } catch (e) {
    if (e instanceof GeminiScanError && e.httpStatus === 429) {
      await sleepMs(4000);
      return await runOnce();
    }
    throw e;
  }
}

type OpenAiChatResponse = {
  error?: { message?: string };
  choices?: Array<{ message?: { content?: string | null } }>;
};

async function openaiScanImage(
  apiKey: string,
  model: string,
  base64: string,
  mimeType: string,
): Promise<string> {
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const userText = `${SCAN_PROMPT}\n\nReturn only a JSON object with key "ingredients" (array of {name, detail}). No markdown.`;

  const body = {
    model,
    temperature: 0.15,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          {
            type: 'image_url',
            image_url: { url: dataUrl, detail: 'low' },
          },
        ],
      },
    ],
  };

  const runOnce = async (): Promise<string> => {
    const res = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as OpenAiChatResponse;
    if (!res.ok) {
      const raw = json.error?.message ?? JSON.stringify(json).slice(0, 400);
      throw mapOpenAiFailure(res.status, raw);
    }

    const text = json.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) {
      throw new Error('OpenAI returned empty content');
    }
    return text;
  };

  try {
    return await runOnce();
  } catch (e) {
    if (e instanceof OpenAiScanError && e.httpStatus === 429) {
      await sleepMs(4000);
      return await runOnce();
    }
    throw e;
  }
}

function runDetectFromModelResponse(rawText: string, localImageUri: string): ScanIngredientItem[] {
  const parsed = extractJsonObject(rawText);
  const rows = normalizeIngredients(parsed);
  const stamp = Date.now();

  if (rows.length === 0) {
    throw new Error(
      'No ingredients were recognized in this photo. Try a brighter, closer shot of the food, or add items manually.',
    );
  }

  return rows.map((row, i) => ({
    id: `det-${stamp}-${i}`,
    name: row.name,
    detail: row.detail,
    imageUri: localImageUri,
  }));
}

async function mockDetect(localImageUri: string): Promise<ScanIngredientItem[]> {
  const stamp = Date.now();
  return cloneDefaultScanIngredients().map((row, i) => ({
    ...row,
    id: `det-${stamp}-${i}`,
    imageUri: localImageUri,
  }));
}

/** True when a Gemini key is set. */
export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

/** True when either OpenAI or Gemini is configured for vision scan. */
export function isVisionScanConfigured(): boolean {
  return Boolean(getOpenAiApiKey() || getGeminiApiKey());
}

/**
 * Reads the image, calls OpenAI and/or Gemini vision (see `EXPO_PUBLIC_INGREDIENT_SCAN_PROVIDER`),
 * maps rows to `ScanIngredientItem` (thumbnails = full source photo).
 *
 * - **No API keys:** demo template ingredients.
 * - **With keys:** tries providers in order; on 429/5xx from one provider, falls back to the other if configured.
 */
export async function detectIngredientsFromImage(localImageUri: string): Promise<ScanIngredientItem[]> {
  const chain = getProviderChain();
  if (chain.length === 0) {
    if (__DEV__) {
      console.warn(
        '[scan-detect] No EXPO_PUBLIC_OPENAI_API_KEY or EXPO_PUBLIC_GEMINI_API_KEY — using demo ingredients.',
      );
    }
    return mockDetect(localImageUri);
  }

  const { base64, mimeType } = await imageUriToBase64(localImageUri);
  let lastError: unknown;

  for (let i = 0; i < chain.length; i++) {
    const provider = chain[i];
    try {
      if (provider === 'openai') {
        const key = getOpenAiApiKey();
        if (!key) {
          continue;
        }
        const rawText = await openaiScanImage(key, getOpenAiVisionModel(), base64, mimeType);
        return runDetectFromModelResponse(rawText, localImageUri);
      }
      if (provider === 'gemini') {
        const key = getGeminiApiKey();
        if (!key) {
          continue;
        }
        const rawText = await geminiScanImage(key, getGeminiModel(), base64, mimeType);
        return runDetectFromModelResponse(rawText, localImageUri);
      }
    } catch (e) {
      lastError = e;
      const hasNext = i < chain.length - 1;
      if (hasNext && isProviderFallbackWorthy(e)) {
        if (__DEV__) {
          console.warn(`[scan-detect] ${provider} scan failed; trying fallback provider:`, e);
        }
        continue;
      }
      throw e;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Ingredient scan failed.');
}
