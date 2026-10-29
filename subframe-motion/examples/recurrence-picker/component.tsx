/**
 * MIT License
 * Copyright (c) 2026 Subframe
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

"use client"
import * as React from "react"
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
export default function Example({ active = true }: { active?: boolean }) {
  const [enabled, setEnabled] = React.useState(true),
    [days, setDays] = React.useState([0, 2, 4]),
    [interval, setInterval] = React.useState("1"),
    [keyboard, setKeyboard] = React.useState(false)
  const toggle = (i: number) => setDays((v) => (v.includes(i) ? v.filter((n) => n !== i) : [...v, i].sort()))
  return (
    <section
      className="sf-recurrence-picker"
      data-still={!active || keyboard}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
      aria-label="Weekly repeat schedule"
    >
      <div className="schedule">
        <header>
          <div>
            <svg viewBox="0 0 20 20" aria-hidden>
              <path d="M3 7a7 7 0 0 1 12-3l2 2M17 2v4h-4M17 13a7 7 0 0 1-12 3l-2-2M3 18v-4h4" />
            </svg>
            <h2>Repeat</h2>
          </div>
          <button
            type="button"
            disabled={!active}
            role="switch"
            aria-label="Repeat schedule"
            aria-checked={enabled}
            className="toggle"
            onClick={() => setEnabled(!enabled)}
          >
            <span />
          </button>
        </header>
        <div className="days" role="group" aria-label="Repeat on days">
          {DAYS.map((name, i) => (
            <button
              type="button"
              key={name}
              disabled={!active || !enabled}
              aria-label={name}
              aria-pressed={days.includes(i)}
              onClick={() => toggle(i)}
            >
              <span>{name.slice(0, 3)}</span>
              <i aria-hidden>{days.includes(i) ? "✓" : "·"}</i>
            </button>
          ))}
        </div>
        <div className="frequency">
          <label>
            Every{" "}
            <select
              aria-label="Repeat interval in weeks"
              value={interval}
              disabled={!active || !enabled}
              onChange={(e) => setInterval(e.target.value)}
            >
              <option value="1">week</option>
              <option value="2">2 weeks</option>
              <option value="3">3 weeks</option>
            </select>
          </label>
          <span>{enabled ? `${days.length} ${days.length === 1 ? "day" : "days"} selected` : "Paused"}</span>
        </div>
        <div className="calendar" aria-hidden>
          <div className="dates">
            <span>Oct 12</span>
            <span>Nov 1</span>
          </div>
          <div className="occurrences">
            {Array.from({ length: 21 }, (_, i) => (
              <i
                key={i}
                data-on={enabled && Math.floor(i / 7) % Number(interval) === 0 && days.includes(i % 7)}
                data-week={i % 7 === 0}
              />
            ))}
          </div>
        </div>
        <p className="sr" role="status">
          {!enabled
            ? "Does not repeat"
            : days.length === 0
            ? "Choose at least one day"
            : `${days.map((i) => DAYS[i]).join(", ")} every ${interval} ${
                interval === "1" ? "week" : "weeks"
              }, beginning October 12, 2026.`}
        </p>
      </div>
      <style>{`
.sf-recurrence-picker{width:100%;height:100%;display:grid;place-items:center;background:#bfc4c5;color:#38403f;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}.sf-recurrence-picker *{box-sizing:border-box}.sf-recurrence-picker button,.sf-recurrence-picker select{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation}.sf-recurrence-picker button:disabled,.sf-recurrence-picker select:disabled{cursor:default}.sf-recurrence-picker :focus-visible{outline:2px solid #ca6234;outline-offset:4px}.sf-recurrence-picker .schedule{width:442px;padding:24px 23px 20px;background:linear-gradient(135deg,#fcfcf8,#e9ebe6);border-radius:18px;border:1px solid #b4bbb6;box-shadow:inset 0 1px 0 #fff,0 1px 1px #5a625546,0 8px 12px -5px #38423130,0 28px 32px -18px #3c44374a}.sf-recurrence-picker header{display:flex;justify-content:space-between;align-items:center;margin-bottom:19px}.sf-recurrence-picker header>div{display:flex;align-items:center;gap:9px}.sf-recurrence-picker header svg{width:17px;height:17px;fill:none;stroke:#727c75;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}.sf-recurrence-picker h2{margin:0;font-size:16px;font-weight:500;letter-spacing:-.4px}.sf-recurrence-picker .toggle{position:relative;width:44px;height:30px;border:1px solid #b9c0b9;border-radius:20px;background:#c3cbc1;box-shadow:inset 0 2px 4px #26331c28;padding:3px;transition:background 160ms}.sf-recurrence-picker .toggle:after{content:"";position:absolute;inset:-7px -2px}.sf-recurrence-picker .toggle span{display:block;width:22px;height:22px;border-radius:50%;background:linear-gradient(#fff,#e7e9e2);box-shadow:0 1px 2px #172d1e5c,inset 0 0 0 1px #fff;transition:transform 180ms cubic-bezier(.22,1,.36,1)}.sf-recurrence-picker .toggle[aria-checked=true]{background:#587064;border-color:#58695c}.sf-recurrence-picker .toggle[aria-checked=true] span{transform:translateX(14px)}.sf-recurrence-picker .days{display:flex;gap:5px;padding:6px;background:#cfd4ce;border-radius:12px;border:1px solid #c5cbc3;box-shadow:inset 0 1px 3px #34412b24,0 1px 0 #fff}.sf-recurrence-picker .days button{flex:1;min-width:0;height:61px;padding:9px 0 6px;display:flex;align-items:center;justify-content:space-between;flex-direction:column;border-radius:7px;border:1px solid #b8c0b4;color:#6c7568;background:linear-gradient(#f9faf5,#e9ece4);box-shadow:0 2px 0 #a8b19f,0 3px 4px #39463027,inset 0 1px 0 #fff;transition:transform 160ms cubic-bezier(.22,1,.36,1),background-color 160ms,color 160ms,box-shadow 160ms}.sf-recurrence-picker .days span{font-size:10px;font-weight:500}.sf-recurrence-picker .days i{font-size:14px;font-style:normal;color:#a1aaa0;line-height:16px}.sf-recurrence-picker .days button[aria-pressed=true]{background:linear-gradient(#d77044,#c96135);border-color:#b3532c;color:#fff5eb;box-shadow:0 1px 0 #884824,inset 0 1px 0 #efae8659,inset 0 -1px 3px #7b341218;transform:translateY(1px)}.sf-recurrence-picker .days button[aria-pressed=true] i{color:#ffdec8}.sf-recurrence-picker .days button:active:not(:disabled){transform:translateY(3px);box-shadow:inset 0 2px 4px #68301235}.sf-recurrence-picker .days button:disabled{opacity:.45}.sf-recurrence-picker .frequency{margin-top:16px;display:flex;justify-content:space-between;align-items:center;color:#778073;font-size:10px}.sf-recurrence-picker .frequency label{display:flex;align-items:center;gap:4px}.sf-recurrence-picker select{height:32px;background:transparent;border:0;font-size:11px;font-weight:500;color:#445441;padding:0 4px}.sf-recurrence-picker .calendar{border-top:1px solid #d1d7cb;margin-top:12px;padding-top:13px}.sf-recurrence-picker .dates{display:flex;justify-content:space-between;font-size:9px;color:#8e9788;margin-bottom:8px}.sf-recurrence-picker .occurrences{height:16px;display:flex;gap:4px}.sf-recurrence-picker .occurrences i{flex:1;border-radius:3px;background:#dce0d6;box-shadow:inset 0 1px 1px #72816416;transition:background 150ms,box-shadow 150ms}.sf-recurrence-picker .occurrences i[data-week=true]:not(:first-child){margin-left:5px}.sf-recurrence-picker .occurrences i[data-on=true]{background:#c77650;box-shadow:inset 0 1px 0 #db9a78}.sf-recurrence-picker .sr{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}.sf-recurrence-picker[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-recurrence-picker *{transition:none!important}}`}</style>
    </section>
  )
}
