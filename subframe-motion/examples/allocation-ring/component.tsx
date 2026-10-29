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

const HOLDINGS = [
  { label: "US equities", light: "#e6f5cf", color: "#acdf79", dark: "#47772f" },
  { label: "International", light: "#fff5da", color: "#d3b881", dark: "#6b5030" },
  { label: "Bonds", light: "#dfe8f1", color: "#8fa6ba", dark: "#344958" },
  { label: "Cash", light: "#b9bbb6", color: "#636760", dark: "#292e28" },
]
const PERIODS = [
  { label: "2024", values: [32480, 20160, 13440, 1120] },
  { label: "2025", values: [38610, 21735, 13560, 1595] },
  { label: "2026", values: [47180, 21063, 13480, 2527] },
]
const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

export default function Example({ active = true }: { active?: boolean }) {
  const uid = React.useId().replace(/:/g, "")
  const [period, setPeriod] = React.useState(2)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [hovered, setHovered] = React.useState<number | null>(null)
  const [keyboard, setKeyboard] = React.useState(false)
  const values = PERIODS[period].values
  const total = values.reduce((a, b) => a + b, 0)
  const current = hovered ?? selected
  let offset = 0
  const segments = values.map((value) => {
    const share = (value / total) * 100
    const part = { share, offset }
    offset += share
    return part
  })
  React.useEffect(() => {
    if (!active) {
      setHovered(null)
    }
  }, [active])
  return (
    <section
      className="sf-allocation-ring"
      data-still={!active || keyboard}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDownCapture={(e) => {
        setKeyboard(true)
        if (e.key === "Escape") {
          setSelected(null)
          setHovered(null)
        }
      }}
      aria-label="Investment allocation"
    >
      <div className="portfolio">
        <div className="ring-wrap">
          <svg
            viewBox="0 0 260 260"
            role="img"
            aria-label={
              current === null
                ? "Portfolio allocation ring"
                : `${HOLDINGS[current].label}: ${Math.round((values[current] / total) * 100)} percent`
            }
          >
            <defs>
              {HOLDINGS.map((part, i) => (
                <linearGradient
                  key={part.label}
                  id={`${uid}-g${i}`}
                  x1="0"
                  y1="0"
                  x2=".8"
                  y2="1"
                  gradientUnits="objectBoundingBox"
                >
                  <stop stopColor={part.light} />
                  <stop offset=".36" stopColor={part.color} />
                  <stop offset="1" stopColor={part.dark} />
                </linearGradient>
              ))}
            </defs>
            {Array.from({ length: 64 }, (_, i) => (
              <path key={i} d="M130 4v3" transform={`rotate(${i * 5.625} 130 130)`} stroke="#51544c" strokeWidth=".7" />
            ))}
            <circle cx="130" cy="130" r="97" stroke="#1b2019" strokeWidth="32" fill="none" />
            {segments.map((part, i) => (
              <g
                key={HOLDINGS[i].label}
                className="arc"
                style={{ opacity: current !== null && current !== i ? 0.22 : 1 }}
                onPointerEnter={(e) => {
                  if (active && e.pointerType === "mouse") {
                    setHovered(i)
                  }
                }}
                onPointerLeave={() => setHovered(null)}
                onClick={() => {
                  if (active) {
                    setSelected(selected === i ? null : i)
                  }
                }}
              >
                <circle
                  cx="130"
                  cy="130"
                  r="97"
                  pathLength="100"
                  fill="none"
                  stroke={`url(#${uid}-g${i})`}
                  strokeWidth={current === i ? 36 : 30}
                  transform="rotate(-90 130 130)"
                  style={{
                    strokeDasharray: `${Math.max(0, part.share - 1.3)} 100`,
                    strokeDashoffset: -part.offset - 0.65,
                  }}
                />
                <circle
                  className="glint"
                  cx="130"
                  cy="130"
                  r="109.5"
                  pathLength="100"
                  fill="none"
                  stroke={HOLDINGS[i].light}
                  strokeWidth=".65"
                  transform="rotate(-90 130 130)"
                  style={{
                    strokeDasharray: `${Math.max(0, part.share - 1.7)} 100`,
                    strokeDashoffset: -part.offset - 0.85,
                  }}
                />
              </g>
            ))}
          </svg>
          <div className="ring-readout" aria-hidden>
            <span>{current === null ? PERIODS[period].label : HOLDINGS[current].label}</span>
            <strong>{money(current === null ? total : values[current])}</strong>
            <span>
              {current === null ? "Portfolio balance" : `${Math.round((values[current] / total) * 100)}% of portfolio`}
            </span>
          </div>
        </div>
        <div className="holdings">
          <header>
            <strong>Asset allocation</strong>
          </header>
          <div className="periods" aria-label="Allocation year">
            {PERIODS.map((item, i) => (
              <button
                type="button"
                key={item.label}
                disabled={!active}
                aria-pressed={i === period}
                onClick={() => setPeriod(i)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="legend">
            {HOLDINGS.map((part, i) => (
              <button
                type="button"
                key={part.label}
                disabled={!active}
                aria-pressed={selected === i}
                aria-label={`${part.label}, ${money(values[i])}, ${Math.round((values[i] / total) * 100)} percent`}
                onPointerEnter={(e) => {
                  if (active && e.pointerType === "mouse") {
                    setHovered(i)
                  }
                }}
                onPointerLeave={() => setHovered(null)}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) {
                    setHovered(i)
                  }
                }}
                onBlur={() => setHovered(null)}
                onClick={() => setSelected(selected === i ? null : i)}
              >
                <i style={{ background: part.color }} />
                <span>{part.label}</span>
                <b>
                  {Math.round((values[i] / total) * 100)}
                  <small>%</small>
                </b>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="sr" role="status">
        {PERIODS[period].label}: {money(total)}.{" "}
        {selected !== null ? `${HOLDINGS[selected].label}, ${money(values[selected])}.` : ""}
      </div>
      <style>{`
.sf-allocation-ring{width:100%;height:100%;display:grid;place-items:center;background:#0c100c;color:#eff0e8;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}.sf-allocation-ring *{box-sizing:border-box}.sf-allocation-ring button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation}.sf-allocation-ring button:disabled{cursor:default}.sf-allocation-ring :focus-visible{outline:2px solid #c2eba3;outline-offset:3px}.sf-allocation-ring .portfolio{display:grid;grid-template-columns:274px 212px;gap:25px;align-items:center}.sf-allocation-ring .ring-wrap{position:relative;width:274px;height:274px}.sf-allocation-ring svg{width:100%;height:100%;overflow:visible}.sf-allocation-ring .arc{cursor:pointer;transition:opacity 140ms ease}.sf-allocation-ring .arc circle{transition:stroke-dasharray 460ms cubic-bezier(.22,1,.36,1),stroke-dashoffset 460ms cubic-bezier(.22,1,.36,1),stroke-width 160ms ease}.sf-allocation-ring .glint{opacity:.65;pointer-events:none}.sf-allocation-ring .ring-readout{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;gap:5px}.sf-allocation-ring .ring-readout>span{font-size:10px;color:#93998c}.sf-allocation-ring .ring-readout strong{font-size:31px;line-height:1.1;font-weight:450;letter-spacing:-1.2px;font-variant-numeric:tabular-nums}.sf-allocation-ring .ring-readout small{font-size:23px;letter-spacing:-.5px;margin-left:2px;color:#b2b7a9}.sf-allocation-ring header>span{color:#b3b9aa;font-size:12px}.sf-allocation-ring header>strong{display:block;font-size:21px;letter-spacing:-.5px;font-weight:480;white-space:nowrap;margin-top:3px;font-variant-numeric:tabular-nums}.sf-allocation-ring header small{font-size:23px;color:#798270;font-weight:400}.sf-allocation-ring .periods{display:flex;gap:8px;margin:12px 0 9px}.sf-allocation-ring .periods button{height:32px;position:relative;padding:0 10px;border:0;border-radius:20px;font-size:10px;background:none;color:#828a79}.sf-allocation-ring .periods button:after{content:"";position:absolute;inset:-6px 0}.sf-allocation-ring .periods button[aria-pressed=true]{background:#dee9ce;color:#263320;box-shadow:inset 0 1px 0 #fff8}.sf-allocation-ring .legend button{height:42px;padding:0 2px;display:flex;align-items:center;gap:8px;width:100%;background:none;border:0;border-bottom:1px solid #ffffff0c;font-size:11px;text-align:left}.sf-allocation-ring .legend button:last-child{border-bottom:0}.sf-allocation-ring .legend i{width:7px;height:7px;border-radius:50%}.sf-allocation-ring .legend b{margin-left:auto;font-size:12px;font-weight:500;font-variant-numeric:tabular-nums}.sf-allocation-ring .legend small{font-size:10px;font-weight:400;color:#8f9885}.sf-allocation-ring .legend button[aria-pressed=true] span{color:#c1e59e}.sf-allocation-ring .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-allocation-ring[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-allocation-ring *{transition:none!important}}`}</style>
    </section>
  )
}
