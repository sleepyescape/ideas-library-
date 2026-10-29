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
export default function ScrollTurntable({ active = true }: { active?: boolean }) {
  const scroll = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    frames = useRef(new Map<number, HTMLCanvasElement>()),
    [frame, setFrame] = useState(2),
    [density, setDensity] = useState(1)
  useEffect(() => {
    const element = canvas.current!
    let pending = 0
    const measure = () => {
      const bounds = element.getBoundingClientRect()
      const next = Math.min(bounds.width / 520, bounds.height / 430) * Math.min(devicePixelRatio, 2)
      setDensity(Math.max(1, Math.ceil(next * 20) / 20))
    }
    const schedule = () => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(() => {
        pending = requestAnimationFrame(measure)
      })
    }
    const resize = new ResizeObserver(schedule)
    resize.observe(element)
    const transforms = new MutationObserver(schedule)
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", schedule)
    measure()
    return () => {
      resize.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(pending)
    }
  }, [])
  useEffect(() => {
    // Cache only requested views at the current display density. Rendering all 32
    // high-resolution views on mount blocks the first interaction unnecessarily.
    const cachedFrames = frames.current
    cachedFrames.clear()
    return () => {
      cachedFrames.forEach((cached) => {
        cached.width = 0
        cached.height = 0
      })
      cachedFrames.clear()
    }
  }, [density])
  useEffect(() => {
    const output = canvas.current
    if (!output) {
      return
    }
    let c = frames.current.get(frame)
    if (!c) {
      const n = frame
      c = document.createElement("canvas")
      c.width = Math.round(520 * density)
      c.height = Math.round(430 * density)
      const g = c.getContext("2d")!
      g.setTransform(c.width / 520, 0, 0, c.height / 430, 0, 0)
      g.fillStyle = "#e76623"
      g.fillRect(0, 0, 520, 430)
      const a = (n / 32) * Math.PI * 2,
        ca = Math.cos(a),
        sa = Math.sin(a)
      const project = (x: number, y: number, z: number) => ({
        x: 260 + (x * ca + z * sa) * 1.24,
        y: 218 + y * 1.24 + (z * ca - x * sa) * 0.22,
      })
      g.save()
      g.translate(260, 359)
      g.scale(1, 0.17)
      const shadow = g.createRadialGradient(0, 0, 15, 0, 0, 150)
      shadow.addColorStop(0, "#59221080")
      shadow.addColorStop(1, "#59221000")
      g.fillStyle = shadow
      g.fillRect(-160, -160, 320, 320)
      g.restore()
      type V = { x: number; y: number; z: number }
      const faces: { points: V[]; depth: number; light: number }[] = []
      const knots = [
        [-117, 31],
        [-111, 32],
        [-91, 33],
        [-71, 37],
        [-54, 47],
        [-34, 63],
        [-10, 75],
        [20, 82],
        [48, 80],
        [74, 72],
        [96, 60],
        [109, 52],
        [113, 50],
      ]
      const profile: number[][] = []
      for (let i = 0; i < knots.length - 1; i++) {
        for (let k = 0; k < 5; k++) {
          const t = k / 5,
            t2 = t * t,
            t3 = t2 * t
          const a = knots[Math.max(0, i - 1)],
            b = knots[i],
            c = knots[i + 1],
            d = knots[Math.min(knots.length - 1, i + 2)]
          profile.push([
            b[0] + (c[0] - b[0]) * t,
            0.5 *
              (2 * b[1] +
                (-a[1] + c[1]) * t +
                (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * t2 +
                (-a[1] + 3 * b[1] - 3 * c[1] + d[1]) * t3),
          ])
        }
      }
      profile.push(knots[knots.length - 1])
      const count = 96
      const depth = (v: V) => v.z * ca - v.x * sa - v.y * 0.17
      const addFace = (points: V[], nx: number, ny: number, nz: number) => {
        const cameraX = nx * ca + nz * sa,
          cameraZ = nz * ca - nx * sa
        const length = Math.hypot(nx, ny, nz) || 1
        const diffuse = Math.max(0, (-cameraX * 0.52 - ny * 0.3 + cameraZ * 0.75) / length)
        const specular = Math.pow(Math.max(0, (-cameraX * 0.32 - ny * 0.15 + cameraZ * 0.93) / length), 15) * 0.13
        faces.push({
          points,
          depth: points.reduce((sum, v) => sum + depth(v), 0) / points.length,
          light: 0.53 + diffuse * 0.36 + specular,
        })
      }
      for (let row = 0; row < profile.length - 1; row++) {
        const [y0, r0] = profile[row],
          [y1, r1] = profile[row + 1]
        for (let j = 0; j < count; j++) {
          const t0 = (j / count) * Math.PI * 2,
            t1 = ((j + 1) / count) * Math.PI * 2,
            mid = (t0 + t1) / 2
          const vertex = (t: number, y: number, r: number): V => ({ x: Math.cos(t) * r, y, z: Math.sin(t) * r })
          addFace(
            [vertex(t0, y0, r0), vertex(t1, y0, r0), vertex(t1, y1, r1), vertex(t0, y1, r1)],
            Math.cos(mid),
            -(r1 - r0) / (y1 - y0),
            Math.sin(mid),
          )
        }
      }
      // The handle belongs to the same mesh and lighting field as the vessel.
      for (let j = 0; j < 64; j++) {
        for (let k = 0; k < 12; k++) {
          const t0 = (j / 64) * Math.PI * 2,
            t1 = ((j + 1) / 64) * Math.PI * 2
          const p0 = (k / 12) * Math.PI * 2,
            p1 = ((k + 1) / 12) * Math.PI * 2
          const vertex = (t: number, p: number): V => ({
            x: 58 + Math.cos(t) * (43 + Math.cos(p) * 8),
            y: -24 + Math.sin(t) * (68 + Math.cos(p) * 8),
            z: Math.sin(p) * 8,
          })
          const t = (t0 + t1) / 2,
            p = (p0 + p1) / 2
          addFace(
            [vertex(t0, p0), vertex(t1, p0), vertex(t1, p1), vertex(t0, p1)],
            Math.cos(t) * Math.cos(p),
            Math.sin(t) * Math.cos(p),
            Math.sin(p),
          )
        }
      }
      faces.sort((a, b) => a.depth - b.depth)
      for (const face of faces) {
        g.beginPath()
        face.points.forEach((v, i) => {
          const p = project(v.x, v.y, v.z)
          i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)
        })
        g.closePath()
        const l = face.light
        g.fillStyle = `rgb(${Math.round(245 * l)},${Math.round(235 * l)},${Math.round(210 * l)})`
        g.fill()
        g.strokeStyle = g.fillStyle
        g.lineWidth = 0.6
        g.stroke()
      }
      // A shallow elliptical opening makes the thickness of the ceramic legible.
      for (const [radius, color] of [
        [32, "#e2d7ba"],
        [24, "#635b44"],
      ] as const) {
        g.beginPath()
        for (let j = 0; j <= 64; j++) {
          const t = (j / 64) * Math.PI * 2,
            p = project(Math.cos(t) * radius, -117, Math.sin(t) * radius)
          j ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)
        }
        g.closePath()
        g.fillStyle = color
        g.fill()
      }
      frames.current.set(frame, c)
      if (frames.current.size > 8) {
        const oldest = frames.current.keys().next().value!
        const released = frames.current.get(oldest)!
        released.width = 0
        released.height = 0
        frames.current.delete(oldest)
      }
    }
    // Keep recently visited views warm without retaining 32 full-density bitmaps.
    frames.current.delete(frame)
    frames.current.set(frame, c)
    if (output.width !== c.width) {
      output.width = c.width
    }
    if (output.height !== c.height) {
      output.height = c.height
    }
    const outputContext = output.getContext("2d")
    outputContext?.clearRect(0, 0, output.width, output.height)
    outputContext?.drawImage(c, 0, 0)
  }, [frame, density])
  useEffect(() => {
    const el = scroll.current
    if (el) {
      el.scrollTop = (2 / 31) * (el.scrollHeight - el.clientHeight)
    }
  }, [])
  const seek = (n: number) => {
    if (!active) {
      return
    }
    const i = Math.max(0, Math.min(31, n))
    setFrame(i)
    const el = scroll.current!
    el.scrollTop = (i / 31) * (el.scrollHeight - el.clientHeight)
  }
  return (
    <section className="sf-scroll-turntable" data-active={active} inert={!active}>
      <header>
        <b>FORM 08</b>
        <span>Stoneware / chalk</span>
      </header>
      <div
        className="st-scroll"
        ref={scroll}
        tabIndex={0}
        aria-label="Scroll to inspect all 32 views of the ceramic object"
        onScroll={(e) => {
          if (!active) {
            return
          }
          const t = e.currentTarget
          setFrame(
            Math.max(0, Math.min(31, Math.round((t.scrollTop / Math.max(1, t.scrollHeight - t.clientHeight)) * 31))),
          )
        }}
      >
        <div className="st-track">
          <div className="st-pinned">
            <canvas ref={canvas} role="img" aria-label={`Ceramic vessel, view ${frame + 1} of 32`} />
          </div>
        </div>
      </div>
      <footer>
        <button type="button" aria-label="Previous frame" onClick={() => seek(frame - 1)} disabled={frame === 0}>
          ←
        </button>
        <label>
          <input
            aria-label="Product view frame"
            type="range"
            min="0"
            max="31"
            value={frame}
            onChange={(e) => seek(Number(e.target.value))}
          />
        </label>
        <output>{String(frame + 1).padStart(2, "0")} / 32</output>
        <button type="button" aria-label="Next frame" onClick={() => seek(frame + 1)} disabled={frame === 31}>
          →
        </button>
      </footer>
      <style>{`.sf-scroll-turntable{width:100%;height:100%;position:relative;background:#e76623;color:#392518;overflow:hidden;font-family:Arial,sans-serif;display:flex;flex-direction:column}.sf-scroll-turntable header{position:absolute;left:20px;right:20px;top:18px;display:flex;justify-content:space-between;z-index:2;pointer-events:none;font-size:10px}.sf-scroll-turntable header b{font-size:11px;letter-spacing:.08em}.st-scroll{flex:1;min-height:0;overflow:auto;scrollbar-width:none;overscroll-behavior-y:contain;outline-offset:-4px}.st-scroll::-webkit-scrollbar{display:none}.st-track{height:800%;position:relative}.st-pinned{position:sticky;top:0;height:calc(100cqh - 52px);display:flex;align-items:center;justify-content:center;overflow:hidden}.st-pinned canvas{height:100%;width:100%;object-fit:contain;display:block}.sf-scroll-turntable footer{height:52px;flex-shrink:0;display:flex;align-items:center;gap:12px;padding:0 14px;box-sizing:border-box;border-top:1px solid #562e1925}.sf-scroll-turntable footer button{width:40px;height:40px;background:none;border:0;font:20px Arial;color:inherit;cursor:pointer}.sf-scroll-turntable button:disabled{opacity:.25;cursor:default}.sf-scroll-turntable label{flex:1;min-width:0}.sf-scroll-turntable input{width:100%;height:32px;accent-color:#35291b}.sf-scroll-turntable output{font:10px monospace;white-space:nowrap}.sf-scroll-turntable{container-type:size}`}</style>
    </section>
  )
}
