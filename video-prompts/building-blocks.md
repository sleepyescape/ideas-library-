# Конструктор промптов

Готовые кусочки, из которых собирается любой промпт. Бери по одному из каждого раздела и склеивай.
Формулировки на английском: генераторы видео понимают его лучше всего.

## Формула для генераторов видео (Veo, Sora, Kling, Runway, Seedance, Hailuo, Wan)

```text
[КАДР + КАМЕРА], [ГЕРОЙ + ДЕЙСТВИЕ], [МЕСТО + ВРЕМЯ], [СВЕТ], [СТИЛЬ + ПЛЁНКА], [ЗВУК / РЕПЛИКА]
```

Пример:
`Slow dolly-in, close-up. A tired barista wipes the counter and smiles at the first customer. Tiny corner coffee shop, early morning. Soft window light, steam in the air. 35mm film look, warm grade. Sound: espresso machine hiss, quiet jazz.`

Правила:
- **Один кадр — одно действие.** Сложную сцену дели на 2–4 кадра по 5–10 секунд.
- **Герой одной и той же строкой** во всех кадрах, иначе он «поплывёт».
- **Глаголы движения** (walks, turns, pours), а не прилагательные.
- **Текст в кадре** у генераторов получается плохо: лучше добавь его потом в монтаже.

## Формула для код-анимации (Claude Motion, Claude Code + Remotion / HyperFrames)

```text
Что: [тип ролика] на [N] секунд, формат [16:9 / 9:16 / 1:1].
Кто смотрит и где: [аудитория], [где играет: экран на встрече / Reels / сайт].
Содержание: используй только эти факты: [цифры, текст, прикреплённый файл].
Структура: [сцена 1 → сцена 2 → … → финал с призывом].
Стиль: [палитра], [шрифт], [характер движения: пружинисто / строго / плавно].
Финал: [логотип / ссылка / фраза].
```

Правила:
- **Указывай тайминг** («0–3 s: …»): так ролик получается ровным.
- **Прикладывай свои данные и скриншоты**, чтобы не было выдуманных цифр.
- **Правки по номерам сцен** («в сцене 3 текст крупнее, задержи на 1 s дольше»).

## Крючки для первых 2 секунд

| Крючок | Пример |
|---|---|
| Неожиданный факт | "This one thing costs you 2 hours a day." |
| Вопрос | "Why does nobody talk about [X]?" |
| Обещание результата | "How I made [RESULT] in [TIME]." |
| Ошибка | "Stop doing [X] like this." |
| Рейтинг | "Top 5 [X], number 1 is not what you think." |
| Таймер | "You have 3 seconds to guess…" |
| Конфликт | "[A] vs [B]: which is actually better?" |
| Секрет | "Nobody told me this about [X]." |
| Визуальный шок | Начать с середины действия: брызги, падение, взрыв цвета |
| Прямое обращение | "If you [SITUATION], watch this." |
| До/после | Сначала показать «после», потом отмотать |
| POV | "POV: you just [SITUATION]." |

## Движения камеры

| Английский | Что это |
|---|---|
| static / locked-off shot | неподвижная камера |
| slow dolly-in / dolly-out | плавный наезд / отъезд |
| tracking shot / follow shot | камера едет рядом с героем |
| pan left / right | поворот камеры по горизонтали |
| tilt up / down | наклон камеры вверх / вниз |
| crane up / jib down | подъём / опускание камеры краном |
| 180° / 360° orbit | облёт вокруг объекта |
| handheld | «с рук», живое покачивание |
| FPV drone fly-through | пролёт как на гоночном дроне |
| aerial drone shot | съёмка с дрона сверху |
| dolly zoom / vertigo effect | фон «растягивается» вокруг героя |
| whip pan | резкий смаз-поворот (удобен для склейки) |
| push-in on the punchline | наезд в момент шутки |
| over-the-shoulder | из-за плеча героя |
| first-person POV | от первого лица |
| top-down / overhead | строго сверху |
| low angle / high angle | снизу (герой мощный) / сверху (герой маленький) |
| Dutch angle | заваленный горизонт, тревога |
| rack focus | перевод фокуса с одного объекта на другой |
| speed ramp | ускорение → замедление в одном кадре |

