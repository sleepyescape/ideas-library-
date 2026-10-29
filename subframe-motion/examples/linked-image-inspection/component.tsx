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

import { type KeyboardEvent, type PointerEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

type Config = { maxZoom: number; companionRatio: number; panSettleMs: number; showCorrespondence: boolean }
export const DEFAULT_CONFIG: Config = { maxZoom: 5, companionRatio: 1.5, panSettleMs: 140, showCorrespondence: true }
const PROOFS = {
  1400: "/motion/assets/print-proof-1400.webp",
  2100: "/motion/assets/print-proof-2100.webp",
  2800: "/motion/assets/print-proof-2800.webp",
} as const
const WIDTH = 267,
  HEIGHT = 248,
  RATIO = 2069 / 1400
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
type Camera = { x: number; y: number; zoom: number }
const INITIAL: Camera = { x: 0.51, y: 0.76, zoom: 1.4 }
function bounded(camera: Camera, maximum: number): Camera {
  const zoom = clamp(camera.zoom, HEIGHT / WIDTH / RATIO, maximum)
  const hx = 0.5 / zoom,
    hy = HEIGHT / WIDTH / zoom / 2
  return {
    zoom,
    x: hx >= 0.5 ? 0.5 : clamp(camera.x, hx, 1 - hx),
    y: hy >= RATIO / 2 ? RATIO / 2 : clamp(camera.y, hy, RATIO - hy),
  }
}
function useStageScale(host: { current: HTMLDivElement | null }) {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const node = host.current
    if (!node) {
      return
    }
    const update = () => setScale(Math.min(node.clientWidth / 600, node.clientHeight / 375))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [host])
  return scale
}

