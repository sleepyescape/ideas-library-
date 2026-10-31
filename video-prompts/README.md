# Библиотека промптов для роликов

Шаблоны промптов для разных видео: объясняющие ролики, запуски продуктов, реклама, Reels/TikTok,
типографика, графики, логотипы, обучение, мультики, кинокадры, музыка, личные и рабочие видео,
фоны и стили. Каждый шаблон готов к копированию: замените `[ПОЛЯ В СКОБКАХ]` своим и вставьте
в Claude Motion, Claude Code (Remotion) или видеогенератор (Veo, Sora, Kling, Seedance, Runway).

## Как пользоваться

1. Найдите тип ролика в списке ниже и откройте шаблон.
2. Скопируйте блок промпта, заполните `[ПОЛЯ]`. Лишние строки можно удалить.
3. Хотите другой вид — допишите в конец стиль из [стилей-модификаторов](prompts/15-style-modifiers.md).
4. Не уверены, как написать свой, — загляните в [шпаргалку](guide.md): формулы, словарь камеры, чек-лист.

Можно попросить Claude: «возьми шаблон „Запуск SaaS за 30 секунд“ из `video-prompts` и заполни
для моего продукта: …» — он подставит данные сам.

## Файлы

- [`guide.md`](guide.md) — как писать промпты для анимации и для видеогенераторов, словари камеры, света, движения.
- [`prompts/`](prompts) — шаблоны по разделам, один файл на раздел.
- [`catalog.json`](catalog.json) — все шаблоны как данные (генерируется).
- Список ниже и `catalog.json` пересобирает `python3 tools/video_prompts.py` после правок в `prompts/`.

## Источники и что ещё посмотреть

Шаблоны в этой папке написаны для этой библиотеки. Для вдохновения и чужих реальных примеров:

