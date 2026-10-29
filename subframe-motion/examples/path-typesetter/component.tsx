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

import { useId, useRef, useState } from "react"

type Point = { x: number; y: number }
const initial = [
  { x: 145, y: 36 },
  { x: 435, y: 266 },
]
const bound = (p: Point) => ({ x: Math.max(48, Math.min(552, p.x)), y: Math.max(32, Math.min(268, p.y)) })
function curveLength(a: Point, b: Point) {
  let length = 0,
    last = { x: 36, y: 164 }
  for (let i = 1; i <= 40; i++) {
    const t = i / 40,
      s = 1 - t
    const p = {
      x: s ** 3 * 36 + 3 * s * s * t * a.x + 3 * s * t * t * b.x + t ** 3 * 564,
      y: s ** 3 * 164 + 3 * s * s * t * a.y + 3 * s * t * t * b.y + t ** 3 * 164,
    }
    length += Math.hypot(p.x - last.x, p.y - last.y)
    last = p
  }
  return length
}
export default function PathTypesetter({ active = true }: { active?: boolean }) {
  const id = useId(),
    field = useRef<HTMLDivElement>(null)
  const [points, setPoints] = useState<Point[]>(initial),
    [text, setText] = useState("Free form")
  const drag = useRef<{ pointerId: number; index: number; start: Point; offset: Point } | null>(null)
  const move = (index: number, p: Point) => setPoints((value) => value.map((v, i) => (i === index ? bound(p) : v)))
  const locate = (x: number, y: number) => {
    const b = field.current!.getBoundingClientRect()
    return { x: ((x - b.left) / b.width) * 600, y: ((y - b.top) / b.height) * 300 }
  }
  const d = `M36 164 C${points[0].x} ${points[0].y} ${points[1].x} ${points[1].y} 564 164`
  return (
    <section className="sf-path-typesetter" data-active={active}>
      <div className="pt-field" ref={field}>
        <svg viewBox="0 0 600 300" preserveAspectRatio="none" aria-label={text || "Empty type path"} role="img">
          <defs>
            <path id={id} d={d} />
          </defs>
          <path
            d={`M36 164 L${points[0].x} ${points[0].y} M564 164 L${points[1].x} ${points[1].y}`}
            stroke="#ddd"
            fill="none"
            strokeDasharray="3 4"
          />
          <use href={`#${id}`} stroke="#bababa" fill="none" />
          <text
            fontFamily="Georgia,serif"
            fontStyle="italic"
            fontSize="91"
            fill="#191919"
            textLength={curveLength(points[0], points[1]) * 0.96}
            lengthAdjust="spacingAndGlyphs"
          >
            <textPath href={`#${id}`} startOffset="2%">
              {text}
            </textPath>
          </text>
          {[36, 564].map((x) => (
            <circle key={x} cx={x} cy="164" r="3" fill="#191919" />
          ))}
        </svg>
        {points.map((p, i) => (
          <button
            key={i}
            type="button"
            className="pt-handle"
            role="slider"
            aria-label={i ? "Second curve bend" : "First curve bend"}
            aria-valuemin={32}
            aria-valuemax={268}
            aria-valuenow={Math.round(p.y)}
            aria-valuetext={`X ${Math.round(p.x)}, Y ${Math.round(p.y)}. Arrow keys move the bend.`}
            style={{ transform: `translate(calc(${p.x / 6}cqw - 50%), calc(${p.y / 3}cqh - 50%))` }}
            onPointerDown={(e) => {
              if (e.button !== 0 || !e.isPrimary || drag.current) {
                return
              }
              const at = locate(e.clientX, e.clientY)
              drag.current = { pointerId: e.pointerId, index: i, start: p, offset: { x: p.x - at.x, y: p.y - at.y } }
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              const a = drag.current
              if (!a || a.index !== i || a.pointerId !== e.pointerId) {
                return
              }
              const at = locate(e.clientX, e.clientY)
              move(i, { x: at.x + a.offset.x, y: at.y + a.offset.y })
            }}
            onPointerUp={(e) => {
              if (drag.current?.pointerId !== e.pointerId) {
                return
              }
              drag.current = null
            }}
            onPointerCancel={(e) => {
              if (drag.current?.pointerId !== e.pointerId) {
                return
              }
              move(i, drag.current.start)
              drag.current = null
            }}
            onLostPointerCapture={(e) => {
              if (drag.current?.pointerId !== e.pointerId) {
                return
              }
              drag.current = null
            }}
            onKeyDown={(e) => {
              const amount = e.shiftKey ? 1 : 10
              const directions: Record<string, Point> = {
                ArrowLeft: { x: -amount, y: 0 },
                ArrowRight: { x: amount, y: 0 },
                ArrowUp: { x: 0, y: -amount },
                ArrowDown: { x: 0, y: amount },
              }
              if (directions[e.key]) {
                e.preventDefault()
                move(i, { x: p.x + directions[e.key].x, y: p.y + directions[e.key].y })
              }
              if (e.key === "Home") {
                e.preventDefault()
                move(i, initial[i])
              }
            }}
          >
            <i />
          </button>
        ))}
      </div>
      <footer>
        <label htmlFor={`${id}-text`}>Text</label>
        <input
          id={`${id}-text`}
          value={text}
          maxLength={18}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
        <button type="button" onClick={() => setPoints(initial)} aria-label="Reset curve">
          ↺
        </button>
      </footer>
      <style>{`.sf-path-typesetter{height:100%;width:100%;min-height:280px;background:#fafafa;color:#191919;display:flex;flex-direction:column;overflow:hidden;font-family:Arial,sans-serif;box-sizing:border-box}.sf-path-typesetter *{box-sizing:border-box}.sf-path-typesetter .pt-field{position:relative;flex:1;min-height:0;container-type:size}.sf-path-typesetter svg{width:100%;height:100%;display:block;overflow:hidden}.sf-path-typesetter .pt-handle{position:absolute;left:0;top:0;width:44px;height:44px;padding:0;transform:translate(-50%,-50%);display:grid;place-items:center;border:0;background:none;touch-action:none;cursor:grab}.sf-path-typesetter .pt-handle i{width:11px;height:11px;background:#e92f21;border:2px solid #fff;box-shadow:0 0 0 1px #e92f21;border-radius:50%}.sf-path-typesetter .pt-handle:active{cursor:grabbing}.sf-path-typesetter footer{height:62px;margin:0 22px;display:flex;align-items:center;border-top:1px solid #ddd;gap:14px;flex:none}.sf-path-typesetter label{font:11px monospace;color:#686868}.sf-path-typesetter input{font:16px Georgia,serif;min-width:0;width:100%;height:44px;border:0;background:none;color:inherit;outline-offset:2px}.sf-path-typesetter footer button{width:44px;height:44px;flex:none;font:24px Arial;border:0;background:none;color:inherit;cursor:pointer}.sf-path-typesetter button:focus-visible,.sf-path-typesetter input:focus-visible{outline:2px solid #e92f21;outline-offset:2px}`}</style>
    </section>
  )
}
