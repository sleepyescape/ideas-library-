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

const SCENES = ["Citrus", "Vinyl", "Spokes"] as const
export default function MatchCut({ active = true }: { active?: boolean }) {
  const id = useId()
  const [scene, setScene] = useState(0),
    [busy, setBusy] = useState(false),
    [reduced, setReduced] = useState(true)
  const target = useRef(0),
    frame = useRef(0),
    disc = useRef<HTMLDivElement>(null)
  const pending = useRef(false)
  const settle = useRef<() => void>(() => {})
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(m.matches)
    update()
    m.addEventListener("change", update)
    return () => m.removeEventListener("change", update)
  }, [])
  settle.current = () => {
    cancelAnimationFrame(frame.current)
    frame.current = 0
    pending.current = false
    setScene(target.current)
    setBusy(false)
    if (disc.current) {
      disc.current.style.transform = "rotate(0deg)"
      disc.current.style.filter = "none"
    }
  }
  useEffect(() => {
    if (!active || reduced) {
      settle.current()
    }
  }, [active, reduced])
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  function next(instant = false) {
    if (instant) {
      target.current = (target.current + 1) % SCENES.length
      settle.current()
      return
    }
    if (frame.current) {
      pending.current = true
      return
    }
    target.current = (target.current + 1) % SCENES.length
    if (!active || reduced || instant) {
      settle.current()
      return
    }
    setBusy(true)
    let start = 0,
      cut = false
    const tick = (now: number) => {
      if (!start) {
        start = now
      }
      const t = Math.min(1, (now - start) / 680)
      // Shared position, outline and angular velocity survive the cut at peak speed.
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      if (disc.current) {
        disc.current.style.transform = `rotate(${eased * 360}deg)`
        disc.current.style.filter = `blur(${Math.pow(Math.sin(t * Math.PI), 6) * 1.25}px)`
      }
      if (t >= 0.5 && !cut) {
        cut = true
        setScene(target.current)
      }
      if (t < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        frame.current = 0
        setBusy(false)
        if (disc.current) {
          disc.current.style.filter = "none"
        }
        if (pending.current) {
          pending.current = false
          next()
        }
      }
    }
    frame.current = requestAnimationFrame(tick)
  }
  return (
    <section className="sf-match" data-scene={scene} aria-label="Shape and motion match cut">
      <div className="sf-match-disc" ref={disc} aria-hidden="true">
        <svg viewBox="0 0 240 240" width="240" height="240">
          <defs>
            <radialGradient id={`${id}-orange`}>
              <stop stopColor="#ffb620" />
              <stop offset=".75" stopColor="#f97814" />
              <stop offset="1" stopColor="#e65b0e" />
            </radialGradient>
            <linearGradient id={`${id}-vinyl`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#131719" />
              <stop offset=".45" stopColor="#343b3c" />
              <stop offset=".65" stopColor="#121718" />
              <stop offset="1" stopColor="#333839" />
            </linearGradient>
          </defs>
          {scene === 0 ? (
            <g>
              <circle cx="120" cy="120" r="112" fill="#df5410" />
              <circle cx="120" cy="120" r="108" fill="#ffe0a1" />
              <circle cx="120" cy="120" r="100" fill={`url(#${id}-orange)`} />
              {Array.from({ length: 12 }, (_, i) => (
                <g key={i} transform={`rotate(${i * 30} 120 120)`}>
                  <path
                    d="M120 120L122 20Q145 19 168 33Z"
                    fill={i % 3 === 0 ? "#fd9b13" : "#ffb333"}
                    fillOpacity=".6"
                  />
                  <path d="M120 120L120 21" stroke="#ffdaa0" strokeWidth="2.7" />
                  {Array.from({ length: 5 }, (_, j) => (
                    <path
                      key={j}
                      d={`M${124 + j * 4} ${92 - j * 12} l${3 + j} -11`}
                      stroke="#ffc760"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity=".8"
                    />
                  ))}
                </g>
              ))}
              <circle cx="120" cy="120" r="8" fill="#ffe4ae" />
            </g>
          ) : scene === 1 ? (
            <g>
              <circle cx="120" cy="120" r="112" fill={`url(#${id}-vinyl)`} />
              {Array.from({ length: 22 }, (_, i) => (
                <circle
                  key={i}
                  cx="120"
                  cy="120"
                  r={48 + i * 2.6}
                  fill="none"
                  stroke={i % 3 ? "#8a8e8a" : "#010808"}
                  strokeWidth=".55"
                  opacity=".36"
                />
              ))}
              <path d="M120 120L31 53A112 112 0 0 1 157 14Z" fill="#dce4d4" opacity=".055" />
              <circle cx="120" cy="120" r="43" fill="#ed512e" />
              <path d="M79 108A43 43 0 0 1 161 108Z" fill="#f3c689" />
              <circle cx="120" cy="120" r="6" fill="#dbd4b8" />
              <circle cx="120" cy="120" r="2" fill="#161b1c" />
            </g>
          ) : (
            <g>
              <circle cx="120" cy="120" r="107" fill="#1c2a30" />
              <circle cx="120" cy="120" r="97" fill="#e8f0e9" />
              <circle cx="120" cy="120" r="91" fill="#294dca" />
              {Array.from({ length: 24 }, (_, i) => (
                <path
                  key={i}
                  d="M116 117L120 29"
                  transform={`rotate(${i * 15} 120 120)`}
                  stroke={i % 2 ? "#b7c7d9" : "#fff9db"}
                  strokeWidth={i % 2 ? 1 : 1.5}
                />
              ))}
              <circle cx="120" cy="120" r="12" fill="#f2eee2" />
              <circle cx="120" cy="120" r="5" fill="#263750" />
              <circle cx="120" cy="120" r="109" fill="none" stroke="#535e61" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>
      <footer>
        <span aria-live="polite">{SCENES[scene]}</span>
        <div className="sf-match-index" aria-hidden="true">
          {SCENES.map((_, i) => (
            <i key={i} data-current={i === scene} />
          ))}
        </div>
        <button
          type="button"
          onClick={(event) => next(event.detail === 0)}
          aria-label="Next match cut"
          aria-busy={busy}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M4 12H20M14 6L20 12L14 18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </footer>
      <style>{`.sf-match{width:100%;height:100%;min-height:300px;position:relative;display:grid;place-items:center;overflow:hidden;background:#f4eada;color:#29291f;font:14px/1 Arial,sans-serif}.sf-match[data-scene="1"]{background:#cec8aa}.sf-match[data-scene="2"]{background:#294dca;color:#f0f1dd}.sf-match-disc{width:240px;height:240px;margin-top:-26px;will-change:transform}.sf-match-disc svg{display:block;width:100%;height:100%}.sf-match footer{position:absolute;left:32px;right:26px;bottom:20px;display:flex;align-items:center;justify-content:space-between;height:44px}.sf-match footer>span{font-size:13px;letter-spacing:-.2px}.sf-match-index{position:absolute;left:50%;transform:translateX(-50%);display:flex;gap:7px}.sf-match-index i{width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.25}.sf-match-index i[data-current=true]{opacity:1}.sf-match button{width:44px;height:44px;border:1px solid currentColor;border-radius:50%;background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;touch-action:manipulation}.sf-match button:active{transform:scale(.94)}.sf-match button:focus-visible{outline:2px solid currentColor;outline-offset:4px}@media(prefers-reduced-motion:reduce){.sf-match-disc{will-change:auto}}`}</style>
    </section>
  )
}
