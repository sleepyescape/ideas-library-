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

const sample = (n: number) =>
  Math.max(0.015, Math.abs(Math.sin(n * 0.27) * Math.cos(n * 0.087)) * (Math.sin(n * 0.013) > 0.1 ? 1 : 0.07))
export default function Example({ active = true }: { active?: boolean }) {
  const canvas = React.useRef<HTMLCanvasElement>(null),
    dimensions = React.useRef({ width: 1, height: 1 }),
    history = React.useRef(Array.from({ length: 900 }, (_, i) => sample(i + 200))),
    counter = React.useRef(1100),
    [held, setHeld] = React.useState(false),
    [offset, setOffset] = React.useState(0),
    [stamp, setStamp] = React.useState(1100 / 30)
  const reduced = useReduced()
  const draw = React.useCallback(() => {
    const c = canvas.current
    if (!c) {
      return
    }
    const r = dimensions.current
    const ctx = c.getContext("2d")
    if (!ctx) {
      return
    }
    ctx.setTransform(c.width / Math.max(1, r.width), 0, 0, c.height / Math.max(1, r.height), 0, 0)
    ctx.clearRect(0, 0, r.width, r.height)
    ctx.strokeStyle = "#e5dfdc"
    ctx.lineWidth = 1
    for (let x = 0; x < r.width; x += r.width / 6) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, r.height)
      ctx.stroke()
    }
    const count = 180,
      data = history.current.slice(-count - offset, offset ? -offset : undefined)
    data.forEach((v, i) => {
      ctx.fillStyle = "#741c32"
      const h = Math.max(1, v * r.height * 0.72)
      ctx.fillRect((i / count) * r.width, r.height / 2 - h / 2, 1.2, h)
    })
  }, [offset])
  React.useEffect(() => {
    let resizeFrame = 0
    const resize = () => {
      const c = canvas.current
      if (!c) {
        return
      }
      dimensions.current = { width: c.clientWidth, height: c.clientHeight }
      const display = c.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio, 2)
      const width = Math.max(1, Math.round(display.width * dpr))
      const height = Math.max(1, Math.round(display.height * dpr))
      if (c.width !== width) {
        c.width = width
      }
      if (c.height !== height) {
        c.height = height
      }
      draw()
    }
    const scheduleResize = () => {
      cancelAnimationFrame(resizeFrame)
      // Ancestor transforms can settle after layout observers have run.
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(resize)
      })
    }
    const transforms = new MutationObserver(scheduleResize)
    for (let ancestor = canvas.current?.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", scheduleResize)
    const ro = new ResizeObserver(resize)
    if (canvas.current) {
      ro.observe(canvas.current)
    }
    resize()
    return () => {
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", scheduleResize)
      cancelAnimationFrame(resizeFrame)
    }
  }, [draw])
  React.useEffect(() => {
    if (!active || reduced || held) {
      return
    }
    const id = setInterval(() => {
      history.current.push(sample(counter.current++))
      if (history.current.length > 900) {
        history.current.shift()
      }
      draw()
      setStamp(counter.current / 30)
    }, 1000 / 30)
    return () => clearInterval(id)
  }, [active, reduced, held, draw])
  return (
    <div className="sf-rolling-signal">
      <section className="scope">
        <header>
          <span className="lamp" data-on={!held && !reduced && active} />
          <strong>{held ? "History held" : reduced ? "Static signal preview" : "Signal preview"}</strong>
          <output>{(stamp - offset / 30).toFixed(2)} s</output>
        </header>
        <div className="graph">
          <canvas ref={canvas} aria-label="Retained procedural amplitude history" />
          <div className="axis" aria-hidden>
            {["−6s", "−4s", "−2s", "NOW"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
        <footer>
          <button
            disabled={!active || reduced}
            onClick={() => {
              setHeld(!held)
              setOffset(0)
            }}
          >
            {held ? "Resume" : "Hold"}
          </button>
          <label>
            <span>History</span>
            <input
              disabled={!active || (!held && !reduced)}
              aria-label="History position"
              type="range"
              min="0"
              max="650"
              value={650 - offset}
              onChange={(e) => setOffset(650 - +e.target.value)}
            />
          </label>
        </footer>
      </section>
      <style>{`.sf-rolling-signal{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-rolling-signal *{box-sizing:border-box}.sf-rolling-signal button,.sf-rolling-signal input,.sf-rolling-signal select,.sf-rolling-signal textarea{font:inherit;color:inherit}.sf-rolling-signal button{cursor:pointer;touch-action:manipulation}.sf-rolling-signal button:disabled{cursor:default;opacity:.45}.sf-rolling-signal :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-rolling-signal input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-rolling-signal .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-rolling-signal[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-rolling-signal *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-rolling-signal{background:#f7f5f1;color:#662b37;padding:24px}.sf-rolling-signal .scope{width:min(100%,470px)}.sf-rolling-signal header{display:flex;align-items:center;gap:8px;margin-bottom:25px}.sf-rolling-signal .lamp{width:5px;height:5px;background:#bca2a2;border-radius:50%}.sf-rolling-signal .lamp[data-on=true]{background:#8d263f}.sf-rolling-signal strong{font-size:11px;font-weight:500}.sf-rolling-signal output{font:11px ui-monospace,monospace;margin-left:auto}.sf-rolling-signal .graph{height:146px;position:relative}.sf-rolling-signal canvas{width:100%;height:123px;display:block}.sf-rolling-signal .axis{display:flex;justify-content:space-between;font:9px ui-monospace,monospace;color:#a69195;margin-top:11px}.sf-rolling-signal footer{display:flex;align-items:center;gap:21px;margin-top:17px}.sf-rolling-signal button{background:#70263c;color:#fff8ef;border:0;border-radius:6px;min-height:44px;min-width:70px;font-size:12px}.sf-rolling-signal label{display:flex;align-items:center;gap:12px;flex:1;min-width:0;font-size:10px;color:#9e7e87}.sf-rolling-signal input{width:100%;accent-color:#70263c}`}</style>
    </div>
  )
}
