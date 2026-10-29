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

import { useEffect, useId, useState } from "react"

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

export default function SpecimenDepth({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [point, setPoint] = useState({ x: 0.22, y: -0.12 })
  const [depth, setDepth] = useState(55)
  const id = useId().replace(/:/g, "")
  return (
    <section
      className="sf-specimen-depth"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduced || !active) {
          return
        }
        const r = e.currentTarget.getBoundingClientRect()
        setPoint({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
      }}
      onPointerLeave={() => setPoint({ x: 0.22, y: -0.12 })}
    >
      <div className="case">
        <div className="shadow" />
        <svg viewBox="0 0 340 270" aria-label="Layered fern specimen" role="img">
          <defs>
            <linearGradient id={id}>
              <stop stopColor="#36584b" />
              <stop offset=".55" stopColor="#849777" />
              <stop offset="1" stopColor="#213e37" />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((i) => (
            <g
              key={i}
              style={{
                transform: `translate(${(point.x * depth * (i + 1)) / 3}px,${
                  (point.y * depth * (i + 1)) / 3
                }px) rotate(${i * 24 - 24}deg)`,
                transformOrigin: "170px 235px",
              }}
              opacity={0.4 + i * 0.3}
            >
              <path d="M170 244Q140 150 181 32" fill="none" stroke="#314a39" strokeWidth="2" />
              {Array.from({ length: 8 }, (_, j) => (
                <g key={j} transform={`translate(${164 - j * 1.1} ${214 - j * 21}) rotate(${-j * 3})`}>
                  <path d="M0 0Q-70 -6 -58 -37Q-13 -34 0 0Z" fill={`url(#${id})`} />
                  <path d="M0 0Q66 -14 56 -43Q15 -33 0 0Z" fill={`url(#${id})`} />
                </g>
              ))}
            </g>
          ))}
        </svg>
        <div className="glass" />
      </div>
      <label className="depth">
        Depth
        <input
          aria-label="Parallax depth"
          type="range"
          min="0"
          max="80"
          value={depth}
          onChange={(e) => {
            setDepth(+e.target.value)
            if (point.x === 0 && point.y === 0) {
              setPoint({ x: 0.22, y: -0.12 })
            }
          }}
        />
      </label>
      <style>{`.sf-specimen-depth{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#b9c5ba;box-sizing:border-box}.sf-specimen-depth *{box-sizing:border-box}.sf-specimen-depth button,.sf-specimen-depth input{font:inherit}.sf-specimen-depth button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-specimen-depth button:focus-visible,.sf-specimen-depth input:focus-visible,.sf-specimen-depth [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-specimen-depth[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-specimen-depth *{transition:none!important;animation:none!important}}.sf-specimen-depth .case{position:absolute;inset:20px 13% 62px;background:linear-gradient(145deg,#e0e5cf,#a8b79f);border:9px solid #456356;box-shadow:0 3px 0 #263f36,12px 18px 25px #28403440;overflow:hidden}.sf-specimen-depth .case svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(9px 11px 3px #20362b35)}.sf-specimen-depth .case g{transition:transform .3s ease-out}.sf-specimen-depth .glass{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 35%,#ffffff1c 36%,#ffffff38 38%,transparent 40%,transparent 65%,#ffffff12 66%);box-shadow:inset 0 0 15px #132d2c55}.sf-specimen-depth .depth{position:absolute;bottom:15px;left:20%;right:20%;display:flex;align-items:center;gap:18px;font:11px Arial;color:#30483d;height:32px}.sf-specimen-depth .depth input{width:100%;accent-color:#335c4b}`}</style>
    </section>
  )
}
