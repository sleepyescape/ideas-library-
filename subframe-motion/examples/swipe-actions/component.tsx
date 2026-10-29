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

  const [x, setX] = React.useState(0),
    [archived, setArchived] = React.useState(false),
    [dragging, setDragging] = React.useState(false)
  const start = React.useRef({ x: 0, offset: 0, scale: 1 })

  return (
    <div
      className="sf-swipe-actions"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="inbox">
        <div className="row between inbox-top">
          <strong>Today</strong>
          <span className="muted">{archived ? "0 messages" : "1 message"}</span>
        </div>
        <div className="swipe-track">
          <button
            className="archive"
            aria-label="Archive message"
            tabIndex={x < 0 && !archived ? 0 : -1}
            aria-hidden={x === 0 || archived}
            onClick={() => setArchived(true)}
          >
            ↧
          </button>
          <div
            className="mail-row"
            inert={archived}
            style={{
              transform: `translateX(${archived ? -360 : x}px)`,
              opacity: archived ? 0 : 1,
              transition: dragging ? "none" : undefined,
            }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest("button")) {
                return
              }
              start.current = {
                x: e.clientX,
                offset: x,
                scale: e.currentTarget.offsetWidth / e.currentTarget.getBoundingClientRect().width,
              }
              setDragging(true)
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (dragging) {
                setX(
                  Math.min(
                    0,
                    Math.max(-100, start.current.offset + (e.clientX - start.current.x) * start.current.scale),
                  ),
                )
              }
            }}
            onPointerUp={() => {
              setDragging(false)
              if (x < -75) {
                setArchived(true)
              } else {
                setX(x < -30 ? -64 : 0)
              }
            }}
            onPointerCancel={() => {
              setDragging(false)
              setX(0)
            }}
          >
            <span className="sender" aria-hidden>
              JL
            </span>
            <div>
              <strong>Jules Laurent</strong>
              <p>First look at the samples</p>
              <small>These arrived this morning…</small>
            </div>
            <button aria-label="Reveal archive action" aria-expanded={x < 0} onClick={() => setX(x < 0 ? 0 : -64)}>
              ‹
            </button>
          </div>
          {archived && (
            <div className="undo">
              <span>Archived</span>
              <button
                onClick={() => {
                  setArchived(false)
                  setX(0)
                }}
              >
                Undo
              </button>
            </div>
          )}
        </div>
        <div className="inbox-rule" />
      </div>
      <style>{`
.sf-swipe-actions {
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
.sf-swipe-actions * {
  box-sizing: border-box;
}
.sf-swipe-actions button,
.sf-swipe-actions input,
.sf-swipe-actions textarea,
.sf-swipe-actions select {
  font: inherit;
  color: inherit;
}
.sf-swipe-actions button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-swipe-actions button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-swipe-actions button:focus-visible,
.sf-swipe-actions input:focus-visible,
.sf-swipe-actions textarea:focus-visible,
.sf-swipe-actions [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-swipe-actions button {
  border: 0;
  background: transparent;
}
.sf-swipe-actions .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-swipe-actions .between {
  justify-content: space-between;
}
.sf-swipe-actions .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-swipe-actions svg {
  display: block;
}
.sf-swipe-actions[data-keyboard="true"] *,
.sf-swipe-actions[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-swipe-actions *,
  .sf-swipe-actions *::before,
  .sf-swipe-actions *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-swipe-actions {
  background: #e8edf3;
}
.sf-swipe-actions .inbox {
  width: min(100%, 390px);
  background: #fff;
  border-radius: 13px;
  padding: 18px;
  box-shadow: 0 15px 30px #25415a14;
  border: 1px solid #dce4ec;
}
.sf-swipe-actions .inbox-top {
  font-size: 12px;
  margin-bottom: 18px;
}
.sf-swipe-actions .swipe-track {
  position: relative;
  height: 82px;
  border-radius: 8px;
  overflow: hidden;
  background: #386e63;
}
.sf-swipe-actions .archive {
  position: absolute;
  right: 0;
  width: 64px;
  height: 82px;
  color: #ffffff;
  font-size: 27px;
}
.sf-swipe-actions .mail-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  height: 82px;
  background: white;
  touch-action: pan-y;
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms;
}
.sf-swipe-actions .sender {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e5d8cc;
  color: #947559;
  display: grid;
  place-items: center;
  font-size: 11px;
  flex-shrink: 0;
}
.sf-swipe-actions .mail-row strong {
  font-size: 11px;
  font-weight: 600;
}
.sf-swipe-actions p {
  font-size: 12px;
  margin: 3px 0;
}
.sf-swipe-actions small {
  font-size: 10px;
  color: #707983;
}
.sf-swipe-actions .mail-row button {
  width: 32px;
  height: 44px;
  margin-left: auto;
  color: #707983;
  font-size: 22px;
}
.sf-swipe-actions .undo {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 22px;
  background: #f0f5f3;
  color: #557d71;
  font-size: 12px;
}
.sf-swipe-actions .undo button {
  text-decoration: underline;
  min-height: 44px;
}
.sf-swipe-actions .inbox-rule {
  border-top: 1px solid #edf1f5;
  margin-top: 16px;
}
`}</style>
    </div>
  )
}
