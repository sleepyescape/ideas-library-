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

  const [value, setValue] = React.useState("24"),
    [focus, setFocus] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)

  return (
    <div
      className="sf-passcode-input"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="verification">
        <span className="lock" aria-hidden>
          ⌑
        </span>
        <h3>Check your inbox</h3>
        <p>Enter the 6-digit code</p>
        <div className="code" data-complete={value.length === 6} onClick={() => input.current?.focus()}>
          <input
            ref={input}
            aria-label="Six digit verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            onPaste={(event) => {
              event.preventDefault()
              setValue(event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6))
            }}
            pattern="[0-9]*"
            maxLength={6}
            value={value}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} data-current={focus && i === value.length} className={i === 3 ? "separated" : ""}>
              {value[i] || ""}
            </span>
          ))}
        </div>
        <div className="verification-state" role="status">
          {value.length === 6 ? "✓ Code entered" : ""}
        </div>
        <button
          onClick={() => {
            setValue("")
            input.current?.focus()
          }}
        >
          Clear code
        </button>
      </div>
      <style>{`
.sf-passcode-input {
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
.sf-passcode-input * {
  box-sizing: border-box;
}
.sf-passcode-input button,
.sf-passcode-input input,
.sf-passcode-input textarea,
.sf-passcode-input select {
  font: inherit;
  color: inherit;
}
.sf-passcode-input button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-passcode-input button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-passcode-input button:focus-visible,
.sf-passcode-input input:focus-visible,
.sf-passcode-input textarea:focus-visible,
.sf-passcode-input [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-passcode-input button {
  border: 0;
  background: transparent;
}
.sf-passcode-input .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-passcode-input .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-passcode-input svg {
  display: block;
}
.sf-passcode-input[data-keyboard="true"] *,
.sf-passcode-input[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-passcode-input *,
  .sf-passcode-input *::before,
  .sf-passcode-input *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-passcode-input {
  background: #e9edf2;
}
.sf-passcode-input .verification {
  text-align: center;
  width: 310px;
  max-width: 100%;
}
.sf-passcode-input .lock {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid #c7d3e2;
  border-radius: 12px;
  background: #f5f8fc;
  margin: auto;
  color: #6f87a5;
  font-size: 30px;
  box-shadow: 0 2px 4px #1e3d5d08;
}
.sf-passcode-input h3 {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.5px;
  margin: 17px 0 5px;
}
.sf-passcode-input p {
  font-size: 12px;
  color: #66707f;
  margin: 0 0 24px;
}
.sf-passcode-input .code {
  display: flex;
  gap: 6px;
  justify-content: center;
  position: relative;
}
.sf-passcode-input .code:has(input:focus-visible) {
  outline: 2px solid #4269e1;
  outline-offset: 4px;
  border-radius: 8px;
}
.sf-passcode-input .code input {
  font-size: 16px;
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: text;
  z-index: 2;
}
.sf-passcode-input .code span {
  display: grid;
  place-items: center;
  width: 36px;
  height: 46px;
  border: 1px solid #c8d3e2;
  border-radius: 8px;
  background: #fcfdff;
  font-size: 23px;
  color: #456288;
  box-shadow: 0 2px 3px #233d5608;
  transition: border-color 140ms, background 140ms;
}
.sf-passcode-input .code .separated {
  margin-left: 8px;
}
.sf-passcode-input .code span[data-current="true"] {
  border-color: #6c90bc;
  box-shadow: 0 0 0 3px #93b4dc30;
}
.sf-passcode-input .code[data-complete="true"] span {
  border-color: #8fb09c;
  background: #f5fcf7;
  color: #4a8060;
}
.sf-passcode-input .verification-state {
  height: 32px;
  padding-top: 10px;
  color: #5f9472;
  font-size: 11px;
}
.sf-passcode-input .verification > button {
  font-size: 11px;
  color: #5e6c7d;
  padding: 8px;
  min-height: 44px;
}
`}</style>
    </div>
  )
}
