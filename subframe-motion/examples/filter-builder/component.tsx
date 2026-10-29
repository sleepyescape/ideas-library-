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

  const [open, setOpen] = React.useState(false),
    [status, setStatus] = React.useState("In progress"),
    [assignee, setAssignee] = React.useState("Anyone")

  return (
    <div
      className="sf-filter-builder"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={(event) => {
        setKeyboard(true)
        if (event.key === "Escape") {
          setOpen(false)
        }
      }}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="filters">
        <div className="filter-row">
          <button className="filter-chip" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span className="filter-symbol">≡</span>Status <b>{status}</b>
            <span>⌄</span>
          </button>
          <button
            className="add-filter"
            aria-label="Cycle assignee filter"
            onClick={() => setAssignee((a) => (a === "Anyone" ? "Me" : "Anyone"))}
          >
            {assignee === "Anyone" ? "＋" : "Me ×"}
          </button>
        </div>
        <div className="filter-popover" data-open={open} inert={!open}>
          <span className="filter-label">Status is</span>
          {["Todo", "In progress", "Done"].map((s, i) => (
            <button
              key={s}
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s)
                setOpen(false)
              }}
            >
              <i className={"status-dot s" + i} />
              {s}
              <span>{status === s ? "✓" : ""}</span>
            </button>
          ))}
        </div>
        <div className="results" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <i className={"result-dot r-" + status.toLowerCase().replace(/\s+/g, "-")} />
              <span style={{ width: [74, 58, 86][i] + "%" }} />
            </div>
          ))}
        </div>
        <span className="sr" role="status">
          Showing {status.toLowerCase()} items assigned to {assignee.toLowerCase()}
        </span>
      </div>
      <style>{`
.sf-filter-builder {
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
.sf-filter-builder * {
  box-sizing: border-box;
}
.sf-filter-builder button,
.sf-filter-builder input,
.sf-filter-builder textarea,
.sf-filter-builder select {
  font: inherit;
  color: inherit;
}
.sf-filter-builder button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-filter-builder button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-filter-builder button:focus-visible,
.sf-filter-builder input:focus-visible,
.sf-filter-builder textarea:focus-visible,
.sf-filter-builder [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-filter-builder button {
  border: 0;
  background: transparent;
}
.sf-filter-builder .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-filter-builder .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-filter-builder .sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
}
.sf-filter-builder svg {
  display: block;
}
.sf-filter-builder[data-keyboard="true"] *,
.sf-filter-builder[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-filter-builder *,
  .sf-filter-builder *::before,
  .sf-filter-builder *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-filter-builder {
  background: #e7ebf1;
}
.sf-filter-builder .filters {
  position: relative;
  width: min(100%, 355px);
  height: 208px;
  padding: 18px;
  background: #fff;
  border: 1px solid #d8e0ea;
  border-radius: 12px;
  box-shadow: 0 13px 30px #293e5912;
}
.sf-filter-builder .filter-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.sf-filter-builder .filter-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #d7e1ee;
  background: #f5f8fc;
  border-radius: 7px;
  padding: 7px 9px;
  font-size: 10px;
  color: #667181;
  white-space: nowrap;
  min-height: 44px;
}
.sf-filter-builder .filter-chip b {
  font-weight: 500;
  color: #5d78a4;
  border-left: 1px solid #d9e2ef;
  padding-left: 7px;
}
.sf-filter-builder .filter-symbol {
  font-size: 17px;
  transform: rotate(180deg);
}
.sf-filter-builder .add-filter {
  height: 44px;
  min-width: 44px;
  color: #757e8c;
  border: 1px dashed #d8e0eb;
  border-radius: 7px;
  font-size: 12px;
}
.sf-filter-builder .filter-popover {
  position: absolute;
  z-index: 2;
  left: 18px;
  top: 69px;
  width: 196px;
  padding: 8px;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 9px;
  box-shadow: 0 15px 30px #25395523;
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  transform-origin: top left;
  transition: opacity 150ms ease, transform 180ms cubic-bezier(.22,1,.36,1);
  pointer-events: none;
}
.sf-filter-builder .filter-popover[data-open="true"] {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
.sf-filter-builder .filter-label {
  display: block;
  font-size: 9px;
  color: #757e8a;
  padding: 3px 7px 6px;
}
.sf-filter-builder .filter-popover button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  padding: 8px;
  border-radius: 5px;
  min-height: 44px;
}
.sf-filter-builder .filter-popover button[aria-pressed="true"] {
  background: #eef3fb;
}
.sf-filter-builder .filter-popover button > span {
  margin-left: auto;
  color: #576c89;
}
.sf-filter-builder .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid #b8c5d6;
}
.sf-filter-builder .s1 {
  background: #d9bb75;
  border-color: #d9bb75;
}
.sf-filter-builder .s2 {
  background: #86b6a0;
  border-color: #86b6a0;
}
.sf-filter-builder .results {
  margin-top: 20px;
}
.sf-filter-builder .results > div {
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid #f0f3f7;
  padding: 11px 0;
}
.sf-filter-builder .result-dot {
  width: 7px;
  height: 7px;
  background: #d9bb75;
  border-radius: 50%;
}
.sf-filter-builder .r-done {
  background: #86b6a0;
}
.sf-filter-builder .r-todo {
  background: transparent;
  border: 1px solid #b8c5d6;
}
.sf-filter-builder .results span {
  height: 5px;
  background: #e8edf4;
  border-radius: 3px;
}
`}</style>
    </div>
  )
}
