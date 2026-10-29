# Edge etch

![preview](preview.webp)

> A stacked ceramic silhouette resolves into crisp extracted edges on ultramarine.

- **Common name:** Edge detection shader
- **Category:** WebGL & shaders
- **Live demo:** https://www.subframe.com/motion/edge-etch
- **Source:** Subframe (original, MIT)
- **Dependencies:** none

## Use case

Turn local brightness changes into a tunable line-art treatment.

## Interaction

Adjust sensitivity.

## Look

Saturated ultramarine field with a centred stack of four pebble-like ellipses drawn as thin white outlines, flat with no fill or shading.

## Motion

The stacked silhouette rocks up to 7° each way on a slow 29-second sine while a Sobel pass extracts its edges; the sensitivity slider moves the edge threshold.

## How to adapt

The Sobel kernel in the `FRAGMENT` shader's `main` samples `field`, a procedural stack of four ellipses swayed by `rot`; tune `threshold` and `bg`, or replace `field` with your own luminance source. Keep the context-loss and reduced-motion handling.

## Reduced motion

The elapsed-time clock stops. Parameter controls immediately update the static composition.

## Limitations

Requires WebGL 1; a static CSS swatch appears if unavailable or after context loss. Nine procedural luminance samples per pixel; no imported photograph or semantic object tracing.

## Taxonomy

- **Components:** background, image
- **Triggers:** ambient, state
- **Techniques:** shader, rotate
- **Feel:** calm, technical
- **Contexts:** landing, editorial
- **Tags:** native webgl, sobel, edge detection, convolution, line art, postprocessing
- **Also known as:** sobel filter, line art shader, outline filter, contour extraction
- **Surface color:** `#123cc5`

## Code

See [`component.tsx`](component.tsx).
