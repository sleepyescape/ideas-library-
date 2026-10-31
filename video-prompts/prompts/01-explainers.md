# Объясняющие ролики

Сложная идея за 20–90 секунд: метафора, схема, пошаговый разбор.
Лучше всего делаются в Claude Motion или кодом (Remotion, HyperFrames): текст, схемы, иконки.

## Сложное через простую метафору
- **Где:** Claude Motion, Remotion
- **Формат:** 45 с · 9:16 или 16:9
- **Теги:** explainer, metaphor, shorts

```text
Make a 45-second animated explainer of [CONCEPT] for [AUDIENCE] using one metaphor: [CONCEPT] is like [EVERYDAY THING].
Open with a hook question in big type in the first 2 seconds: "[HOOK QUESTION]?".
Act 1 (0–10s): show the everyday thing with simple flat shapes and label each part.
Act 2 (10–35s): morph each part of the metaphor into the matching part of [CONCEPT], one at a time, with a short caption per step.
Act 3 (35–45s): pull back to show the whole system working, then a one-line takeaway: "[TAKEAWAY]".
Style: flat 2D, two colours plus one accent ([ACCENT COLOUR]), rounded shapes, soft easing, no stock icons.
```

## Как это работает: процесс по шагам
- **Где:** Claude Motion, Remotion
- **Формат:** 30–60 с · 16:9
- **Теги:** explainer, process, diagram

```text
Animate how [PROCESS] works in [N] steps for [AUDIENCE].
Each step gets its own beat of about 5 seconds: a numbered label slides in, a simple diagram builds itself, and an arrow carries the result into the next step.
Keep one persistent object (a dot, a document, a package) travelling through every step so the viewer can follow it.
End on the full pipeline visible at once, with the object arriving at "[FINAL RESULT]".
Clean white background, thin 2px lines, one brand colour [HEX], monospaced labels, ease-in-out on every move.
```

## «Было → стало»
- **Где:** Claude Motion, Remotion
- **Формат:** 20 с · 1:1 или 9:16
- **Теги:** explainer, before-after, social

```text
A 20-second before/after explainer. Split the frame vertically.
Left side, labelled "Before": [OLD WAY], shown as a cluttered, slow, grey animation (things piling up, a clock ticking, a progress bar stalling).
Right side, labelled "After": [NEW WAY], the same task done in colour, fast and tidy, finishing first.
At 15 seconds the divider slides left and the "After" side takes the whole frame, with the line "[RESULT, e.g. 3 hours → 10 minutes]".
Bold sans-serif type, high contrast, snappy cuts.
```

## Разбор научной статьи
- **Где:** Claude Motion, Remotion
- **Формат:** 60–90 с · 16:9
- **Теги:** explainer, research, paper

```text
Turn this paper into a 75-second animated explainer for a smart non-expert: [PASTE ABSTRACT OR LINK].
Structure: the question (why it matters) → what people believed before → the method in one diagram → the key result as an animated chart → one limitation → what it changes.
Show the main number from the paper large and let it count up.
Use a calm editorial look: off-white paper texture, serif headings, sans-serif labels, ink-blue accent, gentle camera drift.
Put a small citation in the corner of every scene.
```

## Термин за 15 секунд
- **Где:** Claude Motion
- **Формат:** 15 с · 9:16
- **Теги:** explainer, glossary, series

```text
A 15-second vertical "word of the day" clip that defines [TERM].
0–3s: the term types itself in huge letters, with the pronunciation underneath.
3–10s: a one-sentence definition appears word by word while a tiny animated example plays above it.
10–15s: "Example: [EXAMPLE SENTENCE]" and a series logo "[SERIES NAME] #[NUMBER]".
Make it work as a series template: keep the layout fixed, only text and the example change.
```

## Почему это происходит
- **Где:** Claude Motion, Remotion
- **Формат:** 40 с · 9:16
- **Теги:** explainer, curiosity, science

