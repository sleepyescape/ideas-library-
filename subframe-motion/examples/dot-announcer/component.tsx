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
function useReduced() {
  const [reduced, setReduced] = React.useState(true)
  React.useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return reduced
}

const PATTERNS = [
  ["000000000", "001111100", "010000010", "100101001", "100000001", "100000001", "010111010", "001000100", "000111000"],
  ["000000000", "000010000", "000010000", "000010000", "000010000", "000000000", "000010000", "000000000", "000000000"],
  ["000000000", "000000010", "000000100", "010001000", "001010000", "000100000", "000000000", "000000000", "000000000"],
]
const LABELS = ["Available", "Quiet", "Complete"]
const GLYPHS: Record<string, string[]> = {
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
}
export default function Example({ active = true }: { active?: boolean }) {
  const [state, setState] = React.useState(0)
  const reduced = useReduced()
  return (
    <div className="sf-dot-announcer" data-paused={!active || reduced}>
      <section className="device">
        <svg viewBox="0 0 360 120" aria-label={LABELS[state]} role="img">
          {Array.from({ length: 33 * 9 }, (_, i) => {
            const x = i % 33,
              y = Math.floor(i / 33),
              lit =
                x < 9
                  ? PATTERNS[state][y][x] === "1"
                  : x >= 13 &&
                    x < 31 &&
                    y >= 1 &&
                    y < 8 &&
                    (x - 13) % 6 < 5 &&
                    GLYPHS[["RDY", "SHH", "END"][state][Math.floor((x - 13) / 6)]][y - 1][(x - 13) % 6] === "1"
            return (
              <circle
                key={i}
                cx={9 + x * 10.7}
                cy={16 + y * 11}
                r="3.2"
                fill={lit ? "#ffedbd" : "#681c10"}
                style={{
                  transitionProperty: "fill",
                  transitionDuration: reduced ? "0ms" : "180ms",
                  transitionDelay: reduced ? "0ms" : `${x * 7}ms`,
                }}
              />
            )
          })}
        </svg>
        <nav aria-label="Display state">
          {LABELS.map((l, i) => (
            <button key={l} disabled={!active} aria-pressed={state === i} onClick={() => setState(i)}>
              <i aria-hidden />
              {l}
            </button>
          ))}
        </nav>
      </section>
      <style>{`.sf-dot-announcer{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-dot-announcer *{box-sizing:border-box}.sf-dot-announcer button,.sf-dot-announcer input,.sf-dot-announcer select,.sf-dot-announcer textarea{font:inherit;color:inherit}.sf-dot-announcer button{cursor:pointer;touch-action:manipulation}.sf-dot-announcer button:disabled{cursor:default;opacity:.45}.sf-dot-announcer :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-dot-announcer input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-dot-announcer .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-dot-announcer[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-dot-announcer *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-dot-announcer{background:#bc2d16;padding:24px}.sf-dot-announcer .device{width:min(100%,490px);background:#e53e20;border:1px solid #f75d39;border-radius:14px;padding:18px;box-shadow:0 10px 0 #8b230f,0 19px 25px #61120044}.sf-dot-announcer svg{display:block;width:100%;background:#39110e;border:2px solid #82200f;border-radius:7px;box-shadow:inset 0 2px 9px #160702}.sf-dot-announcer nav{display:flex;justify-content:space-between;gap:5px;margin-top:16px}.sf-dot-announcer button{display:flex;align-items:center;gap:7px;border:0;background:none;color:#631308;font-size:11px;font-weight:600;padding:0 3px;min-height:44px}.sf-dot-announcer button[aria-pressed=true]{color:#fff0cd}.sf-dot-announcer button i{width:6px;height:6px;background:currentColor;border-radius:50%}@container(max-width:340px){.sf-dot-announcer .device{padding:12px}.sf-dot-announcer nav{gap:0}.sf-dot-announcer button{font-size:10px;gap:4px}}`}</style>
    </div>
  )
}
