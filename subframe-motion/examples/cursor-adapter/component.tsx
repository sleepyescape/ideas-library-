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

const titles = ["Sideways", "Soft machinery", "Another kind of light"]
export default function CursorAdapter({ active = true }: { active?: boolean }) {
  const root = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    reduced = useReduced(),
    [selected, setSelected] = useState(0)
  useEffect(() => {
    const el = root.current!,
      c = canvas.current!,
      ctx = c.getContext("2d")
    if (!ctx) {
      return
    }
    let w = 0,
      h = 0,
      raf = 0,
      last = 0,
      visible = false,
      target: { x: number; y: number; width: number } | null = null,
      point = { x: 0, y: 0 },
      head = { x: 0, y: 0, width: 6 },
      trail: { x: number; y: number; life: number }[] = []
    const size = () => {
      w = el.clientWidth
      h = el.clientHeight
      if (!w || !h) {
        return
      }
      const d = Math.min(devicePixelRatio, 2),
        bounds = el.getBoundingClientRect()
      c.width = Math.round(bounds.width * d)
      c.height = Math.round(bounds.height * d)
      c.style.width = w + "px"
      c.style.height = h + "px"
      ctx.setTransform(c.width / w, 0, 0, c.height / h, 0, 0)
    }
    const paint = (now: number) => {
      raf = 0
      const dt = Math.min(32, now - last || 16)
      last = now
      ctx.clearRect(0, 0, w, h)
      if (!active || reduced || document.hidden) {
        return
      }
      const previous = { ...head }
      const destination = target || { ...point, width: 6 }
      const k = 1 - Math.exp(-dt / 65)
      head.x += (destination.x - head.x) * k
      head.y += (destination.y - head.y) * k
      head.width += (destination.width - head.width) * k
      trail = trail.filter((p) => p.life > 0)
      for (const p of trail) {
        p.life -= dt
        ctx.globalAlpha = Math.max(0, p.life / 230) * 0.14
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = "#191a14"
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (visible) {
        if (!target && Math.hypot(head.x - previous.x, head.y - previous.y) > 0.15) {
          trail.push({ ...head, life: 230 })
        }
        ctx.fillStyle = "#191a14"
        ctx.beginPath()
        ctx.roundRect(head.x - head.width / 2, head.y - 2, head.width, 4, 2)
        ctx.fill()
      }
      if (
        (visible &&
          Math.abs(destination.x - head.x) +
            Math.abs(destination.y - head.y) +
            Math.abs(destination.width - head.width) >
            0.1) ||
        trail.length
      ) {
        raf = requestAnimationFrame(paint)
      }
    }
    const wake = () => {
      if (!raf && active && !reduced && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(paint)
      }
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        return
      }
      const b = el.getBoundingClientRect(),
        scaleX = w / b.width,
        scaleY = h / b.height
      point = { x: (e.clientX - b.left) * scaleX, y: (e.clientY - b.top) * scaleY }
      if (!visible) {
        head = { ...point, width: 6 }
      }
      visible = true
      const row = (e.target as Element).closest("button[data-book]")
      if (row) {
        const b2 = row.querySelector("span")!.getBoundingClientRect()
        target = {
          x: (b2.left - b.left + b2.width / 2) * scaleX,
          y: (b2.bottom - b.top) * scaleY + 3,
          width: b2.width * scaleX,
        }
      } else {
        target = null
      }
      wake()
    }
    const leave = () => {
      visible = false
      target = null
      wake()
    }
    const visibility = () => {
      cancelAnimationFrame(raf)
      raf = 0
      trail = []
      visible = false
      ctx.clearRect(0, 0, w, h)
    }
    const ro = new ResizeObserver(size)
    ro.observe(el)
    size()
    const resize = () => {
      size()
      wake()
    }
    let resizeFrame = 0
    const resizeViewport = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(resize)
    }
    // An ancestor transform changes raster density without resizing the layout box.
    const transforms = new MutationObserver(resizeViewport)
    for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", resizeViewport)
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      ro.disconnect()
      transforms.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeFrame)
      window.removeEventListener("resize", resizeViewport)
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", leave)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [active, reduced])
  return (
    <section ref={root} className="sf-cursor-adapter" inert={!active}>
      <div className="ca-books">
        {titles.map((t, i) => (
          <button type="button" data-book key={t} onClick={() => setSelected(i)} aria-pressed={selected === i}>
            <span>{t}</span>
            <small>↗</small>
          </button>
        ))}
      </div>
      <footer>
        <span>{["Essays on seeing", "Objects & everyday life", "Photographs, 2006–2026"][selected]}</span>
        <span>{["128 pages", "96 pages", "144 pages"][selected]}</span>
      </footer>
      <canvas ref={canvas} aria-hidden="true" />
      <style>{`.sf-cursor-adapter{width:100%;height:100%;box-sizing:border-box;background:#eee72b;color:#17180e;padding:24px;position:relative;overflow:hidden;display:flex;flex-direction:column;font-family:Arial,sans-serif}.sf-cursor-adapter footer{display:flex;justify-content:space-between;gap:14px;font-size:10px;line-height:1.4}.ca-books{display:flex;flex-direction:column;justify-content:center;flex:1;gap:5px}.ca-books button{border:0;padding:8px 0;min-height:44px;text-align:left;background:none;color:inherit;font:500 clamp(22px,5.8cqw,36px)/1.05 Arial,sans-serif;letter-spacing:-.05em;display:flex;align-items:baseline;justify-content:space-between;gap:12px;cursor:pointer}.ca-books small{font:18px Arial;opacity:.55}.ca-books button:focus-visible{outline:2px solid #17180e;outline-offset:5px}.ca-books button:active{opacity:.65}.sf-cursor-adapter canvas{position:absolute;inset:0;pointer-events:none}.sf-cursor-adapter footer{border-top:1px solid #17180e55;padding-top:12px}.sf-cursor-adapter{container-type:size}`}</style>
    </section>
  )
}
