# Keep the words that survived

![preview](preview.webp)

> A print-yellow copy proof moves surviving words into a new sentence while red edit marks distinguish additions and removals.

- **Common name:** Animated sentence revision
- **Category:** Animation & motion
- **Live demo:** https://www.subframe.com/motion/sentence-diff-motion
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Preview short copy revisions while keeping unchanged words recognizable.

## Interaction

Choose Original, More room, or New direction; another revision interrupts the current movement.

## Look

Saturated yellow proof with oversized ink-black words, fine red insertion underlines, a red deletion rail, and three numbered revision controls.

## Motion

Surviving words move from their current rendered positions into measured target boxes. Removed words rise and fade; inserted words enter after the deletion lead. Rapid reversals retain the current visual pose.

## How to adapt

Change the short sentence pairs in `COPY`; `matchWords` assigns stable word identities using a longest-common-subsequence pass. `REVISIONS` retains those identities between the authored variants. `moveMs`, `exitLeadMs`, and `departurePx` apply to the next revision; `markChanges` updates the proof marks live.

## Reduced motion

Revision changes update immediately with the same edit marks. Preference changes cancel active transitions; final copy is announced once.

## Limitations

Three fixed, two-line revisions with deterministic token identities. Not a text input, arbitrary document differ, or rich-text editor.

## Taxonomy

- **Components:** text, button
- **Triggers:** press, keyboard
- **Techniques:** layout, slide, fade
- **Feel:** bold, refined
- **Contexts:** app, editorial
- **Tags:** text, revision, diff, copy editing, word identity, FLIP, WAAPI
- **Also known as:** word diff animation, copy revision preview, stable word transition, animated text changes
- **Surface color:** `#f3df3d`

## Code

See [`component.tsx`](component.tsx).
