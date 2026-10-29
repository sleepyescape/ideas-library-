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

type Glyph = { x: number; y: number; vx: number; vy: number; held: boolean }
const letters = ["P", "U", "L", "L"]

export default function TetheredType({ active = true }: { active?: boolean }) {
  const field = useRef<HTMLDivElement>(null)
  const glyphs = useRef<(HTMLButtonElement | null)[]>([])
  const lines = useRef<(SVGPathElement | null)[]>([])
  const controls = useRef<{
    reset: () => void
    nudge: (i: number, x: number, y: number) => void
    release: (i: number) => void
  }>({ reset() {}, nudge() {}, release() {} })
  const [selected, setSelected] = useState(-1)
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    const root = field.current
    if (!root) {
      return
    }
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    let still = media.matches
    setReduced(still)
    const state: Glyph[] = letters.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, held: false }))
    let frame = 0,
      last = 0,
      width = root.clientWidth,
      height = root.clientHeight
    let drag: { id: number; i: number; x: number; y: number; originX: number; originY: number } | null = null
    const center = (i: number) => ({ x: width * (0.2 + i * 0.2), y: height * 0.5 })
    const paint = () =>
      state.forEach((g, i) => {
        const button = glyphs.current[i],
          line = lines.current[i],
          c = center(i)
        if (button) {
          button.style.transform = `translate(-50%, -50%) translate(${g.x}px, ${g.y}px)`
        }
        if (line) {
          line.setAttribute(
            "d",
            `M${c.x},${c.y + 30} Q${c.x + g.x * 0.25},${c.y + 30 + Math.abs(g.x) * 0.18} ${c.x + g.x},${
              c.y + g.y + 30
            }`,
          )
          line.style.opacity = Math.hypot(g.x, g.y) > 3 ? "1" : "0"
        }
      })
    const reset = () => {
      cancelAnimationFrame(frame)
      frame = 0
      if (drag) {
        const button = glyphs.current[drag.i]
        if (button?.hasPointerCapture(drag.id)) {
          button.releasePointerCapture(drag.id)
        }
      }
      drag = null
      state.forEach((g) => Object.assign(g, { x: 0, y: 0, vx: 0, vy: 0, held: false }))
      paint()
    }
    const tick = (now: number) => {
      frame = 0
      const dt = Math.min((now - last) / 1000 || 1 / 60, 1 / 30)
      last = now
      let moving = false
      for (const g of state) {
        if (g.held) {
          continue
        }
        for (let j = 0; j < 2; j++) {
          g.vx += ((-340 * g.x - 23 * g.vx) * dt) / 2
          g.vy += ((-340 * g.y - 23 * g.vy) * dt) / 2
          g.x += (g.vx * dt) / 2
          g.y += (g.vy * dt) / 2
        }
        if (Math.hypot(g.x, g.y, g.vx, g.vy) < 0.15) {
          Object.assign(g, { x: 0, y: 0, vx: 0, vy: 0 })
        } else {
          moving = true
        }
      }
      paint()
      if (moving && active && !still && !document.hidden) {
        frame = requestAnimationFrame(tick)
      }
    }
    const wake = () => {
      if (!frame && active && !still && !document.hidden) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }
    const place = (i: number, x: number, y: number) => {
      const c = center(i)
      const halfWidth = (glyphs.current[i]?.offsetWidth ?? width * 0.21) / 2 + 2
      const halfHeight = (glyphs.current[i]?.offsetHeight ?? 110) / 2 + 2
      state[i].x = Math.max(halfWidth - c.x, Math.min(width - halfWidth - c.x, x))
      state[i].y = Math.max(halfHeight - c.y, Math.min(height - halfHeight - c.y, y))
      state[i].vx = state[i].vy = 0
      paint()
    }
    const release = (i: number) => {
      state[i].held = false
      if (still) {
        state[i].x = state[i].y = 0
        paint()
      } else {
        wake()
      }
    }
    controls.current = {
      reset,
      nudge: (i, x, y) => {
        if (!active) {
          return
        }
        state[i].held = true
        place(i, state[i].x + x, state[i].y + y)
      },
      release,
    }
    const down = (e: PointerEvent) => {
      if (!active || !e.isPrimary || e.button !== 0 || drag) {
        return
      }
      const button = (e.target as Element).closest<HTMLButtonElement>("button[data-glyph]")
      if (!button) {
        return
      }
      const i = Number(button.dataset.glyph)
      drag = { id: e.pointerId, i, x: e.clientX, y: e.clientY, originX: state[i].x, originY: state[i].y }
      state[i].held = true
      button.setPointerCapture(e.pointerId)
      setSelected(i)
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) {
        return
      }
      const rect = root.getBoundingClientRect()
      place(
        drag.i,
        drag.originX + ((e.clientX - drag.x) * root.clientWidth) / rect.width,
        drag.originY + ((e.clientY - drag.y) * root.clientHeight) / rect.height,
      )
    }
    const up = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) {
        return
      }
      const { i, id } = drag
      drag = null
      if (glyphs.current[i]?.hasPointerCapture(id)) {
        glyphs.current[i]?.releasePointerCapture(id)
      }
      release(i)
    }
    const change = () => {
      still = media.matches
      setReduced(still)
      reset()
    }
    const visibility = () => {
      if (document.hidden) {
        reset()
      }
    }
    const resize = new ResizeObserver(() => {
      width = root.clientWidth
      height = root.clientHeight
      reset()
    })
    resize.observe(root)
    root.addEventListener("pointerdown", down)
    root.addEventListener("pointermove", move)
    root.addEventListener("pointerup", up)
    root.addEventListener("pointercancel", up)
    root.addEventListener("lostpointercapture", up)
    media.addEventListener("change", change)
    document.addEventListener("visibilitychange", visibility)
    paint()
    return () => {
      reset()
      resize.disconnect()
      root.removeEventListener("pointerdown", down)
      root.removeEventListener("pointermove", move)
      root.removeEventListener("pointerup", up)
      root.removeEventListener("pointercancel", up)
      root.removeEventListener("lostpointercapture", up)
      media.removeEventListener("change", change)
      document.removeEventListener("visibilitychange", visibility)
      controls.current = { reset() {}, nudge() {}, release() {} }
    }
  }, [active])

  return (
    <section className="sf-tethered-type" data-reduced={reduced} aria-label="Tethered type specimen">
      <div className="word" ref={field}>
        <svg aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.25">
            {letters.map((_, i) => (
              <path
                key={i}
                ref={(el) => {
                  lines.current[i] = el
                }}
              />
            ))}
          </g>
        </svg>
        {letters.map((letter, i) => (
          <span className="origin" key={`o-${i}`} style={{ left: `${20 + 20 * i}%` }} aria-hidden="true">
            {letter}
          </span>
        ))}
        {letters.map((letter, i) => (
          <button
            key={i}
            type="button"
            data-glyph={i}
            ref={(el) => {
              glyphs.current[i] = el
            }}
            style={{ left: `${20 + 20 * i}%` }}
            disabled={!active}
            aria-label={`${letter}, letter ${i + 1}. Drag or use arrow keys; Enter returns it.`}
            onFocus={() => setSelected(i)}
            onBlur={() => controls.current.release(i)}
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "Escape", "Enter", " "].includes(event.key)
              ) {
                event.preventDefault()
              }
              if (event.key === "ArrowLeft") {
                controls.current.nudge(i, -12, 0)
              }
              if (event.key === "ArrowRight") {
                controls.current.nudge(i, 12, 0)
              }
              if (event.key === "ArrowUp") {
                controls.current.nudge(i, 0, -12)
              }
              if (event.key === "ArrowDown") {
                controls.current.nudge(i, 0, 12)
              }
              if (["Home", "Escape", "Enter", " "].includes(event.key)) {
                controls.current.release(i)
              }
            }}
          >
            {letter}
          </button>
        ))}
      </div>
      <footer>
        <button
          type="button"
          disabled={!active}
          onClick={() => {
            controls.current.reset()
            setSelected(-1)
          }}
        >
          Reset <span aria-hidden="true">↺</span>
        </button>
      </footer>
      <span className="sr" role="status">
        {selected < 0 ? "Type reset" : `Letter ${selected + 1} selected`}
      </span>
      <style>{`
        .sf-tethered-type{height:100%;width:100%;position:relative;overflow:hidden;container-type:inline-size;background:#f45b96;color:#191820;font-family:Arial,sans-serif;box-sizing:border-box}.sf-tethered-type *{box-sizing:border-box}.sf-tethered-type .word{height:calc(100% - 51px);position:relative}.sf-tethered-type svg{position:absolute;width:100%;height:100%;pointer-events:none;overflow:visible}.sf-tethered-type .word>button,.sf-tethered-type .origin{position:absolute;top:50%;transform:translate(-50%,-50%);width:21%;text-align:center;font:900 clamp(70px,27cqw,162px)/1 "Arial Black",Impact,sans-serif;letter-spacing:-.065em}.sf-tethered-type .word>button{padding:0 6px 10px 0;border:0;background:none;color:inherit;touch-action:none;cursor:grab;user-select:none;z-index:1}.sf-tethered-type .word>button:active{cursor:grabbing}.sf-tethered-type .origin{color:transparent;-webkit-text-stroke:1px #19182028;padding:0 6px 10px 0;pointer-events:none}.sf-tethered-type button:focus-visible{outline:1px dashed currentColor;outline-offset:5px}.sf-tethered-type button:disabled{cursor:default}.sf-tethered-type footer{height:51px;margin:0 24px;display:flex;align-items:center;justify-content:flex-end;font-size:11px;letter-spacing:-.15px}.sf-tethered-type footer button{min-height:44px;border:0;background:none;display:flex;align-items:center;gap:20px;color:inherit;font:inherit;cursor:pointer;touch-action:manipulation}.sf-tethered-type footer button>span{font-size:22px}.sf-tethered-type .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
      `}</style>
    </section>
  )
}
