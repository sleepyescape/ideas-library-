/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/text-effect.tsx
 * Reduced word-only masked reveal; manual replay; full accessible heading; static reduced-motion state; self-contained inline styles.
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

const lines = ["Good things", "take shape."]

export default function WordReveal({ active = true }: { active?: boolean }) {
  const reduceMotion = useReducedMotion()
  const canAnimate = active && reduceMotion === false
  const [replay, setReplay] = useState(0)

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 240,
        display: "grid",
        placeItems: "center",
        position: "relative",
        background: "#eef2e9",
        color: "#35412c",
        fontFamily: "inherit",
      }}
    >
      <motion.h2
        key={`${replay}-${canAnimate}`}
        aria-label={lines.join(" ")}
        initial={canAnimate ? "hidden" : false}
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.075 } } }}
        style={{
          margin: "0 0 18px",
          fontSize: "clamp(32px, 4vw, 46px)",
          fontWeight: 500,
          letterSpacing: "-0.065em",
          lineHeight: 1.08,
          textAlign: "left",
        }}
      >
        {lines.map((line) => (
          <span key={line} aria-hidden="true" style={{ display: "block" }}>
            {line.split(" ").map((word, index) => (
              <span
                key={word}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  verticalAlign: "top",
                  paddingBottom: "0.12em",
                  marginBottom: "-0.12em",
                }}
              >
                <motion.span
                  variants={{ hidden: { opacity: 0, y: "100%" }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: canAnimate ? 0.52 : 0, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {index > 0 ? ` ${word}` : word}
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </motion.h2>
      <button
        type="button"
        onClick={() => setReplay((value) => value + 1)}
        style={{
          position: "absolute",
          bottom: 14,
          right: 16,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minHeight: 44,
          padding: "0 10px",
          border: 0,
          borderRadius: 6,
          background: "transparent",
          color: "#617254",
          cursor: "pointer",
          font: "inherit",
          fontSize: 11,
          outlineOffset: 2,
          touchAction: "manipulation",
        }}
      >
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 6a5 5 0 1 1-.1 3M3 2v4h4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Replay
      </button>
    </div>
  )
}
