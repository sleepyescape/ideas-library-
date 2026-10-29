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

import { useEffect, useRef, useState } from "react"

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

export default function VelocityType({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [offset, setOffset] = useState(0)
  const [skew, setSkew] = useState(0)
  const last = useRef({ position: 0, time: 0 })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    },
    [],
  )
  return (
    <section
      className="sf-velocity-type"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div
        className="scroll"
        tabIndex={0}
        aria-label="Scroll to move the typography"
        onScroll={(e) => {
          const top = e.currentTarget.scrollTop
          const now = performance.now()
          const velocity = (top - last.current.position) / Math.max(16, now - last.current.time)
          last.current = { position: top, time: now }
          if (reduced || !active) {
            return
          }
          setOffset(top)
          if (!reduced && active && !instant) {
            setSkew(Math.max(-15, Math.min(15, velocity * 6)))
          }
          if (timer.current) {
            clearTimeout(timer.current)
          }
          timer.current = setTimeout(() => setSkew(0), 100)
        }}
      >
        <div className="spacer" />
      </div>
      <div
        className="type"
        aria-hidden="true"
        style={{ transform: reduced ? "none" : `translateX(${-offset * 0.32}px) skewX(${skew}deg)` }}
      >
        MAKE
        <br />
        <i>YOUR MOVE.</i>
        <br />
        MAKE
        <br />
        <i>YOUR MOVE.</i>
      </div>
      <div className="marker">↓</div>
      <style>{`.sf-velocity-type{position:relative;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#f2a543;box-sizing:border-box}.sf-velocity-type *{box-sizing:border-box}.sf-velocity-type button,.sf-velocity-type input{font:inherit}.sf-velocity-type button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-velocity-type button:focus-visible,.sf-velocity-type input:focus-visible,.sf-velocity-type [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-velocity-type[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-velocity-type *{transition:none!important;animation:none!important}}.sf-velocity-type .scroll{position:absolute;inset:0;overflow:auto;scrollbar-width:none;z-index:2;overscroll-behavior:contain;outline-offset:-6px!important}.sf-velocity-type .spacer{height:800px}.sf-velocity-type .type{position:absolute;left:9%;top:12%;font:900 clamp(63px,14cqw,92px)/.87 Arial;letter-spacing:-6px;color:#8b3f29;white-space:nowrap;transition:transform .16s ease-out;pointer-events:none}.sf-velocity-type .type i{font-family:Georgia;font-weight:400;color:#562e25;letter-spacing:-5px}.sf-velocity-type .marker{position:absolute;bottom:16px;right:21px;border-radius:50%;border:1px solid #95572988;width:32px;height:32px;display:grid;place-items:center;color:#633921;pointer-events:none;z-index:3}`}</style>
    </section>
  )
}
