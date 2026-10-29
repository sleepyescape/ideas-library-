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
// Solve the eight projective coefficients from four point correspondences.
function matrix(points: Point[]) {
  const source = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ],
    a: number[][] = []
  points.forEach((p, i) => {
    const [x, y] = source[i]
    a.push([x, y, 1, 0, 0, 0, -p.x * x, -p.x * y, p.x], [0, 0, 0, x, y, 1, -p.y * x, -p.y * y, p.y])
  })
  for (let col = 0; col < 8; col++) {
    let pivot = col
    for (let row = col + 1; row < 8; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) {
        pivot = row
      }
    }
    ;[a[col], a[pivot]] = [a[pivot], a[col]]
    const d = a[col][col]
    if (Math.abs(d) < 1e-8) {
      return [1, 0, 0, 0, 1, 0, 0, 0]
    }
    for (let k = col; k < 9; k++) {
      a[col][k] /= d
    }
    for (let row = 0; row < 8; row++) {
      if (row === col) {
        continue
      }
      const f = a[row][col]
      for (let k = col; k < 9; k++) {
        a[row][k] -= f * a[col][k]
      }
    }
  }
  return a.map((r) => r[8])
}

// A moved corner stays inside the intersection of the four positive-turn half-planes.
// The area margin also keeps the homography away from a nearly collapsed edge.
function moveCorner(points: Point[], index: number, x: number, y: number) {
  const candidate = points.map((point, i) =>
    i === index
      ? {
          x: Math.max(i === 0 || i === 3 ? 140 : 335, Math.min(i === 0 || i === 3 ? 265 : 465, x)),
          y: Math.max(i < 2 ? 30 : 225, Math.min(i < 2 ? 135 : 335, y)),
        }
      : point,
  )
  const turn = (quad: Point[], i: number) => {
    const a = quad[i],
      b = quad[(i + 1) % 4],
      c = quad[(i + 2) % 4]
    return (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)
  }
  const minimumTurnArea = 4000
  let travel = 1
  for (let i = 0; i < 4; i++) {
    const from = turn(points, i),
      to = turn(candidate, i)
    if (to < minimumTurnArea) {
      travel = Math.min(travel, Math.max(0, (from - minimumTurnArea) / (from - to)))
    }
  }
  if (travel < 1) {
    travel = Math.max(0, travel - 1e-9)
  }
  return points.map((point, i) =>
    i === index
      ? {
          x: point.x + (candidate[i].x - point.x) * travel,
          y: point.y + (candidate[i].y - point.y) * travel,
        }
      : point,
  )
}

// Clip in source space: artwork beyond the sheet can cross a projective horizon
// even when the visible target quadrilateral is convex.
function clipArtwork(polygon: number[][]) {
  let clipped = polygon
  for (const [axis, edge, direction] of [
    [0, 0, 1],
    [0, 100, -1],
    [1, 0, 1],
    [1, 100, -1],
  ]) {
    const input = clipped
    clipped = []
    if (!input.length) {
      break
    }
    let previous = input[input.length - 1]
    let previousDistance = direction * (previous[axis] - edge)
    for (const point of input) {
      const distance = direction * (point[axis] - edge)
      if (distance >= 0 !== previousDistance >= 0) {
        const fraction = previousDistance / (previousDistance - distance)
        clipped.push([
          previous[0] + (point[0] - previous[0]) * fraction,
          previous[1] + (point[1] - previous[1]) * fraction,
        ])
      }
      if (distance >= 0) {
        clipped.push(point)
      }
      previous = point
      previousDistance = distance
    }
  }
  return clipped
}

