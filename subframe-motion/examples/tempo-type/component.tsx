/**
 * MIT License
 *
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

import { useEffect, useRef, useState } from "react"
const modes = ["LIFT", "PRESS", "HOLD"] as const
export default function TempoType({ active = true }: { active?: boolean }) {
  const [mode, setMode] = useState(0)
  const [bpm, setBpm] = useState(84)
  const [playing, setPlaying] = useState(false)
  const [reduced, setReduced] = useState(true)
  const word = useRef<HTMLDivElement>(null)
  const ticks = useRef<HTMLDivElement>(null)
  const beats = useRef(0)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    let frame = 0,
      last = 0
    const el = word.current,
      rail = ticks.current
    if (!el || !rail) {
      return
    }
    const reset = () => {
      el.style.transform = "scale(1)"
      el.style.opacity = "1"
    }
    function draw(now: number) {
      if (!el || !rail) {
        return
      }
      if (last) {
        beats.current += ((Math.min(now - last, 64) / 1000) * bpm) / 60
      }
      last = now
      const phase = beats.current % 1,
        envelope = Math.pow(Math.max(0, 1 - phase / 0.57), 2),
        beat = Math.floor(beats.current) % 16
      el.style.transform =
        mode === 0
          ? `scale(${1 - envelope * 0.04},${1 + envelope * 0.23})`
          : mode === 1
          ? `scale(${1 + envelope * 0.075},${1 - envelope * 0.22})`
          : "scale(1)"
      el.style.opacity = mode === 2 ? String(1 - envelope * 0.23) : "1"
      Array.from(rail.children).forEach((tick, i) => {
        ;(tick as HTMLElement).dataset.on = String(i === beat)
      })
      frame = requestAnimationFrame(draw)
    }
    if (active && playing && !reduced) {
      frame = requestAnimationFrame(draw)
    } else {
      reset()
    }
    return () => {
      cancelAnimationFrame(frame)
      reset()
    }
  }, [active, playing, reduced, bpm, mode])
  return (
    <section className="sf-tempo-type">
      <div className="sf-tt-modes" role="group" aria-label="Motion pattern">
        {modes.map((m, i) => (
          <button type="button" key={m} aria-pressed={mode === i} onClick={() => setMode(i)}>
            {m[0] + m.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div className="sf-tt-word-wrap">
        <div ref={word} className="sf-tt-word">
          {modes[mode]}
        </div>
      </div>
      <div ref={ticks} className="sf-tt-ticks" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="sf-tt-controls">
        <button type="button" className="sf-tt-play" aria-pressed={playing} onClick={() => setPlaying(!playing)}>
          {playing ? "Pause" : "Start"}
          <span>{playing ? "Ⅱ" : "▶"}</span>
        </button>
        <div className="sf-tt-tempo">
          <button
            type="button"
            aria-label="Slower by four BPM"
            disabled={bpm <= 40}
            onClick={() => setBpm((v) => Math.max(40, v - 4))}
          >
            −
          </button>
          <output aria-live="polite">
            {bpm}
            <span>BPM</span>
          </output>
          <button
            type="button"
            aria-label="Faster by four BPM"
            disabled={bpm >= 160}
            onClick={() => setBpm((v) => Math.min(160, v + 4))}
          >
            +
          </button>
        </div>
      </div>
      <style>{`.sf-tempo-type{width:100%;height:100%;min-height:280px;position:relative;background:#ffe319;color:#161911;font-family:Arial,sans-serif;overflow:hidden;box-sizing:border-box;container-type:inline-size;padding:15px 24px}.sf-tempo-type *{box-sizing:border-box}.sf-tt-modes{display:flex;gap:4px;position:relative;z-index:2}.sf-tt-modes button{border:0;border-bottom:2px solid transparent;background:none;color:inherit;min-height:44px;min-width:58px;font:11px monospace;padding:0 12px;cursor:pointer;opacity:.55}.sf-tt-modes button[aria-pressed=true]{opacity:1;border-bottom-color:currentColor}.sf-tt-word-wrap{position:absolute;left:24px;right:24px;top:69px;bottom:102px;display:flex;align-items:center;justify-content:center}.sf-tt-word{font-size:clamp(69px,25cqw,148px);font-weight:900;letter-spacing:-.085em;line-height:.75;transform-origin:center bottom;padding-right:.06em}.sf-tt-ticks{position:absolute;left:28px;right:28px;bottom:84px;display:flex;justify-content:space-between;height:10px;align-items:center}.sf-tt-ticks i{height:3px;width:3px;border-radius:50%;background:currentColor;opacity:.35}.sf-tt-ticks i:nth-child(4n+1){height:8px;width:1px;border-radius:0;opacity:.7}.sf-tt-ticks i[data-on=true]{height:10px;width:10px;border-radius:50%;opacity:1}.sf-tt-controls{position:absolute;bottom:17px;left:24px;right:24px;height:48px;border-top:1px solid #16191155;display:flex;justify-content:space-between;align-items:center}.sf-tt-controls button{background:none;color:inherit;border:0;min-width:44px;height:44px;font:19px monospace;cursor:pointer}.sf-tt-controls button:disabled{opacity:.25;cursor:default}.sf-tt-controls .sf-tt-play{font:11px monospace;display:flex;align-items:center;gap:25px;padding:0 9px}.sf-tt-tempo{display:flex;align-items:center}.sf-tt-tempo output{font:18px monospace;min-width:58px;display:flex;flex-direction:column;align-items:center;font-variant-numeric:tabular-nums;line-height:1.1}.sf-tt-tempo output>span{font:8px monospace;letter-spacing:.12em;margin-top:3px}.sf-tempo-type button:focus-visible{outline:2px solid #161911;outline-offset:0}.sf-tempo-type button:active:not(:disabled){background:#1619110d}@container(max-width:360px){.sf-tt-controls{left:18px;right:14px}.sf-tt-controls .sf-tt-play{gap:14px}.sf-tt-word{font-size:25cqw}.sf-tt-word-wrap{top:76px;bottom:111px}}`}</style>
    </section>
  )
}
