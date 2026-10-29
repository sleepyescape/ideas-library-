/**
 * Adapted from https://github.com/ddoemonn/interior/blob/314800833bf01e23e6ae74c2a17fbdaac3688c84/components/interior/like-burst.tsx
 * Retains the optimistic like hook with debounced settlement, deterministic radial sparks and rolling count.
 * Standalone styles and original demo content; reduced-motion and preview controls.
 *
 * MIT License
 *
 * Copyright (c) 2026 ozzy
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
import { useCallback, useEffect, useRef, useState } from "react"

// Subscribe directly so a changed system preference also stops an active preview.
function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(preference.matches)
    update()
    preference.addEventListener("change", update)
    return () => preference.removeEventListener("change", update)
  }, [])
  return reduced
}

const EASE = [0.23, 1, 0.32, 1] as const
const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const
const INSTANT = { duration: 0 } as const

const HEART = "M12 20.3 4.3 12.6a4.8 4.8 0 0 1 6.8-6.8l.9.9.9-.9a4.8 4.8 0 0 1 6.8 6.8Z"

const SPARKS = Array.from({ length: 8 }, (_, i) => {
  const h = (((i + 1) * 2654435761) % 997) / 997
  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2 + (h - 0.5) * 0.4
  const distance = 13 + h * 9
  return {
    x: Math.round(Math.cos(angle) * distance * 10) / 10,
    y: Math.round(Math.sin(angle) * distance * 10) / 10,
    size: h > 0.5 ? 4 : 3,
    delay: Math.round(h * 50) / 1000,
  }
})

export type LikeCommit = (liked: boolean, signal: AbortSignal) => Promise<unknown>

export type LikeBurstHandle = {
  toggle: () => void
}

export type UseOptimisticLikeOptions = {
  initialLiked?: boolean
  initialCount?: number
  onCommit?: LikeCommit
  onError?: (error: unknown) => void
  settle?: number
}

export type OptimisticLike = {
  liked: boolean
  count: number
  base: number
  pending: boolean
  burst: number
  settled: { liked: boolean; count: number }
  toggle: () => void
}

export function useOptimisticLike({
  initialLiked = false,
  initialCount = 0,
  onCommit,
  onError,
  settle = 400,
}: UseOptimisticLikeOptions = {}): OptimisticLike {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)
  const [burst, setBurst] = useState(0)
  const [settled, setSettled] = useState({
    liked: initialLiked,
    count: initialCount,
  })

  const likedNow = useRef(initialLiked)
  const countNow = useRef(initialCount)
  const truth = useRef({ liked: initialLiked, count: initialCount })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlight = useRef<AbortController | null>(null)
  const seq = useRef(0)

  const commit = useRef(onCommit)
  commit.current = onCommit
  const failed = useRef(onError)
  failed.current = onError

  const flush = useCallback(() => {
    timer.current = null
    inFlight.current?.abort()
    inFlight.current = null
    seq.current += 1

    const intent = likedNow.current

    if (intent === truth.current.liked) {
      countNow.current = truth.current.count
      setLiked(truth.current.liked)
      setCount(truth.current.count)
      setPending(false)
      return
    }

    const target = { liked: intent, count: countNow.current }
    const run = commit.current

    if (!run) {
      truth.current = target
      setSettled(target)
      setPending(false)
      return
    }

    const controller = new AbortController()
    const id = seq.current
    inFlight.current = controller
    setPending(true)

    run(intent, controller.signal).then(
      () => {
        if (id !== seq.current) {
          return
        }
        inFlight.current = null
        truth.current = target
        setSettled(target)
        setPending(false)
      },
      (error: unknown) => {
        if (id !== seq.current) {
          return
        }
        inFlight.current = null
        likedNow.current = truth.current.liked
        countNow.current = truth.current.count
        setLiked(truth.current.liked)
        setCount(truth.current.count)
        setPending(false)
        failed.current?.(error)
      },
    )
  }, [])

  const toggle = useCallback(() => {
    const next = !likedNow.current
    likedNow.current = next
    countNow.current += next ? 1 : -1

    setLiked(next)
    setCount(countNow.current)
    setPending(true)
    if (next) {
      setBurst((b) => b + 1)
    }

    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = setTimeout(flush, settle)
  }, [flush, settle])

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
      timer.current = null
      seq.current += 1
      inFlight.current?.abort()
      inFlight.current = null
    },
    [],
  )

  return {
    liked,
    count,
    base: liked ? count - 1 : count,
    pending,
    burst,
    settled,
    toggle,
  }
}

const stage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 260,
  display: "grid",
  placeItems: "center",
  padding: 24,
  boxSizing: "border-box",
  background: "#eeede8",
  color: "#343832",
  fontFamily: "inherit",
}
const button: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  minHeight: 46,
  padding: "0 20px",
  border: "1px solid #cfcec7",
  borderRadius: 10,
  background: "#fff",
  color: "inherit",
  font: "inherit",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  outlineOffset: 4,
  touchAction: "manipulation",
  boxShadow: "0 2px 3px #252a2010",
}
const hidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
}

export default function LikeBurstExample({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion() !== false || !active
  const { liked, count, burst, settled, toggle } = useOptimisticLike({ initialCount: 128 })
  return (
    <div style={{ ...stage, background: "#f2e9e7" }}>
      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          aria-label="Like this example"
          aria-pressed={liked}
          onClick={toggle}
          style={{ ...button, gap: 16, borderColor: "#dfc8c3", color: liked ? "#a1453e" : "#64514c" }}
        >
          <span aria-hidden style={{ position: "relative", width: 20, height: 20 }}>
            <motion.svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
              style={{ position: "absolute", inset: 0 }}
              initial={false}
              animate={{ opacity: liked ? 0 : 1 }}
              transition={reduced ? INSTANT : CROSSFADE}
            >
              <path d={HEART} />
            </motion.svg>
            <motion.svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              style={{ position: "absolute", inset: 0 }}
              initial={false}
              animate={{ opacity: liked ? 1 : 0, scale: reduced || liked ? 1 : 0.55 }}
              transition={reduced ? INSTANT : CELL}
            >
              <path d={HEART} />
            </motion.svg>
            {!reduced && burst > 0 && (
              <span key={burst} style={{ position: "absolute", left: "50%", top: "50%", pointerEvents: "none" }}>
                {SPARKS.map((spark, index) => (
                  <motion.span
                    key={index}
                    style={{
                      position: "absolute",
                      display: "block",
                      borderRadius: 2,
                      background: "currentColor",
                      width: spark.size,
                      height: spark.size,
                      marginLeft: -spark.size / 2,
                      marginTop: -spark.size / 2,
                    }}
                    initial={{ x: 0, y: 0, scale: 0.6, opacity: 0.85 }}
                    animate={{ x: spark.x, y: spark.y, scale: 1, opacity: 0 }}
                    transition={{ duration: 0.44, delay: spark.delay, ease: EASE }}
                  />
                ))}
              </span>
            )}
          </span>
          <span aria-hidden style={{ minWidth: 35 }}>
            {liked ? "Liked" : "Like"}
          </span>
          <span
            aria-hidden
            style={{
              display: "grid",
              overflow: "hidden",
              minWidth: 26,
              fontVariantNumeric: "tabular-nums",
              fontSize: 12,
            }}
          >
            <AnimatePresence initial={false}>
              <motion.span
                key={count}
                style={{ gridArea: "1 / 1" }}
                initial={{ opacity: 0, y: reduced ? 0 : -7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : 7 }}
                transition={reduced ? INSTANT : CROSSFADE}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
        <span role="status" style={hidden}>
          {settled.count} likes, {settled.liked ? "liked" : "not liked"}
        </span>
      </div>
    </div>
  )
}
