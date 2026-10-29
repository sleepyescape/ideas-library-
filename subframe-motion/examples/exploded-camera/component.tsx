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

import { useEffect, useId, useState } from "react"

// Every surface uses the same orthographic camera: 35° yaw, 12° elevation.
const yaw = (35 * Math.PI) / 180
const elevation = (12 * Math.PI) / 180
const basis = {
  xx: Math.cos(yaw),
  xy: Math.sin(yaw) * Math.sin(elevation),
  yy: Math.cos(elevation),
  zx: -Math.sin(yaw),
  zy: Math.cos(yaw) * Math.sin(elevation),
}
const project = (x: number, y: number, z: number) => [
  basis.xx * x + basis.zx * z,
  basis.xy * x + basis.yy * y + basis.zy * z,
]
const plane = (x: number, y: number, z: number) => {
  const [tx, ty] = project(x, y, z)
  return `matrix(${basis.xx},${basis.xy},0,${basis.yy},${tx},${ty})`
}
const face = (points: number[][]) => points.map(([x, y, z]) => project(x, y, z).join(",")).join(" ")
const ring = (outer: number, inner: number) =>
  `M${-outer},0a${outer},${outer} 0 1,0 ${outer * 2},0a${outer},${outer} 0 1,0 ${
    -outer * 2
  },0 M${-inner},0a${inner},${inner} 0 1,1 ${inner * 2},0a${inner},${inner} 0 1,1 ${-inner * 2},0`
const irisShape = "M-43 0a43 43 0 1 0 86 0a43 43 0 1 0 -86 0M0 -17l14.72 8.5v17L0 17l-14.72-8.5v-17Z"
const bodyOutline = "-106,-53 -97,-63 97,-63 106,-54 106,54 97,63 -97,63 -106,54"

