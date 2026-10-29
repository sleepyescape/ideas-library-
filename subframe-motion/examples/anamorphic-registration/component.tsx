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

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"

type Config = { planeSeparation: number; viewRange: number; snapRadius: number; snapTime: number }
export const DEFAULT_CONFIG: Config = { planeSeparation: 0.6, viewRange: 30, snapRadius: 3, snapTime: 180 }

type Point = [number, number]
type Plane = { left: number; right: number; depth: number }
const PLANES: Plane[] = [
  { left: -130, right: -43, depth: -150 },
  { left: -43, right: 43, depth: 0 },
  { left: 43, right: 130, depth: 150 },
]
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const circle = (radius: number): Point[] =>
  Array.from({ length: 96 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2
    return [Math.cos(angle) * radius, Math.sin(angle) * radius]
  })
const OUTLINE = circle(94)
const COUNTER = circle(58)
const CUT: Point[] = [
  [-98, -15],
  [98, -15],
  [98, 15],
  [-98, 15],
]

// Each fragment is the inverse projection of its desired registered silhouette.
function project(point: Point, depth: number, angle: number): Point {
  const distance = 600
  const radians = (angle * Math.PI) / 180
  const x = (point[0] * (distance - depth)) / distance
  const y = (point[1] * (distance - depth)) / distance
  const viewX = x * Math.cos(radians) + depth * Math.sin(radians)
  const viewZ = depth * Math.cos(radians) - x * Math.sin(radians)
  return [300 + (0.86 * distance * viewX) / (distance - viewZ), 170 + (0.86 * distance * y) / (distance - viewZ)]
}
const path = (points: Point[], depth: number, angle: number) =>
  points.map((point, index) => `${index ? "L" : "M"}${project(point, depth, angle).join(",")}`).join("") + "Z"

