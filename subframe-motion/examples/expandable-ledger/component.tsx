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

  const [open, setOpen] = React.useState(1)
  const rows = [
    { name: "Fieldwork Studio", date: "Oct 09", total: "€480.00", detail: "Identity consultation", ref: "INV—1082" },
    { name: "Paper & Print", date: "Oct 08", total: "€126.80", detail: "100 × sample books", ref: "INV—1079" },
    { name: "Foundry Type", date: "Oct 06", total: "€89.00", detail: "Desktop font license", ref: "INV—1075" },
  ]

  return (
    <div
      className="sf-expandable-ledger"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="ledger">
        <div className="ledger-heading">
          Recent expenses<span>EUR</span>
        </div>
        {rows.map((r, i) => (
          <div className="ledger-item" key={r.name}>
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
              <span className="merchant" aria-hidden>
                {r.name[0]}
              </span>
              <span>
                {r.name}
                <small>{r.date}</small>
              </span>
              <span className="amount">{r.total}</span>
              <span className="ledger-chevron" style={{ transform: open === i ? "rotate(90deg)" : "none" }}>
                ›
              </span>
            </button>
            <div className="ledger-detail" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
              <div>
                <span>{r.detail}</span>
                <span className="mono">{r.ref}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
.sf-expandable-ledger {
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
.sf-expandable-ledger * {
  box-sizing: border-box;
}
.sf-expandable-ledger button,
.sf-expandable-ledger input,
.sf-expandable-ledger textarea,
.sf-expandable-ledger select {
  font: inherit;
  color: inherit;
}
.sf-expandable-ledger button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-expandable-ledger button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-expandable-ledger button:focus-visible,
.sf-expandable-ledger input:focus-visible,
.sf-expandable-ledger textarea:focus-visible,
.sf-expandable-ledger [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-expandable-ledger button {
  border: 0;
  background: transparent;
}
.sf-expandable-ledger .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-expandable-ledger .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-expandable-ledger .mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-variant-numeric: tabular-nums;
}
.sf-expandable-ledger svg {
  display: block;
}
.sf-expandable-ledger[data-keyboard="true"] *,
.sf-expandable-ledger[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-expandable-ledger *,
  .sf-expandable-ledger *::before,
  .sf-expandable-ledger *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-expandable-ledger {
  background: #e7eaec;
}
.sf-expandable-ledger .ledger {
  width: min(100%, 400px);
  background: #fff;
  border: 1px solid #d8e0e4;
  border-radius: 13px;
  padding: 17px;
  box-shadow: 0 15px 35px #253f5011;
}
.sf-expandable-ledger .ledger-heading {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 11px;
}
.sf-expandable-ledger .ledger-heading > span {
  color: #767f86;
  font: 9px ui-monospace;
}
.sf-expandable-ledger .ledger-item {
  border-top: 1px solid #edf1f3;
}
.sf-expandable-ledger .ledger-item > button {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 57px;
  text-align: left;
  gap: 9px;
  font-size: 11px;
  padding: 0;
}
.sf-expandable-ledger .merchant {
  width: 29px;
  height: 31px;
  background: #eef2f5;
  border: 1px solid #e4e9ee;
  border-radius: 7px;
  display: grid;
  place-items: center;
  font: 14px Georgia;
  color: #5e6e79;
  flex-shrink: 0;
}
.sf-expandable-ledger small {
  display: block;
  font-size: 9px;
  color: #768087;
  margin-top: 3px;
}
.sf-expandable-ledger .amount {
  font: 10px ui-monospace;
  margin-left: auto;
  white-space: nowrap;
  color: #5c7383;
}
.sf-expandable-ledger .ledger-chevron {
  color: #7e878e;
  transition: transform 180ms;
  font-size: 17px;
}
.sf-expandable-ledger .ledger-detail {
  display: grid;
  transition: grid-template-rows 210ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-expandable-ledger .ledger-detail > div {
  overflow: hidden;
  min-height: 0;
  padding-left: 38px;
  font-size: 10px;
  color: #5e6c76;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sf-expandable-ledger .ledger-detail .mono {
  font-size: 8px;
  color: #81898f;
  padding-bottom: 12px;
}
@media (max-width: 360px) {
  .sf-expandable-ledger .ledger {
    padding: 13px;
  }
  .sf-expandable-ledger .ledger-item > button {
    gap: 7px;
    font-size: 10px;
  }
  .sf-expandable-ledger .amount {
    font-size: 9px;
  }
}
.sf-expandable-ledger {
  background: #eeeeec;
  color: #252827;
}
.sf-expandable-ledger .ledger {
  background: #fdfefd;
  border-color: #d1d6d2;
  box-shadow: 0 15px 30px #1c28201a;
}
.sf-expandable-ledger .amount {
  color: #35433d;
}
.sf-expandable-ledger .merchant {
  background: #edf0eb;
  border-color: #dce2d9;
  color: #77836d;
}
`}</style>
    </div>
  )
}
