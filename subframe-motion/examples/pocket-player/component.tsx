/**
 * MIT License
 * Copyright (c) 2026 Subframe
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use client"
import * as React from "react"

function makeAudio() {
  const rate = 12000,
    seconds = 12,
    count = rate * seconds,
    buffer = new ArrayBuffer(44 + count * 2),
    view = new DataView(buffer)
  const text = (at: number, s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(at + i, s.charCodeAt(i))
    }
  }
  text(0, "RIFF")
  view.setUint32(4, 36 + count * 2, true)
  text(8, "WAVEfmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, "data")
  view.setUint32(40, count * 2, true)
  const notes = [220, 277.18, 329.63, 415.3, 369.99, 329.63, 277.18, 246.94]
  for (let i = 0; i < count; i++) {
    const t = i / rate,
      beat = t / 0.375,
      f = notes[Math.floor(beat) % notes.length],
      env =
        Math.min(1, (beat % 1) * 35) * Math.exp(-(beat % 1) * 5) * Math.min(1, t * 20) * Math.min(1, (seconds - t) * 3),
      v = (Math.sin(t * f * Math.PI * 2) + Math.sin(t * f * Math.PI * 4) * 0.16) * env * 0.18
    view.setInt16(44 + i * 2, v * 32767, true)
  }
  return new Blob([buffer], { type: "audio/wav" })
}
export default function Example({ active = true }: { active?: boolean }) {
  const audio = React.useRef<HTMLAudioElement>(null),
    [src, setSrc] = React.useState(""),
    [playing, setPlaying] = React.useState(false),
    [time, setTime] = React.useState(0),
    [rate, setRate] = React.useState(1),
    [error, setError] = React.useState("")
  React.useEffect(() => {
    const url = URL.createObjectURL(makeAudio())
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [])
  React.useEffect(() => {
    if (!active) {
      audio.current?.pause()
    }
  }, [active])
  async function toggle() {
    const a = audio.current
    if (!a || !active) {
      return
    }
    if (!a.paused) {
      a.pause()
      return
    }
    try {
      await a.play()
      setError("")
    } catch {
      setError("Playback could not start.")
    }
  }
  return (
    <div className="sf-pocket-player">
      <section className="player">
        <div className="cover" aria-hidden>
          <svg viewBox="0 0 220 220">
            <rect width="220" height="220" fill="#f15425" />
            {Array.from({ length: 10 }, (_, i) => (
              <path
                key={i}
                d={`M${20 + i * 18} 0 Q ${205 - i * 13} 110 ${20 + i * 18} 220`}
                fill="none"
                stroke="#142fa8"
                strokeWidth="8"
              />
            ))}
          </svg>
        </div>
        <div className="meta">
          <h3>Counterpoint</h3>
          <span>12-second soundmark</span>
        </div>
        <div className="seek">
          <input
            disabled={!active}
            aria-label="Audio position"
            type="range"
            min="0"
            max="12"
            step=".01"
            value={time}
            onChange={(e) => {
              if (audio.current) {
                audio.current.currentTime = +e.target.value
              }
              setTime(+e.target.value)
            }}
          />
          <div>
            <output>0:{String(Math.floor(time)).padStart(2, "0")}</output>
            <span>0:12</span>
          </div>
        </div>
        <div className="transport">
          <button
            disabled={!active}
            aria-label="Restart audio"
            onClick={() => {
              if (audio.current) {
                audio.current.currentTime = 0
              }
              setTime(0)
            }}
          >
            ↤
          </button>
          <button
            disabled={!active || !src}
            className="play"
            aria-label={playing ? "Pause audio" : "Play audio"}
            onClick={() => void toggle()}
          >
            {playing ? "Ⅱ" : "▷"}
          </button>
          <button
            disabled={!active}
            aria-label="Playback speed"
            onClick={() => {
              const next = rate === 1 ? 1.5 : rate === 1.5 ? 0.75 : 1
              setRate(next)
              if (audio.current) {
                audio.current.playbackRate = next
              }
            }}
          >
            {rate}×
          </button>
        </div>
        {error && <p role="status">{error}</p>}
        <audio
          ref={audio}
          src={src || undefined}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onError={() => setError("Audio could not load.")}
          preload="metadata"
        />
      </section>
      <style>{`.sf-pocket-player{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-pocket-player *{box-sizing:border-box}.sf-pocket-player button,.sf-pocket-player input,.sf-pocket-player select,.sf-pocket-player textarea{font:inherit;color:inherit}.sf-pocket-player button{cursor:pointer;touch-action:manipulation}.sf-pocket-player button:disabled{cursor:default;opacity:.45}.sf-pocket-player :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-pocket-player input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-pocket-player .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-pocket-player[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-pocket-player *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-pocket-player{background:#172da3;color:#f8eedb;padding:23px}.sf-pocket-player .player{display:grid;grid-template-columns:150px 1fr;column-gap:25px;width:min(100%,450px);align-items:center}.sf-pocket-player .cover{grid-row:1/4;position:relative;width:150px;height:150px;background:#ef542a;box-shadow:0 7px 20px #00145755}.sf-pocket-player .cover svg{width:150px;height:150px;display:block}.sf-pocket-player h3{font-size:24px;font-weight:500;letter-spacing:-.8px;margin:0 0 5px}.sf-pocket-player .meta>span{font-size:10px;color:#93a2e0}.sf-pocket-player .seek input{width:100%;margin:0;accent-color:#f75c34}.sf-pocket-player .seek>div{display:flex;justify-content:space-between;font:10px ui-monospace,monospace;color:#a1afe6;margin-top:-7px}.sf-pocket-player .transport{display:flex;align-items:center;justify-content:space-between;margin-top:12px}.sf-pocket-player button{width:44px;height:44px;background:none;border:0;color:#ced7ff;font-size:13px}.sf-pocket-player .play{width:52px;height:52px;border-radius:50%;background:#f0ead6;color:#172da3;font-size:26px}.sf-pocket-player p{font-size:10px;grid-column:1/-1}@container(max-width:360px){.sf-pocket-player .player{grid-template-columns:82px 1fr;column-gap:16px}.sf-pocket-player .cover{width:82px;height:82px;grid-row:1/3}.sf-pocket-player .cover svg{width:82px;height:82px}.sf-pocket-player h3{font-size:20px}.sf-pocket-player .transport{grid-column:1/-1;justify-content:center;gap:33px;margin-top:21px}.sf-pocket-player .seek{align-self:end}}`}</style>
    </div>
  )
}
