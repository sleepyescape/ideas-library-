# Яндекс Спейс — рекламный скетч «Пару отменили»

Формат: 16:9, реализм («снято на камеру», ИИ не должен считываться), ~30 сек.
Пайплайн: Midjourney (референсы и первые кадры) → Hailuo / MiniMax (image-to-video, клипы по 6 сек)
→ ElevenLabs (голоса) → монтаж (CapCut / Premiere): уведомления, экран приложения, логотип.

Идея из чата: стоим ждём пару → резко приходит уведомление «пары не будет» → «омагад, чё делать,
куда идти» → заходим в Спейс и смотрим, куда идти.

---

## 1. Сценарий (раскадровка)

| # | Время | Кадр | Звук / реплика |
|---|-------|------|----------------|
| 1 | 0–3 c | Утро, коридор вуза. Трое студентов у двери аудитории, сонные, с кофе. Средний план. | Гул коридора. |
| 2 | 3–5 c | Крупно: телефон у Камили в руке, вибрирует. На экране (вставка в монтаже) — «Пары не будет. Перенос на четверг». | Звук уведомления. |
| 3 | 5–8 c | Камиля поднимает глаза на друзей. Пауза. Эмиль медленно опускает стакан кофе. | Камиля: «Пары не будет». |
| 4 | 8–11 c | Все трое переглядываются, Эмиль разводит руками. | Эмиль: «Омагад… и чё делать?» Аля: «Куда идти вообще?» |
| 5 | 11–13 c | Аля с хитрой улыбкой достаёт телефон: «Щас». | Аля: «Щас, в Спейсе гляну». |
| 6 | 13–17 c | Экран телефона на весь кадр (запись экрана прототипа): цель «Спокойно посидеть», карта, «Бульвар Кофе», зелёный столик → «Забронировать» → «Забронировано!». | Тапы, мягкий «дзынь». |
| 7 | 17–20 c | Улица Казани, пасмурная поздняя осень. Трое бодро идут, камера едет перед ними. | Музыка заходит. |
| 8 | 20–24 c | Входят в тёплое кафе, проходят к свободному столику у окна. | Голос за кадром (диктор). |
| 9 | 24–27 c | За столиком: кофе, ноутбук, смеются. | Диктор. |
| 10 | 27–30 c | Пэкшот: логотип Спейс на жёлтом, слоган. Делается в монтаже / кодом, не нейросетью. | Диктор: слоган. |

**Голос за кадром (диктор, кадры 8–10):**
«Пару отменили — день не пропал. Свободные столики рядом, бронь без звонка. Спейс».

Запасные слоганы: «Пары нет — место есть.» / «Спейс знает, куда пойти.» / «Свободный столик — в два касания.»

> Реплики лучше давать **не в лицо крупно** (затылок, телефон в кадре, отворот головы) — тогда
> не нужен липсинк, и голос из ElevenLabs садится естественно. Если хотите говорящие лица —
> Hailuo умеет, но рты «плывут»; проверяйте на 1–2 дублях.

---

## 2. Герои (одни и те же во всех кадрах)

- **Камиля** — 19 лет, татарская внешность, тёмные волосы в низком хвосте, бежевый оверсайз-свитер,
  светлые джинсы, холщовый шопер. Получает уведомление.
- **Аля** — 20 лет, светло-русое каре до подбородка, очки в тонкой металлической оправе,
  серое худи, длинное тёмно-зелёное пальто. Открывает Спейс.
- **Эмиль** — 20 лет, короткая тёмная стрижка, лёгкая щетина, чёрный бомбер, белая футболка,
  наушники на шее, бумажный стакан кофе. Главный «омагад».

---

## 3. Midjourney — 14 карточек-референсов

Общие правила:
- Окончание каждого промпта: `--ar 16:9 --style raw --v 7 --s 50`
- Для реализма: «candid photo», «shot on Sony A7 III, 35mm», естественный свет, лёгкое зерно.
  **Не пишите** «cinematic, 8k, ultra detailed, masterpiece» — это и даёт «пластиковый ИИ».
- Сначала делаете **листы персонажей (1–3)**. Потом в каждом кадре с героем добавляете
  `--oref <ссылка на лист> --ow 100` (в v7 — Omni Reference; в v6 то же самое `--cref ... --cw 100`).
