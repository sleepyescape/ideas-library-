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

const specimens = [
  ["/motion/assets/botanical-cabbage-rose.webp", "Cabbage rose"],
  ["/motion/assets/botanical-iris.webp", "Gold-banded iris"],
  ["/motion/assets/botanical-turban-lily.webp", "Turban lily"],
  ["/motion/assets/botanical-crocus.webp", "Crocus"],
]
const clamp = (n: number) => Math.max(0, Math.min(specimens.length - 1, n))

export default function RopeGallery({ active = true }: { active?: boolean }) {
  const root = useRef<HTMLElement>(null),
    position = useRef(1),
    target = useRef(1),
    velocity = useRef(0),
    raf = useRef(0)
  const draw = useRef(() => {}),
    run = useRef(() => {})
  const drag = useRef<{ x: number; start: number } | null>(null),
    moved = useRef(false)
  const [selected, setSelected] = useState(1),
    [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    const el = root.current
    if (!el) {
      return
    }
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".sf-plate"))
    let last = 0,
      spread = 1
    const paint = () => {
      cards.forEach((card, i) => {
        const distance = i - position.current
        card.style.transform = `translateX(-50%) rotate(${distance * spread}deg)`
        card.style.zIndex = String(i === Math.round(position.current) ? 30 : 20 - Math.ceil(Math.abs(distance) * 4))
      })
    }
    const tick = (time: number) => {
      raf.current = 0
      const dt = Math.min((time - (last || time - 16)) / 1000, 0.032)
      last = time
      velocity.current += ((target.current - position.current) * 210 - velocity.current * 26) * dt
      position.current += velocity.current * dt
      paint()
      if (Math.abs(target.current - position.current) > 0.001 || Math.abs(velocity.current) > 0.005) {
        raf.current = requestAnimationFrame(tick)
      } else {
        position.current = target.current
        velocity.current = 0
        paint()
      }
    }
    const start = () => {
      cancelAnimationFrame(raf.current)
      last = 0
      if (reduced) {
        position.current = target.current
        velocity.current = 0
        paint()
      } else if (active && !document.hidden) {
        raf.current = requestAnimationFrame(tick)
      }
    }
    draw.current = paint
    run.current = start
    const resize = () => {
      const width = Math.min(152, el.clientWidth * 0.27)
      const height = Math.min(244, el.clientHeight - 112)
      spread = Math.min(27, ((el.clientWidth - width) / height) * 14)
      cards.forEach((card) => {
        card.style.width = `${width}px`
        card.style.height = `${height}px`
      })
      paint()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()
    const visibility = () => (document.hidden ? cancelAnimationFrame(raf.current) : start())
    document.addEventListener("visibilitychange", visibility)
    if (active) {
      start()
    }
    return () => {
      cancelAnimationFrame(raf.current)
      ro.disconnect()
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [active, reduced])
  const choose = (value: number, instant = false) => {
    target.current = clamp(value)
    setSelected(Math.round(target.current))
    if (instant || reduced) {
      cancelAnimationFrame(raf.current)
      position.current = target.current
      velocity.current = 0
      draw.current()
    } else {
      run.current()
    }
  }
  return (
    <section
      ref={root}
      className="sf-rope-gallery"
      aria-label="Botanical specimen fan"
      onKeyDown={(event) => {
        const next =
          event.key === "ArrowRight"
            ? target.current + 1
            : event.key === "ArrowLeft"
            ? target.current - 1
            : event.key === "Home"
            ? 0
            : event.key === "End"
            ? 3
            : null
        if (next === null) {
          return
        }
        event.preventDefault()
        choose(next, true)
        root.current?.querySelectorAll<HTMLButtonElement>(".sf-plate")[Math.round(clamp(next))]?.focus()
      }}
    >
      <style>{`.sf-rope-gallery{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;background:radial-gradient(ellipse at 50% 25%,#34584d,#183b32 85%);color:#e9eadc;font-family:Arial,sans-serif;isolation:isolate}.sf-rope-gallery *{box-sizing:border-box}.sf-rope-gallery:before{content:'';position:absolute;inset:0;opacity:.12;pointer-events:none;background-image:repeating-linear-gradient(0deg,transparent 0 2px,#d5e5d20c 2px 3px)}.sf-rope-gallery .sf-plate{position:absolute;left:50%;bottom:82px;transform-origin:50% calc(100% - 17px);border:0;border-radius:4px 4px 11px 11px;padding:8px 8px 37px;background:#eae8dc;color:#28382c;box-shadow:0 1px 0 #fffffff0 inset,0 -1px 0 #6c68557a inset,1px 3px 3px #09170e30,4px 9px 16px #08221950;cursor:grab;touch-action:pan-y;user-select:none}.sf-rope-gallery .sf-plate:active{cursor:grabbing}.sf-rope-gallery .sf-plate:before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(115deg,#fff5,transparent 40%,#6d665211);z-index:1}.sf-rope-gallery .sf-plate img{width:100%;height:100%;display:block;object-fit:contain;mix-blend-mode:multiply;pointer-events:none}.sf-rope-gallery .sf-plate span{position:absolute;bottom:30px;left:0;width:100%;font:italic 14px Georgia,serif;text-align:center}.sf-rope-gallery .sf-plate:focus-visible{outline:2px solid #f2cf74;outline-offset:4px}.sf-rope-gallery .sf-pivot{position:absolute;z-index:40;left:50%;bottom:90px;transform:translateX(-50%);height:18px;width:18px;border:1px solid #a88847;border-radius:50%;background:conic-gradient(from 30deg,#d5ba77,#8b6c32,#ead597,#ae8d4b,#e6ce91,#8b6c32,#d5ba77);box-shadow:0 1px 1px #fff9 inset,0 2px 2px #16251bcc,0 0 0 3px #574a261f;pointer-events:none}.sf-rope-gallery .sf-pivot:after{content:'';position:absolute;inset:4px;border:1px solid #705d38;border-radius:50%;box-shadow:0 1px 1px #fff8}.sf-rope-gallery footer{position:absolute;left:24px;right:24px;bottom:10px;display:flex;height:44px;align-items:center;justify-content:space-between;font-size:11px}.sf-rope-gallery .sf-count{font-variant-numeric:tabular-nums;font-size:10px}.sf-rope-gallery .sf-pagination{display:flex;align-items:center;gap:8px;font-variant-numeric:tabular-nums;font-size:10px}.sf-rope-gallery footer button{width:44px;height:44px;border:0;color:inherit;background:transparent;cursor:pointer;font:21px Arial;border-radius:50%;transition:background-color 150ms,transform 150ms}.sf-rope-gallery footer button:disabled{opacity:.3;cursor:default}.sf-rope-gallery footer button:active{transform:scale(.96)}.sf-rope-gallery footer button:focus-visible{outline:2px solid #f2cf74}@media(hover:hover){.sf-rope-gallery footer button:hover:not(:disabled){background:#ffffff10}}`}</style>
      {specimens.map(([image, title], index) => (
        <button
          key={image}
          className="sf-plate"
          tabIndex={selected === index ? 0 : -1}
          aria-label={`View ${title}`}
          aria-pressed={selected === index}
          onPointerDown={(event) => {
            if (event.button !== 0) {
              return
            }
            cancelAnimationFrame(raf.current)
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
            position.current = clamp(drag.current.start - dx / 95)
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
              choose(index, event.detail === 0)
            }
          }}
        >
          <img src={image} alt="" draggable={false} />
          <span>{title}</span>
        </button>
      ))}
      <span className="sf-pivot" aria-hidden="true" />
      <footer>
        <span className="sf-count" aria-live="polite">
          {String(selected + 1).padStart(2, "0")} / 04
        </span>
        <div className="sf-pagination">
          <button
            aria-label="Previous specimen"
            disabled={selected === 0}
            onClick={(event) => choose(target.current - 1, event.detail === 0)}
          >
            ←
          </button>
          <button
            aria-label="Next specimen"
            disabled={selected === 3}
            onClick={(event) => choose(target.current + 1, event.detail === 0)}
          >
            →
          </button>
        </div>
      </footer>
    </section>
  )
}
