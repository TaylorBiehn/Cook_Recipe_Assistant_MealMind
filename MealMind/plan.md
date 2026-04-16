# MealMind — Step-by-step implementation plan

Each step states **what I will do** and **which requirement it satisfies** (PRD §4.x / §5 / flow §6). Work proceeds in order unless a step is blocked by your answers in **Preconditions**.

**Approval:** **Step 1** is done. Later steps (e.g. Step 2 onward) proceed when you ask to implement them (or approve scope changes like this document).

---

## Preconditions (answer before or during early steps)

These unblock correct data shape and legal/UX behavior:

1. **Instruction grounding (PRD §4.3):** web search tool vs external recipe API vs hybrid — and confirm **source URLs** appear on recipe detail.
2. **Identity (PRD users / favorites):** anonymous device user vs sign-in from day one.
3. **Copy:** **Advanced** vs **Pro** for skill; product title vs “The Culinary Curator” subtitle.
4. **OpenAI:** model tier (latency/cost); keys **server-only** (PRD §5 secure API).

---

## Step 1 — Backend skeleton and configuration

**Do:** Add a Node **Express** app (e.g. `server/`), `GET /health`, centralized config from environment variables, `.env.example` (no secrets), consistent JSON error responses, basic request logging.

**Meets:** PRD §7 (Node backend), §5 (secure API handling — no keys in app).

---

## Step 2 — Database schema and migrations

**Design analysis (`Design/profile_settings/code.html`):** **Strict Dietary Mode** (vegetarian / pescatarian) is **Profile-only** in product UX; onboarding collects location, skill, cooking comfort, and flavors. The DB still stores dietary booleans for filtering.

**Do:** Create MySQL migrations for:

- **`users`:** `id`, **`skill_level`**, **`kitchen_comfort`**, `preferences` (JSON), `dislikes` (JSON), **`country_code`** (default **`WORLDWIDE`**), **`city`** (optional), **`vegetarian_focus`** / **`pescetarian_friendly`** (default **false**), timestamps; optional `auth_subject`. *(Initial migration + `002` rename/add columns.)*
- **`favorites`:** `id`, `user_id`, `recipe_data` (JSON blob with full card + detail fields).
- **`recipes` (optional cache):** `id`, `title`, `ingredients`, `steps`, `source_refs`, fingerprint/TTL if we cache suggestions.

**Meets:** PRD §8, design-backed §4.1 (country + dietary), `profile_settings` dietary section.

---

## Step 3 — API contract (types or OpenAPI)

**Do:** Define request/response shapes for:

- `GET/PUT /users/me` — `countryCode`, `city`, `skillLevel`, `kitchenComfort`, `preferences`, `dislikes`, optional `vegetarianFocus` / `pescetarianFriendly` (default false when omitted — profile dietary).
- `POST /recipes/suggest` — body: ingredients text, time, meal type, cooking style, plus server-stored profile (**include dietary flags and country** in ranking prompts); response: **2–3 recipes**, each with `title`, `cookingTime`, `difficulty`, `summary`, `ingredients[]`, `steps[]`, `tips`, `isBestChoice`, `sourceUrls[]`, optional `videoUrl`, `imageUrl`.
- `GET/POST/DELETE /favorites` — list and save/remove §4.6.

**Meets:** §4.1–4.6, §7 (app ↔ API boundary).

---

## Step 4 — Theme and design system in the Expo app

**Do:** Map `Design/harvest_hearth/DESIGN.md` to code: color tokens, radii, gradients (“Glow” CTA), load **Plus Jakarta Sans** + **Be Vietnam Pro** (`expo-font`). Add shared primitives: top bar, glow primary button, chip row, surface layers (no harsh borders per design).

**Meets:** PRD §5 (simple UI), design system fidelity.

---

## Step 5 — App navigation shell

**Do:** Replace template-only navigation with a structure that matches the flow: bottom tabs **Home · Favorites · Profile** (PRD §6), plus stack screens where needed (onboarding, results, detail, loading).

**Meets:** §6 user flow, design mocks’ tab pattern.

---

## Step 6 — Onboarding / registration (first-time preferences)

**Do:** One onboarding flow with **country + optional city**, **skill level** (Beginner / Intermediate / Advanced), **how you usually cook** (product “cooking level”: quick & simple / balanced / ambitious — stored as `kitchen_comfort`), **flavor profile** (multi-select taste tags; section titled **Flavor profile** in-app), and **ingredients to skip** (dislikes). **Default country:** Worldwide. **Vegetarian / pescatarian are not on onboarding** — they live on **Profile** only, with **default non-vegetarian** (both off until the user enables them). Persist locally (e.g. AsyncStorage) and sync `PUT /v1/users/me` when the API is wired; gate first launch with entry `app/index.tsx` → onboarding vs tabs.

**Meets:** §4.1, flow §6 “Set preferences (first time)”, updated product split (onboarding vs profile dietary).

---

## Step 7 — Home: ingredients and conditions

