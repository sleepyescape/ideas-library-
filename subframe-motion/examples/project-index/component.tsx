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

export default function ProjectIndex({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [selected, setSelected] = useState(0)
  const names = ["Soft geometry", "Domestic orbit", "Volumes of air"]
  return (
    <section
      className="sf-project-index"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="index">
        {names.map((name, i) => (
          <button
            type="button"
            aria-pressed={selected === i}
            disabled={!active}
            onFocus={() => {
              if (active) {
                setSelected(i)
              }
            }}
            onPointerEnter={(e) => {
              if (active && e.pointerType === "mouse") {
                setInstant(false)
                setSelected(i)
              }
            }}
            onClick={() => {
              if (active) {
                setSelected(i)
              }
            }}
            key={name}
          >
            <span>{name}</span>
          </button>
        ))}
      </div>
      <div className="window" aria-hidden="true">
        <div className="reel" style={{ transform: `translateY(-${(selected * 100) / 3}%)` }}>
          {names.map((_, i) => (
            <div className={`still still-${i}`} key={i}>
              <i />
              <b />
              <em />
            </div>
          ))}
        </div>
      </div>
      <style>{`.sf-project-index{position:relative;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#ecebe7;box-sizing:border-box}.sf-project-index *{box-sizing:border-box}.sf-project-index button,.sf-project-index input{font:inherit}.sf-project-index button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-project-index button:focus-visible,.sf-project-index input:focus-visible,.sf-project-index [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-project-index[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-project-index *{transition:none!important;animation:none!important}}.sf-project-index .index{position:absolute;left:7%;width:45%;top:23%;z-index:2}.sf-project-index .index button{width:100%;display:flex;justify-content:space-between;align-items:center;padding:22px 0;background:none;border:0;border-bottom:1px solid #b9b8b1;text-align:left;color:#292a27;font:24px Georgia,serif;letter-spacing:-.6px}.sf-project-index .index button[aria-pressed=true]{color:#934d31}.sf-project-index .index button{transition:color .18s ease}.sf-project-index .index button:disabled{cursor:default}.sf-project-index .window{position:absolute;width:32%;height:68%;right:7%;top:16%;transform:rotate(0deg);box-shadow:0 2px 3px #242b2914,0 12px 24px #242b291c;overflow:hidden;pointer-events:none;z-index:1;opacity:1}.sf-project-index .reel{height:300%;transition:transform .24s cubic-bezier(.2,.85,.25,1)}.sf-project-index .still{height:33.3333%;position:relative;background:#b6aca0;overflow:hidden}.sf-project-index .still i,.sf-project-index .still b,.sf-project-index .still em{position:absolute;display:block}.sf-project-index .still i{width:60%;height:58%;left:20%;top:21%;background:radial-gradient(ellipse at 34% 20%,#ece9d8,transparent 43%),linear-gradient(100deg,#a39b88,#dad6bd 35%,#8b846e);border-radius:45% 50% 37% 40%;box-shadow:2px 3px 2px #2f332c24,9px 17px 12px #2f332c50,inset 1px 1px 1px #ffffff60}.sf-project-index .still-1{background:#9eadb3}.sf-project-index .still-1 i{border-radius:50%;width:70%;height:45%;left:15%;top:34%;background:linear-gradient(140deg,#96968b,#eee7cf,#686f6d)}.sf-project-index .still-1 b{height:50%;width:10%;background:#353c3c;left:45%;top:15%;transform:rotate(-30deg)}.sf-project-index .still-2{background:#ce8b66}.sf-project-index .still-2 i{border-radius:0;clip-path:polygon(50% 0,100% 100%,0 100%);background:linear-gradient(100deg,#f4cfac,#a15136)}@media(max-width:380px){.sf-project-index .window{right:7%;width:32%}.sf-project-index .index button{font-size:21px}}`}</style>
    </section>
  )
}
