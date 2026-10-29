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

function useCalm(active: boolean) {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])
  return reduced || !active
}

type Knot = { x: number; y: number; px: number; py: number }
export default function PinnedPass({ active = true }: { active?: boolean }) {
  const calm = useCalm(active),
    root = useRef<HTMLDivElement>(null),
    badge = useRef<HTMLButtonElement>(null),
    cord = useRef<SVGPathElement>(null),
    knots = useRef<Knot[]>([]),
    dimensions = useRef({ width: 0, height: 0 }),
    drag = useRef<{ id: number; dx: number; dy: number; x: number; y: number } | null>(null),
    start = useRef<() => void>(() => {}),
    paint = useRef<() => void>(() => {}),
    [back, setBack] = useState(false)
  useEffect(() => {
    const el = root.current,
      card = badge.current,
      path = cord.current
    if (!el || !card || !path) {
      return
    }
    let raf = 0,
      count = 0,
      previous = 0,
      accumulator = 0,
      w = el.clientWidth,
      h = el.clientHeight,
      length = 0
    const draw = () => {
      const ps = knots.current,
        p = ps[ps.length - 1],
        a = ps[ps.length - 2]
      if (!p) {
        return
      }
      path.setAttribute("d", ps.map((v, i) => `${i ? "L" : "M"}${v.x} ${v.y}`).join(" "))
      const angle = Math.max(-42, Math.min(42, (Math.atan2(p.x - a.x, p.y - a.y) * -180) / Math.PI))
      card.style.transform = `translate(${p.x - 58}px,${p.y + 4}px) rotate(${angle}deg)`
    }
    const reset = () => {
      w = el.clientWidth
      h = el.clientHeight
      length = Math.max(75, h - 206)
      if (dimensions.current.width === w && dimensions.current.height === h && knots.current.length) {
        draw()
        return
      }
      dimensions.current = { width: w, height: h }
      knots.current = Array.from({ length: 9 }, (_, i) => ({
        x: w / 2,
        y: 10 + (i * length) / 8,
        px: w / 2,
        py: 10 + (i * length) / 8,
      }))
      draw()
    }
    const simulate = () => {
      const ps = knots.current,
        segment = length / 8
      for (let i = 1; i < ps.length; i++) {
        const p = ps[i],
          vx = (p.x - p.px) * 0.973,
          vy = (p.y - p.py) * 0.973
        p.px = p.x
        p.py = p.y
        p.x += vx
        p.y += vy + 0.22
      }
      for (let k = 0; k < 12; k++) {
        ps[0].x = w / 2
        ps[0].y = 10
        if (drag.current) {
          const d = drag.current,
            p = ps[8]
          p.x = Math.max(60, Math.min(w - 60, d.x))
          p.y = Math.max(30, Math.min(h - 184, d.y))
        }
        for (let i = 0; i < 8; i++) {
          const a = ps[i],
            b = ps[i + 1],
            dx = b.x - a.x,
            dy = b.y - a.y,
            d = Math.hypot(dx, dy) || 1,
            correction = ((d - segment) / d) * 0.5
          if (i) {
            a.x += dx * correction
            a.y += dy * correction
          }
          if (!(drag.current && i === 7)) {
            b.x -= dx * correction
            b.y -= dy * correction
          }
        }
      }
      draw()
    }
    const frame = (time: number) => {
      raf = 0
      accumulator += previous ? Math.min(50, time - previous) : 1000 / 60
      previous = time
      while (accumulator >= 1000 / 60) {
        simulate()
        count++
        accumulator -= 1000 / 60
      }
      if (!document.hidden && (drag.current || count < 220)) {
        raf = requestAnimationFrame(frame)
      }
    }
    const kick = () => {
      cancelAnimationFrame(raf)
      count = 0
      previous = 0
      accumulator = 0
      if (calm) {
        if (drag.current) {
          const d = drag.current
          knots.current.forEach((p, i) => {
            p.x = w / 2 + ((d.x - w / 2) * i) / 8
            p.y = 10 + ((d.y - 10) * i) / 8
            p.px = p.x
            p.py = p.y
          })
        }
        draw()
      } else if (!document.hidden) {
        raf = requestAnimationFrame(frame)
      }
    }
    paint.current = () => {
      cancelAnimationFrame(raf)
      raf = 0
      draw()
    }
    start.current = kick
    const ro = new ResizeObserver(reset)
    ro.observe(el)
    reset()
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (!calm) {
        kick()
      }
    }
    document.addEventListener("visibilitychange", visibility)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener("visibilitychange", visibility)
      start.current = () => {}
      paint.current = () => {}
    }
  }, [calm])
  return (
    <section className="sf-pinned-pass" ref={root} aria-label="Hanging event pass">
      <style>{`.sf-pinned-pass{width:100%;height:100%;min-height:280px;position:relative;overflow:hidden;background:#c92720;color:#fff8dc;font-family:Arial,sans-serif}.sf-pinned-pass *{box-sizing:border-box}.sf-pinned-pass .pp-cord{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.sf-pinned-pass .pp-card{position:absolute;left:0;top:0;width:116px;height:172px;border:0;padding:6px;border-radius:5px;background:linear-gradient(140deg,#eee7d2,#d3c9ac);color:#17291c;box-shadow:0 10px 22px #65151050;cursor:grab;touch-action:none;transform-origin:58px -4px;text-align:left}.sf-pinned-pass .pp-card:before{content:'';position:absolute;top:-9px;left:50px;width:16px;height:16px;border:3px solid #e3ddc9;border-radius:50%;background:#413a27;box-shadow:inset 1px 1px 2px #0008}.sf-pinned-pass .pp-card:focus-visible{outline:2px solid white;outline-offset:5px}.sf-pinned-pass .pp-inner{height:100%;background:#f2eedb;padding:9px;display:flex;flex-direction:column;overflow:hidden}.sf-pinned-pass .pp-inner small{font-size:7px;font-weight:700;letter-spacing:.1em}.sf-pinned-pass .pp-number{font-family:Impact,'Arial Narrow',sans-serif;font-size:70px;line-height:.98;letter-spacing:-.07em;margin:10px 0 8px}.sf-pinned-pass .pp-inner strong{font-size:11px;line-height:1.05}.sf-pinned-pass .pp-stripes{height:14px;width:100%;margin-top:auto;background:repeating-linear-gradient(90deg,#1b2d20 0 1px,transparent 1px 3px,#1b2d20 3px 5px,transparent 5px 7px)}.sf-pinned-pass .pp-bottom{position:absolute;bottom:14px;left:20px;right:20px;display:flex;align-items:center;justify-content:space-between;font-size:10px;letter-spacing:.15em}.sf-pinned-pass .pp-bottom button{border:1px solid #fff6;background:transparent;color:inherit;min-height:44px;padding:0 13px;font:inherit;cursor:pointer}.sf-pinned-pass .pp-bottom button:focus-visible{outline:2px solid #fff;outline-offset:3px}`}</style>
      <svg className="pp-cord">
        <path ref={cord} fill="none" stroke="#281d19" strokeWidth="6" />
        <path d="M0 9H600" stroke="#a31d18" strokeWidth="1" />
      </svg>
      <button
        ref={badge}
        className="pp-card"
        aria-label="Drag event pass; use arrow keys to move it"
        onPointerDown={(e) => {
          if (e.button !== 0) {
            return
          }
          const element = root.current!
          const r = element.getBoundingClientRect(),
            p = knots.current[8]
          drag.current = {
            id: e.pointerId,
            dx: ((e.clientX - r.left) * element.clientWidth) / r.width - p.x,
            dy: ((e.clientY - r.top) * element.clientHeight) / r.height - p.y,
            x: p.x,
            y: p.y,
          }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d || d.id !== e.pointerId) {
            return
          }
          const element = root.current!
          const r = element.getBoundingClientRect()
          d.x = ((e.clientX - r.left) * element.clientWidth) / r.width - d.dx
          d.y = ((e.clientY - r.top) * element.clientHeight) / r.height - d.dy
          start.current()
        }}
        onPointerUp={(e) => {
          drag.current = null
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
          start.current()
        }}
        onPointerCancel={() => {
          drag.current = null
          start.current()
        }}
        onKeyDown={(e) => {
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(e.key)) {
            e.preventDefault()
            const el = root.current!
            const p = knots.current[8]
            const dx = e.key === "ArrowLeft" ? -15 : e.key === "ArrowRight" ? 15 : 0,
              dy = e.key === "ArrowUp" ? -12 : e.key === "ArrowDown" ? 12 : 0
            const tx = e.key === "Home" ? el.clientWidth / 2 : Math.max(60, Math.min(el.clientWidth - 60, p.x + dx)),
              ty = e.key === "Home" ? el.clientHeight - 196 : Math.max(35, Math.min(el.clientHeight - 184, p.y + dy))
            knots.current.forEach((v, i) => {
              v.x = el.clientWidth / 2 + ((tx - el.clientWidth / 2) * i) / 8
              v.y = 10 + ((ty - 10) * i) / 8
              v.px = v.x
              v.py = v.y
            })
            paint.current()
          }
        }}
      >
        <div className="pp-inner">
          {back ? (
            <>
              <small>RUN CLUB / 2026</small>
              <strong style={{ fontSize: 20, marginTop: 26 }}>
                TAKE THE
                <br />
                LONG WAY.
              </strong>
              <small style={{ marginTop: 17 }}>
                SATURDAY
                <br />
                07:00 / GATE B
              </small>
              <div className="pp-stripes" />
            </>
          ) : (
            <>
              <small>FIELD DAY / 2026</small>
              <div className="pp-number">08</div>
              <strong>
                ALL ACCESS
                <br />
                TRACK & FIELD
              </strong>
              <div className="pp-stripes" />
            </>
          )}
        </div>
      </button>
      <div className="pp-bottom">
        <span>FIELD DAY</span>
        <button onClick={() => setBack(!back)}>{back ? "Front" : "Reverse"} ↗</button>
      </div>
    </section>
  )
}
