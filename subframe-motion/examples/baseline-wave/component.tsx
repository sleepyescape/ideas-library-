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

import { useEffect, useState } from "react"

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

export default function BaselineWave({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [phase, setPhase] = useState(30)
  return (
    <section
      className="sf-baseline-wave"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="lines" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} />
        ))}
      </div>
      <div className="wave" aria-label="Sonic">
        {"SONIC".split("").map((letter, i) => (
          <span
            aria-hidden="true"
            key={i}
            style={{
              transform: `translateY(${Math.sin(i * 0.62 + phase / 12) * 32}px) rotate(${
                Math.cos(i * 0.62 + phase / 12) * 11
              }deg)`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      <label className="phase">
        Phase
        <input
          aria-label="Wave phase"
          type="range"
          min="0"
          max="100"
          value={phase}
          onChange={(e) => setPhase(+e.target.value)}
        />
      </label>
      <style>{`.sf-baseline-wave{position:relative;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#c8ef51;box-sizing:border-box}.sf-baseline-wave *{box-sizing:border-box}.sf-baseline-wave button,.sf-baseline-wave input{font:inherit}.sf-baseline-wave button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-baseline-wave button:focus-visible,.sf-baseline-wave input:focus-visible,.sf-baseline-wave [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-baseline-wave[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-baseline-wave *{transition:none!important;animation:none!important}}.sf-baseline-wave .wave{position:absolute;left:7%;right:7%;top:calc(50% - 60px);display:flex;justify-content:center;color:#24429a;line-height:1}.sf-baseline-wave .wave span{font:bold clamp(62px,17cqw,112px) Arial,sans-serif;letter-spacing:-7px;display:inline-block;transition:transform .12s ease-out;text-shadow:0 2px 0 #ffffff50}.sf-baseline-wave .lines{position:absolute;left:7%;right:7%;top:calc(50% - 60px);height:120px;display:flex;flex-direction:column;justify-content:space-between}.sf-baseline-wave .lines i{height:1px;background:#77989a55}.sf-baseline-wave .phase{position:absolute;bottom:24px;left:18%;right:18%;display:flex;align-items:center;gap:22px;font:10px monospace;color:#365d60}.sf-baseline-wave .phase input{min-width:0;width:100%;accent-color:#24429a}`}</style>
    </section>
  )
}
