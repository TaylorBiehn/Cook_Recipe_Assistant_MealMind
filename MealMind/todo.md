# MealMind UI/UX Polish — Next Steps

**Status:** Awaiting user confirmation step-by-step. No code changes will be made until each step is approved.
**Owner:** Pending
**Last updated:** 2026-04-28

> Workflow: each numbered section below is a single, self-contained change. After you approve a step, I implement only that step, run lint/typecheck, and report back. Then we move to the next.

---

## Step 1 — Home / Add Ingredients screen polish

**File:** `App/RecipeApp/app/(tabs)/index.tsx`

What changes:
- Center-align the hero text, currently left-aligned:
  - `headline` "What should we cook today?" → centered
  - `subhead` "Add ingredients and we’ll pick meals your family will love." → centered (so it visually pairs with the headline)
  - The styles to update live in the `hero` block (around the `headline` / `subhead` style rules).
- After the "Recent Ingredients" section (i.e. the `historySection`), insert a new "health-with-food" hero/banner block in place of (or above) the current `recommendWrap` "CHEF'S PICK" tile.
  - Visual: rounded card with a hero image + short tagline like "Eat well. Cook smart." (final copy TBD).
  - Image source: I do not have a usable bundled asset for this. **Decision needed**:
    - (a) Reuse one of the existing remote `aida-public` URLs already used elsewhere (no new asset).
    - (b) Use a clean Material/SVG illustration rendered in-app (no external image).
    - (c) You drop a PNG/SVG into `App/RecipeApp/assets/images/` and tell me the filename.
  - Default plan: (b) — render an in-app illustration so the screen ships clean without depending on a remote URL. Easy to swap later.
- Move the "Find My Meal" floating CTA closer to the footer:
  - Today: `fabBottom = max(tabBarHeight, 52) + MealMindSpace.md` → reduce vertical inset so the button sits ~`MealMindSpace.sm` above the tab bar.
  - Add a small bottom `paddingBottom` reduction on `scrollContent` so the new "health-with-food" block is fully reachable.

Trade-offs:
- Centering the headline subtly changes the visual rhythm of the page. If you prefer headline centered but subhead left-aligned, say so.
- Image option (b) keeps the codebase free of new image dependencies; (c) gives the prettiest result if you have a 3D render handy.

**Acceptance check:** headline centered, new health/food block sits between "Recent Ingredients" and the CTA, "Find My Meal" hugs the footer.

---

## Step 2 — Loading screen recipe-fetch image refresh

**File:** `App/RecipeApp/app/loading.tsx`

What changes:
- Replace the current `HERO_IMG` URL (a remote `aida-public` photo) with a clean, simple food-themed illustration.
- Same image-source decision as Step 1:
  - (a) different remote 3D-render URL,
  - (b) in-app illustration (Material icon stack on a pastel circle, animated float — same `floatY` animation reused),
  - (c) you drop a 3D render (PNG/SVG) into `App/RecipeApp/assets/images/`.
- Default plan: (b). It removes the external image, animates cleanly, and matches the "clear and clean" brief.
- Keep the rest of the screen intact (progress bar, copy, layout).

**Acceptance check:** loading screen shows a tasteful, on-brand food illustration; no broken/heavy remote photo.

---

## Step 3 — Results screen tidy-up

**File:** `App/RecipeApp/app/results.tsx`

What changes:

1. Remove the "Best Choice for breakfast" pill on the featured (first) result.
   - Today this is rendered via the `bestPill` element using `bestPickPillText(...)`.
   - Plan: delete the pill and the helper `bestPickPillText`. The hero image itself becomes the badge-free header.

2. Move kcal / meal-type / cooking-style meta from below the image to inside the bottom of the picture (overlay).
   - Refactor `heroCard` so `heroImageWrap` becomes a relative container; absolute-position the existing `heroMetaRow`/`AiRecipeMetaRow` over the bottom of the image with a dark `LinearGradient` for legibility (matches the gradient already used on the recipe detail screen).
   - Title remains under the image OR is overlaid too — your call. Default plan: overlay title + meta on the image, drop the separate `heroTextCol` block underneath. Saves vertical space and matches your "make it shorter" intent.

