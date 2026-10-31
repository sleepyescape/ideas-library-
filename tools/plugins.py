#!/usr/bin/env python3
"""Менеджер плагинов Claude Code, которые хранятся прямо в этом репозитории.

Плагины лежат в plugins/<имя>/. Скрипт копирует их навыки, команды и агентов
в .claude/skills, .claude/commands и .claude/agents — эти папки Claude Code
читает сам и на ПК, и в облаке, поэтому ставить ничего не нужно. Заодно
собирается маркетплейс .claude-plugin/marketplace.json для ручной установки.

Команды:
  python3 tools/plugins.py new <имя> [-d "описание"]   создать заготовку плагина
  python3 tools/plugins.py add <папка | git-url>       скопировать готовый плагин
  python3 tools/plugins.py remove <имя>                удалить плагин
  python3 tools/plugins.py list                        показать плагины
  python3 tools/plugins.py sync                        пересобрать копии в .claude/ и маркетплейс
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLUGINS_DIR = ROOT / "plugins"
MARKETPLACE_FILE = ROOT / ".claude-plugin" / "marketplace.json"
CLAUDE_DIR = ROOT / ".claude"
SETTINGS_FILE = CLAUDE_DIR / "settings.json"
MIRROR_FILE = CLAUDE_DIR / "plugins-mirror.json"
MIRRORED = ("skills", "commands", "agents")

MARKETPLACE_NAME = "ideas-library"
OWNER = "sleepyescape"

NAME_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def read_json(path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def slugify(name):
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    if not NAME_RE.match(slug):
        sys.exit(f"Некорректное имя плагина: {name!r} (нужны латинские буквы, цифры и дефисы)")
    return slug


def find_plugins():
    """Каждая папка в plugins/ — плагин. plugin.json необязателен, но желателен."""
    plugins = []
    if not PLUGINS_DIR.exists():
        return plugins
    for folder in sorted(p for p in PLUGINS_DIR.iterdir() if p.is_dir() and not p.name.startswith(".")):
        manifest = read_json(folder / ".claude-plugin" / "plugin.json", {})
        plugins.append({
            "name": manifest.get("name", folder.name),
            "source": f"./plugins/{folder.name}",
            "description": manifest.get("description", ""),
            "version": manifest.get("version", "0.1.0"),
        })
    return plugins


def mirror(plugins):
    """Копирует навыки, команды и агентов плагинов в .claude/.

    Облачные сессии не устанавливают плагины из settings.json, но читают
    .claude/skills, .claude/commands и .claude/agents из клона репозитория.
    Список скопированного хранится в MIRROR_FILE, чтобы удалять устаревшее.
    """
    for rel in read_json(MIRROR_FILE, []):
        path = CLAUDE_DIR / rel
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()

    copied, owners = [], {}
    for p in plugins:
        folder = ROOT / p["source"]
        for kind in MIRRORED:
            src_dir = folder / kind
            if not src_dir.is_dir():
                continue
            for item in sorted(src_dir.iterdir()):
                rel = f"{kind}/{item.name}"
                dest = CLAUDE_DIR / rel
                if dest.exists():
                    who = owners.get(rel, "файл вне plugins/")
                    print(f"Пропущено {p['name']}/{rel}: уже есть ({who})", file=sys.stderr)
                    continue
                dest.parent.mkdir(parents=True, exist_ok=True)
                if item.is_dir():
                    shutil.copytree(item, dest)
                else:
                    shutil.copy2(item, dest)
                copied.append(rel)
                owners[rel] = p["name"]
    write_json(MIRROR_FILE, copied)
    return copied


def sync():
    plugins = find_plugins()

    write_json(MARKETPLACE_FILE, {
        "name": MARKETPLACE_NAME,
        "owner": {"name": OWNER},
        "metadata": {"description": "Плагины Claude Code из репозитория ideas-library"},
        "plugins": plugins,
    })

    # Свои плагины работают через копии в .claude/, поэтому свой маркетплейс
    # не включаем: иначе на ПК навыки загрузились бы дважды. Чужие сохраняем.
    settings = read_json(SETTINGS_FILE, {})
    settings.get("extraKnownMarketplaces", {}).pop(MARKETPLACE_NAME, None)
    suffix = f"@{MARKETPLACE_NAME}"
    settings["enabledPlugins"] = {
        k: v for k, v in settings.get("enabledPlugins", {}).items() if not k.endswith(suffix)
    }
    write_json(SETTINGS_FILE, settings)

    copied = mirror(plugins)
    print(f"Готово: {len(plugins)} плагин(ов), в .claude/ скопировано {len(copied)}.")


def cmd_new(args):
    name = slugify(args.name)
    folder = PLUGINS_DIR / name
    if folder.exists():
        sys.exit(f"Плагин {name} уже существует: {folder}")

    write_json(folder / ".claude-plugin" / "plugin.json", {
        "name": name,
        "description": args.description or f"Плагин {name}",
        "version": "0.1.0",
        "author": {"name": OWNER},
    })
    skill = folder / "skills" / name / "SKILL.md"
    skill.parent.mkdir(parents=True)
    skill.write_text(
        f"---\nname: {name}\ndescription: {args.description or 'Опишите, когда Claude должен использовать этот навык'}\n---\n\n"
        "Здесь инструкции для Claude: что делать и как.\n",
        encoding="utf-8",
    )
    command = folder / "commands" / f"{name}.md"
    command.parent.mkdir(parents=True)
    command.write_text(
        "---\ndescription: Пример слэш-команды\n---\n\n"
        "Текст, который получит Claude при вызове команды. Аргументы: $ARGUMENTS\n",
        encoding="utf-8",
    )
    print(f"Создан плагин {folder.relative_to(ROOT)}")
    sync()


def cmd_add(args):
    src = args.source
    with tempfile.TemporaryDirectory() as tmp:
        if re.match(r"^(https?://|git@)", src):
            subprocess.run(["git", "clone", "--depth", "1", src, tmp + "/repo"], check=True)
            src_path = Path(tmp) / "repo"
            if args.subdir:
                src_path = src_path / args.subdir
        else:
            src_path = Path(src).expanduser().resolve()
        if not src_path.is_dir():
            sys.exit(f"Папка не найдена: {src_path}")

        manifest = read_json(src_path / ".claude-plugin" / "plugin.json", {})
        name = slugify(args.name or manifest.get("name") or src_path.name)
        dest = PLUGINS_DIR / name
        if dest.exists():
            if not args.force:
                sys.exit(f"Плагин {name} уже есть. Используйте --force, чтобы заменить.")
            shutil.rmtree(dest)
        shutil.copytree(src_path, dest, ignore=shutil.ignore_patterns(".git"))

    if not (dest / ".claude-plugin" / "plugin.json").exists():
        write_json(dest / ".claude-plugin" / "plugin.json", {"name": name, "version": "0.1.0"})
    print(f"Добавлен плагин {dest.relative_to(ROOT)}")
    sync()


def cmd_remove(args):
    folder = PLUGINS_DIR / args.name
    if not folder.is_dir():
        sys.exit(f"Плагин {args.name} не найден")
    shutil.rmtree(folder)
    print(f"Удалён плагин {args.name}")
    sync()


def cmd_list(_args):
    plugins = find_plugins()
    if not plugins:
        print("Плагинов пока нет. Создайте: python3 tools/plugins.py new my-plugin")
    for p in plugins:
        print(f"{p['name']} {p['version']} — {p['description']}")


def main():
    parser = argparse.ArgumentParser(description="Плагины Claude Code в этом репозитории")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("new", help="создать заготовку плагина")
    p.add_argument("name")
    p.add_argument("-d", "--description")
    p.set_defaults(func=cmd_new)

    p = sub.add_parser("add", help="скопировать готовый плагин из папки или git-репозитория")
    p.add_argument("source")
    p.add_argument("--name", help="другое имя для плагина")
    p.add_argument("--subdir", help="папка плагина внутри git-репозитория")
    p.add_argument("--force", action="store_true", help="заменить существующий")
    p.set_defaults(func=cmd_add)

    p = sub.add_parser("remove", help="удалить плагин")
    p.add_argument("name")
    p.set_defaults(func=cmd_remove)

    sub.add_parser("list", help="показать плагины").set_defaults(func=cmd_list)
    sub.add_parser("sync", help="пересобрать копии в .claude/ и маркетплейс").set_defaults(func=lambda _a: sync())

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
