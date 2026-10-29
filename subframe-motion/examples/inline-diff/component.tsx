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

  const [show, setShow] = React.useState(true),
    [accepted, setAccepted] = React.useState(false)

  return (
    <div
      className="sf-inline-diff"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="diff">
        <div className="diff-head">
          <span className="file-dot" />
          theme.css{" "}
          <div>
            <button aria-pressed={show} onClick={() => setShow(!show)}>
              {show ? "Hide diff" : "Show diff"}
            </button>
          </div>
        </div>
        <div className="code-lines mono">
          <div>
            <span>1</span>
            <code>.button {"{"}</code>
          </div>
          <div className="old" style={{ gridTemplateRows: show && !accepted ? "1fr" : "0fr" }}>
            <div>
              <span>−</span>
              <code> transition: all 500ms;</code>
            </div>
          </div>
          <div className="new" data-accepted={accepted}>
            <span>+</span>
            <code> transition: transform 160ms;</code>
          </div>
          <div className="new" data-accepted={accepted}>
            <span>+</span>
            <code> touch-action: manipulation;</code>
          </div>
          <div>
            <span>4</span>
            <code>{"}"}</code>
          </div>
        </div>
        <div className="diff-actions">
          <span>{accepted ? "Change accepted" : "+2 −1"}</span>
          <button onClick={() => setAccepted(!accepted)}>{accepted ? "Undo" : "Accept change"}</button>
        </div>
      </div>
      <style>{`
.sf-inline-diff {
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
.sf-inline-diff * {
  box-sizing: border-box;
}
.sf-inline-diff button,
.sf-inline-diff input,
.sf-inline-diff textarea,
.sf-inline-diff select {
  font: inherit;
  color: inherit;
}
.sf-inline-diff button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-inline-diff button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-inline-diff button:focus-visible,
.sf-inline-diff input:focus-visible,
.sf-inline-diff textarea:focus-visible,
.sf-inline-diff [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-inline-diff button {
  border: 0;
  background: transparent;
}
.sf-inline-diff .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-inline-diff .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-inline-diff .mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-variant-numeric: tabular-nums;
}
.sf-inline-diff svg {
  display: block;
}
.sf-inline-diff[data-keyboard="true"] *,
.sf-inline-diff[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-inline-diff *,
  .sf-inline-diff *::before,
  .sf-inline-diff *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-inline-diff {
  background: #dfe5ed;
}
.sf-inline-diff .diff {
  width: min(100%, 410px);
  background: #f9fbfe;
  border: 1px solid #cbd5e2;
  border-radius: 11px;
  overflow: hidden;
  box-shadow: 0 15px 40px #20364f16;
}
.sf-inline-diff .diff-head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  border-bottom: 1px solid #dfe6ee;
  font-size: 11px;
  color: #6a7b93;
}
.sf-inline-diff .file-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: #94b7d3;
}
.sf-inline-diff .diff-head > div {
  margin-left: auto;
}
.sf-inline-diff .diff-head button {
  font-size: 10px;
  color: #647181;
  min-height: 30px;
}
.sf-inline-diff .code-lines {
  padding: 12px 0;
  font-size: 10px;
  line-height: 28px;
  overflow: auto;
}
.sf-inline-diff .code-lines > div:not(.old),
.sf-inline-diff .old > div {
  display: flex;
}
.sf-inline-diff .code-lines span {
  width: 34px;
  flex-shrink: 0;
  text-align: center;
  color: #717d8b;
  user-select: none;
}
.sf-inline-diff code {
  white-space: pre;
}
.sf-inline-diff .old {
  display: grid;
  transition: grid-template-rows 200ms ease-out;
  background: #f9e9e9;
  color: #b16d6d;
}
.sf-inline-diff .old > div {
  min-height: 0;
  overflow: hidden;
}
.sf-inline-diff .new {
  background: #e9f4ee;
  color: #487d61;
  transition: background 200ms;
}
.sf-inline-diff .new[data-accepted="true"] {
  background: transparent;
  color: #596d86;
}
.sf-inline-diff .diff-actions {
  border-top: 1px solid #dfe6ee;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #6d7785;
}
.sf-inline-diff .diff-actions button {
  background: #345e82;
  color: #ffffff;
  padding: 8px 11px;
  border-radius: 6px;
  min-height: 34px;
  font-size: 10px;
}
.sf-inline-diff {
  background: #202830;
  color: #cfdae5;
}
.sf-inline-diff .diff {
  background: #28333e;
  border-color: #48596a;
  box-shadow: 0 24px 45px #0004, inset 0 1px #ffffff0b;
}
.sf-inline-diff .diff-head,
.sf-inline-diff .diff-actions {
  border-color: #ffffff12;
  color: #a4b4c6;
}
.sf-inline-diff .diff-head button {
  color: #9fb3c9;
}
.sf-inline-diff .code-lines span {
  color: #8399ae;
}
.sf-inline-diff .old {
  background: #6a394044;
  color: #e7a5a8;
}
.sf-inline-diff .new {
  background: #355f4b55;
  color: #a7d0b7;
}
.sf-inline-diff .new[data-accepted="true"] {
  color: #c7d5e5;
}
.sf-inline-diff .diff-actions button {
  background: #6288ae;
  color: white;
}
`}</style>
    </div>
  )
}
