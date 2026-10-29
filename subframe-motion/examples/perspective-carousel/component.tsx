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

export default function PerspectiveCarousel({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [index, setIndex] = useState(0)
  const colors = ["#995848", "#496b72", "#938968", "#677359", "#87748d", "#b48151"]
  return (
    <section
      className="sf-perspective-carousel"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="view">
        <div className="ring" style={{ transform: `translateZ(-220px) rotateY(${-index * 60}deg)` }}>
          {colors.map((color, i) => (
            <div
              className="panel"
              key={color}
              style={{ transform: `rotateY(${i * 60}deg) translateZ(220px)`, background: color }}
              aria-hidden={((index % 6) + 6) % 6 !== i}
            >
              <i style={{ borderRadius: i % 2 ? "50%" : "2px", transform: `rotate(${i * 15}deg)` }} />
              <b>{["O", "∩", "II", "↗", "◑", "⊂"][i]}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="controls">
        <button type="button" aria-label="Previous artwork" onClick={() => setIndex(index - 1)}>
          ←
        </button>
        <span aria-live="polite">{(((index % 6) + 6) % 6) + 1} / 6</span>
        <button type="button" aria-label="Next artwork" onClick={() => setIndex(index + 1)}>
          →
        </button>
      </div>
      <style>{`.sf-perspective-carousel{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#e4e8ea;box-sizing:border-box}.sf-perspective-carousel *{box-sizing:border-box}.sf-perspective-carousel button,.sf-perspective-carousel input{font:inherit}.sf-perspective-carousel button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-perspective-carousel button:focus-visible,.sf-perspective-carousel input:focus-visible,.sf-perspective-carousel [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-perspective-carousel[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-perspective-carousel *{transition:none!important;animation:none!important}}.sf-perspective-carousel .view{position:absolute;inset:22px 0 68px;perspective:850px}.sf-perspective-carousel .ring{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.2,.8,.2,1)}.sf-perspective-carousel .panel{position:absolute;width:155px;height:195px;left:-77.5px;top:-97.5px;border:8px solid #f7f5ed;backface-visibility:hidden;box-shadow:0 12px 20px #0a212c25;overflow:hidden}.sf-perspective-carousel .panel i{position:absolute;width:85px;height:130px;left:26px;top:27px;background:linear-gradient(120deg,#ffffff66,#ffffff00);border:1px solid #ffffff40;box-shadow:5px 8px 10px #1113}.sf-perspective-carousel .panel b{position:absolute;inset:0;display:grid;place-items:center;font:100px Georgia;color:#eee7d0;mix-blend-mode:soft-light}.sf-perspective-carousel .controls{position:absolute;bottom:15px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:22px}.sf-perspective-carousel .controls button{width:44px;height:44px;border:1px solid #aab1b3;background:transparent;border-radius:50%;font-size:20px}.sf-perspective-carousel .controls span{font:11px monospace;white-space:nowrap}@media(max-width:380px){.sf-perspective-carousel .panel{width:135px;height:175px;left:-67.5px;top:-87.5px}}`}</style>
    </section>
  )
}
