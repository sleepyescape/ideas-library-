#!/usr/bin/env python3
"""ВКонтакте: найти видео, скачать звук/кадры и расшифровать.

  python3 vk_video.py auth                       проверить вход (кто вошёл)
  python3 vk_video.py list --mine [--count 20]   мои видео
  python3 vk_video.py list --owner -123 [--album 5]   видео сообщества/человека
  python3 vk_video.py list --search "запрос"     поиск по VK
  python3 vk_video.py list --faves               видео из «Закладок»
  python3 vk_video.py get ССЫЛКА [ССЫЛКА ...] [--frames] [--video] [--out vk-videos]
  python3 vk_video.py transcribe ССЫЛКА [...] [--lang ru] [--model small] [--frames]

Как входит в аккаунт (ни пароль, ни токен не хранятся в репозитории):
  * токен VK API — облачный прокси сам подставляет его в запросы к api.vk.com
    (секрет окружения), либо переменная VK_TOKEN (на своём компьютере);
  * файл cookies (формат Netscape) — переменная VK_COOKIES или
    ~/.config/vk-video/cookies.txt; используется yt-dlp.
Публичные видео скачиваются и без входа.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request

API = "https://api.vk.com/method/"
API_V = "5.199"
HERE = os.path.dirname(os.path.abspath(__file__))


def die(msg):
    sys.exit(f"vk-video: {msg}")


# ---------- API ----------

def api(method, **params):
    params = {k: v for k, v in params.items() if v is not None}
    params["v"] = API_V
    token = os.environ.get("VK_TOKEN")
    req = urllib.request.Request(API + method + "?" + urllib.parse.urlencode(params),
                                 headers={"User-Agent": "vk-video-plugin"})
    if token:
        req.add_header("Authorization", "Bearer " + token)
    # Без VK_TOKEN заголовок добавляет облачный прокси (секрет окружения для api.vk.com).
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.load(r)
    except Exception as e:  # сеть, прокси
        die(f"не удалось обратиться к api.vk.com ({method}): {e}")
    if "error" in data:
        err = data["error"]
        code, text = err.get("error_code"), err.get("error_msg", "")
        if code == 5 or "token required" in text:
            die("VK не принял вход (нет токена или он устарел). "
                "Добавьте токен заново — см. «Вход» в навыке vk-video.")
        if code == 15 or code == 204:
            die(f"нет доступа к этому видео ({text}). Видео закрыто для этого аккаунта.")
        if code == 14:
            die("VK просит капчу — подождите пару минут и попробуйте снова.")
        die(f"ошибка VK {code}: {text}")
    return data["response"]


VIDEO_RE = re.compile(r"video(-?\d+)_(\d+)")


def parse_id(link):
    """Ссылка / 'video-1_2' / '-1_2' -> ('-1_2', access_key|None)."""
    m = VIDEO_RE.search(link) or re.fullmatch(r"(-?\d+)_(\d+)", link.strip())
    if not m:
        # ссылки вида vk.com/clip-1_2 и ?z=video-1_2
        m = re.search(r"(?:clip|z=video)(-?\d+)_(\d+)", link)
    if not m:
        return None, None
    q = urllib.parse.parse_qs(urllib.parse.urlparse(link).query)
    key = (q.get("list") or q.get("access_key") or [None])[0]
    return f"{m.group(1)}_{m.group(2)}", key


def page_url(vid):
    return f"https://vk.com/video{vid}"


def short(sec):
    sec = int(sec or 0)
    m, s = divmod(sec, 60)
    h, m = divmod(m, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def print_items(items):
    if not items:
        print("Ничего не найдено.")
        return
    for i, v in enumerate(items, 1):
        vid = f"{v.get('owner_id')}_{v.get('id')}"
        key = v.get("access_key")
        url = page_url(vid) + (f"?list={key}" if key else "")
        print(f"{i:>3}. [{short(v.get('duration'))}] {v.get('title', '').strip()}\n     {url}")


# ---------- команды ----------

def cmd_auth(_a):
    me = api("users.get")
    if not me:
        die("вход не выполнен")
    u = me[0]
    print(f"Вход выполнен: {u.get('first_name')} {u.get('last_name')} (id{u.get('id')})")


def resolve_group(ref):
    """'https://vk.com/name' / 'club123' / 'public123' / 'name' / '-123' -> -id."""
    ref = ref.strip().rstrip("/")
    name = urllib.parse.urlparse(ref).path.strip("/") if "://" in ref else ref
    name = name.split("/")[0].split("?")[0]
    m = re.fullmatch(r"-?(\d+)", name) or re.fullmatch(r"(?:club|public|event)(\d+)", name)
    if m:
        return -int(m.group(1))
    g = api("groups.getById", group_id=name)
    groups = g.get("groups", g) if isinstance(g, dict) else g
    if not groups:
        die(f"сообщество {ref} не найдено")
    gr = groups[0]
    if gr.get("is_closed") and not gr.get("is_member"):
        print(f"Внимание: «{gr.get('name')}» закрытое, а этот аккаунт в нём не состоит.",
              file=sys.stderr)
    return -int(gr["id"])


def cmd_groups(a):
    r = api("groups.get", extended=1, count=1000)
    items = r.get("items", [])
    if a.find:
        items = [g for g in items if a.find.lower() in g.get("name", "").lower()]
    kinds = {0: "открытое", 1: "закрытое", 2: "частное"}
    for g in items:
        print(f"{g.get('name')} — {kinds.get(g.get('is_closed'), '')}\n"
              f"     list --group club{g.get('id')}")
    if not items:
        print("Ничего не найдено.")


def cmd_list(a):
    if a.search:
        r = api("video.search", q=a.search, count=a.count, sort=2, adult=0)
    elif a.faves:
        r = api("fave.get", item_type="video", count=a.count, extended=1)
        r = {"items": [x.get("video") for x in r.get("items", []) if x.get("video")]}
    else:
        owner = a.owner
        if a.group:
            owner = resolve_group(a.group)
        if a.mine or owner is None:
            owner = api("users.get")[0]["id"]
        r = api("video.get", owner_id=owner, album_id=a.album, count=a.count, offset=a.offset)
    print_items(r.get("items", []))


def have_cookies():
    path = os.environ.get("VK_COOKIES") or os.path.expanduser("~/.config/vk-video/cookies.txt")
    return path if os.path.isfile(path) else None


def ytdlp_cmd():
    if shutil.which("yt-dlp"):
        return ["yt-dlp"]
    try:
        import yt_dlp  # noqa: F401
        return [sys.executable, "-m", "yt_dlp"]
    except ImportError:
        die("нет yt-dlp: python3 -m pip install --user -U yt-dlp")


def ytdlp(url, out_tmpl, video, referer=None):
    cmd = ytdlp_cmd() + ["--no-playlist", "--no-progress", "--restrict-filenames",
                         "-o", out_tmpl, "--print", "after_move:filepath"]
    if video:
        cmd += ["-f", "bv*[height<=720]+ba/b[height<=720]/b", "--merge-output-format", "mp4"]
    else:
        cmd += ["-f", "ba/b[height<=480]/b", "-x", "--audio-format", "m4a"]
    if referer:
        cmd += ["--referer", referer]
    ck = have_cookies()
    if ck:
        cmd += ["--cookies", ck]
    cmd.append(url)
    r = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=3600)
    lines = [ln for ln in r.stdout.splitlines() if ln.strip()]
    if r.returncode == 0 and lines and os.path.isfile(lines[-1]):
        return lines[-1], None
    return None, (r.stderr or r.stdout).strip().splitlines()[-1:] or ["неизвестная ошибка"]


def api_video(vid, key):
    r = api("video.get", videos=vid + (f"_{key}" if key else ""))
    items = r.get("items", [])
    if not items:
        die(f"видео {vid} не найдено или закрыто для этого аккаунта")
    return items[0]


def download(url, dst):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0",
                                               "Referer": "https://vk.com/"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r, open(dst + ".part", "wb") as f:
            shutil.copyfileobj(r, f, 1 << 20)
    except Exception as e:
        print(f"  загрузка не удалась: {e}", file=sys.stderr)
        return None
    os.replace(dst + ".part", dst)
    return dst


def direct_url(v):
    files = v.get("files") or {}
    for k in ("mp4_480", "mp4_360", "mp4_720", "mp4_240", "mp4_1080", "hls", "dash_sep"):
        if files.get(k):
            return files[k]
    return None


def probe_duration(path):
    if not shutil.which("ffprobe"):
        return 0
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], stdin=subprocess.DEVNULL,
                       capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0


def frames(path, out_base, every):
    if not shutil.which("ffmpeg"):
        print("  (нет ffmpeg — кадры пропущены)")
        return None
    dst = out_base + "_frames_%02d.jpg"
    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", path,
                    "-vf", f"fps=1/{every},scale=320:-2,tile=4x2", "-q:v", "4", dst],
                   stdin=subprocess.DEVNULL, check=False)
    folder = os.path.dirname(out_base)
    stem = os.path.basename(out_base)
    got = sorted(f for f in os.listdir(folder) if f.startswith(stem + "_frames_"))
    return [os.path.join(folder, f) for f in got]


def fetch_one(link, a):
    """Скачивает одно видео. Возвращает (путь к файлу, метаданные)."""
    vid, key = parse_id(link)
    os.makedirs(a.out, exist_ok=True)
    stem = f"vk{vid}" if vid else "vk_video"
    tmpl = os.path.join(a.out, stem + ".%(ext)s")
    need_video = a.video or a.frames
    meta = {"id": vid, "url": link}

    path, err = ytdlp(link if link.startswith("http") else page_url(vid), tmpl, need_video)
    if not path and vid:
        # закрытое видео: берём прямую ссылку через API (вход по токену)
        print(f"  yt-dlp не смог ({err[0]}), пробую через VK API…", file=sys.stderr)
        v = api_video(vid, key)
        meta.update(title=v.get("title"), duration=v.get("duration"), owner_id=v.get("owner_id"),
                    description=v.get("description"))
        src = direct_url(v)
        if not src:
            ext = (v.get("platform") or "").strip()
            hint = f" (это ролик с {ext} — пришлите ссылку туда)" if ext else ""
            die(f"VK не отдал файл видео {vid}{hint}. "
                "Нужен токен с доступом к файлам видео или cookies — см. «Вход» в навыке.")
        if ".mp4" in src.split("?")[0] or "type=" in src:
            # прямой mp4: yt-dlp на таких ссылках получает 400, качаем сами
            path, err = download(src, os.path.join(a.out, stem + ".mp4")), ["ошибка загрузки"]
        else:
            path, err = ytdlp(src, tmpl, need_video, referer="https://vk.com/")
    if not path:
        die(f"не удалось скачать {link}: {err[0]}")
    if vid and "title" not in meta:
        try:
            v = api_video(vid, key)
            meta.update(title=v.get("title"), duration=v.get("duration"),
                        description=v.get("description"))
        except SystemExit:
            pass  # без входа метаданные необязательны
    meta["file"] = path
    if a.frames:
        dur = meta.get("duration") or probe_duration(path)
        every = max(3, int(dur / 24)) if dur else 5  # ~24 кадра на ролик, не чаще раза в 3 с
        meta["frames"] = frames(path, os.path.join(a.out, stem), every)
    with open(os.path.join(a.out, stem + ".info.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    return path, meta


def cmd_get(a):
    for link in a.links:
        print(f"Скачиваю {link}")
        path, meta = fetch_one(link, a)
        print(f"  файл: {path}")
        if meta.get("title"):
            print(f"  название: {meta['title']} [{short(meta.get('duration'))}]")
        for fr in meta.get("frames") or []:
            print(f"  кадры: {fr}")


def transcribe_script():
    cands = [os.path.join(HERE, "..", "..", "audio-transcribe", "scripts", "transcribe.py")]
    root = os.environ.get("CLAUDE_PROJECT_DIR")
    if root:
        cands.append(os.path.join(root, "plugins", "audio-transcribe", "scripts", "transcribe.py"))
    for c in cands:
        if os.path.isfile(c):
            return os.path.abspath(c)
    die("не найден скрипт расшифровки (плагин audio-transcribe)")


def cmd_transcribe(a):
    files = []
    for link in a.links:
        print(f"Скачиваю {link}")
        path, meta = fetch_one(link, a)
        files.append(path)
        for fr in meta.get("frames") or []:
            print(f"  кадры: {fr}")
    cmd = [sys.executable, transcribe_script(), *files, "--out", a.transcripts,
           "--model", a.model]
    if a.lang:
        cmd += ["--lang", a.lang]
    sys.exit(subprocess.run(cmd, stdin=subprocess.DEVNULL).returncode)


def main():
    p = argparse.ArgumentParser(description="Видео ВКонтакте: список, скачивание, расшифровка")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("auth", help="проверить вход")

    ls = sub.add_parser("list", help="список видео")
    ls.add_argument("--mine", action="store_true")
    ls.add_argument("--owner", type=int, help="id владельца (сообщество — с минусом)")
    ls.add_argument("--group", help="сообщество: ссылка vk.com/имя, club123 или имя")
    gr = sub.add_parser("groups", help="мои сообщества (найти закрытое по названию)")
    gr.add_argument("--find", help="часть названия")
    ls.add_argument("--album", type=int)
    ls.add_argument("--search")
    ls.add_argument("--faves", action="store_true")
    ls.add_argument("--count", type=int, default=20)
    ls.add_argument("--offset", type=int, default=0)

    for name in ("get", "transcribe"):
        g = sub.add_parser(name)
        g.add_argument("links", nargs="+")
        g.add_argument("--out", default="vk-videos")
        g.add_argument("--frames", action="store_true", help="сохранить раскадровку (листы 4×2)")
        g.add_argument("--video", action="store_true", help="скачать видео, а не только звук")
        if name == "transcribe":
            g.add_argument("--lang")
            g.add_argument("--model", default=os.environ.get("WHISPER_MODEL", "small"))
            g.add_argument("--transcripts", default="transcripts")

    a = p.parse_args()
    {"auth": cmd_auth, "groups": cmd_groups, "list": cmd_list, "get": cmd_get, "transcribe": cmd_transcribe}[a.cmd](a)


if __name__ == "__main__":
    main()
