# Passcode input

![preview](preview.webp)

> Show progress through a one-time code while preserving native paste and autofill.

- **Common name:** OTP code input
- **Category:** Components & interactions
- **Live demo:** https://www.subframe.com/motion/passcode-input
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Show progress through a one-time code while preserving native paste and autofill.

## Interaction

Type or paste a passcode

## Look

Pale blue-grey page with a rounded icon tile, dark heading, grey subtitle, six white rounded digit boxes split three and three, and a text button.

## Motion

Digits typed or pasted into a hidden input mirror into six boxes; the next box gets a focus ring, and a full code tints all boxes green over 140 ms.

## How to adapt

One transparent `input` with `autoComplete="one-time-code"` and digit-only `onPaste` sits over six `span` slots; `data-current` and `data-complete` drive the CSS states via `transition: border-color 140ms, background 140ms`. Replace the copy and wire `value` to your verification call.

## Reduced motion

Live system preference disables decorative motion; all controls remain usable. Keyboard actions settle immediately.

## Limitations

Only captures a code; it does not authenticate or verify it with a server.

## Taxonomy

- **Components:** input
- **Triggers:** keyboard, state
- **Techniques:** fade
- **Feel:** subtle
- **Contexts:** app
- **Tags:** otp, passcode, input, autofill, validation
- **Also known as:** verification code field, 2FA code entry, PIN code boxes, six-digit code input
- **Surface color:** `#edf0f3`

## Code

See [`component.tsx`](component.tsx).
