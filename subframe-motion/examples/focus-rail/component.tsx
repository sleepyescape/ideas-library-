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

const photographs = [
  ["/motion/assets/concrete-projections.webp", "Projection"],
  ["/motion/assets/cathedral-columns.webp", "Rhythm"],
  ["/motion/assets/concrete-geometries.webp", "Cantilever"],
  ["/motion/assets/paris-street.webp", "Passage"],
  ["/motion/assets/montmartre.webp", "Contour"],
]
const bound = (n: number) => Math.max(0, Math.min(photographs.length - 1, n))

export default function FocusRail({ active = true }: { active?: boolean }) {
  const root = useRef<HTMLElement>(null)
  const position = useRef(2),
    target = useRef(2),
    velocity = useRef(0),
    frame = useRef(0)
  const drag = useRef<{ x: number; start: number } | null>(null),
    moved = useRef(false)
  const draw = useRef(() => {}),
    start = useRef(() => {})
  const [selected, setSelected] = useState(2),
    [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    const el = root.current
    if (!el) {
      return
    }
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".fc-photo"))
    let previous = 0,
      available = 1,
      flat = 1
    const paint = () => {
      const weights = cards.map((_, i) => Math.max(0, 1 - Math.abs(i - position.current)))
      const total = weights.reduce((sum, n) => sum + n, 0)
      let x = 24
      cards.forEach((card, i) => {
        const width = available * 0.115 + (available * 0.425 * weights[i]) / total
        const angle = Math.acos(Math.min(1, width / flat)),
          depth = flat * 0.5 * Math.sin(angle)
        card.style.transform = `translateX(${x}px) rotateX(-9deg)`
        const [left, right] = Array.from(card.querySelectorAll<HTMLElement>(".fc-half"))
        left.style.transform = `rotateY(${-angle}rad)`
        right.style.transform = `translateX(${width / 2}px) translateZ(${depth}px) rotateY(${angle}rad)`
        for (const [j, half] of [left, right].entries()) {
          const shadow = half.querySelector("i")!
          shadow.style.opacity = String((angle / (Math.PI / 2)) * (j ? 0.58 : 0.18))
        }
        x += width
      })
    }
    const tick = (time: number) => {
      frame.current = 0
      const dt = Math.min((time - (previous || time - 16)) / 1000, 0.032)
      previous = time
      velocity.current += ((target.current - position.current) * 270 - velocity.current * 32) * dt
      position.current += velocity.current * dt
      paint()
      if (Math.abs(target.current - position.current) > 0.001 || Math.abs(velocity.current) > 0.005) {
        frame.current = requestAnimationFrame(tick)
      } else {
        position.current = target.current
        velocity.current = 0
        paint()
      }
    }
    const kick = () => {
      cancelAnimationFrame(frame.current)
      previous = 0
      if (reduced) {
        position.current = target.current
        velocity.current = 0
        paint()
      } else if (active && !document.hidden) {
        frame.current = requestAnimationFrame(tick)
      }
    }
    draw.current = paint
    start.current = kick
    const resize = () => {
      available = el.clientWidth - 48
      flat = available * 0.54
      const height = Math.max(130, el.clientHeight - 126)
      cards.forEach((card) => {
        card.style.width = `${flat}px`
        card.style.height = `${height}px`
        card.querySelectorAll<HTMLElement>(".fc-half").forEach((half, j) => {
          half.style.width = `${flat / 2}px`
          const image = half.querySelector("img")!
          image.style.width = `${flat}px`
          image.style.left = j ? `${-flat / 2}px` : "0"
        })
      })
      paint()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()
    const visibility = () => (document.hidden ? cancelAnimationFrame(frame.current) : kick())
    document.addEventListener("visibilitychange", visibility)
    if (active) {
      kick()
    }
    return () => {
      cancelAnimationFrame(frame.current)
      ro.disconnect()
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [active, reduced])
  const choose = (value: number, instant = false) => {
    target.current = bound(value)
    setSelected(Math.round(target.current))
    if (instant || reduced) {
      cancelAnimationFrame(frame.current)
      position.current = target.current
      velocity.current = 0
      draw.current()
    } else {
      start.current()
    }
  }
  return (
    <section
      ref={root}
      className="sf-focus-rail"
      aria-label="Folded architecture contact sheet"
      onKeyDown={(event) => {
        const value =
          event.key === "ArrowRight"
            ? target.current + 1
            : event.key === "ArrowLeft"
            ? target.current - 1
            : event.key === "Home"
            ? 0
            : event.key === "End"
            ? 4
            : null
        if (value === null) {
          return
        }
        event.preventDefault()
        choose(value, true)
        root.current?.querySelectorAll<HTMLButtonElement>(".fc-photo")[Math.round(bound(value))]?.focus()
      }}
    >
      <style>{`.sf-focus-rail{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;background:#243cbd;color:#fff;font-family:Arial,sans-serif;isolation:isolate}.sf-focus-rail *{box-sizing:border-box}.sf-focus-rail .fc-photo{position:absolute;top:36px;left:0;border:0;padding:0;background:transparent;transform-style:preserve-3d;cursor:grab;touch-action:pan-y;pointer-events:none}.sf-focus-rail .fc-photo:active{cursor:grabbing}.sf-focus-rail .fc-half{position:absolute;left:0;top:0;height:100%;overflow:hidden;pointer-events:auto;transform-origin:left center;backface-visibility:hidden;box-shadow:inset 0 0 0 1px #0000000a}.sf-focus-rail .fc-half img{position:absolute;top:0;max-width:none;height:100%;object-fit:cover;pointer-events:none}.sf-focus-rail .fc-half i{position:absolute;inset:0;background:linear-gradient(90deg,#040b29,#111428);pointer-events:none}.sf-focus-rail .fc-half:first-child:after{content:'';position:absolute;inset:0 0 0 auto;width:1px;background:#fff5}.sf-focus-rail .fc-photo:focus-visible{outline:none}.sf-focus-rail .fc-photo:focus-visible .fc-half{outline:2px solid #ffe49c;outline-offset:3px}.sf-focus-rail .fc-bed{position:absolute;left:24px;right:24px;top:36px;bottom:90px;box-shadow:0 18px 24px -12px #06135190}.sf-focus-rail footer{position:absolute;left:24px;right:24px;bottom:14px;height:44px;display:flex;align-items:center;justify-content:space-between;gap:12px}.sf-focus-rail footer strong{font:400 20px Georgia,serif;letter-spacing:-.03em}.sf-focus-rail .fc-navigation{display:flex;align-items:center;gap:8px;font-size:10px;font-variant-numeric:tabular-nums}.sf-focus-rail footer button{width:44px;height:44px;border:1px solid #ffffff50;border-radius:50%;color:inherit;background:transparent;cursor:pointer;font:20px Arial;transition:background-color 140ms,transform 140ms}.sf-focus-rail footer button:active{transform:scale(.96)}.sf-focus-rail footer button:disabled{opacity:.3;cursor:default}.sf-focus-rail footer button:focus-visible{outline:2px solid #ffe49c;outline-offset:3px}@media(hover:hover){.sf-focus-rail footer button:hover:not(:disabled){background:#ffffff18}}`}</style>
      <div className="fc-bed" aria-hidden="true" />
      {photographs.map(([image, title], i) => (
        <button
          className="fc-photo"
          key={image}
          aria-label={`View ${title}`}
          aria-pressed={selected === i}
          tabIndex={selected === i ? 0 : -1}
          onPointerDown={(event) => {
            if (event.button !== 0) {
              return
            }
            cancelAnimationFrame(frame.current)
            velocity.current = 0
            moved.current = false
            drag.current = { x: event.clientX, start: position.current }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            if (!drag.current || !root.current) {
              return
            }
            const dx =
              ((event.clientX - drag.current.x) * root.current.clientWidth) / root.current.getBoundingClientRect().width
            if (Math.abs(dx) > 4) {
              moved.current = true
            }
            if (!moved.current) {
              return
            }
            position.current = bound(drag.current.start - dx / 105)
            draw.current()
            setSelected(Math.round(position.current))
          }}
          onPointerUp={(event) => {
            if (!drag.current) {
              return
            }
            drag.current = null
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
            if (moved.current) {
              choose(Math.round(position.current))
            }
          }}
          onPointerCancel={() => {
            drag.current = null
            choose(Math.round(position.current))
          }}
          onLostPointerCapture={() => {
            if (!drag.current) {
              return
            }
            drag.current = null
            choose(Math.round(position.current))
          }}
          onClick={(event) => {
            if (!moved.current || event.detail === 0) {
              choose(i, event.detail === 0)
            }
          }}
        >
          <span className="fc-half">
            <img src={image} alt="" draggable={false} />
            <i />
          </span>
          <span className="fc-half">
            <img src={image} alt="" draggable={false} />
            <i />
          </span>
        </button>
      ))}
      <footer>
        <strong aria-live="polite">{photographs[selected][1]}</strong>
        <div className="fc-navigation">
          <span>{String(selected + 1).padStart(2, "0")} / 05</span>
          <button
            aria-label="Previous photograph"
            disabled={selected === 0}
            onClick={(event) => choose(target.current - 1, event.detail === 0)}
          >
            ←
          </button>
          <button
            aria-label="Next photograph"
            disabled={selected === 4}
            onClick={(event) => choose(target.current + 1, event.detail === 0)}
          >
            →
          </button>
        </div>
      </footer>
    </section>
  )
}
