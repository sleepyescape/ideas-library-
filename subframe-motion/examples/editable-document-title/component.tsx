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

  const [title, setTitle] = React.useState("Objects of tomorrow"),
    [draft, setDraft] = React.useState(title),
    [editing, setEditing] = React.useState(false),
    [saved, setSaved] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null),
    titleButton = React.useRef<HTMLButtonElement>(null),
    wasEditing = React.useRef(false)
  React.useEffect(() => {
    if (editing) {
      input.current?.focus()
      input.current?.select()
    } else if (wasEditing.current) {
      titleButton.current?.focus({ preventScroll: true })
    }
    wasEditing.current = editing
  }, [editing])
  function commit() {
    if (draft.trim()) {
      setTitle(draft.trim())
    }
    setEditing(false)
    setSaved(true)
  }

  return (
    <div
      className="sf-editable-document-title"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="document">
        <div className="page-icon" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <div className="identity">
          <span className="muted">Collection</span>
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                commit()
              }}
            >
              <input
                ref={input}
                aria-label="Collection title"
                maxLength={50}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setEditing(false)
                    setDraft(title)
                  }
                }}
              />
              <div className="edit-actions">
                <button type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit">Save ↵</button>
              </div>
            </form>
          ) : (
            <button
              ref={titleButton}
              className="title"
              onClick={() => {
                setDraft(title)
                setEditing(true)
                setSaved(false)
              }}
            >
              {title}
              <span aria-hidden>✎</span>
            </button>
          )}
          <div className="saved" role="status">
            {saved ? "✓ Saved" : "12 objects"}
          </div>
        </div>
      </div>
      <style>{`
.sf-editable-document-title {
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
.sf-editable-document-title * {
  box-sizing: border-box;
}
.sf-editable-document-title button,
.sf-editable-document-title input,
.sf-editable-document-title textarea,
.sf-editable-document-title select {
  font: inherit;
  color: inherit;
}
.sf-editable-document-title button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-editable-document-title button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-editable-document-title button:focus-visible,
.sf-editable-document-title input:focus-visible,
.sf-editable-document-title textarea:focus-visible,
.sf-editable-document-title [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-editable-document-title button {
  border: 0;
  background: transparent;
}
.sf-editable-document-title .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-editable-document-title .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-editable-document-title svg {
  display: block;
}
.sf-editable-document-title[data-keyboard="true"] * {
  transition-duration: 0s !important;
  animation: none !important;
}
.sf-editable-document-title[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-editable-document-title *,
  .sf-editable-document-title *::before,
  .sf-editable-document-title *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-editable-document-title {
  background: #e8e9e5;
}
.sf-editable-document-title .document {
  width: min(100%, 410px);
  display: flex;
  gap: 19px;
  padding: 28px 24px;
  background: #fafbf8;
  border-radius: 13px;
  border: 1px solid #d1d6cc;
  box-shadow: 0 12px 30px #333f2510;
}
.sf-editable-document-title .page-icon {
  width: 46px;
  height: 58px;
  border-radius: 5px;
  background: #e7ebdf;
  box-shadow: inset 0 0 0 1px #cbd4bd;
  flex-shrink: 0;
  padding: 19px 9px 9px;
  transform: rotate(-5deg);
}
.sf-editable-document-title .page-icon i {
  height: 2px;
  background: #a8b399;
  display: block;
  margin-bottom: 6px;
}
.sf-editable-document-title .page-icon i:last-child {
  width: 60%;
}
.sf-editable-document-title .identity {
  flex: 1;
  min-width: 0;
}
.sf-editable-document-title .title {
  display: block;
  text-align: left;
  font-size: 21px;
  line-height: 1.2;
  letter-spacing: -0.7px;
  margin: 7px 0;
  padding: 0;
  max-width: 100%;
}
.sf-editable-document-title .title span {
  display: inline-block;
  font-size: 14px;
  color: #8b967b;
  margin-left: 10px;
  opacity: 0.6;
}
.sf-editable-document-title input {
  font-size: 19px;
  letter-spacing: -0.6px;
  width: 100%;
  margin: 5px 0;
  border: 0;
  border-bottom: 1px solid #768d60;
  background: transparent;
  outline: 0;
}
.sf-editable-document-title .edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  animation: sf-editable-document-title-editIn 140ms ease-out;
}
.sf-editable-document-title .edit-actions button {
  font-size: 11px;
  padding: 5px 9px;
  min-height: 44px;
  border-radius: 5px;
  background: #e4ebdb;
}
.sf-editable-document-title .saved {
  margin-top: 10px;
  font-size: 11px;
  color: #83916f;
}
@keyframes sf-editable-document-title-editIn {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
}
`}</style>
    </div>
  )
}