## Планы

`extreme wide shot` (очень общий) · `wide shot` (общий) · `full shot` (в полный рост) · `medium shot` (по пояс) · `close-up` (лицо) · `extreme close-up` (глаз, деталь) · `macro` · `two-shot` (двое в кадре) · `insert shot` (деталь действия)

## Свет

`golden hour` (тёплый закат) · `blue hour` (синие сумерки) · `soft window light` · `harsh midday sun` · `backlight / rim light` (контровой, светящийся контур) · `neon lights` · `candlelight` · `moonlight` · `studio softbox` · `volumetric light rays` (лучи в дымке) · `chiaroscuro` (резкий свет и тень) · `overcast diffused light` (пасмурно, мягко) · `practical lights` (лампы в кадре)

## Стили

| Стиль | Ключевые слова |
|---|---|
| Кино | cinematic, anamorphic, 35mm film, film grain, shallow depth of field |
| Документалка | documentary realism, handheld, natural light, telephoto |
| Реклама | commercial, premium, studio lighting, crisp, 8K detail |
| UGC | phone footage, vertical, front camera, authentic, slight shake |
| VHS / 90-е | VHS tape, scan lines, washed colours, timestamp |
| Пластилин | claymation, stop-motion, fingerprints in clay, 12 fps |
| 3D-мультик | stylised 3D animation, big expressive eyes, soft subsurface |
| Аниме | anime, hand-drawn, speed lines, cel shading |
| Акварель | watercolour storybook, paper texture, soft edges |
| Пиксель-арт | pixel art, 16-bit, limited palette |
| Бумага | paper cut-out, layered paper, soft drop shadows |
| Нуар | film noir, black and white, venetian blind shadows |
| Киберпанк | neon, rain, reflections, holograms, night city |
| Миниатюра | tilt-shift, miniature, toy-like colours |
| Сюрреализм | surreal, dreamlike, impossible scale |
| Ретро-футуризм | retro-futurism, 1960s space age, chrome, pastel |
| Минимализм | minimal, clean background, negative space |
| Lo-fi | lo-fi aesthetic, cosy, warm lamp, soft grain |

## Стили для код-анимации (Claude Motion / Remotion)

`kinetic typography` · `Swiss grid` · `flat illustration` · `isometric` · `glassmorphism` · `neubrutalism` (толстые обводки, яркие плашки) · `hand-drawn whiteboard` · `blueprint` (синие чертежи) · `terminal / monospace` · `paper & collage` · `chrome & black` · `pastel 3D shapes` · `data-viz editorial` (как в газетной инфографике) · `retro 8-bit`

## Характер движения (для код-анимации)

`spring / overshoot` (пружинисто) · `ease-out` (быстро начинается, мягко останавливается) · `linear` (механически, строго) · `stagger 60 ms` (элементы по очереди) · `match cut` (форма одного кадра переходит в форму другого) · `mask reveal` (появление через маску) · `morph` (одна фигура перетекает в другую) · `on the beat` (всё на долю музыки)

## Звук

`Sound: [ambient]` + `[action sound]` + `[music mood]`. Например: `Sound: rain on glass, a kettle clicks off, soft lo-fi piano.`
Для реплики: `Dialogue: "..."` и голос: `Voice: calm, warm, slightly amused, female, 30s`.

## Негативный промпт (если генератор поддерживает)

```text
blurry, distorted hands, extra fingers, warped faces, flickering, text artifacts, watermark, logo, low resolution, jittery motion
```

## Чек-лист перед генерацией

1. Формат: 9:16 для Reels/TikTok/Shorts, 16:9 для YouTube, 1:1 для ленты.
2. Длина кадра: 5–10 секунд у генераторов; у код-анимации можно 15–60.
3. Один кадр = одно действие + одно движение камеры.
4. Герой описан одной и той же строкой.
5. Нет реальных людей, чужих логотипов и персонажей.
6. Крючок в первые 2 секунды.
7. Текст и субтитры: в монтаже (или в код-анимации).