- Для единого стиля выберите лучший кадр локации и добавляйте его ссылку как `--sref` во все остальные.
- Никакого текста и логотипов в генерации — их нейросеть исказит. Экраны телефонов — тёмные/бликующие,
  содержимое вставляется в монтаже.

### Листы персонажей

**1. Камиля**
```
character reference sheet, the same young woman shown three times side by side: front view, three-quarter view, profile, 19 years old, Tatar features, dark brown hair in a low ponytail, natural makeup, beige oversized knit sweater, light blue jeans, canvas tote bag, plain light grey studio background, soft even daylight, realistic skin texture with pores, candid photo, shot on Sony A7 III 50mm --ar 16:9 --style raw --v 7 --s 50
```

**2. Аля**
```
character reference sheet, the same young woman shown three times side by side: front view, three-quarter view, profile, 20 years old, chin-length ash-blonde bob, thin round metal-frame glasses, grey hoodie under a long dark green wool coat, plain light grey studio background, soft even daylight, realistic skin texture, candid photo, shot on Sony A7 III 50mm --ar 16:9 --style raw --v 7 --s 50
```

**3. Эмиль**
```
character reference sheet, the same young man shown three times side by side: front view, three-quarter view, profile, 20 years old, short dark hair, light stubble, black bomber jacket over white t-shirt, wired headphones around his neck, holding a paper coffee cup, plain light grey studio background, soft even daylight, realistic skin texture, candid photo, shot on Sony A7 III 50mm --ar 16:9 --style raw --v 7 --s 50
```

### Локации (пустые, без людей)

**4. Коридор вуза**
```
empty corridor of an old Russian university building, high ceilings, painted walls in pale green and white, worn parquet floor, wooden classroom doors with brass handles, tall windows with overcast November morning light, radiators under windows, a wooden bench by the wall, quiet and slightly sleepy atmosphere, realistic photo, 35mm, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

**5. Улица Казани**
```
pedestrian street in the historic center of Kazan, late November, overcast sky, wet cobblestone pavement, two-story 19th century facades in pastel colors, bare trees, a few blurred passers-by in coats, cold soft light, realistic street photo, 35mm, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

**6. Кафе изнутри**
```
interior of a cozy specialty coffee shop, warm tungsten lights, wooden tables, large window to a grey autumn street, green plants, a free table for three by the window with a small blank mustard-yellow table card, laptops on other tables, calm morning, realistic photo, 35mm, shallow depth of field, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

### Ключевые кадры (первые кадры для Hailuo)

В каждом кадре с героями: `--oref <лист нужного героя> --ow 100 --sref <кадр локации>`.
Где в кадре трое — сначала добейтесь удачного **кадра 7**, а дальше используйте его как картинку-референс
(вставить ссылку в начало промпта) — это держит всех троих одинаковыми.

**7. Ждём пару (кадр 1)**
```
three university students waiting by a closed classroom door in an old university corridor: a young Tatar woman with a low dark ponytail in a beige oversized sweater, a young woman with an ash-blonde bob and round glasses in a long dark green coat, a young man in a black bomber jacket holding a paper coffee cup, sleepy, leaning on the wall, overcast morning window light, medium wide shot, candid documentary photo, 35mm, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

**8. Уведомление (кадр 2)**
```
close-up over the shoulder of a young woman in a beige knit sweater holding a smartphone in her hand, the phone screen is lit but out of focus, blurred university corridor in the background, overcast window light, shallow depth of field, candid photo, 50mm --ar 16:9 --style raw --v 7 --s 50
```

**9. «Пары не будет» (кадр 3)**
```
medium close-up of a young Tatar woman with a low dark ponytail in a beige sweater looking up from her phone with a blank surprised expression, two friends slightly out of focus beside her, old university corridor, overcast window light, candid documentary photo, 50mm, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

**10. «Омагад» (кадр 4)**
```
young man in a black bomber jacket with headphones around his neck holding a paper coffee cup, shrugging with both hands, confused funny expression, two young women next to him looking at each other, old university corridor, overcast light, medium shot, candid documentary photo, 35mm --ar 16:9 --style raw --v 7 --s 50
```

**11. «Щас, в Спейсе гляну» (кадр 5)**
```
young woman with an ash-blonde bob and round metal glasses in a dark green coat taking out her smartphone with a sly confident smile, friends looking at her, old university corridor, overcast window light, medium close-up, candid documentary photo, 50mm, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

