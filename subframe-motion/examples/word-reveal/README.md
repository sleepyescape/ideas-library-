# Word by word

![preview](preview.webp)

> A measured word-by-word reveal that lets a short headline land.

- **Common name:** Split text reveal
- **Category:** Animation & motion
- **Live demo:** https://www.subframe.com/motion/word-reveal
- **Source:** Motion Primitives (adapted, MIT) — https://motion-primitives.com/docs/text-effect · [original code](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/text-effect.tsx)
- **Dependencies:** motion@12.0.5

## Use case

Introduce a short piece of editorial or launch copy. Avoid delaying paragraphs or essential instructions.

## Interaction

Replay the entrance

## Look

Pale sage-green page with a two-line, tightly tracked dark olive sans-serif headline, left-aligned at centre, and a small replay control bottom right.

## Motion

On mount each word slides up out of its own overflow mask while fading in, 0.52 s each with a strong ease-out, staggered 75 ms; replay restarts it.

## How to adapt

The stagger is `staggerChildren: 0.075` on the `motion.h2` variants; each word's `motion.span` rises from `y: "100%"` inside an `overflow: "hidden"` wrapper over 0.52 s with ease `[0.22, 1, 0.36, 1]`. Replace `lines` with your copy and keep the heading's `aria-label`.

## Reduced motion

The complete headline is immediately visible, without movement.

## Limitations

Word splitting is tuned for this English headline. Recheck wrapping and segmentation for other languages.

## Taxonomy

- **Components:** text
- **Triggers:** enter
- **Techniques:** split-text, stagger, mask, slide
- **Feel:** refined, subtle
- **Contexts:** landing, editorial
- **Tags:** text, stagger, mask, headline, entrance
- **Also known as:** staggered headline entrance, masked text reveal, text slide-up on load, word stagger animation
- **Surface color:** `#ece7f0`

## Code

See [`component.tsx`](component.tsx).