**Do:** Screen matching `home_screen`: headline “What should I cook today?”, large **text** ingredient input, parsed **chips** for ingredients, horizontal chips for **cooking time**, **meal type**, **cooking style** (PRD §4.2). Primary CTA **“Find My Meal”** submits to the suggest pipeline (stub client first, then real `POST`). **Mic / camera** buttons may be present as **disabled** or hidden until Step 16 if we ship text-first for §5 minimal permissions.

**Meets:** §4.2, §6 “Enter ingredients with conditions”.

---

## Step 8 — Loading state (“finding recipes”)

**Do:** Full-screen or modal route after submit: messaging like “Finding the best meals for you…”, indeterminate progress / shimmer aligned with `finding_recipes` mock. Navigate to results when the API returns (or on error, show retry).

**Meets:** §5 fast *perceived* response, flow between home and results.

---

## Step 9 — Recipe suggestion API + OpenAI integration

**Do:** Implement `POST /recipes/suggest`: validate input, merge user profile, call OpenAI with a **strict JSON schema** so the client always gets structured recipes. Implement the **grounding approach** you approved in Preconditions: attach `sourceUrls` (and optionally fetch snippets) so steps are tied to real references, not only free-form invention (PRD §4.3). Mark exactly one suggestion as **Best Choice** (`isBestChoice`) using explicit ranking rules in the prompt or post-processing (§4.4).

**Meets:** §4.3, §4.4, §7 OpenAI.

---

## Step 10 — Results screen (2–3 recipes + more)

**Do:** UI like `recipe_results_updated_flow`: **2–3** primary cards, prominent **“Best Choice”** badge on one, time and difficulty on cards, short rationale. Secondary actions: open detail, **“Load more”** or “Try different” placeholder that issues another request with offset/variation (§4.4 “more if needed”). Empty/error states.

**Meets:** §4.4, §6 “View 2–3 recipes and more if needed”.

---

## Step 11 — Recipe detail screen

**Do:** Hero image, title, time, servings (and optional kcal if we keep mock parity), full **ingredients** list, **numbered steps**, **tips** block (PRD §4.5). If `videoUrl` is present, show **video** section (thumbnail + open in `WebBrowser` or embedded player) (§4.3). **Share** affordance optional. Show **sources** list when `sourceUrls` exist (ties to §4.3 grounding).

**Meets:** §4.3, §4.5, §6 “View details”.

---

## Step 12 — Favorites

**Do:** Detail screen: **Save to favorites** → `POST /favorites` storing `recipe_data`. Favorites tab: list/grid from `GET /favorites`, tap opens same detail view (hydrate from JSON). Remove unfavorite if desired.

**Meets:** §4.6.

---

## Step 13 — Profile / settings

**Do:** Screen like `profile_settings`: **dietary toggles** (**Vegetarian focus**, **Pescatarian friendly**, default off) and summary of data from onboarding; link to **edit basics** (re-open onboarding). Save to `PUT /users/me` when API is live. Entry from tab; optional link from results “adjust preferences” card.

**Meets:** §4.1, flow maintenance after first launch, `profile_settings` dietary block.

---

## Step 14 — Optional empty / get-started screen

**Do:** If no ingredients yet, show `get_started_simplified`-style empty state with CTA to add ingredients (improves §6 first open).

**Meets:** §6, comfort for new users (problem statement).

---

## Step 15 — NFR hardening

**Do:** Server: rate limiting, body size limits, sanitize strings. Client: avoid blocking UI, reuse loading from Step 8, consider streaming/partial UI if API supports it. Keep images reasonably sized for **mid-range phones** (PRD §5).

**Meets:** §5 (fast, simple, secure, mid-range).

---

## Step 16 — Optional inputs (post-MVP unless you promote earlier)

**Do:** **Voice:** request microphone permission only when used, transcribe to text, append to ingredient field. **Image:** camera/photos permission, send image to server endpoint for ingredient inference or manual “add from photo” flow.

**Meets:** §4.2 optional methods; balance with §5 minimal permissions until user opts in.

---

## Step 17 — Tests and handoff

**Do:** API tests for `suggest`, `users`, `favorites` (happy path + validation errors). Document how to run app + server + MySQL locally in a short README section (only if you want repo docs updated).

**Meets:** Your rule: tests when behavior changes; stable handoff.

---

## Summary checklist (requirements coverage)

| PRD area | Steps |
|----------|--------|
| §4.1 Profile | 2, 3, 6, 13 |
| §4.2 Ingredients & conditions | 3, 7, 16 |
| §4.3 Generation + sources + video | 3, 9, 11 |
| §4.4 Recommendations | 3, 9, 10 |
| §4.5 Detail | 3, 11 |
| §4.6 Favorites | 2, 3, 12 |
| §5 NFRs | 1, 4, 8, 15, 16 (permissions) |
| §6 Flow | 5–8, 10–14 |

Execution follows **Step 1 → 17** in order; **Step 1** is complete. Later steps wait on you (and preconditions where noted, e.g. grounding before Step 9).
