# Afterimage

![preview](preview.webp)

> A mosaic of small tiles trades a relief print for its inverse.

- **Common name:** Pixel mosaic transition
- **Category:** Animation & motion
- **Live demo:** https://www.subframe.com/motion/mosaic-reveal
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Transition between paired artworks or campaign states with a brief discontinuous reveal.

## Interaction

Change the print

## Look

Full-bleed flat vermilion print with thick charcoal curved stripes sweeping into a band, a yellow circle with crosshair, and a round refresh button.

## Motion

Clicking the print swaps it for a rotated cobalt-and-amber inverse under a 10×8 grid of cream tiles that blink off in scattered order over roughly 0.3 s.

## How to adapt

The reveal is the `tiles` grid (80 cells re-keyed by `run`), each running `sf-mosaic-tile` (0.24 s, `steps(1,end)`) after a scattered `animationDelay`; tune grid size, delay spread and tile colour. Replace the two SVG prints inside `relief`.

## Reduced motion

Live reduced-motion preferences remove interpolation and decorative playback. All content and native controls remain available. Keyboard changes settle immediately.

## Limitations

Original demonstration content; adapt labels and state to the host product.

## Taxonomy

- **Components:** image
- **Triggers:** press
- **Techniques:** stagger, mask
- **Feel:** bold
- **Contexts:** landing, editorial
- **Tags:** pixel, mosaic, transition, image, print
- **Also known as:** pixel dissolve, tile reveal transition, blocky image swap, pixelated wipe
- **Surface color:** `#202523`

## Code

See [`component.tsx`](component.tsx).
