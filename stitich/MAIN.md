---
name: Literary Excellence
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5a403c'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#8e706b'
  outline-variant: '#e3beb8'
  surface-tint: '#b52619'
  primary: '#610000'
  on-primary: '#ffffff'
  primary-container: '#8b0000'
  on-primary-container: '#ff907f'
  inverse-primary: '#ffb4a8'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#2c2c2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#434242'
  on-tertiary-container: '#b1aeae'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#920703'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '500'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

This design system is built for a premier literary destination, blending the heritage of a private library with the precision of high-end editorial fashion. The brand personality is authoritative yet welcoming, intellectual yet accessible, and unashamedly luxurious.

The visual style follows a **High-Contrast / Editorial** approach. It utilizes expansive white space to let typography breathe, punctuated by bold blocks of deep crimson and black to create a sense of importance. Gold is used sparingly as a "finishing touch"—much like gold-leaf embossing on a rare spine—to guide the eye toward primary actions and denote premium value.

## Colors

The palette is rooted in classical publishing traditions but executed with modern digital vibrancy.

- **Deep Crimson (#8B0000):** Used for key brand moments and emotional emphasis.
- **Elegant Black (#1A1A1A):** Used for primary text and structural grounding. It is a "near-black" to maintain warmth.
- **Metallic Gold (#D4AF37):** Reserved exclusively for accents, high-value highlights, and subtle borders. 
- **Crisp White (#FFFFFF):** The primary canvas, ensuring maximum legibility and an "open-page" feel.

Functional colors (Success, Warning, Error) should be muted to align with the core palette, avoiding bright neons that would disrupt the luxury aesthetic.

## Typography

The typographic hierarchy is the core of this design system. We use **EB Garamond** for all headlines to evoke the feel of a printed book. It should be set with slightly tighter tracking for large display sizes to maintain a sophisticated editorial look.

**Hanken Grotesk** serves as the functional workhorse for body copy and UI labels. It provides a sharp, contemporary contrast to the serif headings, ensuring the interface feels modern and efficient. Use the Uppercase Label style for navigation items and small headers to add a rhythmic "architectural" feel to the layouts.

## Layout & Spacing

This design system uses a **Fixed Grid** approach for desktop to preserve editorial intent, transitioning to a fluid model for mobile.

- **Desktop (1440px+):** 12-column grid, 1280px max-width container, 24px gutters.
- **Tablet (768px - 1439px):** 8-column fluid grid, 32px side margins.
- **Mobile (Up to 767px):** 4-column fluid grid, 20px side margins.

Spacing follows an 8px base unit. Large "Section Gaps" (120px) are encouraged between major content blocks to emphasize a premium, unhurried browsing experience. Use asymmetrical layouts occasionally—shifting text blocks off-center—to mimic high-end magazine spreads.

## Elevation & Depth

To maintain a flat, editorial aesthetic, we avoid heavy shadows. Depth is instead communicated through **Tonal Layering** and **Low-Contrast Outlines**.

- **Level 0 (Base):** Pure White (#FFFFFF).
- **Level 1 (Cards/Containers):** A subtle 1px border in Gold (#D4AF37) at low opacity (15-20%) or a very faint grey.
- **Level 2 (Hover/Active):** A soft, highly-diffused ambient shadow (Color: Crimson or Black, 4% opacity) to suggest a physical lift off the page.

Background blurs should be used only for global navigation overlays to maintain focus on the book imagery.

## Shapes

The shape language is **Sharp (0px)**. 

In a premium literary context, sharp corners reflect the precision of a cut page and the structure of a book spine. Rounded corners are to be avoided entirely for structural elements (buttons, inputs, cards) to maintain a serious, sophisticated tone. The only exception is for circular icon buttons (e.g., "Add to Wishlist" heart) to provide visual variety.

## Components

### Buttons
- **Primary:** Solid Black (#1A1A1A) with White text. Sharp corners. 
- **CTA:** Solid Crimson (#8B0000) with White text.
- **Secondary:** Transparent background, 1px Gold (#D4AF37) border, Black text.
- **Interaction:** On hover, primary buttons transition to a 1px Gold border with a slight background tint.

### Interactive Book Cards
- Use a 2:3 aspect ratio for book covers.
- The card itself should have no background; the cover image sits directly on the white canvas.
- On hover, a subtle Gold border appears around the image, and a "Quick View" label appears in the Hanken Grotesk Label style.

### Input Fields
- Underline-only style (1px Black) for a minimalist, "signature" feel, or a full 1px border for search bars. 
- Labels should always be visible (never just placeholders) in Hanken Grotesk 12px Medium.

### Navigation
- Global navigation should be centered and airy. 
- Use the Hanken Grotesk Label style for menu items.
- Active states are indicated by a 2px Crimson underline or a subtle Gold dot beneath the text.

### Detailed Product Containers
- Use a split-screen layout for product pages: Image on the left (fixed) and scrollable content on the right.
- Use horizontal dividers (1px Gold, 20% opacity) to separate description, details, and shipping information.