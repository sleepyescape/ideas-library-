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

function useCalm(active: boolean) {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])
  return reduced || !active
}

export default function ReliefBoard({ active = true }: { active?: boolean }) {
  const calm = useCalm(active),
    [selected, setSelected] = useState(24),
    [hover, setHover] = useState<number | null>(null),
    [instant, setInstant] = useState(false),
    focus = hover ?? selected
  return (
    <section className="sf-relief-board" data-calm={calm || instant} aria-label="Interactive elevation study">
      <style>{`.sf-relief-board{width:100%;height:100%;min-height:280px;background:#18259c;color:#f5f1d7;position:relative;font-family:Arial,sans-serif;overflow:hidden}.sf-relief-board svg{display:block;width:100%;height:100%;touch-action:manipulation}.sf-relief-board .rb-column{transition:transform 300ms cubic-bezier(.22,1,.36,1)}.sf-relief-board .rb-hit{cursor:pointer;outline:none}.sf-relief-board .rb-hit:focus-visible .rb-top{stroke:#ffdf30;stroke-width:3}.sf-relief-board[data-calm=true] .rb-column{transition:none}.sf-relief-board header,.sf-relief-board footer{position:absolute;left:20px;right:20px;display:flex;justify-content:space-between;font-size:10px;letter-spacing:.13em;pointer-events:none}.sf-relief-board header{top:17px}.sf-relief-board footer{bottom:18px}.sf-relief-board footer strong{font-weight:400;color:#f4df3d}`}</style>
      <svg
        viewBox="0 0 600 360"
        onPointerLeave={() => setHover(null)}
        aria-label="Choose one of 49 elevation points"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") {
            return
          }
          const rect = e.currentTarget.getBoundingClientRect()
          const scale = Math.min(rect.width / 600, rect.height / 360)
          const x = (e.clientX - rect.left - (rect.width - 600 * scale) / 2) / scale
          const y = (e.clientY - rect.top - (rect.height - 360 * scale) / 2) / scale
          const col = Math.max(0, Math.min(6, Math.round(((x - 300) / 32 + (y - 126) / 15) / 2)))
          const row = Math.max(0, Math.min(6, Math.round(((y - 126) / 15 - (x - 300) / 32) / 2)))
          setInstant(false)
          setHover(row * 7 + col)
        }}
      >
        {Array.from({ length: 49 }, (_, i) => {
          const row = Math.floor(i / 7),
            col = i % 7,
            x = 300 + (col - row) * 32,
            y = 126 + (col + row) * 15,
            d = Math.hypot(col - (focus % 7), row - Math.floor(focus / 7)),
            height = 10 + Math.exp((-d * d) / 4.4) * 65
          return (
            <g
              className="rb-hit"
              key={i}
              transform={`translate(${x},${y})`}
              role="button"
              tabIndex={i === selected ? 0 : -1}
              aria-label={`Elevation point ${row + 1}, ${col + 1}`}
              aria-pressed={i === selected}
              onClick={(e) => {
                setInstant(e.detail === 0)
                setSelected(i)
              }}
              onKeyDown={(e) => {
                let n = i
                if (e.key === "ArrowRight") {
                  n = Math.min(48, i + 1)
                } else if (e.key === "ArrowLeft") {
                  n = Math.max(0, i - 1)
                } else if (e.key === "ArrowDown") {
                  n = Math.min(48, i + 7)
                } else if (e.key === "ArrowUp") {
                  n = Math.max(0, i - 7)
                } else if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setSelected(i)
                  setInstant(true)
                  return
                } else {
                  return
                }
                e.preventDefault()
                setInstant(true)
                setHover(null)
                setSelected(n)
                const groups = e.currentTarget.parentElement?.querySelectorAll<SVGGElement>(".rb-hit")
                groups?.[n]?.focus()
              }}
            >
              <path d="M0 0L30 14L0 28L-30 14Z" fill="#101a76" />
              <g className="rb-column" style={{ transform: `translateY(${-height}px)` }}>
                <path d={`M-29 14L0 28L0 ${28 + height}L-29 ${14 + height}Z`} fill="#9498b0" />
                <path d={`M0 28L29 14L29 ${14 + height}L0 ${28 + height}Z`} fill="#c5c9d3" />
                <path
                  className="rb-top"
                  d="M0 0L29 14L0 28L-29 14Z"
                  fill={i === focus ? "#f4df3d" : "#f2f1e9"}
                  stroke="#19236c"
                  strokeWidth=".7"
                />
                {i === selected && <path d="M-5 14H5M0 9V19" stroke="#18259c" strokeWidth="1.5" />}
              </g>
            </g>
          )
        })}
      </svg>
      <footer>
        <span aria-hidden="true">7 × 7</span>
        <strong>
          POINT {String(Math.floor(focus / 7) + 1).padStart(2, "0")}.{String((focus % 7) + 1).padStart(2, "0")}
        </strong>
      </footer>
    </section>
  )
}
