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

export default function TidalBitmap({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const pointer = useRef({ x: 0.5, y: 0.5 })
  const clock = useRef(0)
  const repaint = useRef<() => void>(() => {})
  const [fault, setFault] = useState(false)
  const [running, setRunning] = useState(true)
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext("2d")
    if (!el || !ctx) {
      return
    }
    let frame = 0,
      last = 0
    function draw() {
      if (!el || !ctx) {
        return
      }
      const w = el.width,
        h = el.height,
        data = ctx.createImageData(w, h)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x / w,
            ny = y / h,
            dist = Math.hypot(nx - pointer.current.x, ny - pointer.current.y),
            t = clock.current
          const field = fault
            ? Math.sin(Math.floor(nx * 17) * 1.71 + Math.floor(ny * 10) * 2.31 + t * 0.8) -
              (ny > pointer.current.y ? 0.6 : 0)
            : Math.sin(nx * 16 + ny * 7 + t) + Math.cos(ny * 24 - t * 0.7) - dist * 2.2
          const threshold = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5][(y % 4) * 4 + (x % 4)] / 16
          const on = fault ? field > -0.25 : Math.max(0, Math.min(1, (field + 1.3) / 2.6)) > threshold
          const i = (y * w + x) * 4
          data.data[i] = on ? 239 : 25
          data.data[i + 1] = on ? 49 : 37
          data.data[i + 2] = on ? 30 : 205
          data.data[i + 3] = 255
        }
      }
      ctx.putImageData(data, 0, 0)
    }
    repaint.current = draw
    const resize = () => {
      if (!el) {
        return
      }
      el.width = Math.max(1, Math.min(180, Math.round(el.clientWidth / 3)))
      el.height = Math.max(1, Math.min(120, Math.round(el.clientHeight / 3)))
      draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()
    function tick(now: number) {
      if (last) {
        clock.current += Math.min(now - last, 48) / 1000
      }
      last = now
      draw()
      frame = requestAnimationFrame(tick)
    }
    if (active && running && !reduced) {
      frame = requestAnimationFrame(tick)
    }
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      repaint.current = () => {}
    }
  }, [active, running, reduced, fault])
  function move(x: number, y: number) {
    pointer.current = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
    repaint.current()
  }
  return (
    <section className="sf-tidal-bitmap">
      <div
        className="sf-tb-field"
        role="img"
        aria-label="Interactive two-color tidal interference. Arrow keys move the wave center."
        tabIndex={0}
        onPointerMove={(e) => {
          const b = e.currentTarget.getBoundingClientRect()
          move((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height)
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          const b = e.currentTarget.getBoundingClientRect()
          move((e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height)
        }}
        onKeyDown={(e) => {
          const x = e.key === "ArrowLeft" ? -0.07 : e.key === "ArrowRight" ? 0.07 : 0,
            y = e.key === "ArrowUp" ? -0.07 : e.key === "ArrowDown" ? 0.07 : 0
          if (x || y) {
            e.preventDefault()
            move(pointer.current.x + x, pointer.current.y + y)
          }
        }}
      >
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <div className="sf-tb-bar">
        <strong>TIDAL</strong>
        <div>
          <button type="button" aria-pressed={fault} onClick={() => setFault(!fault)}>
            {fault ? "Fault" : "Flow"}
            <span>↗</span>
          </button>
          <button
            type="button"
            aria-label={running ? "Pause field" : "Play field"}
            aria-pressed={running}
            onClick={() => setRunning(!running)}
          >
            {running ? "Ⅱ" : "▶"}
          </button>
        </div>
      </div>
      <style>{`.sf-tidal-bitmap{width:100%;height:100%;min-height:280px;position:relative;background:#1925cd;overflow:hidden;font-family:Arial,sans-serif;color:#fff;box-sizing:border-box}.sf-tidal-bitmap *{box-sizing:border-box}.sf-tb-field{position:absolute;inset:0 0 58px;touch-action:none;outline:none}.sf-tb-field:focus-visible{outline:2px solid #fff;outline-offset:-8px}.sf-tb-field canvas{width:100%;height:100%;image-rendering:pixelated;display:block}.sf-tb-bar{position:absolute;bottom:0;left:0;right:0;height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-top:1px solid #fff6;background:#1925cd}.sf-tb-bar strong{font-size:23px;letter-spacing:-1.2px;line-height:1}.sf-tb-bar>div{display:flex;gap:9px}.sf-tb-bar button{height:44px;min-width:44px;background:none;color:inherit;border:0;font:11px monospace;cursor:pointer;padding:0 9px}.sf-tb-bar button:first-child{min-width:76px;display:flex;gap:20px;align-items:center;border-inline:1px solid #ffffff40}.sf-tb-bar button:focus-visible{outline:2px solid #fff;outline-offset:-3px}.sf-tb-bar button:active{background:#ffffff20}`}</style>
    </section>
  )
}
