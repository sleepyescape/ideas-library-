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

type Piece = { x: number; y: number; angle: number }
const initial: Piece[] = [
  { x: 0.3, y: 0.44, angle: -9 },
  { x: 0.59, y: 0.43, angle: 11 },
  { x: 0.51, y: 0.64, angle: -3 },
]
const names = ["Cut form", "Yellow interference", "Type study"]
export default function CollageBoard({ active = true }: { active?: boolean }) {
  const board = useRef<HTMLDivElement>(null)
  const [pieces, setPieces] = useState<Piece[]>(initial)
  const [selected, setSelected] = useState(2)
  const [dragging, setDragging] = useState<number | null>(null)
  const drag = useRef<{
    i: number
    x: number
    y: number
    start: Piece
    w: number
    h: number
    halfX: number
    halfY: number
  } | null>(null)
  useEffect(() => {
    const el = board.current
    if (!el) {
      return
    }
    const observer = new ResizeObserver(() => {
      const b = el.getBoundingClientRect()
      const sizes = Array.from(el.querySelectorAll("button")).map((button) => button.getBoundingClientRect())
      setPieces((p) =>
        p.map((v, i) => {
          const r = sizes[i]
          if (!r || !b.width || !b.height) {
            return v
          }
          const hx = r.width / b.width / 2,
            hy = r.height / b.height / 2
          return { ...v, x: Math.max(hx, Math.min(1 - hx, v.x)), y: Math.max(hy, Math.min(0.88 - hy, v.y)) }
        }),
      )
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  function end() {
    drag.current = null
    setDragging(null)
  }
  function move(i: number, x: number, y: number, hx?: number, hy?: number) {
    const b = board.current?.getBoundingClientRect()
    const r = board.current?.querySelectorAll("button")[i]?.getBoundingClientRect()
    const halfX = hx ?? (b && r ? r.width / b.width / 2 : 0.16)
    const halfY = hy ?? (b && r ? r.height / b.height / 2 : 0.21)
    setPieces((p) =>
      p.map((v, n) =>
        n === i
          ? { ...v, x: Math.max(halfX, Math.min(1 - halfX, x)), y: Math.max(halfY, Math.min(0.88 - halfY, y)) }
          : v,
      ),
    )
  }
  return (
    <section className="sf-collage-board" data-active={active}>
      <div className="sf-cb-top">
        <button
          type="button"
          onClick={() => {
            end()
            setPieces(initial)
          }}
        >
          Reset ↺
        </button>
      </div>
      <div className="sf-cb-workspace" ref={board}>
        {pieces.map((p, i) => (
          <button
            type="button"
            key={i}
            className="sf-cb-piece"
            aria-label={`${names[i]}. Drag to arrange, or use arrow keys. Home resets.`}
            data-selected={selected === i}
            data-dragging={dragging === i}
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              transform: `translate(-50%,-50%) rotate(${p.angle}deg)`,
              zIndex: selected === i ? 5 : i + 1,
            }}
            onPointerDown={(e) => {
              const b = board.current?.getBoundingClientRect()
              if (!b) {
                return
              }
              const size = e.currentTarget.getBoundingClientRect()
              drag.current = {
                i,
                x: e.clientX,
                y: e.clientY,
                start: p,
                w: b.width,
                h: b.height,
                halfX: size.width / b.width / 2,
                halfY: size.height / b.height / 2,
              }
              setSelected(i)
              setDragging(i)
              e.currentTarget.setPointerCapture(e.pointerId)
              e.preventDefault()
              e.currentTarget.focus()
            }}
            onPointerMove={(e) => {
              const d = drag.current
              if (d && d.i === i) {
                move(i, d.start.x + (e.clientX - d.x) / d.w, d.start.y + (e.clientY - d.y) / d.h, d.halfX, d.halfY)
              }
            }}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={end}
            onFocus={() => setSelected(i)}
            onKeyDown={(e) => {
              const x = e.key === "ArrowLeft" ? -0.025 : e.key === "ArrowRight" ? 0.025 : 0,
                y = e.key === "ArrowUp" ? -0.025 : e.key === "ArrowDown" ? 0.025 : 0
              if (x || y) {
                e.preventDefault()
                move(i, p.x + x, p.y + y)
              }
              if (e.key === "Home") {
                e.preventDefault()
                setPieces((v) => v.map((item, n) => (n === i ? initial[i] : item)))
              }
            }}
          >
            {i === 0 ? (
              <svg viewBox="0 0 150 185" aria-hidden="true">
                <rect width="150" height="185" fill="#f6f6f1" />
                <path
                  d="M29 21C58 1 126 24 120 53C118 67 88 62 81 72C75 80 121 101 117 128C112 163 41 174 29 147C18 122 64 115 66 96C69 73 9 54 29 21Z"
                  fill="#151716"
                />
                <path
                  d="M29 43C59 63 120 86 107 117M39 29C69 53 82 119 44 149"
                  fill="none"
                  stroke="#f6f6f1"
                  strokeWidth="2"
                />
                <text x="10" y="175" fill="#151716" fontSize="7" fontFamily="monospace">
                  CUT / FORM
                </text>
              </svg>
            ) : i === 1 ? (
              <svg viewBox="0 0 150 185" aria-hidden="true">
                <rect width="150" height="185" fill="#ffe414" />
                {Array.from({ length: 17 }, (_, j) => (
                  <ellipse
                    key={j}
                    cx="75"
                    cy="87"
                    rx={8 + j * 4.8}
                    ry={9 + j * 4.6}
                    fill="none"
                    stroke="#1a1b17"
                    strokeWidth="2.5"
                    transform={`rotate(${j * 4} 75 87)`}
                  />
                ))}
                <rect x="62" y="0" width="26" height="185" fill="#ffe414" />
                <path d="M64 0V185M87 0V185" stroke="#1a1b17" />
                <text x="9" y="174" fill="#151716" fontSize="7" fontFamily="monospace">
                  INTERFERENCE
                </text>
              </svg>
            ) : (
              <svg viewBox="0 0 150 185" aria-hidden="true">
                <rect width="150" height="185" fill="#141615" />
                <text x="-5" y="84" fill="#f5f5f0" fontFamily="Georgia,serif" fontSize="105" fontStyle="italic">
                  Aa
                </text>
                <text x="-9" y="171" fill="#f5f5f0" fontFamily="Georgia,serif" fontSize="109" fontStyle="italic">
                  Bb
                </text>
                <path d="M0 93H150" stroke="#8c8e88" strokeWidth=".5" />
              </svg>
            )}
          </button>
        ))}
      </div>
      <style>{`.sf-collage-board{width:100%;height:100%;min-height:280px;background:#e1e2df;color:#202220;position:relative;overflow:hidden;font-family:Arial,sans-serif;container-type:inline-size;box-sizing:border-box}.sf-collage-board *{box-sizing:border-box}.sf-cb-top{position:absolute;top:6px;left:22px;right:18px;height:44px;display:flex;justify-content:flex-end;align-items:center;z-index:7}.sf-cb-top strong{font:9px monospace;letter-spacing:.09em}.sf-cb-top button{min-height:44px;background:none;border:0;font:10px monospace;cursor:pointer;color:inherit}.sf-cb-workspace{position:absolute;inset:51px 0 0}.sf-cb-piece{width:clamp(100px,27cqw,151px);aspect-ratio:150/185;border:0;padding:0;position:absolute;cursor:grab;touch-action:none;background:none;box-shadow:0 2px 3px #1d201927,0 10px 12px #1d20191b;transition:box-shadow 140ms ease}.sf-cb-piece svg{width:100%;height:100%;display:block;pointer-events:none}.sf-cb-piece[data-dragging=true]{cursor:grabbing;box-shadow:0 3px 6px #1d201934,0 16px 22px #1d20192b}.sf-cb-piece:focus-visible{outline:2px solid #252825;outline-offset:5px}.sf-cb-top button:focus-visible{outline:2px solid #252825;outline-offset:2px}.sf-cb-caption{position:absolute;left:22px;bottom:13px;font:9px monospace;pointer-events:none}.sf-collage-board[data-active=false] .sf-cb-piece{transition:none}@media(prefers-reduced-motion:reduce){.sf-cb-piece{transition:none}}`}</style>
    </section>
  )
}
