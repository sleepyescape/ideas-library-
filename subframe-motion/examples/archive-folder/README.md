# Archive folder

![preview](preview.webp)

> A warm paper folder opens into a small fan of weather prints.

- **Common name:** Folder open animation
- **Category:** Components & interactions
- **Live demo:** https://www.subframe.com/motion/archive-folder
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Expose a small document collection while keeping its containing folder visible.

## Interaction

Open the folder and select a print.

## Look

Mustard-gold paper folder with a darker back tab and the edge of cream prints peeking out, centred on a flat vermilion background.

## Motion

Clicking the front cover folds it 46° toward the viewer over 420 ms as three prints fan up and out with slight rotation over 480 ms, both strongly eased out.

## How to adapt

The cover hinge is the `af-cover` `rotateX(-46deg)` transition (420 ms) keyed off `data-open`, and each `af-document` gets an inline fan `transform` from its index (86 px spread, 9° tilt, 480 ms). Replace `files` with your documents; keep `useCalm`.

## Reduced motion

The cover and document fan change pose immediately.

## Limitations

Three local sample prints; file selection opens an inline preview and does not read the filesystem.

## Taxonomy

- **Components:** disclosure, card, gallery
- **Triggers:** press
- **Techniques:** 3d, rotate, slide
- **Feel:** playful, refined
- **Contexts:** app, editorial
- **Tags:** folder, document, fan, CSS 3D, disclosure
- **Also known as:** file folder reveal, document fan out, skeuomorphic folder, photo stack fan
- **Surface color:** `#e94f29`

## Assets

- [`fuji-storm.webp`](../../assets/fuji-storm.webp) — Shower Below the Summit (Sanka hakuu), from the series "Thirty-Six Views of Mount Fuji (Fugaku sanjurokkei)" (CC0-1.0)
- [`plum-garden.webp`](../../assets/plum-garden.webp) — Plum Garden at Kameido (Kameido Umeyashiki), from the series "One Hundred Famous Views of Edo (Meisho Edo hyakkei)" (CC0-1.0)
- [`suruga-wind.webp`](../../assets/suruga-wind.webp) — Ejiri in Suruga Province (Sunshu Ejiri), from the series "Thirty-six Views of Mount Fuji (Fugaku sanjurokkei)" (CC0-1.0)

## Code

See [`component.tsx`](component.tsx).
