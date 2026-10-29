# Curtain index

![preview](preview.webp)

> A full-area curtain opens into an oversized editorial index, with a short stagger between entries.

- **Common name:** Fullscreen menu overlay
- **Category:** Components & interactions
- **Live demo:** https://www.subframe.com/motion/curtain-index
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Occasional portfolio or publication navigation with a strong typographic identity.

## Interaction

Open Index, select a section, or close with Escape

## Look

Deep plum full-bleed panel listing three oversized pink italic serif section names between hairline rules, with a small text toggle and thin X icon.

## Motion

Opening drops a plum curtain from the top (scaleY, 380 ms ease-in-out) while the hamburger morphs to an X and entries fade and slide down, staggered 35 ms apart.

## How to adapt

The curtain is `.ci-curtain` (`scaleY` on a .38s transition), entries delay by `transition-delay:calc(100ms + var(--order)*35ms)`, and `.ci-toggle b` bars rotate into the X; all key off `data-open`. Replace `sections` and the ellipse artwork, and route in `close`.

## Reduced motion

The menu opens and closes immediately, including keyboard-triggered changes.

## Limitations

Local section selection, not a router. The curtain is contained in its parent and does not act as a page-wide modal.

## Taxonomy

- **Components:** menu, navigation
- **Triggers:** press, keyboard
- **Techniques:** scale, stagger, slide, morph
- **Feel:** bold, refined
- **Contexts:** editorial, landing
- **Tags:** menu, navigation, curtain, stagger, editorial, reveal, typography
- **Also known as:** hamburger menu overlay, staggered nav reveal, full-screen navigation, curtain drop menu
- **Surface color:** `#f355d9`

## Code

See [`component.tsx`](component.tsx).