export default function LinkedImageInspection({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<Config>
}) {
  const host = useRef<HTMLDivElement>(null)
  const scale = useStageScale(host)
  const c = { ...DEFAULT_CONFIG, ...config }
  const root = useRef<HTMLDivElement>(null)
  const camera = useRef(INITIAL)
  const pointer = useRef<{
    id: number
    x: number
    y: number
    camera: Camera
    last: { x: number; y: number; time: number }
    velocity: { x: number; y: number }
    element: HTMLDivElement
  } | null>(null)
  const settle = useRef<number>(0)
  const [reduced, setReduced] = useState(false)
  const [dragging, setDragging] = useState(false)
  const proofWidth = c.companionRatio < 1.25 ? 1400 : c.companionRatio < 1.75 ? 2100 : 2800
  const maximum = clamp(c.maxZoom, 2, 6)
  const apply = useCallback(
    (next: Camera) => {
      const p = bounded(next, maximum)
      camera.current = p
      root.current?.querySelectorAll<HTMLElement>("[data-inspection-image]").forEach((node) => {
        node.style.transform = `translate(${WIDTH / 2 - p.x * WIDTH * p.zoom}px,${
          HEIGHT / 2 - p.y * WIDTH * p.zoom
        }px) scale(${p.zoom})`
      })
      root.current?.setAttribute("data-camera", JSON.stringify(p))
      const readout = root.current?.querySelector("[data-zoom]")
      if (readout) {
        readout.textContent = `${Math.round(p.zoom * 100)}%`
      }
      root.current?.querySelectorAll<HTMLElement>("[data-source-pixel]").forEach((node, i) => {
        node.textContent = `${Math.round(p.x * (i ? proofWidth : 1400))}, ${Math.round(
          p.y * (i ? proofWidth : 1400),
        )} px`
      })
    },
    [maximum, proofWidth],
  )
  const stop = useCallback(() => {
    cancelAnimationFrame(settle.current)
    settle.current = 0
  }, [])
  const cancelDrag = useCallback(() => {
    stop()
    const p = pointer.current
    if (!p) {
      return
    }
    pointer.current = null
    apply(p.camera)
    setDragging(false)
    if (p.element.hasPointerCapture(p.id)) {
      p.element.releasePointerCapture(p.id)
    }
  }, [apply, stop])
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => {
      media.removeEventListener("change", update)
      cancelAnimationFrame(settle.current)
    }
  }, [])
  useLayoutEffect(() => {
    cancelAnimationFrame(settle.current)
    apply(camera.current)
  }, [apply, c.showCorrespondence])
  useEffect(() => {
    if (reduced) {
      stop()
    }
  }, [reduced, stop])
  useEffect(() => {
    if (active) {
      return
    }
    cancelDrag()
  }, [active, cancelDrag])
  function zoom(delta: number) {
    if (!active) {
      return
    }
    stop()
    apply({ ...camera.current, zoom: camera.current.zoom + delta })
  }
  function start(e: PointerEvent<HTMLDivElement>) {
    if (!active || e.button !== 0 || pointer.current) {
      return
    }
    e.preventDefault()
    stop()
    e.currentTarget.focus({ preventScroll: true })
    e.currentTarget.setPointerCapture(e.pointerId)
    pointer.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      camera: { ...camera.current },
      last: { x: e.clientX, y: e.clientY, time: e.timeStamp },
      velocity: { x: 0, y: 0 },
      element: e.currentTarget,
    }
    setDragging(true)
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    const p = pointer.current
    if (!p || p.id !== e.pointerId) {
      return
    }
    const width = e.currentTarget.getBoundingClientRect().width
    const unit = width * p.camera.zoom,
      dt = Math.max(8, e.timeStamp - p.last.time)
    p.velocity = { x: -(e.clientX - p.last.x) / unit / dt, y: -(e.clientY - p.last.y) / unit / dt }
    p.last = { x: e.clientX, y: e.clientY, time: e.timeStamp }
    apply({ zoom: p.camera.zoom, x: p.camera.x - (e.clientX - p.x) / unit, y: p.camera.y - (e.clientY - p.y) / unit })
  }
  function release(e: PointerEvent<HTMLDivElement>, cancelled = false) {
    const p = pointer.current
    if (!p || p.id !== e.pointerId) {
      return
    }
    if (cancelled) {
      cancelDrag()
      return
    }
    pointer.current = null
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    const duration =
      reduced || cancelled || !active || e.timeStamp - p.last.time > 90 ? 0 : clamp(c.panSettleMs, 0, 220)
    if (!duration) {
      return
    }
    const from = camera.current
    const to = bounded(
      {
        ...from,
        x: from.x + clamp(p.velocity.x * duration * 0.25, -0.12, 0.12),
        y: from.y + clamp(p.velocity.y * duration * 0.25, -0.12, 0.12),
      },
      maximum,
    )
    let began = 0
    function tick(time: number) {
      if (!began) {
        began = time
      }
      const t = Math.min(1, (time - began) / duration),
        k = 1 - (1 - t) ** 3
      apply({ zoom: from.zoom, x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k })
      if (t < 1) {
        settle.current = requestAnimationFrame(tick)
      }
    }
    settle.current = requestAnimationFrame(tick)
  }
  function key(e: KeyboardEvent<HTMLDivElement>) {
    if (!active) {
      return
    }
    if (e.key === "Escape" && pointer.current) {
      e.preventDefault()
      cancelDrag()
      return
    }
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    if (steps[e.key]) {
      e.preventDefault()
      stop()
      const [x, y] = steps[e.key]
      apply({
        ...camera.current,
        x: camera.current.x + (x * 0.09) / camera.current.zoom,
        y: camera.current.y + (y * 0.09) / camera.current.zoom,
      })
    } else if (e.key === "+" || e.key === "=" || e.key === "-") {
      e.preventDefault()
      zoom(e.key === "-" ? -0.5 : 0.5)
    } else if (e.key === "Home") {
      e.preventDefault()
      stop()
      apply({ x: 0.5, y: RATIO / 2, zoom: HEIGHT / WIDTH / RATIO })
    }
  }
  return (
    <div
      ref={host}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "8 / 5",
        position: "relative",
        overflow: "hidden",
        background: "#171918",
      }}
    >
      <div
        ref={root}
        className="sf-linked-proof"
        style={{
          width: 600,
          height: 375,
          background: "#171918",
          color: "#f0f0e9",
          fontFamily: "Arial, sans-serif",
          padding: "22px 26px",
          overflow: "hidden",
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          boxSizing: "border-box",
        }}
      >
        <style>{`.sf-linked-proof button{color:inherit;border:0;background:none;height:32px;min-width:34px;cursor:pointer;display:grid;place-items:center;border-radius:4px}.sf-linked-proof button:active{background:#ffffff22}.sf-linked-proof button:focus-visible,.sf-linked-proof [data-pane]:focus-visible{outline:2px solid #e4ee9f;outline-offset:3px}.sf-linked-proof button:disabled{opacity:.4;cursor:default}@media(hover:hover){.sf-linked-proof button:hover{background:#ffffff15}}`}</style>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 26,
            marginBottom: 13,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-.2px" }}>Print proof</span>
          <span style={{ fontSize: 10, color: "#c9d493", display: "flex", gap: 5, alignItems: "center" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="m6 10 4-4M6 6l1.5-1.5a3 3 0 0 1 4 4L10 10M6 6 4.5 7.5a3 3 0 0 0 4 4L10 10"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Linked views
          </span>
        </header>
        <div style={{ display: "flex", gap: 14 }}>
          {["Color", "Luminance"].map((name, i) => (
            <div key={name} style={{ width: WIDTH }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 9,
                  marginBottom: 8,
                  color: "#959b96",
                }}
              >
                <span style={{ color: "#d2d7d0" }}>{name}</span>
                <span style={{ fontFamily: "monospace" }}>{i ? proofWidth : 1400} px</span>
              </div>
              <div
                data-pane={i}
                role="group"
                aria-label={`${name} inspection. Drag to pan, use arrows to move, plus and minus to zoom, Home to fit.`}
                tabIndex={active ? 0 : -1}
                onKeyDown={key}
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={(e) => release(e)}
                onPointerCancel={(e) => release(e, true)}
                onLostPointerCapture={(e) => release(e, true)}
                onDoubleClick={() => zoom(1)}
                style={{
                  width: WIDTH,
                  height: HEIGHT,
                  position: "relative",
                  overflow: "hidden",
                  touchAction: "none",
                  cursor: dragging ? "grabbing" : "grab",
                  background: "#32342f",
                  borderRadius: 2,
                }}
              >
                <img
                  data-inspection-image=""
                  src={i ? PROOFS[proofWidth] : "/motion/assets/print-proof-color.webp"}
                  alt={
                    i
                      ? "Luminance proof of a detailed bird engraving"
                      : "Hand-colored engraving with blue birds and ochre fruit"
                  }
                  draggable={false}
                  style={{
                    position: "absolute",
                    width: WIDTH,
                    height: WIDTH * RATIO,
                    maxWidth: "none",
                    transformOrigin: "0 0",
                    pointerEvents: "none",
                    userSelect: "none",
                    willChange: "transform",
                  }}
                />
                {c.showCorrespondence && (
                  <svg
                    aria-hidden="true"
                    width="34"
                    height="34"
                    viewBox="0 0 34 34"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%,-50%)",
                      pointerEvents: "none",
                      color: "#ffffe5",
                      filter: "drop-shadow(0 1px 1px #0008)",
                    }}
                  >
                    <path d="M17 3v8m0 12v8M3 17h8m12 0h8" stroke="currentColor" strokeWidth="1" />
                    <circle cx="17" cy="17" r="3" fill="none" stroke="currentColor" />
                  </svg>
                )}
                {c.showCorrespondence && (
                  <span
                    data-source-pixel=""
                    style={{
                      position: "absolute",
                      left: 10,
                      bottom: 10,
                      fontSize: 8,
                      color: "#fff",
                      fontFamily: "monospace",
                      textShadow: "0 1px 4px #000",
                      background: "#14171290",
                      padding: "4px 5px",
                      borderRadius: 2,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 42 }}>
          <span style={{ fontSize: 9, color: "#949a93" }}>Drag either image</span>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button disabled={!active} aria-label="Zoom out" onClick={() => zoom(-0.5)}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 6h8" stroke="currentColor" />
              </svg>
            </button>
            <span data-zoom="" style={{ fontSize: 10, fontFamily: "monospace", minWidth: 37, textAlign: "center" }}>
              160%
            </span>
            <button disabled={!active} aria-label="Zoom in" onClick={() => zoom(0.5)}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 6h8M6 2v8" stroke="currentColor" />
              </svg>
            </button>
            <span style={{ height: 12, borderLeft: "1px solid #41453f", margin: "0 8px" }} />
            <button
              disabled={!active}
              aria-label="Fit both views"
              onClick={() => {
                stop()
                apply({ x: 0.5, y: RATIO / 2, zoom: HEIGHT / WIDTH / RATIO })
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 2H2v3m7-3h3v3M2 9v3h3m7-3v3H9" stroke="currentColor" />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
