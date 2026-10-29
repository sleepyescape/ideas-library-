/**
 * MIT License
 * Copyright (c) 2026 Subframe
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
"use client"

import { type PointerEvent, useEffect, useRef, useState } from "react"

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

type ThreadPoint = { x: number; y: number; px: number; py: number; homeX: number; homeY: number; pinned: boolean }
export default function TensionFabric({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wind = useRef(30)
  const [windValue, setWindValue] = useState(30),
    [paused, setPaused] = useState(false)
  const action = useRef<(kind: "pluck" | "reset") => void>(() => {})
  const pointer = useRef<{ id: number; x: number; y: number; index: number } | null>(null)
  const pointsRef = useRef<ThreadPoint[]>([])
  const sizeRef = useRef({ width: 0, height: 0 })
  const clockRef = useRef(0)
  const refresh = useRef<() => void>(() => {})
  useEffect(() => {
    const canvas = canvasRef.current,
      ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) {
      return
    }
    const cols = 29,
      rows = 17
    let width = 600,
      height = 360,
      raf = 0,
      last = 0,
      clock = 0,
      accumulator = 0
    let constraints: { a: number; b: number; length: number }[] = []
    const init = (reset = false) => {
      const points: ThreadPoint[] = []
      constraints = []
      const dx = (width * 0.84) / (cols - 1),
        dy = (height * 0.62) / (rows - 1)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = width * 0.08 + x * dx,
            py = height * 0.12 + y * dy
          const flutter = (y / rows) * Math.sin(x * 0.55) * 4
          points.push({ x: px + flutter, y: py, px: px, py, homeX: px, homeY: py, pinned: y === 0 })
          const index = y * cols + x
          if (x) {
            constraints.push({ a: index - 1, b: index, length: dx })
          }
          if (y) {
            constraints.push({ a: index - cols, b: index, length: dy })
          }
        }
      }
      if (reset || sizeRef.current.width !== width || sizeRef.current.height !== height || !pointsRef.current.length) {
        pointsRef.current = points
      }
      sizeRef.current = { width, height }
    }
    const step = () => {
      const points = pointsRef.current
      clockRef.current += 1 / 60
      clock = clockRef.current
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        if (p.pinned) {
          continue
        }
        if (pointer.current?.index === i) {
          p.x = pointer.current.x
          p.y = pointer.current.y
          p.px = p.x
          p.py = p.y
          continue
        }
        const vx = Math.max(-12, Math.min(12, (p.x - p.px) * 0.965)),
          vy = Math.max(-12, Math.min(12, (p.y - p.py) * 0.965))
        p.px = p.x
        p.py = p.y
        p.x += vx + Math.sin(clock * 1.5 + p.homeY * 0.028) * wind.current * 0.002
        p.y += vy + 0.055
      }
      for (let pass = 0; pass < 6; pass++) {
        for (const c of constraints) {
          const a = points[c.a],
            b = points[c.b],
            dx = b.x - a.x,
            dy = b.y - a.y,
            d = Math.hypot(dx, dy) || 0.001
          const af = a.pinned || pointer.current?.index === c.a,
            bf = b.pinned || pointer.current?.index === c.b
          const fraction = ((d - c.length) / d) * 0.9,
            weight = af || bf ? 1 : 0.5
          if (!af) {
            a.x += dx * fraction * weight
            a.y += dy * fraction * weight
          }
          if (!bf) {
            b.x -= dx * fraction * weight
            b.y -= dy * fraction * weight
          }
        }
      }
      for (const p of points) {
        if (p.pinned) {
          continue
        }
        p.x = Math.max(8, Math.min(width - 8, p.x))
        p.y = Math.max(12, Math.min(height - 56, p.y))
      }
    }
    const draw = () => {
      const points = pointsRef.current
      ctx.fillStyle = "#291b37"
      ctx.fillRect(0, 0, width, height)
      const glow = ctx.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.42, width * 0.6)
      glow.addColorStop(0, "#573453")
      glow.addColorStop(1, "#291b37")
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const i = row * cols + col,
            a = points[i],
            b = points[i + 1],
            c = points[i + cols + 1],
            d = points[i + cols]
          const slope = (b.y - a.y) * 0.5
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.lineTo(c.x, c.y)
          ctx.lineTo(d.x, d.y)
          ctx.closePath()
          ctx.fillStyle = `hsl(${col % 4 < 2 ? 94 : 300} ${col % 4 < 2 ? 22 : 16}% ${Math.max(
            13,
            Math.min(46, 26 + slope),
          )}%)`
          ctx.fill()
        }
      }
      // Each segment alternates above/below the cross thread to read as a weave.
      const line = (a: ThreadPoint, b: ThreadPoint, color: string, weight: number) => {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = color
        ctx.lineWidth = weight
        ctx.stroke()
      }
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const i = row * cols + col,
            a = points[i],
            b = points[i + 1],
            d = points[i + cols],
            horizontalFirst = (row + col) % 2 === 0
          if (horizontalFirst) {
            line(a, b, "#201129a0", 4)
            line(a, d, col % 2 ? "#859363" : "#576545", 3)
          } else {
            line(a, d, "#172213aa", 4)
            line(a, b, row % 2 ? "#9b7095" : "#775473", 3)
          }
          line(a, b, "#c492b24d", 0.6)
          line(a, d, "#b2c18060", 0.6)
        }
      }
      ctx.fillStyle = "#ccd2ac"
      for (let i = 0; i < cols; i += 4) {
        ctx.beginPath()
        ctx.arc(points[i].x, points[i].y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    refresh.current = () => {
      if (reduced || paused || !active) {
        for (let i = 0; i < 8; i++) {
          step()
        }
      }
      draw()
    }
    const resize = () => {
      const layoutChanged = width !== canvas.clientWidth || height !== canvas.clientHeight || !pointsRef.current.length
      width = canvas.clientWidth
      height = canvas.clientHeight
      const dpr = Math.min(devicePixelRatio || 1, 2)
      const display = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(display.width * dpr))
      canvas.height = Math.max(1, Math.round(display.height * dpr))
      ctx.setTransform(canvas.width / Math.max(1, width), 0, 0, canvas.height / Math.max(1, height), 0, 0)
      if (layoutChanged) {
        pointer.current = null
        init()
      }
      draw()
    }
    action.current = (kind) => {
      if (kind === "reset") {
        init(true)
        draw()
        return
      }
      const points = pointsRef.current
      for (const p of points) {
        if (p.pinned) {
          continue
        }
        const d = Math.hypot((p.x - width * 0.54) / (width * 0.3), (p.y - height * 0.48) / (height * 0.3))
        const force = Math.max(0, 1 - d)
        p.x += force * width * 0.06
        p.y -= force * height * 0.08
        p.px = p.x
        p.py = p.y
      }
      if (reduced || !active || paused) {
        for (let i = 0; i < 8; i++) {
          step()
        }
      }
      draw()
    }
    const tick = (now: number) => {
      if (last) {
        accumulator += Math.min((now - last) / 1000, 0.05)
      }
      last = now
      while (accumulator >= 1 / 60) {
        step()
        accumulator -= 1 / 60
      }
      draw()
      raf = requestAnimationFrame(tick)
    }
    let resizeFrame = 0
    const scheduleResize = () => {
      cancelAnimationFrame(resizeFrame)
      // Ancestor transforms can settle after layout observers have run.
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(resize)
      })
    }
    const transforms = new MutationObserver(scheduleResize)
    for (let ancestor = canvas.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", scheduleResize)
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    if (active && !paused && !reduced) {
      raf = requestAnimationFrame(tick)
    }
    return () => {
      observer.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", scheduleResize)
      cancelAnimationFrame(resizeFrame)
      cancelAnimationFrame(raf)
      pointer.current = null
    }
  }, [active, paused, reduced])
  const locate = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * e.currentTarget.clientWidth,
      y: ((e.clientY - r.top) / r.height) * e.currentTarget.clientHeight,
    }
  }
  return (
    <section className="sf-tension">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A woven plum and green fabric hangs from a pinned top edge. Drag the weave or use Pluck."
        onPointerDown={(e) => {
          const p = locate(e)
          let distance = Infinity,
            index = 0
          pointsRef.current.forEach((point, i) => {
            if (point.pinned) {
              return
            }
            const d = Math.hypot(point.x - p.x, point.y - p.y)
            if (d < distance) {
              distance = d
              index = i
            }
          })
          pointer.current = { id: e.pointerId, ...p, index }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (pointer.current?.id !== e.pointerId) {
            return
          }
          const p = locate(e)
          pointer.current = { ...pointer.current, ...p }
          if (reduced || paused || !active) {
            const thread = pointsRef.current[pointer.current.index]
            thread.x = p.x
            thread.y = p.y
            thread.px = p.x
            thread.py = p.y
            refresh.current()
          }
        }}
        onPointerUp={(e) => {
          pointer.current = null
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
        }}
        onPointerCancel={() => {
          pointer.current = null
        }}
        onLostPointerCapture={() => {
          pointer.current = null
        }}
      />
      <div className="sf-tension-controls">
        <button type="button" onClick={() => action.current("pluck")}>
          Pluck
        </button>
        <button type="button" aria-pressed={paused} disabled={reduced} onClick={() => setPaused(!paused)}>
          {reduced ? "Still" : paused ? "Play" : "Pause"}
        </button>
        <label>
          Wind
          <input
            type="range"
            aria-label="Fabric wind"
            min="0"
            max="100"
            value={windValue}
            onChange={(e) => {
              wind.current = Number(e.target.value)
              setWindValue(wind.current)
            }}
          />
        </label>
        <button
          className="sf-tension-reset"
          type="button"
          aria-label="Reset fabric"
          onClick={() => action.current("reset")}
        >
          ↺
        </button>
      </div>
      <style>{`.sf-tension{position:relative;width:100%;height:100%;min-height:260px;overflow:hidden;background:#291b37;color:#dbe2c4;font:11px Arial,sans-serif}.sf-tension *{box-sizing:border-box}.sf-tension canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}.sf-tension canvas:active{cursor:grabbing}.sf-tension-controls{position:absolute;inset:auto 15px 6px;display:flex;align-items:center;gap:5px}.sf-tension button{min-width:44px;min-height:44px;background:#291b37dd;border:1px solid #baa1b333;border-radius:3px;color:inherit;font:inherit;padding:0 9px;cursor:pointer}.sf-tension label{display:flex;align-items:center;gap:6px;margin-left:auto;padding-inline:5px}.sf-tension input{width:clamp(55px,13vw,105px);min-height:44px;accent-color:#aabc87}.sf-tension .sf-tension-reset{font:23px Arial}.sf-tension :focus-visible{outline:2px solid #e6edd3;outline-offset:2px}`}</style>
    </section>
  )
}
