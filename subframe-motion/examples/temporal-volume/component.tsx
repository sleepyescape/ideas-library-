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

type Point3 = { x: number; y: number; z: number }
export default function TemporalVolume({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    draw = useRef<() => void>(() => {}),
    current = useRef(12),
    angle = useRef({ yaw: -0.56, pitch: 0.35 }),
    drag = useRef<{ pointerId: number; x: number; y: number; yaw: number; pitch: number } | null>(null)
  const [frame, setFrame] = useState(12),
    [playing, setPlaying] = useState(false),
    [reduced, setReduced] = useState(true)
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
    // Paint the moving faces as vectors so expanding the preview never enlarges a raster frame.
    const paintFrame = (g: CanvasRenderingContext2D, i: number) => {
      const t = (i / 32) * Math.PI * 2
      g.fillStyle = "#eeeee6"
      g.fillRect(0, 0, 256, 176)
      g.strokeStyle = "#bcbdb5"
      g.lineWidth = 0.6
      for (let x = 0; x < 270; x += 16) {
        g.beginPath()
        g.moveTo(x, 0)
        g.lineTo(x, 176)
        g.stroke()
      }
      g.save()
      g.translate(128, 88)
      g.rotate(t * 0.5)
      g.fillStyle = "#151616"
      g.fillRect(-180, -27, 360, 54)
      g.fillStyle = "#eeeee6"
      g.fillRect(-180, -1, 360, 2)
      g.restore()
      g.strokeStyle = "#f14326"
      g.lineWidth = 13
      for (let k = 0; k < 3; k++) {
        g.beginPath()
        g.ellipse(128 + Math.sin(t) * 35, 88, 108 - k * 27, 69 - k * 11, t, 0, Math.PI * 2)
        g.stroke()
      }
    }
    const frames = Array.from({ length: 32 }, (_, i) => {
      const c = document.createElement("canvas")
      c.width = 256
      c.height = 176
      paintFrame(c.getContext("2d")!, i)
      return c
    })
    const side = document.createElement("canvas"),
      top = document.createElement("canvas")
    side.width = 32
    side.height = 176
    top.width = 256
    top.height = 32
    const sc = side.getContext("2d")!,
      tc = top.getContext("2d")!
    let w = 1,
      h = 1
    const render = () => {
      if (!ctx) {
        return
      }
      for (let i = 0; i < 32; i++) {
        const image = frames[(current.current - i + 32) % 32]
        sc.drawImage(image, 255, 0, 1, 176, i, 0, 1, 176)
        tc.drawImage(image, 0, 0, 256, 1, 0, i, 256, 1)
      }
      ctx.clearRect(0, 0, w, h)
      const scale = Math.min(w / 395, h / 265),
        yaw = angle.current.yaw,
        pitch = angle.current.pitch
      const project = (p: Point3) => {
        const x = p.x * Math.cos(yaw) + p.z * Math.sin(yaw),
          z = -p.x * Math.sin(yaw) + p.z * Math.cos(yaw),
          y = p.y * Math.cos(pitch) - z * Math.sin(pitch)
        return { x: w / 2 + x * scale, y: h / 2 + y * scale, z: p.y * Math.sin(pitch) + z * Math.cos(pitch) }
      }
      const p = [
        [-128, -88, 85],
        [128, -88, 85],
        [128, 88, 85],
        [-128, 88, 85],
        [-128, -88, -85],
        [128, -88, -85],
        [128, 88, -85],
        [-128, 88, -85],
      ].map(([x, y, z]) => project({ x, y, z }))
      const faces = [
        { ids: [0, 1, 2, 3], image: frames[current.current], frame: current.current, shade: 0 },
        {
          ids: [5, 4, 7, 6],
          image: frames[(current.current + 1) % 32],
          frame: (current.current + 1) % 32,
          shade: 0.18,
        },
        { ids: [1, 5, 6, 2], image: side, shade: 0.1 },
        { ids: [4, 0, 3, 7], image: side, shade: 0.18 },
        { ids: [4, 5, 1, 0], image: top, shade: 0.04 },
        { ids: [3, 2, 6, 7], image: top, shade: 0.2 },
      ].sort((a, b) => a.ids.reduce((n, i) => n + p[i].z, 0) - b.ids.reduce((n, i) => n + p[i].z, 0))
      faces.forEach((face) => {
        const [a, b, c, d] = face.ids.map((i) => p[i])
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineTo(c.x, c.y)
        ctx.lineTo(d.x, d.y)
        ctx.closePath()
        ctx.clip()
        ctx.transform(
          (b.x - a.x) / face.image.width,
          (b.y - a.y) / face.image.width,
          (d.x - a.x) / face.image.height,
          (d.y - a.y) / face.image.height,
          a.x,
          a.y,
        )
        if (face.frame !== undefined) {
          paintFrame(ctx, face.frame)
        } else {
          ctx.drawImage(face.image, 0, 0)
        }
        ctx.fillStyle = `rgba(0,0,0,${face.shade})`
        ctx.fillRect(0, 0, face.image.width, face.image.height)
        ctx.restore()
        ctx.strokeStyle = "#eee7"
        ctx.lineWidth = 0.7
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineTo(c.x, c.y)
        ctx.lineTo(d.x, d.y)
        ctx.closePath()
        ctx.stroke()
      })
    }
    draw.current = render
    const resize = () => {
      w = el.clientWidth
      h = el.clientHeight
      const d = Math.min(devicePixelRatio || 1, 2)
      const display = el.getBoundingClientRect()
      el.width = Math.max(1, Math.round(display.width * d))
      el.height = Math.max(1, Math.round(display.height * d))
      ctx.setTransform(el.width / Math.max(1, w), 0, 0, el.height / Math.max(1, h), 0, 0)
      render()
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
    for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", scheduleResize)
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()
    return () => {
      observer.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", scheduleResize)
      cancelAnimationFrame(resizeFrame)
      draw.current = () => {}
      frames.forEach((c) => {
        c.width = 0
        c.height = 0
      })
      side.width = 0
      top.width = 0
    }
  }, [])
  useEffect(() => {
    if (!active || !playing || reduced) {
      return
    }
    let raf = 0,
      last = 0,
      elapsed = 0
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 50) : 0
      last = now
      elapsed += dt
      if (elapsed >= 62.5) {
        elapsed %= 62.5
        current.current = (current.current + 1) % 32
        setFrame(current.current)
        draw.current()
      }
      raf = requestAnimationFrame(tick)
    }
    const visibility = () => {
      cancelAnimationFrame(raf)
      last = 0
      if (!document.hidden) {
        raf = requestAnimationFrame(tick)
      }
    }
    visibility()
    document.addEventListener("visibilitychange", visibility)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [active, playing, reduced])
  function orbit(yaw: number, pitch: number) {
    angle.current = { yaw: Math.max(-1.1, Math.min(1.1, yaw)), pitch: Math.max(-0.7, Math.min(0.7, pitch)) }
    draw.current()
  }
  return (
    <section className="sf-temporal-volume">
      <canvas
        ref={canvas}
        tabIndex={0}
        role="img"
        aria-label="A volume of 32 original motion frames. Drag to orbit, or use arrow keys."
        onPointerDown={(e) => {
          if (e.button !== 0 || !e.isPrimary || drag.current) {
            return
          }
          drag.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, ...angle.current }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (d?.pointerId === e.pointerId) {
            const rect = e.currentTarget.getBoundingClientRect()
            const dx = ((e.clientX - d.x) * e.currentTarget.clientWidth) / rect.width
            const dy = ((e.clientY - d.y) * e.currentTarget.clientHeight) / rect.height
            orbit(d.yaw + dx * 0.006, d.pitch - dy * 0.006)
          }
        }}
        onPointerUp={(e) => {
          if (drag.current?.pointerId !== e.pointerId) {
            return
          }
          drag.current = null
        }}
        onPointerCancel={(e) => {
          const d = drag.current
          if (d?.pointerId !== e.pointerId) {
            return
          }
          orbit(d.yaw, d.pitch)
          drag.current = null
        }}
        onLostPointerCapture={(e) => {
          if (drag.current?.pointerId !== e.pointerId) {
            return
          }
          drag.current = null
        }}
        onKeyDown={(e) => {
          const a = angle.current
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-0.06, 0],
            ArrowRight: [0.06, 0],
            ArrowUp: [0, 0.06],
            ArrowDown: [0, -0.06],
          }
          if (moves[e.key]) {
            e.preventDefault()
            orbit(a.yaw + moves[e.key][0], a.pitch + moves[e.key][1])
          }
          if (e.key === "Home") {
            e.preventDefault()
            orbit(-0.56, 0.35)
          }
        }}
      />
      <footer>
        <button
          type="button"
          aria-label={playing ? "Pause frames" : "Play frames"}
          aria-pressed={playing}
          disabled={reduced}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? "Ⅱ" : "▷"}
        </button>
        <label>
          Frame
          <input
            aria-label="Frame"
            type="range"
            min="0"
            max="31"
            value={frame}
            onChange={(e) => {
              current.current = +e.target.value
              setFrame(current.current)
              draw.current()
            }}
          />
        </label>
        <output>{String(frame + 1).padStart(2, "0")} / 32</output>
      </footer>
      <style>{`.sf-temporal-volume{width:100%;height:100%;min-height:280px;position:relative;overflow:hidden;background:#161919;color:#e9e9e3;box-sizing:border-box;font-family:Arial,sans-serif}.sf-temporal-volume *{box-sizing:border-box}.sf-temporal-volume canvas{position:absolute;top:0;left:0;width:100%;height:calc(100% - 63px);touch-action:none;cursor:grab}.sf-temporal-volume canvas:active{cursor:grabbing}.sf-temporal-volume footer{position:absolute;left:24px;right:24px;bottom:12px;height:44px;border-top:1px solid #ffffff28;display:flex;align-items:center;gap:14px}.sf-temporal-volume button{width:44px;height:44px;flex:none;background:none;color:inherit;border:0;font-size:21px;cursor:pointer}.sf-temporal-volume button:disabled{opacity:.35;cursor:default}.sf-temporal-volume label{font:10px monospace;display:flex;align-items:center;gap:12px;flex:1;min-width:0}.sf-temporal-volume input{min-width:0;width:100%;height:44px;accent-color:#f14326;margin:0}.sf-temporal-volume output{font:9px monospace;flex:none;min-width:40px;font-variant-numeric:tabular-nums}.sf-temporal-volume :focus-visible{outline:2px solid #f14326;outline-offset:-3px}`}</style>
    </section>
  )
}
