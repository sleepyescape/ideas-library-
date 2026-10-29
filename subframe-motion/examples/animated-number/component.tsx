/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/animated-number.tsx
 * Stable component identity; fixed locale formatting; bounded manual sample values; target-only screen-reader announcements; immediate reduced-motion values.
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

import { motion, useSpring, useTransform } from "motion/react"
import { useEffect, useState } from "react"

// Read after hydration; subscribe so an OS preference change updates this instance.
function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null)
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return reduced
}

const values = [12840, 16320, 24960, 18720]
const numberFormat = new Intl.NumberFormat("en-US")

export default function AnimatedNumber({ active = true }: { active?: boolean }) {
  const reduceMotion = useReducedMotion()
  const canAnimate = active && reduceMotion === false
  const [index, setIndex] = useState(0)
  const value = values[index]
  const spring = useSpring(value, { stiffness: 180, damping: 26, mass: 0.7, restDelta: 0.5, restSpeed: 1 })
  const display = useTransform(spring, (current) => numberFormat.format(Math.round(current)))

  useEffect(() => {
    if (canAnimate) {
      spring.set(value)
    } else {
      spring.jump(value)
    }
  }, [value, canAnimate, spring])

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 240,
        display: "grid",
        placeItems: "center",
        background: "#f5f3ee",
        color: "#30312b",
        fontFamily: "inherit",
      }}
    >
      <div style={{ width: 238, maxWidth: "calc(100% - 48px)" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, color: "#6d7061", fontSize: 12 }}
        >
          <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: "50%", background: "#a2ab88" }} />
          Monthly views
        </div>
        <output
          aria-live="polite"
          style={{
            display: "block",
            marginBottom: 14,
            fontSize: 52,
            lineHeight: 1.1,
            fontWeight: 400,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.06em",
          }}
        >
          <span
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clipPath: "inset(50%)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            {numberFormat.format(value)} monthly views
          </span>
          <motion.span aria-hidden="true">{display}</motion.span>
        </output>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderTop: "1px solid #e3e1d8",
            paddingTop: 5,
          }}
        >
          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % values.length)}
            aria-label="Update monthly views"
            style={{
              width: 44,
              height: 44,
              padding: 0,
              display: "grid",
              placeItems: "center",
              border: 0,
              borderRadius: 8,
              background: "transparent",
              color: "#5b6150",
              cursor: "pointer",
              outlineOffset: 2,
              touchAction: "manipulation",
            }}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 6a5 5 0 1 1-.1 3M3 2v4h4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
