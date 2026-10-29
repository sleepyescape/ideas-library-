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

type Disk = { x: number; y: number; vx: number; vy: number; r: number; angle: number; spin: number }
const marks = [
  ["#f14724", "#fff5d0", "NORTH"],
  ["#194df1", "#fff", "↗"],
  ["#f3d331", "#171c2c", "RUN"],
  ["#f2f1e6", "#191b22", "08"],
  ["#131f40", "#f0f5da", "SIDE B"],
  ["#ed474a", "#fff", "↗"],
  ["#d6dede", "#131f40", "MILE"],
  ["#fff5ca", "#df3b21", "GO"],
]
export default function StickerGravity({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [playing, setPlaying] = useState(true),
    [selected, setSelected] = useState(0),
    reduced = useReduced(),
    live = useRef({ active, playing, reduced }),
    control = useRef<{
      wake: () => void
      stop: () => void
      reset: () => void
      move: (dx: number, dy: number) => void
      select: (index: number) => void
    } | null>(null)
  live.current = { active, playing, reduced }
  useEffect(() => {
    const c = canvas.current!,
      ctx = c.getContext("2d")
    if (!ctx) {
      return
    }
    let w = 600,
      h = 300,
      raf = 0,
      last = 0,
      accumulator = 0,
      settledFrames = 0,
      disks: Disk[] = [],
      held = -1,
      pointer = -1,
      grab = { x: 0, y: 0 },
      before: Disk | null = null,
      chosen = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < disks.length; i++) {
        const d = disks[i],
          m = marks[i]
        ctx.save()
        ctx.translate(d.x, d.y)
        ctx.rotate(d.angle)
        ctx.shadowColor = "#19342525"
        ctx.shadowBlur = 3
        ctx.shadowOffsetY = 2
        ctx.fillStyle = m[0]
        ctx.beginPath()
        ctx.arc(0, 0, d.r - 1, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowColor = "transparent"
        ctx.lineWidth = 1
        ctx.strokeStyle = m[1] + "99"
        ctx.beginPath()
        ctx.arc(0, 0, d.r - 5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = m[1]
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = `${m[2] === "↗" ? "normal" : "bold"} ${
          d.r * (m[2] === "↗" ? 1.4 : m[2].length > 4 ? 0.39 : 0.53)
        }px Arial`
        ctx.fillText(m[2], 0, 0)
        ctx.restore()
      }
      if (held >= 0 || document.activeElement === c) {
        const d = disks[held >= 0 ? held : chosen]
        ctx.strokeStyle = "#151e44"
        ctx.setLineDash([2, 3])
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r + 5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }
    const init = () => {
      const radius = Math.max(21, Math.min(34, w / 9.5))
      disks = marks.map((_, i) => ({
        x: w * 0.15 + (i % 4) * ((w * 0.7) / 3),
        y: h * 0.17 + Math.floor(i / 4) * radius * 2.4,
        vx: (i % 2 ? 0.7 : -0.7) * 40,
        vy: 0,
        r: radius,
        angle: (i - 3) * 0.17,
        spin: i % 2 ? 0.2 : -0.2,
      }))
      draw()
    }
    const resize = () => {
      const oldW = w,
        oldH = h
      w = c.clientWidth
      h = c.clientHeight
      const d = Math.min(devicePixelRatio, 2)
      const display = c.getBoundingClientRect()
      c.width = Math.max(1, Math.round(display.width * d))
      c.height = Math.max(1, Math.round(display.height * d))
      ctx.setTransform(c.width / Math.max(1, w), 0, 0, c.height / Math.max(1, h), 0, 0)
      if (disks.length) {
        disks.forEach((p) => {
          p.x = Math.max(p.r, Math.min(w - p.r, (p.x / oldW) * w))
          p.y = Math.max(p.r, Math.min(h - p.r, (p.y / oldH) * h))
        })
        draw()
      } else {
        init()
      }
    }
    const solve = (dt: number) => {
      for (let i = 0; i < disks.length; i++) {
        const d = disks[i]
        if (i === held) {
          continue
        }
        d.vy += 590 * dt
        d.vx *= 0.998
        d.vy *= 0.998
        d.x += d.vx * dt
        d.y += d.vy * dt
        d.angle += d.spin * dt
        d.spin *= 0.998
        if (d.x < d.r) {
          d.x = d.r
          d.vx = Math.abs(d.vx) * 0.62
        }
        if (d.x > w - d.r) {
          d.x = w - d.r
          d.vx = -Math.abs(d.vx) * 0.62
        }
        if (d.y < d.r) {
          d.y = d.r
          d.vy = Math.abs(d.vy) * 0.5
        }
        if (d.y > h - d.r) {
          d.y = h - d.r
          d.vy = -Math.abs(d.vy) * 0.47
          d.vx *= 0.975
          d.spin = (d.vx / d.r) * 0.5
        }
      }
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < disks.length; i++) {
          for (let j = i + 1; j < disks.length; j++) {
            const a = disks[i],
              b = disks[j],
              dx = b.x - a.x,
              dy = b.y - a.y,
              len = Math.hypot(dx, dy) || 0.001,
              overlap = a.r + b.r - len
            if (overlap <= 0) {
              continue
            }
            const nx = dx / len,
              ny = dy / len,
              ia = i === held ? 0 : 1,
              ib = j === held ? 0 : 1,
              total = ia + ib
            if (!total) {
              continue
            }
            a.x -= (nx * overlap * ia) / total
            a.y -= (ny * overlap * ia) / total
            b.x += (nx * overlap * ib) / total
            b.y += (ny * overlap * ib) / total
            const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
            if (approach < 0) {
              const impulse = (-1.45 * approach) / total
              a.vx -= impulse * nx * ia
              a.vy -= impulse * ny * ia
              b.vx += impulse * nx * ib
              b.vy += impulse * ny * ib
              const tangent = (b.vx - a.vx) * -ny + (b.vy - a.vy) * nx
              a.spin += (tangent / a.r) * 0.012
              b.spin -= (tangent / b.r) * 0.012
            }
          }
        }
      }
    }
    const tick = (time: number) => {
      raf = 0
      if (!live.current.active || !live.current.playing || live.current.reduced || document.hidden) {
        return
      }
      accumulator += Math.min(0.045, (time - last) / 1000 || 0.016)
      last = time
      while (accumulator >= 1 / 120) {
        solve(1 / 120)
        accumulator -= 1 / 120
      }
      for (const d of disks) {
        d.x = Math.max(d.r, Math.min(w - d.r, d.x))
        d.y = Math.max(d.r, Math.min(h - d.r, d.y))
      }
      draw()
      const still = held < 0 && disks.every((d) => Math.abs(d.vx) < 2 && Math.abs(d.vy) < 3 && Math.abs(d.spin) < 0.04)
      settledFrames = still ? settledFrames + 1 : 0
      if (settledFrames < 50) {
        raf = requestAnimationFrame(tick)
      }
    }
    const wake = () => {
      if (!raf && live.current.active && live.current.playing && !live.current.reduced && !document.hidden) {
        last = 0
        accumulator = 0
        settledFrames = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
    }
    const pos = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h }
    }
    const down = (e: PointerEvent) => {
      if (e.button !== 0) {
        return
      }
      const p = pos(e)
      held = -1
      for (let i = disks.length - 1; i >= 0; i--) {
        if (Math.hypot(disks[i].x - p.x, disks[i].y - p.y) < disks[i].r) {
          held = i
          break
        }
      }
      if (held < 0) {
        return
      }
      before = { ...disks[held] }
      chosen = held
      setSelected(held)
      pointer = e.pointerId
      c.setPointerCapture(pointer)
      grab = { x: p.x - disks[held].x, y: p.y - disks[held].y }
      draw()
      wake()
    }
    const move = (e: PointerEvent) => {
      if (held < 0 || pointer !== e.pointerId) {
        return
      }
      const p = pos(e),
        d = disks[held],
        x = Math.max(d.r, Math.min(w - d.r, p.x - grab.x)),
        y = Math.max(d.r, Math.min(h - d.r, p.y - grab.y))
      d.vx = Math.max(-500, Math.min(500, (x - d.x) * 25))
      d.vy = Math.max(-500, Math.min(500, (y - d.y) * 25))
      d.x = x
      d.y = y
      draw()
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointer) {
        return
      }
      if (e.type === "pointercancel" && held >= 0 && before) {
        disks[held] = before
      }
      held = -1
      pointer = -1
      before = null
      draw()
      wake()
    }
    const visibility = () => (document.hidden ? stop() : wake())
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
    c.addEventListener("focus", draw)
    c.addEventListener("blur", draw)
    c.addEventListener("pointerdown", down)
    c.addEventListener("pointermove", move)
    c.addEventListener("pointerup", up)
    c.addEventListener("pointercancel", up)
    document.addEventListener("visibilitychange", visibility)
    control.current = {
      wake,
      stop,
      select: (index) => {
        chosen = index
        setSelected(index)
        draw()
      },
      reset: () => {
        init()
        wake()
      },
      move: (dx, dy) => {
        const d = disks[chosen]
        d.x = Math.max(d.r, Math.min(w - d.r, d.x + dx))
        d.y = Math.max(d.r, Math.min(h - d.r, d.y + dy))
        d.vx = 0
        d.vy = 0
        draw()
      },
    }
    wake()
    return () => {
      stop()
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", scheduleResize)
      cancelAnimationFrame(resizeFrame)
      c.removeEventListener("focus", draw)
      c.removeEventListener("blur", draw)
      c.removeEventListener("pointerdown", down)
      c.removeEventListener("pointermove", move)
      c.removeEventListener("pointerup", up)
      c.removeEventListener("pointercancel", up)
      document.removeEventListener("visibilitychange", visibility)
      control.current = null
    }
  }, [])
  useEffect(() => {
    if (active && playing && !reduced) {
      control.current?.wake()
    } else {
      control.current?.stop()
    }
  }, [active, playing, reduced])
  return (
    <section className="sf-sticker-gravity" inert={!active}>
      <header>
        <b>MILE CLUB</b>
        <span>Stickers / set 08</span>
      </header>
      <canvas
        ref={canvas}
        tabIndex={0}
        role="img"
        aria-label={`Eight movable club stickers. Drag to throw. Space selects a sticker. Arrow keys move the selected ${marks[selected][2]} sticker.`}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.preventDefault()
            setPlaying(false)
            control.current?.select((selected + 1) % marks.length)
          }
          if (e.key.startsWith("Arrow")) {
            e.preventDefault()
            setPlaying(false)
            control.current?.move(
              e.key === "ArrowLeft" ? -10 : e.key === "ArrowRight" ? 10 : 0,
              e.key === "ArrowUp" ? -10 : e.key === "ArrowDown" ? 10 : 0,
            )
          }
        }}
      />
      <footer>
        <button type="button" onClick={() => setPlaying(!playing)} disabled={reduced}>
          {playing && !reduced ? "Pause" : "Play"}
        </button>
        <span>{reduced ? "Motion reduced" : "8 stickers"}</span>
        <button type="button" onClick={() => control.current?.reset()}>
          Reset ↺
        </button>
      </footer>
      <style>{`.sf-sticker-gravity{width:100%;height:100%;box-sizing:border-box;background:#f6f7f2;color:#141d34;display:flex;flex-direction:column;overflow:hidden;font-family:Arial,sans-serif}.sf-sticker-gravity header{height:50px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid #d9ded5;font-size:10px}.sf-sticker-gravity header b{font-weight:900;letter-spacing:-.06em;font-size:19px;font-stretch:condensed}.sf-sticker-gravity canvas{display:block;flex:1;min-height:0;width:100%;touch-action:none;cursor:grab}.sf-sticker-gravity canvas:active{cursor:grabbing}.sf-sticker-gravity footer{height:45px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-top:1px solid #d9ded5}.sf-sticker-gravity footer span{font:9px Arial;color:#888f83}.sf-sticker-gravity button{border:0;background:none;min-height:44px;padding:0 7px;font:11px Arial;color:inherit;cursor:pointer}.sf-sticker-gravity button:disabled{opacity:.4;cursor:default}.sf-sticker-gravity button:focus-visible,.sf-sticker-gravity canvas:focus-visible{outline:2px solid #234cdb;outline-offset:-3px}`}</style>
    </section>
  )
}
