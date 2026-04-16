# Design System Specification

## 1. Overview & Creative North Star: "The Artisanal Archive"

This design system is a departure from the rigid, grid-locked structures of typical utility apps. Instead, it embraces the philosophy of **"The Artisanal Archive"**—a digital experience that feels as much like a high-end, tactile cookbook as it does a functional tool. 

The goal is to provide a "Visual Quietude." We move away from the frantic, cluttered layouts of the modern web toward an editorial aesthetic defined by **intentional asymmetry**, **layered depth**, and **generous white space**. By prioritizing tonal shifts over harsh lines, the UI recedes to allow the photography and culinary content to become the focal point. This system is designed to feel warm, curated, and authoritative.

---

## 2. Colors

The color palette is rooted in the organic world, utilizing the provided Material Design tokens to create a sophisticated, earthy environment.

### The Palette
*   **Primary (`primary` #6c2f00 / `primary_container` #8b4513):** A rich, roasted umber used for high-emphasis actions and key brand moments.
*   **Secondary (`secondary` #54634b / `secondary_container` #d4e5c7):** A muted sage that acts as a soothing counterpoint to the warmth of the brown.
*   **Background (`background` #fdf9f3):** A soft cream that reduces eye strain and provides a premium, "fine paper" feel.

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are strictly prohibited** for sectioning or containment. Structural boundaries must be defined through:
1.  **Background Color Shifts:** Placing a `surface_container_low` card on a `surface` background.
2.  **Tonal Transitions:** Using the hierarchy of surface tokens to create "zones."

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine materials.
*   **Base:** `surface` (#fdf9f3)
*   **Sections:** Use `surface_container_low` (#f7f3ed) for large content areas.
*   **Cards/Elements:** Use `surface_container_highest` (#e6e2dc) or `surface_container_lowest` (#ffffff) to create "lift" through color rather than lines.

### The "Glass & Gradient" Rule
Standard flat colors can feel sterile. For floating elements (like bottom navigation bars or recipe "quick-view" overlays), use **Glassmorphism**:
*   Apply a semi-transparent `surface` color with a `backdrop-blur` of 12px–20px. 
*   **Signature Textures:** For main CTAs, use a subtle linear gradient from `primary` to `primary_container` to add visual "soul" and depth.

---

## 3. Typography

The typography scale uses a "High-Contrast Editorial" approach. By pairing a modern, sophisticated sans-serif for headings with a highly legible sans-serif for data, we create an authoritative yet accessible hierarchy.

*   **Display & Headlines (Manrope):** These are the "voice" of the system. Use `display-lg` (3.5rem) for hero moments and `headline-lg` (2rem) for recipe titles. The bold weight of Manrope conveys a premium, modern-classic feel.
*   **Title & Body (Plus Jakarta Sans):** Used for functional reading. `body-lg` (1rem) is the standard for recipe instructions to ensure comfort during active cooking.
*   **Labels (Plus Jakarta Sans):** `label-md` (0.75rem) should be used for metadata like cook time or difficulty, often in uppercase with a slight letter-spacing (0.05rem) to enhance the "curated" feel.

---

## 4. Elevation & Depth

We eschew traditional drop shadows in favor of **Tonal Layering** and **Ambient Light**.

### The Layering Principle
Hierarchy is achieved by "stacking" surface tiers. A `surface_container_lowest` (pure white) card sitting on a `surface_container_low` (off-white) background creates a natural, soft lift without the need for a shadow.

### Ambient Shadows
When a floating effect is required (e.g., for a "Load More" button or a floating action button):
*   **Blur:** Use large values (20px–40px).
*   **Opacity:** Keep it low (4%–8%).
*   **Color:** Use a tinted version of `on_surface` (deep charcoal/brown) rather than pure black to mimic natural light filtered through a kitchen environment.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in high-contrast modes), use the `outline_variant` token at **20% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons
*   **Primary:** Pill-shaped (`full` 9999px) or `md` (1.5rem) radius. Use the primary gradient (Primary to Primary Container) with `on_primary` text.
*   **Secondary:** Use `secondary_container` background with `on_secondary_container` text. Large `md` radius (1.5rem).
*   **Tertiary:** Ghost style. No background, just `title-sm` typography in the `primary` color.

### Cards (The "Editorial Card")
*   **Style:** `xl` (3rem) corner radius. 
*   **Separation:** Strictly forbid divider lines. Separate "Ingredients" from "Instructions" using the Spacing Scale (minimum 2rem of vertical white space) or a background shift to `surface_container_low`.
*   **Imagery:** Recipe images should always have a slight `inner-shadow` or a soft gradient overlay at the bottom to ensure `on_surface` text is readable when overlaid.

### Input Fields
*   **Style:** Deeply rounded (`lg` 2rem) with a `surface_container_highest` background. 
*   **State:** The active state should not use a border; instead, use a subtle 2px "glow" using the `primary` color at 15% opacity.

### Selection Chips
*   **Style:** Use the `secondary_fixed` color for unselected states and `primary` for selected.
*   **Radius:** Always `full` (pill-shaped) to distinguish them from cards.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. For example, a recipe image might bleed off the left edge of the screen while text is indented on the right.
*   **Do** utilize white space as a structural element. If a screen feels "busy," add 1rem of padding rather than adding a line.
*   **Do** use `surface_tint` at very low opacities (2-5%) over images to make them feel integrated into the earthy color palette.

### Don't
*   **Don't** use 1px solid dividers or borders. This instantly breaks the "Artisanal" feel and reverts the UI to a generic template.
*   **Don't** use pure black (#000000). Always use `on_surface` or `on_background` (deep charcoals/browns) to maintain the organic warmth.
*   **Don't** cram content. If a card has too much information, use a "See More" transition or a layered modal rather than reducing typography size.