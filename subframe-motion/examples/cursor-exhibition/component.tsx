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

export default function CursorExhibition({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [prints, setPrints] = useState<{ id: number; x: number; y: number; angle: number }[]>([
    { id: 1, x: 55, y: 42, angle: -11 },
    { id: 2, x: 68, y: 57, angle: 8 },
    { id: 3, x: 46, y: 65, angle: -5 },
  ])
  const serial = useRef(3)
  const last = useRef({ x: -100, y: -100 })
  function place(x: number, y: number) {
    if (Math.hypot(x - last.current.x, y - last.current.y) < 7) {
      return
    }
    last.current = { x, y }
    const id = ++serial.current
    setPrints((v) => [...v.slice(-5), { id, x, y, angle: ((id * 17) % 30) - 15 }])
  }
  return (
    <section
      className="sf-cursor-exhibition"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduced || !active) {
          return
        }
        const r = e.currentTarget.getBoundingClientRect()
        place(
          Math.max(18, Math.min(82, ((e.clientX - r.left) / r.width) * 100)),
          Math.max(22, Math.min(75, ((e.clientY - r.top) / r.height) * 100)),
        )
      }}
    >
      <div className="word" aria-hidden="true">
        Field
        <br />
        <i>notes.</i>
      </div>
      {prints.map((p, i) => (
        <div
          className={`impression impression-${p.id % 3}`}
          key={p.id}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(-50%,-50%) rotate(${p.angle}deg)`,
            opacity: (i + 1) / prints.length,
          }}
          aria-hidden="true"
        >
          <i />
          <b />
        </div>
      ))}
      <button
        type="button"
        className="place"
        onClick={() => place(25 + ((serial.current * 13) % 50), 30 + ((serial.current * 9) % 35))}
      >
        Place a print <span>↗</span>
      </button>
      <style>{`.sf-cursor-exhibition{position:relative;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#e9e7e1;box-sizing:border-box}.sf-cursor-exhibition *{box-sizing:border-box}.sf-cursor-exhibition button,.sf-cursor-exhibition input{font:inherit}.sf-cursor-exhibition button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-cursor-exhibition button:focus-visible,.sf-cursor-exhibition input:focus-visible,.sf-cursor-exhibition [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-cursor-exhibition[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-cursor-exhibition *{transition:none!important;animation:none!important}}.sf-cursor-exhibition .word{position:absolute;left:11%;top:15%;font:clamp(60px,15cqw,92px)/.83 Georgia,serif;letter-spacing:-6px;color:#888c7b}.sf-cursor-exhibition .word i{font-weight:normal}.sf-cursor-exhibition .impression{position:absolute;width:91px;height:112px;background:#f9f7ed;padding:8px;box-shadow:3px 7px 13px #43423833;pointer-events:none;animation:sf-impression-in .3s ease-out;transition:opacity .3s}.sf-cursor-exhibition .impression i{display:block;height:100%;background:repeating-linear-gradient(40deg,#caa264 0 9px,#996942 10px 12px)}.sf-cursor-exhibition .impression b{position:absolute;width:51px;height:51px;left:20px;top:30px;border-radius:50%;background:#254a43;box-shadow:4px 7px 5px #1113}.sf-cursor-exhibition .impression-1 i{background:#9fabaa}.sf-cursor-exhibition .impression-1 b{border-radius:0;background:#e1d4ae;transform:rotate(25deg)}.sf-cursor-exhibition .impression-2 i{background:#955f53}.sf-cursor-exhibition .impression-2 b{background:transparent;border:13px solid #ddd4bf}.sf-cursor-exhibition .place{position:absolute;bottom:20px;left:11%;right:11%;height:44px;display:flex;justify-content:space-between;align-items:center;border:0;border-top:1px solid #b8bbaf;background:none;color:#535a4b;text-align:left;font-size:12px}@keyframes sf-impression-in{from{scale:.85;opacity:0}to{scale:1}}`}</style>
    </section>
  )
}
