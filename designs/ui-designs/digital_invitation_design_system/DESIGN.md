---
name: Digital Invitation Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#47464f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#787680'
  outline-variant: '#c8c5d0'
  surface-tint: '#5b598c'
  primary: '#070235'
  on-primary: '#ffffff'
  primary-container: '#1e1b4b'
  on-primary-container: '#8683ba'
  inverse-primary: '#c4c1fb'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#000c1c'
  on-tertiary: '#ffffff'
  tertiary-container: '#142333'
  on-tertiary-container: '#7c8a9f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c1fb'
  on-primary-fixed: '#181445'
  on-primary-fixed-variant: '#444173'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Noto Serif
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
  h2:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.3'
  h3:
    fontFamily: Noto Serif
    fontSize: 22px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  gutter: 1.5rem
  margin: 2rem
---

## Brand & Style
This design system is engineered to bridge the gap between high-scale B2B utility and the emotional resonance of consumer-facing celebrations. The brand personality is **sophisticated, authoritative, and clean**, evoking the feeling of a premium stationery boutique within a high-performance software environment.

The visual direction follows a **Modern Corporate** aesthetic with **Minimalist** leanings. By prioritizing ample whitespace and structural clarity, the system ensures that complex event management tools remain intuitive for business tenants, while the high-end typography ensures the end consumer feels the prestige of their digital invitation. The experience should feel like a "digital concierge"—efficient, reliable, and impeccably dressed.

## Colors
The palette is anchored by **Deep Indigo**, a color that communicates stability and premium quality. This is used for primary actions, navigation headers, and critical brand moments. **Slate** serves as the functional secondary color, providing a neutral yet warm tone for secondary UI elements, iconography, and metadata to prevent the interface from feeling overly clinical.

Ample use of **White (#FFFFFF)** and **Slate-50 (#F8FAFC)** creates the "high-end" breathing room required for a luxury feel. For the B2C storefront, the primary Indigo should be used with higher frequency to create a sense of occasion, whereas the B2B dashboard utilizes more neutral Slate tones to keep focus on data and workflows.

## Typography
The typographic strategy employs a high-contrast pairing to reflect the dual nature of the platform. **Noto Serif** is reserved for headlines and "invitation" moments, providing an editorial, literary quality that suggests tradition and elegance. 

**Inter** is the workhorse for the UI. It is used for all functional elements, including form fields, dashboard data, labels, and buttons. This sans-serif ensures maximum legibility at small sizes within the B2B administrative interface. To maintain the premium feel, letter-spacing is slightly tightened on Noto Serif headlines and slightly expanded on uppercase Inter labels.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for the B2B dashboard to maximize screen real estate for management tools. For the B2C storefront and invitation views, a **fixed-width centered grid** (max 1200px) is preferred to maintain an editorial layout.

Spacing follows a strict 4px / 8px baseline power-of-two scale. Ample padding is the primary differentiator for the "high-end" feel; elements should never feel crowded. Section headers should be preceded by significant vertical whitespace (XL spacing) to emphasize the transition between content areas.

## Elevation & Depth
Depth is communicated through **ambient shadows** and subtle tonal layering rather than heavy borders. Surfaces should feel lifted and light.

1.  **Level 0 (Flat):** Used for the main background (Slate-50) and input fields.
2.  **Level 1 (Crisp):** Cards and containers use a very soft shadow (0px 2px 4px rgba(30, 27, 75, 0.04)) and a 1px border in a lighter shade of Slate.
3.  **Level 2 (Elevated):** Modals, dropdowns, and hover states on cards use a more diffused shadow (0px 10px 25px rgba(30, 27, 75, 0.08)).

All shadows are subtly tinted with the Primary Deep Indigo color to ensure they feel integrated into the brand palette rather than muddy gray.

## Shapes
The system uses a **Soft** shape language. This moderate rounding (4px for base components) maintains a professional, structured look for the B2B side while avoiding the harshness of sharp corners. Larger elements like cards and modal containers may use the `rounded-lg` (8px) or `rounded-xl` (12px) values to soften the overall presentation and feel more "inviting" for consumers.

## Components
-   **Buttons:** Primary buttons are solid Deep Indigo with white text, using high contrast to drive action. Secondary buttons use a Slate-100 background with Deep Indigo text.
-   **Cards:** Clean white backgrounds with Level 1 elevation. Cards should utilize internal padding of at least 24px (md spacing) to maintain the minimalist feel.
-   **Input Fields:** Ghost-style inputs with a 1px Slate-200 border that transforms to Deep Indigo on focus. Labels are always Inter, 12px, semi-bold, and positioned above the field.
-   **Iconography:** Crisp, 2px stroke-width icons in Slate. Icons should be functional and never decorative.
-   **Storefront Elements:** Utilize Noto Serif for product titles. Call-to-actions should be larger (Body-lg sizing) and prominently placed.
-   **Dashboard Elements:** Lists and data tables should use Inter (Body-sm) for density, utilizing "zebra-striping" with Slate-50 for legibility instead of heavy vertical lines.
-   **Event Specifics:** Include a "Status Chip" component with refined, low-saturation background colors (e.g., soft sage for 'Published', soft amber for 'Draft') to provide clear feedback without breaking the sophisticated aesthetic.