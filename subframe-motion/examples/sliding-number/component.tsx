/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/sliding-number.tsx
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

import { motion, type MotionValue, useSpring, useTransform } from "motion/react"
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

function NumberRow({ value, number }: { value: MotionValue<number>; number: number }) {
  const y = useTransform(value, (latest) => {
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    return `${(offset > 5 ? offset - 10 : offset) * 100}%`
  })
  return (
    <motion.span
      style={{
        y,
        position: "absolute",
        inset: 0,
        height: "1em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {number}
    </motion.span>
  )
}

function Digit({ value, place, canAnimate }: { value: number; place: number; canAnimate: boolean }) {
  const rounded = Math.floor(value / place) % 10
  const animated = useSpring(rounded, { stiffness: 280, damping: 22, mass: 0.3 })
  useEffect(() => {
    if (canAnimate) {
      animated.set(rounded)
    } else {
      animated.jump(rounded)
    }
  }, [rounded, animated, canAnimate])
  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        width: "1ch",
        height: "1em",
        overflow: "hidden",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1,
      }}
    >
      {Array.from({ length: 10 }, (_, number) => (
        <NumberRow key={number} value={animated} number={number} />
      ))}
    </span>
  )
}

const values = [248, 372, 516, 409]

export default function SlidingNumber({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [keyboard, setKeyboard] = useState(false)
  const value = values[index]
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 260,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        background: "#e3e9e9",
        color: "#3d5558",
        fontFamily: "inherit",
      }}
    >
      <div style={{ width: 232, maxWidth: "calc(100% - 48px)" }}>
        <output
          aria-live="polite"
          aria-label={`${value} new ideas collected`}
          style={{ display: "flex", alignItems: "baseline", gap: 12 }}
        >
          <span
            aria-hidden="true"
            style={{ display: "flex", fontSize: 72, fontWeight: 400, letterSpacing: "-.055em", lineHeight: 1 }}
          >
            {[100, 10, 1].map((place) => (
              <Digit key={place} value={value} place={place} canAnimate={active && reduced === false && !keyboard} />
            ))}
          </span>
          <span aria-hidden="true" style={{ fontSize: 11, color: "#566667" }}>
            ideas
          </span>
        </output>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderTop: "1px solid #c9d6d4",
            marginTop: 22,
          }}
        >
          <button
            type="button"
            aria-label="Update idea count"
            onClick={(event) => {
              setKeyboard(event.detail === 0)
              setIndex((current) => (current + 1) % values.length)
            }}
            style={{
              width: 44,
              height: 44,
              padding: 0,
              background: "transparent",
              color: "#4d6c6d",
              border: 0,
              borderRadius: 8,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  )
}
