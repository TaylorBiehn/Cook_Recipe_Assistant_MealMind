# MealMind — Research Notes

Research date: 2026-04-12. Sources: project description (user-provided), `Design/harvest_hearth/DESIGN.md`, HTML mocks under `Design/*/code.html`, and `App/RecipeApp/package.json`.

---

## 1. Product thesis (expanded)

**MealMind** (Smart Family Recipe Assistant) is a *decision-support* cooking app, not an infinite recipe browser. The core job is to collapse choice overload into **2–3 high-confidence suggestions** (with optional “more” / alternate types), grounded in **what the user has**, **how they cook**, **what they avoid**, **how much time they have**, and **cultural context**.

**Primary jobs-to-be-done**

| User situation | Job |
|----------------|-----|
| Daily “what’s for dinner?” | Pick something feasible tonight without scrolling |
| Pantry mismatch | Turn available ingredients into a coherent meal |
| Skill / time anxiety | Match complexity and duration to reality |
| Family constraints | Respect dislikes, health tilt, regional taste |

**Secondary jobs**

- Save winners for repeat use (favorites).
- Revisit and adjust profile as tastes or household change.

**Differentiation (from spec + design)**

- **Curation over catalogs**: “Best Choice” style framing, editorial copy, small result set.
- **Comfortable input**: large ingredient area, chips, optional mic/camera (design shows affordances even if v1 is text-only).
- **Trust layer (spec)**: steps should lean on **searchable / attributable sources** rather than purely invented prose; optional **video** when available.

---

## 2. Requirements traceability (PRD → concrete behavior)

| PRD area | Implied product behavior | Design evidence |
|----------|-------------------------|-----------------|
| Profile: cooking level | Single-select among Beginner / Intermediate / Advanced (PRD); chips in onboarding | `registration_with_skill_level`: Beginner / Intermediate / **Pro** (copy mismatch vs PRD “Advanced”) |
| Profile: taste | Multi-select tags (spicy, sweet, healthy, …) | Registration: spicy, sweet, healthy, savory, tangy |
| Profile: dislikes | Free-form + suggested chips, removable | Registration: oily food, cilantro, mushrooms + “Add ingredient” |
| Profile: culture | Country / region influences suggestions | Registration: dropdown (US, IT, MX, …); profile “Cultural roots” |
| Ingredient input | Text primary; voice/image optional | Home: textarea + mic + camera FABs; ingredient chips |
| Conditions | Time bands, meal type, cooking style | Home: 10/20/30/45+ min; Breakfast/Lunch/Dinner/Snacks; Quick/Family/Budget/Healthy |
| Generation | OpenAI-backed; structured recipe objects | Architecture in PRD (no UI mock for API) |
| Instructions source | “Search resources, not generate by AI itself” | Detail screen shows steps as editorial blocks; **implementation** must define grounding (web search API, partner feed, or hybrid) |
| Video | Show when available | `recipe_detail_with_video`: thumbnail, play, duration |
| Recommendations | 2–3 cards + “Best” highlight | Results: bento layout, “⭐ Best Choice for Tonight”, alternates, “Load more” |
| Favorites | Persist list | `my_favorites`: grid + compact rows; detail: “Save to Favorites” |
| NFR: speed | &lt; ~3s perceived | Needs streaming UI, skeletons, edge caching; `finding_recipes` loading state |
| NFR: simple UI / mid-range | Light motion, avoid heavy stacks | Design system emphasizes tonal surfaces, blur sparingly |

**Terminology alignment to fix during build**

- PRD **Advanced** vs design **Pro** → pick one label in app copy and API enums.
- Brand strings: **“Smart Family Recipe Assistant”** vs **“The Culinary Curator”** (profile header) → decide single marketing name + optional subtitle.

---

## 3. Design system analysis (`Design/harvest_hearth/DESIGN.md`)

**Creative direction:** “The Culinary Curator” — editorial, warm, asymmetric, low digital noise for busy parents.

**Color & surfaces (token-led, Material-adjacent)**

- Base `surface` **#fef8f5**; cards `surface-container-lowest` **#ffffff**; nested sections `surface-container-low` **#f8f2f0**.
- Primary **#8f4e00**, primary container **#ff9f43**; secondary container **#d7e5bb** for chips/badges.
- **No-line rule:** avoid hard borders between sections; use background tier shifts.
- **Primary CTA:** 135° gradient **#8f4e00 → #ff9f43** (“Glow”).

**Typography**

- **Plus Jakarta Sans:** display / headlines (tight tracking, ~`-0.02em`).
- **Be Vietnam Pro:** body, labels, ingredients.

**Components (implementation hints)**

- Pills / chips: `secondary-container`, large radius (`xl` / `3rem` for hero CTAs, `lg` / `2rem` for cards).
- Recipe cards: `lg` radius, no stroke, soft ambient shadow only when floating (`on_surface` @ 6%, blur 40, y 12).
- Inputs: fill `surface-container-high`, no border; focus → lighter fill + faint primary ring (~20% opacity).
- “Kitchen mode” step: tertiary-tinted active step (see detail mock — left accent border + highlighted block).

**Iconography**

