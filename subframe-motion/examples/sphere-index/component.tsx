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

function useReduced() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(q.matches)
    sync()
    q.addEventListener("change", sync)
    return () => q.removeEventListener("change", sync)
  }, [])
  return reduced
}

const works = [
  ["/motion/assets/fuji-storm.webp", "Below the summit"],
  ["/motion/assets/suruga-wind.webp", "Suruga wind"],
  ["/motion/assets/plum-garden.webp", "Plum garden"],
  ["/motion/assets/tulip-print.webp", "Tulip"],
  ["/motion/assets/mediterranean-clouds.webp", "Cloudy sky"],
  ["/motion/assets/fern-diptych.webp", "Fern study"],
]
type P = { x: number; y: number; z: number }
export default function SphereIndex({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [selected, setSelected] = useState<number | null>(null),
    [front, setFront] = useState(0),
    reduced = useReduced(),
    live = useRef({ active, reduced }),
    control = useRef<{
      rotate: (dx: number, dy: number) => void
      open: () => void
      close: () => void
      stop: () => void
      wake: () => void
    } | null>(null)
  live.current = { active, reduced }
  useEffect(() => {
    const c = canvas.current!,
      ctx = c.getContext("2d")
    if (!ctx) {
      return
    }
    const tileCanvas = document.createElement("canvas"),
      tileContext = tileCanvas.getContext("2d")!
    let w = 600,
      h = 280,
      yaw = 0.35,
      pitch = -0.05,
      raf = 0,
      last = 0,
      amount = 0,
      target = 0,
      chosen = -1,
      nearest = 0,
      dead = false
    const images = works.map(([file]) => {
      const im = new Image()
      im.src = file
      im.onload = () => {
        if (!dead) {
          paint()
        }
      }
      return im
    })
    let bounds: { i: number; points: P[]; depth: number }[] = []
    const tiles = Array.from({ length: 18 }, (_, i) => ({
      i,
      lon: ((i % 6) / 6) * Math.PI * 2,
      lat: (Math.floor(i / 6) - 1) * 0.64,
      image: (i + Math.floor(i / 6) * 2) % 6,
    }))
    const point = (lon: number, lat: number): P => {
      const x = Math.sin(lon + yaw) * Math.cos(lat),
        y = Math.sin(lat),
        z = Math.cos(lon + yaw) * Math.cos(lat),
        yy = y * Math.cos(pitch) - z * Math.sin(pitch),
        zz = y * Math.sin(pitch) + z * Math.cos(pitch),
        r = Math.min(w * 0.32, h * 0.46),
        s = 1 / (1 - zz * 0.12)
      return { x: w * 0.5 + x * r * s, y: h * 0.5 - yy * r * s, z: zz }
    }
    const triangle = (
      im: HTMLImageElement,
      a: P,
      b: P,
      d: P,
      sa: { x: number; y: number },
      sb: { x: number; y: number },
      sd: { x: number; y: number },
    ) => {
      const den = sa.x * (sb.y - sd.y) + sb.x * (sd.y - sa.y) + sd.x * (sa.y - sb.y)
      if (Math.abs(den) < 0.001) {
        return
      }
      const aa = (a.x * (sb.y - sd.y) + b.x * (sd.y - sa.y) + d.x * (sa.y - sb.y)) / den,
        bb = (a.y * (sb.y - sd.y) + b.y * (sd.y - sa.y) + d.y * (sa.y - sb.y)) / den,
        cc = (a.x * (sd.x - sb.x) + b.x * (sa.x - sd.x) + d.x * (sb.x - sa.x)) / den,
        dd = (a.y * (sd.x - sb.x) + b.y * (sa.x - sd.x) + d.y * (sb.x - sa.x)) / den,
        ee =
          (a.x * (sb.x * sd.y - sd.x * sb.y) + b.x * (sd.x * sa.y - sa.x * sd.y) + d.x * (sa.x * sb.y - sb.x * sa.y)) /
          den,
        ff =
          (a.y * (sb.x * sd.y - sd.x * sb.y) + b.y * (sd.x * sa.y - sa.x * sd.y) + d.y * (sa.x * sb.y - sb.x * sa.y)) /
          den
      tileContext.save()
      tileContext.beginPath()
      const cx = (a.x + b.x + d.x) / 3,
        cy = (a.y + b.y + d.y) / 3
      const edge = (v: P) => {
        const dx = v.x - cx,
          dy = v.y - cy,
          length = Math.hypot(dx, dy) || 1
        return { x: v.x + (dx / length) * 0.6, y: v.y + (dy / length) * 0.6 }
      }
      const ca = edge(a),
        cb = edge(b),
        cd = edge(d)
      tileContext.moveTo(ca.x, ca.y)
      tileContext.lineTo(cb.x, cb.y)
      tileContext.lineTo(cd.x, cd.y)
      tileContext.closePath()
      tileContext.clip()
      tileContext.transform(aa, bb, cc, dd, ee, ff)
      tileContext.drawImage(im, 0, 0)
      tileContext.restore()
    }
    const paint = () => {
      if (dead) {
        return
      }
      ctx.clearRect(0, 0, w, h)
      bounds = []
      let best = -1
      const sorted = tiles
        .map((t) => ({ ...t, depth: point(t.lon, t.lat).z }))
        .filter((t) => t.depth > -0.15)
        .sort((a, b) => a.depth - b.depth)
      for (const tile of sorted) {
        const image = images[tile.image]
        if (!image.complete || !image.naturalWidth) {
          continue
        }
        const center = point(tile.lon, tile.lat)
        if (center.z > best) {
          best = center.z
          nearest = tile.i
        }
        const focused = chosen === tile.i,
          fade = focused ? 1 : 1 - amount
        ctx.globalAlpha = Math.max(0, Math.min(1, (tile.depth + 0.15) * 1.5)) * fade
        if (ctx.globalAlpha < 0.01) {
          continue
        }
        const halfLon = 0.42,
          halfLat = 0.25
        const project = (u: number, v: number) => {
          const p = point(tile.lon + (u - 0.5) * halfLon * 2, tile.lat + (0.5 - v) * halfLat * 2)
          if (!focused) {
            return p
          }
          const aspect = image.naturalWidth / image.naturalHeight,
            hh = Math.min(h * 0.88, (w * 0.72) / aspect),
            ww = hh * aspect
          return {
            x: p.x * (1 - amount) + (w / 2 + (u - 0.5) * ww) * amount,
            y: p.y * (1 - amount) + (h / 2 + (v - 0.5) * hh) * amount,
            z: p.z,
          }
        }
        // Compose each opaque mesh once so translucent edge tiles do not reveal overlapping triangle seams.
        tileContext.clearRect(0, 0, w, h)
        for (let y = 0; y < 4; y++) {
          for (let x = 0; x < 4; x++) {
            const u = x / 4,
              v = y / 4,
              u1 = (x + 1) / 4,
              v1 = (y + 1) / 4,
              a = project(u, v),
              b = project(u1, v),
              d = project(u, v1),
              e = project(u1, v1),
              sa = { x: u * image.naturalWidth, y: v * image.naturalHeight },
              sb = { x: u1 * image.naturalWidth, y: v * image.naturalHeight },
              sd = { x: u * image.naturalWidth, y: v1 * image.naturalHeight },
              se = { x: u1 * image.naturalWidth, y: v1 * image.naturalHeight }
            triangle(image, a, b, d, sa, sb, sd)
            triangle(image, b, e, d, sb, se, sd)
          }
        }
        ctx.drawImage(tileCanvas, 0, 0, w, h)
        const outline = [project(0, 0), project(1, 0), project(1, 1), project(0, 1)]
        ctx.strokeStyle = "#eee2ea66"
        ctx.lineWidth = 0.5
        ctx.beginPath()
        outline.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        ctx.closePath()
        ctx.stroke()
        bounds.push({ i: tile.i, points: outline, depth: tile.depth })
      }
      ctx.globalAlpha = 1
      setFront(tiles[nearest].image)
    }
    const tick = (time: number) => {
      raf = 0
      if (!live.current.active || live.current.reduced || document.hidden) {
        return
      }
      const dt = Math.min(40, time - last || 16)
      last = time
      amount += (target - amount) * (1 - Math.exp(-dt / 75))
      if (Math.abs(target - amount) < 0.001) {
        amount = target
      }
      paint()
      if (amount !== target) {
        raf = requestAnimationFrame(tick)
      }
    }
    const wake = () => {
      if (!live.current.active || live.current.reduced) {
        amount = target
        paint()
        return
      }
      if (!raf && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const open = (i = nearest) => {
      chosen = i
      target = 1
      setSelected(tiles[i].image)
      wake()
    }
    const close = () => {
      target = 0
      setSelected(null)
      wake()
    }
    const resize = () => {
      w = c.clientWidth
      h = c.clientHeight
      const d = Math.min(devicePixelRatio || 1, 2)
      const display = c.getBoundingClientRect()
      c.width = Math.max(1, Math.round(display.width * d))
      c.height = Math.max(1, Math.round(display.height * d))
      ctx.setTransform(c.width / Math.max(1, w), 0, 0, c.height / Math.max(1, h), 0, 0)
      tileCanvas.width = c.width
      tileCanvas.height = c.height
      tileContext.setTransform(ctx.getTransform())
      ctx.imageSmoothingQuality = "high"
      tileContext.imageSmoothingQuality = "high"
      paint()
    }
    let drag: { id: number; x: number; y: number; yaw: number; pitch: number; moved: boolean } | null = null
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || target === 1) {
        return
      }
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw, pitch, moved: false }
      c.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) {
        return
      }
      const rect = c.getBoundingClientRect()
      const dx = ((e.clientX - drag.x) / rect.width) * w,
        dy = ((e.clientY - drag.y) / rect.height) * h
      if (Math.hypot(dx, dy) > 4) {
        drag.moved = true
      }
      yaw = drag.yaw + dx * 0.007
      pitch = Math.max(-0.8, Math.min(0.8, drag.pitch + dy * 0.006))
      paint()
    }
    const up = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) {
        return
      }
      const d = drag
      drag = null
      if (e.type === "pointercancel") {
        yaw = d.yaw
        pitch = d.pitch
        paint()
        return
      }
      if (!d.moved) {
        const r = c.getBoundingClientRect(),
          x = ((e.clientX - r.left) / r.width) * w,
          y = ((e.clientY - r.top) / r.height) * h
        const hit = [...bounds].reverse().find((b) => {
          let inside = false
          for (let i = 0, j = 3; i < 4; j = i++) {
            const a = b.points[i],
              d = b.points[j]
            if (a.y > y !== d.y > y && x < ((d.x - a.x) * (y - a.y)) / (d.y - a.y) + a.x) {
              inside = !inside
            }
          }
          return inside
        })
        if (hit) {
          open(hit.i)
        }
      }
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
    for (let ancestor = c.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", scheduleResize)
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    resize()
    c.addEventListener("pointerdown", down)
    c.addEventListener("pointermove", move)
    c.addEventListener("pointerup", up)
    c.addEventListener("pointercancel", up)
    const visibility = () => (document.hidden ? stop() : wake())
    document.addEventListener("visibilitychange", visibility)
    control.current = {
      rotate: (dx, dy) => {
        if (target === 1) {
          return
        }
        yaw += dx
        pitch = Math.max(-0.8, Math.min(0.8, pitch + dy))
        paint()
      },
      open,
      close,
      stop,
      wake,
    }
    return () => {
      dead = true
      stop()
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", scheduleResize)
      cancelAnimationFrame(resizeFrame)
      c.removeEventListener("pointerdown", down)
      c.removeEventListener("pointermove", move)
      c.removeEventListener("pointerup", up)
      c.removeEventListener("pointercancel", up)
      document.removeEventListener("visibilitychange", visibility)
      control.current = null
    }
  }, [])
  useEffect(() => {
    if (active && !reduced) {
      control.current?.wake()
    } else {
      control.current?.stop()
    }
  }, [active, reduced])
  return (
    <section className="sf-sphere-index" inert={!active}>
      <header>
        <b>WORLD / INDEX</b>
        <span>Six works</span>
      </header>
      <canvas
        ref={canvas}
        tabIndex={0}
        role="img"
        aria-label="Spherical image index. Drag or use arrows to orbit. Enter opens front image; Escape returns."
        onKeyDown={(e) => {
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.key)) {
            e.preventDefault()
            if (e.key === "Enter") {
              control.current?.open()
            } else if (e.key === "Escape") {
              control.current?.close()
            } else {
              control.current?.rotate(
                e.key === "ArrowLeft" ? -0.2 : e.key === "ArrowRight" ? 0.2 : 0,
                e.key === "ArrowUp" ? -0.15 : e.key === "ArrowDown" ? 0.15 : 0,
              )
            }
          }
        }}
      />
      <footer>
        <span>{works[selected ?? front][1]}</span>
        <button type="button" onClick={() => (selected === null ? control.current?.open() : control.current?.close())}>
          {selected === null ? "View ↗" : "Return ↙"}
        </button>
      </footer>
      <style>{`.sf-sphere-index{width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;background:#211920;color:#f1e9e9;font-family:Arial,sans-serif;overflow:hidden}.sf-sphere-index header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 0;font-size:9px;height:22px;flex-shrink:0}.sf-sphere-index header b{font-size:10px;letter-spacing:.08em}.sf-sphere-index header span{color:#b3a4b0}.sf-sphere-index canvas{display:block;flex:1;width:100%;min-height:0;touch-action:none;cursor:grab}.sf-sphere-index canvas:active{cursor:grabbing}.sf-sphere-index footer{height:45px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 20px}.sf-sphere-index footer>span{font:italic 16px Georgia;color:#e5d8e2}.sf-sphere-index button{border:0;background:none;color:#e5d8e2;min-height:44px;padding:0 3px;font:10px Arial;cursor:pointer}.sf-sphere-index canvas:focus-visible,.sf-sphere-index button:focus-visible{outline:2px solid #e9abc1;outline-offset:-3px}`}</style>
    </section>
  )
}
