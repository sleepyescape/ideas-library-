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
    [bold, setBold] = React.useState(false),
    [italic, setItalic] = React.useState(false),
    [mark, setMark] = React.useState(true)
  const text = React.useRef<HTMLParagraphElement>(null)

  const trigger = React.useRef<HTMLButtonElement>(null)
  const popup = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    if (!open && popup.current?.contains(document.activeElement)) {
      trigger.current?.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <div
      className="sf-selection-toolbar"
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
      <div className="excerpt">
        <div ref={popup} className="toolbar" data-open={open} aria-label="Text formatting" role="toolbar" inert={!open}>
          <button aria-label="Bold" aria-pressed={bold} onClick={() => setBold(!bold)}>
            <b>B</b>
          </button>
          <button aria-label="Italic" aria-pressed={italic} onClick={() => setItalic(!italic)}>
            <i>I</i>
          </button>
          <button aria-label="Highlight" aria-pressed={mark} onClick={() => setMark(!mark)}>
            ▰
          </button>
          <span />
          <button aria-label="Close formatting" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <p
          ref={text}
          onMouseUp={() => {
            if (window.getSelection()?.toString().trim()) {
              setOpen(true)
            }
          }}
        >
          A good object makes room for{" "}
          <span
            style={{
              fontWeight: bold ? 700 : 400,
              fontStyle: italic ? "italic" : "normal",
              background: mark ? "#e5eacb" : "transparent",
            }}
          >
            a better everyday.
          </span>
        </p>
        <button ref={trigger} className="edit" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Hide formatting" : "Format selected phrase"}
        </button>
      </div>
      <style>{`
.sf-selection-toolbar {
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
.sf-selection-toolbar * {
  box-sizing: border-box;
}
.sf-selection-toolbar button,
.sf-selection-toolbar input,
.sf-selection-toolbar textarea,
.sf-selection-toolbar select {
  font: inherit;
  color: inherit;
}
.sf-selection-toolbar button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-selection-toolbar button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-selection-toolbar button:focus-visible,
.sf-selection-toolbar input:focus-visible,
.sf-selection-toolbar textarea:focus-visible,
.sf-selection-toolbar [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-selection-toolbar button {
  border: 0;
  background: transparent;
}
.sf-selection-toolbar .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-selection-toolbar .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-selection-toolbar svg {
  display: block;
}
.sf-selection-toolbar[data-keyboard="true"] *,
.sf-selection-toolbar[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-selection-toolbar *,
  .sf-selection-toolbar *::before,
  .sf-selection-toolbar *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-selection-toolbar {
  background: #e7e9e2;
}
.sf-selection-toolbar .excerpt {
  position: relative;
  width: min(100%, 380px);
  background: #fcfdf8;
  border: 1px solid #d7dccb;
  border-radius: 12px;
  padding: 60px 30px 24px;
  box-shadow: 0 13px 30px #34402712;
}
.sf-selection-toolbar p {
  font: 25px/1.45 Georgia, serif;
  letter-spacing: -0.7px;
  margin: 0 0 22px;
  color: #4a5340;
}
.sf-selection-toolbar p span {
  box-decoration-break: clone;
  padding: 1px 2px;
}
.sf-selection-toolbar .toolbar {
  position: absolute;
  top: 9px;
  left: 50%;
  display: flex;
  align-items: center;
  padding: 4px;
  background: #313b2b;
  border-radius: 9px;
  box-shadow: 0 7px 16px #23311b30;
  opacity: 0;
  transform: translate(-50%, 5px) scale(0.96);
  transition: opacity 160ms, transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
}
.sf-selection-toolbar .toolbar[data-open="true"] {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
  pointer-events: auto;
}
.sf-selection-toolbar .toolbar button {
  width: 36px;
  height: 34px;
  color: #9ca296;
  border-radius: 5px;
}
.sf-selection-toolbar .toolbar [aria-pressed="true"] {
  background: #536148;
  color: #ffffff;
}
.sf-selection-toolbar .toolbar > span {
  height: 18px;
  border-left: 1px solid #647158;
  margin: 0 3px;
}
.sf-selection-toolbar .edit {
  font-size: 11px;
  color: #879477;
  padding: 0;
  min-height: 32px;
}
`}</style>
    </div>
  )
}