export default function AnamorphicRegistration({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<Config>
}) {
  const settings = { ...DEFAULT_CONFIG, ...config }
  const planeSeparation = clamp(
    Number.isFinite(settings.planeSeparation) ? settings.planeSeparation : DEFAULT_CONFIG.planeSeparation,
    0.2,
    1,
  )
  const viewRange = clamp(Number.isFinite(settings.viewRange) ? settings.viewRange : DEFAULT_CONFIG.viewRange, 10, 50)
  const snapRadius = clamp(Number.isFinite(settings.snapRadius) ? settings.snapRadius : DEFAULT_CONFIG.snapRadius, 0, 6)
  const snapTime = clamp(Number.isFinite(settings.snapTime) ? settings.snapTime : DEFAULT_CONFIG.snapTime, 100, 300)
  const id = useId().replace(/:/g, "")
  const [reduced, setReduced] = useState(true)
  const [aligned, setAligned] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const [animation, setAnimation] = useState(0)
  const scene = useRef<SVGSVGElement>(null)
  const slider = useRef<HTMLInputElement>(null)
  const readout = useRef<HTMLOutputElement>(null)
  const angle = useRef(Math.min(22, viewRange))
  const outlines = useRef(new Map<number, SVGPathElement>())
  const surfaces = useRef(new Map<number, SVGPathElement>())
  const marks = useRef(new Map<number, SVGPathElement>())
  const cuts = useRef(new Map<number, SVGPathElement>())
  const edges = useRef(new Map<number, SVGPathElement>())
  const tween = useRef<{ from: number; time: number; duration: number } | null>(null)
  const drag = useRef<{ pointer: number; x: number; start: number } | null>(null)
  const options = useRef({ planeSeparation, viewRange, snapRadius, snapTime, reduced })
  options.current = { planeSeparation, viewRange, snapRadius, snapTime, reduced }

  const paint = useCallback((value: number) => {
    angle.current = clamp(value, -options.current.viewRange, options.current.viewRange)
    const yaw = angle.current
    for (let index = 0; index < PLANES.length; index++) {
      const plane = PLANES[index]
      const depth = plane.depth * options.current.planeSeparation
      const corners: Point[] = [
        [plane.left, -107],
        [plane.right, -107],
        [plane.right, 107],
        [plane.left, 107],
      ]
      const face = path(corners, depth, yaw)
      outlines.current.get(index)?.setAttribute("d", face)
      surfaces.current.get(index)?.setAttribute("d", face)
      marks.current.get(index)?.setAttribute("d", path(OUTLINE, depth, yaw) + path(COUNTER, depth, yaw))
      cuts.current.get(index)?.setAttribute("d", path(CUT, depth, yaw))
      const side = yaw < 0 ? plane.left : plane.right
      const top = project([side, -107], depth, yaw)
      const bottom = project([side, 107], depth, yaw)
      const offset = Math.sin((yaw * Math.PI) / 180) * 8
      edges.current.get(index)?.setAttribute("d", `M${top}L${bottom}l${offset},3L${top[0] + offset},${top[1] + 3}Z`)
    }
    if (slider.current) {
      slider.current.value = String(yaw)
    }
    if (readout.current) {
      readout.current.textContent = `${Math.abs(yaw) < 0.05 ? "0.0" : yaw.toFixed(1)}°`
    }
    setAligned(Math.abs(yaw) < 0.05)
  }, [])

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useLayoutEffect(() => {
    paint(angle.current)
  }, [planeSeparation, viewRange, paint])

  useEffect(() => {
    if (!active && drag.current) {
      const pointer = drag.current.pointer
      drag.current = null
      if (scene.current?.hasPointerCapture(pointer)) {
        scene.current.releasePointerCapture(pointer)
      }
    }
  }, [active])

  useEffect(() => {
    if (reduced && tween.current) {
      tween.current = null
      paint(0)
      setAnnouncement("The three fragments are aligned into one mark.")
    }
  }, [reduced, paint])

  useEffect(() => {
    if (!active || !tween.current || reduced) {
      return
    }
    let frame = 0
    let last: number | undefined
    const tick = (now: number) => {
      const current = tween.current
      if (!current) {
        return
      }
      if (last !== undefined) {
        current.time += now - last
      }
      last = now
      const progress = clamp(current.time / current.duration, 0, 1)
      paint(current.from * Math.pow(1 - progress, 3))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        tween.current = null
        setAnnouncement("The three fragments are aligned into one mark.")
      }
    }
    const visibility = () => {
      cancelAnimationFrame(frame)
      last = undefined
      if (!document.hidden && tween.current) {
        frame = requestAnimationFrame(tick)
      }
    }
    visibility()
    document.addEventListener("visibilitychange", visibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [active, animation, reduced, paint])

  const align = () => {
    if (!active) {
      return
    }
    setAnnouncement("")
    if (reduced) {
      tween.current = null
      paint(0)
      setAnnouncement("The three fragments are aligned into one mark.")
    } else {
      tween.current = { from: angle.current, time: 0, duration: options.current.snapTime }
      setAnimation((value) => value + 1)
    }
  }
  const move = (value: number) => {
    if (!active) {
      return
    }
    tween.current = null
    setAnnouncement("")
    paint(value)
  }
  const finishDrag = (pointer: number) => {
    if (drag.current?.pointer !== pointer) {
      return
    }
    drag.current = null
    if (Math.abs(angle.current) <= options.current.snapRadius) {
      align()
    }
  }

  return (
    <section className="sf-anamorphic-registration" aria-label="Perspective registration">
      <header>
        <span>{aligned ? "One mark." : "Three planes."}</span>
        <output ref={readout} aria-hidden="true">
          22.0°
        </output>
      </header>
      <svg
        ref={scene}
        viewBox="0 0 600 375"
        role="img"
        aria-label={
          aligned
            ? "A single white divided ring, aligned across three depth planes."
            : "White ring fragments distributed across three separated black planes."
        }
        onPointerDown={(event) => {
          if (!active || event.button !== 0) {
            return
          }
          event.preventDefault()
          tween.current = null
          drag.current = { pointer: event.pointerId, x: event.clientX, start: angle.current }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!active || drag.current?.pointer !== event.pointerId) {
            return
          }
          const width = event.currentTarget.getBoundingClientRect().width
          move(drag.current.start + ((event.clientX - drag.current.x) / width) * options.current.viewRange * 3)
        }}
        onPointerUp={(event) => {
          finishDrag(event.pointerId)
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        }}
        onPointerCancel={(event) => {
          if (drag.current?.pointer === event.pointerId) {
            drag.current = null
          }
        }}
        onLostPointerCapture={(event) => {
          if (drag.current?.pointer === event.pointerId) {
            drag.current = null
          }
        }}
      >
        <defs>
          {PLANES.map((_, index) => (
            <clipPath id={`${id}-plane-${index}`} key={index}>
              <path
                ref={(node) => {
                  if (node) {
                    outlines.current.set(index, node)
                  } else {
                    outlines.current.delete(index)
                  }
                }}
              />
            </clipPath>
          ))}
        </defs>
        <g>
          {PLANES.map((_, index) => (
            <g key={index}>
              <path
                fill="#696761"
                ref={(node) => {
                  if (node) {
                    edges.current.set(index, node)
                  } else {
                    edges.current.delete(index)
                  }
                }}
              />
              <path
                fill="#171918"
                ref={(node) => {
                  if (node) {
                    surfaces.current.set(index, node)
                  } else {
                    surfaces.current.delete(index)
                  }
                }}
              />
              <g clipPath={`url(#${id}-plane-${index})`}>
                <path
                  fill="#fffdf5"
                  fillRule="evenodd"
                  ref={(node) => {
                    if (node) {
                      marks.current.set(index, node)
                    } else {
                      marks.current.delete(index)
                    }
                  }}
                />
                <path
                  fill="#171918"
                  ref={(node) => {
                    if (node) {
                      cuts.current.set(index, node)
                    } else {
                      cuts.current.delete(index)
                    }
                  }}
                />
              </g>
            </g>
          ))}
        </g>
        <path d="M294 47h12M300 41v12" stroke="#bc3c2b" strokeWidth="1.5" />
        <path d="M294 293h12M300 287v12" stroke="#bc3c2b" strokeWidth="1.5" />
      </svg>
      <footer>
        <label>
          <span>Viewpoint</span>
          <input
            ref={slider}
            type="range"
            disabled={!active}
            min={-viewRange}
            max={viewRange}
            step="0.1"
            defaultValue={Math.min(22, viewRange)}
            aria-label="Viewpoint in degrees"
            onChange={(event) => move(Number(event.target.value))}
            onPointerUp={() => {
              if (Math.abs(angle.current) <= snapRadius) {
                align()
              }
            }}
          />
        </label>
        <button type="button" disabled={!active} onClick={align}>
          <span aria-hidden="true">⌖</span>Align
        </button>
      </footer>
      <p className="ar-sr" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <style>{`.sf-anamorphic-registration{position:relative;width:100%;height:100%;min-height:300px;overflow:hidden;background:#d9d7ce;color:#242622;font-family:Arial,Helvetica,sans-serif;container-type:inline-size}.sf-anamorphic-registration *{box-sizing:border-box}.sf-anamorphic-registration header{position:absolute;z-index:1;left:7%;right:7%;top:8%;display:flex;justify-content:space-between;pointer-events:none;font-size:12px;font-weight:600}.sf-anamorphic-registration output{font:11px ui-monospace,monospace;font-variant-numeric:tabular-nums}.sf-anamorphic-registration svg{display:block;width:100%;height:100%;touch-action:pan-y;cursor:ew-resize;user-select:none}.sf-anamorphic-registration footer{position:absolute;left:7%;right:7%;bottom:5%;display:flex;align-items:center;justify-content:space-between;gap:32px}.sf-anamorphic-registration label{display:flex;align-items:center;gap:16px;flex:1;min-width:0;height:44px;font-size:11px;color:#50524a}.sf-anamorphic-registration input{width:100%;min-width:40px;height:44px;margin:0;accent-color:#a73628;cursor:ew-resize}.sf-anamorphic-registration input:focus-visible{outline:2px solid #a73628;outline-offset:4px;border-radius:2px}.sf-anamorphic-registration button{display:flex;align-items:center;justify-content:center;gap:10px;min-height:44px;min-width:96px;padding:0 14px;border:0;border-radius:2px;color:#fffdf5;background:#a73628;font:12px Arial,sans-serif;cursor:pointer;touch-action:manipulation}.sf-anamorphic-registration button>span{font-size:23px;line-height:1}.sf-anamorphic-registration button:focus-visible{outline:2px solid #171918;outline-offset:3px}.sf-anamorphic-registration button:disabled{opacity:.5;cursor:default}.sf-anamorphic-registration input:disabled{opacity:.5;cursor:default}.sf-anamorphic-registration button:active:not(:disabled){background:#842b20}.sf-anamorphic-registration .ar-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@media(hover:hover) and (pointer:fine){.sf-anamorphic-registration button:hover{background:#922d23}}@container(max-width:400px){.sf-anamorphic-registration footer{gap:16px}.sf-anamorphic-registration label{gap:8px}.sf-anamorphic-registration button{min-width:80px}}`}</style>
    </section>
  )
}
