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

export default function MosaicReveal({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [alternate, setAlternate] = useState(false)
  const [run, setRun] = useState(0)
  return (
    <section
      className="sf-mosaic-reveal"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <button
        type="button"
        className="art"
        aria-label="Change the print"
        onClick={() => {
          setAlternate(!alternate)
          setRun(run + 1)
        }}
      >
        <div className="relief" data-alternate={alternate}>
          <svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="600" height="360" fill={alternate ? "#213caf" : "#f25530"} />
            <g transform={alternate ? "translate(600 360) rotate(180)" : undefined}>
              {Array.from({ length: 11 }, (_, i) => (
                <path
                  key={i}
                  d={`M${70 + i * 32} -30V${100 + i * 9}Q${70 + i * 32} ${160 + i * 9} ${130 + i * 32} ${
                    160 + i * 9
                  }H650`}
                  fill="none"
                  stroke={alternate ? "#f4b640" : "#25252c"}
                  strokeWidth="15"
                />
              ))}
              <circle cx="151" cy="253" r="50" fill={alternate ? "#f3ede0" : "#ffdb74"} />
              <path d="M107 253H196M151 209V298" stroke={alternate ? "#213caf" : "#f25530"} strokeWidth="3" />
            </g>
          </svg>
        </div>
        {run > 0 && (
          <div className="tiles" key={run} aria-hidden="true">
            {Array.from({ length: 80 }, (_, i) => (
              <i key={i} style={{ animationDelay: `${((i * 37) % 80) * 3}ms` }} />
            ))}
          </div>
        )}
        <span className="next">↻</span>
      </button>
      <style>{`.sf-mosaic-reveal{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#202523;box-sizing:border-box}.sf-mosaic-reveal *{box-sizing:border-box}.sf-mosaic-reveal button,.sf-mosaic-reveal input{font:inherit}.sf-mosaic-reveal button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-mosaic-reveal button:focus-visible,.sf-mosaic-reveal input:focus-visible,.sf-mosaic-reveal [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-mosaic-reveal[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-mosaic-reveal *{transition:none!important;animation:none!important}}.sf-mosaic-reveal .art{display:block;width:100%;height:100%;border:0;background:none;padding:0;position:relative;overflow:hidden}.sf-mosaic-reveal .relief{position:absolute;inset:0}.sf-mosaic-reveal .relief svg{display:block;width:100%;height:100%}.sf-mosaic-reveal .tiles{position:absolute;inset:0;display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(8,1fr);pointer-events:none}.sf-mosaic-reveal .tiles i{background:#efecdf;animation:sf-mosaic-tile .24s steps(1,end) both}.sf-mosaic-reveal .next{position:absolute;right:18px;bottom:18px;background:#ffffffdb;color:#222;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:23px}@keyframes sf-mosaic-tile{0%{opacity:1}35%,100%{opacity:0}}.sf-mosaic-reveal[data-still=true] .tiles{display:none}`}</style>
    </section>
  )
}
