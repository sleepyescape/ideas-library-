# Inline title edit

![preview](preview.webp)

> Keep a document’s identity in place while editing, committing, or cancelling.

- **Common name:** Inline editable title
- **Category:** Components & interactions
- **Live demo:** https://www.subframe.com/motion/editable-document-title
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Keep a document’s identity in place while editing, committing, or cancelling.

## Interaction

Rename the collection

## Look

Light grey page with a white rounded card: a tilted pale-green document icon, small grey label, dark sans-serif title with pencil glyph, sage caption.

## Motion

Clicking the title swaps in a pre-selected text field while the action buttons fade down 3 px into place over 140 ms ease-out; saving swaps back and shows a confirmation.

## How to adapt

`editing` swaps the `title` button for the form; the effect focuses and selects the input, then returns focus to `titleButton`. The only animation is `sf-editable-document-title-editIn` on `edit-actions`; replace the collection label, count and `title`, and persist in `commit`.

## Reduced motion

Live system preference disables decorative motion; all controls remain usable. Keyboard actions settle immediately.

## Limitations

Local state only; no document is renamed outside the demo.

## Taxonomy

- **Components:** input, text
- **Triggers:** press, state
- **Techniques:** fade, slide
- **Feel:** subtle
- **Contexts:** app
- **Tags:** inline editing, document, commit, cancel
- **Also known as:** click to edit title, rename in place, editable heading, inline rename
- **Surface color:** `#edf0f3`

## Code

See [`component.tsx`](component.tsx).
