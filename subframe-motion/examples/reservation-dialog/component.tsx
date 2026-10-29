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
    [guests, setGuests] = React.useState(2),
    [confirmed, setConfirmed] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      return
    }
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", close)
    return () => document.removeEventListener("keydown", close)
  }, [open])
  const trigger = React.useRef<HTMLButtonElement>(null)
  const popup = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    if (!open && popup.current?.contains(document.activeElement)) {
      trigger.current?.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <div
      className="sf-reservation-dialog"
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
      <div className="reservation" data-open={open}>
        <button ref={trigger} className="summary" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className="room-art" aria-hidden>
            <i />
            <b />
          </span>
          <span>
            <strong>Garden studio</strong>
            <small>Nov 12–14 · {guests} guests</small>
          </span>
          <span className="plus" style={{ transform: open ? "rotate(45deg)" : "none" }}>
            ＋
          </span>
        </button>
        <div ref={popup} className="booking-details" inert={!open} style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
          <div>
            <div className="guest-row">
              <span>Guests</span>
              <div>
                <button
                  aria-label="One fewer guest"
                  disabled={guests <= 1}
                  onClick={() => {
                    setGuests((g) => g - 1)
                    setConfirmed(false)
                  }}
                >
                  −
                </button>
                <output>{guests}</output>
                <button
                  aria-label="One more guest"
                  disabled={guests >= 4}
                  onClick={() => {
                    setGuests((g) => g + 1)
                    setConfirmed(false)
                  }}
                >
                  ＋
                </button>
              </div>
            </div>
            <div className="row between price">
              <span>2 nights</span>
              <strong>€360</strong>
            </div>
            <button className="reserve" onClick={() => setConfirmed(!confirmed)}>
              {confirmed ? "✓ Request prepared" : "Request to book"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
.sf-reservation-dialog {
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
.sf-reservation-dialog * {
  box-sizing: border-box;
}
.sf-reservation-dialog button,
.sf-reservation-dialog input,
.sf-reservation-dialog textarea,
.sf-reservation-dialog select {
  font: inherit;
  color: inherit;
}
.sf-reservation-dialog button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-reservation-dialog button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-reservation-dialog button:focus-visible,
.sf-reservation-dialog input:focus-visible,
.sf-reservation-dialog textarea:focus-visible,
.sf-reservation-dialog [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-reservation-dialog button {
  border: 0;
  background: transparent;
}
.sf-reservation-dialog .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-reservation-dialog .between {
  justify-content: space-between;
}
.sf-reservation-dialog .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-reservation-dialog svg {
  display: block;
}
.sf-reservation-dialog[data-keyboard="true"] *,
.sf-reservation-dialog[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-reservation-dialog *,
  .sf-reservation-dialog *::before,
  .sf-reservation-dialog *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-reservation-dialog {
  background: #e6e7e1;
}
.sf-reservation-dialog .reservation {
  width: min(100%, 350px);
  background: #fafbf7;
  border: 1px solid #d0d4c6;
  border-radius: 17px;
  box-shadow: 0 15px 40px #4551321a;
  overflow: hidden;
}
.sf-reservation-dialog .summary {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px;
  width: 100%;
  text-align: left;
}
.sf-reservation-dialog .room-art {
  width: 50px;
  height: 58px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #ddd9c5 65%, #c7c8b4 66%);
  border-radius: 7px;
  position: relative;
  overflow: hidden;
}
.sf-reservation-dialog .room-art i {
  position: absolute;
  width: 22px;
  height: 33px;
  left: 14px;
  top: 7px;
  border: 3px solid #829180;
  background: linear-gradient(135deg, #92ac96, #ccd5b5);
}
.sf-reservation-dialog .room-art b {
  position: absolute;
  width: 35px;
  height: 9px;
  background: #ece7d4;
  bottom: 7px;
  left: 3px;
  box-shadow: 2px 5px #a7ac97;
}
.sf-reservation-dialog .summary strong {
  display: block;
  font-size: 14px;
  font-weight: 500;
}
.sf-reservation-dialog small {
  display: block;
  font-size: 10px;
  color: #8a927f;
  margin-top: 5px;
}
.sf-reservation-dialog .plus {
  margin-left: auto;
  color: #929b85;
  font-size: 21px;
  transition: transform 240ms;
}
.sf-reservation-dialog .booking-details {
  display: grid;
  transition: grid-template-rows 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-reservation-dialog .booking-details > div {
  overflow: hidden;
  min-height: 0;
  padding: 0 17px;
}
.sf-reservation-dialog .guest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e4e7dc;
  padding: 10px 0;
  font-size: 12px;
}
.sf-reservation-dialog .guest-row > div {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sf-reservation-dialog .guest-row button {
  width: 30px;
  height: 30px;
  border: 1px solid #d6dccb;
  border-radius: 50%;
  font-size: 17px;
}
.sf-reservation-dialog .price {
  font-size: 12px;
  margin: 6px 0 17px;
}
.sf-reservation-dialog .price strong {
  font-size: 18px;
  font-weight: 500;
  color: #425b37;
}
.sf-reservation-dialog .reserve {
  background: #567244;
  color: #ffffff;
  border-radius: 9px;
  min-height: 42px;
  width: 100%;
  font-size: 12px;
  margin-bottom: 17px;
}
`}</style>
    </div>
  )
}
