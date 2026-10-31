# Claude рисует кодом: стили

Формат из роликов вида «Claude рисует кодом»: одни и те же герои путешествуют по стилям,
и каждую сцену Claude рисует программой (Three.js, SVG, canvas, ASCII, p5.js), без генератора картинок.
Работает прямо в чате Claude (артефакт), в Claude Code или в Claude Motion.
Сначала зафиксируйте героев шаблоном «Карточка героев», потом подставляйте `[HEROES]` в любой стиль.

## Карточка героев (делать первой)
- **Где:** чат Claude, Claude Code
- **Формат:** —
- **Теги:** character-sheet, consistency, base

```text
Define two characters as a reusable spec I will paste into every scene, so they look the same in every style:
[HERO]: [e.g. a girl with long wavy ginger hair, freckles, big dark eyes, black hoodie with white drawstrings, black trousers, white sneakers].
[SIDEKICK]: [e.g. "Claude" — a terracotta-orange box with four short square legs, two small ears on the sides, two vertical black rectangle eyes and a small mouth].
Write: proportions (head-to-body ratio), exact colour HEX codes for every part, silhouette notes, 3 typical poses and 3 expressions.
Then draw both as a simple SVG turnaround (front, side, 3/4) so I can check them.
```

## Ролик «путешествие по стилям»
- **Где:** Claude Code + Remotion, Claude Motion
- **Формат:** 60–90 с · 9:16
- **Теги:** style-tour, dialogue, series

```text
Make a 75-second vertical video where [HEROES] travel through [N, e.g. 8] visual styles, each drawn entirely in code.
Every scene is 6–10 seconds: the style changes with a quick transition (glitch, pixel dissolve, paper wipe), the characters stay recognisable.
Each scene has one line of dialogue as a subtitle (top third, white with an orange key word) where they comment on the new style in a funny way.
Styles in order: [STYLE 1], [STYLE 2], … (take descriptions from this file).
Ending: they try to go back to the first style, but it comes back "almost the same" with a small glitch — punchline.
Last 5 seconds: end card "[CTA]".
```

## Low-poly 3D (Three.js)
- **Где:** чат Claude (артефакт), Claude Code
- **Формат:** сцена 6–10 с · 9:16
- **Теги:** threejs, 3d, low-poly

```text
Draw [HEROES] as a low-poly 3D scene in Three.js: a cosy living room at dusk — wooden floor, sofa, round rug, tall window with orange curtains and city lights outside, a plant.
Characters built from simple primitives (boxes, spheres, cylinders) with flat shading and soft shadows; [SIDEKICK] wags an ear and bounces, [HERO] waves.
Warm key light from a lamp, cool fill from the window, slow orbiting camera. Render as an animated canvas, 1080×1920.
```

## Плоский SVG (видно кривые)
- **Где:** чат Claude (артефакт)
- **Формат:** сцена 6–8 с · 9:16
- **Теги:** svg, flat, vector

```text
Draw [HEROES] as flat SVG illustration: muted teal wall, mustard armchair, a plant, an oval rug with dots, subtle paper grain.
Then, in the middle of the animation, briefly show the "construction view": bezier handles, anchor points and bounding boxes appear over the shapes, then fade away.
Animate with CSS/SMIL only: blinking, a small hop, the plant swaying.
```

## Пиксельная игра (играбельная)
- **Где:** чат Claude (артефакт)
- **Формат:** игра / запись 8 с · 9:16
- **Теги:** pixel-art, game, canvas

```text
Make a tiny playable pixel-art game in one HTML canvas: [HERO] runs and jumps around a cosy pixel room at night (lamp, bookshelf, sofa, window with city and moon), collecting coffee cups; [SIDEKICK] follows her.
16-bit look, 32-colour palette, no smoothing, 3 hearts and "SCORE 000" in a pixel font at the top.
Arrow keys / tap to play. Also add an "attract mode" that plays itself so I can record it.
```

