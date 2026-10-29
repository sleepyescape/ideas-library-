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

export const DEFAULT_CONFIG = { eventCount: 4, gapMinutes: 10, dayEnd: 1080, settleMs: 160 }
type Config = typeof DEFAULT_CONFIG
export type Session = { start: number; duration: number }
export type EditMode = "move" | "start" | "end"
const NAMES = ["Soundcheck", "Live take", "Overdubs", "Mix review", "Stems", "Playback"]
const COLORS = ["#ff7049", "#bfcaf2", "#eee9dd", "#c1ccae", "#f1b84c", "#9eafbb"]
const START = 720
const MINIMUM = 15
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min))
const snap = (v: number) => Math.round(v / 5) * 5
const time = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`
function bounds(base: Session[], index: number, gap: number, end: number) {
  return {
    start: START + base.slice(0, index).reduce((sum, item) => sum + item.duration + gap, 0),
    end: end - base.slice(index + 1).reduce((sum, item) => sum + item.duration + gap, 0),
  }
}
export function editSchedule(
  base: Session[],
  index: number,
  mode: EditMode,
  value: number,
  gap: number,
  end: number,
): Session[] {
  const next = base.map((item) => ({ ...item }))
  const item = next[index]
  const limits = bounds(base, index, gap, end)
  if (mode === "move") {
    item.start = clamp(snap(value), limits.start, limits.end - item.duration)
  } else if (mode === "start") {
    const finish = item.start + item.duration
    item.start = clamp(snap(value), limits.start, finish - MINIMUM)
    item.duration = finish - item.start
  } else {
    item.duration = clamp(snap(value), item.start + MINIMUM, limits.end) - item.start
  }
  for (let i = index - 1; i >= 0; i--) {
    const adjacent = base[i + 1].start - base[i].start - base[i].duration <= gap
    const latest = next[i + 1].start - gap - next[i].duration
    next[i].start = adjacent ? latest : Math.min(base[i].start, latest)
  }
  for (let i = index + 1; i < next.length; i++) {
    const adjacent = base[i].start - base[i - 1].start - base[i - 1].duration <= gap
    const earliest = next[i - 1].start + next[i - 1].duration + gap
    next[i].start = adjacent ? earliest : Math.max(base[i].start, earliest)
  }
  return next
}
export function ripple(base: Session[], index: number, duration: number, gap: number, end: number) {
  return editSchedule(base, index, "end", base[index].start + duration, gap, end)
}
export function fixture(count: number, gap: number, end: number) {
  const weights = [85, 55, 70, 50, 35, 30].slice(0, count)
  const spare = Math.min(15, Math.floor((end - START - gap * (count - 1) - MINIMUM * count) / 10) * 5)
  const available = end - START - gap * (count - 1) - spare * 2
  const factor = Math.min(1, (available - MINIMUM * count) / weights.reduce((sum, value) => sum + value - MINIMUM, 0))
  let cursor = START + spare
  return weights.map((value) => {
    const duration = MINIMUM + Math.floor(((value - MINIMUM) * factor) / 5) * 5
    const item = { start: cursor, duration }
    cursor += duration + gap
    return item
  })
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
  const count = Math.round(clamp(settings.eventCount, 3, 6)),
    gap = snap(clamp(settings.gapMinutes, 0, 30)),
    end = snap(clamp(settings.dayEnd, 960, 1200))
  const [sessions, setSessions] = React.useState(() => fixture(count, gap, end))
  const [original, setOriginal] = React.useState<Session[] | null>(null)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [keyboard, setKeyboard] = React.useState(true)
  const track = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<{
    index: number
    mode: EditMode
    x: number
    base: Session[]
    owner: HTMLButtonElement
    id: number
    width: number
  } | null>(null)
  const cancel = React.useCallback(() => {
    const previous = drag.current
    drag.current = null
    if (previous) {
      setSessions(previous.base)
      if (previous.owner.hasPointerCapture(previous.id)) {
        previous.owner.releasePointerCapture(previous.id)
      }
    }
    setOriginal(null)
    setSelected(null)
    setKeyboard(true)
  }, [])
  React.useEffect(() => {
    cancel()
    setSessions(fixture(count, gap, end))
  }, [count, gap, end, cancel])
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
  const current = sessions.length === count ? sessions : fixture(count, gap, end)
  const span = end - START
  const finish = (event: React.PointerEvent<HTMLButtonElement>) => {
    drag.current = null
    setOriginal(null)
    setSelected(null)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }
  function interaction(index: number, mode: EditMode) {
    const item = current[index]
    const limits = bounds(current, index, gap, end)
    const value = mode === "end" ? item.start + item.duration : item.start
    const min = mode === "end" ? item.start + MINIMUM : limits.start
    const max =
      mode === "end" ? limits.end : mode === "start" ? item.start + item.duration - MINIMUM : limits.end - item.duration
    return {
      role: "slider" as const,
      "aria-label": `${NAMES[index]} ${mode === "move" ? "position" : mode === "start" ? "start" : "end"}`,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": value,
      "aria-valuetext": `${time(item.start)} to ${time(item.start + item.duration)}, ${item.duration} minutes`,
      disabled: !active,
      onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0 || drag.current) {
          return
        }
        event.preventDefault()
        event.currentTarget.focus()
        setKeyboard(false)
        setSelected(index)
        const base = current.map((s) => ({ ...s }))
        setOriginal(base)
        drag.current = {
          index,
          mode,
          x: event.clientX,
          base,
          owner: event.currentTarget,
          id: event.pointerId,
          width: track.current!.getBoundingClientRect().width,
        }
        event.currentTarget.setPointerCapture(event.pointerId)
      },
      onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => {
        const d = drag.current
        if (!d || d.id !== event.pointerId) {
          return
        }
        const item = d.base[d.index]
        const value =
          (d.mode === "end" ? item.start + item.duration : item.start) + ((event.clientX - d.x) / d.width) * span
        setSessions(editSchedule(d.base, d.index, d.mode, value, gap, end))
      },
      onPointerUp: finish,
      onPointerCancel: cancel,
      onLostPointerCapture: () => {
        if (drag.current) {
          cancel()
        }
      },
      onBlur: () => {
        if (drag.current) {
          cancel()
        }
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
          return
        }
        event.preventDefault()
        setKeyboard(true)
        const next =
          event.key === "Home"
            ? min
            : event.key === "End"
            ? max
            : value + (["ArrowLeft", "ArrowDown"].includes(event.key) ? -5 : 5)
        setSessions(editSchedule(current, index, mode, next, gap, end))
      },
    }
  }
  return (
    <div
      ref={fitted.viewport}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "16 / 10",
        position: "relative",
        overflow: "hidden",
        background: "#1d2226",
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
          className="schedule-ripple"
          data-sessions={JSON.stringify(current)}
          data-keyboard={keyboard}
          data-active={active}
          onKeyDownCapture={() => setKeyboard(true)}
          style={
            { "--response": `${active && !keyboard ? clamp(settings.settleMs, 0, 240) : 0}ms` } as React.CSSProperties
          }
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              cancel()
            }
          }}
        >
          <style>{`
