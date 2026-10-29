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

  const [expanded, setExpanded] = React.useState(true),
    [selected, setSelected] = React.useState("Cover.fig")
  const files = ["Cover.fig", "Typography.fig", "Marks.svg"]

  return (
    <div
      className="sf-folder-tree"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="files">
        <div className="row between file-heading">
          <strong>Studio files</strong>
          <span className="muted">4 items</span>
        </div>
        <button className="folder" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          <span className="arrow" style={{ transform: expanded ? "rotate(90deg)" : "none" }}>
            ›
          </span>
          <span className="folder-icon" aria-hidden />
          Identity
        </button>
        <div className="branch" inert={!expanded} style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
          <div>
            {files.map((f, i) => (
              <button key={f} aria-pressed={selected === f} onClick={() => setSelected(f)}>
                <span className="stem" aria-hidden />
                <span className={"file-type t" + i} aria-hidden>
                  {i === 2 ? "◇" : "▧"}
                </span>
                {f}
                <span className="check">{selected === f ? "✓" : ""}</span>
              </button>
            ))}
          </div>
        </div>
        <button className="folder loose" aria-pressed={selected === "Notes.md"} onClick={() => setSelected("Notes.md")}>
          <span className="file-type" aria-hidden>
            ▤
          </span>
          Notes.md
        </button>
      </div>
      <style>{`
.sf-folder-tree {
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
.sf-folder-tree * {
  box-sizing: border-box;
}
.sf-folder-tree button,
.sf-folder-tree input,
.sf-folder-tree textarea,
.sf-folder-tree select {
  font: inherit;
  color: inherit;
}
.sf-folder-tree button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-folder-tree button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-folder-tree button:focus-visible,
.sf-folder-tree input:focus-visible,
.sf-folder-tree textarea:focus-visible,
.sf-folder-tree [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-folder-tree button {
  border: 0;
  background: transparent;
}
.sf-folder-tree .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-folder-tree .between {
  justify-content: space-between;
}
.sf-folder-tree .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-folder-tree svg {
  display: block;
}
.sf-folder-tree[data-keyboard="true"] *,
.sf-folder-tree[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-folder-tree *,
  .sf-folder-tree *::before,
  .sf-folder-tree *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-folder-tree {
  background: #e9edf0;
}
.sf-folder-tree .files {
  width: min(100%, 330px);
  padding: 16px;
  border: 1px solid #d8dfe5;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 15px 30px #293f5312;
}
.sf-folder-tree .file-heading {
  padding: 1px 6px 14px;
  font-size: 12px;
}
.sf-folder-tree .folder {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  text-align: left;
  font-size: 12px;
  border-radius: 6px;
}
.sf-folder-tree .arrow {
  font-size: 20px;
  width: 12px;
  text-align: center;
  transition: transform 180ms;
}
.sf-folder-tree .folder-icon {
  width: 17px;
  height: 12px;
  border-radius: 2px;
  background: #e1b955;
  position: relative;
}
.sf-folder-tree .folder-icon:before {
  content: "";
  position: absolute;
  top: -3px;
  width: 7px;
  height: 5px;
  background: #e1b955;
  border-radius: 2px;
}
.sf-folder-tree .branch {
  display: grid;
  transition: grid-template-rows 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-folder-tree .branch > div {
  min-height: 0;
  overflow: hidden;
}
.sf-folder-tree .branch button {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 36px;
  font-size: 12px;
  padding-left: 18px;
  border-radius: 6px;
  text-align: left;
}
.sf-folder-tree .branch button[aria-pressed="true"] {
  background: #edf2fb;
  color: #335987;
}
.sf-folder-tree .stem {
  width: 15px;
  height: 36px;
  border-left: 1px solid #dfe4eb;
  position: relative;
  margin-right: 1px;
}
.sf-folder-tree .stem:after {
  content: "";
  position: absolute;
  width: 12px;
  border-top: 1px solid #dfe4eb;
  top: 18px;
  left: 0;
}
.sf-folder-tree .file-type {
  color: #59687c;
  font-size: 19px;
}
.sf-folder-tree .t1 {
  color: #766689;
}
.sf-folder-tree .t2 {
  color: #b49159;
}
.sf-folder-tree .check {
  margin-left: auto;
  color: #546b89;
  margin-right: 5px;
}
.sf-folder-tree .loose {
  padding-left: 25px;
}
.sf-folder-tree {
  background: #eceae6;
  color: #292827;
}
.sf-folder-tree .files {
  background: #fcfbf8;
  border-color: #d9d5cd;
  box-shadow: 0 15px 25px #39352b15;
}
.sf-folder-tree .branch button[aria-pressed="true"] {
  background: #eeece6;
  color: #36322b;
}
.sf-folder-tree .check {
  color: #81735e;
}
.sf-folder-tree .file-type {
  color: #8d8374;
}
.sf-folder-tree .t1 {
  color: #8c7994;
}
.sf-folder-tree .t2 {
  color: #987c52;
}
`}</style>
    </div>
  )
}
