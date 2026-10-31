# Плагины Claude Code в репозитории

Плагины хранятся здесь, в `plugins/`, а не на компьютере. Их навыки, команды и агенты
копируются в `.claude/skills/`, `.claude/commands/` и `.claude/agents/` — эти папки
Claude Code читает сам, когда открывает репозиторий: и в облаке (claude.ai/code,
приложение на телефоне), и на ПК. Ставить ничего не нужно.

> Почему не обычные плагины: облачные сессии **не устанавливают** плагины, подключённые
> через `enabledPlugins` в `.claude/settings.json`. Работают только навыки, команды,
> агенты, хуки и MCP-серверы, лежащие в самом репозитории, плюс плагины и навыки,
> включённые в вашем аккаунте claude.ai.

## Как это устроено

| Файл | Что делает |
|------|------------|
| `plugins/<имя>/` | сам плагин: навыки, команды, агенты |
| `.claude/skills/`, `.claude/commands/`, `.claude/agents/` | копии из `plugins/` (генерируются, руками не править) |
| `.claude/plugins-mirror.json` | список скопированного, чтобы `sync` удалял устаревшее |
| `.claude-plugin/marketplace.json` | маркетплейс для ручной установки (генерируется) |
| `.claude/settings.json` | чужие плагины для ПК (см. ниже) |
| `tools/plugins.py` | программа для управления плагинами |
| `.github/workflows/sync-plugins.yml` | пересобирает копии после загрузки через сайт GitHub |

Хуки (`hooks/`) и MCP (`.mcp.json`) из плагинов автоматически не копируются —
их нужно переносить в `.claude/settings.json` и `.mcp.json` вручную.

## Способ 1: загрузить через сайт GitHub (без компьютера)

1. Откройте папку `plugins/` на GitHub → **Add file → Upload files**.
2. Перетащите папку плагина (например, `my-plugin/` со `skills/` внутри).
3. Нажмите **Commit changes**.

GitHub Actions сам скопирует навыки в `.claude/`, и в следующей сессии они появятся.

## Способ 2: программой

```bash
python3 tools/plugins.py new my-plugin -d "Что делает плагин"     # создать заготовку
python3 tools/plugins.py add ~/Downloads/some-plugin              # добавить из папки
python3 tools/plugins.py add https://github.com/user/repo --subdir plugins/x   # из git
python3 tools/plugins.py list                                     # список
python3 tools/plugins.py remove my-plugin                         # удалить
python3 tools/plugins.py sync                                     # пересобрать копии
```

После этого сделайте коммит и пуш.

## Что подключено

**Работает везде (в облаке и на ПК)** — лежит в `plugins/`:

| Плагин | Что делает |
|--------|------------|
| [`hello-ideas`](hello-ideas) | навык и команда `/hello-ideas` — подбирает референсы из этой библиотеки |
| [`cartoon-reel`](cartoon-reel) | пошагово ведёт от идеи до готового мультика: герой, тема, план сцен, озвучка, субтитры, правки по номерам |
| [`task-observer`](task-observer) | замечает ваши исправления и повторяющуюся работу, предлагает улучшить навыки. Копия навыка [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all), CC BY 4.0 |

**Только на ПК** — подключены через `.claude/settings.json` из маркетплейсов авторов.
Claude Code на ПК предложит их установить, когда вы доверите папку проекта:

| Плагин | Что делает | Источник |
|--------|------------|----------|
| `claude-code-setup` | читает проект и советует, какие хуки, навыки и MCP поставить. В облаке доступен, если включён в аккаунте claude.ai | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) |
| `claude-mem` | память между сессиями. Нужна программа: `npx claude-mem install` | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) |
| `headroom` | сжимает логи и JSON перед отправкой модели. Нужна программа: `uv tool install headroom-ai` | [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) |

`claude-mem` и `headroom` в облаке бесполезны: облачная среда временная (память
стирается), а соединение с API контролирует сама среда.

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
└── agents/<агент>.md            # субагенты (необязательно)
```