**12. Идут по улице (кадр 7)**
```
three young friends walking briskly toward the camera on a wet cobblestone street in the historic center of Kazan, late November, overcast, the young man in a black bomber jacket laughing, the woman with a blonde bob and glasses in a dark green coat, the woman with a dark ponytail in a beige sweater under a light coat, natural motion, front tracking shot, candid street photo, 35mm, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

**13. Входят в кафе (кадр 8)**
```
three young friends entering a cozy coffee shop from a grey autumn street, warm tungsten interior light contrasting with cold daylight outside, shaking off the cold, smiling, a free table by the window, medium wide shot from inside the cafe, candid photo, 35mm, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

**14. За столиком (кадр 9)**
```
three young friends sitting at a wooden table by the window in a cozy coffee shop, cups of cappuccino, an open laptop, a small blank mustard-yellow table card, laughing naturally, warm tungsten light, grey autumn street outside the window, medium shot, candid lifestyle photo, 35mm, shallow depth of field, subtle film grain --ar 16:9 --style raw --v 7 --s 50
```

Бонус (если нужно больше карточек): **15** — крупно руки на стакане кофе, пар; **16** — затылки троих
у двери аудитории; **17** — крупно палец тапает по тёмному экрану телефона (для перехода к записи экрана).

---

## 4. Hailuo / MiniMax — промпты для видео

Режим **Image-to-Video**, первый кадр = картинка из MJ (номер в скобках). Длительность 6 сек
(10 сек — только для кадра 7), 1080p. Где доступно — добавьте лист персонажа в **Subject Reference**.
Промпты на английском — модель понимает их стабильнее. Команды камеры в квадратных скобках.
Генерируйте 2–3 дубля каждого и берите лучший.

**V1 — Ждём пару (MJ 7)**
```
[Static shot] Three sleepy students wait by a classroom door in an old university corridor. The young man slowly sips his coffee, the girl in glasses yawns and leans against the wall, the girl in the beige sweater scrolls her phone. Subtle handheld camera sway, natural overcast window light, realistic documentary footage, no text on screen.
```

**V2 — Уведомление (MJ 8)**
```
[Push in] The phone in the girl's hand vibrates once, she lifts it slightly closer to read the screen. Slow push-in toward the phone, background stays blurred, handheld, realistic, no text on screen.
```

**V3 — «Пары не будет» (MJ 9)**
```
[Static shot] The girl looks up from her phone to her friends with a frozen, surprised face, a beat of silence, she slowly blinks. Friends in the background turn their heads toward her. Handheld documentary camera, natural light, realistic, no text on screen.
```

**V4 — «Омагад» (MJ 10)**
```
[Static shot] The young man lowers his coffee cup, then throws up both hands in a confused shrug, the two girls exchange a look and laugh nervously. Natural comedic timing, slight handheld shake, realistic documentary footage, no text on screen.
```

**V5 — Достаёт телефон (MJ 11)**
```
[Push in] The girl in glasses smiles slyly, takes her phone out of her coat pocket and starts tapping on it, friends lean in to look at the screen. Slow push-in, handheld, natural light, realistic, no text on screen.
```

**V6 — Улица (MJ 12), 10 сек**
```
[Tracking shot] Three friends walk briskly toward the camera along a wet cobblestone street in autumn Kazan, laughing and talking, their breath slightly visible in the cold air. The camera moves backward in front of them at walking pace. Overcast light, realistic street footage, natural motion, no text on screen.
```

**V7 — Вход в кафе (MJ 13)**
```
[Pan right] The friends step into a warm cozy coffee shop from the cold street, unwrap scarves, look around and head to a free table by the window. Warm tungsten interior, realistic footage, natural movement, no text on screen.
```

**V8 — За столиком (MJ 14)**
```
[Static shot] Three friends sit down at the window table with cappuccinos, one opens a laptop, they laugh at a joke, warm steam rises from the cups. Gentle handheld, shallow depth of field, warm light, realistic lifestyle footage, no text on screen.
```

---

## 5. Что делаем НЕ нейросетью

