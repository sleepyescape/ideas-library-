# Archive search

![preview](preview.webp)

> A compact archive tab expands into a searchable document picker and retains your selection.

- **Common name:** Expanding search combobox
- **Category:** Components & interactions
- **Live demo:** https://www.subframe.com/motion/expanding-search
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Fit local document search and selection into a compact toolbar.

## Interaction

Open search, filter documents and select a result.

## Look

Warm stone-grey page with a compact off-white paper strip led by a vermilion index tab holding a search icon, set in plain sans-serif.

## Motion

Clicking the tab unclips the paper to a full panel as the drawer slides into place (320 ms ease-out); the field fades in and the results slide down.

## How to adapt

Open and closed states are CSS keyed on `data-open`: `.sf-index-paper` animates `clip-path` from `inset(0 130px 218px 0)` and `.sf-index-drawer` its `transform`, both 320ms ease-out. Replace `documents`; keep the combobox roles, `aria-activedescendant` and `data-instant`.

## Reduced motion

Keyboard, reduced-motion and paused-host transitions are immediate.

## Limitations

Local sample data only; no remote search or document navigation. Selecting changes the compact title; it does not open a full document.

## Taxonomy

- **Components:** input, picker
- **Triggers:** press, keyboard
- **Techniques:** mask, slide, fade
- **Feel:** refined, subtle
- **Contexts:** app
- **Tags:** search, combobox, document picker, progressive disclosure, archive, keyboard navigation
- **Also known as:** collapsible search field, autocomplete dropdown, search to select, document finder
- **Surface color:** `#e5e2db`

## Code

See [`component.tsx`](component.tsx).
