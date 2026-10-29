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

const clamp = (n: number) => Math.max(0, Math.min(1, n))

export default function ScrollWindow({ active = true }: { active?: boolean }) {
  const root = useRef<HTMLElement>(null),
    scroll = useRef<HTMLDivElement>(null),
    paint = useRef(() => {})
  const drag = useRef<{ y: number; start: number } | null>(null),
    moved = useRef(false)
  const [progress, setProgress] = useState(0),
    [reduced, setReduced] = useState(true)
  const amount = useRef(0)
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    const el = root.current,
      scroller = scroll.current
    if (!el || !scroller) {
      return
    }
    const windows = Array.from(el.querySelectorAll<HTMLElement>(".ta-window"))
    const title = el.querySelector<HTMLElement>(".ta-title")!
    const draw = () => {
      const w = el.clientWidth,
        h = el.clientHeight,
        p = amount.current
      windows.forEach((window, i) => {
        const phase = clamp(p * 1.24 - Math.abs(i - 2) * 0.12)
        const eased = phase * phase * (3 - 2 * phase)
        const apertureWidth = [68, 104, 148, 104, 68][i] * Math.min(1, w / 600)
        const left = (w * 0.67 - apertureWidth / 2) * (1 - eased)
        const right = (w * 0.33 - apertureWidth / 2) * (1 - eased)
        const top = h * (0.14 + i * 0.14) * (1 - eased) + ((h * i) / 5) * eased
        const bottom = h * (1 - 0.14 - (i + 1) * 0.14) * (1 - eased) + ((h * (4 - i)) / 5) * eased
        window.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`
        const image = window.firstElementChild as HTMLElement
        image.style.transform = `scale(${reduced ? 1 : 1.14 - p * 0.14})`
      })
      title.style.opacity = String(clamp(1 - p * 2.4))
      title.style.transform = `translateY(${reduced ? 0 : -p * 28}px)`
    }
    const update = () => {
      amount.current = clamp(scroller.scrollTop / Math.max(1, scroller.scrollHeight - scroller.clientHeight))
      setProgress(amount.current)
      draw()
    }
    paint.current = draw
    const resize = new ResizeObserver(draw)
    resize.observe(el)
    scroller.addEventListener("scroll", update, { passive: true })
    update()
    return () => {
      resize.disconnect()
      scroller.removeEventListener("scroll", update)
    }
  }, [reduced])
  useEffect(() => {
    if (!active && scroll.current) {
      scroll.current.scrollTo({ top: scroll.current.scrollTop, behavior: "instant" })
    }
  }, [active])
  const seek = (value: number, smooth = false) => {
    const el = scroll.current
    if (!el) {
      return
    }
    if (!smooth || !active || reduced) {
      amount.current = clamp(value)
      setProgress(amount.current)
      paint.current()
    }
    el.scrollTo({
      top: clamp(value) * (el.scrollHeight - el.clientHeight),
      behavior: smooth && active && !reduced ? "smooth" : "instant",
    })
  }
  return (
    <section ref={root} className="sf-scroll-window" data-open={progress > 0.5} aria-label="Tidal aperture reveal">
      <style>{`.sf-scroll-window{position:relative;width:100%;height:100%;min-height:280px;background:#ed592f;color:#39160d;overflow:hidden;font-family:Arial,sans-serif;isolation:isolate}.sf-scroll-window *{box-sizing:border-box}.sf-scroll-window .ta-title{position:absolute;left:7%;top:31%;margin:0;z-index:1;font:600 clamp(48px,13cqw,78px)/.88 Arial,sans-serif;letter-spacing:-.08em;pointer-events:none}.sf-scroll-window{container-type:size}.sf-scroll-window .ta-window{position:absolute;inset:0;pointer-events:none}.sf-scroll-window .ta-window img{display:block;width:100%;height:100%;object-fit:cover}.sf-scroll-window .ta-scroll{position:absolute;inset:0;z-index:2;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;cursor:ns-resize;touch-action:pan-y}.sf-scroll-window .ta-scroll::-webkit-scrollbar{display:none}.sf-scroll-window .ta-track{height:210%;pointer-events:none}.sf-scroll-window footer{position:absolute;z-index:3;left:7%;right:7%;bottom:18px;display:flex;align-items:center;justify-content:space-between;pointer-events:none;color:#39160d}.sf-scroll-window footer:before{content:'';position:absolute;z-index:-1;inset:-80px -50px -20px;background:linear-gradient(transparent,#082c4b55);opacity:0;transition:opacity 180ms}.sf-scroll-window[data-open=true] footer:before{opacity:1}.sf-scroll-window[data-open=true] footer{color:#fff}.sf-scroll-window .ta-control{display:flex;align-items:center;gap:11px;pointer-events:auto;font-size:10px;font-variant-numeric:tabular-nums}.sf-scroll-window input{appearance:none;width:116px;height:44px;padding:0;margin:0;background:transparent;cursor:ew-resize;accent-color:currentColor;color:inherit;touch-action:pan-y}.sf-scroll-window input::-webkit-slider-runnable-track{height:1px;background:currentColor}.sf-scroll-window input::-webkit-slider-thumb{appearance:none;margin-top:-6px;width:13px;height:13px;border:2px solid currentColor;border-radius:50%;background:#ed592f;box-shadow:0 0 0 3px #ed592f}.sf-scroll-window input::-moz-range-track{height:1px;background:currentColor}.sf-scroll-window input::-moz-range-thumb{width:10px;height:10px;border:2px solid currentColor;border-radius:50%;background:#ed592f}.sf-scroll-window button{pointer-events:auto;min-height:44px;padding:0 15px;border:1px solid #39160d80;color:#39160d;background:#ed592f;border-radius:2px;font:12px Arial,sans-serif;cursor:pointer;display:flex;align-items:center;gap:22px;transition:background-color 150ms,transform 150ms}.sf-scroll-window button:active{transform:scale(.97)}.sf-scroll-window button span:last-child{font-size:20px}.sf-scroll-window button:focus-visible,.sf-scroll-window input:focus-visible{outline:2px solid #fff;outline-offset:4px}.sf-scroll-window .ta-scroll:focus-visible{outline:2px solid #fff;outline-offset:-5px}@media(hover:hover){.sf-scroll-window button:hover{background:#ff724a}}@media(prefers-reduced-motion:reduce){.sf-scroll-window footer:before,.sf-scroll-window button{transition:none}}`}</style>
      <h3 className="ta-title">Tidal</h3>
      <div role="img" aria-label="Turquoise waves breaking onto a dark shoreline">
        {Array.from({ length: 5 }, (_, i) => (
          <div className="ta-window" key={i} aria-hidden="true">
            <img src="/motion/assets/blue-tide.webp" alt="" draggable={false} />
          </div>
        ))}
      </div>
      <div
        className="ta-scroll"
        ref={scroll}
        tabIndex={0}
        aria-label="Scroll down to open the coastal photograph, or use the aperture slider"
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) {
            return
          }
          moved.current = false
          drag.current = { y: event.clientY, start: amount.current }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!drag.current || !root.current) {
            return
          }
          const scale = root.current.clientHeight / root.current.getBoundingClientRect().height
          const delta = (drag.current.y - event.clientY) * scale
          if (Math.abs(delta) > 3) {
            moved.current = true
          }
          if (moved.current) {
            seek(drag.current.start + delta / (root.current.clientHeight * 0.7))
          }
        }}
        onPointerUp={(event) => {
          drag.current = null
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onLostPointerCapture={() => {
          drag.current = null
        }}
      >
        <div className="ta-track" />
      </div>
      <footer>
        <label className="ta-control">
          <input
            aria-label="Coastal aperture"
            type="range"
            min="0"
            max="100"
            value={Math.round(progress * 100)}
            onChange={(event) => seek(+event.target.value / 100)}
          />
          <span>{String(Math.round(progress * 100)).padStart(2, "0")}%</span>
        </label>
        <button
          onClick={(event) => seek(progress > 0.5 ? 0 : 1, event.detail !== 0)}
          aria-label={progress > 0.5 ? "Close coastal view" : "Open coastal view"}
        >
          <span>{progress > 0.5 ? "Close view" : "Open view"}</span>
          <span aria-hidden="true">{progress > 0.5 ? "↙" : "↗"}</span>
        </button>
      </footer>
    </section>
  )
}
