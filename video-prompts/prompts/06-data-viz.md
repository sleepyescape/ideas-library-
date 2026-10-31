# Данные, графики, отчёты

Оживить цифры: квартальный отчёт, гонка графиков, карта, инфографика.
Прикладывайте таблицу (CSV/Excel) — Claude построит графики из реальных данных.

## Квартальный отчёт за 30 секунд
- **Где:** Claude Motion
- **Формат:** 30 с · 16:9
- **Теги:** report, all-hands, kpi

```text
Turn our Q[N] report into a 30-second explainer for the all-hands. [ATTACH REPORT / DATA].
Pick the 4 most important numbers. For each: the metric name, the number counting up, the change vs last quarter with a green/red arrow, and one sentence of context.
Open with "Q[N] in 30 seconds", close with "What's next: [PRIORITY]".
Company colours [HEX], clean charts, no 3D.
```

## Гонка графиков (bar chart race)
- **Где:** Claude Code + Remotion
- **Формат:** 30–60 с · 16:9
- **Теги:** bar-chart-race, data, history

```text
Make a bar chart race from [DATA FILE / DATA DESCRIPTION]: [ENTITIES] by [METRIC] from [YEAR START] to [YEAR END].
Bars reorder smoothly, each with a logo or flag and a value label; a big year counter in the bottom right.
Annotate 2–3 key moments with short captions ("[EVENT]").
Hold the final ranking for 3 seconds.
Readable at phone size: max 10 bars, thick labels.
```

## График, который рисуется сам
- **Где:** Claude Motion
- **Формат:** 15 с · 16:9
- **Теги:** chart, board-deck, animation

```text
Add motion to this chart for the board deck: [ATTACH CHART / DATA].
The axes draw first, then the line draws left to right while a dot rides its tip and a value label updates.
At [POINT OF INTEREST] the line pauses, a callout appears: "[ANNOTATION]".
Finish with the final value highlighted. Minimal, corporate, brand colour [HEX].
```

## Карта с маршрутом / распространением
- **Где:** Claude Motion, Remotion
- **Формат:** 30 с · 16:9
- **Теги:** map, route, geography

```text
An animated map showing [WHAT: our expansion / a trip / the spread of something] across [REGION].
Start zoomed on [START LOCATION]; lines arc to [LOCATION 2], [LOCATION 3], [LOCATION 4] in order, with dates appearing next to each.
Cities pulse when reached; a counter tracks [METRIC].
Flat muted map, bright accent lines, smooth camera pans between points.
```

## Инфографика «один человек из 100»
- **Где:** Claude Motion
- **Формат:** 25 с · 9:16 или 1:1
- **Теги:** infographic, people, percentage

```text
Show [STATISTIC, e.g. "If the world were 100 people…"] as a 10×10 grid of tiny person icons.
For each fact ([FACT 1 – N%], [FACT 2 – N%], [FACT 3 – N%]), the matching number of icons changes colour and a caption appears.
Reset between facts with a quick ripple.
Clean flat icons, warm palette, calm music.
```

## Дашборд оживает
- **Где:** Claude Motion, Remotion
- **Формат:** 20 с · 16:9
- **Теги:** dashboard, kpi, ui

```text
A 20-second animation of a [COMPANY] dashboard coming alive.
Tiles drop in on a grid: [KPI 1], [KPI 2], [KPI 3], a line chart, a donut chart, a table.
Numbers tick up, charts draw, a live dot pulses on "Real-time".
Camera slowly glides across the dashboard at a slight 3D angle, then flattens to front view.
Dark mode UI, neon accents.
```

## Год в цифрах
- **Где:** Claude Motion
- **Формат:** 45 с · 9:16 и 16:9
- **Теги:** year-in-review, numbers, recap

```text
"[YEAR] in numbers" for [COMPANY / TEAM / PERSONAL].
8 numbers, one per beat: [NUMBER – LABEL] × 8. Each with a matching mini-animation (a plane for trips, a coffee cup for coffees, etc.).
Accelerate pacing towards the end, finish with "Thank you / See you in [NEXT YEAR]".
Festive but clean: dark navy, gold accents, confetti at the end.
```

## Сравнение долей (пирог → столбцы)
- **Где:** Claude Motion
- **Формат:** 15 с · 1:1
- **Теги:** pie, morph, chart

```text
Show how [BUDGET / TIME / MARKET] is split: [CATEGORY – %] × 4–5.
Start as a donut chart that fills segment by segment with labels, then morph the segments into a ranked bar chart so the differences are easier to compare.
Final: highlight [CATEGORY] with a callout "[INSIGHT]".
```

## Временная шкала (таймлайн)
- **Где:** Claude Motion, Remotion
- **Формат:** 45 с · 16:9
- **Теги:** timeline, history, milestones

```text
An animated timeline of [SUBJECT] from [START] to [END].
A horizontal line draws itself; the camera tracks along it.
Milestones ([DATE – EVENT] × 6–8) pop up above/below alternately, each with a small icon or image.
Speed up through quiet periods, slow down on the big ones.
End with "Today" and a glowing dot.
```

## Воронка продаж
- **Где:** Claude Motion
- **Формат:** 20 с · 16:9
- **Теги:** funnel, sales, marketing

```text
Animate our sales funnel: [STAGE 1 – N], [STAGE 2 – N], [STAGE 3 – N], [STAGE 4 – N].
Particles pour into the top and fall through; at each stage some drop off to the side, and the conversion % appears.
Highlight the biggest drop-off in red: "[INSIGHT]".
Clean isometric funnel, brand colours.
```

## Данные о погоде/природе как арт
- **Где:** Claude Code + Remotion, p5.js
- **Формат:** 30 с · 1:1
- **Теги:** generative, data-art, climate

```text
Turn [DATASET, e.g. daily temperatures in [CITY] over 50 years] into a 30-second generative data-art animation.
Each data point becomes a [stripe / ring / particle] coloured on a blue-to-red scale.
The piece builds over time; the year counter shows in small type.
End with a single sentence about what the pattern shows.
Minimal, gallery-like, black background.
```

## Отчёт инвесторам
- **Где:** Claude Motion
- **Формат:** 60 с · 16:9
- **Теги:** investors, update, startup

```text
A 60-second investor update video for [STARTUP], [MONTH].
Sections: headline metric (big number + MoM growth), revenue chart, key wins (3 bullets with icons), challenges (1–2, honest), asks ("We're looking for: [ASK]").
Calm confident pace, clean charts, founder photo optional in the intro.
Brand colours [HEX], subtle background music.
```
