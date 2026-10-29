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

export default function Example({ active = true }: { active?: boolean }) {
  const [reduced, setReduced] = React.useState(true)
  const [keyboard, setKeyboard] = React.useState(false)
  React.useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(m.matches)
    update()
    m.addEventListener("change", update)
    return () => m.removeEventListener("change", update)
  }, [])
  const running = active && !reduced

  const [from, setFrom] = React.useState(12),
    [to, setTo] = React.useState<number | null>(15)
  function choose(day: number) {
    if (to !== null || day < from) {
      setFrom(day)
      setTo(null)
    } else {
      setTo(day)
    }
  }

  return (
    <div
      className="sf-calendar-range"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="calendar">
        <div className="month">
          November <span>2026</span>
        </div>
        <div className="days">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              aria-label={"November " + d + (d === from ? ", start" : d === to ? ", end" : "")}
              aria-pressed={d >= from && d <= (to ?? from)}
              className={
                (d === from ? "first " : "") +
                (d === to ? "last " : "") +
                (d > from && d < (to ?? from) ? "middle" : "")
              }
              onClick={() => choose(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="dates" role="status">
          <span>
            Nov {from} <span aria-hidden>→</span> {to ? "Nov " + to : "Choose end"}
          </span>
          <strong>{to ? to - from + " nights" : ""}</strong>
        </div>
      </div>
      <style>{`
.sf-calendar-range {
  width: 100%;
  height: 100%;
  min-height: 260px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: 20px;
  background: #edf0f3;
  color: #22272d;
  font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  isolation: isolate;
  overflow: hidden;
}
.sf-calendar-range * {
  box-sizing: border-box;
}
.sf-calendar-range button,
.sf-calendar-range input,
.sf-calendar-range textarea,
.sf-calendar-range select {
  font: inherit;
  color: inherit;
}
.sf-calendar-range button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-calendar-range button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-calendar-range button:focus-visible,
.sf-calendar-range input:focus-visible,
.sf-calendar-range textarea:focus-visible,
.sf-calendar-range [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-calendar-range button {
  border: 0;
  background: transparent;
}
.sf-calendar-range .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-calendar-range .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-calendar-range svg {
  display: block;
}
.sf-calendar-range[data-keyboard="true"] *,
.sf-calendar-range[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-calendar-range *,
  .sf-calendar-range *::before,
  .sf-calendar-range *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-calendar-range {
  background: #e8edeb;
  padding: 8px;
}
.sf-calendar-range .calendar {
  width: 295px;
  max-width: 100%;
  padding: 16px;
  background: #fff;
  border: 1px solid #d9e0dc;
  border-radius: 14px;
  box-shadow: 0 15px 40px #23473514;
}
.sf-calendar-range .month {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 14px;
}
.sf-calendar-range .month span {
  color: #707974;
  font-weight: 400;
  margin-left: 5px;
}
.sf-calendar-range .days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px 0;
}
.sf-calendar-range .days > span {
  font-size: 10px;
  color: #6e7771;
  text-align: center;
  height: 20px;
}
.sf-calendar-range .days button {
  height: 29px;
  font-size: 11px;
  border-radius: 0;
  transition: background 140ms, color 140ms;
}
.sf-calendar-range .days .first,
.sf-calendar-range .days .last {
  background: #376d58;
  color: #ffffff;
  border-radius: 6px;
}
.sf-calendar-range .days .middle {
  background: #e8f1ec;
  color: #3e6c58;
}
.sf-calendar-range .dates {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #edf1ee;
  font-size: 10px;
  color: #7b8f82;
}
.sf-calendar-range .dates strong {
  font-weight: 500;
  color: #356c52;
}
`}</style>
    </div>
  )
}
