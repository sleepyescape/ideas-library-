#!/bin/sh
# Ставит программы, без которых не работают плагины claude-mem и Headroom.
# Запускается хуком SessionStart только в облачных сессиях Claude Code,
# чтобы ничего не устанавливалось на ваш компьютер без спроса.
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

if ! command -v headroom >/dev/null 2>&1; then
    if command -v uv >/dev/null 2>&1; then
        uv tool install headroom-ai >/dev/null 2>&1
    else
        python3 -m pip install --user -q headroom-ai >/dev/null 2>&1
    fi || echo "session-setup: не удалось установить headroom-ai" >&2
fi

if ! command -v claude-mem >/dev/null 2>&1; then
    npm install -g claude-mem >/dev/null 2>&1 \
        || echo "session-setup: не удалось установить claude-mem" >&2
fi

exit 0
