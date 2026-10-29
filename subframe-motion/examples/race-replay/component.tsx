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

import { useCallback, useEffect, useRef, useState } from "react"

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

const circuit =
  "M139 158 C88 150 76 111 112 82 L216 51 Q244 45 263 65 L309 109 Q325 122 347 113 L401 88 Q428 78 443 101 L466 133 Q480 157 457 177 L398 224 Q379 237 355 224 L314 201 Q291 188 269 209 L245 232 Q223 250 200 228 L177 203 Q172 190 185 177 L224 143 Q238 129 222 120 L190 105 Q175 99 159 111 L139 128 Q129 137 139 158 Z"

export default function RaceReplay({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const path = useRef<SVGPathElement>(null)
  const marker = useRef<SVGGElement>(null)
  const timer = useRef<HTMLOutputElement>(null)
  const slider = useRef<HTMLInputElement>(null)
  const fraction = useRef(0.64)
  const pathLength = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [complete, setComplete] = useState(false)
  const [visible, setVisible] = useState(true)

  const paint = useCallback((value: number) => {
    fraction.current = value
    if (path.current && marker.current) {
      if (!pathLength.current) {
        pathLength.current = path.current.getTotalLength()
      }
      const point = path.current.getPointAtLength(pathLength.current * value)
      path.current.style.strokeDashoffset = String(1 - value)
      marker.current.setAttribute("transform", `translate(${point.x} ${point.y})`)
    }
    if (timer.current) {
      timer.current.value = `00:${(value * 48.72).toFixed(2).padStart(5, "0")}`
    }
    if (slider.current) {
      slider.current.value = String(Math.round(value * 100))
    }
  }, [])

  useEffect(() => {
    paint(fraction.current)
  }, [paint])
  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  useEffect(() => {
    if (reduced) {
      setPlaying(false)
    }
  }, [reduced])
  useEffect(() => {
    if (!playing || !active || reduced || !visible) {
      return
    }
    let request = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const next = Math.min(1, fraction.current + Math.min(now - previous, 64) / 4600)
      previous = now
      paint(next)
      if (next < 1) {
        request = requestAnimationFrame(tick)
      } else {
        setPlaying(false)
        setComplete(true)
      }
    }
    request = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(request)
  }, [playing, active, reduced, visible, paint])

  return (
    <section className="sf-race">
      <header className="sf-race-header">
        <h3>
          FULL
          <br />
          <em>SEND.</em>
        </h3>
        <div>
          GRAVEL CIRCUIT<small>ONE LAP. NOTHING LEFT.</small>
        </div>
      </header>
      <svg
        className="sf-race-map"
        viewBox="0 0 560 290"
        aria-label="A closed racing circuit with a marker showing lap progress"
        role="img"
      >
        <path d={circuit} fill="none" stroke="#414541" strokeWidth="14" strokeLinejoin="round" />
        <path d={circuit} fill="none" stroke="#181d18" strokeWidth="10" />
        <path
          ref={path}
          d={circuit}
          pathLength="1"
          fill="none"
          stroke="#e5fb35"
          strokeWidth="4"
          strokeDasharray="1"
          strokeDashoffset=".36"
          strokeLinecap="round"
        />
        <path d="m128 147 22 3m-21 5 21 3m-19 6 17 3" stroke="#f3f6db" strokeWidth="2" />
        <g ref={marker}>
          <circle r="11" fill="#e5fb35" opacity=".2" />
          <circle r="5" fill="#e5fb35" stroke="#10150c" strokeWidth="2" />
        </g>
        <text
          x="318"
          y="153"
          fill="#e5fb35"
          fontFamily="Arial,sans-serif"
          fontSize="26"
          fontWeight="800"
          fontStyle="italic"
        >
          03
        </text>
        <text x="318" y="168" fill="#aab19f" fontFamily="ui-monospace,monospace" fontSize="7" letterSpacing="1">
          THE SWITCHBACK
        </text>
      </svg>
      <div className="sf-race-controls">
        <output ref={timer} className="sf-race-timer" aria-live="off">
          00:31.18
        </output>
        <input
          ref={slider}
          type="range"
          min="0"
          max="100"
          defaultValue="64"
          aria-label="Lap progress"
          onChange={(event) => {
            setPlaying(false)
            setComplete(false)
            paint(Number(event.target.value) / 100)
          }}
        />
        <button
          type="button"
          onClick={(event) => {
            if (playing) {
              setPlaying(false)
              return
            }
            setComplete(false)
            if (reduced || !active || event.detail === 0) {
              paint(1)
              setComplete(true)
              return
            }
            paint(0)
            setPlaying(true)
          }}
        >
          {playing ? "PAUSE" : "REPLAY"}
          <span aria-hidden="true">{playing ? "Ⅱ" : "↗"}</span>
        </button>
      </div>
      <span className="sf-race-announcement" role="status">
        {complete ? "Lap complete. 48.72 seconds." : ""}
      </span>
      <style>{`
        .sf-race{width:100%;height:100%;min-height:300px;position:relative;overflow:hidden;background:#161b16;color:#e5fb35;padding:23px 24px 18px;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column;container-type:inline-size}.sf-race *{box-sizing:border-box}.sf-race-header{display:flex;justify-content:space-between;gap:18px;position:relative;z-index:1;pointer-events:none}.sf-race-header h3{font-size:43px;font-weight:900;letter-spacing:-.075em;line-height:.82;margin:0}.sf-race-header h3 em{font-style:italic}.sf-race-header>div{text-align:right;font-size:10px;font-weight:700;padding-top:2px;letter-spacing:.04em}.sf-race-header small{display:block;color:#bbc4b2;font:8px/1.3 ui-monospace,monospace;margin-top:5px;letter-spacing:.01em}
        .sf-race-map{position:absolute;width:100%;height:calc(100% - 58px);left:0;top:17px;display:block}.sf-race-controls{margin-top:auto;display:flex;align-items:center;gap:16px;position:relative;z-index:1;border-top:1px solid #414b3b;padding-top:13px}.sf-race-timer{font:19px/1 ui-monospace,SFMono-Regular,monospace;letter-spacing:-.06em;font-variant-numeric:tabular-nums;min-width:92px}.sf-race input{accent-color:#e5fb35;min-width:40px;width:100%;height:40px;cursor:pointer;background:transparent}.sf-race button{display:flex;align-items:center;gap:18px;min-height:42px;color:#161b16;background:#e5fb35;border:0;padding:0 12px;font:10px ui-monospace,monospace;cursor:pointer}.sf-race button span{font-size:20px}.sf-race button:focus-visible,.sf-race input:focus-visible{outline:2px solid #f9ffe3;outline-offset:4px}.sf-race button:active{opacity:.7}.sf-race-announcement{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
        @container(max-width:350px){.sf-race-header h3{font-size:36px}.sf-race-header>div{font-size:8px}.sf-race-header small{font-size:7px}.sf-race-controls{gap:9px}.sf-race button{gap:9px;padding-inline:9px}.sf-race-timer{font-size:16px;min-width:78px}.sf-race-map{top:30px}}
      `}</style>
    </section>
  )
}
