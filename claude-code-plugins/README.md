# 5 бесплатных плагинов для Claude Code

Разбор ролика [@gologan.ai](https://www.tiktok.com/@gologan.ai) (TikTok, 75 с).

| # | Инструмент | Что делает (по ролику) | Источник | Тип |
|---|---|---|---|---|
| 1 | **OmniRoute** | Бесплатный ИИ-шлюз: один адрес вместо сотни ключей. Даёт доступ к ~300 моделям (Claude, Kimi, DeepSeek, Gemini, GPT, Llama). Когда у одной модели кончился лимит, запрос уходит к следующей | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | сервис |
| 2 | **Claude Mem** | Память между сессиями: помнит проект, файлы и принятые решения | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | плагин |
| 3 | **Headroom** | Сжимает логи и JSON перед отправкой в LLM: та же суть, меньше токенов, тот же ответ | [chopratejas/headroom](https://github.com/chopratejas/headroom) | сервис |
| 4 | **Claude Code Setup** | Официальный плагин Anthropic: смотрит проект и советует, какие хуки, скиллы, агенты и MCP поставить | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-code-setup) | плагин |
| 5 | **Task Observer** | Наблюдает за работой: из ваших правок выводит правила и предлагает улучшения скиллов | [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all) | плагин |

## Плагины

Установка в Claude Code:

```
/plugin marketplace add anthropics/claude-plugins-official
/plugin install claude-code-setup@claude-plugins-official

/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem@thedotmack

/plugin marketplace add rebelytics/one-skill-to-rule-them-all
/plugin install task-observer@one-skill-to-rule-them-all
```

Чтобы они ставились для проекта автоматически, положите в `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "claude-plugins-official": { "source": { "source": "github", "repo": "anthropics/claude-plugins-official" } },
    "thedotmack": { "source": { "source": "github", "repo": "thedotmack/claude-mem" } },
    "one-skill-to-rule-them-all": { "source": { "source": "github", "repo": "rebelytics/one-skill-to-rule-them-all" } }
  },
  "enabledPlugins": {
    "claude-code-setup@claude-plugins-official": true,
    "claude-mem@thedotmack": true,
    "task-observer@one-skill-to-rule-them-all": true
  }
}
```

- **claude-code-setup**: только читает, файлы не меняет. Запуск: «recommend automations for this project».
- **claude-mem**: нужны Node.js 18+ и Bun (ставится сам). Хуки запускают локальный воркер, а история хранится в SQLite в `~/.claude-mem`, веб-просмотр на `localhost:37777`. В облачной сессии Claude Code контейнер одноразовый, поэтому память там не сохраняется между сессиями. Для облака у автора есть `claude-mem-cowork`, но он отправляет данные на внешний сервис cmem.ai.
- **task-observer**: по README автора одной установки мало. Нужно добавить строку активации из `references/environments.md` в `CLAUDE.md`, иначе скилл почти не срабатывает.

## Сервисы

Это не плагины. Им нужен свой процесс и ключи провайдеров:

- **OmniRoute**: `npx omniroute`, затем направить Claude Code на шлюз (`ANTHROPIC_BASE_URL`) и добавить в нём ключи провайдеров. Условия провайдеров действуют и через шлюз.
- **Headroom**: `pip install "headroom-ai[all]"`, затем запускать Claude через `headroom wrap claude`. Как вариант, можно поднять его прокси или MCP-сервер.
