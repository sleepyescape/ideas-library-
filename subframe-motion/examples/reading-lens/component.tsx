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

const lines = [
  "The building opens to the street.",
  "A narrow vestibule collects",
  "the noise. Beyond it, the ceiling",
  "lifts and the room becomes quiet.",
  "",
  "Nothing marks the change.",
  "There is no door to open,",
  "only a difference in proportion.",
  "",
  "At noon, a band of light",
  "moves across the east wall.",
  "The benches face it rather",
  "than the entrance. People turn",
  "toward the room, not the street.",
  "",
  "We drew the windows last.",
  "First came the distance between",
  "two people sitting together;",
  "then a place for a third.",
  "",
  "A room is not its outline.",
  "It is the space left for",
  "something to happen.",
]
export default function ReadingLens({ active = true }: { active?: boolean }) {
  const viewport = useRef<HTMLDivElement>(null),
    content = useRef<HTMLDivElement>(null),
    redraw = useRef<() => void>(() => {}),
    initialized = useRef(false)
  const [lens, setLens] = useState(true),
    [reduced, setReduced] = useState(true),
    [position, setPosition] = useState(1)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    const box = viewport.current,
      body = content.current
    if (!box || !body) {
      return
    }
    const update = () => {
      const focus = box.scrollTop / 26
      setPosition(Math.min(lines.length, Math.round(focus) + 1))
      Array.from(body.children).forEach((n, i) => {
        const el = n as HTMLElement,
          d = i - focus,
          a = Math.abs(d)
        const offset = a <= 2 ? d * 26 : Math.sign(d) * (52 + 81.25 * (1 - Math.exp(-(a - 2) * 0.32)))
        const scale = a <= 2 ? 1 : Math.max(0.08, Math.exp(-(a - 2) * 0.32))
        el.style.transform = lens && !reduced ? `translateY(${offset - d * 26}px) scaleY(${scale})` : ""
        el.style.opacity = lens && !reduced ? String(Math.max(0, Math.min(1, 1 - (a - 2) * 0.14))) : "1"
      })
    }
    redraw.current = update
    const resize = () => {
      body.style.paddingBlock = `${Math.max(0, (box.clientHeight - 26) / 2)}px`
      if (!initialized.current) {
        box.scrollTop = 156
        initialized.current = true
      }
      update()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(box)
    resize()
    return () => {
      observer.disconnect()
      redraw.current = () => {}
    }
  }, [lens, reduced])
  useEffect(() => {
    if ((!active || reduced) && viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollTop, behavior: "instant" })
    }
  }, [active, reduced])
  return (
    <section className="sf-reading-lens">
      <header>
        <span>ON SPACE</span>
        <button type="button" aria-pressed={lens} onClick={() => setLens(!lens)}>
          Lens <i aria-hidden="true" />
        </button>
      </header>
      <div
        ref={viewport}
        className="rl-reader"
        tabIndex={0}
        aria-label="Scroll the architectural note"
        onScroll={() => redraw.current()}
      >
        <div ref={content} className="rl-lines">
          {lines.map((line, i) => (
            <p key={i}>{line || "\u00a0"}</p>
          ))}
        </div>
      </div>
      <footer>
        <span>
          {String(position).padStart(2, "0")}
          <b> / {lines.length}</b>
        </span>
        <button
          type="button"
          aria-label="Read next passage"
          onClick={(e) => {
            const el = viewport.current
            if (el) {
              el.scrollTo({
                top: el.scrollTop >= el.scrollHeight - el.clientHeight - 2 ? 0 : el.scrollTop + 156,
                behavior: active && !reduced && e.detail !== 0 ? "smooth" : "instant",
              })
            }
          }}
        >
          ↓
        </button>
      </footer>
      <style>{`.sf-reading-lens{height:100%;width:100%;min-height:280px;display:flex;flex-direction:column;background:#191b1b;color:#f2f0e8;overflow:hidden;box-sizing:border-box;font-family:Arial,sans-serif}.sf-reading-lens *{box-sizing:border-box}.sf-reading-lens header,.sf-reading-lens footer{height:50px;flex:none;display:flex;align-items:center;justify-content:space-between;margin:0 26px;font:10px monospace}.sf-reading-lens header{border-bottom:1px solid #ffffff24;letter-spacing:.1em}.sf-reading-lens footer{border-top:1px solid #ffffff24}.sf-reading-lens footer b{font-weight:400;color:#969a98}.sf-reading-lens button{border:0;background:none;color:inherit;height:44px;min-width:44px;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;font:11px Arial}.sf-reading-lens footer button{font-size:24px}.sf-reading-lens header i{width:6px;height:6px;border-radius:50%;background:#777}.sf-reading-lens button[aria-pressed=true] i{background:#e9f174}.sf-reading-lens .rl-reader{flex:1;min-height:0;overflow:auto;scrollbar-width:none;overscroll-behavior:contain;position:relative}.sf-reading-lens .rl-reader::-webkit-scrollbar{display:none}.sf-reading-lens .rl-lines{width:max-content;max-width:100%;margin:auto}.sf-reading-lens p{height:26px;line-height:26px;font-family:Georgia,serif;font-size:clamp(14px,3.4vw,17px);margin:0;white-space:pre;transform-origin:center;will-change:transform;letter-spacing:-.1px}.sf-reading-lens :focus-visible{outline:2px solid #e9f174;outline-offset:-3px}@media(max-width:400px){.sf-reading-lens header,.sf-reading-lens footer{margin:0 18px}.sf-reading-lens p{font-size:14px}}`}</style>
    </section>
  )
}
