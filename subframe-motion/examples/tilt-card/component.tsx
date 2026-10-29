/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/tilt.tsx
 * Standalone composition; inline styles and artwork; bounded motion and reduced-motion behavior.
 *
 * MIT License
 *
 * Copyright (c) 2024 ibelick
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

import { useMotionValue, useSpring } from "motion/react"
import { useEffect, useId, useRef, useState } from "react"

function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  return reduced
}
function geometry(x: number, y: number) {
  const rx = ((4 - y * 36) * Math.PI) / 180,
    ry = ((-8 + x * 36) * Math.PI) / 180
  const project = (px: number, py: number, pz: number) => {
    const yy = py * Math.cos(rx) - pz * Math.sin(rx),
      zz = py * Math.sin(rx) + pz * Math.cos(rx)
    const xx = px * Math.cos(ry) + zz * Math.sin(ry),
      z = -px * Math.sin(ry) + zz * Math.cos(ry)
    const scale = 650 / (650 - z)
    return `${(177 + xx * scale).toFixed(2)},${(135 + yy * scale).toFixed(2)}`
  }
  const corners = (w: number, h: number, z: number) => [
    [-w, -h, z],
    [w, -h, z],
    [w, h, z],
    [-w, h, z],
  ]
  const path = (points: number[][]) => points.map((p, i) => (i ? "L" : "M") + project(p[0], p[1], p[2])).join(" ") + "Z"
  const back = corners(150, 110, -28),
    front = corners(155, 115, 55),
    inner = corners(144, 104, 55),
    rear = corners(140, 100, -25)
  const box = [
    path(back),
    ...front.map((v, i) => path([v, front[(i + 1) % 4], back[(i + 1) % 4], back[i]])),
    ...inner.map((v, i) => path([v, inner[(i + 1) % 4], rear[(i + 1) % 4], rear[i]])),
  ]
  const planes = Array.from({ length: 6 }, (_, i) =>
    path(
      Array.from({ length: 144 }, (_, j) => {
        const a = (j / 144) * Math.PI * 2
        return [-23 + i * 9 + (73 - i * 3) * Math.cos(a), (82 - i * 4) * Math.sin(a), -10 + i * 13]
      }),
    ),
  )
  const rim = path(front) + " " + path([...inner].reverse())
  return { box, planes, rim }
}
const INITIAL = geometry(0, 0)
export default function TiltCard({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion(),
    canAnimate = active && reduced === false,
    id = useId()
  const x = useMotionValue(0),
    y = useMotionValue(0),
    sx = useSpring(x, { stiffness: 230, damping: 26 }),
    sy = useSpring(y, { stiffness: 230, damping: 26 })
  const paths = useRef<Array<SVGPathElement | null>>([]),
    planes = useRef<Array<SVGPathElement | null>>([]),
    rim = useRef<SVGPathElement>(null),
    shadow = useRef<SVGPathElement>(null)
  const reset = (instant = false) => {
    x.set(0)
    y.set(0)
    if (instant) {
      sx.jump(0)
      sy.jump(0)
    }
  }
  useEffect(() => {
    const draw = () => {
      const g = geometry(sx.get(), sy.get())
      g.box.forEach((d, i) => paths.current[i]?.setAttribute("d", d))
      g.planes.forEach((d, i) => planes.current[i]?.setAttribute("d", d))
      rim.current?.setAttribute("d", g.rim)
      shadow.current?.setAttribute("d", g.box[0])
    }
    const a = sx.on("change", draw),
      b = sy.on("change", draw)
    draw()
    return () => {
      a()
      b()
    }
  }, [sx, sy])
  useEffect(() => {
    if (!canAnimate) {
      x.set(0)
      y.set(0)
      sx.jump(0)
      sy.jump(0)
    }
  }, [canAnimate, x, y, sx, sy])
  return (
    <div className="sf-depth-stage">
      <div
        className="sf-depth-target"
        tabIndex={0}
        role="img"
        aria-label="Amber sculpture in a deep display frame. Move the pointer or drag to tilt. Arrow keys change the view; Home resets."
        onPointerDown={(e) => {
          if (canAnimate && e.isPrimary && e.pointerType !== "mouse") {
            e.currentTarget.setPointerCapture(e.pointerId)
          }
        }}
        onPointerMove={(e) => {
          if (
            !canAnimate ||
            !e.isPrimary ||
            (e.pointerType !== "mouse" && !e.currentTarget.hasPointerCapture(e.pointerId))
          ) {
            return
          }
          const r = e.currentTarget.getBoundingClientRect()
          x.set(Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5)))
          y.set(Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5)))
        }}
        onPointerLeave={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
            reset()
          }
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
          reset()
        }}
        onPointerCancel={() => reset()}
        onLostPointerCapture={() => reset()}
        onBlur={() => reset()}
        onKeyDown={(e) => {
          if (!canAnimate) {
            return
          }
          const k = e.key
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "Escape"].includes(k)) {
            return
          }
          e.preventDefault()
          if (k === "Home" || k === "Escape") {
            reset(true)
            return
          }
          if (k === "ArrowLeft" || k === "ArrowRight") {
            const v = Math.max(-0.5, Math.min(0.5, x.get() + (k === "ArrowLeft" ? -0.16 : 0.16)))
            x.set(v)
            sx.jump(v)
          } else {
            const v = Math.max(-0.5, Math.min(0.5, y.get() + (k === "ArrowUp" ? -0.16 : 0.16)))
            y.set(v)
            sy.jump(v)
          }
        }}
      >
        <svg viewBox="0 0 354 270" className="sf-depth-art" aria-hidden="true">
          <defs>
            <radialGradient id={id + "back"}>
              <stop stopColor="#69452e" />
              <stop offset="1" stopColor="#242c2d" />
            </radialGradient>
            <linearGradient id={id + "rim"} x2=".8" y2="1">
              <stop stopColor="#faf5e8" />
              <stop offset="1" stopColor="#d8cfbb" />
            </linearGradient>
            <filter id={id + "shadow"} x="-30%" y="-30%" width="160%" height="180%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            {Array.from({ length: 6 }, (_, i) => (
              <linearGradient key={i} id={`${id}-amber-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop stopColor={i % 2 ? "#ffda83" : "#f9ad2f"} stopOpacity=".7" />
                <stop offset=".5" stopColor="#e87513" stopOpacity=".25" />
                <stop offset="1" stopColor="#80380e" stopOpacity=".55" />
              </linearGradient>
            ))}
          </defs>
          <path
            ref={shadow}
            d={INITIAL.box[0]}
            fill="#2c241c"
            opacity=".32"
            transform="translate(1 22)"
            filter={`url(#${id}shadow)`}
          />
          {INITIAL.box.map((d, i) => (
            <path
              key={i}
              ref={(el) => {
                paths.current[i] = el
              }}
              d={d}
              fill={
                i === 0
                  ? `url(#${id}back)`
                  : ["#c4bba7", "#b1a792", "#a39a86", "#e2d8c4", "#303a39", "#182324", "#1a2627", "#404641"][i - 1]
              }
              stroke={i === 0 ? "none" : "#4f4b4222"}
              strokeWidth=".4"
            />
          ))}
          {INITIAL.planes.map((d, i) => (
            <path
              key={i}
              ref={(el) => {
                planes.current[i] = el
              }}
              d={d}
              fill={`url(#${id}-amber-${i})`}
              stroke="#ffdfa0"
              strokeOpacity={0.45 + i * 0.045}
              strokeWidth=".7"
            />
          ))}
          <path
            ref={rim}
            d={INITIAL.rim}
            fill={`url(#${id}rim)`}
            fillRule="evenodd"
            stroke="#fff8e7"
            strokeWidth=".8"
          />
        </svg>
      </div>
      <style>{`.sf-depth-stage{width:100%;height:100%;min-height:280px;overflow:hidden;display:grid;place-items:center;background:#d4d2cc}.sf-depth-target{width:354px;height:270px;touch-action:none;outline-offset:12px;border-radius:2px}.sf-depth-target:focus-visible{outline:2px solid #805626}.sf-depth-art{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}`}</style>
    </div>
  )
}
