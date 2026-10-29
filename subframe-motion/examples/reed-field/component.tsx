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

type Stem = { x: number; length: number; base: number; shade: number; seed: number; angle: number; speed: number }
const noise = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export default function ReedField({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const time = useRef(0)
  const field = useRef<{ width: number; height: number; stems: Stem[] }>({ width: 0, height: 0, stems: [] })
  const [wind, setWind] = useState(1)
  const [paused, setPaused] = useState(false)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    const surface = canvas.current
    const ctx = surface?.getContext("2d", { alpha: false })
    if (!surface || !ctx) {
      setAvailable(false)
      return
    }
    let width = 1,
      height = 1,
      frame = 0,
      previous = 0,
      disposed = false
    let stems = field.current.stems
    let pointer: { x: number; y: number; id: number | null } = { x: -1000, y: -1000, id: null }
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    let reduced = media.matches
    const running = () => active && !paused && !reduced && !document.hidden && !disposed
    const draw = (dt = 0) => {
      ctx.fillStyle = "#101c22"
      ctx.fillRect(0, 0, width, height)
      const light = ctx.createRadialGradient(width * 0.64, height * 0.68, 0, width * 0.64, height * 0.68, width * 0.65)
      light.addColorStop(0, "#273438")
      light.addColorStop(1, "#101c22")
      ctx.fillStyle = light
      ctx.fillRect(0, 0, width, height)
      for (const stem of stems) {
        const phase = stem.x * 0.012 + stem.seed * 3
        const breeze = Math.sin(time.current * 0.75 + phase) * 0.09 + Math.sin(time.current * 1.4 + phase * 0.35) * 0.04
        let desired = (breeze + 0.085) * [0.15, 1, 2.8][wind]
        const distance = Math.hypot(pointer.x - stem.x, pointer.y - (stem.base - stem.length * 0.65))
        if (!reduced && distance < 105) {
          desired += (stem.x < pointer.x ? -1 : 1) * Math.pow(1 - distance / 105, 2) * 1.1
        }
        if (dt) {
          const step = dt / 2
          for (let i = 0; i < 2; i++) {
            stem.speed += ((desired - stem.angle) * 75 - stem.speed * 10) * step
            stem.angle += stem.speed * step
          }
        } else if (reduced) {
          stem.angle = desired
          stem.speed = 0
        }
        const reach = Math.sin(stem.angle) * stem.length
        const tipX = stem.x + reach,
          tipY = stem.base - Math.cos(stem.angle) * stem.length
        const thickness = 0.5 + stem.shade * 1.7
        ctx.fillStyle = `hsl(${43 + stem.shade * 16} ${24 + stem.shade * 23}% ${24 + stem.shade * 43}%)`
        ctx.beginPath()
        ctx.moveTo(stem.x - thickness, stem.base)
        ctx.bezierCurveTo(
          stem.x - thickness,
          stem.base - stem.length * 0.4,
          tipX - thickness * 0.7,
          tipY + stem.length * 0.24,
          tipX,
          tipY,
        )
        ctx.bezierCurveTo(
          tipX + thickness * 0.6,
          tipY + stem.length * 0.28,
          stem.x + thickness,
          stem.base - stem.length * 0.38,
          stem.x + thickness,
          stem.base,
        )
        ctx.closePath()
        ctx.fill()
        if (stem.seed > 0.78) {
          ctx.strokeStyle = `hsl(42 40% ${50 + stem.shade * 28}%)`
          ctx.lineWidth = 0.55
          for (let j = 0; j < 9; j++) {
            const t = j / 9,
              y = tipY + t * 22,
              x = tipX - reach * t * 0.08,
              spread = Math.sin(t * Math.PI) * 4.5
            ctx.beginPath()
            ctx.moveTo(x, y + 5)
            ctx.lineTo(x - spread, y - 1)
            ctx.moveTo(x, y + 5)
            ctx.lineTo(x + spread, y - 2)
            ctx.stroke()
          }
        }
      }
    }
    const tick = (now: number) => {
      frame = 0
      if (!running()) {
        return
      }
      const dt = Math.min(0.032, previous ? (now - previous) / 1000 : 1 / 60)
      previous = now
      time.current += dt
      draw(dt)
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      draw()
      if (running()) {
        frame = requestAnimationFrame(tick)
      }
    }
    const updateSize = () => {
      width = surface.clientWidth
      height = surface.clientHeight
      const dpr = Math.min(devicePixelRatio || 1, 2)
      const display = surface.getBoundingClientRect()
      surface.width = Math.max(1, Math.round(display.width * dpr))
      surface.height = Math.max(1, Math.round(display.height * dpr))
      ctx.setTransform(surface.width / Math.max(1, width), 0, 0, surface.height / Math.max(1, height), 0, 0)
      if (field.current.width !== width || field.current.height !== height) {
        const count = Math.min(480, Math.max(180, Math.round(width * 0.75)))
        stems = Array.from({ length: count }, (_, i) => {
          const depth = Math.floor(i / (count / 4)) / 3
          return {
            x: noise(i + 1) * (width + 40) - 20,
            length: height * (0.22 + noise(i + 4) * 0.6) * (0.65 + depth * 0.35),
            base: height + depth * 18,
            shade: 0.12 + depth * 0.65 + noise(i + 2) * 0.22,
            seed: noise(i + 3),
            angle: 0.08,
            speed: 0,
          }
        })
        field.current = { width, height, stems }
      }
      sync()
    }
    let resizeFrame = 0
    const scheduleResize = () => {
      cancelAnimationFrame(resizeFrame)
      // Ancestor transforms can settle after layout observers have run.
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(updateSize)
      })
    }
    const transforms = new MutationObserver(scheduleResize)
    for (let ancestor = surface.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", scheduleResize)
    const resize = new ResizeObserver(updateSize)
    resize.observe(surface)
    const move = (e: PointerEvent) => {
      if (!active || paused || reduced || !e.isPrimary || (pointer.id !== null && pointer.id !== e.pointerId)) {
        return
      }
      const box = surface.getBoundingClientRect()
      pointer.x = ((e.clientX - box.left) / box.width) * width
      pointer.y = ((e.clientY - box.top) / box.height) * height
    }
    const down = (e: PointerEvent) => {
      if (!active || paused || reduced || !e.isPrimary || e.button !== 0 || pointer.id !== null) {
        return
      }
      pointer.id = e.pointerId
      surface.setPointerCapture(e.pointerId)
      move(e)
    }
    const leave = (e: PointerEvent) => {
      if (pointer.id !== null && e.pointerId !== pointer.id) {
        return
      }
      if (pointer.id !== null && surface.hasPointerCapture(pointer.id)) {
        surface.releasePointerCapture(pointer.id)
      }
      pointer = { x: -1000, y: -1000, id: null }
    }
    const hoverLeave = (e: PointerEvent) => {
      if (pointer.id === null) {
        leave(e)
      }
    }
    const change = () => {
      reduced = media.matches
      if (pointer.id !== null && surface.hasPointerCapture(pointer.id)) {
        surface.releasePointerCapture(pointer.id)
      }
      pointer = { x: -1000, y: -1000, id: null }
      sync()
    }
    const visibility = () => sync()
    surface.addEventListener("pointermove", move)
    surface.addEventListener("pointerdown", down)
    surface.addEventListener("pointerup", leave)
    surface.addEventListener("pointercancel", leave)
    surface.addEventListener("lostpointercapture", leave)
    surface.addEventListener("pointerleave", hoverLeave)
    media.addEventListener("change", change)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resize.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", scheduleResize)
      cancelAnimationFrame(resizeFrame)
      if (pointer.id !== null && surface.hasPointerCapture(pointer.id)) {
        surface.releasePointerCapture(pointer.id)
      }
      media.removeEventListener("change", change)
      document.removeEventListener("visibilitychange", visibility)
      surface.removeEventListener("pointermove", move)
      surface.removeEventListener("pointerdown", down)
      surface.removeEventListener("pointerup", leave)
      surface.removeEventListener("pointercancel", leave)
      surface.removeEventListener("lostpointercapture", leave)
      surface.removeEventListener("pointerleave", hoverLeave)
    }
  }, [active, wind, paused])

  return (
    <section className="sf-reed-field" aria-label="Wind through a field of reeds">
      <canvas
        ref={canvas}
        role="img"
        aria-label="Gold and olive reeds bend with the breeze and respond to your pointer"
      />
      {!available && <p className="fallback">A field at rest.</p>}
      <div className="weather">
        <span>Wind</span>
        <strong>
          {["0.4", "3.8", "8.6"][wind]} <small>m/s</small>
        </strong>
      </div>
      <footer>
        <div aria-label="Wind strength">
          {["Still", "Breeze", "Gust"].map((label, i) => (
            <button key={label} type="button" aria-pressed={wind === i} disabled={!active} onClick={() => setWind(i)}>
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={paused ? "Play wind" : "Pause wind"}
          aria-pressed={paused}
          disabled={!active}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Play" : "Pause"}
        </button>
      </footer>
      <style>{`.sf-reed-field{width:100%;height:100%;position:relative;background:#101c22;color:#e7dfc8;overflow:hidden;font:11px Arial,sans-serif;box-sizing:border-box}.sf-reed-field *{box-sizing:border-box}.sf-reed-field canvas{display:block;width:100%;height:calc(100% - 53px);touch-action:pan-y}.sf-reed-field .weather{position:absolute;left:25px;top:25px;pointer-events:none}.sf-reed-field .weather>span{display:block;font-size:10px;color:#b8c2ba;margin-bottom:7px}.sf-reed-field strong{font:400 31px/1 Georgia,serif;letter-spacing:-1px}.sf-reed-field small{font:10px Arial,sans-serif;letter-spacing:0;color:#b8c2ba;margin-left:3px}.sf-reed-field footer{height:53px;display:flex;align-items:center;justify-content:space-between;padding:0 19px;border-top:1px solid #ffffff1c}.sf-reed-field footer>div{display:flex;gap:5px}.sf-reed-field button{min-height:44px;padding:0 12px;border:0;background:none;color:#9ca99e;font:inherit;cursor:pointer;touch-action:manipulation;position:relative}.sf-reed-field button[aria-pressed=true]{color:#eee3bc}.sf-reed-field footer>div button[aria-pressed=true]:after{content:"";position:absolute;left:12px;right:12px;bottom:5px;height:1px;background:#d7c590}.sf-reed-field button:focus-visible{outline:1px solid #eee3bc;outline-offset:-3px}.sf-reed-field button:disabled{cursor:default}.sf-reed-field .fallback{position:absolute;inset:40% 0;text-align:center;font:30px Georgia,serif}`}</style>
    </section>
  )
}