3. Make the title a single line if possible.
   - Add `numberOfLines={1}` to `heroTitle` and `sideTitle`. They'll truncate with ellipsis if too long; long generated titles are rare but I'll verify a couple from `mealmind-recipe-mocks` to confirm they fit.

4. Reorder + expand the "Explore More Categories" footer:
   - Today: `[Load More]` button → "Explore More Categories" title → 4 chips.
   - Plan: "Explore More Categories" title → 6 chips → `[Load More]` button.
   - Expand to 6 chips. Proposed list: `Fast Food`, `Snacks`, `Desserts`, `Healthy Bites`, `Breakfast`, `Drinks`. (Easy to swap labels.)
   - Chips remain visual-only for now (no new routing). They can be wired to filters later.

Trade-offs:
- Overlaying meta on the image is more compact and modern but reduces contrast on bright photos. The dark gradient mitigates this.
- Truncating the title to one line risks losing information for unusually long generated names. Compromise: `numberOfLines={1}` plus `ellipsizeMode="tail"`.

**Acceptance check:** no "Best Choice…" pill, meta sits inside the image bottom, title fits one line, footer order = title → 6 chips → Load More.

---

## Step 4 — Recipe Detail "Save to Favorites" sticky icon

**File:** `App/RecipeApp/app/recipe/[id].tsx`

What changes:
- Replace the wide `GlowButton` "Save to Favorites" with a right-anchored circular heart **floating action button (FAB)** that lives inside the existing `bottomBar` slot (so vertical position is unchanged).
  - Default state: 56×56 pill, heart icon only.
  - Web/desktop: on `onHoverIn` it expands to a pill with the text "Save to Favorites" (icon + label); on `onHoverOut` it collapses back to icon-only.
  - Native (iOS/Android, no hover): icon-only at rest. Tapping toggles favorite directly (existing `onToggleFavorite`). After saving, the icon switches to a filled heart and a toast confirms (already implemented). For affordance on touch, we briefly animate the label in for ~1.2s on first save.
- Remove the timer button (`timerBtn`) entirely.
- The bottom bar now becomes a flex-end row, leaving the heart hugging the right edge with the existing safe-area padding.

Trade-offs:
- React Native does not have CSS hover; `Pressable`'s `onHoverIn/onHoverOut` work via react-native-web on the web target, but native devices won't get hover behavior. The plan above degrades gracefully on native (icon-only + tap-to-save with brief label hint). Tell me if you want to drop the brief native label hint and stay icon-only on native.
- Some users like a visible "Save to Favorites" label on touch screens. If you want the label always visible on native (just icon-only on web hover collapse), we can flip the logic.

**Acceptance check:** sticky right-edge heart icon; expands to "Save to Favorites" on hover (web); no timer button; tapping still adds/removes a favorite.

---

## Step 5 — Favorites tab UI refresh

**File:** `App/RecipeApp/app/(tabs)/favorites.tsx`

What changes:

1. Filter chips ("All Favorites", "Breakfast", "Lunch", …) restyled to feel less rigid:
   - Switch from rectangular `borderRadius: MealMindRadii.md` to fully rounded pills (`MealMindRadii.full`).
   - Inactive chip: outline pill on `surface` (subtle border, body weight text).
   - Active chip: solid `primary` fill with `onPrimary` text and the existing soft glow shadow.
   - Adjust padding for taller, fingerprint-friendly hit area (~36px min height).

2. Make each saved-recipe card shorter by overlaying title and meta on the image:
   - **Featured card** (first item): keep the `aspectRatio: 16/9` image; remove the separate `featuredBody` block; absolute-position title, blurb, and badge row over the bottom of the image with a dark gradient (mirror the recipe detail hero treatment).
   - **Compact cards**: change from "square image + body below" to "16:9 image with title overlay" so each card occupies roughly 60–70% of its current vertical space.
   - Heart-remove FAB stays in the top-right of each image (existing pattern).

Trade-offs:
- Overlay text gives a much shorter, magazine-style card but reduces accessibility for very small text on bright photos. Plan mitigates with a `LinearGradient` shadow and a bold title weight.
- If you'd rather keep title under the image but just shorten the image height, we can drop the aspect ratio to 5:3 and shrink padding instead. Pick which you prefer when this step starts.

**Acceptance check:** filter chips read as friendly pills (active = orange, inactive = soft outline); each card is visibly shorter and reads as one image-led block.

