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

import { useEffect, useLayoutEffect, useRef, useState } from "react"

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

export default function ContactSheet({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [selected, setSelected] = useState<number | null>(null)
  const root = useRef<HTMLElement>(null)
  const before = useRef<DOMRect[]>([])
  const animations = useRef<Animation[]>([])
  useLayoutEffect(() => {
    animations.current.forEach((animation) => animation.cancel())
    animations.current = []
    const nodes = Array.from(root.current?.querySelectorAll<HTMLElement>(".print") ?? [])
    const after = nodes.map((node) => node.getBoundingClientRect())
    if (active && !reduced && !instant && before.current.length) {
      const parentScale = root.current!.getBoundingClientRect().width / root.current!.clientWidth
      nodes.forEach((node, index) => {
        const first = before.current[index],
          last = after[index]
        const x = first.width / last.width,
          y = first.height / last.height
        animations.current.push(
          node.animate(
            [
              {
                transform: `translate(${(first.left - last.left) / parentScale}px, ${
                  (first.top - last.top) / parentScale
                }px) scale(${x}, ${y})`,
              },
              { transform: "none" },
            ],
            { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" },
          ),
        )
        const caption = node.querySelector<HTMLElement>(".caption")!
        animations.current.push(
          caption.animate(
            Array.from({ length: 33 }, (_, step) => {
              const progress = step / 32
              return {
                transform: `scale(${1 / (x + (1 - x) * progress)}, ${1 / (y + (1 - y) * progress)})`,
                offset: progress,
              }
            }),
            { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" },
          ),
        )
      })
    }
    before.current = []
  }, [selected, active, reduced, instant])
  useEffect(() => () => animations.current.forEach((animation) => animation.cancel()), [])
  const names = ["Balance", "Recess", "Counterform", "Passage"]
  return (
    <section
      ref={root}
      className="sf-contact-sheet"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="editions">
        {names.map((name, i) => (
          <button
            type="button"
            key={name}
            className="print"
            data-selected={selected === i}
            data-muted={selected !== null && selected !== i}
            style={{ left: `${(i % 2) * 50}%`, top: `${Math.floor(i / 2) * 50}%` }}
            aria-label={`${selected === i ? "Close" : "Expand"} ${name}`}
            aria-expanded={selected === i}
            onClick={() => {
              before.current = Array.from(root.current!.querySelectorAll<HTMLElement>(".print"), (node) =>
                node.getBoundingClientRect(),
              )
              setSelected(selected === i ? null : i)
            }}
          >
            <div className={`work work-${i}`}>
              <i />
              <b />
              <span />
            </div>
            <span className="caption">
              {name}
              <small>{String(i + 1).padStart(2, "0")}</small>
            </span>
          </button>
        ))}
      </div>
      <style>{`.sf-contact-sheet{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#deddd9;box-sizing:border-box}.sf-contact-sheet *{box-sizing:border-box}.sf-contact-sheet button,.sf-contact-sheet input{font:inherit}.sf-contact-sheet button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-contact-sheet button:focus-visible,.sf-contact-sheet input:focus-visible,.sf-contact-sheet [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-contact-sheet[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-contact-sheet *{transition:none!important;animation:none!important}}.sf-contact-sheet .editions{position:relative;width:min(82%,410px);height:82%;margin:5% auto}.sf-contact-sheet .print{position:absolute;width:48%;height:47%;padding:7px;border:0;background:#f8f7f3;box-shadow:0 2px 4px #332b1e1a;transform-origin:0 0;transition:opacity .2s;overflow:hidden;text-align:left}.sf-contact-sheet .print[data-selected=true]{left:9%!important;top:0!important;width:82%;height:100%;z-index:3;box-shadow:0 18px 35px #332b1e30}.sf-contact-sheet .print[data-muted=true]{opacity:.25}.sf-contact-sheet .work{height:calc(100% - 22px);position:relative;overflow:hidden;background:#d7c5b5}.sf-contact-sheet .work i,.sf-contact-sheet .work b,.sf-contact-sheet .work span{position:absolute;display:block}.sf-contact-sheet .work-0 i{width:58%;height:80%;left:20%;top:10%;border-radius:50%;background:linear-gradient(100deg,#805b48,#f0d6b7 37%,#b3876c 67%,#64452f);box-shadow:14px 10px 12px #5b453649}.sf-contact-sheet .work-0 b{width:25%;height:42%;left:37%;top:29%;border-radius:50%;background:linear-gradient(90deg,#543d31,#b0896e);box-shadow:inset 3px 2px 3px #22160980}.sf-contact-sheet .work-1{background:#173e42}.sf-contact-sheet .work-1 i{width:78%;height:66%;left:8%;top:18%;transform:rotate(-20deg);background:repeating-linear-gradient(90deg,#7a9c93 0 8%,#c0cebc 9% 12%,#284b48 13% 17%);box-shadow:12px 18px 13px #051e2280}.sf-contact-sheet .work-2{background:#b44133}.sf-contact-sheet .work-2 i{width:66%;height:75%;left:17%;top:15%;background:linear-gradient(110deg,#f7b2a5,#c75546);border-radius:45% 45% 0 0;box-shadow:8px 12px 12px #631d2444}.sf-contact-sheet .work-2 b{width:25%;height:43%;bottom:10%;left:36%;background:#922f2a;border-radius:50% 50% 0 0}.sf-contact-sheet .work-3{background:#c6d0d6}.sf-contact-sheet .work-3 i{width:72%;height:72%;left:14%;top:14%;border-radius:50%;background:conic-gradient(from 40deg,#ededdf,#8a9ba9,#eff0de,#8a9ba9,#ededdf);box-shadow:6px 12px 15px #4b606a66}.sf-contact-sheet .work-3 b{width:40%;height:40%;left:30%;top:30%;border-radius:50%;background:#c6d0d6;box-shadow:inset 3px 5px 9px #4b606a66}.sf-contact-sheet .caption{transform-origin:0 100%;display:flex;justify-content:space-between;font:11px Georgia,serif;padding-top:6px}.sf-contact-sheet .caption small{font:8px monospace}`}</style>
    </section>
  )
}