```text
Answer "Why [EVERYDAY PHENOMENON]?" in a 40-second vertical explainer.
Start with the phenomenon as a simple looping illustration and the question in bold.
Zoom in three levels (everyday scale → small scale → tiny scale), each with a one-line caption explaining what happens there.
Zoom back out and replay the opening loop, now with labels showing the cause.
Bright, friendly palette, chunky outlines, playful bounce easing, captions centred in the safe area.
```

## Сравнение двух вариантов
- **Где:** Claude Motion, Remotion
- **Формат:** 30 с · 16:9
- **Теги:** explainer, comparison, versus

```text
A 30-second comparison of [OPTION A] vs [OPTION B] for [AUDIENCE].
Two cards face each other like opponents. For each of [N] criteria ([CRITERION 1], [CRITERION 2], [CRITERION 3]) a row appears and a meter fills on each side.
Keep it fair: show where each one wins.
Finish with "Pick [A] if… / Pick [B] if…" side by side.
Neutral dark background, A in [COLOUR A], B in [COLOUR B], scoreboard-style numbers.
```

## Ошибка, которую делают все
- **Где:** Claude Motion
- **Формат:** 30 с · 9:16
- **Теги:** explainer, mistake, hook

```text
A 30-second vertical clip: "The [TOPIC] mistake almost everyone makes".
Hook: the mistake shown as a quick animation that ends with a big red cross.
Then: why it happens (one diagram), what to do instead (three short animated steps), and the result compared side by side.
Close with "Save this for later" and a bookmark icon that pops.
High-contrast black and yellow, heavy condensed type, cuts on every sentence.
```

## Объяснение кода/алгоритма
- **Где:** Claude Motion, Remotion
- **Формат:** 45 с · 16:9
- **Теги:** explainer, code, algorithm

```text
Animate how [ALGORITHM / CODE CONCEPT] works, for junior developers.
Left half: the code ([LANGUAGE], max 12 lines), with the current line highlighted as it runs.
Right half: the data structure it changes ([ARRAY / TREE / QUEUE]), animated step by step in sync with the highlighted line.
Run one small example ([INPUT]) all the way to the output ([OUTPUT]).
End with the Big-O written large and a one-line intuition.
Dark editor theme, monospace font, cyan highlight, smooth 300ms transitions.
```

## Миф или правда
- **Где:** Claude Motion
- **Формат:** 25 с · 9:16
- **Теги:** explainer, myth, social

```text
A 25-second vertical "Myth or fact?" clip about [TOPIC].
Show the claim "[CLAIM]" on a card. A stamp hovers between MYTH and FACT for 2 seconds of suspense, then slams down on [ANSWER].
Explain why in three quick animated captions with one simple illustration each.
Finish with the true statement and "Follow for more myths".
Stamp-and-paper look, kraft background, red and green ink, slight paper shake on the stamp.
```

## Путь пользователя
- **Где:** Claude Motion, Remotion
- **Формат:** 45 с · 16:9
- **Теги:** explainer, journey, ux

```text
Animate the journey of [PERSONA] through [PRODUCT / SERVICE / PROCESS], from [START] to [GOAL].
A small character walks along a winding path; each stop is a touchpoint ([STEP 1], [STEP 2], [STEP 3], [STEP 4]) with a mood emoji that shows how they feel there.
Highlight the pain point at [STEP] in red and the fix in green.
End with an overview map of the whole path.
Isometric flat illustration, pastel palette, gentle camera follow.
```

## Цифры, которые трудно представить
- **Где:** Claude Motion, Remotion
- **Формат:** 40 с · 16:9 или 9:16
- **Теги:** explainer, scale, numbers

```text
Make [BIG NUMBER / SCALE, e.g. "a billion seconds"] feel real in 40 seconds.
Start with something countable (one dot = [UNIT]). Keep zooming out and multiplying the dots, comparing them to familiar things at each step ([COMPARISON 1], [COMPARISON 2], [COMPARISON 3]).
Show a counter in the corner the whole time.
End with the full number spelled out and one surprising line: "[PUNCHLINE]".
Black background, white dots, one warm accent colour, slow, deliberate zooms.
```
