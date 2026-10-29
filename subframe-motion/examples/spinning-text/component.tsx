/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/spinning-text.tsx
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

const text = "TAKE YOUR TIME · MAKE IT MATTER · "

export default function SpinningText({ active = true }: { active?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        background: "#e9e3d2",
        color: "#6a6142",
        fontFamily: "inherit",
      }}
    >
      <style>{`@keyframes sf-spinning-text-turn { to { transform: rotate(360deg); } } .sf-spinning-text-ring { animation: sf-spinning-text-turn 28s linear infinite; } @media (prefers-reduced-motion: reduce) { .sf-spinning-text-ring { animation: none; } }`}</style>
      <div style={{ position: "relative", width: 194, height: 194 }}>
        <div
          aria-label={text}
          className="sf-spinning-text-ring"
          style={{ position: "absolute", inset: 0, animationPlayState: active ? "running" : "paused" }}
        >
          {Array.from(text, (letter, index) => (
            <span
              key={index}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                display: "inline-block",
                fontSize: 10,
                fontWeight: 500,
                transform: `translate(-50%, -50%) rotate(${(360 / text.length) * index}deg) translateY(-80px)`,
                transformOrigin: "center",
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 80 80"
          fill="none"
          stroke="#9c8f60"
          strokeWidth="1"
          style={{ position: "absolute", width: 64, height: 64, top: 65, left: 65 }}
        >
          {[0, 45, 90, 135].map((angle) => (
            <ellipse key={angle} cx="40" cy="40" rx="12" ry="29" transform={`rotate(${angle} 40 40)`} />
          ))}
          <circle cx="40" cy="40" r="3" fill="#9c8f60" />
        </svg>
      </div>
    </div>
  )
}
