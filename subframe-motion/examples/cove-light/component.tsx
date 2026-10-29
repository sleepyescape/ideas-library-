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

type Segment = { x: number; y: number; tx: number; ty: number; z: number; phase: number; lane: number }

export default function LightWeave({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    time = useRef(0),
    value = useRef(0.58),
    paintNow = useRef<() => void>(() => {})
  const drag = useRef<{ id: number; x: number; before: number; width: number; target: HTMLCanvasElement } | null>(null)
  const [twist, setTwist] = useState(0.58),
    [playing, setPlaying] = useState(true),
    [reduced, setReduced] = useState(true)
  const running = useRef(false)
  running.current = active && playing && !reduced
  const change = (next: number) => {
    value.current = Math.max(0, Math.min(1, next))
    setTwist(value.current)
    paintNow.current()
  }
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)"),
      sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    if (!active && drag.current) {
      const d = drag.current
      drag.current = null
      change(d.before)
      if (d.target.hasPointerCapture(d.id)) {
        d.target.releasePointerCapture(d.id)
      }
    }
    paintNow.current()
  }, [active, playing, reduced])
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d")
    if (!el || !ctx) {
      return
    }
    let w = 1,
      h = 1,
      frame = 0,
      last = 0,
      previousBend = -1,
      segments: Segment[] = []
    const geometry = () => {
      const project = (a: number, lane: number) => {
        const u = (lane / 31 - 0.5) * 1.05,
          bend = value.current * Math.PI
        const radial = 1.32 + u * Math.cos(bend * Math.sin(a))
        let x = radial * Math.cos(a),
          y = radial * Math.sin(a),
          z = u * Math.sin(bend * Math.sin(a))
        const py = y * 0.47 - z * 0.883,
          pz = y * 0.883 + z * 0.47
        y = py
        z = pz
        const rx = x * 0.94 - y * 0.342,
          ry = x * 0.342 + y * 0.94
        x = rx
        y = ry
        const scale = (Math.min(w * 0.205, h * 0.49) * 4.8) / (4.8 - z)
        return { x: w * 0.5 + x * scale, y: h * 0.43 + y * scale, z }
      }
      segments = []
      for (let lane = 0; lane < 32; lane++) {
        for (let j = 0; j < 144; j++) {
          const a = (j / 144) * Math.PI * 2,
            p = project(a, lane),
            q = project(((j + 1) / 144) * Math.PI * 2, lane)
          segments.push({ x: p.x, y: p.y, tx: q.x, ty: q.y, z: (p.z + q.z) / 2, phase: a, lane })
        }
      }
      segments.sort((a, b) => a.z - b.z)
      previousBend = value.current
    }
    const paint = () => {
      if (previousBend !== value.current) {
        geometry()
      }
      ctx.fillStyle = "#140f13"
      ctx.fillRect(0, 0, w, h)
      const halo = ctx.createRadialGradient(w * 0.5, h * 0.53, 0, w * 0.5, h * 0.53, w * 0.38)
      halo.addColorStop(0, "#8c372016")
      halo.addColorStop(1, "#140f1300")
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, w, h)
      ctx.lineCap = "round"
      for (const s of segments) {
        const pulse = Math.pow(Math.max(0, Math.cos(s.phase * 2 - time.current * 1.1 - s.lane * 0.105)), 18)
        const face = 0.3 + ((s.z + 1.6) / 3.2) * 0.7,
          intensity = pulse * face
        const hot = s.lane % 8 < 3
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.tx, s.ty)
        ctx.lineWidth = Math.max(0.45, (w / 600) * (0.65 + intensity * 0.85))
        ctx.strokeStyle = hot
          ? `rgba(255,${Math.round(119 + intensity * 119)},${Math.round(79 + intensity * 143)},${
              0.13 + intensity * 0.87
            })`
          : `rgba(244,239,221,${0.12 + intensity * 0.84})`
        ctx.shadowBlur = intensity > 0.55 ? 5 * intensity : 0
        ctx.shadowColor = hot ? "#ff6945" : "#ffedc6"
        ctx.stroke()
      }
      ctx.shadowBlur = 0
    }
    const tick = (now: number) => {
      frame = 0
      if (last) {
        time.current += Math.min(40, now - last) / 1000
      }
      last = now
      paint()
      if (running.current && !document.hidden) {
        frame = requestAnimationFrame(tick)
      }
    }
    const draw = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
      paint()
      if (running.current && !document.hidden) {
        frame = requestAnimationFrame(tick)
      }
    }
    const resize = () => {
      const box = el.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio || 1, 2)
      w = el.clientWidth
      h = el.clientHeight
      if (!w || !h) {
        return
      }
      el.width = Math.max(1, Math.round(box.width * dpr))
      el.height = Math.max(1, Math.round(box.height * dpr))
      ctx.setTransform(el.width / w, 0, 0, el.height / h, 0, 0)
      previousBend = -1
      draw()
    }
    let resizeFrame = 0
    const queueResize = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    }
    const size = new ResizeObserver(resize),
      transforms = new MutationObserver(queueResize)
    size.observe(el)
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    paintNow.current = draw
    resize()
    document.addEventListener("visibilitychange", draw)
    window.addEventListener("resize", queueResize)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      size.disconnect()
      transforms.disconnect()
      document.removeEventListener("visibilitychange", draw)
      window.removeEventListener("resize", queueResize)
      paintNow.current = () => {}
    }
  }, [])
  const cancel = () => {
    if (drag.current) {
      const d = drag.current
      drag.current = null
      change(d.before)
      if (d.target.hasPointerCapture(d.id)) {
        d.target.releasePointerCapture(d.id)
      }
    }
  }
  return (
    <section className="sf-light-weave">
      <canvas
        ref={canvas}
        role="img"
        tabIndex={0}
        aria-label="Woven light loop. Drag horizontally or use arrow keys to twist."
        onPointerDown={(e) => {
          if (e.button !== 0 || !active) {
            return
          }
          drag.current = {
            id: e.pointerId,
            x: e.clientX,
            before: value.current,
            width: e.currentTarget.getBoundingClientRect().width,
            target: e.currentTarget,
          }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (d?.id === e.pointerId) {
            change(d.before + ((e.clientX - d.x) / d.width) * 1.5)
          }
        }}
        onPointerUp={(e) => {
          if (drag.current?.id !== e.pointerId) {
            return
          }
          drag.current = null
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
        }}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            cancel()
            return
          }
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault()
            change(e.key === "Home" ? 0 : e.key === "End" ? 1 : value.current + (e.key === "ArrowRight" ? 0.05 : -0.05))
          }
        }}
      />
      <footer>
        <label>
          Twist{" "}
          <input
            type="range"
            aria-label="Ribbon twist"
            min="0"
            max="1"
            step=".01"
            value={twist}
            onChange={(e) => change(Number(e.target.value))}
          />
          <output>{Math.round(twist * 180)}°</output>
        </label>
        <button
          type="button"
          disabled={reduced || !active}
          aria-label={playing ? "Pause light" : "Play light"}
          aria-pressed={playing}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7 5v10M13 5v10" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m7 4 9 6-9 6z" />
            </svg>
          )}
        </button>
      </footer>
      <style>{`.sf-light-weave{width:100%;height:100%;container-type:size;position:relative;overflow:hidden;background:#140f13;color:#dbbbae;font:11px Arial,sans-serif}.sf-light-weave canvas{display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y;outline-offset:-6px}.sf-light-weave canvas:active{cursor:grabbing}.sf-light-weave footer{position:absolute;bottom:9px;left:26px;right:20px;display:flex;align-items:center;justify-content:space-between;pointer-events:none}.sf-light-weave label{display:flex;align-items:center;gap:14px;pointer-events:auto}.sf-light-weave input{width:clamp(70px,20cqw,130px);height:44px;accent-color:#ed9675;cursor:ew-resize}.sf-light-weave output{font:10px monospace;width:32px;color:#a58580}.sf-light-weave button{width:44px;height:44px;display:grid;place-items:center;border:1px solid #72504866;border-radius:50%;background:#140f1388;color:#edcab8;cursor:pointer;pointer-events:auto}.sf-light-weave svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.5}.sf-light-weave button:active{background:#553229}.sf-light-weave button:disabled{opacity:.35;cursor:default}.sf-light-weave :focus-visible{outline:2px solid #fab392;outline-offset:3px}.sf-light-weave canvas:focus-visible{outline-offset:-6px}`}</style>
    </section>
  )
}
