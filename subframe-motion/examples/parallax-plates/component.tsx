/**
 * MIT License
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
import * as React from "react"

const PLATES = [
  {
    src: "/motion/assets/concrete-geometries.webp",
    alt: "White geometric concrete towers against blue sky",
    label: "Geometry",
    w: 165,
    h: 208,
  },
  {
    src: "/motion/assets/running-track.webp",
    alt: "Red running lanes curving across the frame",
    label: "Interval",
    w: 200,
    h: 168,
  },
  {
    src: "/motion/assets/coastal-break.webp",
    alt: "Turquoise waves meeting jagged ochre rocks",
    label: "Tidal",
    w: 175,
    h: 228,
  },
  {
    src: "/motion/assets/concrete-projections.webp",
    alt: "Angular concrete forms projecting from a building",
    label: "Cantilever",
    w: 160,
    h: 192,
  },
  {
    src: "/motion/assets/blue-tide.webp",
    alt: "White ocean foam sweeping through blue water",
    label: "Surface",
    w: 195,
    h: 164,
  },
]
const GAP = 22,
  TOTAL = PLATES.reduce((n, p) => n + p.w + GAP, 0)
const CENTERS = PLATES.map((p, i) => PLATES.slice(0, i).reduce((n, q) => n + q.w + GAP, 0) + p.w / 2)
const wrap = (n: number) => ((((n + TOTAL / 2) % TOTAL) + TOTAL) % TOTAL) - TOTAL / 2
export default function Example({ active = true }: { active?: boolean }) {
  const root = React.useRef<HTMLDivElement>(null),
    buttons = React.useRef<(HTMLButtonElement | null)[]>([]),
    offset = React.useRef(CENTERS[0]),
    frame = React.useRef(0),
    velocity = React.useRef(0),
    width = React.useRef(600),
    quiet = React.useRef(false),
    drag = React.useRef<{
      id: number
      x: number
      offset: number
      lastX: number
      lastTime: number
      moved: boolean
      index: number | null
    } | null>(null),
    suppress = React.useRef(false)
  const [selected, setSelected] = React.useState(0),
    selectedRef = React.useRef(0)
  const render = React.useCallback(() => {
    let nearest = 0,
      distance = Infinity
    PLATES.forEach((p, i) => {
      const el = buttons.current[i]
      if (!el) {
        return
      }
      const x = wrap(CENTERS[i] - offset.current)
      el.style.transform = `translate3d(${width.current / 2 + x - p.w / 2}px,${-p.h / 2}px,0)`
      const img = el.querySelector("img")
      if (img) {
        img.style.transform = `translateX(${Math.max(-p.w * 0.13, Math.min(p.w * 0.13, -x * 0.065))}px)`
      }
      if (Math.abs(x) < distance) {
        nearest = i
        distance = Math.abs(x)
      }
    })
    if (nearest !== selectedRef.current) {
      selectedRef.current = nearest
      setSelected(nearest)
    }
  }, [])
  React.useEffect(() => {
    const el = root.current
    if (!el) {
      return
    }
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      change = () => {
        quiet.current = media.matches
        if (media.matches) {
          cancelAnimationFrame(frame.current)
          velocity.current = 0
        }
      }
    change()
    media.addEventListener("change", change)
    const ro = new ResizeObserver(() => {
      width.current = el.clientWidth
      render()
    })
    ro.observe(el)
    render()
    return () => {
      ro.disconnect()
      media.removeEventListener("change", change)
      cancelAnimationFrame(frame.current)
    }
  }, [render])
  React.useEffect(() => {
    if (!active) {
      cancelAnimationFrame(frame.current)
      if (drag.current) {
        offset.current = drag.current.offset
      }
      drag.current = null
      render()
      velocity.current = 0
    }
  }, [active, render])
  function settle(i: number, instant = false) {
    if (!active) {
      return
    }
    cancelAnimationFrame(frame.current)
    const from = offset.current,
      to = from + wrap(CENTERS[(i + PLATES.length) % PLATES.length] - from)
    if (instant || quiet.current || !active) {
      offset.current = to
      render()
      return
    }
    let start = 0
    const step = (t: number) => {
      start ||= t
      const progress = Math.min(1, (t - start) / 380)
      offset.current = from + (to - from) * (1 - (1 - progress) ** 3)
      render()
      if (progress < 1) {
        frame.current = requestAnimationFrame(step)
      }
    }
    frame.current = requestAnimationFrame(step)
  }
  function release() {
    const d = drag.current
    if (!d) {
      return
    }
    drag.current = null
    suppress.current = d.moved
    if (!d.moved && d.index !== null && d.index >= 0) {
      settle(d.index)
      return
    }
    if (quiet.current || !active) {
      settle(selectedRef.current, true)
      return
    }
    let last = 0
    const coast = (time: number) => {
      const dt = last ? Math.min(32, time - last) : 16
      last = time
      offset.current += velocity.current * dt
      velocity.current *= Math.exp(-dt / 145)
      render()
      if (Math.abs(velocity.current) > 0.018) {
        frame.current = requestAnimationFrame(coast)
      } else {
        settle(selectedRef.current)
      }
    }
    frame.current = requestAnimationFrame(coast)
  }
  return (
    <div className="sf-parallax-plates" ref={root}>
      <header>
        <b>FIELD STUDIES</b>
        <span>Five observations</span>
      </header>
      <div
        className="pp-track"
        role="region"
        aria-roledescription="carousel"
        aria-label="Photographic index"
        onPointerDown={(e) => {
          if (e.button !== 0 || !active || drag.current) {
            return
          }
          cancelAnimationFrame(frame.current)
          velocity.current = 0
          suppress.current = false
          drag.current = {
            id: e.pointerId,
            x: e.clientX,
            offset: offset.current,
            lastX: e.clientX,
            lastTime: e.timeStamp,
            moved: false,
            index: Number((e.target as HTMLElement).closest("button")?.getAttribute("data-index") ?? -1),
          }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d || d.id !== e.pointerId) {
            return
          }
          const scale = e.currentTarget.clientWidth / e.currentTarget.getBoundingClientRect().width
          const dx = (e.clientX - d.x) * scale
          d.moved ||= Math.abs(dx) > 4
          const dt = Math.max(1, e.timeStamp - d.lastTime)
          velocity.current = Math.max(-2, Math.min(2, ((d.lastX - e.clientX) * scale) / dt))
          d.lastX = e.clientX
          d.lastTime = e.timeStamp
          offset.current = d.offset - dx
          render()
        }}
        onPointerUp={(e) => {
          if (drag.current?.id === e.pointerId) {
            release()
          }
        }}
        onPointerCancel={() => {
          if (drag.current) {
            offset.current = drag.current.offset
          }
          drag.current = null
          velocity.current = 0
          render()
        }}
        onLostPointerCapture={() => {
          if (drag.current) {
            offset.current = drag.current.offset
            drag.current = null
            velocity.current = 0
            render()
          }
        }}
        onKeyDown={(e) => {
          if (!active) {
            return
          }
          if (e.key === "Escape" && drag.current) {
            e.preventDefault()
            offset.current = drag.current.offset
            drag.current = null
            velocity.current = 0
            render()
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault()
            settle(selectedRef.current + (e.key === "ArrowRight" ? 1 : -1), true)
          }
          if (e.key === "Home") {
            e.preventDefault()
            settle(0, true)
          }
          if (e.key === "End") {
            e.preventDefault()
            settle(PLATES.length - 1, true)
          }
        }}
      >
        {PLATES.map((p, i) => (
          <button
            key={p.label}
            disabled={!active}
            data-index={i}
            ref={(el) => {
              buttons.current[i] = el
            }}
            style={{ width: p.w, height: p.h }}
            aria-label={`Center ${p.label}`}
            tabIndex={selected === i ? 0 : -1}
            onFocus={() => {
              if (!drag.current) {
                settle(i, true)
              }
            }}
            onClick={(e) => {
              if (suppress.current) {
                suppress.current = false
                return
              }
              settle(i, e.detail === 0)
            }}
          >
            <img src={p.src} alt={p.alt} draggable={false} />
          </button>
        ))}
      </div>
      <footer>
        <span>
          <b>{String(selected + 1).padStart(2, "0")}</b> / {String(PLATES.length).padStart(2, "0")}
        </span>
        <p aria-live="polite">{PLATES[selected].label}</p>
        <div>
          <button
            disabled={!active}
            aria-label="Previous image"
            onClick={(e) => settle(selectedRef.current - 1, e.detail === 0)}
          >
            ←
          </button>
          <button
            disabled={!active}
            aria-label="Next image"
            onClick={(e) => settle(selectedRef.current + 1, e.detail === 0)}
          >
            →
          </button>
        </div>
      </footer>
      <style>{`.sf-parallax-plates{position:relative;width:100%;height:100%;min-height:280px;background:#f9f9f7;color:#252721;font-family:Arial,sans-serif;overflow:hidden;container-type:size}.sf-parallax-plates *{box-sizing:border-box}.sf-parallax-plates header{position:absolute;top:20px;left:22px;right:22px;display:flex;justify-content:space-between;font-size:9px;letter-spacing:.02em;z-index:1;pointer-events:none}.sf-parallax-plates header b{font-size:10px;font-weight:600;letter-spacing:.08em}.sf-parallax-plates header>span{color:#73746e}.sf-parallax-plates .pp-track{position:absolute;inset:48px 0 54px;touch-action:pan-y;cursor:grab}.sf-parallax-plates .pp-track:active{cursor:grabbing}.sf-parallax-plates .pp-track>button{position:absolute;left:0;top:50%;padding:0;border:0;background:#deded9;overflow:hidden;cursor:inherit;will-change:transform;user-select:none}.sf-parallax-plates .pp-track img{position:absolute;top:0;left:-15%;width:130%;max-width:none;height:100%;object-fit:cover;will-change:transform;pointer-events:none}.sf-parallax-plates .pp-track>button>span{position:absolute;left:9px;bottom:8px;font:9px monospace;color:white;mix-blend-mode:difference}.sf-parallax-plates footer{position:absolute;bottom:10px;left:22px;right:16px;height:44px;display:flex;align-items:center;font-size:9px}.sf-parallax-plates footer>span{font-family:monospace;min-width:68px;color:#969891}.sf-parallax-plates footer b{color:#252721;font-weight:400}.sf-parallax-plates footer p{font-size:11px;margin:0 auto 0 0}.sf-parallax-plates footer>div{display:flex}.sf-parallax-plates footer button{min-width:44px;height:44px;background:none;border:0;font:18px Arial;color:inherit;cursor:pointer;touch-action:manipulation}.sf-parallax-plates button:focus-visible{outline:2px solid #be4227;outline-offset:3px}@container(max-height:320px){.sf-parallax-plates .pp-track{inset:40px 0 50px}.sf-parallax-plates .pp-track>button{max-height:184px}.sf-parallax-plates header{top:15px}.sf-parallax-plates .pp-track>button{margin-top:12px}}`}</style>
    </div>
  )
}
