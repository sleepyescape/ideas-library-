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

  const values = [22, 28, 25, 42, 38, 51, 47, 61, 57, 76, 68, 82],
    [index, setIndex] = React.useState(8)
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"}${i * 26 + 10} ${104 - v}`).join(" ")

  const inspect = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.querySelector("svg")!.getBoundingClientRect()
    const scale = Math.min(bounds.width / 310, bounds.height / 115)
    const x = (event.clientX - bounds.left - (bounds.width - 310 * scale) / 2) / scale
    setIndex(Math.max(0, Math.min(11, Math.round((x - 10) / 26))))
  }

  return (
    <div
      className="sf-chart-crosshair"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="cross-chart">
        <div className="row between">
          <span className="muted">Weekly sessions</span>
          <span className="chart-date">Week {index + 1}</span>
        </div>
        <div className="chart-value">
          <strong>{(values[index] * 134).toLocaleString("en-US")}</strong>
          <span>sessions</span>
        </div>
        <div
          className="plot"
          role="slider"
          tabIndex={0}
          aria-label="Week to inspect"
          aria-valuemin={1}
          aria-valuemax={12}
          aria-valuenow={index + 1}
          aria-valuetext={"Week " + (index + 1) + ", " + values[index] * 134 + " sessions"}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            inspect(e)
          }}
          onPointerMove={(e) => {
            if (e.pointerType === "mouse" || e.currentTarget.hasPointerCapture(e.pointerId)) {
              inspect(e)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault()
              setIndex((i) => Math.max(0, Math.min(11, i + (e.key === "ArrowRight" ? 1 : -1))))
            }
            if (e.key === "Home" || e.key === "End") {
              e.preventDefault()
              setIndex(e.key === "Home" ? 0 : 11)
            }
          }}
        >
          <svg viewBox="0 0 310 115" aria-hidden>
            <path d="M10 25H296M10 62H296M10 99H296" stroke="#e6edf0" strokeDasharray="3 4" fill="none" />
            <path d={path + " L296 104 L10 104 Z"} fill="#c9e3dd50" />
            <path d={path} fill="none" stroke="#659a8b" strokeWidth="2" strokeLinejoin="round" />
            <path d={`M${index * 26 + 10} 4V104`} stroke="#9ab9af" strokeDasharray="3 3" />
            <circle cx={index * 26 + 10} cy={104 - values[index]} r="5" fill="#fff" stroke="#5d9885" strokeWidth="2" />
          </svg>
        </div>
        <div className="chart-axis">
          <span>01 Sep</span>
          <span>24 Nov</span>
        </div>
      </div>
      <style>{`
.sf-chart-crosshair {
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
.sf-chart-crosshair * {
  box-sizing: border-box;
}
.sf-chart-crosshair button,
.sf-chart-crosshair input,
.sf-chart-crosshair textarea,
.sf-chart-crosshair select {
  font: inherit;
  color: inherit;
}
.sf-chart-crosshair button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-chart-crosshair button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-chart-crosshair button:focus-visible,
.sf-chart-crosshair input:focus-visible,
.sf-chart-crosshair textarea:focus-visible,
.sf-chart-crosshair [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-chart-crosshair button {
  border: 0;
  background: transparent;
}
.sf-chart-crosshair .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-chart-crosshair .between {
  justify-content: space-between;
}
.sf-chart-crosshair .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-chart-crosshair svg {
  display: block;
}
.sf-chart-crosshair[data-keyboard="true"] *,
.sf-chart-crosshair[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-chart-crosshair *,
  .sf-chart-crosshair *::before,
  .sf-chart-crosshair *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-chart-crosshair {
  background: #e5ece9;
}
.sf-chart-crosshair .cross-chart {
  width: min(100%, 390px);
  padding: 23px;
  background: #fff;
  border: 1px solid #d5e1db;
  border-radius: 15px;
  box-shadow: 0 15px 35px #24453613;
}
.sf-chart-crosshair .chart-date {
  font-size: 10px;
  color: #6c7f76;
}
.sf-chart-crosshair .chart-value {
  display: flex;
  gap: 9px;
  align-items: baseline;
  margin: 11px 0 14px;
}
.sf-chart-crosshair .chart-value strong {
  font-size: 28px;
  letter-spacing: -1px;
  font-weight: 500;
  color: #456e5e;
  font-variant-numeric: tabular-nums;
}
.sf-chart-crosshair .chart-value > span {
  font-size: 10px;
  color: #78867f;
}
.sf-chart-crosshair .plot {
  cursor: crosshair;
  touch-action: pan-y;
}
.sf-chart-crosshair .plot svg {
  width: 100%;
  height: 115px;
}
.sf-chart-crosshair .chart-axis {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #78867e;
  margin-top: 5px;
}
`}</style>
    </div>
  )
}