## Пиксельный портрет
- **Где:** чат Claude (артефакт)
- **Формат:** кадр 4 с · 9:16
- **Теги:** pixel-art, portrait, avatar

```text
Draw a close-up pixel-art portrait of [HERO] on a 48×48 grid, scaled up crisply: framed like a game character select screen, blue background, white border.
Big sparkly eyes, freckles as single pixels, hoodie drawstrings visible.
Animate: blink every 2 seconds and a surprised open-mouth expression on cue.
```

## ASCII-арт в терминале
- **Где:** чат Claude (артефакт), Claude Code
- **Формат:** сцена 6–10 с · 9:16
- **Теги:** ascii, terminal, text-art

```text
Draw [HEROES] entirely in ASCII characters inside a fake terminal window ("user@room:~$ cat room.txt").
Use dense characters (@#%*) for dark areas and light ones (.:-) for highlights; colour the characters (orange for [SIDEKICK] and hair, white for skin, dim green for the room).
Animate: the art prints line by line, then the characters blink; at one point [HERO] duplicates into three copies (copy-paste joke).
CRT look: dark green glow, scanlines, slight curvature.
```

## Японская гравюра (укиё-э)
- **Где:** чат Claude (артефакт)
- **Формат:** кадр 6 с · 9:16
- **Теги:** ukiyo-e, woodblock, japan

```text
Draw [HEROES] as a Japanese woodblock print (ukiyo-e) in SVG: a snowy mountain, stylised waves with foam claws, a red sun, a pine branch, flat sky gradient, aged paper texture.
A vertical cartouche with the title "[TITLE]" and a small red seal.
Limited palette: Prussian blue, indigo, red, beige. Gentle motion: waves curl, birds drift.
```

## Мультик 1930-х (резиновые руки)
- **Где:** чат Claude (артефакт), Remotion
- **Формат:** сцена 6–8 с · 9:16
- **Теги:** 1930s, rubber-hose, black-and-white

```text
Draw [HEROES] in 1930s rubber-hose cartoon style: black-and-white with grey tones, big "pie-cut" eyes, white gloves, bendy limbs, everything (even the furniture and the sun in the window) bouncing to the same rhythm.
Add film grain, flicker, slight jitter and a vignette.
```

## Синтвейв / 80-е
- **Где:** чат Claude (артефакт), Remotion
- **Формат:** сцена 6 с · 9:16
- **Теги:** synthwave, neon, 80s

```text
Put [HEROES] on a synthwave stage: neon magenta perspective grid scrolling to the horizon, striped setting sun, purple sky.
Characters get a neon rim light; floating lines of code drift past them like holograms.
Transition in: the previous scene "glitches" into the grid with an orange electric arc.
```

## Кубизм
- **Где:** чат Claude (артефакт)
- **Формат:** сцена 6–8 с · 9:16
- **Теги:** cubism, picasso, painting

```text
Redraw [HEROES] in Cubism: faces split into flat geometric planes seen from several angles at once (both eyes on one side, nose in profile), ochre-brown-grey palette, overlapping translucent shards in the background (a cup, a guitar, a window).
Shapes slide slightly as if the viewpoint keeps shifting. Visible brush texture.
```

## Герои из строк кода
- **Где:** Claude Code + Remotion, чат Claude
- **Формат:** сцена 8–10 с · 9:16
- **Теги:** code-art, meta, typography

```text
Render [HEROES] where every pixel is a character of the very code that draws them: dark editor background with faint scrolling source, the characters formed by coloured monospace text (orange for hair and [SIDEKICK], pale for skin, dark for the hoodie).
Count the lines of code that draw each character and show the number as a caption ("[HERO]: [N] lines, freckles: [N]").
Zoom in until single characters of code are readable, then zoom out.
```

## Поп-арт комикс
- **Где:** чат Claude (артефакт)
- **Формат:** сцена 6 с · 9:16
- **Теги:** comics, pop-art, halftone

```text
Draw [HEROES] as a pop-art comic panel: bold black outlines, Ben-Day halftone dots, flat primary colours, a jagged "WOW!" burst and a speech balloon "[LINE]".
Panel borders slam in one by one; the dots pulse slightly.
```

