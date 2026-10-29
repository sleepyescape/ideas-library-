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

  const [open, setOpen] = React.useState(1),
    [step, setStep] = React.useState(2)
  const tasks = [
    { name: "Find available rooms", detail: "3 rooms available", code: "rooms.search({ guests: 2 })" },
    { name: "Check the rate", detail: "€180 / night", code: "rates.quote({ room: 'garden' })" },
    { name: "Prepare reservation", detail: "Ready for approval", code: "booking.prepare({ nights: 2 })" },
  ]

  return (
    <div
      className="sf-tool-call-stack"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="tools">
        <div className="row between cap">
          <strong>Garden room · 2 nights</strong>
          <button aria-label="Advance tool run" onClick={() => setStep((s) => (s + 1) % 4)}>
            ↻
          </button>
        </div>
        {tasks.map((t, i) => (
          <div className="tool" key={t.name}>
            <button className="row" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
              <span className="node" data-done={i < step}>
                {i < step ? "✓" : i === step ? "◌" : "·"}
              </span>
              <span>{t.name}</span>
              <span className="chevron" style={{ transform: open === i ? "rotate(90deg)" : "none" }}>
                ›
              </span>
            </button>
            <div className="reveal" inert={open !== i} style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
              <div>
                <code>{t.code}</code>
                <small>{i < step ? t.detail : i === step ? "Running…" : "Queued"}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
.sf-tool-call-stack {
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
.sf-tool-call-stack * {
  box-sizing: border-box;
}
.sf-tool-call-stack button,
.sf-tool-call-stack input,
.sf-tool-call-stack textarea,
.sf-tool-call-stack select {
  font: inherit;
  color: inherit;
}
.sf-tool-call-stack button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-tool-call-stack button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-tool-call-stack button:focus-visible,
.sf-tool-call-stack input:focus-visible,
.sf-tool-call-stack textarea:focus-visible,
.sf-tool-call-stack [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-tool-call-stack button {
  border: 0;
  background: transparent;
}
.sf-tool-call-stack .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-tool-call-stack .between {
  justify-content: space-between;
}
.sf-tool-call-stack .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-tool-call-stack svg {
  display: block;
}
.sf-tool-call-stack[data-keyboard="true"] *,
.sf-tool-call-stack[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-tool-call-stack *,
  .sf-tool-call-stack *::before,
  .sf-tool-call-stack *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-tool-call-stack {
  background: #eceded;
}
.sf-tool-call-stack .tools {
  width: min(100%, 385px);
  background: #fff;
  border: 1px solid #d8dedb;
  border-radius: 13px;
  padding: 12px 16px;
  box-shadow: 0 10px 25px #243b3010;
}
.sf-tool-call-stack .cap {
  padding: 4px 0 12px;
  border-bottom: 1px solid #edf0ee;
  font-size: 12px;
}
.sf-tool-call-stack .cap button {
  width: 34px;
  height: 34px;
  font-size: 20px;
}
.sf-tool-call-stack .tool > button {
  width: 100%;
  min-height: 44px;
  text-align: left;
  font-size: 12px;
  padding: 4px 0;
}
.sf-tool-call-stack .node {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: 1px solid #dce2df;
  border-radius: 50%;
  color: #7e8e87;
  font-size: 13px;
}
.sf-tool-call-stack .node[data-done="true"] {
  background: #e7f2eb;
  color: #288053;
  border-color: #d2e8d9;
}
.sf-tool-call-stack .chevron {
  margin-left: auto;
  transition: transform 180ms;
}
.sf-tool-call-stack .reveal {
  display: grid;
  transition: grid-template-rows 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-tool-call-stack .reveal > div {
  overflow: hidden;
  min-height: 0;
  padding-left: 34px;
}
.sf-tool-call-stack code {
  display: block;
  font-size: 10px;
  color: #61756b;
  overflow-wrap: anywhere;
}
.sf-tool-call-stack small {
  display: block;
  font-size: 11px;
  color: #395a49;
  padding: 6px 0 12px;
}
.sf-tool-call-stack {
  background: #232a29;
  color: #e0e9e4;
}
.sf-tool-call-stack .tools {
  background: #2c3533;
  border-color: #44534d;
  box-shadow: 0 24px 40px #0004, inset 0 1px #ffffff08;
}
.sf-tool-call-stack .cap {
  border-color: #ffffff10;
}
.sf-tool-call-stack .node {
  border-color: #52665c;
  color: #a8c0b1;
}
.sf-tool-call-stack .node[data-done="true"] {
  background: #3a5143;
  color: #afd4b7;
  border-color: #59735f;
}
.sf-tool-call-stack code {
  color: #aec1b6;
}
.sf-tool-call-stack small {
  color: #c9ded0;
}
.sf-tool-call-stack .chevron {
  color: #94ad9e;
}
`}</style>
    </div>
  )
}
