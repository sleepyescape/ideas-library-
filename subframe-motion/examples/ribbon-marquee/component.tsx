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

export default function RibbonMarquee({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [offset, setOffset] = useState(-90)
  const last = useRef<number | null>(null)
  const id = useId().replace(/:/g, "")
  return (
    <section
      className="sf-ribbon-marquee"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <svg
        className="ribbon"
        viewBox="0 0 600 280"
        role="img"
        aria-label="Somewhere between here and there"
        onPointerDown={(e) => {
          last.current = e.clientX
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (last.current === null) {
            return
          }
          const rect = e.currentTarget.getBoundingClientRect()
          const scale = Math.min(rect.width / 600, rect.height / 280)
          const dx = (e.clientX - last.current) / scale
          last.current = e.clientX
          setOffset((v) => Math.max(-300, Math.min(60, v + dx)))
        }}
        onPointerUp={() => (last.current = null)}
        onPointerCancel={() => (last.current = null)}
        onLostPointerCapture={() => (last.current = null)}
      >
        <defs>
          <path id={id} d="M-120 165C70 -35 265 330 465 123C555 35 645 74 730 135" />
        </defs>
        <use href={`#${id}`} stroke="#6050bc" strokeWidth="60" fill="none" />
        <text fill="#f6f1ff" fontFamily="Georgia,serif" fontSize="34" letterSpacing="1">
          <textPath href={`#${id}`} startOffset={offset}>
            somewhere between here and there · somewhere between here and there ·
          </textPath>
        </text>
      </svg>
      <input
        className="position"
        aria-label="Ribbon position"
        type="range"
        min="-300"
        max="60"
        value={offset}
        onChange={(e) => setOffset(+e.target.value)}
      />
      <style>{`.sf-ribbon-marquee{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#ef855d;box-sizing:border-box}.sf-ribbon-marquee *{box-sizing:border-box}.sf-ribbon-marquee button,.sf-ribbon-marquee input{font:inherit}.sf-ribbon-marquee button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-ribbon-marquee button:focus-visible,.sf-ribbon-marquee input:focus-visible,.sf-ribbon-marquee [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-ribbon-marquee[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-ribbon-marquee *{transition:none!important;animation:none!important}}.sf-ribbon-marquee .ribbon{position:absolute;left:-3%;width:106%;height:80%;top:3%;overflow:visible;cursor:grab;touch-action:none;filter:drop-shadow(0 12px 0 #4f418520)}.sf-ribbon-marquee .ribbon:active{cursor:grabbing}.sf-ribbon-marquee .position{position:absolute;left:28%;width:44%;bottom:22px;height:30px;accent-color:#6351b7}`}</style>
    </section>
  )
}
