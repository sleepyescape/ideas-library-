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

const prefix = "Meet me at the ",
  oldWord = "south",
  newWord = "north",
  suffix = " entrance."
const script: { text: string; ms: number; revision: boolean }[] = []
for (let i = 0; i <= prefix.length + oldWord.length + suffix.length; i++) {
  script.push({ text: (prefix + oldWord + suffix).slice(0, i), ms: i === 0 ? 180 : 46 + (i % 4) * 13, revision: false })
}
script.push({ text: prefix + oldWord + suffix, ms: 850, revision: false })
for (let i = oldWord.length + suffix.length - 1; i >= 0; i--) {
  script.push({ text: prefix + (oldWord + suffix).slice(0, i), ms: 30, revision: false })
}
for (let i = 1; i <= newWord.length + suffix.length; i++) {
  script.push({ text: prefix + (newWord + suffix).slice(0, i), ms: 55 + (i % 3) * 18, revision: true })
}
script.push({ text: prefix + newWord + suffix, ms: 0, revision: true })
export default function EditingCaret({ active = true }: { active?: boolean }) {
  const [index, setIndex] = useState(script.length - 1),
    [playing, setPlaying] = useState(false),
    [reduced, setReduced] = useState(true)
  const step = useRef(script.length - 1),
    elapsed = useRef(0)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    if (reduced && playing) {
      step.current = script.length - 1
      setIndex(step.current)
      setPlaying(false)
    }
  }, [reduced, playing])
  useEffect(() => {
    if (!active || !playing || reduced) {
      return
    }
    let frame = 0,
      last = 0
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 48) : 0
      last = now
      elapsed.current += dt
      while (step.current < script.length - 1 && elapsed.current >= script[step.current].ms) {
        elapsed.current -= script[step.current].ms
        step.current++
        setIndex(step.current)
      }
      if (step.current === script.length - 1) {
        setPlaying(false)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    const visibility = () => {
      cancelAnimationFrame(frame)
      last = 0
      if (!document.hidden) {
        frame = requestAnimationFrame(tick)
      }
    }
    visibility()
    document.addEventListener("visibilitychange", visibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [active, playing, reduced])
  const item = script[index],
    correction = item.revision ? item.text.slice(prefix.length) : ""
  function replay() {
    if (reduced) {
      step.current = script.length - 1
      setIndex(step.current)
      setPlaying(false)
      return
    }
    step.current = 0
    elapsed.current = 0
    setIndex(0)
    setPlaying(true)
  }
  return (
    <section className="sf-editing-caret" data-playing={active && playing && !reduced}>
      <div className="ec-note">
        <span className="ec-date">19:30 / THURSDAY</span>
        <p aria-hidden="true">
          {item.revision ? (
            <>
              {prefix}
              <span className="ec-correction">{correction}</span>
            </>
          ) : (
            item.text
          )}
          <i className="ec-caret" />
        </p>
        <p className="ec-sr">Meet me at the north entrance.</p>
      </div>
      <footer>
        <span aria-live="polite">{playing ? "Revising" : "Note 01"}</span>
        <button
          type="button"
          onClick={playing ? () => setPlaying(false) : index < script.length - 1 ? () => setPlaying(true) : replay}
        >
          {playing ? "Pause" : index < script.length - 1 ? "Resume" : "Rewrite"}
          <span aria-hidden="true">{playing ? "Ⅱ" : "↺"}</span>
        </button>
      </footer>
      <style>{`.sf-editing-caret{position:relative;width:100%;height:100%;min-height:280px;background:#f8f8f4;color:#22211f;overflow:hidden;box-sizing:border-box;font-family:Arial,sans-serif;container-type:inline-size}.sf-editing-caret *{box-sizing:border-box}.sf-editing-caret .ec-note{position:absolute;inset:28px 8% 74px;border-left:1px solid #d72f27;padding-left:22px}.sf-editing-caret .ec-date{font:9px monospace;letter-spacing:.12em;color:#6d6c67}.sf-editing-caret p{font:clamp(28px,6cqw,39px)/1.28 Georgia,serif;letter-spacing:-1px;margin:23px 0 0;max-width:450px;white-space:pre-wrap;min-height:150px}.sf-editing-caret .ec-correction{color:#c82820}.sf-editing-caret .ec-caret{display:inline-block;width:2px;height:1em;background:#c82820;vertical-align:-.12em;margin-left:2px;opacity:0}.sf-editing-caret[data-playing=true] .ec-caret{opacity:1}.sf-editing-caret .ec-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);min-height:0}.sf-editing-caret footer{position:absolute;left:8%;right:8%;bottom:16px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #dddcd5;font:10px monospace}.sf-editing-caret button{height:44px;min-width:90px;background:none;border:0;display:flex;align-items:center;gap:22px;font:11px Arial;color:inherit;padding:0;cursor:pointer}.sf-editing-caret button span{font-size:22px}.sf-editing-caret button:focus-visible{outline:2px solid #c82820;outline-offset:4px}`}</style>
    </section>
  )
}
