/**
 * MIT License
 *
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

import { useEffect, useId, useRef, useState } from "react"

export default function IntervalClock({ active = true }: { active?: boolean }) {
  const [duration, setDuration] = useState(5)
  const [remaining, setRemaining] = useState(300)
  const [running, setRunning] = useState(false)
  const remainingRef = useRef(300)
  const id = useId().replace(/:/g, "")
  useEffect(() => {
    if (!active || !running) {
      return
    }
    let previous = performance.now()
    const tick = () => {
      const now = performance.now()
      remainingRef.current = Math.max(0, remainingRef.current - (now - previous) / 1000)
      previous = now
      setRemaining(Math.ceil(remainingRef.current))
      if (remainingRef.current === 0) {
        setRunning(false)
      }
    }
    const timer = setInterval(tick, 100)
    return () => clearInterval(timer)
  }, [active, running])
  const reset = (minutes = duration) => {
    setDuration(minutes)
    setRunning(false)
    remainingRef.current = minutes * 60
    setRemaining(minutes * 60)
  }
  const progress = remaining / (duration * 60)
  return (
    <section className="sf-interval-clock">
      <div className="sf-ic-instrument" data-running={running && active}>
        <div className="sf-ic-face">
          <svg viewBox="0 0 256 256" aria-hidden="true">
            <defs>
              <radialGradient id={id + "face"} cx="40%" cy="25%">
                <stop stopColor="#fcfcf8" />
                <stop offset="1" stopColor="#dcddd6" />
              </radialGradient>
              <linearGradient id={id + "bezel"} x2=".7" y2="1">
                <stop stopColor="#ffffff" />
                <stop offset=".42" stopColor="#a7ada7" />
                <stop offset=".6" stopColor="#f6f7ef" />
                <stop offset="1" stopColor="#808b84" />
              </linearGradient>
            </defs>
            <circle cx="128" cy="128" r="126" fill={"url(#" + id + "bezel)"} />
            <circle cx="128" cy="128" r="119" fill={"url(#" + id + "face)"} stroke="#a6ada6" />
            {Array.from({ length: 60 }, (_, i) => (
              <line
                key={i}
                x1="128"
                y1={i % 5 === 0 ? "30" : "24"}
                x2="128"
                y2="18"
                stroke={i % 5 === 0 ? "#263c34" : "#8c9890"}
                strokeWidth={i % 5 === 0 ? "2" : "1"}
                transform={`rotate(${i * 6} 128 128)`}
              />
            ))}
            <circle cx="128" cy="128" r="87" fill="none" stroke="#c9cfc6" strokeWidth="7" />
            <circle
              className="sf-ic-progress"
              cx="128"
              cy="128"
              r="87"
              fill="none"
              stroke="#df6435"
              strokeWidth="7"
              pathLength="1"
              strokeDasharray={`${progress} 1`}
              transform="rotate(-90 128 128)"
            />
            <circle
              cx={128 + 87 * Math.sin(progress * Math.PI * 2)}
              cy={128 - 87 * Math.cos(progress * Math.PI * 2)}
              r="5"
              fill="#8d351e"
              stroke="#e9875e"
              strokeWidth="1"
            />
          </svg>
          <div className="sf-ic-display">
            <span className="sf-ic-lamp" />
            <output aria-label="Time remaining" aria-live="off">
              {String(Math.floor(remaining / 60)).padStart(2, "0")}
              <b>:</b>
              {String(remaining % 60).padStart(2, "0")}
            </output>
            <span className="sf-ic-state" aria-live="polite">
              {remaining ? (running ? "Counting down" : "Interval") : "Complete"}
            </span>
          </div>
        </div>
        <div className="sf-ic-controls">
          <div className="sf-ic-presets" aria-label="Interval duration">
            {[1, 5, 10].map((n) => (
              <button disabled={!active} type="button" key={n} onClick={() => reset(n)} aria-pressed={duration === n}>
                {n}
                <span>min</span>
              </button>
            ))}
          </div>
          <div className="sf-ic-actions">
            <button
              disabled={!active}
              type="button"
              className="sf-ic-start"
              aria-pressed={running}
              onClick={() => {
                if (!remaining) {
                  remainingRef.current = duration * 60
                  setRemaining(duration * 60)
                }
                setRunning((v) => !v)
              }}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                {running ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="m5 3 8 5-8 5z" />}
              </svg>
              {running ? "Pause" : remaining ? "Start" : "Restart"}
            </button>
            <button
              disabled={!active}
              type="button"
              className="sf-ic-reset"
              aria-label="Reset interval"
              onClick={() => reset()}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" fill="none">
                <path d="M4 8a6 6 0 1 1 0 5M4 3v5h5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <style>{`.sf-interval-clock{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:#d7ded6;color:#263c34;font:12px Arial,sans-serif}.sf-interval-clock *{box-sizing:border-box}.sf-ic-instrument{display:flex;align-items:center;gap:30px;padding:24px 29px 24px 22px;border-radius:40px;background:linear-gradient(125deg,#f0f1e9,#dce0d5 60%,#c7cfc2);border:1px solid #eff2e7;box-shadow:0 2px 1px #7c8b7755,0 13px 20px #4b615122,inset 0 1px 0 #fff8}.sf-ic-face{position:relative;width:252px;height:252px;border-radius:50%;box-shadow:0 3px 4px #63745c55}.sf-ic-face>svg{display:block;width:100%;height:100%}.sf-ic-display{position:absolute;inset:69px 35px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px}.sf-ic-display output{font:400 43px/1 Arial,sans-serif;letter-spacing:-2px;font-variant-numeric:tabular-nums;text-shadow:0 1px 0 #fff}.sf-ic-display b{font-weight:400;color:#91a093;padding:0 1px}.sf-ic-lamp{width:6px;height:6px;border-radius:50%;background:#a6b19f;box-shadow:inset 0 1px 1px #24382644,0 1px 0 #fff}.sf-ic-instrument[data-running=true] .sf-ic-lamp{background:#de6436;box-shadow:0 0 6px #df6b4666,inset 0 1px 1px #ffb094}.sf-ic-state{font-size:10px;color:#728171}.sf-ic-controls{width:140px;display:flex;flex-direction:column;gap:39px}.sf-interval-clock button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation;border:0}.sf-ic-presets{display:flex;padding:4px;border-radius:12px;box-shadow:inset 0 2px 4px #6e7b6b30,0 1px 0 #fff9;background:#cbd2c5}.sf-ic-presets button{min-width:44px;height:55px;background:none;border-radius:9px;font-size:18px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px}.sf-ic-presets button span{font-size:9px;color:#758272}.sf-ic-presets button[aria-pressed=true]{background:linear-gradient(#f9faf4,#e1e7d9);box-shadow:0 2px 3px #64725944,inset 0 1px 0 white}.sf-ic-actions{display:flex;gap:9px}.sf-ic-start{height:52px;display:flex;flex:1;align-items:center;justify-content:center;gap:6px;border-radius:12px;background:linear-gradient(#e48152,#d85b2d);box-shadow:0 3px 0 #a84626,0 5px 7px #84633e30,inset 0 1px 0 #ffbc8a;color:#fff5e8!important;transition:transform 100ms,box-shadow 100ms}.sf-ic-start svg{width:14px;height:14px;fill:currentColor}.sf-ic-start:active,.sf-ic-start[aria-pressed=true]{transform:translateY(2px);box-shadow:0 1px 0 #a84626,inset 0 1px 3px #b44727}.sf-ic-reset{height:52px;width:44px;border-radius:12px;background:linear-gradient(#eaf0df,#d0d9c8);box-shadow:0 2px 0 #acbba2,inset 0 1px 0 #fff9}.sf-ic-reset:active{transform:translateY(1px)}.sf-ic-reset svg{width:20px;height:20px}.sf-interval-clock button:focus-visible{outline:2px solid #315e4b;outline-offset:4px}.sf-interval-clock button:disabled{cursor:default;opacity:.6}@media(prefers-reduced-motion:reduce){.sf-interval-clock *{transition:none!important}}`}</style>
    </section>
  )
}
