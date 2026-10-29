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

import { useRef, useState } from "react"
export default function VectorHandles({ active = true }: { active?: boolean }) {
  const [points, setPoints] = useState([
    { x: 25, y: 15 },
    { x: 73, y: 85 },
  ])
  const plane = useRef<HTMLDivElement>(null),
    drag = useRef<number | null>(null)
  const update = (i: number, x: number, y: number) =>
    setPoints((p) =>
      p.map((v, j) => (j === i ? { x: Math.max(7, Math.min(93, x)), y: Math.max(8, Math.min(92, y)) } : v)),
    )
  return (
    <div className="sf-vector" data-active={active}>
      <style>{`
.sf-vector{height:100%;min-height:300px;display:grid;place-items:center;background:#eef0ef;font-family:Arial,sans-serif;overflow:hidden}.sf-vector *{box-sizing:border-box}.sf-vector-plane{position:relative;width:min(360px,88%);height:245px;border:1px solid #d9dfdc;background:white;background-image:radial-gradient(#cbd2ce .8px,transparent .8px);background-size:16px 16px;border-radius:8px;box-shadow:0 5px 16px #243b3310}.sf-vector-plane>svg{width:100%;height:100%;position:absolute;inset:0;overflow:visible}.sf-vector-handle{position:absolute;width:44px;height:44px;transform:translate(-50%,-50%);background:none;border:0;padding:15px;cursor:move;touch-action:none}.sf-vector-handle i{display:block;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #458272;box-shadow:0 2px 4px #12352a25;transition:transform 100ms ease}.sf-vector-handle:active i{transform:scale(1.15)}.sf-vector-handle:focus-visible{outline:2px solid #23765f;border-radius:50%}.sf-vector-coordinates{position:absolute;bottom:12px;left:14px;font:10px monospace;color:#72877e;background:#fff9;padding:3px}.sf-vector-reset{position:absolute;right:5px;bottom:3px;border:0;background:none;font-size:18px;width:40px;height:40px;color:#5b7469;cursor:pointer}.sf-vector[data-active=false] *{transition:none}@media(prefers-reduced-motion:reduce){.sf-vector *{transition:none}}
`}</style>
      <div className="sf-vector-plane" ref={plane}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-label="Cubic path with two editable control points"
          role="img"
        >
          <path
            d={`M10 75 C${points[0].x} ${points[0].y} ${points[1].x} ${points[1].y} 90 25`}
            fill="none"
            stroke="#22725c"
            strokeWidth="1.15"
          />
          <path
            d={`M10 75 L${points[0].x} ${points[0].y} M90 25 L${points[1].x} ${points[1].y}`}
            stroke="#8eaea2"
            strokeWidth=".4"
            strokeDasharray="1 1"
            fill="none"
          />
          <rect x="8.5" y="73.5" width="3" height="3" fill="#22725c" />
          <rect x="88.5" y="23.5" width="3" height="3" fill="#22725c" />
        </svg>
        {points.map((p, i) => (
          <button
            type="button"
            key={i}
            className="sf-vector-handle"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            aria-label={`Control point ${i + 1}. X ${Math.round(p.x)}, Y ${Math.round(p.y)}. Use arrow keys.`}
            onPointerDown={(e) => {
              drag.current = i
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (drag.current !== i) {
                return
              }
              const r = plane.current!.getBoundingClientRect()
              update(i, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100)
            }}
            onPointerUp={() => {
              drag.current = null
            }}
            onPointerCancel={() => {
              drag.current = null
            }}
            onLostPointerCapture={() => {
              drag.current = null
            }}
            onKeyDown={(e) => {
              if (e.key.startsWith("Arrow")) {
                e.preventDefault()
                const d = e.shiftKey ? 10 : 2
                update(
                  i,
                  p.x + (e.key === "ArrowRight" ? d : e.key === "ArrowLeft" ? -d : 0),
                  p.y + (e.key === "ArrowDown" ? d : e.key === "ArrowUp" ? -d : 0),
                )
              }
            }}
          >
            <i />
          </button>
        ))}
        <output className="sf-vector-coordinates">
          {points.map((p) => `${Math.round(p.x)}, ${Math.round(p.y)}`).join(" / ")}
        </output>
        <button
          type="button"
          className="sf-vector-reset"
          aria-label="Reset path"
          onClick={() =>
            setPoints([
              { x: 25, y: 15 },
              { x: 73, y: 85 },
            ])
          }
        >
          ↺
        </button>
      </div>
    </div>
  )
}
