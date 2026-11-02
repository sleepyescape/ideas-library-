#!/usr/bin/env python3
"""Расшифровка аудио/видео в текст на faster-whisper (локально, без ключей).

  python3 transcribe.py ЗАПИСЬ [ЗАПИСЬ ...] [--model small] [--lang ru] [--out папка]
                                            [--formats txt,srt,vtt,json] [--translate]

Принимает любые форматы, которые читает ffmpeg (mp3, m4a, ogg/opus из Telegram,
wav, mp4, mov, webm...), а также ссылки http(s) — файл скачивается.
Для каждой записи сохраняет <имя>.txt (с таймкодами), <имя>.srt, <имя>.vtt, <имя>.json.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request


def ts(sec, sep=","):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"


def short(sec):
    m, s = divmod(int(sec), 60)
    h, m = divmod(m, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def fetch(src, tmpdir):
    if not src.startswith(("http://", "https://")):
        if not os.path.isfile(src):
            sys.exit(f"Нет такого файла: {src}")
        return src
    name = os.path.basename(src.split("?")[0]) or "audio"
    dst = os.path.join(tmpdir, name)
    print(f"Скачиваю {src} ...", file=sys.stderr)
    urllib.request.urlretrieve(src, dst)
    return dst


def load_audio(path):
    """Декодирует звук через ffmpeg в 16 кГц моно (обходит несовместимость PyAV)."""
    if not shutil.which("ffmpeg"):
        return path  # пусть faster-whisper декодирует сам
    import numpy as np
    r = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", path,
                        "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                       capture_output=True)
    if r.returncode != 0 or not r.stdout:
        sys.exit(f"ffmpeg не смог прочитать {path}: {r.stderr.decode(errors='ignore')[-300:]}")
    return np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768.0


def main():
    p = argparse.ArgumentParser(description="Расшифровка аудио/видео в текст (Whisper)")
    p.add_argument("inputs", nargs="+", help="файлы или ссылки")
    p.add_argument("--model", default=os.environ.get("WHISPER_MODEL", "small"),
                   help="tiny|base|small|medium|large-v3|turbo (по умолчанию small)")
    p.add_argument("--lang", default=None, help="язык речи, напр. ru, en (по умолчанию — авто)")
    p.add_argument("--out", default="transcripts", help="папка для результатов")
    p.add_argument("--formats", default="txt,srt,vtt,json")
    p.add_argument("--translate", action="store_true", help="сразу перевести на английский")
    p.add_argument("--no-vad", action="store_true", help="не вырезать тишину")
    a = p.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("Нет faster-whisper. Установите: python3 -m pip install --user faster-whisper")

    formats = {f.strip() for f in a.formats.split(",") if f.strip()}
    os.makedirs(a.out, exist_ok=True)
    print(f"Загружаю модель {a.model} ...", file=sys.stderr)
    model = WhisperModel(a.model, device="auto", compute_type="int8")

    with tempfile.TemporaryDirectory() as tmp:
        for src in a.inputs:
            path = fetch(src, tmp)
            base = os.path.join(a.out, os.path.splitext(os.path.basename(path))[0])
            t0 = time.time()
            segments, info = model.transcribe(
                load_audio(path), language=a.lang, vad_filter=not a.no_vad, beam_size=5,
                task="translate" if a.translate else "transcribe")
            print(f"{os.path.basename(path)}: язык {info.language} "
                  f"({info.language_probability:.0%}), длина {short(info.duration)}", file=sys.stderr)
            segs = []
            for s in segments:
                text = s.text.strip()
                if not text:
                    continue
                segs.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": text})
                print(f"[{short(s.start)}] {text}", file=sys.stderr)

            if "txt" in formats:
                with open(base + ".txt", "w", encoding="utf-8") as f:
                    f.write("\n".join(f"[{short(s['start'])}] {s['text']}" for s in segs) + "\n")
            if "srt" in formats:
                with open(base + ".srt", "w", encoding="utf-8") as f:
                    for i, s in enumerate(segs, 1):
                        f.write(f"{i}\n{ts(s['start'])} --> {ts(s['end'])}\n{s['text']}\n\n")
            if "vtt" in formats:
                with open(base + ".vtt", "w", encoding="utf-8") as f:
                    f.write("WEBVTT\n\n")
                    for s in segs:
                        f.write(f"{ts(s['start'], '.')} --> {ts(s['end'], '.')}\n{s['text']}\n\n")
            if "json" in formats:
                with open(base + ".json", "w", encoding="utf-8") as f:
                    json.dump({"source": src, "language": info.language,
                               "duration": round(info.duration, 2), "model": a.model,
                               "segments": segs}, f, ensure_ascii=False, indent=2)
            print(f"Готово за {time.time() - t0:.0f} с → {base}.{{{','.join(sorted(formats))}}}",
                  file=sys.stderr)
            print(base + ".txt" if "txt" in formats else base)


if __name__ == "__main__":
    main()