- **Уведомление «Пары не будет»** (кадр 2) — накладывается в монтаже поверх экрана.
- **Экран приложения** (кадр 6) — настоящая запись экрана прототипа
  https://sleepyescape.github.io/yandex-space/ (цель «Спокойно посидеть и поработать» → «Бульвар Кофе»
  → зелёный столик → «Забронировать» → «Подтвердить бронь»). Можно снять с iPhone, а можно отрендерить
  чисто кодом в 16:9 с телефоном в руке/на фоне.
- **Пэкшот** (кадр 10) — логотип и слоган на жёлтом `#FFDB4D`, шрифт Inter. Тоже кодом/в монтаже.

## 6. ElevenLabs

- Реплики героев: 3 разных голоса молодёжи (Voice Library, фильтр Russian, young). Stability ~40%,
  Style ~30% — живее. Пишите реплики разговорно: «Омагад… и чё делать?»
- Диктор: тёплый спокойный голос, Stability ~60%.
- Склейка: голоса + звук коридора/улицы/кафе (SFX в ElevenLabs Sound Effects: «university corridor
  ambience», «phone notification vibration», «coffee shop ambience») + лёгкий трек на финале.

## 7. Чтобы ИИ не считывался

1. Планы короткие (2–4 сек в монтаже), режьте лучшие куски из 6-секундных клипов.
2. Не показывайте крупно руки с пальцами и любой текст — кроме вставок из монтажа.
3. Общая цветокоррекция на все клипы (одна LUT), лёгкое зерно и чуть смягчённая резкость.
4. Реальный звук окружения важнее картинки — он «продаёт» реализм.
5. Если герой «поплыл» между клипами — перегенерируйте с Subject Reference, а не прячьте монтажом.

---

## 8. Hailuo: 5 клипов по 12 секунд

Каждый клип — непрерывное действие по таймингу; в монтаже режем лучшие куски и перебиваем
вставками (уведомление, экран приложения). 60 сек исходников → ролик ~30–35 сек.

**Клип 1 ← кадр 2 (Камиля с телефоном). Subject Reference: Л1**
```
[Static shot, slight handheld] An old university corridor, overcast morning. 0-4s: a sleepy young woman in a beige sweater leans against the wall next to a classroom door, holding her phone, friends blurred beside her. 4-8s: the phone vibrates, she lifts it closer and reads the screen, her face slowly freezes. 8-12s: she lowers the phone and looks up at her friends with a blank surprised expression, a beat of silence. Realistic documentary footage, natural window light, no text on screen.
```

**Клип 2 ← кадр 4 (Эмиль). Subject Reference: Л3**
```
[Static shot, slight handheld] An old university corridor. 0-4s: the young man in a black bomber jacket stares at his friend, slowly lowering his paper coffee cup. 4-8s: he throws up both hands in a confused, funny shrug and says something. 8-12s: the two girls next to him exchange a look and laugh nervously, he shakes his head. Natural comedic timing, overcast window light, realistic documentary footage, no text on screen.
```

**Клип 3 ← кадр 5 (Аля). Subject Reference: Л2**
```
[Slow push in] 0-4s: the girl in round glasses smiles slyly and takes her phone out of her coat pocket. 4-8s: she taps on the screen, her two friends lean in to look over her shoulders. 8-12s: all three light up with smiles, the young man nods, they grab their bags and walk away down the corridor. Handheld, overcast window light, realistic documentary footage, no text on screen.
```

**Клип 4 ← кадр 6 (улица)**
```
[Tracking shot] Three friends walk briskly toward the camera along a wet cobblestone street in autumn Kazan, the camera moves backward in front of them at walking pace the whole time. 0-6s: they laugh and talk, their breath slightly visible in the cold air. 6-12s: the girl in glasses points ahead to a cafe, the others nod and speed up. Overcast light, natural motion, realistic street footage, no text on screen.
```

**Клип 5 ← кадр 7 (вход в кафе)**
```
[Slow pan right] 0-4s: the friends step into a warm cozy coffee shop from the cold street and unwrap their scarves. 4-8s: they walk to a free table by the window and sit down. 8-12s: cappuccinos on the table, one opens a laptop, they laugh together, steam rises from the cups. Warm tungsten light, shallow depth of field, realistic lifestyle footage, no text on screen.
```

Монтаж: Клип 1 (вставка уведомления на 4–8 с) → Клип 2 → Клип 3 (0–8) → запись экрана Спейса (4 с)
→ Клип 3 (8–12) → Клип 4 (5–6 с) → Клип 5 (8–9 с) → пэкшот (3 с).
