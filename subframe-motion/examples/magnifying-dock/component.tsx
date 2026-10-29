/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/dock.tsx
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

import { motion, type MotionValue, useMotionValue, useSpring, useTransform } from "motion/react"
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

const tools = [
  { label: "Canvas", color: "#c2cdbe", path: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { label: "Notes", color: "#dbc2a2", path: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4" },
  { label: "Shapes", color: "#b3c9d0", path: "m12 3 10 18H2zM9 16h6" },
  { label: "Frames", color: "#c6bed6", path: "M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M9 9h6v6H9z" },
]

const ITEM_SIZE = 44
const GAP = 9
const DOCK_WIDTH = tools.length * ITEM_SIZE + (tools.length - 1) * GAP
function sizesAt(pointer: number, strength: number) {
  return tools.map(
    (_, index) =>
      ITEM_SIZE +
      20 * strength * Math.max(0, 1 - Math.abs(pointer - (index * (ITEM_SIZE + GAP) + ITEM_SIZE / 2)) / 115),
  )
}
function DockItem({
  item,
  index,
  pointer,
  emphasis,
  selected,
  onSelect,
}: {
  item: (typeof tools)[number]
  index: number
  pointer: MotionValue<number>
  emphasis: MotionValue<number>
  selected: boolean
  onSelect: () => void
}) {
  const transform = useTransform(() => {
    const sizes = sizesAt(pointer.get(), emphasis.get())
    const expansion = sizes.reduce((sum, size) => sum + size - ITEM_SIZE, 0)
    const preceding = sizes.slice(0, index).reduce((sum, size) => sum + size - ITEM_SIZE, 0)
    return `translateX(${preceding - expansion / 2}px) scale(${sizes[index] / ITEM_SIZE})`
  })
  return (
    <motion.button
      type="button"
      aria-label={item.label}
      aria-pressed={selected}
      onClick={onSelect}
      style={{
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        transform,
        transformOrigin: "left bottom",
        flex: "none",
        padding: 0,
        border: 0,
        borderRadius: 12,
        background: item.color,
        color: "#48505a",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        position: "relative",
        outlineOffset: 4,
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 21, height: 21 }}
      >
        <path d={item.path} />
      </svg>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: -8,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: selected ? "#797c75" : "transparent",
        }}
      />
    </motion.button>
  )
}

export default function MagnifyingDock({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [keyboard, setKeyboard] = useState(false)
  const canAnimate = active && reduced === false && !keyboard
  const mouseX = useMotionValue(DOCK_WIDTH / 2)
  const hover = useMotionValue(0)
  const pointer = useSpring(mouseX, { mass: 0.15, stiffness: 220, damping: 18 })
  const emphasis = useSpring(hover, { mass: 0.15, stiffness: 220, damping: 18 })
  const shellScale = useTransform(
    () =>
      (sizesAt(pointer.get(), emphasis.get()).reduce((sum, size) => sum + size, 0) + (tools.length - 1) * GAP + 26) /
      (DOCK_WIDTH + 26),
  )
  const shellScaleY = useTransform(() => (Math.max(...sizesAt(pointer.get(), emphasis.get())) + 31) / 75)
  const [selected, setSelected] = useState("Canvas")
  useEffect(() => {
    if (!canAnimate) {
      hover.set(0)
      emphasis.jump(0)
    }
  }, [canAnimate, hover, emphasis])
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 22,
        background: "#e7e9e6",
        color: "#5f665f",
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: ".02em" }} aria-live="polite">
        {selected}
      </div>
      <div style={{ height: 82, display: "flex", alignItems: "end", maxWidth: "100%" }}>
        <div
          role="group"
          aria-label="Creative tools"
          onPointerMove={(event) => {
            if (active && reduced === false && event.pointerType === "mouse") {
              setKeyboard(false)
              const rect = event.currentTarget.getBoundingClientRect()
              const localX = ((event.clientX - rect.left) / rect.width) * event.currentTarget.offsetWidth - 13
              mouseX.set(localX)
              hover.set(1)
            }
          }}
          onPointerLeave={() => hover.set(0)}
          onFocus={(event) => {
            if (!event.target.matches(":focus-visible")) {
              return
            }
            setKeyboard(true)
            hover.set(0)
          }}
          style={{
            display: "flex",
            gap: 9,
            alignItems: "end",
            padding: "12px 13px 19px",
            position: "relative",
            isolation: "isolate",
          }}
        >
          <motion.div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              scaleX: shellScale,
              scaleY: shellScaleY,
              transformOrigin: "center bottom",
              border: "1px solid #fff9",
              borderRadius: 20,
              background: "#f4f5f0a6",
              boxShadow: "0 8px 30px #2a403808",
              zIndex: -1,
              pointerEvents: "none",
            }}
          />
          {tools.map((item, index) => (
            <DockItem
              key={item.label}
              item={item}
              index={index}
              pointer={pointer}
              emphasis={emphasis}
              selected={selected === item.label}
              onSelect={() => setSelected(item.label)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