const wall = [
  { x: 102, y: 0 },
  { x: 600, y: 47 },
  { x: 600, y: 375 },
  { x: 107, y: 311 },
]
const wallMatrix = matrix(wall)
const fitted = [
  [19, 14],
  [65, 14],
  [65, 87],
  [19, 87],
].map(([x, y]) => {
  const d = wallMatrix[6] * x + wallMatrix[7] * y + 1
  return {
    x: (wallMatrix[0] * x + wallMatrix[1] * y + wallMatrix[2]) / d,
    y: (wallMatrix[3] * x + wallMatrix[4] * y + wallMatrix[5]) / d,
  }
})
const glyphs: Record<string, number[][][]> = {
  O: [
    [
      [3, 0],
      [13, 0],
      [16, 3],
      [16, 22],
      [13, 25],
      [3, 25],
      [0, 22],
      [0, 3],
    ],
    [
      [5, 5],
      [5, 20],
      [11, 20],
      [11, 5],
    ],
  ],
  P: [
    [
      [0, 0],
      [13, 0],
      [16, 3],
      [16, 12],
      [13, 15],
      [5, 15],
      [5, 25],
      [0, 25],
    ],
    [
      [5, 5],
      [5, 10],
      [11, 10],
      [11, 5],
    ],
  ],
  E: [
    [
      [0, 0],
      [16, 0],
      [16, 5],
      [5, 5],
      [5, 10],
      [13, 10],
      [13, 15],
      [5, 15],
      [5, 20],
      [16, 20],
      [16, 25],
      [0, 25],
    ],
  ],
  N: [
    [
      [0, 0],
      [5, 0],
      [11, 14],
      [11, 0],
      [16, 0],
      [16, 25],
      [11, 25],
      [5, 11],
      [5, 25],
      [0, 25],
    ],
  ],
  F: [
    [
      [0, 0],
      [16, 0],
      [16, 5],
      [5, 5],
      [5, 10],
      [13, 10],
      [13, 15],
      [5, 15],
      [5, 25],
      [0, 25],
    ],
  ],
  R: [
    [
      [0, 0],
      [13, 0],
      [16, 3],
      [16, 12],
      [12, 15],
      [17, 25],
      [11, 25],
      [6, 15],
      [5, 15],
      [5, 25],
      [0, 25],
    ],
    [
      [5, 5],
      [5, 10],
      [11, 10],
      [11, 5],
    ],
  ],
  M: [
    [
      [0, 0],
      [5, 0],
      [9, 9],
      [13, 0],
      [18, 0],
      [18, 25],
      [13, 25],
      [13, 12],
      [9, 20],
      [5, 12],
      [5, 25],
      [0, 25],
    ],
  ],
}
export default function PerspectivePin({ active = true }: { active?: boolean }) {
  const [points, setPoints] = useState(fitted)
  const id = useId(),
    stage = useRef<HTMLDivElement>(null),
    drag = useRef<{ corner: number; pointer: number; dx: number; dy: number } | null>(null)
  const h = matrix(points)
  const project = (x: number, y: number) => {
    const d = h[6] * x + h[7] * y + 1
    return { x: (h[0] * x + h[1] * y + h[2]) / d, y: (h[3] * x + h[4] * y + h[5]) / d }
  }
  const path = (ps: number[][]) => {
    const clipped = clipArtwork(ps)
    if (clipped.length < 3) {
      return ""
    }
    return (
      clipped
        .map(([x, y], i) => {
          const p = project(x, y)
          return `${i ? "L" : "M"}${p.x},${p.y}`
        })
        .join(" ") + "Z"
    )
  }
  const ring = (r: number) =>
    Array.from({ length: 129 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2
      return [50 + Math.cos(a) * r, 99 + Math.sin(a) * r]
    })
  const changed = points.some((p, i) => Math.abs(p.x - fitted[i].x) + Math.abs(p.y - fitted[i].y) > 0.1)
  const update = (i: number, x: number, y: number) => setPoints((ps) => moveCorner(ps, i, x, y))
  return (
    <div className="sf-cornerpin" data-active={active} ref={stage}>
      <svg
        className="sf-cornerpin-art"
        viewBox="0 0 600 375"
        aria-label="Original Open Form poster fitted to an oblique concrete wall"
        role="img"
      >
        <defs>
          <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2=".5">
            <stop stopColor="#c7c8c4" />
            <stop offset=".3" stopColor="#e6e7e1" />
            <stop offset="1" stopColor="#abada5" />
          </linearGradient>
          <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#8f958b" />
            <stop offset="1" stopColor="#bcc0b5" />
          </linearGradient>
          <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2=".7">
            <stop stopColor="#fff" stopOpacity=".1" />
            <stop offset="1" stopColor="#0c2000" stopOpacity=".18" />
          </linearGradient>
          <clipPath id={`${id}-print`}>
            <path
              d={path([
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100],
              ])}
            />
          </clipPath>
          <filter id={`${id}-texture`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" seed="8" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope=".08" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        <rect width="600" height="375" fill="#b5b9b1" />
        <path d="M102 0 600 47V375L107 311Z" fill={`url(#${id}-wall)`} />
        <path d="M0 355 107 311 600 375H0Z" fill={`url(#${id}-floor)`} />
        <path d="M102 0 107 311 0 355V0Z" fill="#888e85" />
        <path
          d="m105 115 495 53m-494 32 494 59M104 0l3 311M307 19l-1 318m206-299-8 324"
          fill="none"
          stroke="#727b68"
          strokeOpacity=".23"
          strokeWidth="1"
        />
        <path d="m109 0 1 312 490 63" stroke="#ffffff" strokeOpacity=".3" fill="none" />
        <g opacity=".35" fill="#757d70">
          {[
            [137, 59],
            [139, 258],
            [336, 88],
            [334, 283],
            [553, 113],
            [549, 315],
          ].map(([x, y]) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx="3" ry="2.4" />
              <path d={`M${x - 2} ${y + 2}h4`} stroke="#f8f9f2" strokeWidth=".7" />
            </g>
          ))}
        </g>
        <rect width="600" height="375" fill="transparent" filter={`url(#${id}-texture)`} />
        <polygon
          points={fitted.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="#3a422c"
          opacity=".18"
          stroke="#586044"
          strokeWidth="1"
          strokeDasharray={changed ? "4 4" : undefined}
        />
        <path
          d={path([
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
          ])}
          fill="#1b2b11"
          opacity=".22"
          transform="translate(2 3)"
        />
        <path
          d={path([
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
          ])}
          fill="#d9fa31"
        />
        <g clipPath={`url(#${id}-print)`} fill="#182212">
          {["OPEN", "FORM"].map((word, row) =>
            Array.from(word).map((letter, i) => (
              <path
                key={`${word}-${i}`}
                fillRule="evenodd"
                d={glyphs[letter].map((p) => path(p.map(([x, y]) => [x + 11 + i * 20, y + 9 + row * 30]))).join(" ")}
              />
            )),
          )}
          <path d={path(ring(28)) + " " + path(ring(18))} fillRule="evenodd" />
          <path
            d={path([
              [45, 70],
              [55, 70],
              [55, 100],
              [45, 100],
            ])}
          />
          <path
            d={path([
              [7, 4],
              [93, 4],
              [93, 4.35],
              [7, 4.35],
            ])}
          />
        </g>
        <path
          d={path([
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
          ])}
          fill={`url(#${id}-shade)`}
        />
        <path
          d={path([
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
          ])}
          fill="none"
          stroke="#eef3bc"
          strokeWidth=".6"
        />
      </svg>
      {points.map((p, i) => (
        <button
          key={i}
          type="button"
          className="sf-cornerpin-handle"
          style={{ left: `${p.x / 6}%`, top: `${p.y / 3.75}%` }}
          aria-label={`${
            ["Top left", "Top right", "Bottom right", "Bottom left"][i]
          } poster corner. Drag or use arrow keys.`}
          onPointerDown={(e) => {
            if (e.button !== 0 || drag.current) {
              return
            }
            e.preventDefault()
            e.currentTarget.focus()
            const r = stage.current!.getBoundingClientRect()
            drag.current = {
              corner: i,
              pointer: e.pointerId,
              dx: p.x - ((e.clientX - r.left) / r.width) * 600,
              dy: p.y - ((e.clientY - r.top) / r.height) * 375,
            }
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (drag.current?.corner !== i || drag.current.pointer !== e.pointerId) {
              return
            }
            const r = stage.current!.getBoundingClientRect()
            update(
              i,
              ((e.clientX - r.left) / r.width) * 600 + drag.current.dx,
              ((e.clientY - r.top) / r.height) * 375 + drag.current.dy,
            )
          }}
          onPointerUp={(event) => {
            if (drag.current?.pointer !== event.pointerId) {
              return
            }
            drag.current = null
          }}
          onPointerCancel={(event) => {
            if (drag.current?.pointer !== event.pointerId) {
              return
            }
            drag.current = null
          }}
          onLostPointerCapture={(event) => {
            if (drag.current?.pointer !== event.pointerId) {
              return
            }
            drag.current = null
          }}
          onKeyDown={(e) => {
            if (e.key.startsWith("Arrow")) {
              e.preventDefault()
              const step = e.shiftKey ? 10 : 2
              update(
                i,
                p.x + (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0),
                p.y + (e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0),
              )
            }
            if (e.key === "Escape") {
              setPoints(fitted)
              drag.current = null
            }
          }}
        >
          <i aria-hidden="true" />
        </button>
      ))}
      <button
        className="sf-cornerpin-fit"
        type="button"
        onClick={() => setPoints(fitted)}
        aria-label="Fit poster to wall"
      >
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 7V3h4m6 0h4v4M3 13v4h4m6 0h4v-4M6 6h8v8H6Z" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        Fit to wall
      </button>
      <style>{`
.sf-cornerpin{width:100%;height:100%;position:relative;overflow:hidden;background:#c2c5b9;font-family:Arial,sans-serif}.sf-cornerpin *{box-sizing:border-box}.sf-cornerpin-art{display:block;position:absolute;inset:0;width:100%;height:100%}.sf-cornerpin-handle{position:absolute;transform:translate(-50%,-50%);width:74px;height:74px;border:0;background:transparent;padding:0;cursor:move;touch-action:none}.sf-cornerpin-handle i{position:absolute;width:9px;height:9px;left:calc(50% - 4.5px);top:calc(50% - 4.5px);background:#fbfff6;border:1.5px solid #284bfe;box-shadow:0 1px 3px #0005;border-radius:50%}.sf-cornerpin-handle:focus-visible{outline:1px solid #244cff;outline-offset:-15px;border-radius:20px}.sf-cornerpin-fit{position:absolute;left:27px;bottom:24px;display:flex;gap:8px;align-items:center;height:44px;padding:0 13px;border:1px solid #f9faf3aa;background:#f5f7edee;color:#333e2d;border-radius:6px;box-shadow:0 2px 4px #2030101a;font-size:11px;cursor:pointer;transition:background 120ms ease,transform 120ms ease}.sf-cornerpin-fit:active{transform:scale(.97)}.sf-cornerpin-fit:focus-visible{outline:2px solid #244cff;outline-offset:3px}@media(hover:hover){.sf-cornerpin-fit:hover{background:#fff}}.sf-cornerpin[data-active=false] *{transition:none}@media(prefers-reduced-motion:reduce){.sf-cornerpin *{transition:none}}
`}</style>
    </div>
  )
}
