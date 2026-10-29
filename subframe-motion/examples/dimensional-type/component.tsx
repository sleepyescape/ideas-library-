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

export default function DimensionalType({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [angle, setAngle] = useState(-24)
  return (
    <section
      className="sf-dimensional-type"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="object" style={{ transform: `rotateX(-14deg) rotateY(${angle}deg)` }} aria-label="OH">
        <span className="cast" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <b
              key={i}
              style={{ transform: `translateZ(${-i * 2}px)`, color: i === 0 ? "#ffd6ca" : `hsl(8 37% ${55 - i}%)` }}
            >
              OH
            </b>
          ))}
        </span>
      </div>
      <input
        aria-label="Wordmark rotation"
        className="turn"
        type="range"
        min="-48"
        max="48"
        value={angle}
        onChange={(e) => setAngle(+e.target.value)}
      />
      <style>{`.sf-dimensional-type{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#e4473c;box-sizing:border-box}.sf-dimensional-type *{box-sizing:border-box}.sf-dimensional-type button,.sf-dimensional-type input{font:inherit}.sf-dimensional-type button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-dimensional-type button:focus-visible,.sf-dimensional-type input:focus-visible,.sf-dimensional-type [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-dimensional-type[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-dimensional-type *{transition:none!important;animation:none!important}}.sf-dimensional-type {perspective:700px;background:radial-gradient(ellipse at 50% 35%,#ec5a3e,#c83332)}.sf-dimensional-type .object{position:absolute;left:50%;top:45%;width:0;height:0;transform-style:preserve-3d;transition:transform .2s ease-out}.sf-dimensional-type .cast{transform-style:preserve-3d;position:absolute;left:-133px;top:-82px;width:266px;height:164px}.sf-dimensional-type .cast b{position:absolute;inset:0;font:900 155px/.95 Georgia,serif;letter-spacing:-19px;backface-visibility:hidden;text-shadow:1px 0 0 #ffd6ca50}.sf-dimensional-type .cast b:first-child{filter:drop-shadow(0 -1px 0 #fff4);z-index:2}.sf-dimensional-type .turn{position:absolute;bottom:25px;left:25%;width:50%;height:32px;accent-color:#fcd2be}@media(max-width:380px){.sf-dimensional-type .object{scale:.82}}`}</style>
    </section>
  )
}
