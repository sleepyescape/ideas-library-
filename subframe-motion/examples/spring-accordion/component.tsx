/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/accordion.tsx
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

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useId, useState } from "react"

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

const items = [
  [
    "Start with a little curiosity.",
    "Collect a few things that catch your eye. A shape, a color, a small interaction. The first idea can be a simple one.",
  ],
  ["Give the idea some room.", "Explore the details, make a few versions, and see what feels right."],
  ["Keep the good parts.", "Bring your favorite details together. Share them early and keep refining."],
]

export default function SpringAccordion({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [expanded, setExpanded] = useState<number | null>(0)
  const [keyboard, setKeyboard] = useState(false)
  const id = useId()
  const animate = active && reduced === false && !keyboard
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        padding: 20,
        boxSizing: "border-box",
        background: "#eeeae2",
        color: "#30342e",
        fontFamily: "inherit",
      }}
    >
      <div style={{ width: 310, maxWidth: "100%" }}>
        {items.map(([title, content], index) => (
          <div key={title} style={{ borderTop: "1px solid #d8d8cd", overflow: "hidden" }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
              <button
                type="button"
                id={`${id}-trigger-${index}`}
                aria-expanded={expanded === index}
                aria-controls={`${id}-panel-${index}`}
                onClick={(event) => {
                  setKeyboard(event.detail === 0)
                  setExpanded(expanded === index ? null : index)
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 46,
                  padding: "10px 0",
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  textAlign: "left",
                  font: "inherit",
                  cursor: "pointer",
                  outlineOffset: -2,
                }}
              >
                {title}
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: expanded === index ? 45 : 0 }}
                  transition={{ duration: animate ? 0.2 : 0 }}
                  style={{ display: "inline-block", fontSize: 20, lineHeight: 1, fontWeight: 300 }}
                >
                  +
                </motion.span>
              </button>
            </h3>
            <div id={`${id}-panel-${index}`} role="region" aria-labelledby={`${id}-trigger-${index}`}>
              <AnimatePresence initial={false}>
                {expanded === index && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={animate ? { type: "spring", duration: 0.3, bounce: 0 } : { duration: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <p style={{ margin: 0, padding: "0 20px 12px 0", fontSize: 11, lineHeight: 1.6, color: "#64675e" }}>
                      {content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
