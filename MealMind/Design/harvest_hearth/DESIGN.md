# Design System Strategy: The Culinary Curator

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Culinary Curator."** We are moving away from the "utility-first" look of standard cooking apps to create an editorial, high-end experience that feels like a premium lifestyle magazine brought to life. 

The goal is to eliminate "digital noise" for busy parents. We achieve this through **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid, center-aligned grids, we use generous white space and overlapping elements (e.g., a dish image breaking the boundary of a container) to create a sense of organic movement. The interface should feel like a soft, tactile kitchen counter—not a spreadsheet.

---

## 2. Colors & Surface Architecture
Our palette transitions from the warmth of a morning kitchen into a professional, clean workspace. 

### The "No-Line" Rule
**Borders are strictly prohibited for sectioning.** To define boundaries, use background shifts. A recipe card does not have a stroke; it sits as a `surface-container-lowest` element on a `surface` background. This creates a "soft-edge" UI that reduces cognitive load and feels more premium.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine stationery.
*   **Base:** `surface` (#fef8f5) — The foundational "tablecloth."
*   **Secondary Sections:** `surface-container-low` (#f8f2f0) — Use this for grouped content like "Weekly Meal Plan."
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) — Use this for the highest "lift." It should feel like a fresh sheet of paper placed on top.

### Signature Textures & Glass
*   **The "Glow" Gradient:** For primary CTAs and Hero backgrounds, do not use flat #8f4e00. Use a linear gradient from `primary` (#8f4e00) to `primary_container` (#ff9f43) at a 135° angle. This adds "soul" and depth.
*   **Culinary Glass:** For floating navigation bars or recipe step overlays, use `surface` at 80% opacity with a `20px backdrop-blur`. This allows the vibrant food photography to bleed through the UI, maintaining a sense of place.

---

## 3. Typography: The Editorial Voice
We use a dual-typeface system to balance authority with approachable warmth.

*   **The Hero (Plus Jakarta Sans):** Used for `display` and `headline` tiers. This font’s modern, geometric structure feels clean and "smart." Use `headline-lg` for recipe titles to create an editorial, high-contrast look against the body text.
*   **The Helper (Be Vietnam Pro):** Used for `title`, `body`, and `label` tiers. It is highly legible for long-form ingredient lists and instructions. 

**Pro Tip:** Use `letter-spacing: -0.02em` on headlines to give them a "tucked-in," professional editorial feel.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural shadows.

*   **The Layering Principle:** Instead of a shadow, place a `secondary_container` (#d7e5bb) badge on a `surface_container` (#f2edea) background. The subtle shift in hue provides all the hierarchy needed.
*   **Ambient Shadows:** If an element must "float" (e.g., a FAB or a modal), use a shadow color of `on_surface` at 6% opacity, with a `blur: 40px` and `y: 12px`. It should look like a soft glow, never a dark smudge.
*   **The Ghost Border Fallback:** If a divider is required for accessibility (e.g., in high-density ingredient lists), use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons & Interaction
*   **Primary Button:** Uses the "Glow" Gradient. Corner radius is fixed at `xl` (3rem) for a pill shape or `lg` (2rem) for large blocks.
*   **Secondary/Action Chips:** Use `secondary_container` with `on_secondary_container` text. These should feel like soft organic "pebbles."
*   **Checkboxes:** Replace standard square boxes with a custom rounded-square (8px) using `primary_fixed` color when checked.

### Cards & Lists
*   **Recipe Cards:** Use `lg` (2rem) corner radius. No borders. Use `surface-container-lowest` for the card body. 
*   **Lists:** Forbid divider lines between ingredients. Instead, use `body-md` for the item name and `label-md` in `on_surface_variant` for the measurement, separated by vertical white space (16px).
*   **The "Kitchen Mode" Card:** A specialized component using `tertiary_container` to highlight the current active cooking step, providing high contrast from the rest of the list.

### Inputs
*   **Search/Text Fields:** Use `surface-container-high` as the fill. No border. On focus, transition the background to `surface-container-lowest` and add a 1pt "Ghost Border" of `primary` at 20% opacity.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. For example, a 24px left margin and 16px right margin for a horizontal scroll of recipe cards to suggest "more content."
*   **Do** use the `xl` (3rem) corner radius for the most interactive elements to make them feel "huggable" and stress-free.
*   **Do** prioritize "Breathing Room." If you think there is enough white space, add 8px more.

### Don't:
*   **Don't** use pure black (#000000). Always use `on_surface` (#1d1b1a) to keep the vibe "warm" and "organic."
*   **Don't** use 1px solid lines to separate content. Use a `surface-container` background shift instead.
*   **Don't** use standard "drop shadows." Use tonal layering or the Ambient Shadow specification.
*   **Don't** crowd the screen. This app is for busy parents; if the UI is cluttered, the cooking experience will feel stressful.