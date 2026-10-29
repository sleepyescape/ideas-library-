/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/animated-grid-pattern.tsx
 * Retains the upstream SVG line pattern, measured grid, independently fading cells and relocation after each complete fade cycle. CSS opacity keyframes replace Motion; deterministic positions, bounded count and static reduced-motion treatment.
 *
 * MIT License
 *
 * Copyright (c) Magic UI
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

import { type CSSProperties, useEffect, useId, useRef, useState } from "react"

const cellSize = 36
function makeCells(width: number, height: number) {
  const columns = Math.max(1, Math.floor(width / cellSize))
  const rows = Math.max(1, Math.floor(height / cellSize))
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: ((i * 7 + 2) % columns) * cellSize + 1,
    y: ((i * 3 + 1) % rows) * cellSize + 1,
  }))
}

export default function AnimatedGridPattern({ active = true }: { active?: boolean }) {
  const [paused, setPaused] = useState(false)
  const [cells, setCells] = useState(() => makeCells(324, 252))
  const dimensions = useRef({ width: 324, height: 252 })
  const iterations = useRef(0)
  const container = useRef<SVGSVGElement>(null)
  const id = useId().replace(/:/g, "")
  useEffect(() => {
    const element = container.current
    if (!element) {
      return
    }
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!width || !height) {
        return
      }
      dimensions.current = { width, height }
      setCells(makeCells(width, height))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  function relocate(cellId: number) {
    const { width, height } = dimensions.current
    iterations.current += 1
    const step = iterations.current
    const columns = Math.max(1, Math.floor(width / cellSize))
    const rows = Math.max(1, Math.floor(height / cellSize))
    setCells((current) =>
      current.map((cell) =>
        cell.id === cellId
          ? {
              ...cell,
              x: ((cellId * 7 + step * 5) % columns) * cellSize + 1,
              y: ((cellId * 3 + step * 2) % rows) * cellSize + 1,
            }
          : cell,
      ),
    )
  }
  return (
    <div className="mg-gridpattern" data-running={active && !paused}>
      <style>{`
        .mg-gridpattern{height:100%;width:100%;min-height:250px;display:grid;place-content:center;position:relative;overflow:hidden;background:#e7e9ef;color:#4e5a72;font-family:inherit;text-align:center}
        .mg-gridpattern .mg-gridpattern-grid{position:absolute;inset:0;width:100%;height:100%;color:#91a0b8;mask-image:radial-gradient(ellipse at center,#000,transparent 85%);pointer-events:none}
        .mg-gridpattern .mg-gridpattern-cell{animation:mg-gridpattern-fade 7s ease-in-out infinite;animation-delay:var(--delay);opacity:0}
        .mg-gridpattern .mg-gridpattern-pause{position:absolute;right:12px;bottom:0;min-height:44px;padding:0 8px;font:inherit;font-size:10px;border:0;background:none;color:#4d5668;cursor:pointer}
        .mg-gridpattern[data-running="false"] .mg-gridpattern-cell{animation-play-state:paused}
        @keyframes mg-gridpattern-fade{0%,100%{opacity:0}45%,55%{opacity:.3}}
        @media(prefers-reduced-motion:reduce){.mg-gridpattern .mg-gridpattern-cell{animation:none;opacity:.12}}
      `}</style>
      <svg className="mg-gridpattern-grid" ref={container} aria-hidden="true">
        <defs>
          <pattern id={id} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <path d={`M.5 ${cellSize}V.5H${cellSize}`} fill="none" stroke="currentColor" strokeOpacity=".25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
        {cells.map((cell) => (
          <rect
            className="mg-gridpattern-cell"
            key={cell.id}
            width={cellSize - 1}
            height={cellSize - 1}
            x={cell.x}
            y={cell.y}
            fill="currentColor"
            style={{ "--delay": `${-cell.id * 0.37}s` } as CSSProperties}
            onAnimationIteration={() => relocate(cell.id)}
          />
        ))}
      </svg>
      <button className="mg-gridpattern-pause" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? "Play grid" : "Pause grid"}
      </button>
    </div>
  )
}