export default function ExplodedCamera({ active = true }: { active?: boolean }) {
  const uid = useId().replace(/:/g, "")
  const [reduced, setReduced] = useState(true)
  const [instant, setInstant] = useState(false)
  const [exploded, setExploded] = useState(false)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(q.matches)
    sync()
    q.addEventListener("change", sync)
    return () => q.removeEventListener("change", sync)
  }, [])
  const toggle = (detail: number) => {
    if (!active) {
      return
    }
    setInstant(detail === 0)
    setExploded((v) => !v)
  }
  const opticalDepth = exploded ? [12, 144, 276] : [7, 23, 43]
  return (
    <section className="sf-exploded-camera" data-still={!active || reduced || instant} data-open={exploded}>
      <button
        type="button"
        className="ec-object"
        aria-label={exploded ? "Assemble camera" : "Explode camera"}
        aria-pressed={exploded}
        disabled={!active}
        onClick={(e) => toggle(e.detail)}
      >
        <svg viewBox="0 0 600 285" aria-hidden="true">
          <defs>
            <linearGradient id={`${uid}-body`} x1="0" x2=".3" y1="0" y2="1">
              <stop stopColor="#535d60" />
              <stop offset=".44" stopColor="#30383b" />
              <stop offset="1" stopColor="#202729" />
            </linearGradient>
            <linearGradient id={`${uid}-metal`} x1="0" x2=".8" y1="0" y2="1">
              <stop stopColor="#f2f3eb" />
              <stop offset=".32" stopColor="#b2b9b8" />
              <stop offset=".63" stopColor="#687678" />
              <stop offset="1" stopColor="#d6ded9" />
            </linearGradient>
            <linearGradient id={`${uid}-iris`} x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="#737c7c" />
              <stop offset="1" stopColor="#252e32" />
            </linearGradient>
            <radialGradient id={`${uid}-glass`} cx="32%" cy="22%" r="86%">
              <stop stopColor="#86aea5" />
              <stop offset=".43" stopColor="#21434a" />
              <stop offset="1" stopColor="#111e28" />
            </radialGradient>
            <filter id={`${uid}-shadow`} x="-50%" y="-200%" width="200%" height="500%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          <ellipse
            cx="310"
            cy="232"
            rx={exploded ? 157 : 99}
            ry="9"
            fill="#33454a"
            opacity=".16"
            filter={`url(#${uid}-shadow)`}
          />
          <g
            className="ec-part"
            style={{ transform: `translate(${exploded ? 360 : 311}px, ${exploded ? 119 : 137}px)` }}
          >
            <polygon
              points={bodyOutline}
              transform={plane(0, 0, -25)}
              fill="#263135"
              stroke="#566469"
              strokeWidth=".6"
            />
            <polygon
              points={face([
                [-97, -63, 0],
                [-97, -63, -25],
                [97, -63, -25],
                [106, -54, -25],
                [106, -54, 0],
                [97, -63, 0],
              ])}
              fill="#798589"
              stroke="#8e999b"
              strokeWidth=".6"
            />
            <polygon
              points={face([
                [106, -54, 0],
                [106, -54, -25],
                [106, 54, -25],
                [97, 63, -25],
                [97, 63, 0],
                [106, 54, 0],
              ])}
              fill="#394448"
              stroke="#536064"
              strokeWidth=".6"
            />
            <g className="ec-plane" transform={plane(0, 0, 0)}>
              <polygon
                points={bodyOutline}
                fill={`url(#${uid}-body)`}
                stroke="#657276"
                strokeWidth=".7"
                strokeLinejoin="round"
              />
              <rect x="-82" y="-46" width="29" height="14" rx="2" fill="#131e22" stroke="#8e9c9c" strokeWidth=".8" />
              <rect x="-78" y="-42" width="21" height="6" rx="1" fill="#54716f" />
              <circle cx="-12" cy="6" r="47" fill="#172327" stroke="#8d9999" strokeWidth="1.2" />
              <rect x="-33" y="-9" width="42" height="30" rx="1" fill="#496567" />
              <path d="M-32 -8h40" stroke="#819799" strokeWidth=".8" />
            </g>
            {opticalDepth.map((z, i) => (
              <g
                className="ec-part ec-optic"
                data-layer={i}
                key={i}
                style={{ transform: `translate(${basis.zx * z}px,${basis.zy * z}px)` }}
              >
                <g className="ec-plane" transform={plane(-12, 6, -4)}>
                  <path
                    d={i === 1 ? irisShape : ring(49, 40)}
                    fillRule="evenodd"
                    fill="#243236"
                    stroke="#344449"
                    strokeWidth=".5"
                  />
                </g>
                <g className="ec-plane" transform={plane(-12, 6, 0)}>
                  {i === 0 && (
                    <path
                      d={ring(49, 40)}
                      fill={`url(#${uid}-metal)`}
                      fillRule="evenodd"
                      stroke="#d2dad6"
                      strokeWidth=".6"
                    />
                  )}
                  {i === 1 && (
                    <>
                      <path
                        d={irisShape}
                        fill={`url(#${uid}-iris)`}
                        fillRule="evenodd"
                        stroke="#a0acab"
                        strokeWidth=".65"
                      />
                      {[0, 60, 120, 180, 240, 300].map((a) => (
                        <path
                          key={a}
                          d="M0 -17L29 -31"
                          transform={`rotate(${a})`}
                          stroke="#19282c"
                          strokeWidth=".65"
                          opacity=".7"
                        />
                      ))}
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <circle r="49" fill="#273236" stroke="#aab8b6" strokeWidth=".65" />
                      <circle r="42" fill={`url(#${uid}-glass)`} stroke="#6f8e8c" strokeWidth="1" />
                      <path
                        d="M-32 -19A37 37 0 0 1 15 -34"
                        fill="none"
                        stroke="#d0e7de"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        opacity=".65"
                      />
                    </>
                  )}
                </g>
              </g>
            ))}
          </g>
        </svg>
      </button>
      <button
        type="button"
        className="ec-control"
        aria-pressed={exploded}
        disabled={!active}
        onClick={(e) => toggle(e.detail)}
      >
        {exploded ? "Assemble" : "Explode view"}
        <span aria-hidden="true">{exploded ? "−" : "+"}</span>
      </button>
      <style>{`.sf-exploded-camera{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;background:radial-gradient(ellipse at 44% 35%,#f3f5f2,#ced8dd);color:#35464e;font-family:Arial,sans-serif}.sf-exploded-camera *{box-sizing:border-box}.sf-exploded-camera button{touch-action:manipulation;cursor:pointer;color:inherit}.sf-exploded-camera .ec-object{position:absolute;left:0;top:23px;width:100%;height:285px;border:0;padding:0;background:none;outline-offset:-18px}.sf-exploded-camera .ec-object>svg{display:block;width:100%;height:100%;overflow:visible}.sf-exploded-camera .ec-part{transition:transform 600ms cubic-bezier(.22,1,.36,1)}.sf-exploded-camera .ec-control{position:absolute;bottom:21px;left:50%;transform:translateX(-50%);min-width:145px;height:44px;padding:0 17px;border:1px solid #a5b1b7;border-radius:24px;background:linear-gradient(#f8faf8b3,#edf1ef80);box-shadow:0 1px 1px #6b7b8217,inset 0 1px 0 #fff9;display:flex;justify-content:space-between;gap:24px;align-items:center;font:11px Arial,sans-serif}.sf-exploded-camera .ec-control span{font-size:18px;font-weight:300;line-height:1}.sf-exploded-camera .ec-control:active:not(:disabled){background:#c7d2d5}.sf-exploded-camera button:disabled{cursor:default}.sf-exploded-camera button:focus-visible{outline:2px solid #3f606e}.sf-exploded-camera .ec-control:focus-visible{outline-offset:3px}.sf-exploded-camera[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-exploded-camera *{transition:none!important}}`}</style>
    </section>
  )
}
