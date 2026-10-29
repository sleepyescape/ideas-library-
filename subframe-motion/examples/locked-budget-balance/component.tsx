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

export const DEFAULT_CONFIG = { totalUnits: 100, segmentCount: 4, minimumUnits: 5, settleMs: 160 }
type Config = typeof DEFAULT_CONFIG
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : min))
const LINES = ["Production", "Talent", "Post", "Reserve", "Travel", "Licensing"]
const COLORS = [
  { ink: "#4056d8", beam: "#5268ec", text: "#fff" },
  { ink: "#607b98", beam: "#a2b6ca", text: "#233342" },
  { ink: "#808991", beam: "#dce2e7", text: "#333d46" },
  { ink: "#35414c", beam: "#35414c", text: "#fff" },
  { ink: "#a26242", beam: "#d69a72", text: "#3b271c" },
  { ink: "#6c7760", beam: "#bbc4a9", text: "#30372a" },
]
const money = (value: number) => `$${(value * 1000).toLocaleString("en-US")}`
export function distribute(values: number[], locks: boolean[], index: number, next: number, floor: number) {
  const total = values.reduce((a, b) => a + b, 0)
  const others = values.map((_, i) => i).filter((i) => i !== index && !locks[i])
  if (locks[index] || !others.length) {
    return values
  }
  const locked = values.reduce((sum, value, i) => sum + (locks[i] ? value : 0), 0)
  const target = Math.round(clamp(next, floor, total - locked - floor * others.length))
  const available = total - locked - target - floor * others.length
  const weight = others.reduce((sum, i) => sum + Math.max(0, values[i] - floor), 0)
  const raw = others.map((i) => ({
    i,
    n: available * (weight ? Math.max(0, values[i] - floor) / weight : 1 / others.length),
  }))
  const result = [...values]
  result[index] = target
  raw.forEach(({ i, n }) => {
    result[i] = floor + Math.floor(n)
  })
  let remainder = total - result.reduce((a, b) => a + b, 0)
  raw
    .sort((a, b) => (b.n % 1) - (a.n % 1) || a.i - b.i)
    .forEach(({ i }) => {
      if (remainder-- > 0) {
        result[i]++
      }
    })
  return result
}
function seed(total: number, count: number, floor: number) {
  const weights = [42, 26, 20, 12, 10, 8].slice(0, count)
  const free = total - count * floor,
    sum = weights.reduce((a, b) => a + b, 0)
  const result = weights.map((w) => floor + Math.floor((free * w) / sum))
  for (let i = 0; result.reduce((a, b) => a + b, 0) < total; i++) {
    result[i % count]++
  }
  return result
}
function Lock({ locked }: { locked: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4.5" y="8.5" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d={locked ? "M7 8.5V5.5a3 3 0 0 1 6 0v3" : "M7 8.5V5.5a3 3 0 0 1 6 0"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M10 12v1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

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
  const settings = { ...DEFAULT_CONFIG, ...config }
  const total = Math.round(clamp(settings.totalUnits, 20, 200)),
    count = Math.round(clamp(settings.segmentCount, 3, 6))
  const floor = Math.min(Math.round(clamp(settings.minimumUnits, 0, 10)), Math.floor(total / count))
  const [values, setValues] = React.useState(() => seed(total, count, floor))
  const [locks, setLocks] = React.useState<boolean[]>(() => Array.from({ length: count }, (_, i) => i === count - 1))
  const [keyboard, setKeyboard] = React.useState(true)
  const [editing, setEditing] = React.useState<number | null>(null)
  const before = React.useRef<number[] | null>(null)
  const cancelled = React.useRef(false)
  const cancel = React.useCallback(() => {
    if (before.current) {
      setValues(before.current)
      cancelled.current = true
    }
    before.current = null
    setEditing(null)
  }, [])
  React.useEffect(() => {
    before.current = null
    setValues(seed(total, count, floor))
    setLocks(Array.from({ length: count }, (_, i) => i === count - 1))
    setEditing(null)
  }, [total, count, floor])
  React.useEffect(() => {
    if (!active) {
      cancel()
    }
  }, [active, cancel])
  React.useEffect(() => {
    const hidden = () => {
      if (document.hidden) {
        cancel()
      }
    }
    window.addEventListener("blur", cancel)
    document.addEventListener("visibilitychange", hidden)
    return () => {
      window.removeEventListener("blur", cancel)
      document.removeEventListener("visibilitychange", hidden)
    }
  }, [cancel])
  const displayed = values.length === count ? values : seed(total, count, floor)
  const unlockedCount = locks.filter((locked) => !locked).length
  return (
    <div
      ref={fitted.viewport}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "16 / 10",
        position: "relative",
        overflow: "hidden",
        background: "#eff0f1",
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
          className="budget-balance"
          data-total={total}
          data-keyboard={keyboard}
          data-active={active}
          data-dense={count > 4}
          data-values={displayed.join(",")}
          onKeyDownCapture={() => setKeyboard(true)}
          onPointerDownCapture={() => setKeyboard(false)}
          style={
            { "--settle": `${active && !keyboard ? clamp(settings.settleMs, 0, 240) : 0}ms` } as React.CSSProperties
          }
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault()
              cancel()
            }
          }}
        >
          <style>{`
.budget-balance{width:100%;height:100%;display:grid;place-items:center;color:#252c34;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.budget-balance *{box-sizing:border-box}.budget-balance button,.budget-balance input{font:inherit}
.budget-balance .bb-sheet{width:532px}
.budget-balance .bb-head{padding:0 0 18px}
.budget-balance .bb-total{display:flex;align-items:baseline;justify-content:space-between;font-size:23px;line-height:30px;letter-spacing:-.7px;font-weight:500}
.budget-balance .bb-total small{font:10px Arial,sans-serif;letter-spacing:.4px;color:#757e87}
.budget-balance .bb-beam{height:132px;position:relative;margin-top:14px;isolation:isolate}
.budget-balance .bb-piece{position:absolute;inset:0;width:calc(100% - var(--gaps));height:100%;transform-origin:left;border-radius:5px;background-image:linear-gradient(175deg,#ffffff18,transparent 55%,#00000008);box-shadow:inset 0 1px 0 #ffffff35,inset 0 -1px 0 #00000010,0 4px 7px -5px #18283b50;transition:transform var(--settle) cubic-bezier(.22,.68,0,1)}
.budget-balance .bb-piece-label{position:absolute;inset:0;width:calc(100% - var(--gaps));pointer-events:none;transition:transform var(--settle) cubic-bezier(.22,.68,0,1)}
.budget-balance .bb-piece-label span{position:absolute;left:0;top:50%;transform:translate(-50%,-50%);font-size:35px;line-height:1;letter-spacing:-1.7px;font-weight:400}
.budget-balance .bb-piece-label small{font-size:14px;letter-spacing:-.4px;margin-left:1px}
.budget-balance .bb-lines{display:grid;grid-template-columns:1fr 1fr;gap:4px 28px;padding:0}
.budget-balance .bb-line{display:grid;grid-template-columns:minmax(0,1fr) auto 26px;grid-template-rows:25px 27px;align-items:center;column-gap:8px;position:relative;min-width:0}
.budget-balance .bb-name{grid-column:1;grid-row:1;font-size:11px;display:flex;gap:6px;align-items:center;white-space:nowrap}
.budget-balance .bb-dot{width:5px;height:5px;border-radius:50%;flex:none;background:var(--line)}
.budget-balance .bb-rail{grid-column:1/-1;grid-row:2;height:44px;min-width:0;position:relative;display:flex;align-items:center}
.budget-balance .bb-track{position:absolute;left:8px;right:8px;height:3px;border-radius:3px;background:#d7dce1;pointer-events:none}
.budget-balance .bb-fill{position:absolute;inset:0;border-radius:3px;transform-origin:left;background:var(--line);transition:transform var(--settle) cubic-bezier(.22,.68,0,1)}
.budget-balance .bb-carriage{position:absolute;inset:0;transition:transform var(--settle) cubic-bezier(.22,.68,0,1)}
.budget-balance .bb-thumb{position:absolute;width:12px;height:12px;left:-6px;top:-4.5px;border-radius:50%;background:#fbfcfd;border:1px solid #0000000c;box-shadow:0 1px 2px #0000001a,0 2px 4px #0000000d;transition:transform 120ms ease-out}
.budget-balance .bb-range{appearance:none;position:absolute;inset:0;margin:0;width:100%;height:44px;opacity:0;cursor:ew-resize;touch-action:none}
.budget-balance .bb-range::-webkit-slider-runnable-track{height:3px}.budget-balance .bb-range::-webkit-slider-thumb{appearance:none;width:16px;height:23px;margin-top:-10px}
.budget-balance .bb-range::-moz-range-track{height:3px}.budget-balance .bb-range::-moz-range-thumb{width:16px;height:23px;border:0}
.budget-balance .bb-range:disabled{cursor:default}
.budget-balance .bb-rail:has(.bb-range:focus-visible){outline:2px solid #4056d8;outline-offset:-3px;border-radius:5px}
.budget-balance .bb-line[data-editing=true] .bb-fill,.budget-balance .bb-line[data-editing=true] .bb-carriage{transition:none}
.budget-balance .bb-line[data-editing=true] .bb-thumb{transform:scale(1.15);background:var(--line);border-color:#ffffff80}
.budget-balance .bb-value{grid-column:2;grid-row:1;position:relative;font-size:12px;letter-spacing:-.2px;text-align:right}
.budget-balance .bb-lock{grid-column:3;grid-row:1;display:grid;place-items:center;position:relative;width:26px;height:30px;border:0;background:transparent;padding:0;cursor:pointer;color:#a0a7ae;touch-action:manipulation;border-radius:5px;z-index:1}
.budget-balance .bb-lock:after{content:"";position:absolute;inset:-7px -8px}
.budget-balance .bb-lock svg{width:12px;height:12px;transition:transform 120ms ease-out}
.budget-balance .bb-lock[aria-pressed=true]{color:#35414c}
.budget-balance .bb-lock:active svg{transform:translateY(1px)}
.budget-balance .bb-lock:focus-visible{outline:2px solid #4056d8;outline-offset:0}
.budget-balance .bb-lock:disabled{cursor:default}
.budget-balance .bb-line[data-locked=true] .bb-track{background:repeating-linear-gradient(120deg,#c7ced5 0 2px,#e1e5e9 2px 5px)}
.budget-balance .bb-line[data-locked=true] .bb-thumb{background:#dce1e5;box-shadow:none}
.budget-balance[data-dense=true] .bb-beam{height:104px}
.budget-balance[data-keyboard=true] *,.budget-balance[data-active=false] *{transition:none!important}
@media(hover:hover) and (pointer:fine){.budget-balance .bb-lock:hover:not(:disabled){color:#4056d8}}
@media(prefers-reduced-motion:reduce){.budget-balance *{transition:none!important}}
          `}</style>
          <section className="bb-sheet" aria-label="Production budget">
            <header className="bb-head">
              <div className="bb-total">
                {money(total)}
                <small>USD</small>
              </div>
              <div
                className="bb-beam"
                aria-hidden="true"
                style={{ "--gaps": `${(count - 1) * 4}px` } as React.CSSProperties}
              >
                {displayed.map((value, i) => (
                  <div
                    key={LINES[i]}
                    className="bb-piece"
                    data-locked={Boolean(locks[i])}
                    style={{
                      transform: `translateX(calc(${
                        (displayed.slice(0, i).reduce((sum, amount) => sum + amount, 0) / total) * 100
                      }% + ${i * 4}px)) scaleX(${value / total})`,
                      backgroundColor: COLORS[i].beam,
                    }}
                  />
                ))}
                {displayed.map((value, i) => (
                  <div
                    key={`label-${LINES[i]}`}
                    className="bb-piece-label"
                    style={{
                      color: COLORS[i].text,
                      transform: `translateX(calc(${
                        ((displayed.slice(0, i).reduce((sum, amount) => sum + amount, 0) + value / 2) / total) * 100
                      }% + ${i * 4}px))`,
                      opacity: value / total >= 0.11 ? 1 : 0,
                    }}
                  >
                    <span>
                      {Math.round((value / total) * 100)}
                      <small>%</small>
                    </span>
                  </div>
                ))}
              </div>
            </header>
            <div className="bb-lines">
              {displayed.map((value, i) => {
                const max =
                  total -
                  displayed.reduce((sum, v, j) => sum + (j !== i && locks[j] ? v : 0), 0) -
                  floor * locks.filter((locked, j) => j !== i && !locked).length
                const disabled = !active || locks[i] || unlockedCount <= 1 || max <= floor
                const fraction = value / total
                return (
                  <div
                    className="bb-line"
                    key={LINES[i]}
                    data-locked={Boolean(locks[i])}
                    data-editing={editing === i}
                    style={{ "--line": COLORS[i].ink } as React.CSSProperties}
                  >
                    <span className="bb-name">
                      <i className="bb-dot" />
                      {LINES[i]}
                    </span>
                    <div className="bb-rail">
                      <div className="bb-track" aria-hidden="true">
                        <div className="bb-fill" style={{ transform: `scaleX(${fraction})` }} />
                        <div className="bb-carriage" style={{ transform: `translateX(${fraction * 100}%)` }}>
                          <span className="bb-thumb" />
                        </div>
                      </div>
                      <input
                        className="bb-range"
                        type="range"
                        min={0}
                        max={total}
                        aria-valuemin={floor}
                        aria-valuemax={max}
                        step="1"
                        value={value}
                        disabled={disabled}
                        aria-label={`${LINES[i]} allocation`}
                        aria-valuetext={`${value} thousand dollars${locks[i] ? ", locked" : ""}`}
                        onPointerDown={(event) => {
                          if (event.button !== 0) {
                            return
                          }
                          event.currentTarget.setPointerCapture(event.pointerId)
                          cancelled.current = false
                          before.current = [...displayed]
                          setEditing(i)
                        }}
                        onPointerUp={() => {
                          cancelled.current = false
                          before.current = null
                          setEditing(null)
                        }}
                        onPointerCancel={cancel}
                        onLostPointerCapture={() => {
                          if (before.current) {
                            cancel()
                          }
                        }}
                        onBlur={cancel}
                        onKeyDown={(event) => {
                          if (event.key !== "Escape") {
                            cancelled.current = false
                          }
                          setEditing(i)
                        }}
                        onKeyUp={() => setEditing(null)}
                        onChange={(event) => {
                          if (!active || cancelled.current) {
                            return
                          }
                          const next = Number(event.target.value)
                          setValues((current) => distribute(before.current ?? current, locks, i, next, floor))
                        }}
                      />
                    </div>
                    <output className="bb-value">
                      <span className="bb-price">{money(value)}</span>
                    </output>
                    <button
                      type="button"
                      className="bb-lock"
                      aria-label={`${locks[i] ? "Unlock" : "Lock"} ${LINES[i]}`}
                      aria-pressed={Boolean(locks[i])}
                      disabled={!active}
                      title={locks[i] ? `Unlock ${LINES[i]}` : `Keep ${LINES[i]} fixed`}
                      onClick={() => {
                        setLocks((current) => current.map((locked, j) => (j === i ? !locked : locked)))
                      }}
                    >
                      <Lock locked={Boolean(locks[i])} />
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
