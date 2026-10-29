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

export type Config = {
  dockThreshold: number
  panelWidth: number
  allowedEdge: "left" | "right" | "both"
  settleMs: number
}
export const DEFAULT_CONFIG: Config = { dockThreshold: 32, panelWidth: 180, allowedEdge: "right", settleMs: 180 }
type Point = { x: number; y: number }
type Mode = "floating" | "left" | "right"
const bound = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))

const DockIcon = ({ edge, detached = false }: { edge: "left" | "right"; detached?: boolean }) => (
  <svg viewBox="0 0 18 18" aria-hidden>
    <rect x="2.5" y="3" width="13" height="12" rx="1.8" />
    {detached ? (
      <path d="M6 6h6v6H6Z" />
    ) : (
      <path d={edge === "right" ? "M11 3v12m0-10h2.5v8H11" : "M7 3v12M4.5 5H7v8H4.5"} />
    )}
  </svg>
)

export default function Example({ active = true, config }: { active?: boolean; config?: Partial<Config> }) {
  const settings = { ...DEFAULT_CONFIG, ...config }
  settings.dockThreshold = bound(settings.dockThreshold, 16, 64)
  settings.panelWidth = bound(settings.panelWidth, 140, 240)
  settings.settleMs = bound(settings.settleMs, 0, 260)
  if (!["left", "right", "both"].includes(settings.allowedEdge)) {
    settings.allowedEdge = "right"
  }
  const uid = React.useId()
  const workspace = React.useRef<HTMLDivElement>(null)
  const dockAction = React.useRef<HTMLButtonElement>(null)
  const restoreActionFocus = React.useRef(false)
  const [size, setSize] = React.useState({ width: 540, height: 315 })
  const [mode, setMode] = React.useState<Mode>("floating")
  const [position, setPosition] = React.useState<Point>({ x: 310, y: 42 })
  const [target, setTarget] = React.useState<"left" | "right" | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [keyboard, setKeyboard] = React.useState(false)
  const [radius, setRadius] = React.useState(32)
  const [fill, setFill] = React.useState("#f2cf4b")
  const [stroke, setStroke] = React.useState(false)
  const lastFree = React.useRef<Point>({ x: 310, y: 42 })
  const drag = React.useRef<{
    pointer: Point
    position: Point
    mode: Mode
    owner: HTMLButtonElement
    pointerId: number
    moved: boolean
  } | null>(null)
  const panelWidth = Math.min(settings.panelWidth, size.width - 12)
  const panelHeight = Math.min(238, size.height)
  const clamp = (point: Point) => ({
    x: bound(point.x, 0, Math.max(0, size.width - panelWidth)),
    y: bound(point.y, 0, Math.max(0, size.height - panelHeight)),
  })
  const rendered = mode === "floating" ? position : { x: mode === "left" ? 0 : size.width - panelWidth, y: 0 }
  const allowed = (edge: "left" | "right") => settings.allowedEdge === "both" || settings.allowedEdge === edge
  const cancel = React.useCallback(() => {
    const previous = drag.current
    drag.current = null
    if (previous) {
      if (previous.owner.hasPointerCapture(previous.pointerId)) {
        previous.owner.releasePointerCapture(previous.pointerId)
      }
      setMode(previous.mode)
      setPosition(previous.position)
    }
    setDragging(false)
    setTarget(null)
  }, [])
  React.useEffect(() => {
    const node = workspace.current
    if (!node) {
      return
    }
    const observer = new ResizeObserver(() => {
      const rect = node.getBoundingClientRect()
      setSize({ width: node.clientWidth, height: node.clientHeight })
      if (rect.width === 0) {
        cancel()
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [cancel])
  React.useLayoutEffect(() => {
    if (restoreActionFocus.current) {
      restoreActionFocus.current = false
      dockAction.current?.focus({ preventScroll: true })
    }
  }, [mode])
  React.useEffect(() => {
    cancel()
    const clampPoint = (point: Point) => ({
      x: bound(point.x, 0, Math.max(0, size.width - panelWidth)),
      y: bound(point.y, 0, Math.max(0, size.height - panelHeight)),
    })
    setPosition((previous) => clampPoint(previous))
    lastFree.current = clampPoint(lastFree.current)
  }, [size.width, size.height, panelWidth, panelHeight, cancel])
  React.useEffect(() => {
    if (mode !== "floating" && settings.allowedEdge !== "both" && mode !== settings.allowedEdge) {
      setMode("floating")
      setPosition(lastFree.current)
    }
  }, [settings.allowedEdge, mode])
  React.useEffect(() => {
    cancel()
  }, [settings.allowedEdge, cancel])
  React.useEffect(() => {
    if (!active) {
      cancel()
    }
  }, [active, cancel])
  React.useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        cancel()
      }
    }
    document.addEventListener("visibilitychange", hide)
    return () => document.removeEventListener("visibilitychange", hide)
  }, [cancel])
  const dock = (edge: "left" | "right", focusAction = false) => {
    if (!active || !allowed(edge)) {
      return
    }
    if (mode === "floating") {
      lastFree.current = position
    }
    restoreActionFocus.current = focusAction
    setMode(edge)
    setTarget(null)
  }
  const detach = () => {
    if (!active) {
      return
    }
    restoreActionFocus.current = true
    setMode("floating")
    setPosition(clamp(lastFree.current))
  }
  const begin = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!active || event.button !== 0) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointer: { x: event.clientX, y: event.clientY },
      position: rendered,
      mode,
      owner: event.currentTarget,
      pointerId: event.pointerId,
      moved: false,
    }
    if (mode === "floating") {
      lastFree.current = position
    }
    setPosition(rendered)
    setMode("floating")
    setDragging(true)
  }
  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current
    if (!current) {
      return
    }
    const rect = workspace.current!.getBoundingClientRect()
    const dx = ((event.clientX - current.pointer.x) * size.width) / rect.width
    const dy = ((event.clientY - current.pointer.y) * size.height) / rect.height
    if (Math.hypot(dx, dy) > 3) {
      current.moved = true
    }
    const next = clamp({ x: current.position.x + dx, y: current.position.y + dy })
    setPosition(next)
    setTarget(
      allowed("left") && next.x <= settings.dockThreshold
        ? "left"
        : allowed("right") && next.x + panelWidth >= size.width - settings.dockThreshold
        ? "right"
        : null,
    )
  }
  const drop = () => {
    const current = drag.current
    if (!current) {
      return
    }
    drag.current = null
    if (current.owner.hasPointerCapture(current.pointerId)) {
      current.owner.releasePointerCapture(current.pointerId)
    }
    if (!current.moved) {
      setMode(current.mode)
      setPosition(current.position)
    } else if (target) {
      setMode(target)
    } else {
      lastFree.current = position
    }
    setTarget(null)
    setDragging(false)
  }
  return (
    <section
      className="sf-panel-docking"
      aria-label="Dockable shape inspector"
      data-still={!active || keyboard || dragging}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDownCapture={(event) => {
        setKeyboard(true)
        if (event.key === "Escape") {
          cancel()
        }
      }}
      style={{ "--pd-duration": `${settings.settleMs}ms` } as React.CSSProperties}
    >
      <div className="pd-workspace" ref={workspace}>
        <div
          className="pd-canvas"
          style={{ marginLeft: mode === "left" ? panelWidth : 0, marginRight: mode === "right" ? panelWidth : 0 }}
        >
          <svg
            viewBox="0 0 320 280"
            aria-label={`Rectangle, ${radius} pixel corners${stroke ? ", outlined" : ""}`}
            role="img"
          >
            <g transform="translate(31 49)">
              <rect
                x="0"
                y="0"
                width="164"
                height="164"
                rx={radius}
                fill={fill}
                stroke={stroke ? "#332c2b" : "none"}
                strokeWidth="3"
              />
              <path d="M96 30 51 91h37l-17 47 56-67H91Z" fill="#282b28" />
              <rect x="-5" y="-5" width="174" height="174" fill="none" stroke="#7e9dcc" strokeWidth=".9" />
              {[
                [-5, -5],
                [169, -5],
                [-5, 169],
                [169, 169],
              ].map(([x, y], i) => (
                <rect
                  key={i}
                  x={x - 2.5}
                  y={y - 2.5}
                  width="5"
                  height="5"
                  fill="#fff"
                  stroke="#647eae"
                  strokeWidth=".7"
                />
              ))}
            </g>
          </svg>
        </div>
        {target ? (
          <div className="pd-target" style={{ width: panelWidth, [target]: 0 }}>
            <span>Dock {target}</span>
          </div>
        ) : null}
        <div
          className="pd-panel"
          data-docked={mode !== "floating"}
          style={{
            width: panelWidth,
            height: mode === "floating" ? panelHeight : size.height,
            transform: `translate(${rendered.x}px,${rendered.y}px)`,
          }}
        >
          <header>
            <button
              type="button"
              className="pd-grip"
              aria-label="Move inspector. Arrow keys move; Home docks left; End docks right."
              aria-describedby={`${uid}-help`}
              disabled={!active}
              onPointerDown={begin}
              onPointerMove={move}
              onPointerUp={drop}
              onPointerCancel={cancel}
              onLostPointerCapture={() => {
                if (drag.current) {
                  cancel()
                }
              }}
              onKeyDown={(event) => {
                if (!active) {
                  return
                }
                const delta = event.shiftKey ? 30 : 10
                const next =
                  event.key === "ArrowLeft"
                    ? { x: rendered.x - delta, y: rendered.y }
                    : event.key === "ArrowRight"
                    ? { x: rendered.x + delta, y: rendered.y }
                    : event.key === "ArrowUp"
                    ? { x: rendered.x, y: rendered.y - delta }
                    : event.key === "ArrowDown"
                    ? { x: rendered.x, y: rendered.y + delta }
                    : null
                if (next) {
                  event.preventDefault()
                  const clamped = clamp(next)
                  setMode("floating")
                  setPosition(clamped)
                  lastFree.current = clamped
                }
                if (event.key === "Home") {
                  event.preventDefault()
                  dock("left")
                }
                if (event.key === "End") {
                  event.preventDefault()
                  dock("right")
                }
              }}
            >
              <svg viewBox="0 0 8 14" aria-hidden>
                <path d="M2 3h.1M6 3h.1M2 7h.1M6 7h.1M2 11h.1M6 11h.1" />
              </svg>
              <span>Shape</span>
            </button>
            {mode !== "floating" ? (
              <button
                type="button"
                className="pd-dock"
                ref={dockAction}
                aria-label="Detach inspector"
                title="Detach inspector"
                disabled={!active}
                onClick={detach}
              >
                <DockIcon edge="right" detached />
              </button>
            ) : (
              <>
                {allowed("left") ? (
                  <button
                    type="button"
                    className="pd-dock"
                    ref={dockAction}
                    aria-label="Dock inspector left"
                    title="Dock left"
                    disabled={!active}
                    onClick={() => dock("left", true)}
                  >
                    <DockIcon edge="left" />
                  </button>
                ) : null}
                {allowed("right") ? (
                  <button
                    type="button"
                    className="pd-dock"
                    ref={dockAction}
                    aria-label="Dock inspector right"
                    title="Dock right"
                    disabled={!active}
                    onClick={() => dock("right", true)}
                  >
                    <DockIcon edge="right" />
                  </button>
                ) : null}
              </>
            )}
          </header>
          <div className="pd-properties">
            <div className="pd-field">
              <label htmlFor={`${uid}-radius`}>Corners</label>
              <output htmlFor={`${uid}-radius`}>
                {radius}
                <span>px</span>
              </output>
              <input
                id={`${uid}-radius`}
                type="range"
                min="0"
                max="64"
                step="1"
                value={radius}
                disabled={!active}
                onChange={(event) => setRadius(Number(event.target.value))}
              />
            </div>
            <fieldset>
              <legend>Fill</legend>
              <div className="pd-swatches">
                {[
                  { value: "#f2cf4b", label: "Yellow" },
                  { value: "#e9694b", label: "Vermilion" },
                ].map((color) => (
                  <label key={color.value} title={color.label}>
                    <input
                      type="radio"
                      name={`${uid}-fill`}
                      aria-label={color.label}
                      value={color.value}
                      checked={fill === color.value}
                      disabled={!active}
                      onChange={() => setFill(color.value)}
                    />
                    <span style={{ background: color.value }}>
                      {fill === color.value ? (
                        <svg viewBox="0 0 16 16" aria-hidden>
                          <path d="m4 8 2.5 2.5L12 5" />
                        </svg>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="pd-stroke">
              <span>Outline</span>
              <input
                type="checkbox"
                checked={stroke}
                disabled={!active}
                onChange={(event) => setStroke(event.target.checked)}
              />
            </label>
          </div>
        </div>
        <span id={`${uid}-help`} className="pd-sr">
          Drag the title to an allowed edge to dock. Detach restores the previous floating position. Properties stay
          unchanged.
        </span>
        <span className="pd-sr" role="status">
          {target
            ? `Release to dock ${target}`
            : mode === "floating"
            ? "Inspector floating"
            : `Inspector docked ${mode}`}
        </span>
      </div>
      <style>{`
.sf-panel-docking{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;place-items:center;padding:24px;background:#e7e9e5;color:#332c2b;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;isolation:isolate}.sf-panel-docking *{box-sizing:border-box}.sf-panel-docking button,.sf-panel-docking input{font:inherit;color:inherit}.sf-panel-docking button{cursor:pointer}.sf-panel-docking button:disabled{cursor:default}.sf-panel-docking .pd-workspace{position:relative;width:100%;max-width:560px;height:100%;max-height:315px;min-height:220px;background:#f4f4f0;border:1px solid #d5d8d0;border-radius:10px;overflow:hidden;background-image:radial-gradient(#90978b45 .6px,transparent .7px);background-size:12px 12px}.sf-panel-docking .pd-canvas{height:100%;display:grid;place-items:center;min-width:0}.sf-panel-docking .pd-canvas>svg{width:100%;height:100%;max-width:430px;max-height:300px}.sf-panel-docking .pd-panel{position:absolute;top:0;left:0;z-index:2;background:#ffffff;border:1px solid #323b2720;border-radius:9px;box-shadow:0 2px 5px #323b2712,0 12px 24px #323b2720;overflow:hidden;transition:transform var(--pd-duration) cubic-bezier(.22,1,.36,1)}.sf-panel-docking .pd-panel[data-docked=true]{border-radius:0;border-top:0;border-bottom:0;box-shadow:none}.sf-panel-docking header{height:44px;display:flex;align-items:center;border-bottom:1px solid #e7e9e3}.sf-panel-docking header button{height:44px;border:0;background:transparent;touch-action:none;display:flex;align-items:center;justify-content:center;padding:0}.sf-panel-docking .pd-grip{flex:1;min-width:0;gap:7px;justify-content:flex-start;padding:0 12px;cursor:grab;text-align:left}.sf-panel-docking .pd-grip:active{cursor:grabbing}.sf-panel-docking .pd-grip span{font-size:11px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sf-panel-docking .pd-grip svg{width:8px;height:14px;stroke:#b6a69e;stroke-linecap:round;stroke-width:1.7;flex:none}.sf-panel-docking .pd-dock{width:44px;flex:none;color:#8c7a70}.sf-panel-docking .pd-dock svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.1}.sf-panel-docking .pd-properties{padding:14px}.sf-panel-docking .pd-field{display:grid;grid-template-columns:1fr auto;align-items:center;gap:7px;font-size:10px}.sf-panel-docking output{font-variant-numeric:tabular-nums}.sf-panel-docking output span{margin-left:3px;color:#a09288;font-size:9px}.sf-panel-docking input[type=range]{grid-column:1/-1;width:100%;height:25px;margin:0;accent-color:#4c423c;cursor:pointer}.sf-panel-docking fieldset{border:0;padding:0;margin:10px 0 0}.sf-panel-docking legend{font-size:10px;padding:0;color:#71635a}.sf-panel-docking .pd-swatches{display:flex;gap:2px;margin-left:-5px}.sf-panel-docking .pd-swatches label{width:44px;height:44px;position:relative;display:grid;place-items:center;cursor:pointer}.sf-panel-docking .pd-swatches input{position:absolute;inset:0;margin:0;width:100%;height:100%;opacity:0;cursor:pointer}.sf-panel-docking .pd-swatches span{display:grid;place-items:center;width:26px;height:26px;border-radius:6px;box-shadow:inset 0 0 0 1px #51413515;pointer-events:none}.sf-panel-docking .pd-swatches svg{width:14px;height:14px;fill:none;stroke:#5f5144;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.sf-panel-docking .pd-swatches input:focus-visible+span{outline:2px solid #4267b2;outline-offset:3px}.sf-panel-docking .pd-stroke{display:flex;align-items:center;justify-content:space-between;min-height:44px;font-size:10px;cursor:pointer;border-top:1px solid #e7e9e3}.sf-panel-docking .pd-stroke input{accent-color:#4c423c;width:13px;height:13px;margin:0}.sf-panel-docking .pd-target{position:absolute;top:0;bottom:0;z-index:1;background:#a7e8df6b;border:2px solid #c9fff6;display:grid;place-items:end center;padding:14px;pointer-events:none}.sf-panel-docking .pd-target span{font-size:10px;font-weight:600;padding:5px 8px;border-radius:4px;background:#dcfff4;color:#245c4c}.sf-panel-docking .pd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-panel-docking button:focus-visible,.sf-panel-docking input:focus-visible{outline:2px solid #4267b2;outline-offset:-3px}.sf-panel-docking[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-panel-docking *{transition:none!important}}@media(max-width:430px){.sf-panel-docking{padding:14px}.sf-panel-docking .pd-properties{padding:12px}}
    `}</style>
    </section>
  )
}