- **Anthropic — [Claude Dashboards и Claude Motion](https://claude.com/resources/articles/dashboards-and-motion)** (8 октября 2026). Официальный анонс Claude Motion:
  наберите `/motion` в чате Claude, опишите ролик, правьте в редакторе, скачивайте MP4. Пример промпта оттуда:
  «Animate how our pricing plans compare for the sales kickoff». Отдельной галереи промптов у Anthropic нет.
- [`../fliki-claude-motion-graphics/`](../fliki-claude-motion-graphics) — уже в репозитории: 83 реальных ролика, сделанных Claude, с точными промптами авторов.
- [`../subframe-motion/`](../subframe-motion) — уже в репозитории: 309 примеров анимаций с кодом (идеи для переходов и эффектов).
- [motion-graphics.org](https://motion-graphics.org/) — самые просматриваемые ролики Claude с промптами и разборами.
- [claude-motion.com](https://claude-motion.com/claude-motion-prompts) — промпты Claude Motion по сценариям (запуски, соцсети, отчёты, обучение).
- Плагин [`cartoon-reel`](../plugins/cartoon-reel) — ведёт от идеи до готового мультика по шагам.

## Все шаблоны

<!-- index:start -->

**Всего шаблонов: 180** в 15 разделах.

### [Объясняющие ролики](prompts/01-explainers.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Сложное через простую метафору](prompts/01-explainers.md#сложное-через-простую-метафору) | Claude Motion, Remotion | 45 с · 9:16 или 16:9 |
| [Как это работает: процесс по шагам](prompts/01-explainers.md#как-это-работает-процесс-по-шагам) | Claude Motion, Remotion | 30–60 с · 16:9 |
| [«Было → стало»](prompts/01-explainers.md#было--стало) | Claude Motion, Remotion | 20 с · 1:1 или 9:16 |
| [Разбор научной статьи](prompts/01-explainers.md#разбор-научной-статьи) | Claude Motion, Remotion | 60–90 с · 16:9 |
| [Термин за 15 секунд](prompts/01-explainers.md#термин-за-15-секунд) | Claude Motion | 15 с · 9:16 |
| [Почему это происходит](prompts/01-explainers.md#почему-это-происходит) | Claude Motion, Remotion | 40 с · 9:16 |
| [Сравнение двух вариантов](prompts/01-explainers.md#сравнение-двух-вариантов) | Claude Motion, Remotion | 30 с · 16:9 |
| [Ошибка, которую делают все](prompts/01-explainers.md#ошибка-которую-делают-все) | Claude Motion | 30 с · 9:16 |
| [Объяснение кода/алгоритма](prompts/01-explainers.md#объяснение-кодаалгоритма) | Claude Motion, Remotion | 45 с · 16:9 |
| [Миф или правда](prompts/01-explainers.md#миф-или-правда) | Claude Motion | 25 с · 9:16 |
| [Путь пользователя](prompts/01-explainers.md#путь-пользователя) | Claude Motion, Remotion | 45 с · 16:9 |
| [Цифры, которые трудно представить](prompts/01-explainers.md#цифры-которые-трудно-представить) | Claude Motion, Remotion | 40 с · 16:9 или 9:16 |

### [Запуски продуктов и приложений](prompts/02-product-launch.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Запуск SaaS за 30 секунд](prompts/02-product-launch.md#запуск-saas-за-30-секунд) | Claude Motion, Remotion | 30 с · 16:9 |
| [Одна фигура — весь интерфейс](prompts/02-product-launch.md#одна-фигура--весь-интерфейс) | Claude Motion, Remotion | 20 с · 16:9 |
| [Тизер новой функции](prompts/02-product-launch.md#тизер-новой-функции) | Claude Motion | 15 с · 9:16 и 16:9 |
| [Промо приложения для App Store](prompts/02-product-launch.md#промо-приложения-для-app-store) | Claude Motion, Remotion | 25 с · 9:16 (886×1920) |
| [Продукт из одной точки](prompts/02-product-launch.md#продукт-из-одной-точки) | Claude Motion, Remotion | 25 с · 16:9 |
| [Чейнджлог → видео релиза](prompts/02-product-launch.md#чейнджлог--видео-релиза) | Claude Code + Remotion | 30 с · 16:9 |
| [Продукт за один непрерывный кадр](prompts/02-product-launch.md#продукт-за-один-непрерывный-кадр) | Claude Motion, Remotion | 20 с · 16:9 |
| [Product Hunt: «Мы запустились!»](prompts/02-product-launch.md#product-hunt-мы-запустились) | Claude Motion | 20 с · 1:1 |
| [Демо в стиле «напиши → получи»](prompts/02-product-launch.md#демо-в-стиле-напиши--получи) | Claude Motion, Remotion | 12 с · 1:1 |
| [Сравнение тарифов](prompts/02-product-launch.md#сравнение-тарифов) | Claude Motion | 30 с · 16:9 |
| [Запуск в бумажном стиле](prompts/02-product-launch.md#запуск-в-бумажном-стиле) | Claude Motion, Remotion | 15 с · 16:9 |
| [Ролик-милестоун](prompts/02-product-launch.md#ролик-милестоун) | Claude Motion, Remotion | 15 с · 16:9 или 1:1 |

### [Реклама, промо и UGC](prompts/03-ads-ugc.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Проблема → решение → CTA (15 с)](prompts/03-ads-ugc.md#проблема--решение--cta-15-с) | Claude Motion, Remotion | 15 с · 9:16 |
| [UGC-отзыв «как будто снято на телефон»](prompts/03-ads-ugc.md#ugc-отзыв-как-будто-снято-на-телефон) | Veo, Sora, Kling, Seedance | 8–10 с · 9:16 |
| [Товар на столе: «распаковка»](prompts/03-ads-ugc.md#товар-на-столе-распаковка) | Veo, Sora, Kling | 8 с · 9:16 или 1:1 |
| [Продуктовый «герой-кадр»](prompts/03-ads-ugc.md#продуктовый-герой-кадр) | Veo, Sora, Kling, Runway | 6–8 с · 16:9 |
| [Еда: аппетитный крупный план](prompts/03-ads-ugc.md#еда-аппетитный-крупный-план) | Veo, Sora, Kling | 6 с · 9:16 |
| [Акция / распродажа](prompts/03-ads-ugc.md#акция--распродажа) | Claude Motion | 10 с · 9:16 и 1:1 |
| [Отзывы клиентов каруселью](prompts/03-ads-ugc.md#отзывы-клиентов-каруселью) | Claude Motion, Remotion | 20 с · 1:1 |
| [Местный бизнес: «зайдите к нам»](prompts/03-ads-ugc.md#местный-бизнес-зайдите-к-нам) | Veo, Sora, Kling | 8 с · 9:16 |
| [Реклама в стиле гравюры](prompts/03-ads-ugc.md#реклама-в-стиле-гравюры) | Claude Motion, Remotion | 20 с · 16:9 |
| [Сериал из трёх коротких реклам](prompts/03-ads-ugc.md#сериал-из-трёх-коротких-реклам) | Claude Motion | 3 × 6 с · 9:16 |
| [Анти-реклама (самоирония)](prompts/03-ads-ugc.md#анти-реклама-самоирония) | Claude Motion | 20 с · 9:16 |
| [Продукт в руке — реалистичный демо-кадр](prompts/03-ads-ugc.md#продукт-в-руке--реалистичный-демо-кадр) | Veo, Sora, Kling, Seedance | 8 с · 9:16 |

### [Короткие ролики: Reels, TikTok, Shorts](prompts/04-social-shorts.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Топ-5](prompts/04-social-shorts.md#топ-5) | Claude Motion, Remotion | 30 с · 9:16 |
| [«POV:» ситуация](prompts/04-social-shorts.md#pov-ситуация) | Veo, Sora, Kling, Seedance | 8 с · 9:16 |
| [Факт, который взрывает мозг](prompts/04-social-shorts.md#факт-который-взрывает-мозг) | Claude Motion | 15 с · 9:16 |
| [Мини-туториал «3 шага»](prompts/04-social-shorts.md#мини-туториал-3-шага) | Claude Motion | 25 с · 9:16 |
| [Сторителлинг «я сделал X за Y дней»](prompts/04-social-shorts.md#сторителлинг-я-сделал-x-за-y-дней) | Claude Motion, Remotion | 40 с · 9:16 |
| [Вопрос → ответ (для комментариев)](prompts/04-social-shorts.md#вопрос--ответ-для-комментариев) | Claude Motion | 20 с · 9:16 |
| [Ожидание vs реальность](prompts/04-social-shorts.md#ожидание-vs-реальность) | Claude Motion, Veo, Kling | 12 с · 9:16 |
| [Залипательный луп](prompts/04-social-shorts.md#залипательный-луп) | Claude Motion, Remotion | 8 с · 9:16 (бесшовный) |
| [Таймлапс «из ничего в готовое»](prompts/04-social-shorts.md#таймлапс-из-ничего-в-готовое) | Veo, Sora, Kling | 8 с · 9:16 |
| [Тренд-шаблон «вещи, которые…»](prompts/04-social-shorts.md#тренд-шаблон-вещи-которые) | Claude Motion | 20 с · 9:16 |
| [Хук-заставка для начала ролика](prompts/04-social-shorts.md#хук-заставка-для-начала-ролика) | Claude Motion, Remotion | 3 с · 9:16 |
| [Субтитры «как у блогеров»](prompts/04-social-shorts.md#субтитры-как-у-блогеров) | Remotion, Claude Code | любой · 9:16 |

### [Кинетическая типографика](prompts/05-kinetic-typography.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Цитата крупным шрифтом](prompts/05-kinetic-typography.md#цитата-крупным-шрифтом) | Claude Motion, Remotion | 15 с · 9:16 или 1:1 |
| [Манифест бренда](prompts/05-kinetic-typography.md#манифест-бренда) | Claude Motion, Remotion | 45 с · 16:9 |
| [Лирик-видео под трек](prompts/05-kinetic-typography.md#лирик-видео-под-трек) | Claude Code + Remotion | длина трека · 16:9 или 9:16 |
| [Хромовая типографика на бит](prompts/05-kinetic-typography.md#хромовая-типографика-на-бит) | Claude Motion, Remotion | 15 с · 16:9 |
| [Швейцарский стиль](prompts/05-kinetic-typography.md#швейцарский-стиль) | Claude Motion, Remotion | 15 с · 16:9 |
| [Слово меняет смысл](prompts/05-kinetic-typography.md#слово-меняет-смысл) | Claude Motion | 10 с · 1:1 |
| [Титры фильма](prompts/05-kinetic-typography.md#титры-фильма) | Claude Motion, Remotion | 60 с · 16:9 (2.39:1 кашетированный) |
| [Текст набирается в терминале](prompts/05-kinetic-typography.md#текст-набирается-в-терминале) | Claude Motion, Remotion | 20 с · 16:9 |
| [Цифры и статистика типографикой](prompts/05-kinetic-typography.md#цифры-и-статистика-типографикой) | Claude Motion | 20 с · 9:16 |
| [Поэма, проявляющаяся строками](prompts/05-kinetic-typography.md#поэма-проявляющаяся-строками) | Claude Motion, Remotion | 40 с · 16:9 или 9:16 |
| [Типографика из реальных предметов](prompts/05-kinetic-typography.md#типографика-из-реальных-предметов) | Veo, Sora, Kling | 6 с · 16:9 |
| [Глитч-заголовок](prompts/05-kinetic-typography.md#глитч-заголовок) | Claude Motion, Remotion | 5 с · 16:9 |

### [Данные, графики, отчёты](prompts/06-data-viz.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Квартальный отчёт за 30 секунд](prompts/06-data-viz.md#квартальный-отчёт-за-30-секунд) | Claude Motion | 30 с · 16:9 |
| [Гонка графиков (bar chart race)](prompts/06-data-viz.md#гонка-графиков-bar-chart-race) | Claude Code + Remotion | 30–60 с · 16:9 |
| [График, который рисуется сам](prompts/06-data-viz.md#график-который-рисуется-сам) | Claude Motion | 15 с · 16:9 |
| [Карта с маршрутом / распространением](prompts/06-data-viz.md#карта-с-маршрутом--распространением) | Claude Motion, Remotion | 30 с · 16:9 |
| [Инфографика «один человек из 100»](prompts/06-data-viz.md#инфографика-один-человек-из-100) | Claude Motion | 25 с · 9:16 или 1:1 |
| [Дашборд оживает](prompts/06-data-viz.md#дашборд-оживает) | Claude Motion, Remotion | 20 с · 16:9 |
| [Год в цифрах](prompts/06-data-viz.md#год-в-цифрах) | Claude Motion | 45 с · 9:16 и 16:9 |
| [Сравнение долей (пирог → столбцы)](prompts/06-data-viz.md#сравнение-долей-пирог--столбцы) | Claude Motion | 15 с · 1:1 |
| [Временная шкала (таймлайн)](prompts/06-data-viz.md#временная-шкала-таймлайн) | Claude Motion, Remotion | 45 с · 16:9 |
| [Воронка продаж](prompts/06-data-viz.md#воронка-продаж) | Claude Motion | 20 с · 16:9 |
| [Данные о погоде/природе как арт](prompts/06-data-viz.md#данные-о-погодеприроде-как-арт) | Claude Code + Remotion, p5.js | 30 с · 1:1 |
| [Отчёт инвесторам](prompts/06-data-viz.md#отчёт-инвесторам) | Claude Motion | 60 с · 16:9 |

### [Логотипы, интро и заставки](prompts/07-logo-intros.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Медленная сборка логотипа](prompts/07-logo-intros.md#медленная-сборка-логотипа) | Claude Motion, Remotion | 8 с · 16:9 |
| [Логотип из частиц](prompts/07-logo-intros.md#логотип-из-частиц) | Claude Motion, Remotion, Three.js | 6 с · 16:9 |
| [Интро YouTube-канала](prompts/07-logo-intros.md#интро-youtube-канала) | Claude Motion, Remotion | 5 с · 16:9 |
| [Аутро с подпиской](prompts/07-logo-intros.md#аутро-с-подпиской) | Claude Motion, Remotion | 15 с · 16:9 |
| [Стикер-штамп логотипа](prompts/07-logo-intros.md#стикер-штамп-логотипа) | Claude Motion | 3 с · 1:1 |
| [Логотип из жидкости](prompts/07-logo-intros.md#логотип-из-жидкости) | Veo, Sora, Kling, Runway | 6 с · 16:9 |
| [Переход-шторка для видео](prompts/07-logo-intros.md#переход-шторка-для-видео) | Claude Motion, Remotion | 1 с · 16:9 и 9:16 |
| [Лоуэр-тёрд (подпись спикера)](prompts/07-logo-intros.md#лоуэр-тёрд-подпись-спикера) | Claude Motion, Remotion | 5 с · 16:9 |
| [Интро подкаста](prompts/07-logo-intros.md#интро-подкаста) | Claude Motion, Remotion | 10 с · 16:9 и 1:1 |
| [Заставка мероприятия](prompts/07-logo-intros.md#заставка-мероприятия) | Claude Motion | 15 с · 16:9 (экран сцены) |
| [Логотип в стиле 3D-глины](prompts/07-logo-intros.md#логотип-в-стиле-3d-глины) | Veo, Kling, Runway | 5 с · 1:1 |
| [Неоновая вывеска](prompts/07-logo-intros.md#неоновая-вывеска) | Claude Motion, Veo, Kling | 5 с · 16:9 |

### [Обучение, история, наука](prompts/08-education.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [История за 60 секунд](prompts/08-education.md#история-за-60-секунд) | Claude Motion, Remotion | 60 с · 9:16 или 16:9 |
| [Математика рисует себя](prompts/08-education.md#математика-рисует-себя) | Claude Code + Manim / Remotion | 30 с · 16:9 |
| [Физика на доске](prompts/08-education.md#физика-на-доске) | Claude Motion, Remotion | 40 с · 16:9 |
| [Путешествие частицы](prompts/08-education.md#путешествие-частицы) | Claude Motion, Remotion | 45 с · 16:9 |
| [Урок-слайд с анимацией](prompts/08-education.md#урок-слайд-с-анимацией) | Claude Motion | 60–90 с · 16:9 |
| [Как устроено изнутри](prompts/08-education.md#как-устроено-изнутри) | Claude Motion, Remotion | 45 с · 16:9 |
| [Язык: слово в контексте](prompts/08-education.md#язык-слово-в-контексте) | Claude Motion | 20 с · 9:16 |
| [Один день из жизни в прошлом](prompts/08-education.md#один-день-из-жизни-в-прошлом) | Veo, Sora, Kling | 8 с × 6 сцен · 16:9 |
| [Рекурсия/идея во всех стилях](prompts/08-education.md#рекурсияидея-во-всех-стилях) | Claude Motion, Remotion | 30 с · 16:9 |
| [Жизненный цикл](prompts/08-education.md#жизненный-цикл) | Claude Motion | 30 с · 1:1 |
| [Что происходит за одну секунду](prompts/08-education.md#что-происходит-за-одну-секунду) | Claude Motion, Remotion | 30 с · 9:16 |
| [Шпаргалка-экзамен](prompts/08-education.md#шпаргалка-экзамен) | Claude Motion | 45 с · 9:16 |

### [Истории и мультики](prompts/09-stories-cartoons.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Мини-мультик с двумя героями](prompts/09-stories-cartoons.md#мини-мультик-с-двумя-героями) | Veo, Kling, Seedance, Sora | 6–10 планов по 5 с · 9:16 |
| [Немое кино: смотритель маяка](prompts/09-stories-cartoons.md#немое-кино-смотритель-маяка) | Claude Motion, Veo, Kling | 60 с · 16:9 |
| [Сказка на ночь](prompts/09-stories-cartoons.md#сказка-на-ночь) | Claude Motion, Veo, Kling | 90 с · 16:9 |
| [Скетч-комедия в офисе](prompts/09-stories-cartoons.md#скетч-комедия-в-офисе) | Veo, Sora, Kling | 3 плана по 8 с · 9:16 |
| [Ожившие рисунки из скетчбука](prompts/09-stories-cartoons.md#ожившие-рисунки-из-скетчбука) | Claude Motion, Veo, Kling | 20 с · 9:16 |
| [Ретро-мультфильм 80-х](prompts/09-stories-cartoons.md#ретро-мультфильм-80-х) | Claude Motion, Veo, Kling | 30 с · 4:3 |
| [Театр теней](prompts/09-stories-cartoons.md#театр-теней) | Claude Motion, Remotion | 45 с · 16:9 |
| [Пластилиновый клип](prompts/09-stories-cartoons.md#пластилиновый-клип) | Veo, Kling, Runway | 8 с · 16:9 |
| [Пиксель-арт история](prompts/09-stories-cartoons.md#пиксель-арт-история) | Claude Motion, Remotion | 30 с · 16:9 |
| [История от лица предмета](prompts/09-stories-cartoons.md#история-от-лица-предмета) | Claude Motion, Veo, Kling | 40 с · 9:16 |
| [Персонаж-маскот бренда](prompts/09-stories-cartoons.md#персонаж-маскот-бренда) | Veo, Kling, Seedance | 8 с · 9:16 |
| [Сериал «маленький робот»](prompts/09-stories-cartoons.md#сериал-маленький-робот) | Veo, Kling, Sora | 8 с · 16:9 |

### [Кинематографичные кадры (видеогенераторы)](prompts/10-cinematic-ai-video.md) — 13

| Шаблон | Где | Формат |
|---|---|---|
| [Универсальная формула кадра](prompts/10-cinematic-ai-video.md#универсальная-формула-кадра) | Veo, Sora, Kling, Seedance, Runway | 5–10 с · любой |
| [Эпичный пейзаж с дрона](prompts/10-cinematic-ai-video.md#эпичный-пейзаж-с-дрона) | Veo, Sora, Kling, Runway | 8 с · 16:9 |
| [Трейлер: героический кадр](prompts/10-cinematic-ai-video.md#трейлер-героический-кадр) | Veo, Sora, Kling | 6 с · 2.39:1 |
| [Нуар в дождь](prompts/10-cinematic-ai-video.md#нуар-в-дождь) | Veo, Sora, Kling, Runway | 8 с · 16:9 |
| [Киберпанк-город](prompts/10-cinematic-ai-video.md#киберпанк-город) | Veo, Sora, Kling, Seedance | 8 с · 16:9 |
| [Природа: макро](prompts/10-cinematic-ai-video.md#природа-макро) | Veo, Sora, Kling | 6 с · 16:9 |
| [Ностальгия на плёнку](prompts/10-cinematic-ai-video.md#ностальгия-на-плёнку) | Veo, Sora, Kling | 8 с · 4:3 |
| [Сюрреализм](prompts/10-cinematic-ai-video.md#сюрреализм) | Veo, Sora, Kling, Runway | 8 с · 16:9 |
| [Пролёт сквозь объекты (FPV)](prompts/10-cinematic-ai-video.md#пролёт-сквозь-объекты-fpv) | Veo, Kling, Seedance | 8 с · 16:9 или 9:16 |
| [Модный фэшн-кадр](prompts/10-cinematic-ai-video.md#модный-фэшн-кадр) | Veo, Sora, Kling | 6 с · 9:16 |
| [Изображение → видео (оживить фото)](prompts/10-cinematic-ai-video.md#изображение--видео-оживить-фото) | Kling, Runway, Veo, Luma | 5 с · как у фото |
| [Первый и последний кадр (переход)](prompts/10-cinematic-ai-video.md#первый-и-последний-кадр-переход) | Kling, Veo, Luma, Runway | 5 с · любой |
| [Многокадровая сцена с диалогом](prompts/10-cinematic-ai-video.md#многокадровая-сцена-с-диалогом) | Veo, Sora, Seedance | 10–15 с · 16:9 |

### [Музыка и визуалы](prompts/11-music-visuals.md) — 10

| Шаблон | Где | Формат |
|---|---|---|
| [Аудиовизуализатор под трек](prompts/11-music-visuals.md#аудиовизуализатор-под-трек) | Claude Code + Remotion | длина трека · 16:9 или 1:1 |
| [Spotify Canvas (луп 8 с)](prompts/11-music-visuals.md#spotify-canvas-луп-8-с) | Claude Motion, Veo, Kling | 8 с · 9:16 (бесшовный) |
| [Клип из одного промпта](prompts/11-music-visuals.md#клип-из-одного-промпта) | Claude Code + Remotion | 2–3 мин · 16:9 |
| [Пластилиновый музыкальный клип](prompts/11-music-visuals.md#пластилиновый-музыкальный-клип) | Claude Motion, Veo, Kling | 30 с · 16:9 |
| [Машина, которая играет музыку](prompts/11-music-visuals.md#машина-которая-играет-музыку) | Claude Code + Remotion, Three.js | 30 с · 16:9 |
| [Фон для диджей-сета](prompts/11-music-visuals.md#фон-для-диджей-сета) | Claude Code + Remotion, TouchDesigner | 60 с луп · 16:9 (LED) |
| [Анонс релиза](prompts/11-music-visuals.md#анонс-релиза) | Claude Motion | 15 с · 9:16 и 1:1 |
| [Визуал «вода и звук»](prompts/11-music-visuals.md#визуал-вода-и-звук) | Veo, Sora, Kling | 8 с · 9:16 |
| [Сингл в стиле лоу-фай](prompts/11-music-visuals.md#сингл-в-стиле-лоу-фай) | Claude Motion, Veo, Kling | 10 с луп · 16:9 |
| [Концертный хайлайт](prompts/11-music-visuals.md#концертный-хайлайт) | Veo, Sora, Kling | 6 с · 9:16 |

### [Личное: резюме, поздравления, события](prompts/12-personal-events.md) — 10

| Шаблон | Где | Формат |
|---|---|---|
| [Видео-резюме для рекрутера](prompts/12-personal-events.md#видео-резюме-для-рекрутера) | Claude Motion | 20 с · 16:9 и 9:16 |
| [Портфолио-шоурил](prompts/12-personal-events.md#портфолио-шоурил) | Claude Motion, Remotion | 30 с · 16:9 |
| [Приглашение на свадьбу/праздник](prompts/12-personal-events.md#приглашение-на-свадьбупраздник) | Claude Motion | 20 с · 9:16 |
| [Поздравление с днём рождения](prompts/12-personal-events.md#поздравление-с-днём-рождения) | Claude Motion, Veo, Kling | 15 с · 9:16 |
| [Итоги года (личные)](prompts/12-personal-events.md#итоги-года-личные) | Claude Motion | 45 с · 9:16 |
| [Карта путешествия](prompts/12-personal-events.md#карта-путешествия) | Claude Motion, Remotion | 30 с · 9:16 |
| [Объявление о рождении/помолвке](prompts/12-personal-events.md#объявление-о-рождениипомолвке) | Claude Motion | 15 с · 1:1 |
| [Трибьют / «спасибо» команде или учителю](prompts/12-personal-events.md#трибьют--спасибо-команде-или-учителю) | Claude Motion | 40 с · 16:9 |
| [Обратный отсчёт до события](prompts/12-personal-events.md#обратный-отсчёт-до-события) | Claude Motion | 10 с · 9:16 (серия) |
| [Видео-открытка с праздником](prompts/12-personal-events.md#видео-открытка-с-праздником) | Claude Motion, Veo, Kling | 15 с · 9:16 |

### [Бизнес и внутренние ролики](prompts/13-business-internal.md) — 12

| Шаблон | Где | Формат |
|---|---|---|
| [Онбординг новых клиентов](prompts/13-business-internal.md#онбординг-новых-клиентов) | Claude Motion | 60 с · 16:9 |
| [Стратегия компании за минуту](prompts/13-business-internal.md#стратегия-компании-за-минуту) | Claude Motion | 60 с · 16:9 |
| [Новый сотрудник: первый день](prompts/13-business-internal.md#новый-сотрудник-первый-день) | Claude Motion | 45 с · 16:9 |
| [Объяснение процесса/регламента](prompts/13-business-internal.md#объяснение-процессарегламента) | Claude Motion | 40 с · 16:9 |
| [Обучение безопасности](prompts/13-business-internal.md#обучение-безопасности) | Claude Motion | 45 с · 16:9 |
| [Кейс клиента](prompts/13-business-internal.md#кейс-клиента) | Claude Motion | 45 с · 16:9 |
| [Продажи: «зачем вам это»](prompts/13-business-internal.md#продажи-зачем-вам-это) | Claude Motion | 30 с · 16:9 |
| [Питч стартапа](prompts/13-business-internal.md#питч-стартапа) | Claude Motion | 60 с · 16:9 |
| [Обновление роадмапа](prompts/13-business-internal.md#обновление-роадмапа) | Claude Motion | 30 с · 16:9 |
| [Объяснение договора/условий простыми словами](prompts/13-business-internal.md#объяснение-договораусловий-простыми-словами) | Claude Motion | 45 с · 9:16 |
| [Отчёт об инциденте (постмортем)](prompts/13-business-internal.md#отчёт-об-инциденте-постмортем) | Claude Motion | 45 с · 16:9 |
| [Анонс внутреннего события](prompts/13-business-internal.md#анонс-внутреннего-события) | Claude Motion | 15 с · 16:9 и 9:16 |

### [Лупы, фоны, абстракция](prompts/14-loops-backgrounds.md) — 11

| Шаблон | Где | Формат |
|---|---|---|
| [Градиентный «живой» фон для сайта](prompts/14-loops-backgrounds.md#градиентный-живой-фон-для-сайта) | Claude Motion, Remotion, WebGL | 20 с луп · 16:9 |
| [Ретро-сетка (synthwave)](prompts/14-loops-backgrounds.md#ретро-сетка-synthwave) | Claude Motion, Remotion | 10 с луп · 16:9 |
| [Мяч в кольцах (физика)](prompts/14-loops-backgrounds.md#мяч-в-кольцах-физика) | Claude Code + p5.js / Remotion | 30 с · 9:16 |
| [Генеративные потоки](prompts/14-loops-backgrounds.md#генеративные-потоки) | Claude Code + p5.js | 30 с · 1:1 |
| [Космос/звёзды](prompts/14-loops-backgrounds.md#космосзвёзды) | Veo, Kling, Claude Motion | 15 с луп · 16:9 |
| [Экран «скоро начнём» для стрима](prompts/14-loops-backgrounds.md#экран-скоро-начнём-для-стрима) | Claude Motion | 60 с луп · 16:9 |
| [Изометрический мини-мир](prompts/14-loops-backgrounds.md#изометрический-мини-мир) | Claude Motion, Three.js, Veo | 15 с луп · 1:1 |
| [Жидкие формы (3D)](prompts/14-loops-backgrounds.md#жидкие-формы-3d) | Veo, Kling, Runway | 8 с · 1:1 |
| [Бумажные слои (паралакс)](prompts/14-loops-backgrounds.md#бумажные-слои-паралакс) | Claude Motion, Remotion | 12 с луп · 16:9 |
| [Анимированный узор (паттерн)](prompts/14-loops-backgrounds.md#анимированный-узор-паттерн) | Claude Motion, Remotion | 6 с луп · 1:1 |
| [Природа-луп для медитации](prompts/14-loops-backgrounds.md#природа-луп-для-медитации) | Veo, Sora, Kling | 10 с · 16:9 |

### [Стили-модификаторы](prompts/15-style-modifiers.md) — 16

| Шаблон | Где | Формат |
|---|---|---|
| [Плоская 2D-иллюстрация](prompts/15-style-modifiers.md#плоская-2d-иллюстрация) | любой | — |
| [Швейцарский / интернациональный](prompts/15-style-modifiers.md#швейцарский--интернациональный) | любой | — |
| [Бумага и коллаж](prompts/15-style-modifiers.md#бумага-и-коллаж) | любой | — |
| [Пиксель-арт 16 бит](prompts/15-style-modifiers.md#пиксель-арт-16-бит) | любой | — |
| [Глина (claymation)](prompts/15-style-modifiers.md#глина-claymation) | любой | — |
| [Аниме / сёл-шейдинг](prompts/15-style-modifiers.md#аниме--сёл-шейдинг) | видеогенераторы | — |
| [Неон и киберпанк](prompts/15-style-modifiers.md#неон-и-киберпанк) | любой | — |
| [Документальное кино](prompts/15-style-modifiers.md#документальное-кино) | видеогенераторы | — |
| [Плёнка 35 мм](prompts/15-style-modifiers.md#плёнка-35-мм) | видеогенераторы | — |
| [Минимализм Apple-стиля](prompts/15-style-modifiers.md#минимализм-apple-стиля) | любой | — |
| [Мел на доске](prompts/15-style-modifiers.md#мел-на-доске) | любой | — |
| [Гравюра / линогравюра](prompts/15-style-modifiers.md#гравюра--линогравюра) | любой | — |
| [Акварель / книжка с картинками](prompts/15-style-modifiers.md#акварель--книжка-с-картинками) | любой | — |
| [Изометрия low-poly](prompts/15-style-modifiers.md#изометрия-low-poly) | любой | — |
| [Брутализм / громкий](prompts/15-style-modifiers.md#брутализм--громкий) | любой | — |
| [Чертёж (blueprint)](prompts/15-style-modifiers.md#чертёж-blueprint) | любой | — |

<!-- index:end -->
