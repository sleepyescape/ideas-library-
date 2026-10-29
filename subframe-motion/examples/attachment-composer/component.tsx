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

  const [files, setFiles] = React.useState(["Moodboard.pdf"]),
    [text, setText] = React.useState("A few directions for the new collection."),
    [sent, setSent] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)

  return (
    <div
      className="sf-attachment-composer"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim() || files.length) {
            setSent(true)
          }
        }}
      >
        <div className="attachments">
          {files.map((f, i) => (
            <div className="file" key={f + i}>
              <span className="file-icon" aria-hidden>
                ↗
              </span>
              <span>{f}</span>
              <button
                type="button"
                aria-label={"Remove " + f}
                onClick={() => setFiles((v) => v.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <textarea
          aria-label="Message"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setSent(false)
          }}
          placeholder="Write a message…"
        />
        <div className="row between">
          <input
            ref={input}
            type="file"
            multiple
            className="sr"
            tabIndex={-1}
            onChange={(e) => {
              const added = Array.from(e.target.files || []).map((x) => x.name)
              setFiles((f) => [...f, ...added].slice(0, 3))
              setSent(false)
              e.target.value = ""
            }}
          />
          <button type="button" className="attach" aria-label="Attach files" onClick={() => input.current?.click()}>
            ＋
          </button>
          <span className="muted" role="status">
            {sent ? "Message prepared" : ""}
          </span>
          <button type="submit" className="send" aria-label="Prepare message">
            ↑
          </button>
        </div>
      </form>
      <style>{`
.sf-attachment-composer {
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
.sf-attachment-composer * {
  box-sizing: border-box;
}
.sf-attachment-composer button,
.sf-attachment-composer input,
.sf-attachment-composer textarea,
.sf-attachment-composer select {
  font: inherit;
  color: inherit;
}
.sf-attachment-composer button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-attachment-composer button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-attachment-composer button:focus-visible,
.sf-attachment-composer input:focus-visible,
.sf-attachment-composer textarea:focus-visible,
.sf-attachment-composer [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-attachment-composer button {
  border: 0;
  background: transparent;
}
.sf-attachment-composer .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-attachment-composer .between {
  justify-content: space-between;
}
.sf-attachment-composer .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-attachment-composer .sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
}
.sf-attachment-composer svg {
  display: block;
}
.sf-attachment-composer[data-keyboard="true"] * {
  transition-duration: 0s !important;
  animation: none !important;
}
.sf-attachment-composer[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-attachment-composer *,
  .sf-attachment-composer *::before,
  .sf-attachment-composer *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-attachment-composer {
  background: #e6eaf2;
}
.sf-attachment-composer .composer {
  width: min(100%, 400px);
  padding: 14px;
  border-radius: 18px;
  border: 1px solid #cdd5e2;
  background: #fff;
  box-shadow: 0 12px 30px #23376214;
}
.sf-attachment-composer .attachments {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}
.sf-attachment-composer .file {
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #e1e5ed;
  border-radius: 9px;
  font-size: 11px;
  max-width: 100%;
  animation: sf-attachment-composer-attachmentIn 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-attachment-composer .file > span:nth-child(2) {
  max-width: 160px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.sf-attachment-composer .file-icon {
  display: grid;
  place-items: center;
  background: #e9effa;
  width: 30px;
  align-self: stretch;
  border-radius: 8px 0 0 8px;
  color: #4a67a2;
  font-size: 18px;
}
.sf-attachment-composer .file button {
  width: 32px;
  height: 36px;
  color: #7b8598;
  font-size: 17px;
}
.sf-attachment-composer textarea {
  resize: none;
  width: 100%;
  height: 92px;
  border: 0;
  background: transparent;
  padding: 17px 3px;
  outline-offset: 0;
  font-size: 16px;
  line-height: 1.5;
}
.sf-attachment-composer .attach,
.sf-attachment-composer .send {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
}
.sf-attachment-composer .attach {
  color: #6d7a90;
}
.sf-attachment-composer .send {
  background: #2b4b85;
  color: #ffffff;
}
@keyframes sf-attachment-composer-attachmentIn {
  from {
    transform: translateY(5px);
    opacity: 0;
  }
}
.sf-attachment-composer {
  background: #efefeb;
}
.sf-attachment-composer .composer {
  border-color: #d3d6d0;
  border-radius: 13px;
  box-shadow: 0 12px 24px #282e2420;
}
.sf-attachment-composer .send {
  background: #2350df;
  box-shadow: 0 3px 8px #234adb33;
}
.sf-attachment-composer .attach {
  color: #656962;
}
.sf-attachment-composer .file-icon {
  background: #e5eafa;
  color: #3458b9;
}
`}</style>
    </div>
  )
}
