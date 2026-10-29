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

export default function GravityLetters({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [fallen, setFallen] = useState(false)
  return (
    <section
      className="sf-gravity-letters"
      data-still={!active || reduced || instant}
      data-fallen={fallen}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="tray" aria-label="DROP">
        <div className="letters">
          {"DROP".split("").map((letter, i) => (
            <span
              aria-hidden="true"
              key={i}
              style={{
                transform: fallen
                  ? `translateY(calc(66cqh - 29px - var(--block-height) - var(--block-width) * ${
                      Math.sin((Math.abs([-13, 8, -6, 15][i]) * Math.PI) / 180) / 2
                    } - var(--block-height) * ${(Math.cos(([-13, 8, -6, 15][i] * Math.PI) / 180) - 1) * 0.2})) rotate(${
                      [-13, 8, -6, 15][i]
                    }deg)`
                  : "none",
                transitionDelay: `${i * 35}ms`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
      <button type="button" className="drop" aria-pressed={fallen} onClick={() => setFallen(!fallen)}>
        {fallen ? "Pick it up" : "Let it fall"}
        <span aria-hidden="true">{fallen ? "↑" : "↓"}</span>
      </button>
      <style>{`.sf-gravity-letters{container-type:size;position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#e7bb45;box-sizing:border-box}.sf-gravity-letters *{box-sizing:border-box}.sf-gravity-letters button,.sf-gravity-letters input{font:inherit}.sf-gravity-letters button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-gravity-letters button:focus-visible,.sf-gravity-letters input:focus-visible,.sf-gravity-letters [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-gravity-letters[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-gravity-letters *{transition:none!important;animation:none!important}}.sf-gravity-letters .tray{position:absolute;left:11%;right:11%;top:14%;height:66%;border-bottom:8px solid #98682c;box-shadow:0 9px 8px #9d6c2822}.sf-gravity-letters .letters{--block-width:70px;--block-height:85px;display:flex;gap:5px;justify-content:center;padding-top:16px}.sf-gravity-letters .letters span{display:grid;place-items:center;width:var(--block-width);height:var(--block-height);flex-shrink:0;background:#c64131;color:#f9df87;border-radius:4px;box-shadow:0 5px 0 #862e23,4px 7px 5px #8d651d35;font:bold 70px/1 Georgia;transition:transform .65s linear(0,.04,.16,.36,.64,1,.88,.94,1);transform-origin:50% 80%}.sf-gravity-letters[data-fallen=false] .letters span{transition-timing-function:cubic-bezier(.22,1,.36,1);transition-duration:.35s}.sf-gravity-letters .drop{position:absolute;bottom:14px;left:20%;right:20%;height:44px;border:0;background:none;display:flex;align-items:center;justify-content:space-between;color:#633d25;font:12px Arial}@container(max-width:380px){.sf-gravity-letters .letters{--block-width:52px;--block-height:72px}.sf-gravity-letters .letters span{font-size:56px}}`}</style>
    </section>
  )
}
