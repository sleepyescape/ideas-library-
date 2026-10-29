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

export const DEFAULT_CONFIG = { targetRatio: 4.5, foregroundPolarity: "dark", lightnessFloor: 0, lightnessCeiling: 100 }
type Config = typeof DEFAULT_CONFIG
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : min))
export function luminance(hex: string) {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}
export function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
function ink(lightness: number) {
  const l = lightness / 100,
    saturation = 0.18,
    hue = 225,
    chroma = (1 - Math.abs(2 * l - 1)) * saturation,
    secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1)),
    m = l - chroma / 2
  return `#${[0, secondary, chroma]
    .map((v) =>
      Math.round((v + m) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`
}
export function solveInk(background: string, target: number, polarity: string, floor: number, ceiling: number) {
  let best = ink(polarity === "light" ? ceiling : floor)
  let solution: string | null = null
  const back = luminance(background)
  for (let i = 0; i <= 1000; i++) {
    const color = ink(floor + ((ceiling - floor) * i) / 1000),
      light = luminance(color),
      ratio = contrast(color, background)
    const properSide = polarity === "light" ? light > back : light < back
    if (properSide && ratio > contrast(best, background)) {
      best = color
    }
    if (properSide && ratio >= target && (solution === null || ratio < contrast(solution, background))) {
      solution = color
    }
  }
  return { color: solution ?? best, available: solution !== null }
}
const SWATCHES = [
  { name: "Persimmon", hex: "#f26832" },
  { name: "Citron", hex: "#dce55b" },
  { name: "Porcelain", hex: "#e9e6df" },
  { name: "Sky", hex: "#81b9de" },
  { name: "Petal", hex: "#e9a7c1" },
]