---

## Step 6 — Profile page redesign (research-driven)

**Files:**
- `App/RecipeApp/app/(tabs)/profile.tsx` (rewrite the layout)
- `App/RecipeApp/components/mealmind/onboarding-profile-summary.tsx` (kept; consumed)

Research summary (what already exists in the app, so we don't invent):
- `lib/profile-storage.ts` already stores: country, city, skill level, kitchen comfort, dietary preference, cuisines, allergies, avoid foods, cooking experience, kitchen equipment, cooking schedule, flavor profile, spice level, calorie focus, vegetarian focus, pescetarian friendly, plus onboarding completion flags.
- `OnboardingProfileSummary` already renders all 12 onboarding answers as cards.
- `signOutMealMind` clears local + onboarding state (and after the recent fix, also favorites/recent ingredients).
- Supabase auth provides email + user id; we already have `fetchMealMindProfile` / `upsertMealMindProfile` for sync.
- `dev-reset.ts` exists for full local wipe.

Proposed redesigned layout (top → bottom):

1. **Identity header card**
   - Avatar (existing remote URI placeholder for now), display name (Supabase email local-part), email, and a subtle "Member since …" line from `created_at` if available.
   - Right-side small "Edit" pill that opens the intro wizard for re-onboarding (`/intro`).

2. **At-a-glance chips** (compact pill row, scrollable)
   - Country • Skill level • Kitchen comfort • Dietary preference • Spice level
   - Sourced directly from `StoredProfile`. Tapping a chip jumps to that step in the intro wizard later (out of scope for this pass — chips visual-only first).

3. **Taste & Diet preferences card** (kept from current screen)
   - Spiciness / Sweetness / Umami meters from existing logic.
   - Toggle list: Vegetarian Focus, Pescetarian Friendly (already wired to `patchProfile`).
   - "Fine Tune" button → opens intro wizard step 10 (flavor profile). Visual placeholder until step routing lands.

4. **Onboarding answers** (collapsible)
   - Wrap the existing `OnboardingProfileSummary` block in a collapsible "Your onboarding answers" section so it doesn't dominate the page on first paint, but stays one tap away.

5. **Account & Data**
   - "Sign out" button (existing).
   - "Reset onboarding" → re-runs `/intro`. This is a real flow we already support; surface it from the profile page instead of dev-only.
   - "Reset app & sign out (dev)" link kept under a `__DEV__` guard so it never ships in release builds.

6. **App info footer**
   - App version (read from `expo-constants`), small "MealMind" logo / tagline.

Open questions:
- Do you want the onboarding-answers section collapsed by default or expanded?
- Is "Reset onboarding" a feature you want to expose to all users or keep dev-only? (Default plan: expose to all.)
- Do you want photo upload for the avatar, or stick with a static placeholder for now? (Default plan: static placeholder; avatar upload is a later milestone.)

**Acceptance check:** profile page reads as a structured, modern dashboard (identity → at-a-glance → preferences → onboarding answers (collapsible) → account → app info) with no broken flows; existing toggles still persist to Supabase.

---

## Working agreement

- I will not start any step until you confirm.
- For each step I'll: read the affected files again, make the smallest diff, run `npm run lint` (and tests where applicable), and report back with the exact files I touched.
- If a step uncovers a hidden coupling I didn't anticipate, I'll stop and surface the trade-off before continuing.

---

## Previously completed (for reference)

### Onboarding flow simplification — DONE (2026-04-24)
- Removed "Any food allergies" and "Kitchen equipment" steps; added "Setting things up for you" progress experience.

### Earlier home / loading / nav / favorites work — DONE (2026-04-24)
- "What should we cook today?" copy + ingredient form refresh.
- Loading screen progress bar redesign.
- `MealMindTabBar` orange-pill active state across Home/Favorites/Profile + Results/Recipe.
- Favorites local CRUD via AsyncStorage; toast feedback; meal-type filter chips.

### Cross-account leakage fix — DONE (2026-04-28)
- Server scoped ingredient history by bearer-token `sub`.
- Device-local caches (favorites, recent ingredients, last generated recipes) cleared on account switch and sign-out.
- Browse tab and `lib/browse-foods-data.ts` removed.
