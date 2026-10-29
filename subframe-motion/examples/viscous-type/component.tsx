"use client"

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
import { useEffect, useId, useRef, useState } from "react"

export default function ViscousType({ active = true }: { active?: boolean }) {
  const id = `sf-viscous-${useId().replace(/:/g, "")}`
  const filter = useRef<SVGFEDisplacementMapElement>(null)
  const [pressure, setPressure] = useState(50)
  const [reduced, setReduced] = useState(true)
  const frame = useRef(0)
  const strength = useRef(0)
  const target = useRef(0)
  const last = useRef<{ x: number; y: number; t: number } | null>(null)
  const animate = useRef<() => void>(() => {})
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    cancelAnimationFrame(frame.current)
    let previous = 0
    const tick = (now: number) => {
      const dt = previous ? Math.min(50, now - previous) / 16.67 : 1
      previous = now
      strength.current += (target.current - strength.current) * (1 - Math.pow(0.77, dt))
      target.current *= Math.pow(0.965, dt)
      if (filter.current) {
        filter.current.setAttribute("scale", String(strength.current))
      }
      if (strength.current > 0.1 || target.current > 0.1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        strength.current = 0
        filter.current?.setAttribute("scale", "0")
        frame.current = 0
      }
    }
    animate.current = () => {
      if (!active || reduced) {
        return
      }
      if (!frame.current) {
        frame.current = requestAnimationFrame(tick)
      }
    }
    frame.current = 0
    if (!active || reduced) {
      strength.current = 0
      target.current = 0
      filter.current?.setAttribute("scale", "0")
    }
    return () => {
      cancelAnimationFrame(frame.current)
      frame.current = 0
      last.current = null
    }
  }, [active, reduced])
  const disturb = (energy: number) => {
    if (!active || reduced) {
      return
    }
    target.current = Math.max(target.current, Math.min(48, (energy * pressure) / 50))
    animate.current()
  }
  return (
    <section
      className="sf-viscous-type"
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") {
          e.currentTarget.setPointerCapture(e.pointerId)
        }
        last.current = { x: e.clientX, y: e.clientY, t: performance.now() }
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" && !e.currentTarget.hasPointerCapture(e.pointerId)) {
          return
        }
        const now = performance.now(),
          p = last.current
        if (p) {
          const rect = e.currentTarget.getBoundingClientRect()
          const dx = ((e.clientX - p.x) * e.currentTarget.clientWidth) / rect.width
          const dy = ((e.clientY - p.y) * e.currentTarget.clientHeight) / rect.height
          disturb((Math.hypot(dx, dy) / Math.max(8, now - p.t)) * 15)
        }
        last.current = { x: e.clientX, y: e.clientY, t: now }
      }}
      onPointerLeave={() => {
        last.current = null
      }}
      onPointerCancel={() => {
        last.current = null
      }}
    >
      <svg
        viewBox="0 0 600 290"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="OOZE, a fluid typographic specimen"
      >
        <defs>
          <filter id={id} x="-12%" y="-35%" width="124%" height="170%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .043" numOctaves="2" seed="21" result="noise" />
            <feDisplacementMap
              ref={filter}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <text
          x="300"
          y="214"
          textAnchor="middle"
          textLength="540"
          lengthAdjust="spacingAndGlyphs"
          filter={`url(#${id})`}
        >
          OOZE
        </text>
      </svg>
      <div className="sf-vt-controls">
        <button type="button" onClick={() => disturb(45)}>
          Disturb <span aria-hidden="true">↝</span>
        </button>
        <label>
          Pressure
          <input
            aria-label="Distortion pressure"
            type="range"
            min="10"
            max="100"
            value={pressure}
            onChange={(e) => {
              setPressure(+e.target.value)
              if (!reduced && active) {
                target.current = +e.target.value * 0.48
                animate.current()
              }
            }}
          />
        </label>
      </div>
      <style>{`.sf-viscous-type{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;background:#f56bc4;color:#a40028;font-family:Arial,sans-serif;touch-action:pan-y;isolation:isolate}.sf-viscous-type *{box-sizing:border-box}.sf-viscous-type>svg{position:absolute;left:0;top:50%;transform:translateY(-54%);width:100%;height:78%;overflow:visible;pointer-events:none}.sf-viscous-type text{fill:#a40028;font:bold 225px Arial,sans-serif;letter-spacing:-15px}.sf-vt-controls{position:absolute;left:24px;right:24px;bottom:17px;display:flex;align-items:center;justify-content:space-between;gap:25px;border-top:1px solid #a4002855;padding-top:6px}.sf-vt-controls button{min-height:44px;background:transparent;border:0;padding:0 8px 0 0;color:inherit;font:12px Arial;display:flex;gap:20px;align-items:center;cursor:pointer}.sf-vt-controls button span{font-size:24px}.sf-vt-controls label{display:flex;align-items:center;gap:12px;font-size:10px}.sf-vt-controls input{width:82px;height:44px;accent-color:#a40028;cursor:ew-resize}.sf-vt-controls button:focus-visible,.sf-vt-controls input:focus-visible{outline:2px solid currentColor;outline-offset:2px}@media(prefers-reduced-motion:reduce){.sf-viscous-type text{filter:none}}`}</style>
    </section>
  )
}