function useFittedStage() {
  const viewport = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)
  React.useLayoutEffect(() => {
    const element = viewport.current!
    const fit = () => setScale(Math.min(element.clientWidth / 600, element.clientHeight / 375))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { viewport, scale }
}

export default function Example({ active = true, config }: { active?: boolean; config?: Partial<Config> }) {
  const fitted = useFittedStage()
  const settings = { ...DEFAULT_CONFIG, ...config },
    target = clamp(settings.targetRatio, 3, 7),
    floor = clamp(settings.lightnessFloor, 0, 40),
    ceiling = clamp(settings.lightnessCeiling, 60, 100)
  const [background, setBackground] = React.useState(SWATCHES[0].hex),
    [locked, setLocked] = React.useState(true),
    [frozen, setFrozen] = React.useState("#342a29")
  const solved = React.useMemo(
    () => solveInk(background, target, settings.foregroundPolarity, floor, ceiling),
    [background, target, settings.foregroundPolarity, floor, ceiling],
  )
  const foreground = locked ? solved.color : frozen,
    ratio = contrast(background, foreground),
    passes = ratio >= target
  const group = React.useId()
  return (
    <div
      ref={fitted.viewport}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "16 / 10",
        position: "relative",
        overflow: "hidden",
        background: "#f26832",
      }}
    >
      <div
        style={{
          width: 600,
          height: 375,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${fitted.scale})`,
          transformOrigin: "center",
        }}
      >
        <div
          className="contrast-lock"
          data-background={background}
          data-foreground={foreground}
          data-ratio={ratio}
          data-available={solved.available}
          style={{ "--paper": background, "--ink": foreground } as React.CSSProperties}
        >
          <style>{`
    .contrast-lock{height:100%;width:100%;display:flex;flex-direction:column;font-family:Arial,sans-serif;box-sizing:border-box;background:#f3f2ed}.contrast-lock *{box-sizing:border-box}.cl-proof{background:var(--paper);color:var(--ink);flex:1;min-height:0;display:flex;flex-direction:column;padding:25px 33px 24px;position:relative}.cl-top{display:flex;align-items:center;justify-content:space-between;font-size:9px;letter-spacing:1.2px;font-weight:600}.cl-ratio{font-variant-numeric:tabular-nums;letter-spacing:.4px;font-size:10px;border:1px solid currentColor;border-radius:20px;padding:6px 9px}.cl-type{display:flex;flex:1;align-items:center;justify-content:space-between;gap:22px;min-height:0}.cl-aa{font-family:Arial,sans-serif;font-size:192px;font-weight:700;letter-spacing:-18px;line-height:1;padding-right:15px;margin-left:-10px}.cl-read{width:173px;padding-top:8px;font-size:16px;line-height:1.35;letter-spacing:-.3px;font-weight:400}.cl-read small{display:block;font-size:10px;font-weight:400;letter-spacing:0;line-height:1.5;margin-top:20px;max-width:135px}.cl-bottom{display:flex;justify-content:space-between;font:9px monospace;letter-spacing:.6px}.cl-controls{height:88px;flex-shrink:0;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:18px;border-top:1px solid #fff8}.cl-color{display:flex;align-items:center;gap:8px}.cl-native{width:29px;height:35px;opacity:0;position:absolute;inset:0;cursor:pointer}.cl-custom{position:relative;display:block;width:29px;height:29px;border:1px solid #0002;background:var(--paper);border-radius:50%;box-shadow:inset 0 0 0 3px #f3f2ed}.cl-custom:focus-within{outline:2px solid #303933;outline-offset:3px}.cl-color-label{font-size:9px;color:#797e75;line-height:1.8}.cl-color-label strong{font:10px monospace;color:#31382f;text-transform:uppercase;display:block}.cl-swatches{display:flex;gap:5px;border-left:1px solid #dbddd4;padding-left:17px}.cl-swatch{position:relative;width:24px;height:32px;display:grid;place-items:center;cursor:pointer}.cl-swatch input{position:absolute;opacity:0;width:100%;height:100%;inset:0;margin:0;cursor:pointer}.cl-swatch i{width:21px;height:21px;background:var(--swatch);border:1px solid #0001;border-radius:50%}.cl-swatch input:checked+i{box-shadow:0 0 0 3px #f3f2ed,0 0 0 4px #3b4437}.cl-swatch input:focus-visible+i{outline:2px solid #303933;outline-offset:5px}.cl-lock{border:1px solid #d5d9cf;background:#fafaf7;border-radius:7px;min-width:115px;height:38px;padding:0 12px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:10px;color:#354031;cursor:pointer;box-shadow:0 1px 1px #00000005}.cl-lock[aria-pressed=true]{background:#354031;border-color:#354031;color:#f4f5ec}.cl-lock:focus-visible{outline:2px solid #526b43;outline-offset:3px}.cl-lock:active{transform:translateY(1px)}.cl-lock:disabled,.cl-native:disabled,.cl-swatch input:disabled{cursor:default;opacity:.5}.cl-unavailable{position:absolute;bottom:23px;right:30px;background:#f8f5e9;color:#633928;padding:4px 7px;border-radius:3px;font-size:9px;letter-spacing:0;box-shadow:0 1px 3px #0001}.cl-swatch input:disabled{opacity:0}

    `}</style>
          <section className="cl-proof" aria-label="Color pair reading specimen">
            <div className="cl-top">
              <span>Arial</span>
              <span className="cl-ratio" role="status">
                {(Math.floor(ratio * 100) / 100).toFixed(2)} : 1
              </span>
            </div>
            <div className="cl-type">
              <span className="cl-aa" aria-hidden="true">
                Aa
              </span>
              <div className="cl-read">The quick brown fox jumps over the lazy dog.</div>
            </div>
            <div className="cl-bottom">
              <span>INK {foreground.toUpperCase()}</span>
              <span>{passes ? `≥ ${target.toFixed(1)}:1` : "Below target"}</span>
            </div>
            {locked && !solved.available && <span className="cl-unavailable">Target unavailable in this range</span>}
          </section>
          <div className="cl-controls">
            <div className="cl-color">
              <label className="cl-custom">
                <input
                  className="cl-native"
                  type="color"
                  aria-label="Surface color"
                  value={background}
                  disabled={!active}
                  onChange={(e) => setBackground(e.target.value)}
                />
              </label>
              <span className="cl-color-label">
                Surface<strong>{background}</strong>
              </span>
            </div>
            <div className="cl-swatches" role="radiogroup" aria-label="Surface palette">
              {SWATCHES.map((swatch) => (
                <label className="cl-swatch" key={swatch.hex} style={{ "--swatch": swatch.hex } as React.CSSProperties}>
                  <input
                    type="radio"
                    name={group}
                    aria-label={swatch.name}
                    checked={background === swatch.hex}
                    disabled={!active}
                    onChange={() => setBackground(swatch.hex)}
                  />
                  <i />
                </label>
              ))}
            </div>
            <button
              className="cl-lock"
              aria-pressed={locked}
              disabled={!active}
              onClick={() => {
                if (locked) {
                  setFrozen(foreground)
                }
                setLocked(!locked)
              }}
            >
              <svg width="12" height="14" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                <rect x="3" y="7.5" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d={locked ? "M5 7.5V5a3 3 0 0 1 6 0v2.5" : "M5 7.5V5a3 3 0 0 1 6 0"}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              {locked ? "Contrast locked" : "Ink stays fixed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
