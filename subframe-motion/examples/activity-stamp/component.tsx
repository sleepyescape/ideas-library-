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

import { useRef, useState } from "react"
const seed = [0, 1, 3, 6, 7, 9, 11, 13, 14, 17, 18, 21]
export default function ActivityStamp({ active = true }: { active?: boolean }) {
  const [days, setDays] = useState<number[]>(seed)
  const [focus, setFocus] = useState(21)
  const [stamped, setStamped] = useState<number | null>(null)
  const [instant, setInstant] = useState(false)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  function toggle(i: number) {
    setStamped(days.includes(i) ? null : i)
    setDays((d) => (d.includes(i) ? d.filter((n) => n !== i) : [...d, i]))
  }
  return (
    <section
      className="sf-activity-stamp"
      data-still={!active || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="sf-as-heading">
        <strong>Daily practice</strong>
      </div>
      <div className="sf-as-grid" role="group" aria-label="Four-week practice grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span className="sf-as-weekday" aria-hidden="true" key={i}>
            {d}
          </span>
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <button
            type="button"
            ref={(el) => {
              buttons.current[i] = el
            }}
            key={i}
            tabIndex={focus === i ? 0 : -1}
            aria-label={`Practice day ${i + 1}`}
            aria-pressed={days.includes(i)}
            className="sf-as-day"
            data-stamp={stamped === i && days.includes(i)}
            onFocus={() => setFocus(i)}
            onClick={() => toggle(i)}
            onKeyDown={(e) => {
              const delta =
                e.key === "ArrowLeft"
                  ? -1
                  : e.key === "ArrowRight"
                  ? 1
                  : e.key === "ArrowUp"
                  ? -7
                  : e.key === "ArrowDown"
                  ? 7
                  : 0
              if (delta) {
                e.preventDefault()
                const next = Math.max(0, Math.min(27, i + delta))
                setFocus(next)
                buttons.current[next]?.focus()
              }
              if (e.key === "Home" || e.key === "End") {
                e.preventDefault()
                const next = e.key === "Home" ? 0 : 27
                setFocus(next)
                buttons.current[next]?.focus()
              }
            }}
          >
            <span style={{ rotate: `${((i * 7) % 17) - 8}deg` }}>{String(i + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
      <div className="sf-as-footer">
        <output aria-live="polite">
          <b>{days.length}</b>
          <span>/ 28 days</span>
        </output>
        <button
          type="button"
          onClick={() => {
            setDays([])
            setStamped(null)
          }}
        >
          Clear
        </button>
      </div>
      <style>{`.sf-activity-stamp{width:100%;height:100%;min-height:280px;background:#fff;color:#22232a;font-family:Arial,sans-serif;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:7px 6px;overflow:hidden}.sf-activity-stamp *{box-sizing:border-box}.sf-as-heading{width:min(100%,364px);height:36px;display:flex;align-items:center;padding:0 7px}.sf-as-heading strong{font-size:16px;letter-spacing:-.5px;font-weight:500}.sf-as-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));width:min(100%,364px);row-gap:0}.sf-as-weekday{font:9px monospace;color:#818389;height:20px;display:grid;place-items:center;border-bottom:1px solid #2222;margin-bottom:4px}.sf-as-day{height:44px;width:100%;min-width:0;padding:0;display:grid;place-items:center;border:0;background:none;color:#777a82;cursor:pointer;position:relative;isolation:isolate}.sf-as-day>span{height:33px;width:33px;border-radius:50%;display:grid;place-items:center;font:10px monospace;position:relative}.sf-as-day[aria-pressed=true]>span{background:#e52b26;color:white;box-shadow:inset 0 0 0 1px #d51c1880}.sf-as-day[aria-pressed=true]>span:after{content:"";position:absolute;inset:2px;border:1px solid #fff7;border-radius:50%;background:radial-gradient(ellipse at 17% 19%,#ffffffb0 0 .6px,transparent 1px),radial-gradient(ellipse at 82% 78%,#ffffffa0 0 .7px,transparent 1.2px)}.sf-as-day[data-stamp=true]>span{animation:sf-as-press 180ms cubic-bezier(.2,.9,.3,1) both}.sf-as-day:focus-visible{outline:2px solid #242629;outline-offset:-2px;z-index:2}.sf-as-footer{width:min(100%,364px);height:44px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #2222;margin-top:4px;padding:0 7px}.sf-as-footer output{display:flex;align-items:baseline;gap:8px}.sf-as-footer b{font:24px Georgia,serif;color:#e52b26;font-variant-numeric:tabular-nums}.sf-as-footer output>span{font:10px monospace;color:#777a82}.sf-as-footer button{height:44px;min-width:44px;padding:0;border:0;background:none;font:10px monospace;cursor:pointer;color:#35363a}.sf-as-footer button:focus-visible{outline:2px solid #242629;outline-offset:-2px}@keyframes sf-as-press{from{transform:scale(1.22);opacity:.6}to{transform:scale(1);opacity:1}}.sf-activity-stamp[data-still=true] .sf-as-day>span{animation:none}@media(prefers-reduced-motion:reduce){.sf-as-day>span{animation:none!important}}`}</style>
    </section>
  )
}
