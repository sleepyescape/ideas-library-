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

export default function LatticeWave({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const clock = useRef(0)
  const [tension, setTension] = useState(65)
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
    const el = canvas.current,
      ctx = el?.getContext("2d")
    if (!el || !ctx) {
      return
    }
    let frame = 0,
      resizeFrame = 0,
      last = 0,
      w = 1,
      h = 1
    function draw() {
      if (!ctx) {
        return
      }
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = "#093b2a"
      ctx.lineWidth = 1.15
      const cols = 24,
        rows = 15,
        amp = (tension / 100) * Math.min(w, h) * 0.115,
        t = clock.current
      const point = (i: number, j: number) => {
        const x = (i / cols) * w,
          y = (j / rows) * h
        return {
          x: x + Math.sin(j * 0.52 + t) * amp * Math.sin((i / cols) * Math.PI),
          y: y + Math.cos(i * 0.47 - t * 0.7) * amp * Math.sin((j / rows) * Math.PI),
        }
      }
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath()
        for (let i = 0; i <= cols; i++) {
          const p = point(i, j)
          if (i === 0) {
            ctx.moveTo(p.x, p.y)
          } else {
            ctx.lineTo(p.x, p.y)
          }
        }
        ctx.stroke()
      }
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath()
        for (let j = 0; j <= rows; j++) {
          const p = point(i, j)
          if (j === 0) {
            ctx.moveTo(p.x, p.y)
          } else {
            ctx.lineTo(p.x, p.y)
          }
        }
        ctx.stroke()
      }
      ctx.fillStyle = "#093b2a"
      for (let j = 2; j < rows; j += 3) {
        for (let i = 2; i < cols; i += 3) {
          const p = point(i, j)
          ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
        }
      }
    }
    const resize = () => {
      if (!el || !ctx) {
        return
      }
      const b = el.getBoundingClientRect()
      w = el.clientWidth
      h = el.clientHeight
      if (!w || !h) {
        return
      }
      const d = Math.min(devicePixelRatio || 1, 2)
      el.width = Math.max(1, Math.round(b.width * d))
      el.height = Math.max(1, Math.round(b.height * d))
      ctx.setTransform(el.width / w, 0, 0, el.height / h, 0, 0)
      draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    const windowResize = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    }
    // An ancestor transform changes raster density without resizing the layout box.
    const transforms = new MutationObserver(windowResize)
    for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", windowResize)
    resize()
    function tick(now: number) {
      if (last) {
        clock.current += Math.min(now - last, 48) / 1700
      }
      last = now
      draw()
      frame = requestAnimationFrame(tick)
    }
    if (active && running && !reduced) {
      frame = requestAnimationFrame(tick)
    }
    return () => {
      observer.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", windowResize)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
    }
  }, [active, running, reduced, tension])
  return (
    <section className="sf-lattice-wave">
      <div className="sf-lw-top">
        <strong>WARP / WEFT</strong>
        <button
          type="button"
          hidden={reduced}
          aria-label={running ? "Pause lattice" : "Play lattice"}
          aria-pressed={running}
          onClick={() => setRunning(!running)}
        >
          {running ? "Ⅱ" : "▶"}
        </button>
      </div>
      <canvas ref={canvas} role="img" aria-label="Oscillating orthogonal lattice" />
      <div className="sf-lw-bottom">
        <label>
          Tension
          <input
            aria-label="Lattice tension"
            type="range"
            min="0"
            max="100"
            value={tension}
            onChange={(e) => setTension(+e.target.value)}
          />
        </label>
        <output>{String(tension).padStart(2, "0")}</output>
      </div>
      <style>{`.sf-lattice-wave{width:100%;height:100%;min-height:280px;position:relative;overflow:hidden;background:#ad60e5;color:#093b2a;font-family:Arial,sans-serif;box-sizing:border-box;padding:0 22px}.sf-lattice-wave *{box-sizing:border-box}.sf-lw-top{position:absolute;top:7px;left:22px;right:22px;display:flex;align-items:center;justify-content:space-between;height:44px;z-index:1}.sf-lw-top strong{font-size:12px;letter-spacing:-.02em;font-weight:800}.sf-lw-top button{height:44px;width:44px;color:inherit;background:none;border:0;font:17px monospace;cursor:pointer}.sf-lattice-wave canvas{position:absolute;left:22px;top:58px;width:calc(100% - 44px);height:calc(100% - 119px);display:block}.sf-lw-bottom{position:absolute;left:22px;right:22px;bottom:9px;display:flex;align-items:center;gap:24px;height:44px;font:10px monospace}.sf-lw-bottom label{display:flex;align-items:center;gap:20px;flex:1;min-width:0}.sf-lw-bottom input{height:44px;min-width:0;width:100%;appearance:none;background:transparent;cursor:ew-resize}.sf-lw-bottom input::-webkit-slider-runnable-track{height:2px;background:#093b2a66}.sf-lw-bottom input::-webkit-slider-thumb{appearance:none;width:12px;height:16px;background:#093b2a;border:2px solid #ad60e5;outline:1px solid #093b2a;margin-top:-7px;border-radius:0}.sf-lw-bottom input::-moz-range-track{height:2px;background:#093b2a66}.sf-lw-bottom input::-moz-range-thumb{width:10px;height:14px;background:#093b2a;border:2px solid #ad60e5;border-radius:0}.sf-lw-bottom output{width:22px;font-variant-numeric:tabular-nums;text-align:right}.sf-lw-top button:focus-visible,.sf-lw-bottom input:focus-visible{outline:2px solid #093b2a;outline-offset:2px}`}</style>
    </section>
  )
}
