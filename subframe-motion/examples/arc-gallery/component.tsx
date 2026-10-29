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

const cards = [
  ["/motion/assets/fern-diptych.webp", "Fern study"],
  ["/motion/assets/tulip-print.webp", "Tulip"],
  ["/motion/assets/oak-damask.webp", "Oak"],
  ["/motion/assets/plum-garden.webp", "Plum garden"],
  ["/motion/assets/windrush-print.webp", "Windrush"],
]
const wrap = (n: number) => ((n % cards.length) + cards.length) % cards.length
export default function ArcGallery({ active = true }: { active?: boolean }) {
  const stage = useRef<HTMLDivElement>(null),
    refs = useRef<(HTMLButtonElement | null)[]>([]),
    reduced = useReduced(),
    [index, setIndex] = useState(0),
    live = useRef({ active, reduced }),
    motion = useRef({ x: 0, target: 0, v: 0 }),
    control = useRef<{ wake: () => void; paint: () => void; stop: () => void } | null>(null),
    drag = useRef<{
      id: number
      x: number
      origin: number
      start: number
      last: number
      time: number
      moved: boolean
    } | null>(null),
    suppress = useRef(false)
  live.current = { active, reduced }
  useEffect(() => {
    const el = stage.current!
    let raf = 0,
      last = 0,
      w = 1,
      cw = 1
    const paint = () => {
      refs.current.forEach((node, i) => {
        if (!node) {
          return
        }
        const delta = ((i - motion.current.x + 7.5) % 5) - 2.5,
          angle = delta * 0.49
        node.style.transform = `translate(${Math.sin(angle) * w * 0.58 - cw / 2}px,${
          (1 - Math.cos(angle)) * w * 0.19
        }px) rotate(${angle * 25}deg)`
        node.style.zIndex = String(10 - Math.round(Math.abs(delta) * 2))
        node.style.opacity = String(Math.max(0.18, 1 - Math.abs(delta) * 0.18))
      })
    }
    const tick = (time: number) => {
      raf = 0
      if (!live.current.active || live.current.reduced || document.hidden) {
        return
      }
      const dt = Math.min((time - last) / 1000 || 0.016, 0.032)
      last = time
      const m = motion.current
      if (!drag.current) {
        m.v += (m.target - m.x) * 155 * dt
        m.v *= Math.exp(-21 * dt)
        m.x += m.v * dt
      }
      paint()
      if (drag.current || Math.abs(m.target - m.x) > 0.0003 || Math.abs(m.v) > 0.003) {
        raf = requestAnimationFrame(tick)
      }
    }
    const wake = () => {
      if (!raf && live.current.active && !live.current.reduced && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
    }
    control.current = { wake, paint, stop }
    const resize = () => {
      w = el.clientWidth
      cw = Math.min(154, w * 0.35)
      const ch = Math.min(198, el.clientHeight * 0.77)
      refs.current.forEach((node) => {
        if (!node) {
          return
        }
        node.style.width = cw + "px"
        node.style.height = ch + "px"
      })
      paint()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()
    const visibility = () => (document.hidden ? stop() : wake())
    document.addEventListener("visibilitychange", visibility)
    return () => {
      stop()
      ro.disconnect()
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
  const choose = (next: number, instant = false) => {
    motion.current.target = next
    setIndex(wrap(Math.round(next)))
    if (instant || reduced || !active) {
      motion.current.x = next
      motion.current.v = 0
      control.current?.paint()
    } else {
      control.current?.wake()
    }
  }
  return (
    <section className="sf-arc-gallery" inert={!active}>
      <header>
        LEAVES & LINES <span>Collected studies</span>
      </header>
      <div
        className="ag-stage"
        ref={stage}
        onPointerDown={(e) => {
          if (e.button !== 0) {
            return
          }
          suppress.current = false
          drag.current = {
            id: e.pointerId,
            x: e.clientX,
            origin: motion.current.x,
            start: motion.current.target,
            last: e.clientX,
            time: performance.now(),
            moved: false,
          }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d || d.id !== e.pointerId) {
            return
          }
          const dx = e.clientX - d.x
          if (Math.abs(dx) > 5 && !d.moved) {
            d.moved = true
            e.currentTarget.setPointerCapture(e.pointerId)
          }
          if (!d.moved) {
            return
          }
          const now = performance.now(),
            rate = 1 / (stage.current!.getBoundingClientRect().width * 0.22)
          motion.current.v = (-(e.clientX - d.last) / Math.max(8, now - d.time)) * 1000 * rate
          motion.current.x = d.origin - dx * rate
          motion.current.target = motion.current.x
          d.last = e.clientX
          d.time = now
          control.current?.paint()
        }}
        onPointerUp={() => {
          const d = drag.current
          if (!d) {
            return
          }
          const next = d.moved
            ? Math.round(motion.current.x + Math.max(-0.7, Math.min(0.7, motion.current.v * 0.07)))
            : motion.current.target
          suppress.current = d.moved
          drag.current = null
          choose(next)
        }}
        onPointerCancel={() => {
          const d = drag.current
          drag.current = null
          if (d) {
            choose(d.start, true)
          }
        }}
      >
        {cards.map(([file, title], i) => (
          <button
            type="button"
            ref={(el) => {
              refs.current[i] = el
            }}
            key={file}
            aria-label={"Select " + title}
            aria-pressed={index === i}
            tabIndex={index === i ? 0 : -1}
            onClick={(e) => {
              if (e.detail !== 0 && suppress.current) {
                suppress.current = false
                return
              }
              const delta = ((i - wrap(Math.round(motion.current.target)) + 7.5) % 5) - 2.5
              choose(Math.round(motion.current.target) + delta, e.detail === 0)
            }}
          >
            <img src={file} alt={title} draggable={false} />
          </button>
        ))}
      </div>
      <footer>
        <button
          type="button"
          aria-label="Previous study"
          onClick={(e) => choose(Math.round(motion.current.target) - 1, e.detail === 0)}
        >
          ←
        </button>
        <span>{cards[index][1]}</span>
        <button
          type="button"
          aria-label="Next study"
          onClick={(e) => choose(Math.round(motion.current.target) + 1, e.detail === 0)}
        >
          →
        </button>
      </footer>
      <style>{`.sf-arc-gallery{width:100%;height:100%;background:#fcfcf8;color:#253127;display:flex;flex-direction:column;overflow:hidden;font-family:Arial,sans-serif;box-sizing:border-box}.sf-arc-gallery header{padding:20px 22px 0;display:flex;justify-content:space-between;font-size:9px;letter-spacing:.07em;flex-shrink:0}.sf-arc-gallery header span{letter-spacing:0;color:#828779}.ag-stage{position:relative;flex:1;min-height:0;touch-action:pan-y;cursor:grab}.ag-stage:active{cursor:grabbing}.ag-stage button{position:absolute;left:50%;top:28px;padding:5px;background:#fff;border:1px solid #e2e4dc;box-shadow:0 10px 16px #313c2015;transform-origin:50% 100%;border-radius:1px;cursor:inherit}.ag-stage img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}.ag-stage button:first-child img{object-position:77% 50%}.ag-stage button:focus-visible{outline:2px solid #5e6e3b;outline-offset:4px}.sf-arc-gallery footer{display:flex;align-items:center;justify-content:center;gap:26px;height:57px;flex-shrink:0;position:relative;background:#fcfcf8}.sf-arc-gallery footer span{font:italic 20px Georgia,serif;min-width:150px;text-align:center}.sf-arc-gallery footer button{width:44px;height:44px;background:none;border:0;color:#253127;font:20px Georgia;cursor:pointer}.sf-arc-gallery footer button:hover{background:#eeeede;border-radius:50%}.sf-arc-gallery footer button:focus-visible{outline:2px solid #5e6e3b;outline-offset:-2px}`}</style>
    </section>
  )
}
