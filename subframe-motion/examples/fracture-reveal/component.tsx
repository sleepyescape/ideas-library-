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

export default function FractureReveal({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [open, setOpen] = useState(false)
  const pieces = [
    "0 0,50% 0,32% 39%,0 61%",
    "50% 0,100% 0,72% 44%,32% 39%",
    "100% 0,100% 70%,72% 44%",
    "0 61%,32% 39%,52% 66%,0 100%",
    "32% 39%,72% 44%,52% 66%",
    "72% 44%,100% 70%,100% 100%,52% 66%",
    "0 100%,52% 66%,100% 100%",
  ]
  return (
    <section
      className="sf-fracture-reveal"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <button
        type="button"
        className="stone"
        aria-label={open ? "Restore the stone" : "Reveal the mineral"}
        aria-pressed={open}
        onClick={() => setOpen(!open)}
      >
        <div className="mineral" />
        <div className="shards" data-open={open}>
          {pieces.map((polygon, i) => (
            <i
              key={i}
              style={{
                clipPath: `polygon(${polygon})`,
                transform: open
                  ? `translate(${((i % 3) - 1) * 42}px,${(Math.floor(i / 3) - 1) * 35}px) rotate(${
                      (i - 3) * 8
                    }deg) scale(.8)`
                  : "scale(.988)",
                transitionDelay: `${i * 25}ms`,
                transformOrigin: ["18% 27%", "60% 23%", "91% 38%", "24% 69%", "52% 50%", "79% 76%", "50% 87%"][i],
                background: `linear-gradient(${35 + i * 43}deg, ${
                  ["#141b22", "#364243", "#273537", "#202930", "#3a484a", "#151f2a", "#2e383c"][i]
                }, #10181d)`,
              }}
            />
          ))}
        </div>
        <span>
          {open ? "Restore" : "Reveal"} <b aria-hidden="true">{open ? "↶" : "↗"}</b>
        </span>
      </button>
      <style>{`.sf-fracture-reveal{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#777367;box-sizing:border-box}.sf-fracture-reveal *{box-sizing:border-box}.sf-fracture-reveal button,.sf-fracture-reveal input{font:inherit}.sf-fracture-reveal button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-fracture-reveal button:focus-visible,.sf-fracture-reveal input:focus-visible,.sf-fracture-reveal [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-fracture-reveal[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-fracture-reveal *{transition:none!important;animation:none!important}}.sf-fracture-reveal .stone{position:absolute;inset:0;width:100%;height:100%;border:0;background:#5e665c;padding:0}.sf-fracture-reveal .mineral{position:absolute;inset:0;background:repeating-linear-gradient(133deg,#284948 0 8px,#e0fa65 9px 13px,#659486 14px 22px,#163b40 23px 34px);box-shadow:inset 0 0 75px #10344a88}.sf-fracture-reveal .shards{position:absolute;inset:-4px}.sf-fracture-reveal .shards i{position:absolute;inset:0;background:repeating-linear-gradient(20deg,#b3afa1 0 1px,#bab5a7 2px 9px,#aaa597 10px 11px,#bab5a7 12px 23px);transition:transform .7s cubic-bezier(.22,.8,.2,1),opacity .7s}.sf-fracture-reveal .shards[data-open=true] i{opacity:.82}.sf-fracture-reveal .stone>span{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);border:1px solid #efede1aa;background:#18262bcc;padding:11px 18px;border-radius:2px;font:11px Arial;color:#e4f5c3;display:flex;gap:28px;align-items:center}.sf-fracture-reveal .stone b{font:18px Arial}`}</style>
    </section>
  )
}
