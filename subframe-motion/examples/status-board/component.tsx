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

  const [done, setDone] = React.useState(false),
    [drag, setDrag] = React.useState(false)

  return (
    <div
      className="sf-status-board"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="board">
        <div
          className="column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            setDone(false)
            setDrag(false)
          }}
        >
          <div className="column-name">
            <i />
            In progress <span>{done ? 0 : 1}</span>
          </div>
          <div className="slot" data-empty={done} />
        </div>
        <div
          className="column done"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            setDone(true)
            setDrag(false)
          }}
        >
          <div className="column-name">
            <i />
            Done <span>{done ? 1 : 0}</span>
          </div>
          <div className="slot" data-empty={!done} />
        </div>
        <div
          className="task"
          draggable
          onDragStart={() => setDrag(true)}
          onDragEnd={() => setDrag(false)}
          style={{ transform: done ? "translateX(calc(100% + 14px))" : "translateX(0)", opacity: drag ? 0.5 : 1 }}
        >
          <span className="task-id">STU—24</span>
          <strong>Refine the wordmark</strong>
          <div className="task-foot">
            <span className="task-avatar">AK</span>
            <button aria-label={done ? "Move to in progress" : "Mark done"} onClick={() => setDone(!done)}>
              {done ? "←" : "✓"}
            </button>
          </div>
        </div>
        <span className="sr" role="status">
          {done ? "Task moved to Done" : "Task in progress"}
        </span>
      </div>
      <style>{`
.sf-status-board {
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
.sf-status-board * {
  box-sizing: border-box;
}
.sf-status-board button,
.sf-status-board input,
.sf-status-board textarea,
.sf-status-board select {
  font: inherit;
  color: inherit;
}
.sf-status-board button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-status-board button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-status-board button:focus-visible,
.sf-status-board input:focus-visible,
.sf-status-board textarea:focus-visible,
.sf-status-board [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-status-board button {
  border: 0;
  background: transparent;
}
.sf-status-board .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-status-board .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-status-board .sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
}
.sf-status-board svg {
  display: block;
}
.sf-status-board[data-keyboard="true"] *,
.sf-status-board[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-status-board *,
  .sf-status-board *::before,
  .sf-status-board *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-status-board {
  background: #e7ebed;
}
.sf-status-board .board {
  display: flex;
  gap: 14px;
  position: relative;
  width: min(100%, 400px);
  height: 201px;
}
.sf-status-board .column {
  width: 50%;
  background: #f0f3f4;
  border-radius: 10px;
  padding: 13px 8px;
  box-shadow: inset 0 0 0 1px #dbe3e6;
}
.sf-status-board .column-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #6d8593;
  padding: 0 3px;
  white-space: nowrap;
}
.sf-status-board .column-name i {
  width: 6px;
  height: 6px;
  border: 1px solid #a9bdc5;
  border-radius: 50%;
}
.sf-status-board .done .column-name i {
  background: #7aa390;
  border-color: #7aa390;
}
.sf-status-board .column-name > span {
  margin-left: auto;
  font-size: 9px;
  color: #7c878c;
}
.sf-status-board .slot {
  height: 123px;
  margin-top: 13px;
  border: 1px dashed transparent;
  border-radius: 8px;
}
.sf-status-board .slot[data-empty="true"] {
  border-color: #d4dee2;
}
.sf-status-board .task {
  position: absolute;
  top: 44px;
  left: 7px;
  width: calc(50% - 14px);
  height: 125px;
  padding: 13px;
  background: #fff;
  border: 1px solid #d2dfe4;
  border-radius: 8px;
  box-shadow: 0 4px 8px #3449550d;
  transition: transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 150ms;
  cursor: grab;
}
.sf-status-board .task-id {
  font: 9px ui-monospace;
  color: #7d878c;
}
.sf-status-board .task strong {
  display: block;
  font-size: 12px;
  line-height: 1.45;
  font-weight: 500;
  margin-top: 7px;
}
.sf-status-board .task-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 9px;
}
.sf-status-board .task-avatar {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  background: #e0e9df;
  border-radius: 50%;
  font-size: 8px;
  color: #799171;
}
.sf-status-board .task-foot button {
  height: 27px;
  width: 30px;
  border-radius: 5px;
  background: #edf4f0;
  color: #709581;
}
`}</style>
    </div>
  )
}
