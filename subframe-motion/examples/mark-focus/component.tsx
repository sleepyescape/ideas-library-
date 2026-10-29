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

export default function MarkFocus({ active = true }: { active?: boolean }) {
  const root = useRef<HTMLElement>(null),
    mark = useRef<HTMLDivElement>(null),
    words = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false),
    [reduced, setReduced] = useState(true)
  const target = useRef(false),
    value = useRef(0),
    wake = useRef<() => void>(() => {}),
    immediate = useRef(false)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    const el = root.current,
      m = mark.current,
      w = words.current
    if (!el || !m || !w) {
      return
    }
    let frame = 0,
      last = 0,
      width = 1,
      height = 1,
      size = 1
    const draw = () => {
      const p = value.current,
        part = 1 - Math.pow(1 - p, 3),
        startX = width * 0.72,
        endX = width * 0.5,
        startY = height * 0.43,
        endY = height * 0.43
      m.style.transform = `translate(${startX + (endX - startX) * part - size / 2}px,${
        startY + (endY - startY) * part - size / 2
      }px) scale(${1 + 2.9 * p}) rotate(${p * 45}deg)`
      w.style.opacity = String(Math.max(0, 1 - p * 2.5))
      w.style.transform = `translateX(${-p * width * 0.22}px)`
    }
    const tick = (now: number) => {
      frame = 0
      const dt = last ? Math.min((now - last) / 1000, 0.04) : 1 / 60
      last = now
      const goal = Number(target.current)
      value.current += (goal - value.current) * (1 - Math.exp(-dt * 7))
      if (Math.abs(goal - value.current) < 0.001) {
        value.current = goal
      }
      draw()
      if (value.current !== goal) {
        frame = requestAnimationFrame(tick)
      } else {
        last = 0
      }
    }
    const schedule = () => {
      if (!active || reduced || immediate.current) {
        cancelAnimationFrame(frame)
        frame = 0
        last = 0
        value.current = Number(target.current)
        draw()
      } else if (!frame) {
        frame = requestAnimationFrame(tick)
      }
    }
    wake.current = schedule
    const resize = () => {
      width = el.clientWidth
      height = el.clientHeight
      size = Math.min(width * 0.25, 136)
      m.style.width = `${size}px`
      m.style.height = `${size}px`
      draw()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()
    if (active || reduced) {
      schedule()
    }
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      wake.current = () => {}
    }
  }, [active, reduced])
  const change = (keyboard: boolean) => {
    immediate.current = keyboard
    target.current = !target.current
    setFocused(target.current)
    wake.current()
  }
  return (
    <section ref={root} className="sf-mark-focus">
      <div ref={words} className="mf-wordmark" aria-hidden={focused}>
        <span>NEW</span>
        <span>MONUMENT</span>
        <small>EDITIONS</small>
      </div>
      <div ref={mark} className="mf-mark" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <path d="M0 0h40v40h40V0h40v120H80V80H40v40H0Z" fill="currentColor" />
        </svg>
      </div>
      <button type="button" aria-pressed={focused} onClick={(e) => change(e.detail === 0)}>
        {focused ? "Whole mark" : "Into the mark"}
        <span aria-hidden="true">{focused ? "↙" : "↗"}</span>
      </button>
      <style>{`.sf-mark-focus{position:relative;height:100%;width:100%;min-height:280px;background:#e02d23;color:#171411;overflow:hidden;isolation:isolate;box-sizing:border-box;container-type:inline-size}.sf-mark-focus *{box-sizing:border-box}.sf-mark-focus .mf-wordmark{position:absolute;left:7%;top:26%;display:flex;flex-direction:column;font:900 clamp(20px,6cqw,38px)/.92 Arial,sans-serif;letter-spacing:-.065em;will-change:transform,opacity}.sf-mark-focus .mf-wordmark small{font:10px/1 monospace;letter-spacing:.15em;margin-top:16px}.sf-mark-focus .mf-mark{position:absolute;left:0;top:0;transform-origin:center;will-change:transform}.sf-mark-focus svg{display:block;width:100%;height:100%}.sf-mark-focus button{position:absolute;bottom:18px;left:7%;right:7%;height:44px;border:0;border-top:1px solid #17141155;background:#e02d23;color:inherit;font:11px Arial;display:flex;align-items:center;justify-content:space-between;padding:0;cursor:pointer}.sf-mark-focus button span{font-size:24px}.sf-mark-focus button:focus-visible{outline:2px solid #171411;outline-offset:4px}`}</style>
    </section>
  )
}
