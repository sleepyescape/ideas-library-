#!/usr/bin/env python3
"""Build video-prompts/catalog.json and the README index from video-prompts/prompts/*.md.

Each prompt file is a category:  "# Title", an intro paragraph, then templates:

    ## Template title
    - **Где:** tools
    - **Формат:** length · aspect
    - **Теги:** a, b, c

    ```text
    prompt
    ```

Usage: python3 tools/video_prompts.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "video-prompts"
PROMPTS = ROOT / "prompts"
README = ROOT / "README.md"
START, END = "<!-- index:start -->", "<!-- index:end -->"

FIELDS = {"Где": "tools", "Формат": "format", "Теги": "tags"}


def parse(path):
    text = path.read_text(encoding="utf-8")
    title = re.search(r"^# (.+)$", text, re.M).group(1).strip()
    head, *blocks = re.split(r"^## ", text, flags=re.M)
    intro = " ".join(l.strip() for l in head.splitlines()[1:] if l.strip())
    items = []
    for block in blocks:
        name = block.splitlines()[0].strip()
        item = {"title": name}
        for ru, key in FIELDS.items():
            m = re.search(rf"^- \*\*{ru}:\*\* (.+)$", block, re.M)
            item[key] = m.group(1).strip() if m else ""
        item["tags"] = [t.strip() for t in item["tags"].split(",") if t.strip()]
        m = re.search(r"```text\n(.*?)\n```", block, re.S)
        if not m:
            raise SystemExit(f"{path.name}: «{name}» has no ```text block")
        item["prompt"] = m.group(1).strip()
        item["anchor"] = anchor(name)
        items.append(item)
    return {"file": f"prompts/{path.name}", "category": title, "intro": intro, "items": items}


def anchor(heading):
    # GitHub-style anchor: lowercase, drop punctuation, spaces -> dashes
    a = heading.lower()
    a = re.sub(r"[^\w\- ]", "", a)
    return a.replace(" ", "-")


def main():
    cats = [parse(p) for p in sorted(PROMPTS.glob("*.md"))]
    total = sum(len(c["items"]) for c in cats)
    catalog = {"total": total, "categories": cats}
    (ROOT / "catalog.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [START, "", f"**Всего шаблонов: {total}** в {len(cats)} разделах.", ""]
    for c in cats:
        lines.append(f"### [{c['category']}]({c['file']}) — {len(c['items'])}")
        lines.append("")
        lines.append("| Шаблон | Где | Формат |")
        lines.append("|---|---|---|")
        for i in c["items"]:
            lines.append(f"| [{i['title']}]({c['file']}#{i['anchor']}) | {i['tools']} | {i['format']} |")
        lines.append("")
    lines.append(END)
    block = "\n".join(lines)

    readme = README.read_text(encoding="utf-8")
    if START in readme:
        readme = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: block, readme, flags=re.S)
    else:
        readme = readme.rstrip() + "\n\n" + block + "\n"
    README.write_text(readme, encoding="utf-8")
    print(f"{total} templates in {len(cats)} categories")


if __name__ == "__main__":
    main()
