/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/text-roll.tsx
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

import { motion } from "motion/react"
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

const text = "A new perspective."

export default function TextRoll({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const canAnimate = active && reduced === false
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
        background: "#dedde7",
        color: "#555167",
        fontFamily: "inherit",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <span aria-hidden="true" style={{ color: "#928da2", fontSize: 35, fontWeight: 200 }}>
        ↳
      </span>
      <h3
        key={canAnimate ? "play" : "still"}
        aria-label={text}
        style={{
          margin: 0,
          fontSize: "clamp(22px, 4vw, 33px)",
          letterSpacing: "-.045em",
          fontWeight: 450,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
        }}
      >
        {Array.from(text, (letter, index) => (
          <span
            key={index}
            aria-hidden="true"
            style={{ position: "relative", display: "inline-block", perspective: 10000, transformStyle: "preserve-3d" }}
          >
            <motion.span
              style={{
                position: "absolute",
                display: "inline-block",
                backfaceVisibility: "hidden",
                transformOrigin: "50% 25%",
              }}
              initial={canAnimate ? { rotateX: 0 } : false}
              animate={{ rotateX: canAnimate ? 90 : 0 }}
              transition={{
                duration: canAnimate ? 0.32 : 0,
                delay: canAnimate ? index * 0.025 : 0,
                ease: [0.25, 1, 0.5, 1],
              }}
            >
              {letter === " " ? "\u00a0" : letter}
            </motion.span>
            {canAnimate && (
              <motion.span
                style={{
                  position: "absolute",
                  display: "inline-block",
                  backfaceVisibility: "hidden",
                  transformOrigin: "50% 100%",
                }}
                initial={{ rotateX: 90 }}
                animate={{ rotateX: 0 }}
                transition={{ duration: 0.36, delay: index * 0.025 + 0.12, ease: [0.25, 1, 0.5, 1] }}
              >
                {letter === " " ? "\u00a0" : letter}
              </motion.span>
            )}
            <span style={{ visibility: "hidden" }}>{letter === " " ? "\u00a0" : letter}</span>
          </span>
        ))}
      </h3>
      <span style={{ color: "#5f5c6a", fontSize: 10 }}>The same words. A different way in.</span>
    </div>
  )
}
