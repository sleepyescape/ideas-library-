# Плагины Claude Code в репозитории

Плагины хранятся здесь, в `plugins/`, а не на компьютере. Репозиторий работает как
маркетплейс плагинов: Claude Code сам подключает их, когда открывает этот репозиторий
(в облаке на claude.ai/code или локально). Ставить что-то вручную не нужно.

## Как это устроено

| Файл | Что делает |
|------|------------|
| `plugins/<имя>/` | сам плагин: навыки, команды, агенты, хуки, MCP |
| `.claude-plugin/marketplace.json` | список плагинов (генерируется автоматически) |
| `.claude/settings.json` | подключает маркетплейс и включает плагины (генерируется автоматически) |
| `tools/plugins.py` | программа для управления плагинами |
| `.github/workflows/sync-plugins.yml` | пересобирает списки после загрузки через сайт GitHub |

## Способ 1: загрузить через сайт GitHub (без компьютера)

1. Откройте папку `plugins/` на GitHub → **Add file → Upload files**.
2. Перетащите папку плагина (например, `my-plugin/` с `.claude-plugin/plugin.json` внутри).
3. Нажмите **Commit changes**.

GitHub Actions сам обновит `marketplace.json` и `settings.json`, и при следующем
запуске Claude Code плагин будет включён.

## Способ 2: программой

```bash
python3 tools/plugins.py new my-plugin -d "Что делает плагин"     # создать заготовку
python3 tools/plugins.py add ~/Downloads/some-plugin              # добавить из папки
python3 tools/plugins.py add https://github.com/user/repo --subdir plugins/x   # из git
python3 tools/plugins.py list                                     # список
python3 tools/plugins.py remove my-plugin                         # удалить
python3 tools/plugins.py sync                                     # пересобрать списки
```

После этого сделайте коммит и пуш.

Чтобы выключить плагин, не удаляя его, поставьте `false` у него в
`.claude/settings.json` → `enabledPlugins`; `sync` это значение сохранит.

## Подключённые сторонние плагины

Они не лежат в `plugins/`, а подключены прямо из своих репозиториев через
`.claude/settings.json` (`extraKnownMarketplaces` и `enabledPlugins`):

| Плагин | Что делает | Источник |
|--------|------------|----------|
| `claude-code-setup` | читает проект и советует, какие хуки, навыки и MCP поставить | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) |
| `claude-mem` | память между сессиями | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) |
| `headroom` | сжимает логи и JSON перед отправкой модели, экономит токены | [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) |
| `task-observer` | замечает ваши исправления и предлагает обновить навыки | [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all) |

`claude-mem` и `headroom` нужны свои программы. В облачных сессиях их ставит
`tools/session-setup.sh` (хук SessionStart); на компьютере он ничего не делает.
Учтите: облачный контейнер временный, поэтому память `claude-mem` в облаке
не сохраняется между сессиями (только с их сервисом cmem.ai).

Выключить любой плагин — поставить `false` у него в `enabledPlugins`.

### OmniRoute (не плагин)

[OmniRoute](https://github.com/diegosouzapw/OmniRoute) — шлюз: один адрес вместо
ключей ко многим моделям, с переключением на другую модель при исчерпании лимита.
Это отдельный сервер с вашими аккаунтами, поэтому в репозиторий его не положить.
Запустите его у себя или на сервере и направьте Claude Code на него переменной
`ANTHROPIC_BASE_URL` (подробности — в их README). При этом действуют правила
каждого провайдера, к которому идут запросы.

## Структура плагина

```
my-plugin/
├── .claude-plugin/plugin.json   # имя, описание, версия
├── skills/<навык>/SKILL.md      # навыки
├── commands/<команда>.md        # слэш-команды: /<команда>
├── agents/<агент>.md            # субагенты (необязательно)
├── hooks/hooks.json             # хуки (необязательно)
└── .mcp.json                    # MCP-серверы (необязательно)
```

Примеры:
- [`hello-ideas`](hello-ideas) — навык и команда `/hello-ideas`, подбирают референсы из этой библиотеки;
- [`cartoon-reel`](cartoon-reel) — пошагово ведёт от идеи до готового мультика: герой, тема, план сцен, озвучка, субтитры, правки по номерам.
