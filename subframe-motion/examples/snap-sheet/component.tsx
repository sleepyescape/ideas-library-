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

  const [expanded, setExpanded] = React.useState(false),
    [drag, setDrag] = React.useState(false),
    [dy, setDy] = React.useState(0)
  const start = React.useRef({ y: 0, scale: 1 })
  const moved = React.useRef(false)

  return (
    <div
      className="sf-snap-sheet"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="map-card">
        <div className="map-art" aria-hidden>
          <i />
          <i />
          <i />
          <b>●</b>
        </div>
        <div
          className="sheet"
          style={{ transform: `translateY(${(expanded ? 0 : 74) + dy}px)`, transition: drag ? "none" : undefined }}
        >
          <button
            className="sheet-handle"
            aria-label={expanded ? "Collapse location details" : "Expand location details"}
            aria-expanded={expanded}
            onClick={(event) => {
              if (event.detail === 0 || !moved.current) {
                setExpanded(!expanded)
              }
            }}
            onPointerDown={(e) => {
              if (e.button !== 0) {
                return
              }
              start.current = {
                y: e.clientY,
                scale: e.currentTarget.offsetHeight / e.currentTarget.getBoundingClientRect().height,
              }
              moved.current = false
              setDrag(true)
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (drag) {
                const dy = (e.clientY - start.current.y) * start.current.scale
                moved.current = Math.abs(dy) > 3
                setDy(Math.max(-74, Math.min(74, dy)))
              }
            }}
            onPointerUp={() => {
              setDrag(false)
              if (Math.abs(dy) > 20) {
                setExpanded(dy < 0)
              }
              setDy(0)
            }}
            onLostPointerCapture={() => {
              setDrag(false)
              setDy(0)
            }}
            onPointerCancel={() => {
              setDrag(false)
              setDy(0)
            }}
          >
            <i />
          </button>
          <div className="location">
            <span className="location-icon" aria-hidden>
              ⌁
            </span>
            <div>
              <strong>Stillwater House</strong>
              <small>14 Willow Lane</small>
            </div>
            <span className="distance">0.8 km</span>
          </div>
          <div className="location-info" inert={!expanded}>
            <span>Open until 18:00</span>
            <button onClick={() => setExpanded(false)}>Done</button>
          </div>
        </div>
      </div>
      <style>{`
.sf-snap-sheet {
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
.sf-snap-sheet * {
  box-sizing: border-box;
}
.sf-snap-sheet button,
.sf-snap-sheet input,
.sf-snap-sheet textarea,
.sf-snap-sheet select {
  font: inherit;
  color: inherit;
}
.sf-snap-sheet button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-snap-sheet button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-snap-sheet button:focus-visible,
.sf-snap-sheet input:focus-visible,
.sf-snap-sheet textarea:focus-visible,
.sf-snap-sheet [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-snap-sheet button {
  border: 0;
  background: transparent;
}
.sf-snap-sheet .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-snap-sheet .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-snap-sheet svg {
  display: block;
}
.sf-snap-sheet[data-keyboard="true"] *,
.sf-snap-sheet[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-snap-sheet *,
  .sf-snap-sheet *::before,
  .sf-snap-sheet *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-snap-sheet {
  background: #e5eae5;
}
.sf-snap-sheet .map-card {
  position: relative;
  overflow: hidden;
  width: min(100%, 340px);
  height: 252px;
  border: 1px solid #ced8cf;
  border-radius: 17px;
  box-shadow: 0 17px 35px #34513518;
  background: #dce8d6;
}
.sf-snap-sheet .map-art {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
      18deg,
      transparent 0 35px,
      #f8faf1 36px 42px,
      transparent 43px 75px
    ),
    repeating-linear-gradient(
      100deg,
      transparent 0 55px,
      #f9fbf3 56px 64px,
      transparent 65px 105px
    );
}
.sf-snap-sheet .map-art i {
  position: absolute;
  width: 90px;
  height: 70px;
  border-radius: 35%;
  background: #bed4b9;
  top: 24px;
  left: 25px;
  transform: rotate(-18deg);
}
.sf-snap-sheet .map-art i:nth-child(2) {
  left: 190px;
  top: 85px;
  width: 75px;
}
.sf-snap-sheet .map-art i:nth-child(3) {
  left: 100px;
  top: 180px;
}
.sf-snap-sheet .map-art b {
  position: absolute;
  top: 44px;
  left: 54%;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #5a836c;
  color: #ffffff;
  border: 4px solid #fff;
  box-shadow: 0 3px 10px #35493140;
  font-size: 8px;
}
.sf-snap-sheet .sheet {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 159px;
  background: #fbfdf9;
  border-top: 1px solid #d6dfd3;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 24px #48633d12;
  transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-snap-sheet .sheet-handle {
  position: relative;
  width: 100%;
  height: 25px;
  display: grid;
  place-items: center;
  touch-action: none;
}
.sf-snap-sheet .sheet-handle::before {
  content: "";
  position: absolute;
  inset: -9px 0 -10px;
}
.sf-snap-sheet .sheet-handle i {
  width: 32px;
  height: 4px;
  border-radius: 4px;
  background: #ced8c9;
}
.sf-snap-sheet .location {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 19px 13px;
}
.sf-snap-sheet .location-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #e6efdf;
  color: #6a7c5e;
  font-size: 23px;
}
.sf-snap-sheet .location strong {
  font-size: 12px;
  font-weight: 500;
}
.sf-snap-sheet .location small {
  display: block;
  color: #747e6c;
  font-size: 10px;
  margin-top: 3px;
}
.sf-snap-sheet .distance {
  margin-left: auto;
  font-size: 9px;
  color: #829a74;
}
.sf-snap-sheet .location-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #e8eee3;
  font-size: 10px;
  color: #829872;
}
.sf-snap-sheet .location-info button {
  background: #648552;
  color: #ffffff;
  border-radius: 7px;
  padding: 8px 14px;
  font-size: 11px;
  min-height: 35px;
}
`}</style>
    </div>
  )
}
