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

export default function Example({ active = true }: { active?: boolean }) {
  const [reduced, setReduced] = React.useState(true)
  const [keyboard, setKeyboard] = React.useState(false)
  React.useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(m.matches)
    update()
    m.addEventListener("change", update)
    return () => m.removeEventListener("change", update)
  }, [])
  const running = active && !reduced

  const [split, setSplit] = React.useState(59),
    [drag, setDrag] = React.useState(false)
  const area = React.useRef<HTMLDivElement>(null)
  function update(x: number) {
    const r = area.current?.getBoundingClientRect()
    if (r) {
      setSplit(Math.max(38, Math.min(72, ((x - r.left) / r.width) * 100)))
    }
  }

  return (
    <div
      className="sf-resizable-inspector"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="editor" ref={area}>
        <div className="artboard" style={{ width: split + "%" }}>
          <div className="object">
            <i />
            <b />
            <span />
          </div>
          <span className="size mono">{Math.round(split * 4)} × 240</span>
        </div>
        <div
          className="divider"
          role="separator"
          tabIndex={0}
          aria-label="Resize canvas"
          aria-orientation="vertical"
          aria-valuemin={38}
          aria-valuemax={72}
          aria-valuenow={Math.round(split)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault()
              setSplit((s) => Math.max(38, Math.min(72, s + (e.key === "ArrowRight" ? 2 : -2))))
            }
            if (e.key === "Home") {
              setSplit(38)
            }
            if (e.key === "End") {
              setSplit(72)
            }
          }}
          onPointerDown={(e) => {
            setDrag(true)
            e.currentTarget.setPointerCapture(e.pointerId)
            update(e.clientX)
          }}
          onPointerMove={(e) => {
            if (drag) {
              update(e.clientX)
            }
          }}
          onPointerUp={() => setDrag(false)}
          onPointerCancel={() => setDrag(false)}
        >
          <i />
        </div>
        <div className="inspector">
          <strong>Shape</strong>
          <span className="muted">Fill</span>
          <div className="swatch">
            <i />
            #758BB0
          </div>
          <span className="muted">Radius</span>
          <div className="value mono">24</div>
          <span className="muted">Opacity</span>
          <div className="value mono">100%</div>
        </div>
      </div>
      <style>{`
.sf-resizable-inspector {
  width: 100%;
  height: 100%;
  min-height: 260px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: 20px;
  background: #edf0f3;
  color: #22272d;
  font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  isolation: isolate;
  overflow: hidden;
}
.sf-resizable-inspector * {
  box-sizing: border-box;
}
.sf-resizable-inspector button,
.sf-resizable-inspector input,
.sf-resizable-inspector textarea,
.sf-resizable-inspector select {
  font: inherit;
  color: inherit;
}
.sf-resizable-inspector button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-resizable-inspector button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-resizable-inspector button:focus-visible,
.sf-resizable-inspector input:focus-visible,
.sf-resizable-inspector textarea:focus-visible,
.sf-resizable-inspector [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-resizable-inspector button {
  border: 0;
  background: transparent;
}
.sf-resizable-inspector .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-resizable-inspector .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-resizable-inspector .mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-variant-numeric: tabular-nums;
}
.sf-resizable-inspector svg {
  display: block;
}
.sf-resizable-inspector[data-keyboard="true"] *,
.sf-resizable-inspector[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-resizable-inspector *,
  .sf-resizable-inspector *::before,
  .sf-resizable-inspector *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-resizable-inspector {
  background: #dce3ec;
  padding: 16px;
}
.sf-resizable-inspector .editor {
  display: flex;
  width: min(100%, 410px);
  height: 235px;
  border: 1px solid #c4cddb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 15px 40px #20395a1c;
  background: #fcfdff;
}
.sf-resizable-inspector .artboard {
  position: relative;
  display: grid;
  place-items: center;
  background: radial-gradient(#adbbce80 0.65px, transparent 0.65px) 0 0/12px
    12px #e7edf5;
  flex-shrink: 0;
  overflow: hidden;
}
.sf-resizable-inspector .object {
  width: 90px;
  height: 110px;
  background: #758bb0;
  border-radius: 24px;
  box-shadow: inset 0 1px #b6c7e2, 0 14px 20px #435b8030;
  transform: rotate(-12deg);
  position: relative;
}
.sf-resizable-inspector .object i {
  position: absolute;
  inset: 20px;
  border: 1px solid #d4dff260;
  border-radius: 50%;
}
.sf-resizable-inspector .object b {
  position: absolute;
  inset: 34px 21px;
  background: #b9c9e580;
  border-radius: 50%;
}
.sf-resizable-inspector .size {
  position: absolute;
  bottom: 14px;
  font-size: 10px;
  color: #5f6c7c;
}
.sf-resizable-inspector .divider {
  width: 9px;
  margin-left: -4px;
  margin-right: -5px;
  z-index: 2;
  cursor: col-resize;
  display: grid;
  place-items: center;
  touch-action: none;
}
.sf-resizable-inspector .divider i {
  height: 29px;
  width: 4px;
  background: #c2cddb;
  border-radius: 3px;
  box-shadow: 0 0 0 3px #fcfdff;
}
.sf-resizable-inspector .inspector {
  flex: 1;
  min-width: 0;
  padding: 17px 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-left: 1px solid #ced8e5;
}
.sf-resizable-inspector .inspector strong {
  font-size: 11px;
  margin-bottom: 6px;
}
.sf-resizable-inspector .inspector .muted {
  font-size: 9px;
}
.sf-resizable-inspector .swatch {
  font-size: 9px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.sf-resizable-inspector .swatch i {
  width: 14px;
  height: 14px;
  background: #758bb0;
  border-radius: 3px;
  flex-shrink: 0;
}
.sf-resizable-inspector .value {
  background: #f0f3f8;
  border-radius: 4px;
  padding: 5px 7px;
  font-size: 10px;
}
`}</style>
    </div>
  )
}
