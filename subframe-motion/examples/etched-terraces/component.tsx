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

import { useEffect, useRef, useState } from "react"

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

export default function EtchedTerraces({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const time = useRef(0)
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [relief, setRelief] = useState(65)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) {
      return
    }
    let width = 600,
      height = 360,
      raf = 0,
      previous = 0
    const draw = () => {
      ctx.fillStyle = "#e31b32"
      ctx.fillRect(0, 0, width, height)
      const field = (x: number, y: number) => {
        let z = 0
        for (let k = 0; k < 2; k++) {
          const cx = width * (0.32 + k * 0.37),
            cy = height * (0.51 - k * 0.1)
          const angle = (k ? -0.27 : 0.16) + Math.sin(time.current * 0.16) * 0.09
          const dx = x - cx,
            dy = y - cy
          const a = (dx * Math.cos(angle) - dy * Math.sin(angle)) / (width * 0.255)
          const b = (dx * Math.sin(angle) + dy * Math.cos(angle)) / (height * 0.37)
          const d = Math.max(Math.abs(a), Math.abs(b))
          if (d < 1) {
            const steps = (1 - d) * 8
            const t = steps % 1
            const ledge = Math.floor(steps) + (t < 0.2 ? ((t * t) / 0.04) * 0.13 : 0.13 + ((t - 0.2) * 0.87) / 0.8)
            z += (ledge / 8) * relief * 0.9
          }
        }
        return z
      }
      ctx.strokeStyle = "#5ce4ec"
      ctx.lineWidth = 0.72
      for (let y = height * 0.15; y < height - 65; y += 2.6) {
        ctx.beginPath()
        for (let x = width * 0.065; x <= width * 0.945; x += 3.5) {
          const z = field(x, y)
          const v = y - z + Math.sin(x * 0.07 + time.current * 0.7) * z * 0.045
          if (x === width * 0.065) {
            ctx.moveTo(x, v)
          } else {
            ctx.lineTo(x, v)
          }
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 0.25
      for (let x = width * 0.065; x < width * 0.945; x += 9) {
        ctx.beginPath()
        for (let y = height * 0.15; y < height - 65; y += 4) {
          const z = field(x, y)
          if (y === height * 0.15) {
            ctx.moveTo(x, y - z)
          } else {
            ctx.lineTo(x, y - z)
          }
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (!width || !height) {
        return
      }
      const dpr = Math.min(devicePixelRatio || 1, 2),
        bounds = canvas.getBoundingClientRect()
      canvas.width = Math.round(bounds.width * dpr)
      canvas.height = Math.round(bounds.height * dpr)
      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0)
      draw()
    }
    let resizeFrame = 0
    const resizeViewport = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    }
    const tick = (now: number) => {
      if (previous) {
        time.current += Math.min((now - previous) / 1000, 0.05)
      }
      previous = now
      draw()
      raf = requestAnimationFrame(tick)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    // An ancestor transform changes raster density without resizing the layout box.
    const transforms = new MutationObserver(resizeViewport)
    for (let ancestor = canvas.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    resize()
    window.addEventListener("resize", resizeViewport)
    if (active && !paused && !reduced) {
      raf = requestAnimationFrame(tick)
    }
    return () => {
      observer.disconnect()
      transforms.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeFrame)
      window.removeEventListener("resize", resizeViewport)
    }
  }, [active, paused, reduced, relief])
  return (
    <section className="sf-etched">
      <canvas ref={canvasRef} aria-label="Two moving stepped reliefs woven from fine cyan lines" role="img" />
      <div className="sf-etched-controls">
        <button type="button" disabled={reduced} aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {reduced ? "Still" : paused ? "Play" : "Pause"}
        </button>
        <label>
          Relief{" "}
          <input
            aria-label="Relief height"
            type="range"
            min="0"
            max="100"
            value={relief}
            onChange={(e) => setRelief(Number(e.target.value))}
          />
          <output>{relief}</output>
        </label>
      </div>
      <style>{`.sf-etched{position:relative;width:100%;height:100%;min-height:260px;overflow:hidden;background:#e31b32;color:#b8fdff;font:12px Arial,sans-serif}.sf-etched *{box-sizing:border-box}.sf-etched canvas{display:block;width:100%;height:100%}.sf-etched-controls{position:absolute;inset:auto 22px 9px;display:flex;align-items:center;justify-content:space-between;gap:20px}.sf-etched button{color:inherit;background:none;border:0;border-bottom:1px solid #b8fdff80;min-height:44px;font:inherit;cursor:pointer;padding:0 8px}.sf-etched button:disabled{cursor:default}.sf-etched label{display:flex;align-items:center;gap:12px}.sf-etched input{width:100px;accent-color:#b8fdff;min-height:44px}.sf-etched output{font:11px ui-monospace,monospace;width:22px;text-align:right}.sf-etched :focus-visible{outline:2px solid #fff;outline-offset:3px}`}</style>
    </section>
  )
}
