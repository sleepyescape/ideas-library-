/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/animated-group.tsx
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

const ideas = [
  { title: "A shape worth saving", detail: "Collected just now", color: "#b3c0a1", radius: "50%" },
  { title: "A color to come back to", detail: "A small observation", color: "#d1af83", radius: "50% 50% 2px 2px" },
  { title: "A detail that feels right", detail: "A work in progress", color: "#b3b0c9", radius: "5px" },
]

export default function AnimatedGroup({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const canAnimate = active && reduced === false
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        background: "#ecebe5",
        color: "#454b3f",
        fontFamily: "inherit",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: 276, maxWidth: "100%" }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#606859", marginBottom: 12 }}
        >
          <span>A FEW GOOD IDEAS</span>
          <span>03</span>
        </div>
        <motion.ul
          key={canAnimate ? "play" : "still"}
          initial={canAnimate ? "hidden" : false}
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: canAnimate ? 0.065 : 0 } } }}
          style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}
        >
          {ideas.map((idea) => (
            <motion.li
              key={idea.title}
              variants={{
                hidden: { opacity: 0, y: 12, filter: "blur(3px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)" },
              }}
              transition={{ duration: canAnimate ? 0.35 : 0, ease: [0.25, 1, 0.5, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                background: "#f7f7f1",
                border: "1px solid #e3e5d9",
                borderRadius: 9,
                padding: "13px 15px",
              }}
            >
              <span
                aria-hidden="true"
                style={{ flexShrink: 0, width: 28, height: 28, background: idea.color, borderRadius: idea.radius }}
              />
              <div>
                <h3 style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 500 }}>{idea.title}</h3>
                <p style={{ margin: 0, fontSize: 9, color: "#6a6e61" }}>{idea.detail}</p>
              </div>
              <span aria-hidden="true" style={{ marginLeft: "auto", fontSize: 14, color: "#bbc2ac" }}>
                ↗
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}
