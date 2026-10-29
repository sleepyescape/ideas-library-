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
const WORDS = ["Less", "noise.", "More", "feeling."]
const BEATS = [0, 0.72, 1.65, 2.3]
const DURATION = 3.8
export default function CaptionBeats({ active = true }: { active?: boolean }) {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false),
    [reduced, setReduced] = useState(true),
    [seeking, setSeeking] = useState(false)
  const elapsed = useRef(0),
    phrase = useRef<HTMLParagraphElement>(null),
    highlight = useRef<HTMLSpanElement>(null)
  const word = Math.max(
    0,
    BEATS.reduce((current, value, index) => (value <= time ? index : current), 0),
  )
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)"),
      change = () => setReduced(q.matches)
    change()
    q.addEventListener("change", change)
    return () => q.removeEventListener("change", change)
  }, [])
  useEffect(() => {
    if (!active || !playing || reduced) {
      return
    }
    let frame = 0,
      last = 0
    const tick = (now: number) => {
      if (last) {
        elapsed.current = Math.min(DURATION, elapsed.current + Math.min(now - last, 100) / 1000)
      }
      last = now
      setTime(elapsed.current)
      if (elapsed.current >= DURATION) {
        setPlaying(false)
      } else {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, playing, reduced])
  useEffect(() => {
    if (reduced) {
      setPlaying(false)
    }
  }, [reduced])
  useEffect(() => {
    const p = phrase.current,
      h = highlight.current
    if (!p || !h) {
      return
    }
    const update = () => {
      const el = p.querySelector<HTMLElement>(`[data-word="${word}"]`)
      if (!el) {
        return
      }
      const x = el.offsetLeft - 7,
        y = el.offsetTop - 3,
        width = el.offsetWidth + 14,
        height = el.offsetHeight + 6
      h.style.transform = `translate(${x}px,${y}px)`
      h.style.height = height + "px"
      h.querySelector<HTMLElement>(".sf-cb-highlight-fill")!.style.transform = `scaleX(${width - 16})`
      h.querySelector<HTMLElement>(".sf-cb-highlight-end")!.style.transform = `translateX(${width - 8}px)`
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(p)
    return () => ro.disconnect()
  }, [word])
  const seek = (value: number) => {
    elapsed.current = value
    setTime(value)
    setPlaying(false)
    setSeeking(true)
  }
  return (
    <section className="sf-caption-beats" data-still={reduced || !active || seeking}>
      <p className="sf-cb-caption" ref={phrase} aria-label="Less noise. More feeling.">
        <span ref={highlight} className="sf-cb-highlight" aria-hidden="true">
          <i className="sf-cb-highlight-start" />
          <i className="sf-cb-highlight-fill" />
          <i className="sf-cb-highlight-end" />
        </span>
        {[0, 1].map((row) => (
          <span className="sf-cb-row" key={row}>
            {WORDS.slice(row * 2, row * 2 + 2).map((w, j) => {
              const i = row * 2 + j
              return (
                <span key={w} className="sf-cb-word" data-word={i} data-current={word === i} aria-hidden="true">
                  {w}
                </span>
              )
            })}
          </span>
        ))}
      </p>
      <div className="sf-cb-transport">
        <button
          type="button"
          disabled={!active}
          aria-label={playing ? "Pause caption" : reduced ? "Next caption word" : "Play caption"}
          onClick={() => {
            setSeeking(false)
            if (reduced) {
              seek(BEATS[(word + 1) % 4])
              return
            }
            if (!playing && time >= DURATION) {
              elapsed.current = 0
              setTime(0)
            }
            setPlaying((v) => !v)
          }}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="m5 3 8 5-8 5z" />}
          </svg>
        </button>
        <div className="sf-cb-track">
          <span className="sf-cb-progress" aria-hidden="true" style={{ transform: `scaleX(${time / DURATION})` }} />
          <span
            className="sf-cb-thumb-travel"
            aria-hidden="true"
            style={{ transform: `translateX(${(time / DURATION) * 100}%)` }}
          >
            <i />
          </span>
          <input
            type="range"
            min="0"
            max={DURATION}
            step=".01"
            aria-label="Caption time"
            aria-valuetext={time.toFixed(2) + " seconds"}
            disabled={!active}
            defaultValue={0}
            aria-valuenow={time}
            onPointerDown={(event) => {
              event.currentTarget.value = String(elapsed.current)
            }}
            onFocus={(event) => {
              event.currentTarget.value = String(elapsed.current)
            }}
            onKeyDown={(event) => {
              const delta =
                event.key === "ArrowRight" || event.key === "ArrowUp"
                  ? 0.1
                  : event.key === "ArrowLeft" || event.key === "ArrowDown"
                  ? -0.1
                  : event.key === "PageUp"
                  ? DURATION / 10
                  : event.key === "PageDown"
                  ? -DURATION / 10
                  : 0
              if (!delta && event.key !== "Home" && event.key !== "End") {
                return
              }
              event.preventDefault()
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                  ? DURATION
                  : Math.max(0, Math.min(DURATION, elapsed.current + delta))
              event.currentTarget.value = String(next)
              seek(next)
            }}
            onChange={(e) => seek(+e.target.value)}
          />
          <div className="sf-cb-marks" aria-hidden="true">
            {BEATS.slice(1).map((t) => (
              <i key={t} style={{ left: (t / DURATION) * 100 + "%" }} />
            ))}
          </div>
        </div>
        <output aria-label="Caption time in seconds" aria-live="off">
          {time.toFixed(1)}
          <span> / {DURATION.toFixed(1)}</span>
        </output>
      </div>
      <style>{`.sf-caption-beats{width:100%;height:100%;position:relative;background:#1c2735;color:#faf1d9;font-family:Arial,sans-serif;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center}.sf-caption-beats *{box-sizing:border-box}.sf-cb-caption{position:relative;width:440px;display:block;margin:0 0 36px;font:600 49px/1.3 Arial,sans-serif;letter-spacing:-2.2px}.sf-cb-row{display:flex;justify-content:center;gap:19px;margin:10px 0}.sf-cb-word{position:relative;z-index:1;display:inline-block;color:#7f8b96;transition:color 230ms ease}.sf-cb-word[data-current=true]{color:#1c2735}.sf-cb-highlight{position:absolute;top:0;left:0;width:0;transition:transform 350ms cubic-bezier(.22,1,.36,1);pointer-events:none}.sf-cb-highlight i{position:absolute;top:0;height:100%;background:#e8b45d;transition:transform 350ms cubic-bezier(.22,1,.36,1)}.sf-cb-highlight-start{left:0;width:8px;border-radius:8px 0 0 8px}.sf-cb-highlight-fill{left:8px;width:1px;transform-origin:left center}.sf-cb-highlight-end{left:0;width:8px;border-radius:0 8px 8px 0}.sf-cb-transport{position:absolute;bottom:37px;display:flex;align-items:center;gap:19px;width:426px;color:#d7dce0}.sf-cb-transport button{width:44px;height:44px;flex-shrink:0;display:grid;place-items:center;border:1px solid #56616e;border-radius:50%;background:#ffffff05;color:inherit;cursor:pointer;touch-action:manipulation}.sf-cb-transport button:active{background:#ffffff15}.sf-cb-transport button svg{width:16px;height:16px;fill:currentColor}.sf-cb-track{position:relative;height:44px;flex:1;display:flex;align-items:center}.sf-cb-track:before{content:"";height:2px;position:absolute;left:0;right:0;background:#4b5663}.sf-cb-progress{height:2px;position:absolute;left:0;right:0;transform-origin:left center;background:#e8b45d}.sf-cb-thumb-travel{position:absolute;left:0;right:10px;top:17px;pointer-events:none}.sf-cb-thumb-travel i{display:block;width:10px;height:10px;background:#edc27e;border:2px solid #1c2735;border-radius:50%;box-shadow:0 0 0 1px #edc27e}.sf-cb-track:focus-within{outline:2px solid #e8b45d;outline-offset:4px}.sf-cb-track input{opacity:0;position:absolute;inset:0;width:100%;height:44px;margin:0;background:transparent;appearance:none;cursor:ew-resize;z-index:2}.sf-cb-track input::-webkit-slider-thumb{appearance:none;width:10px;height:10px;background:#edc27e;border:2px solid #1c2735;border-radius:50%;box-shadow:0 0 0 1px #edc27e}.sf-cb-track input::-moz-range-thumb{width:8px;height:8px;background:#edc27e;border:2px solid #1c2735;border-radius:50%}.sf-cb-marks{position:absolute;left:0;right:0;pointer-events:none}.sf-cb-marks i{position:absolute;width:1px;height:6px;top:7px;background:#718092}.sf-cb-transport output{font:10px ui-monospace,monospace;font-variant-numeric:tabular-nums;width:61px;flex-shrink:0}.sf-cb-transport output>span{color:#84929f}.sf-caption-beats :focus-visible{outline:2px solid #e8b45d;outline-offset:4px}.sf-caption-beats :disabled{cursor:default;opacity:.5}.sf-caption-beats[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-caption-beats *{transition:none!important}}`}</style>
    </section>
  )
}