## Конструктор из кубиков (воксели)
- **Где:** чат Claude (артефакт), Three.js
- **Формат:** сцена 8 с · 9:16
- **Теги:** voxel, toy, building-blocks

```text
Build [HEROES] from voxels / toy bricks in Three.js: each block falls from above and snaps into place with a tiny bounce until the characters are complete, then they wave.
Plastic shading with glossy highlights, studs on top, bright toy colours, studio floor.
```

## Витраж
- **Где:** чат Claude (артефакт)
- **Формат:** кадр 6 с · 9:16
- **Теги:** stained-glass, svg, light

```text
Draw [HEROES] as a stained-glass window in SVG: thick dark lead lines, translucent jewel-tone glass pieces, a gothic arch frame.
Animate sunlight sweeping across so the glass colours glow and cast coloured light on a stone floor below.
```

## Акварель (SVG-фильтры)
- **Где:** чат Claude (артефакт)
- **Формат:** кадр 6 с · 9:16
- **Теги:** watercolor, filters, soft

```text
Paint [HEROES] in watercolour using SVG filters (turbulence + displacement for bleeding edges, paper texture, pigment pooling at edges).
Washes appear one by one as if being painted, then pencil outlines draw on top. Soft pastel palette, lots of white paper.
```

## Ван Гог (мазки по потоку)
- **Где:** p5.js, чат Claude (артефакт)
- **Формат:** сцена 8 с · 9:16
- **Теги:** van-gogh, flow-field, painting

```text
Paint [HEROES] at night under a swirling starry sky with thousands of short thick brush strokes that follow a flow field (p5.js).
Strokes in the sky keep swirling slowly; the characters are painted with strokes along their forms. Deep blues, yellow stars, visible impasto texture.
```

## Бумажная вырезка / коллаж Матисса
- **Где:** чат Claude (артефакт)
- **Формат:** сцена 6 с · 9:16
- **Теги:** paper-cut, matisse, collage

```text
Make [HEROES] from cut-paper shapes in the style of Matisse cut-outs: bold flat colours, organic leaf and seaweed shapes floating around, slightly uneven scissor edges, soft shadows between layers.
Shapes flutter in and assemble the characters.
```

## Чертёж (blueprint)
- **Где:** чат Claude (артефакт)
- **Формат:** сцена 6 с · 9:16
- **Теги:** blueprint, technical, lines

```text
Draw [HEROES] as a technical blueprint: white thin lines on deep blue grid paper, dimension arrows ("height: 1 cube"), part labels ("ear, left"), an exploded view of [SIDEKICK] showing how it is assembled.
Lines draw themselves before the characters move.
```

## Светодиодная матрица / табло
- **Где:** чат Claude (артефакт)
- **Формат:** сцена 6 с · 9:16
- **Теги:** led, matrix, scoreboard

```text
Show [HEROES] on a big LED dot-matrix sign: round glowing dots with bloom, limited 8-colour palette, the image scrolls in from the right like a stadium board, then a scrolling message "[TEXT]".
Slight dot flicker and dark gaps between LEDs.
```

## Эмодзи-мозаика
- **Где:** чат Claude (артефакт)
- **Формат:** кадр 6 с · 9:16
- **Теги:** emoji, mosaic, fun

```text
Build [HEROES] as a mosaic made only of emoji (🟧 for the cube, 🦰-like orange tones for hair, ⬛ for the hoodie, etc.) on a grid.
Animate: emoji pop in randomly until the picture is complete, then a few swap to make the characters blink and smile.
```

## Оригами
- **Где:** Three.js, чат Claude (артефакт)
- **Формат:** сцена 8 с · 9:16
- **Теги:** origami, paper, 3d

```text
Fold [HEROES] as origami in Three.js: flat paper squares fold along crease lines step by step into the characters, with paper shading and visible creases.
Soft daylight, white table, finish with [SIDEKICK] hopping like a paper frog.
```
