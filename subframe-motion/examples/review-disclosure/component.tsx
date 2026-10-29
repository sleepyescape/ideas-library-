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
    [checks, setChecks] = React.useState([true, true, false]),
    [approved, setApproved] = React.useState(false)

  return (
    <div
      className="sf-review-disclosure"
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
      <div className="review">
        <div className="review-summary">
          <span className="review-icon" aria-hidden>
            ↗
          </span>
          <div>
            <strong>Share the collection</strong>
            <small>3 files · Anyone with the link</small>
          </div>
        </div>
        <button className="review-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Hide files" : "Review files"}
          <span style={{ transform: open ? "rotate(90deg)" : "none" }}>›</span>
        </button>
        <div className="review-files" inert={!open} style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
          <div>
            {["Collection.pdf", "Type specimens.pdf", "Working notes.md"].map((n, i) => (
              <label key={n}>
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() => {
                    setChecks((v) => v.map((x, j) => (i === j ? !x : x)))
                    setApproved(false)
                  }}
                />
                <span>{n}</span>
              </label>
            ))}
          </div>
        </div>
        <button className="approve" disabled={!checks.some(Boolean)} onClick={() => setApproved(!approved)}>
          {approved ? "✓ Link prepared" : "Share " + checks.filter(Boolean).length + " files"}
        </button>
      </div>
      <style>{`
.sf-review-disclosure {
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
.sf-review-disclosure * {
  box-sizing: border-box;
}
.sf-review-disclosure button,
.sf-review-disclosure input,
.sf-review-disclosure textarea,
.sf-review-disclosure select {
  font: inherit;
  color: inherit;
}
.sf-review-disclosure button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-review-disclosure button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-review-disclosure button:focus-visible,
.sf-review-disclosure input:focus-visible,
.sf-review-disclosure textarea:focus-visible,
.sf-review-disclosure [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-review-disclosure button {
  border: 0;
  background: transparent;
}
.sf-review-disclosure .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-review-disclosure .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-review-disclosure svg {
  display: block;
}
.sf-review-disclosure[data-keyboard="true"] *,
.sf-review-disclosure[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-review-disclosure *,
  .sf-review-disclosure *::before,
  .sf-review-disclosure *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-review-disclosure {
  background: #ebe8ef;
}
.sf-review-disclosure .review {
  width: min(100%, 345px);
  background: #fdfcfe;
  border: 1px solid #ddd5e5;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 15px 35px #44345114;
}
.sf-review-disclosure .review-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sf-review-disclosure .review-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e9dff3;
  color: #9373a8;
  font-size: 25px;
}
.sf-review-disclosure .review strong {
  font-size: 13px;
  font-weight: 500;
}
.sf-review-disclosure .review small {
  display: block;
  font-size: 10px;
  color: #7c7384;
  margin-top: 4px;
}
.sf-review-disclosure .review-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 11px;
  color: #71637c;
  padding: 14px 0;
  min-height: 44px;
}
.sf-review-disclosure .review-toggle span {
  font-size: 20px;
  transition: transform 180ms;
}
.sf-review-disclosure .review-files {
  display: grid;
  transition: grid-template-rows 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-review-disclosure .review-files > div {
  overflow: hidden;
  min-height: 0;
}
.sf-review-disclosure label {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 44px;
  font-size: 10px;
  color: #82728f;
}
.sf-review-disclosure input {
  accent-color: #9272ad;
  width: 14px;
  height: 14px;
}
.sf-review-disclosure .approve {
  width: 100%;
  min-height: 44px;
  margin-top: 10px;
  background: #715987;
  color: #ffffff;
  font-size: 12px;
  border-radius: 9px;
}
`}</style>
    </div>
  )
}
