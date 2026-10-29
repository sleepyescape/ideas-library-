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

export default function TileWave({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phase = useRef(0)
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false),
    [amount, setAmount] = useState(28),
    [fine, setFine] = useState(false)
  useEffect(() => {
    const canvas = canvasRef.current,
      ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) {
      return
    }
    const art = document.createElement("canvas"),
      ink = art.getContext("2d")
    if (!ink) {
      return
    }
    let width = 600,
      height = 360,
      raf = 0,
      last = 0
    const paintArt = () => {
      art.width = canvas.width
      art.height = canvas.height
      ink.setTransform(art.width / Math.max(1, width), 0, 0, art.height / Math.max(1, height), 0, 0)
      ink.fillStyle = "#cf0754"
      ink.fillRect(0, 0, width, height)
      ink.fillStyle = "#ecff28"
      ink.fillRect(width * 0.08, height * 0.14, width * 0.84, height * 0.64)
      ink.fillStyle = "#cf0754"
      ink.font = `900 ${width * 0.255}px Arial,sans-serif`
      ink.textAlign = "center"
      ink.textBaseline = "middle"
      ink.fillText("SHIFT", width * 0.49, height * 0.49, width * 0.79)
      ink.strokeStyle = "#6b0739"
      ink.lineWidth = 2
      ink.beginPath()
      ink.moveTo(0, height * 0.86)
      ink.lineTo(width, height * 0.86)
      ink.stroke()
    }
    const draw = () => {
      ctx.fillStyle = "#930839"
      ctx.fillRect(0, 0, width, height)
      const cols = fine ? 24 : 12,
        rows = fine ? 16 : 8,
        cw = width / cols,
        ch = height / rows
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const nx = i / cols,
            ny = j / rows
          const dx = Math.sin(ny * 7 + phase.current) * amount * 0.55
          const dy = Math.sin(nx * 8 + phase.current * 0.8) * amount * 0.3
          ctx.drawImage(
            art,
            (i * cw * art.width) / width,
            (j * ch * art.height) / height,
            (cw * art.width) / width,
            (ch * art.height) / height,
            i * cw + dx,
            j * ch + dy,
            cw + 1.2,
            ch + 1.2,
          )
        }
      }
    }
    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      const dpr = Math.min(devicePixelRatio || 1, 2)
      const display = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(display.width * dpr))
      canvas.height = Math.max(1, Math.round(display.height * dpr))
      ctx.setTransform(canvas.width / Math.max(1, width), 0, 0, canvas.height / Math.max(1, height), 0, 0)
      paintArt()
      draw()
    }
    const tick = (now: number) => {
      if (last) {
        phase.current += Math.min((now - last) / 1000, 0.05) * 0.65
      }
      last = now
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
    }
  }, [active, paused, reduced, amount, fine])
  return (
    <section className="sf-tile-wave">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A magenta and yellow typographic print ripples in displaced rectangular tiles"
      />
      <div className="sf-tile-wave-controls">
        <button type="button" onClick={() => setPaused(!paused)} disabled={reduced} aria-pressed={paused}>
          {reduced ? "Still" : paused ? "Play" : "Pause"}
        </button>
        <button type="button" onClick={() => setFine(!fine)} aria-pressed={fine}>
          {fine ? "Fine" : "Coarse"}
        </button>
        <label>
          Warp
          <input
            type="range"
            aria-label="Tile warp amount"
            min="0"
            max="60"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
      </div>
      <style>{`.sf-tile-wave{position:relative;width:100%;height:100%;min-height:260px;overflow:hidden;background:#cf0754;color:#ecff28;font:12px Arial,sans-serif}.sf-tile-wave *{box-sizing:border-box}.sf-tile-wave canvas{display:block;width:100%;height:100%}.sf-tile-wave-controls{position:absolute;left:18px;right:18px;bottom:5px;display:flex;align-items:center;gap:8px}.sf-tile-wave button{min-width:50px;min-height:44px;color:inherit;border:0;border-radius:0;background:#a3073ec9;font:inherit;padding:8px 10px;cursor:pointer}.sf-tile-wave label{display:flex;align-items:center;gap:9px;margin-left:auto;background:#a3073ec9;padding:0 9px}.sf-tile-wave input{width:clamp(70px,15vw,108px);min-height:44px;accent-color:#ecff28}.sf-tile-wave :focus-visible{outline:2px solid #fff;outline-offset:2px}`}</style>
    </section>
  )
}
