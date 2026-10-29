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

  const [names, setNames] = React.useState(["Ada", "Mika"]),
    [text, setText] = React.useState("")
  function insert() {
    const v = text.trim().replace(/[,;]$/g, "")
    if (v && !names.includes(v) && names.length < 5) {
      setNames((n) => [...n, v])
    }
    setText("")
  }

  return (
    <div
      className="sf-recipient-tokens"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="mail">
        <div className="field">
          <span className="label">To</span>
          <div className="tokens">
            {names.map((n, i) => (
              <span className="token" key={n}>
                <span className={"avatar a" + i}>{n[0]}</span>
                <span className="token-label" title={n}>
                  {n}
                </span>
                <button aria-label={"Remove " + n} onClick={() => setNames((x) => x.filter((v) => v !== n))}>
                  ×
                </button>
              </span>
            ))}
            <input
              aria-label="Add recipient"
              placeholder={names.length < 5 ? "Add someone…" : ""}
              value={text}
              disabled={names.length >= 5}
              onChange={(e) => setText(e.target.value)}
              onBlur={insert}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  insert()
                }
                if (e.key === "Backspace" && !text) {
                  setNames((n) => n.slice(0, -1))
                }
              }}
            />
          </div>
        </div>
        <div className="subject">Studio visit, Thursday?</div>
        <div className="message">I saved you a seat.</div>
        <div className="row between">
          <span className="muted">{names.length} recipients</span>
          <button
            className="send"
            onClick={() => {
              setNames(["Ada", "Mika"])
              setText("")
            }}
            aria-label="Reset recipients"
          >
            ↻
          </button>
        </div>
      </div>
      <style>{`
.sf-recipient-tokens {
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
.sf-recipient-tokens * {
  box-sizing: border-box;
}
.sf-recipient-tokens button,
.sf-recipient-tokens input,
.sf-recipient-tokens textarea,
.sf-recipient-tokens select {
  font: inherit;
  color: inherit;
}
.sf-recipient-tokens button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-recipient-tokens button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-recipient-tokens button:focus-visible,
.sf-recipient-tokens input:focus-visible,
.sf-recipient-tokens textarea:focus-visible,
.sf-recipient-tokens [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-recipient-tokens button {
  border: 0;
  background: transparent;
}
.sf-recipient-tokens .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-recipient-tokens .between {
  justify-content: space-between;
}
.sf-recipient-tokens .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-recipient-tokens svg {
  display: block;
}
.sf-recipient-tokens[data-keyboard="true"] * {
  transition-duration: 0s !important;
  animation: none !important;
}
.sf-recipient-tokens[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-recipient-tokens *,
  .sf-recipient-tokens *::before,
  .sf-recipient-tokens *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-recipient-tokens {
  background: #eef0f4;
}
.sf-recipient-tokens .mail {
  width: min(100%, 395px);
  padding: 18px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 13px 35px #2d3e5817;
  border: 1px solid #dfe4ec;
}
.sf-recipient-tokens .field {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 13px;
  border-bottom: 1px solid #edf0f5;
}
.sf-recipient-tokens .label {
  font-size: 12px;
  color: #717680;
  padding-top: 7px;
}
.sf-recipient-tokens .tokens {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
  max-height: 135px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.sf-recipient-tokens .token {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #edf1f7;
  border: 1px solid #e2e7f0;
  border-radius: 6px;
  font-size: 11px;
  height: 30px;
  max-width: 100%;
  padding: 3px;
  animation: sf-recipient-tokens-recipientIn 160ms ease-out;
}
.sf-recipient-tokens .token-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sf-recipient-tokens .avatar {
  flex-shrink: 0;
  width: 21px;
  height: 21px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  background: #c9d9ed;
  color: #3b628f;
  font-size: 10px;
}
.sf-recipient-tokens .a1 {
  background: #decdee;
  color: #7c5096;
}
.sf-recipient-tokens .token button {
  flex-shrink: 0;
  width: 23px;
  height: 24px;
  color: #66707d;
}
.sf-recipient-tokens input {
  min-width: 85px;
  width: 110px;
  height: 30px;
  border: 0;
  font-size: 16px;
  outline: 0;
}
.sf-recipient-tokens .tokens :focus-visible {
  outline-offset: -2px;
}
.sf-recipient-tokens input::placeholder {
  font-size: 12px;
}
.sf-recipient-tokens input:disabled {
  display: none;
}
.sf-recipient-tokens .subject {
  font-weight: 500;
  margin: 16px 0 8px;
}
.sf-recipient-tokens .message {
  font-size: 12px;
  color: #6e747e;
  margin-bottom: 26px;
}
.sf-recipient-tokens .send {
  width: 36px;
  height: 36px;
  color: #6e83a0;
  font-size: 20px;
}
@keyframes sf-recipient-tokens-recipientIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
}
`}</style>
    </div>
  )
}
