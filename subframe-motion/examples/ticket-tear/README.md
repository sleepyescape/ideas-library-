# Off the grid

![preview](preview.webp)

> A cobalt-and-orange admission ticket tears along its perforation, leaving a stamped keepsake.

- **Common name:** Tear-off ticket animation
- **Category:** Components & interactions
- **Live demo:** https://www.subframe.com/motion/ticket-tear
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Make an occasional admission, reveal or redemption feel tangible without slowing down a frequent action.

## Interaction

Pull the stub right, or select Tear ticket

## Look

Saturated cobalt page with an orange admission ticket in heavy, tightly tracked cobalt type, a barcode, monospace details and a dashed perforated stub.

## Motion

Dragging the stub right slides and tilts it; releasing past 65 px flings it down-right as it fades, while a tilted stamp scales in (240 ms); shorter pulls snap back.

## How to adapt

The drag lives in the stub's `onPointerDown`, `onPointerMove` and `onPointerUp`: `pull` (clamped to 125) drives `translateX(${pull * 0.65}px)` plus rotation, and `pullRef.current >= 65` commits. Tune the `.sf-ticket-stub` and `.sf-ticket-stamp` transitions; replace the copy and gate `setAdmitted` on a server response.

## Reduced motion

The stub disappears and the admission stamp appears immediately. Drag distance still determines intent, with a single-click alternative.

## Limitations

Admission is local demo state. Use an authoritative server response before showing a successful real-world redemption; this gesture is not a security or payment mechanism.

## Taxonomy

- **Components:** card, button
- **Triggers:** drag, press
- **Techniques:** slide, rotate, fade, scale
- **Feel:** bold, playful
- **Contexts:** app, landing
- **Tags:** ticket, tear, drag, confirmation, redeem, admission, gesture, perforation, cobalt, orange, brutalist, typography
- **Also known as:** swipe to redeem, pull to confirm, event ticket redeem, tear-off coupon, drag to admit
- **Surface color:** `#263cda`

## Code

See [`component.tsx`](component.tsx).
