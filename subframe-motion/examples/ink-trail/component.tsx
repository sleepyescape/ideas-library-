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
import { useEffect, useRef, useState } from "react"

type Mark = { x: number; y: number; angle: number; size: number }
export default function InkTrail({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const marks = useRef<Mark[]>([])
  const previous = useRef<{ x: number; y: number } | null>(null)
  const cursor = useRef({ x: 0.5, y: 0.5 })
  const repaint = useRef<() => void>(() => {})
  const [hasInk, setHasInk] = useState(true)
  const seeded = useRef(false)
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d")
    if (!el || !ctx) {
      return
    }
    let resizeFrame = 0
    const draw = () => {
      const rect = el.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio || 1, 2)
      const width = el.clientWidth,
        height = el.clientHeight
      if (!width || !height) {
        return
      }
      const w = Math.round(rect.width * dpr),
        h = Math.round(rect.height * dpr)
      if (el.width !== w || el.height !== h) {
        el.width = w
        el.height = h
      }
      ctx.setTransform(w / width, 0, 0, h / height, 0, 0)
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "#171714"
      for (const mark of marks.current) {
        ctx.save()
        ctx.translate(mark.x * width, mark.y * height)
        ctx.rotate(mark.angle)
        const s = mark.size * Math.min(width / 600, 1)
        ctx.beginPath()
        ctx.moveTo(-s * 0.65, -s * 0.42)
        ctx.quadraticCurveTo(s * 0.8, -s * 0.68, s * 0.65, s * 0.05)
        ctx.quadraticCurveTo(s * 0.5, s * 0.45, -s * 0.55, s * 0.48)
        ctx.quadraticCurveTo(-s * 0.15, s * 0.02, -s * 0.65, -s * 0.42)
        ctx.fill()
        ctx.restore()
      }
    }
    if (!seeded.current) {
      seeded.current = true
      for (let i = 0; i < 192; i++) {
        const t = i / 191
        const x = 0.14 + t * 0.72,
          y = 0.52 + Math.sin(t * Math.PI * 2 - 0.7) * 0.14
        marks.current.push({
          x,
          y,
          angle: Math.atan2(Math.cos(t * Math.PI * 2 - 0.7) * 0.14 * Math.PI * 2, 0.72),
          size: 25 + 14 * Math.sin(t * Math.PI),
        })
      }
    }
    repaint.current = draw
    const resize = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(draw)
    }
    const observer = new ResizeObserver(draw)
    observer.observe(el)
    // An ancestor transform changes raster density without resizing the layout box.
    const transforms = new MutationObserver(resize)
    for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", resize)
    draw()
    return () => {
      observer.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(resizeFrame)
      repaint.current = () => {}
    }
  }, [])
  const add = (x: number, y: number, angle: number, render = true) => {
    marks.current.push({ x, y, angle, size: 30 })
    if (marks.current.length > 900) {
      marks.current.splice(0, marks.current.length - 900)
    }
    if (render) {
      setHasInk(true)
      repaint.current()
    }
  }
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active) {
      return
    }
    if (e.pointerType !== "mouse" && !e.currentTarget.hasPointerCapture(e.pointerId)) {
      return
    }
    const r = e.currentTarget.getBoundingClientRect(),
      width = e.currentTarget.clientWidth,
      height = e.currentTarget.clientHeight,
      x = ((e.clientX - r.left) * width) / r.width,
      y = ((e.clientY - r.top) * height) / r.height,
      p = previous.current
    if (p) {
      const distance = Math.hypot(x - p.x, y - p.y),
        step = 3 * Math.min(width / 600, 1)
      if (distance < step) {
        return
      }
      const count = Math.min(96, Math.floor(distance / step)),
        angle = Math.atan2(y - p.y, x - p.x)
      for (let i = 1; i <= count; i++) {
        add((p.x + ((x - p.x) * i) / count) / width, (p.y + ((y - p.y) * i) / count) / height, angle, false)
      }
    } else {
      add(x / width, y / height, 0)
    }
    setHasInk(true)
    repaint.current()
    previous.current = { x, y }
    cursor.current = { x: x / width, y: y / height }
  }
  return (
    <section className="sf-ink-trail">
      <canvas
        ref={canvas}
        tabIndex={0}
        role="application"
        aria-label="Ink canvas. Move the pointer or use arrow keys to draw."
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          previous.current = null
          point(e)
        }}
        onPointerMove={point}
        onPointerLeave={() => {
          previous.current = null
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
          previous.current = null
        }}
        onPointerCancel={() => {
          previous.current = null
        }}
        onKeyDown={(e) => {
          const delta: { [key: string]: [number, number] } = {
            ArrowRight: [0.02, 0],
            ArrowLeft: [-0.02, 0],
            ArrowUp: [0, -0.03],
            ArrowDown: [0, 0.03],
          }
          const d = delta[e.key]
          if (!d || !active) {
            return
          }
          e.preventDefault()
          const start = cursor.current
          cursor.current = {
            x: Math.max(0.03, Math.min(0.97, cursor.current.x + d[0])),
            y: Math.max(0.03, Math.min(0.97, cursor.current.y + d[1])),
          }
          for (let i = 1; i <= 4; i++) {
            add(
              start.x + ((cursor.current.x - start.x) * i) / 4,
              start.y + ((cursor.current.y - start.y) * i) / 4,
              Math.atan2(d[1], d[0]),
              false,
            )
          }
          setHasInk(true)
          repaint.current()
        }}
      />
      <button
        type="button"
        disabled={!hasInk}
        onClick={() => {
          marks.current = []
          previous.current = null
          repaint.current()
          setHasInk(false)
        }}
      >
        Clear <span aria-hidden="true">×</span>
      </button>
      <style>{`.sf-ink-trail{position:relative;width:100%;height:100%;min-height:280px;background:#ffe000;color:#171714;overflow:hidden;font-family:Arial,sans-serif}.sf-ink-trail *{box-sizing:border-box}.sf-ink-trail canvas{position:absolute;inset:15px 0 55px;width:100%;height:calc(100% - 70px);cursor:crosshair;touch-action:none}.sf-ink-trail canvas:focus-visible{outline:2px dashed #171714;outline-offset:-6px}.sf-ink-trail>button{position:absolute;right:24px;bottom:13px;min-width:80px;min-height:44px;display:flex;justify-content:space-between;align-items:center;gap:16px;border:0;border-bottom:1px solid #171714;background:transparent;color:inherit;font:12px Arial;cursor:pointer}.sf-ink-trail>button span{font-size:24px}.sf-ink-trail>button:disabled{opacity:.35;cursor:default}.sf-ink-trail>button:focus-visible{outline:2px solid currentColor;outline-offset:3px}`}</style>
    </section>
  )
}
