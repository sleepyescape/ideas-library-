/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/animated-beam.tsx
 * Retains measured element-center quadratic paths, ResizeObserver updates and a traveling four-stop SVG gradient. Native SVG animation replaces Motion; adds explicit pause, bounded geometry and reduced-motion still frame.
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

import { useEffect, useId, useRef, useState } from "react"

export default function AnimatedBeam({ active = true }: { active?: boolean }) {
  const [paused, setPaused] = useState(false)
  const [geometry, setGeometry] = useState({ width: 300, height: 174, paths: [] as string[] })
  const container = useRef<HTMLDivElement>(null)
  const target = useRef<HTMLDivElement>(null)
  const sources = useRef<Array<HTMLDivElement | null>>([])
  const svg = useRef<SVGSVGElement>(null)
  const id = useId().replace(/:/g, "")
  useEffect(() => {
    const element = container.current
    if (!element) {
      return
    }
    function updatePath() {
      const box = element!.getBoundingClientRect()
      const end = target.current?.getBoundingClientRect()
      if (!end || !box.width || !box.height) {
        return
      }
      const width = element!.offsetWidth,
        height = element!.offsetHeight,
        scaleX = width / box.width,
        scaleY = height / box.height
      const endX = (end.left - box.left + end.width / 2) * scaleX
      const endY = (end.top - box.top + end.height / 2) * scaleY
      const paths = sources.current.map((source) => {
        const rect = source!.getBoundingClientRect()
        const startX = (rect.left - box.left + rect.width / 2) * scaleX
        const startY = (rect.top - box.top + rect.height / 2) * scaleY
        return `M ${startX},${startY} Q ${(startX + endX) / 2},${startY} ${endX},${endY}`
      })
      setGeometry({ width, height, paths })
    }
    const observer = new ResizeObserver(updatePath)
    observer.observe(element)
    updatePath()
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    function sync() {
      const element = svg.current
      if (!element) {
        return
      }
      if (!active || paused || media.matches) {
        element.pauseAnimations()
        if (media.matches) {
          element.setCurrentTime(1.4)
        }
      } else {
        element.unpauseAnimations()
      }
    }
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [active, paused])
  return (
    <div className="mg-beam">
      <style>{`
        .mg-beam{width:100%;height:100%;min-height:260px;display:grid;place-content:center;justify-items:center;position:relative;background:#edf0e5;color:#465342;font-family:inherit}
        .mg-beam .mg-beam-scene{position:relative;width:min(300px,calc(100vw - 72px));height:174px;display:flex;justify-content:space-between;align-items:center;box-sizing:border-box;padding:0 20px}
        .mg-beam .mg-beam-sources{display:flex;flex-direction:column;gap:16px}.mg-beam .mg-beam-node{position:relative;z-index:1;width:50px;height:40px;display:grid;place-items:center;border:1px solid #c6ceb8;border-radius:11px;background:#f9faf3;color:#697458;font-size:10px;box-shadow:0 4px 8px #40513408}.mg-beam .mg-beam-target{width:69px;height:69px;border-radius:20px;background:#516148;border-color:#677757;color:#f1f6e8;font-size:12px}
        .mg-beam .mg-beam-lines{position:absolute;inset:0;pointer-events:none;overflow:visible}
        .mg-beam .mg-beam-pause{position:absolute;right:12px;bottom:0;min-height:44px;padding:0 8px;font:inherit;font-size:10px;border:0;background:none;color:#5f6a57;cursor:pointer}
        @media(prefers-reduced-motion:reduce){.mg-beam .mg-beam-pause{display:none}}
      `}</style>
      <div
        className="mg-beam-scene"
        ref={container}
        role="img"
        aria-label="Words, shapes and ideas connect into one story"
      >
        <svg
          ref={svg}
          className="mg-beam-lines"
          aria-hidden="true"
          width={geometry.width}
          height={geometry.height}
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
          fill="none"
        >
          <defs>
            {geometry.paths.map((_, i) => (
              <linearGradient key={i} id={`${id}-${i}`} gradientUnits="userSpaceOnUse" x1="10%" x2="0%" y1="0%" y2="0%">
                <animate
                  attributeName="x1"
                  values="10%;110%"
                  dur="4s"
                  begin={`${i * 0.7}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.16 1 0.3 1"
                />
                <animate
                  attributeName="x2"
                  values="0%;100%"
                  dur="4s"
                  begin={`${i * 0.7}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.16 1 0.3 1"
                />
                <stop stopColor="#d6be80" stopOpacity="0" />
                <stop stopColor="#d6be80" />
                <stop offset="32.5%" stopColor="#849f6a" />
                <stop offset="100%" stopColor="#849f6a" stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {geometry.paths.map((path, i) => (
            <g key={i}>
              <path d={path} stroke="#c4cebb" strokeWidth="1" />
              <path d={path} stroke={`url(#${id}-${i})`} strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
        </svg>
        <div className="mg-beam-sources">
          {["Words", "Shapes", "Ideas"].map((label, i) => (
            <div
              key={label}
              className="mg-beam-node"
              ref={(node) => {
                sources.current[i] = node
              }}
              aria-hidden="true"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="mg-beam-node mg-beam-target" ref={target} aria-hidden="true">
          A story
        </div>
      </div>
      <button className="mg-beam-pause" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? "Play connections" : "Pause connections"}
      </button>
    </div>
  )
}
