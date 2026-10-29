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
    [selected, setSelected] = React.useState(0)
  const people = [
    { name: "Nadia", role: "Editing", color: "#dfbeb8" },
    { name: "Owen", role: "Viewing", color: "#bacbb7" },
    { name: "Elena", role: "Viewing", color: "#c1bfdf" },
    { name: "Theo", role: "Away", color: "#d9cbaa" },
  ]

  return (
    <div
      className="sf-presence-pile"
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
      <div className="presence">
        <div className="people" data-open={open}>
          {people.map((p, i) => (
            <button
              key={p.name}
              aria-label={p.name + ", " + p.role}
              aria-pressed={selected === i}
              style={{ background: p.color, transform: `translateX(${open ? i * 10 : 0}px)`, zIndex: 5 - i }}
              onClick={() => {
                setSelected(i)
                setOpen(true)
              }}
            >
              <span className="face" aria-hidden>
                <i />
                <b />
              </span>
              <span className="online" data-away={i === 3} />
            </button>
          ))}
          <button
            className="more"
            aria-label={open ? "Collapse collaborators" : "Expand collaborators"}
            aria-expanded={open}
            style={{ transform: `translateX(${open ? 40 : 0}px)` }}
            onClick={() => setOpen(!open)}
          >
            {open ? "−" : "＋"}
          </button>
        </div>
        <div className="person" data-open={open}>
          <span className="dot" style={{ background: people[selected].color }} />
          <strong>{people[selected].name}</strong>
          <span>{people[selected].role}</span>
        </div>
      </div>
      <style>{`
.sf-presence-pile {
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
.sf-presence-pile * {
  box-sizing: border-box;
}
.sf-presence-pile button,
.sf-presence-pile input,
.sf-presence-pile textarea,
.sf-presence-pile select {
  font: inherit;
  color: inherit;
}
.sf-presence-pile button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-presence-pile button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-presence-pile button:focus-visible,
.sf-presence-pile input:focus-visible,
.sf-presence-pile textarea:focus-visible,
.sf-presence-pile [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-presence-pile button {
  border: 0;
  background: transparent;
}
.sf-presence-pile .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-presence-pile .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-presence-pile svg {
  display: block;
}
.sf-presence-pile[data-keyboard="true"] *,
.sf-presence-pile[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-presence-pile *,
  .sf-presence-pile *::before,
  .sf-presence-pile *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-presence-pile {
  background: #eceef1;
}
.sf-presence-pile .presence {
  position: relative;
  height: 138px;
  padding-top: 25px;
  width: 268px;
  max-width: 100%;
}
.sf-presence-pile .people {
  display: flex;
  align-items: center;
  padding-left: 22px;
}
.sf-presence-pile .people button {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 3px solid #eceef1;
  margin-left: -12px;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 180ms;
  box-shadow: inset 0 -6px 12px #51433110;
}
.sf-presence-pile .face {
  position: absolute;
  inset: 9px 7px 0;
  border-radius: 40% 40% 50% 50%;
  background: #fff8;
}
.sf-presence-pile .face i {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 10px;
  height: 2px;
  border-left: 2px solid #655e61;
  border-right: 2px solid #655e61;
}
.sf-presence-pile .face b {
  position: absolute;
  bottom: 6px;
  left: 10px;
  width: 7px;
  height: 3px;
  border-bottom: 1px solid #8e7d79;
  border-radius: 50%;
}
.sf-presence-pile .online {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #70a179;
  bottom: -1px;
  right: -1px;
  border: 2px solid #eceef1;
}
.sf-presence-pile .online[data-away="true"] {
  background: #b5bac2;
}
.sf-presence-pile .people .more {
  background: #fafbfd;
  border: 1px solid #dce1e8;
  margin-left: 1px;
  width: 40px;
  height: 40px;
  color: #666e79;
  font-size: 21px;
}
.sf-presence-pile .person {
  position: absolute;
  bottom: 0;
  left: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 13px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #dce2e9;
  box-shadow: 0 5px 15px #34445b10;
  opacity: 0;
  transform: translateY(-5px);
  transition: transform 180ms, opacity 180ms;
  font-size: 11px;
}
.sf-presence-pile .person[data-open="true"] {
  opacity: 1;
  transform: none;
}
.sf-presence-pile .person > span:last-child {
  color: #69717b;
  margin-left: 14px;
}
.sf-presence-pile .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.sf-presence-pile {
  background: #f4f3f0;
}
.sf-presence-pile .people button {
  border-color: #f4f3f0;
  box-shadow: inset 0 -9px 15px #51433114, 0 3px 6px #5143310d;
}
.sf-presence-pile .online {
  border-color: #f4f3f0;
}
.sf-presence-pile .person {
  border-color: #dcd8d1;
  background: #fffdfa;
}
`}</style>
    </div>
  )
}
