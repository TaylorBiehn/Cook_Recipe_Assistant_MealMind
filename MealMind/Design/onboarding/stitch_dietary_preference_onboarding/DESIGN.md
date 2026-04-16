# Design System Strategy: The Culinary Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Artisanal Curator"**

This design system moves away from the sterile, utility-first nature of traditional recipe apps and moves toward a premium, editorial experience. It is designed to feel like a high-end, tactile cookbook—warm, organic, and intentional. 

We break the "standard template" look by utilizing heavy typographic scales, intentional asymmetry in card layouts, and a "tonal layering" approach to depth. Instead of rigid grids and harsh dividers, the interface breathes through generous whitespace and soft, nested surfaces that mimic the layering of fine parchment.

## 2. Colors & Surface Logic
The palette is rooted in nature: creams provide a soft base, earthy greens offer freshness, and burnt oranges provide a savory, high-contrast energy for action.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Structure must be achieved through:
*   **Background Shifts:** Using `surface-container-low` against a `surface` background.
*   **Negative Space:** Using the spacing scale to define boundaries.
*   **Tonal Transitions:** Subtle shifts in hue to denote new content areas.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
*   **Base Layer:** `surface` (#fff8ef) for the main background.
*   **Content Areas:** `surface-container` (#f5edde) for grouped content sections.
*   **Elevated Elements:** `surface-container-lowest` (#ffffff) for primary recipe cards to make them "pop" against the cream base.

### The "Glass & Gradient" Rule
To add a signature "soul" to the UI, use subtle gradients rather than flat fills for hero elements.
*   **Primary CTAs:** A linear gradient from `primary` (#904917) to `primary-container` (#ae602d).
*   **Floating Elements:** Use Glassmorphism for top navigation bars or floating action buttons. Apply a semi-transparent version of `surface-bright` with a 20px-30px backdrop-blur to allow food imagery to bleed through the UI softly.

## 3. Typography
The typography system pairs a geometric, authoritative serif-like personality with a modern, high-readability sans-serif.

*   **Display & Headlines (Epilogue):** This is our "Editorial Voice." Large scales (`display-lg` at 3.5rem) should be used for hero titles to create a sense of grandeur. The tight tracking and bold weights convey authority and warmth.
*   **Body & Titles (Plus Jakarta Sans):** This is our "Functional Voice." It provides a clean, friendly contrast to the headlines. Use `title-lg` for recipe names and `body-md` for ingredient lists to ensure maximum legibility during active cooking.
*   **Intentional Contrast:** Always pair a large `headline-lg` with a much smaller `label-md` or `body-sm` to create a sophisticated, high-end editorial hierarchy.

## 4. Elevation & Depth
We eschew traditional material shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift without needing a shadow.
*   **Ambient Shadows:** Where a floating effect is vital (e.g., a "Find My Meal" button), shadows must be extra-diffused. 
    *   *Spec:* Blur: 24px, Spread: -4px, Opacity: 6% of `on-surface` (#1e1b13).
*   **The "Ghost Border" Fallback:** If a container lacks sufficient contrast against its background, use a "Ghost Border": `outline-variant` at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** For overlays, use a blur effect to integrate the component into the environment. This prevents the UI from feeling "pasted on" and instead feels like a curated layer of the experience.

## 5. Components

### Buttons
*   **Primary:** Rounded `full` (9999px). Gradient fill (`primary` to `primary-container`). Typography: `title-sm` in `on-primary`.
*   **Secondary:** `surface-container-high` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style. No background, `on-surface` text with an underline on hover.

### Cards (The "Recipe Tile")
*   **Style:** `xl` (1.5rem) rounded corners. 
*   **Background:** `surface-container-lowest` (#ffffff).
*   **Content:** No dividers. Use `body-sm` for metadata (calories, time) and `title-md` for titles. Images should have a subtle 4% inner glow to soften the transition between image and container.

### Chips (Category & Filter)
*   **Inactive:** `secondary-container` (#c8f17a) with `on-secondary-container` (#4e6e00) text.
*   **Active:** `primary` (#904917) with `on-primary` text.
*   **Shape:** `md` (0.75rem) roundedness for a friendly, organic feel.

### Input Fields
*   **Search Bar:** `full` roundedness. Background: `surface-container-high`. 
*   **Interaction:** On focus, transition background to `surface-bright` and add a "Ghost Border" of `primary` at 20% opacity.

### Navigation Bar
*   **Style:** Glassmorphic bar at the bottom.
*   **Active State:** Use a soft `primary-fixed` pill behind the active icon to indicate selection without harsh lines.

## 6. Do's and Don'ts

### Do
*   **DO** use "Organic Asymmetry." It’s okay if card heights vary slightly in a masonry-style feed to feel more curated.
*   **DO** use high-quality, warm-toned food photography. The UI is the frame; the food is the art.
*   **DO** prioritize whitespace. If a screen feels "busy," remove a container background rather than adding a divider.

### Don't
*   **DON'T** use pure black (#000000) for text. Always use `on-surface` (#1e1b13) to maintain the warm, organic feel.
*   **DON'T** use sharp corners. The minimum radius allowed is `sm` (0.25rem), but `xl` (1.5rem) is preferred for all major containers.
*   **DON'T** use standard "Drop Shadows." If it looks like a default plugin setting, it’s wrong. Shadows must be ambient and tinted.
*   **DON'T** use horizontal dividers. Use a 24px or 32px vertical gap to separate sections instead.