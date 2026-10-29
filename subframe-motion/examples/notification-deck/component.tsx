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
    [items, setItems] = React.useState(["Your export is ready", "Mara left a comment", "Collection shared"])

  return (
    <div
      className="sf-notification-deck"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="notifications">
        <div
          className="deck"
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          onFocusCapture={() => setExpanded(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setExpanded(false)
            }
          }}
        >
          {items.map((x, i) => (
            <div
              className="notice"
              key={x}
              data-covered={!expanded && i > 0}
              inert={!expanded && i > 0}
              style={{
                transform: `translateY(${expanded ? i * 60 : i * 10}px) scale(${expanded ? 1 : 1 - i * 0.04})`,
                zIndex: 4 - i,
                opacity: expanded ? 1 : 1 - i * 0.15,
              }}
            >
              <span
                className={
                  "notice-icon n" + ["Your export is ready", "Mara left a comment", "Collection shared"].indexOf(x)
                }
                aria-hidden
              >
                {{ "Your export is ready": "↧", "Mara left a comment": "◌", "Collection shared": "↗" }[x]}
              </span>
              <span>
                {x}
                <small>
                  {
                    {
                      "Your export is ready": "Now",
                      "Mara left a comment": "2 minutes ago",
                      "Collection shared": "5 minutes ago",
                    }[x]
                  }
                </small>
              </span>
              <button aria-label={"Dismiss " + x} onClick={() => setItems((v) => v.filter((s) => s !== x))}>
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          className="deck-control"
          aria-expanded={expanded}
          onClick={() => {
            if (!items.length) {
              setItems(["Your export is ready", "Mara left a comment", "Collection shared"])
            } else {
              setExpanded(!expanded)
            }
          }}
        >
          {items.length ? (expanded ? "Collapse" : "Show all (" + items.length + ")") : "Restore notifications"}
        </button>
      </div>
      <style>{`
.sf-notification-deck {
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
.sf-notification-deck * {
  box-sizing: border-box;
}
.sf-notification-deck button,
.sf-notification-deck input,
.sf-notification-deck textarea,
.sf-notification-deck select {
  font: inherit;
  color: inherit;
}
.sf-notification-deck button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-notification-deck button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-notification-deck button:focus-visible,
.sf-notification-deck input:focus-visible,
.sf-notification-deck textarea:focus-visible,
.sf-notification-deck [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-notification-deck button {
  border: 0;
  background: transparent;
}
.sf-notification-deck .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-notification-deck .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-notification-deck svg {
  display: block;
}
.sf-notification-deck[data-keyboard="true"] *,
.sf-notification-deck[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-notification-deck *,
  .sf-notification-deck *::before,
  .sf-notification-deck *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-notification-deck {
  background: #e4eaf0;
}
.sf-notification-deck .notifications {
  width: min(100%, 350px);
}
.sf-notification-deck .deck {
  height: 180px;
  position: relative;
}
.sf-notification-deck .notice {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;
  padding: 10px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  background: #fff;
  border: 1px solid #d5dee8;
  border-radius: 12px;
  box-shadow: 0 5px 15px #243f5b13;
  transform-origin: bottom;
  transition: transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms;
  font-size: 11px;
}
.sf-notification-deck .notice[data-covered="true"] > * {
  visibility: hidden;
}
.sf-notification-deck .notice-icon {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  background: #e6f0eb;
  border-radius: 8px;
  color: #3d8161;
  font-size: 18px;
}
.sf-notification-deck .n1 {
  background: #f0e8f6;
  color: #9370aa;
}
.sf-notification-deck .n2 {
  background: #e7edf6;
  color: #5f7eb1;
}
.sf-notification-deck .notice small {
  display: block;
  color: #717881;
  font-size: 10px;
  margin-top: 3px;
}
.sf-notification-deck .notice button {
  margin-left: auto;
  width: 30px;
  height: 34px;
  color: #707984;
  font-size: 16px;
}
.sf-notification-deck .deck-control {
  display: block;
  margin: 12px auto 0;
  font-size: 11px;
  color: #8190a1;
  padding: 10px 14px;
  border-radius: 8px;
  background: #ffffff70;
}
`}</style>
    </div>
  )
}
