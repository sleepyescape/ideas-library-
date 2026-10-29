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

import { useEffect, useId, useRef, useState } from "react"

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

function ripplePoint(x: number, y: number, time: number, amount: number) {
  return [
    x + Math.sin(y * 0.036 + time * 0.48) * Math.cos(x * 0.024 - time * 0.3) * amount * 0.3,
    y + Math.sin(x * 0.031 - time * 0.38) * Math.cos(y * 0.029 + time * 0.2) * amount * 0.3,
  ]
}

// Deform vector paths directly so enlarged grooves retain smooth edges.
function groovePath(radius: number, time: number, amount: number) {
  return (
    Array.from({ length: 161 }, (_, index) => {
      const angle = (index / 160) * Math.PI * 2
      const [x, y] = ripplePoint(150 + Math.cos(angle) * radius, 150 + Math.sin(angle) * radius, time, amount)
      return `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`
    }).join(" ") + "Z"
  )
}

export default function LiquidRecord({ active = true }: { active?: boolean }) {
  const artId = `sf-liquid-${useId().replace(/:/g, "")}`
  const groovesRef = useRef<SVGGElement>(null)
  const time = useRef(0)
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [ripple, setRipple] = useState(18)
  useEffect(() => {
    const grooves = groovesRef.current?.querySelectorAll<SVGPathElement>("[data-radius]")
    const paint = () =>
      grooves?.forEach((path) => {
        path.setAttribute("d", groovePath(Number(path.dataset.radius), time.current, ripple))
      })
    paint()
    if (!active || paused || reduced) {
      return
    }
    let raf = 0,
      last = 0
    const tick = (now: number) => {
      if (last) {
        time.current += Math.min((now - last) / 1000, 0.04)
      }
      last = now
      paint()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, paused, reduced, ripple])
  return (
    <section className="sf-liquid-record" data-running={active && !paused && !reduced}>
      <svg
        className="sf-liquid-object"
        viewBox="0 0 300 300"
        role="img"
        aria-label="Pink lacquer record with rippling grooves"
      >
        <defs>
          <linearGradient id={`${artId}-sheen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffc8eb" stopOpacity="0" />
            <stop offset=".24" stopColor="#ffc8eb" stopOpacity=".42" />
            <stop offset=".42" stopColor="#ffc8eb" stopOpacity="0" />
            <stop offset=".7" stopColor="#fbabda" stopOpacity=".3" />
            <stop offset="1" stopColor="#fbabda" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g ref={groovesRef}>
          <path
            data-radius="149"
            d={groovePath(149, time.current, ripple)}
            fill="#d2368e"
            stroke="#f875c0"
            strokeWidth="2"
          />
          <g>
            {Array.from({ length: 48 }, (_, index) => (
              <path
                key={index}
                data-radius={55 + index * 1.94}
                d={groovePath(55 + index * 1.94, time.current, ripple)}
                fill="none"
                stroke={index % 2 ? "#94184f" : "#ef61b5"}
                strokeWidth=".8"
              />
            ))}
            <path data-radius="52.5" d={groovePath(52.5, time.current, ripple)} fill="#ffcadd" />
            <g className="sf-liquid-grooves">
              <path d="M124 126H176M124 140H176" stroke="#730c48" strokeWidth="4" transform="rotate(-12 150 132)" />
              <circle cx="150" cy="150" r="4.5" fill="#350a29" stroke="#ffd7e8" strokeWidth="2" />
            </g>
          </g>
          <path data-radius="148" d={groovePath(148, time.current, ripple)} fill={`url(#${artId}-sheen)`} />
        </g>
      </svg>
      <div className="sf-liquid-title" aria-hidden="true">
        Slow
        <br />
        <i>signal.</i>
      </div>
      <div className="sf-liquid-controls">
        <button
          type="button"
          aria-label={paused ? "Play record motion" : "Pause record motion"}
          aria-pressed={paused}
          disabled={reduced}
          onClick={() => setPaused(!paused)}
        >
          {reduced ? "Still" : paused ? "Play" : "Pause"}
        </button>
        <label>
          Ripple
          <input
            aria-label="Record ripple"
            type="range"
            min="0"
            max="38"
            value={ripple}
            onChange={(e) => setRipple(Number(e.target.value))}
          />
        </label>
      </div>
      <style>{`.sf-liquid-record{position:relative;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;background:#350a29;color:#ffbee4;font-family:Arial,sans-serif;isolation:isolate}.sf-liquid-record *{box-sizing:border-box}.sf-liquid-title{position:absolute;left:7%;top:21%;font:clamp(40px,9cqw,63px)/.86 Georgia,serif;letter-spacing:-3px;z-index:2;pointer-events:none}.sf-liquid-title i{font-weight:400}.sf-liquid-object{position:absolute;right:5%;top:47%;width:clamp(228px,51cqw,300px);aspect-ratio:1;transform:translateY(-50%);overflow:visible;filter:drop-shadow(0 25px 17px #19051680)}.sf-liquid-grooves{transform-origin:150px 150px;animation:sf-liquid-spin 14s linear infinite;animation-play-state:paused}.sf-liquid-record[data-running=true] .sf-liquid-grooves{animation-play-state:running}.sf-liquid-controls{position:absolute;inset:auto 25px 8px;display:flex;justify-content:space-between;align-items:center;gap:20px;font:12px Arial}.sf-liquid-controls button{min-width:52px;min-height:44px;border:1px solid #ffbee440;border-radius:30px;background:transparent;color:inherit;font:inherit;cursor:pointer}.sf-liquid-controls label{display:flex;align-items:center;gap:12px}.sf-liquid-controls input{width:96px;min-height:44px;accent-color:#ffbee4}.sf-liquid-record :focus-visible{outline:2px solid #fff;outline-offset:3px}@container(max-width:400px){.sf-liquid-title{font-size:28px;left:18px;top:18px;letter-spacing:-1px}.sf-liquid-object{width:220px;right:5%;top:47%}.sf-liquid-controls{inset:auto 18px 6px}}@keyframes sf-liquid-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.sf-liquid-grooves{animation:none!important}}`}</style>
    </section>
  )
}
