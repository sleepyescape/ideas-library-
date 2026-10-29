/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/progressive-blur.tsx
 * Standalone composition; inline styles and artwork; bounded motion and reduced-motion behavior.
 *
 * MIT License
 *
 * Copyright (c) 2024 ibelick
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

import { useId, useState } from "react"

export default function ProgressiveBlur({ active = true }: { active?: boolean }) {
  const id = useId()
  const [intensity, setIntensity] = useState(2)
  const layers = 8
  const segmentSize = 1 / (layers + 1)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        background: "#d9e2e3",
        color: "#4b6368",
        padding: 24,
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    >
      <style>{`@keyframes sf-progressive-blur-drift { 50% { transform: translateY(-7px) rotate(4deg); } } .sf-progressive-blur-art { animation: sf-progressive-blur-drift 10s ease-in-out infinite; } @media (prefers-reduced-motion: reduce) { .sf-progressive-blur-art { animation: none; } }`}</style>
      <div style={{ width: 290, maxWidth: "100%" }}>
        <div style={{ position: "relative", height: 172, overflow: "hidden", borderRadius: 12, background: "#eaf0ed" }}>
          <svg
            aria-hidden="true"
            className="sf-progressive-blur-art"
            viewBox="0 0 300 190"
            style={{ width: "100%", height: "100%", animationPlayState: active ? "running" : "paused" }}
          >
            {Array.from({ length: 9 }, (_, index) => (
              <rect
                key={index}
                x={28 + index * 23}
                y={28 + Math.sin(index * 0.7) * 12}
                width="15"
                height="132"
                rx="7.5"
                fill={index % 2 ? "#a7b9b5" : "#607f81"}
                transform={`rotate(-8 ${35 + index * 23} 94)`}
              />
            ))}
          </svg>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {Array.from({ length: layers }, (_, index) => {
              const stops = [
                index * segmentSize,
                (index + 1) * segmentSize,
                (index + 2) * segmentSize,
                (index + 3) * segmentSize,
              ].map((position, stop) => `rgba(255,255,255,${stop === 1 || stop === 2 ? 1 : 0}) ${position * 100}%`)
              const gradient = `linear-gradient(180deg, ${stops.join(", ")})`
              return (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    inset: 0,
                    maskImage: gradient,
                    WebkitMaskImage: gradient,
                    backdropFilter: `blur(${index * intensity}px)`,
                    WebkitBackdropFilter: `blur(${index * intensity}px)`,
                  }}
                />
              )
            })}
          </div>
        </div>
        <label htmlFor={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 14 }}>
          <span>Let the edges soften.</span>
          <span style={{ color: "#526264", fontVariantNumeric: "tabular-nums" }}>{Math.round(intensity * 7)}px</span>
        </label>
        <input
          id={id}
          aria-label="Progressive blur intensity"
          type="range"
          min={0}
          max={2.5}
          step={0.1}
          value={intensity}
          onChange={(event) => setIntensity(Number(event.target.value))}
          style={{ width: "100%", margin: 0, height: 44, accentColor: "#69878b", cursor: "pointer" }}
        />
      </div>
    </div>
  )
}
