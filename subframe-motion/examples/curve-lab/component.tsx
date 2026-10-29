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

export default function CurveLab({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [right, setRight] = useState(false)
  const curves = ["linear", "cubic-bezier(.2,.8,.2,1)", "cubic-bezier(.2,1.45,.3,1)"]
  return (
    <section
      className="sf-curve-lab"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="lanes">
        {["Linear", "Settle", "Overshoot"].map((label, i) => (
          <div className="lane" key={label}>
            <span>{label}</span>
            <div className="rail">
              <span
                className="runner"
                style={{ transform: right ? "translateX(100%)" : "translateX(0)", transitionTimingFunction: curves[i] }}
              >
                <i />
              </span>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="send" onClick={() => setRight(!right)}>
        {right ? "Return" : "Compare"}
        <span aria-hidden="true">{right ? "←" : "→"}</span>
      </button>
      <style>{`.sf-curve-lab{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#f3f4f6;box-sizing:border-box}.sf-curve-lab *{box-sizing:border-box}.sf-curve-lab button,.sf-curve-lab input{font:inherit}.sf-curve-lab button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-curve-lab button:focus-visible,.sf-curve-lab input:focus-visible,.sf-curve-lab [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-curve-lab[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-curve-lab *{transition:none!important;animation:none!important}}.sf-curve-lab .lanes{position:absolute;left:11%;right:11%;top:18%;display:flex;flex-direction:column;gap:28px}.sf-curve-lab .lane{display:flex;gap:20px;align-items:center}.sf-curve-lab .lane>span{width:61px;font:10px Arial;color:#7b8493}.sf-curve-lab .rail{height:32px;flex:1;position:relative;border-bottom:1px solid #d7dde4}.sf-curve-lab .runner{position:absolute;inset:0 26px 0 0;transition:transform 900ms}.sf-curve-lab .rail i{position:absolute;bottom:7px;width:26px;height:26px;border-radius:7px;background:linear-gradient(#fcfcff,#d0d9e9);border:1px solid #aab8d2;box-shadow:0 2px 3px #8894a72a}.sf-curve-lab .lane:nth-child(2) i{border-radius:50%;background:linear-gradient(#b8cef5,#7394cb);border-color:#7994c0}.sf-curve-lab .lane:nth-child(3) i{background:linear-gradient(#6f829a,#3e4c66);border-color:#42536e}.sf-curve-lab .send{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);border:1px solid #d9dfe7;background:#fff;color:#526078;border-radius:6px;height:36px;display:flex;align-items:center;gap:24px;font:11px Arial;padding:0 17px}`}</style>
    </section>
  )
}
