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

export default function PoemScroll({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [progress, setProgress] = useState(0)
  const lines = [
    "The tide came in",
    "without a sound.",
    "We moved our chairs",
    "a little higher.",
    "Stayed until",
    "the light was gone.",
  ]
  return (
    <section
      className="sf-poem-scroll"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div
        className="reading"
        tabIndex={0}
        aria-label="Scroll through the poem"
        onScroll={(e) => {
          const el = e.currentTarget
          setProgress(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight))
        }}
      >
        <div className="poem">
          {lines.map((line, i) => (
            <p key={line} style={{ opacity: reduced ? 1 : Math.max(0.27, Math.min(1, 1 - (i - progress * 5) * 0.45)) }}>
              {line}
            </p>
          ))}
          <div className="end" aria-hidden="true">
            ◦
          </div>
        </div>
      </div>
      <div className="track" aria-hidden="true">
        <i style={{ transform: `scaleY(${Math.max(0.04, progress)})` }} />
      </div>
      <span className="scroll-cue" aria-hidden="true">
        ↓
      </span>
      <style>{`.sf-poem-scroll{position:relative;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#273c52;box-sizing:border-box}.sf-poem-scroll *{box-sizing:border-box}.sf-poem-scroll button,.sf-poem-scroll input{font:inherit}.sf-poem-scroll button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-poem-scroll button:focus-visible,.sf-poem-scroll input:focus-visible,.sf-poem-scroll [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-poem-scroll[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-poem-scroll *{transition:none!important;animation:none!important}}.sf-poem-scroll .reading{position:absolute;inset:0;overflow:auto;scrollbar-width:none;overscroll-behavior:contain;outline-offset:-5px!important}.sf-poem-scroll .poem{padding:58px 14% 30px;min-height:590px;color:#e7ddbe}.sf-poem-scroll .poem p{font:clamp(27px,5.3cqw,36px)/1.12 Georgia,serif;letter-spacing:-.7px;margin:0 0 29px;transition:opacity .08s linear}.sf-poem-scroll .end{font-size:45px;text-align:center;padding:20px}.sf-poem-scroll .track{position:absolute;right:20px;top:35px;bottom:35px;width:1px;background:#677581}.sf-poem-scroll .track i{display:block;width:2px;height:100%;background:#c6ad71;transform-origin:top}.sf-poem-scroll .scroll-cue{position:absolute;right:13px;bottom:10px;color:#c6ad71;font-size:19px;pointer-events:none}`}</style>
    </section>
  )
}
