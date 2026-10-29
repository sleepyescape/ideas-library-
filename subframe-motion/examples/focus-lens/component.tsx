/**
 * MIT License
 * Copyright (c) 2026 Subframe
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
"use client"

import { useEffect, useRef, useState } from "react"

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

function OpticalPlate() {
  return (
    <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="600" height="360" fill="#1538b9" />
      {Array.from({ length: 65 }, (_, i) => (
        <path
          key={i}
          d={`M ${-110 + i * 8} -30 C ${520 - i * 5} ${90 + i * 0.6}, ${80 + i * 6} ${240 - i * 0.8}, ${
            710 - i * 7
          } 390`}
          fill="none"
          stroke={i % 4 === 0 ? "#e8f5fa" : "#9bb9dc"}
          strokeWidth={i % 4 === 0 ? 1.8 : 0.8}
        />
      ))}
      <circle cx="435" cy="125" r="57" fill="#dcedfb" />
      <circle cx="449" cy="116" r="46" fill="#1538b9" />
      {Array.from({ length: 20 }, (_, i) => (
        <line key={i} x1={430 + i * 3.4} x2={360 + i * 3.4} y1="245" y2="315" stroke="#cfe8ff" strokeWidth=".7" />
      ))}
    </svg>
  )
}
export default function FocusLens({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const veil = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const point = useRef({ x: 0.48, y: 0.43 })
  const target = useRef({ x: 0.48, y: 0.43 })
  const request = useRef<(x: number, y: number, instant?: boolean) => void>(() => {})
  const [clear, setClear] = useState(false)
  useEffect(() => {
    const el = root.current
    if (!el) {
      return
    }
    let raf = 0,
      last = 0
    const paint = () => {
      el.querySelector("[role=slider]")?.setAttribute("aria-valuenow", String(Math.round(point.current.x * 100)))
      el.querySelector("[role=slider]")?.setAttribute(
        "aria-valuetext",
        `Horizontal ${Math.round(point.current.x * 100)} percent, vertical ${Math.round(
          point.current.y * 100,
        )} percent`,
      )
      const x = point.current.x * el.clientWidth,
        y = point.current.y * el.clientHeight
      if (veil.current) {
        veil.current.style.maskImage = `radial-gradient(circle 82px at ${x}px ${y}px, transparent 0, transparent 52%, black 100%)`
      }
      if (ring.current) {
        ring.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`
      }
    }
    const tick = (now: number) => {
      const factor = last ? 1 - Math.exp(-Math.min((now - last) / 1000, 0.05) * 18) : 0.18
      last = now
      point.current.x += (target.current.x - point.current.x) * factor
      point.current.y += (target.current.y - point.current.y) * factor
      paint()
      if (Math.abs(target.current.x - point.current.x) + Math.abs(target.current.y - point.current.y) > 0.0002) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }
    request.current = (x, y, instant = false) => {
      target.current = { x: Math.max(0.05, Math.min(0.95, x)), y: Math.max(0.05, Math.min(0.82, y)) }
      if (instant || reduced || !active) {
        point.current = { ...target.current }
        paint()
        return
      }
      if (!raf) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const observer = new ResizeObserver(paint)
    observer.observe(el)
    paint()
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [active, reduced])
  return (
    <section ref={root} className="sf-focus-lens" data-clear={clear} data-still={!active || reduced}>
      <div className="sf-focus-art">
        <OpticalPlate />
      </div>
      <div className="sf-focus-veil" ref={veil}>
        <OpticalPlate />
      </div>
      <div
        className="sf-focus-input"
        role="slider"
        tabIndex={0}
        aria-label="Focus lens position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(point.current.x * 100)}
        aria-valuetext="Use arrow keys to move the lens"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          const r = e.currentTarget.getBoundingClientRect()
          request.current((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" && !e.currentTarget.hasPointerCapture(e.pointerId)) {
            return
          }
          if (!active) {
            return
          }
          const r = e.currentTarget.getBoundingClientRect()
          request.current((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
        }}
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(e.key)) {
            return
          }
          e.preventDefault()
          request.current(
            e.key === "Home"
              ? 0.48
              : target.current.x + (e.key === "ArrowRight" ? 0.08 : e.key === "ArrowLeft" ? -0.08 : 0),
            e.key === "Home"
              ? 0.43
              : target.current.y + (e.key === "ArrowDown" ? 0.08 : e.key === "ArrowUp" ? -0.08 : 0),
            true,
          )
        }}
      />
      <div ref={ring} className="sf-focus-ring" aria-hidden="true" />
      <button type="button" className="sf-focus-button" aria-pressed={clear} onClick={() => setClear(!clear)}>
        {clear ? "Use lens" : "Reveal all"}
        <span aria-hidden="true">{clear ? "⊙" : "↗"}</span>
      </button>
      <style>{`.sf-focus-lens{position:relative;width:100%;height:100%;min-height:260px;background:#1538b9;overflow:hidden;isolation:isolate}.sf-focus-lens *{box-sizing:border-box}.sf-focus-art,.sf-focus-veil{position:absolute;inset:0}.sf-focus-art svg,.sf-focus-veil svg{width:100%;height:100%;display:block}.sf-focus-veil svg{filter:blur(13px)}.sf-focus-veil{background:#1538b9;mask-image:radial-gradient(circle 82px at 48% 43%,transparent 0,transparent 52%,black 100%)}.sf-focus-input{position:absolute;inset:0;cursor:crosshair;touch-action:none}.sf-focus-ring{position:absolute;left:0;top:0;width:126px;height:126px;border:1px solid #e5f0ff75;border-radius:50%;pointer-events:none;box-shadow:0 0 0 4px #13258f18}.sf-focus-lens[data-clear=true] .sf-focus-veil,.sf-focus-lens[data-clear=true] .sf-focus-ring{display:none}.sf-focus-button{position:absolute;left:22px;right:22px;bottom:12px;display:flex;align-items:center;justify-content:space-between;min-height:44px;padding:0 12px;border:1px solid #c9e3ff60;border-radius:0;background:#1538b9cc;color:#fff;font:12px Arial,sans-serif;cursor:pointer}.sf-focus-button span{font-size:20px}.sf-focus-lens :focus-visible{outline:2px solid #fff;outline-offset:-5px}`}</style>
    </section>
  )
}
