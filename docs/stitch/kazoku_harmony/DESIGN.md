# Design System Specification: The Living Room Experience

## 1. Overview & Creative North Star

**Creative North Star: "The Digital Engawa"**
In Japanese architecture, the *Engawa* is a sun-drenched wooden veranda that bridges the private interior of a home with the public nature of the garden. This design system seeks to replicate that feeling—a space that is neither clinical nor purely functional, but "homely," transitional, and warm. 

To move beyond the "standard app" aesthetic, we reject the rigid, boxed-in grid. Instead, we embrace **Organic Layering**. We treat the UI as a series of soft, tactile cards resting on a clean, cream-toned surface. By using intentional asymmetry, generous white space, and overlapping elements, we create a sense of breathability and human touch, moving away from "technical" and toward "nurturing."

---

## 2. Colors & Surface Philosophy

This system uses a sophisticated tonal palette to define boundaries rather than lines. 

### The Palette
- **Primary (Growth):** `#246e00` (Mint-derived deep green) / **Container:** `#96f46e` (The soft Mint Green).
- **Secondary (Guidance):** `#006a6d` / **Container:** `#77f9fe` (The soft Sky Blue).
- **Tertiary (Action):** `#825600` / **Container:** `#f9b854` (The warm Sunshine Orange).
- **Background:** `#f9f9f9` (A warm, off-white cream).

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To separate a mission card from a background, do not use a 1px stroke. Instead, use a background shift.
*   **Surface:** `#f9f9f9` (Main backdrop)
*   **Surface-Container-Low:** `#f3f4f4` (For subtle grouping)
*   **Surface-Container-Lowest:** `#ffffff` (For elevated, interactive cards)

### Glass & Gradient Soul
To add professional polish, primary CTAs should not be flat. Use a **Signature Gradient**: 
*   *Direction:* 135° Top-Left to Bottom-Right.
*   *From:* `primary` (`#246e00`) to `primary_container` (`#96f46e`) at 20% opacity overlay.
*   *Effect:* Floating elements (like AI assistant bubbles) should use **Glassmorphism**: `surface_container_lowest` at 80% opacity with a `16px` backdrop-blur.

---

## 3. Typography: The Editorial Voice

We utilize a high-contrast scale to create an "Editorial" feel, making the app feel like a premium family journal.

*   **Display (The Warm Welcome):** *Plus Jakarta Sans*. Bold and large (`display-lg`: 3.5rem). Use this for milestones and big emotional moments.
*   **Headlines (The Story):** *Plus Jakarta Sans*. Friendly, rounded geometry. 
*   **Body & Titles (The Content):** *Be Vietnam Pro*. Selected for its extreme legibility and "open" counters, which mimic the clarity of Noto Sans JP while providing a more custom, premium feel for Latin characters and numbers.
*   **Japanese Pairing:** For Japanese text, pair these with **Noto Sans JP** at a `400` weight for body and `700` for titles to maintain the "non-technical" warmth.

---

## 4. Elevation & Depth: Tonal Layering

Depth in this system is "felt," not seen through heavy shadows.

*   **The Layering Principle:** Instead of shadows, stack your containers. Place a `surface_container_lowest` (#FFFFFF) card on a `surface_container` (#ECEEEE) background to create a "lifted" effect.
*   **Ambient Shadows:** For floating action buttons or "Hero" cards, use an ultra-diffused shadow:
    *   `box-shadow: 0px 12px 32px rgba(47, 51, 52, 0.06);`
    *   *Note:* The shadow color is a 6% opacity version of `on_surface`, never pure black.
*   **Ghost Borders:** If an element (like a text input) requires a boundary, use a "Ghost Border": `outline_variant` at 20% opacity. 

---

## 5. Components

### Cards (The Core Unit)
Cards are the heart of this system. 
*   **Corner Radius:** Always `xl` (3rem) for Hero cards and `DEFAULT` (1rem) for standard content.
*   **Spacing:** Use `spacing-6` (2rem) for internal padding to give content room to breathe.
*   **Rule:** No dividers. Use a `spacing-4` (1.4rem) gap between list items or a subtle background shift.

### Buttons (Tactile Engagement)
*   **Primary:** Uses the Primary Gradient with `DEFAULT` (1rem) rounded corners.
*   **Secondary:** `surface_container_high` background with `on_primary_fixed` text.
*   **Interactions:** On press, the button should scale down slightly (98%) to provide a tactile, "squishy" feel.

### Input Fields
*   **Style:** Filled containers using `surface_container_low`. 
*   **Focus State:** A 2px "Ghost Border" using the `primary` color at 40% opacity. No harsh outlines.

### AI Hub "Bubbles" (Unique Component)
For AI interactions, use asymmetric rounding (e.g., `top-left: 2rem`, `top-right: 2rem`, `bottom-right: 2rem`, `bottom-left: 0.5rem`). This makes the AI feel like it's speaking "from" a specific point, adding personality.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** use overlapping elements. Let an icon peek 10px outside of its card container to break the "grid."
*   **Do** use whitespace as a separator. If you think you need a line, add 1.5rem of space instead.
*   **Do** use `tertiary_container` (#f9b854) for "Missions" to spark a sense of reward and sunshine.

### Don't:
*   **Don't** use pure black (#000000) for text. Use `on_surface` (#2f3334) to keep the contrast soft and readable for all ages.
*   **Don't** use sharp corners. Anything less than 16px feels "corporate" and "technical."
*   **Don't** use high-intensity drop shadows. If it looks like it’s "hovering" more than 5mm off the screen, it's too much.

---

## 7. Spacing & Rhythm

Adhere strictly to the Spacing Scale to maintain a "harmonic" rhythm.
*   **External Margins:** Always `8` (2.75rem) on mobile to create a "framed" editorial look.
*   **Internal Component Gaps:** `3` (1rem) for related items; `6` (2rem) for unrelated sections.

By following these principles, we ensure this design system remains a warm, inviting digital home for families—one that values human connection over technical efficiency.