- HTML mocks use **Material Symbols Outlined**; Expo app can mirror with `@expo/vector-icons/MaterialIcons` or loaded Material Symbols if you want pixel parity.

**Motion**

- Loading screen: float + shimmer progress — good reference for **perceived performance** during AI calls.

---

## 4. Screen & flow inventory (from HTML mocks)

| Asset path | Role in flow |
|------------|----------------|
| `get_started_simplified/code.html` | Empty state: hero art, “Add ingredients”, “Browse popular recipes”; bottom tabs |
| `registration_with_skill_level/code.html` | Onboarding: culture, skill, tastes, dislikes; progress + **Next** |
| `home_screen/code.html` | Main hub: “What should I cook today?”, ingredient textarea, mic/camera, chips, time/meal/style horizontals, “Suggested for you”, **Find My Meal** FAB-style CTA, tabs |
| `finding_recipes.../code.html` | Interstitial: “Finding the best meals for you…”, progress |
| `recipe_results_updated_flow/code.html` | Results: “Best Picks for You”, hero “Best Choice”, 2 secondary cards, load more, “Not feeling these?” → adjust preferences |
| `recipe_detail_with_video/code.html` | Detail: hero image, glass meta card (tags, time, servings, kcal), **video** block, ingredients with amounts, numbered steps (active step styling), macros row, save + timer |
| `my_favorites/code.html` | Favorites hub: filter chips, asymmetric grid |
| `profile_settings/code.html` | “Your Palate Profile”: bento cards (country, skill, tastes, dislikes, dietary, notifications) |

**Navigation pattern implied**

Bottom tabs: **Home · Favorites · Profile** (with occasional active-state swap in mocks — normalize in implementation).

---

## 5. Technical landscape (repo today)

- **Frontend:** `App/RecipeApp` — Expo SDK **~54**, React **19**, React Native **0.81**, **expo-router** file-based routing. Dependencies today are mostly template-level (tabs, fonts, image, haptics). **No** backend, OpenAI, audio, camera pipeline, or MySQL client yet.
- **Backend / DB / AI:** Described in PRD only; not present at repo root in this snapshot.

This implies greenfield work for API layer, persistence, secrets management, and AI orchestration.

---

## 6. Architecture implications (PRD stack)

**Suggested logical architecture (to validate in implementation)**

1. **Expo app** → HTTPS → **Node (Express)** API.
2. API holds **OpenAI** key; app never embeds the key (NFR: secure API handling).
3. **MySQL** for `users`, `favorites`, optional `recipes` cache — align JSON columns (`preferences`, `recipe_data`) with actual query patterns.

**Recipe “grounding” options (spec: search resources)**

| Approach | Pros | Cons |
|----------|------|------|
| OpenAI Responses + **web_search** tool (if available on chosen model path) | Single vendor, citations possible | Cost, policy constraints, latency |
| Dedicated recipe **HTTP API** + LLM for ranking/trimming | Structured data, licensing clearer | Integration work, maybe paywalled |
| LLM proposes titles only → server **web search** / scrape summaries | Strong separation | Scraping legal/fragility issues |

**Latency (&lt;3s)**

- First paint: optimistic UI + `finding_recipes`-style skeleton.
- Streaming partial JSON for recipe cards if API supports it.
- Cache repeated ingredient+profile queries in `recipes` table with TTL.

**Permissions (minimal)**

- Text-only v1: network only.
- Voice: microphone; image: camera/photos — defer to phase 2 unless required day one.

---

## 7. Data model sketch (from PRD, refined)

**`users`**

- `id` (PK)
- `cooking_level` (enum)
- `preferences` (JSON array of tags or normalized join table — JSON OK for MVP)
- `dislikes` (JSON array of strings or join)
- `culture` / `country_code` (string; index if you filter server-side)
- Consider: `created_at`, `updated_at`, optional `auth_subject` if using OAuth

**`favorites`**

- `id`, `user_id` (FK), `recipe_data` (JSON: title, image URL, ingredients, steps, source URLs, video URL, timestamps)
- Unique constraint `(user_id, recipe_slug_or_hash)` if deduplication needed

**`recipes` (optional cache)**

- `id`, `title`, `ingredients` (JSON), `steps` (JSON), `source_urls` (JSON), `generated_for_hash` or query fingerprint, `expires_at`

---

## 8. Risks & open questions

1. **Auth model:** anonymous device ID vs email/OAuth — affects `users` and favorites sync.
2. **Instruction grounding:** legal/safety — need explicit source URLs displayed in UI to match PRD trust goals.
3. **Video:** YouTube/Data API vs curated links returned from search — quota and ToS.
4. **“Pro” vs “Advanced”** and dual naming (“Culibrator” vs full product name).
5. **Offline:** not in PRD; assume online-first.

---

## 9. Summary

The **PRD** and **Design** folder are strongly aligned on user flow (onboard → home conditions → find → results with best pick → detail with optional video → favorites → profile). The **design system** is implementation-ready (tokens, type, components). The **largest technical design work** before coding is the **recipe generation + sourcing pipeline** so instructions are not pure hallucination, plus **auth** and **API contract** between Expo and Express.