.schedule-ripple{height:100%;width:100%;background:#1d2226;color:#eff0e9;font-family:Arial,Helvetica,sans-serif;display:grid;place-items:center;box-sizing:border-box;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}.schedule-ripple *{box-sizing:border-box}.sr-sheet{width:536px}.sr-hours{display:flex;justify-content:space-between;margin-left:100px;height:28px;font:10px monospace;color:#9ba3a7}.sr-row{height:62px;display:grid;grid-template-columns:100px minmax(0,1fr);align-items:center}.sr-label{font-size:10px;color:#c3c8c9;line-height:1.4;position:relative;padding-left:27px}.sr-label b{position:absolute;left:0;top:0;font:17px/1 Arial,sans-serif;letter-spacing:-.8px;color:#eee}.sr-label small{display:block;font:9px/1.4 monospace;color:#788489;margin-top:3px}.sr-track{height:50px;position:relative;background:repeating-linear-gradient(90deg,#ffffff0b 0 1px,transparent 1px 25%)}.sr-block{position:absolute;inset:0;pointer-events:none;transition:transform var(--response) cubic-bezier(.22,.68,0,1)}.sr-face{position:absolute;inset:0;transform-origin:left;border-radius:3px;background:var(--color);box-shadow:inset 0 1px #ffffff50,0 3px 4px #00000016}.sr-block[data-selected=true]{z-index:3;transition:none}.sr-block[data-selected=true] .sr-face{box-shadow:inset 0 0 0 1px #ffffffa0,0 3px 10px #0003}.sr-ghost{position:absolute;inset:0;border:1px dashed #cbd5df55;pointer-events:none}.schedule-ripple button{appearance:none;border:0;margin:0;padding:0;position:absolute;top:0;height:100%;color:#162027;background:none;pointer-events:auto;touch-action:none}.sr-move{left:0;cursor:grab;overflow:hidden;display:grid;place-items:center;font:20px Arial,sans-serif;letter-spacing:-1px;white-space:nowrap}.sr-move:active{cursor:grabbing}.sr-move span{position:relative}.sr-move:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 5px,#17212c0b 5px 6px);opacity:.5}.sr-resize{width:20px;cursor:ew-resize;z-index:2;transform:translateX(-50%)}.sr-resize:before{content:"";position:absolute;top:15px;bottom:15px;left:9px;width:2px;border-radius:1px;background:#17212c80}.schedule-ripple[data-keyboard=false] button:focus{outline:none}.schedule-ripple[data-keyboard=true] button:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:3px;z-index:4}.schedule-ripple button:disabled{cursor:default}.sr-footer{display:flex;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid #ffffff16;color:#9ba3a7;font:10px monospace}.sr-footer output{color:#dde2df}.sr-sheet[data-count="5"] .sr-row,.sr-sheet[data-count="6"] .sr-row{height:46px}.sr-sheet[data-count="5"] .sr-track,.sr-sheet[data-count="6"] .sr-track{height:36px}.sr-sheet[data-count="5"] .sr-resize:before,.sr-sheet[data-count="6"] .sr-resize:before{top:10px;bottom:10px}.sr-sheet[data-count="6"] .sr-move{font-size:15px}.schedule-ripple[data-keyboard=true] *,.schedule-ripple[data-active=false] *{transition:none!important}@media(prefers-reduced-motion:reduce){.schedule-ripple *{transition:none!important}}@media(hover:hover){.sr-resize:hover:before{background:#fff}}
          `}</style>
          <section className="sr-sheet" data-count={count} aria-label="Recording studio schedule">
            <div className="sr-hours">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>{time(snap(START + (span * i) / 4))}</span>
              ))}
            </div>
            <div className="sr-rows">
              {current.map((session, i) => {
                const old = original?.[i]
                return (
                  <div className="sr-row" key={NAMES[i]}>
                    <div className="sr-label">
                      <b>{String(i + 1).padStart(2, "0")}</b>
                      {NAMES[i]}
                      <small>{time(session.start)}</small>
                    </div>
                    <div className="sr-track" ref={i === 0 ? track : undefined}>
                      {old && (
                        <div
                          className="sr-ghost"
                          style={{
                            width: `${(old.duration / span) * 100}%`,
                            transform: `translateX(${((old.start - START) / old.duration) * 100}%)`,
                          }}
                        />
                      )}
                      <div
                        className="sr-block"
                        data-selected={selected === i}
                        data-shifted={!!old && old.start !== session.start}
                        style={
                          {
                            "--color": COLORS[i],
                            transform: `translateX(${((session.start - START) / span) * 100}%)`,
                          } as React.CSSProperties
                        }
                      >
                        <div className="sr-face" style={{ transform: `scaleX(${session.duration / span})` }} />
                        <button
                          type="button"
                          className="sr-move"
                          {...interaction(i, "move")}
                          style={{ width: `${(session.duration / span) * 100}%` }}
                        >
                          <span>{session.duration >= 35 ? `${session.duration}′` : ""}</span>
                        </button>
                        <button
                          type="button"
                          className="sr-resize sr-start"
                          {...interaction(i, "start")}
                          style={{ left: 0 }}
                        />
                        <button
                          type="button"
                          className="sr-resize sr-end"
                          {...interaction(i, "end")}
                          style={{ left: `${(session.duration / span) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="sr-footer">
              <span>{gap} min changeover</span>
              <output aria-live="polite">
                {selected !== null
                  ? `${time(current[selected].start)} — ${time(current[selected].start + current[selected].duration)}`
                  : `Wrap ${time(current.at(-1)!.start + current.at(-1)!.duration)}`}
              </output>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
