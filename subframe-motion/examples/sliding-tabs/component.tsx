/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/animated-background.tsx
 * Purpose-built accessible tabs with roving focus; unique layout ID; keyboard and reduced-motion instant state changes; isolated selection control.
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
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react"

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

const views = ["Overview", "Activity", "Insights"]

export default function SlidingTabs({ active = true }: { active?: boolean }) {
  const reduceMotion = useReducedMotion()
  const [selected, setSelected] = useState(0)
  const [keyboardInput, setKeyboardInput] = useState(false)
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const id = useId()
  const canAnimate = active && reduceMotion === false && !keyboardInput

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % views.length
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index + views.length - 1) % views.length
    } else if (event.key === "Home") {
      next = 0
    } else if (event.key === "End") {
      next = views.length - 1
    } else {
      return
    }
    event.preventDefault()
    setKeyboardInput(true)
    setSelected(next)
    buttons.current[next]?.focus()
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 240,
        display: "grid",
        placeItems: "center",
        background: "#efefec",
        color: "#242621",
        fontFamily: "inherit",
      }}
    >
      <div style={{ width: "min(292px, calc(100% - 36px))" }}>
        <div
          role="tablist"
          aria-label="Workspace view"
          style={{ display: "flex", padding: 4, borderRadius: 12, background: "#e4e5df", gap: 2 }}
        >
          {views.map((view, index) => (
            <button
              key={view}
              ref={(element) => {
                buttons.current[index] = element
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-panel`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              onKeyDown={(event) => onKeyDown(event, index)}
              onClick={(event) => {
                setKeyboardInput(event.detail === 0)
                setSelected(index)
              }}
              style={{
                flex: 1,
                position: "relative",
                minHeight: 44,
                border: 0,
                borderRadius: 8,
                background: "transparent",
                color: selected === index ? "#252721" : "#62665c",
                cursor: "pointer",
                font: "inherit",
                fontSize: 12,
                fontWeight: 500,
                outlineOffset: 3,
                touchAction: "manipulation",
              }}
            >
              {selected === index && (
                <motion.span
                  aria-hidden="true"
                  layoutId={canAnimate ? `${id}-highlight` : undefined}
                  transition={canAnimate ? { type: "spring", stiffness: 460, damping: 34 } : { duration: 0 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 1px 3px #25272112, 0 1px 1px #25272108",
                  }}
                />
              )}
              <span style={{ position: "relative" }}>{view}</span>
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${selected}`}
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}
        >
          {views[selected]} selected
        </div>
      </div>
    </div>
  )
}
