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

export default function ElasticFader({ active = true }: { active?: boolean }) {
  const [value, setValue] = useState(64)
  const [stretch, setStretch] = useState(0)
  const [stretchOrigin, setStretchOrigin] = useState<"top" | "bottom">("bottom")
  const [dragging, setDragging] = useState(false)
  const [reduced, setReduced] = useState(true)
  const bounds = useRef<{ top: number; height: number } | null>(null)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    if (!active) {
      bounds.current = null
      setDragging(false)
      setStretch(0)
    }
  }, [active])
  function update(y: number) {
    if (!bounds.current) {
      return
    }
    const raw = (1 - (y - bounds.current.top) / bounds.current.height) * 100
    setValue(Math.round(Math.min(100, Math.max(0, raw))))
    // Keep the fixed end anchored while the scale springs back after release.
    if (raw > 100) {
      setStretchOrigin("bottom")
    } else if (raw < 0) {
      setStretchOrigin("top")
    }
    setStretch(raw > 100 ? Math.log1p(raw - 100) * 0.045 : raw < 0 ? -Math.log1p(-raw) * 0.045 : 0)
  }
  function release() {
    bounds.current = null
    setDragging(false)
    setStretch(0)
  }
  return (
    <section className="sf-elastic-fader" data-still={!active || reduced}>
      <div className="sf-ef-label">
        <span>OUTPUT</span>
      </div>
      <div className="sf-ef-display">
        <strong>{String(value).padStart(2, "0")}</strong>
        <span>%</span>
      </div>
      <div className="sf-ef-control">
        <div className="sf-ef-scale" aria-hidden="true">
          {[100, 75, 50, 25, 0].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
        <div
          className="sf-ef-hit"
          role="slider"
          tabIndex={0}
          aria-label="Output level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-orientation="vertical"
          onPointerDown={(e) => {
            const b = e.currentTarget.getBoundingClientRect()
            bounds.current = { top: b.top, height: b.height }
            e.currentTarget.setPointerCapture(e.pointerId)
            setDragging(true)
            update(e.clientY)
          }}
          onPointerMove={(e) => update(e.clientY)}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onKeyDown={(e) => {
            const delta =
              e.key === "ArrowUp" || e.key === "ArrowRight"
                ? 1
                : e.key === "ArrowDown" || e.key === "ArrowLeft"
                ? -1
                : e.key === "PageUp"
                ? 10
                : e.key === "PageDown"
                ? -10
                : 0
            if (delta || e.key === "Home" || e.key === "End") {
              e.preventDefault()
              release()
              setValue((v) => (e.key === "Home" ? 0 : e.key === "End" ? 100 : Math.max(0, Math.min(100, v + delta))))
            }
          }}
        >
          <div
            className="sf-ef-shell"
            style={{
              transform: `scaleY(${1 + (active && !reduced ? Math.min(0.26, Math.abs(stretch)) : 0)})`,
              transformOrigin: stretchOrigin,
              transition: dragging ? "none" : undefined,
            }}
          >
            <div className="sf-ef-fill" style={{ transform: `scaleY(${value / 100})` }} />
            <div className="sf-ef-lines" />
            <div className="sf-ef-carriage" style={{ transform: `translateY(${100 - value}%)` }}>
              <span className="sf-ef-cap">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        </div>
        <div className="sf-ef-ruler" aria-hidden="true" />
      </div>
      <style>{`.sf-elastic-fader{width:100%;height:100%;min-height:280px;background:#f35b22;color:#191916;font-family:Arial,sans-serif;position:relative;overflow:hidden;isolation:isolate;box-sizing:border-box;padding:24px 28px;container-type:inline-size}.sf-elastic-fader *{box-sizing:border-box}.sf-ef-label{display:flex;justify-content:space-between;font:10px monospace;letter-spacing:.12em;border-top:1px solid #2229;padding-top:9px}.sf-ef-display{position:absolute;left:8%;top:33%;display:flex;align-items:baseline;gap:4px}.sf-ef-display strong{font-size:clamp(64px,17cqw,105px);font-weight:500;letter-spacing:-.09em;line-height:1;font-variant-numeric:tabular-nums}.sf-ef-display>span{font:12px monospace;margin-left:7px}.sf-ef-control{position:absolute;right:13%;top:23%;height:59%;display:flex;gap:13px;align-items:stretch}.sf-ef-hit{position:relative;width:78px;cursor:ns-resize;touch-action:none;outline:none}.sf-ef-hit:focus-visible{outline:2px solid #191916;outline-offset:7px}.sf-ef-shell{position:absolute;inset:0;overflow:hidden;background:#161816;border:1px solid #252622;border-radius:9px;box-shadow:inset 0 3px 5px #0009,0 1px 0 #ffa975;transition:transform 380ms cubic-bezier(.18,1.5,.35,1)}.sf-ef-fill{position:absolute;inset:0;background:linear-gradient(90deg,#a0a7a8,#d5d9d7 35%,#bac2c3);transform-origin:bottom}.sf-ef-lines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 12px,#0002 12px 13px)}.sf-ef-carriage{position:absolute;inset:0 0 32px;pointer-events:none}.sf-ef-cap{position:absolute;top:0;left:5px;right:5px;height:32px;display:flex;flex-direction:column;justify-content:center;gap:3px;background:linear-gradient(#e9edeb,#aeb6b7);border-radius:4px;box-shadow:0 5px 7px #0007,inset 0 1px 0 #fff9;border:1px solid #8d989a}.sf-ef-cap i{margin:0 14px;height:1px;background:#7e898a;box-shadow:0 1px 0 #fff7}.sf-ef-scale{display:flex;flex-direction:column;justify-content:space-between;font:9px monospace;color:#391d11;text-align:right}.sf-ef-ruler{width:13px;background:repeating-linear-gradient(0deg,#492817 0 1px,transparent 1px 10%);opacity:.7}.sf-ef-foot{position:absolute;bottom:22px;left:28px;right:28px;display:flex;justify-content:space-between;font:10px monospace}.sf-elastic-fader[data-still=true] .sf-ef-shell{transition:none}@media(prefers-reduced-motion:reduce){.sf-ef-shell{transition:none}}@container(max-width:360px){.sf-ef-control{right:11%;gap:7px}.sf-ef-hit{width:66px}.sf-ef-display{left:6%}.sf-ef-display strong{font-size:65px}.sf-ef-display>span{font-size:10px;margin-left:2px}}`}</style>
    </section>
  )
}
