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
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

export default function TypePress({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [edition, setEdition] = useState(0)
  const [animated, setAnimated] = useState(false)
  const words = edition % 2 === 0 ? ["BASS", "MASS"] : ["CLUB", "CULT"]
  return (
    <section className="sf-typepress" data-active={active} data-animate={animated && !reduced}>
      <div className="sf-typepress-top">
        <span>BASS MASS — NIGHT SESSIONS</span>
        <span>11 OCT / 23:00—LATE</span>
      </div>
      <h3 key={edition} className="sf-typepress-poster" aria-label={words.join(" ")}>
        <span className="sf-typepress-word" aria-hidden="true">
          {words[0].split("").map((letter, index) => (
            <span key={index} style={{ animationDelay: `${index * 35}ms` }}>
              {letter}
            </span>
          ))}
        </span>
        <span className="sf-typepress-word sf-typepress-bottom" aria-hidden="true">
          {words[1].split("").map((letter, index) => (
            <span key={index} style={{ animationDelay: `${80 + index * 35}ms` }}>
              {letter}
            </span>
          ))}
        </span>
      </h3>
      <div className="sf-typepress-footer">
        <span>
          FOUR WALLS.
          <br />
          ONE SOUND SYSTEM.
        </span>
        <button
          type="button"
          onClick={(event) => {
            setAnimated(active && event.detail > 0)
            setEdition((value) => value + 1)
          }}
          aria-label="Print the next typographic edition"
        >
          NEXT POSTER <span aria-hidden="true">↗</span>
        </button>
      </div>
      <style>{`
        .sf-typepress{width:100%;height:100%;min-height:300px;position:relative;overflow:hidden;background:#f13c25;color:#121212;display:flex;flex-direction:column;padding:23px 26px 18px;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;container-type:size}
        .sf-typepress *{box-sizing:border-box}.sf-typepress-top{display:flex;justify-content:space-between;border-top:2px solid;padding-top:9px;font:10px/1.2 ui-monospace,SFMono-Regular,monospace;letter-spacing:.05em}
        .sf-typepress-poster{margin:0;flex:1;display:flex;flex-direction:column;justify-content:center;padding:12px 0 10px;gap:0;isolation:isolate}
        .sf-typepress-word{display:flex;justify-content:center;height:98px;font-size:clamp(78px,25cqw,146px);line-height:.72;letter-spacing:-.085em;font-weight:950;transform-origin:left center}
        .sf-typepress-word span{display:inline-block;transform-origin:50% 100%;font-stretch:condensed}.sf-typepress-bottom{font-size:clamp(78px,25cqw,146px);height:98px}
        .sf-typepress[data-animate=true] .sf-typepress-word span{animation:sf-typepress-set 760ms cubic-bezier(.16,1,.3,1) both}.sf-typepress[data-animate=true] .sf-typepress-bottom span{animation-name:sf-typepress-set-bottom}
        .sf-typepress-footer{display:flex;justify-content:space-between;align-items:end;border-top:2px solid;padding-top:10px;gap:12px;font:10px/1.25 ui-monospace,SFMono-Regular,monospace;letter-spacing:.02em}
        .sf-typepress button{border:0;padding:0 0 0 12px;background:transparent;color:inherit;font:inherit;min-height:44px;cursor:pointer;display:flex;align-items:center;gap:18px;text-align:left}.sf-typepress button span{font:35px/1 Arial,sans-serif}.sf-typepress button:active{opacity:.6}.sf-typepress button:focus-visible{outline:2px solid;outline-offset:4px}
        .sf-typepress[data-active=false] *{animation-play-state:paused!important}
        @keyframes sf-typepress-set{0%{transform:translateY(55%) scaleX(.12) scaleY(.55);opacity:0}25%{opacity:1}100%{transform:translateY(0) scaleX(1) scaleY(1);opacity:1}}
        @keyframes sf-typepress-set-bottom{0%{transform:translateY(-45%) scaleX(1.45) scaleY(.18);opacity:0}25%{opacity:1}100%{transform:translateY(0) scaleX(1) scaleY(1);opacity:1}}
        @container(max-width:360px){.sf-typepress-word{height:82px}.sf-typepress-bottom{height:82px}.sf-typepress-top{font-size:9px}.sf-typepress-footer{font-size:9px}}
        @container(max-height:285px){.sf-typepress-word,.sf-typepress-bottom{height:79px;font-size:clamp(68px,22cqw,120px)}.sf-typepress-poster{padding-block:6px;min-height:0}}
        @media(prefers-reduced-motion:reduce){.sf-typepress *{animation:none!important;transition:none!important}}
      `}</style>
    </section>
  )
}
