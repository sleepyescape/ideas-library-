/**
 * Adapted from https://github.com/ddoemonn/interior/blob/314800833bf01e23e6ae74c2a17fbdaac3688c84/components/interior/hold-to-confirm.tsx
 * Retains the elapsed-time hold/release state machine, pointer cancellation, keyboard hold and clipped progress overlay.
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

import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { useCallback, useEffect, useId, useRef, useState } from "react"

export type HoldPhase = "idle" | "holding" | "releasing" | "committed"

export type UseHoldToConfirmOptions = {
  onConfirm: () => void
  onAbort?: () => void
  duration?: number
  steps?: number
  releaseRate?: number
  moveTolerance?: number
  haptic?: boolean
  disabled?: boolean
}

export function useHoldToConfirm({
  onConfirm,
  onAbort,
  duration = 1800,
  steps = 20,
  releaseRate = 2.5,
  moveTolerance = 10,
  haptic = true,
  disabled = false,
}: UseHoldToConfirmOptions) {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<HoldPhase>("idle")

  const phaseRef = useRef<HoldPhase>("idle")
  const down = useRef(false)
  const elapsed = useRef(0)
  const last = useRef(0)
  const raf = useRef(0)
  const origin = useRef<{ x: number; y: number } | null>(null)

  const confirm = useRef(onConfirm)
  confirm.current = onConfirm
  const abort = useRef(onAbort)
  abort.current = onAbort

  const move = useCallback((next: HoldPhase) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current)
    raf.current = 0
    down.current = false
    elapsed.current = 0
    origin.current = null
    setStep(0)
    move("idle")
  }, [move])

  const begin = useCallback(
    (point?: { x: number; y: number }) => {
      if (disabled) {
        return
      }
      if (phaseRef.current === "committed" || phaseRef.current === "holding") {
        return
      }

      origin.current = point ?? null
      down.current = true
      move("holding")
      if (raf.current) {
        return
      }

      last.current = performance.now()

      const loop = (now: number) => {
        // This is a duration contract, so dropped frames must not extend the hold.
        const dt = Math.max(0, now - last.current)
        last.current = now
        elapsed.current += down.current ? dt : -dt * releaseRate

        if (elapsed.current >= duration) {
          raf.current = 0
          elapsed.current = duration
          down.current = false
          origin.current = null
          setStep(steps)
          move("committed")
          if (haptic) {
            navigator.vibrate?.(14)
          }
          confirm.current()
          return
        }

        if (!down.current && elapsed.current <= 0) {
          raf.current = 0
          elapsed.current = 0
          origin.current = null
          setStep(0)
          move("idle")
          return
        }

        const s = Math.min(steps, Math.floor((elapsed.current / duration) * steps))
        setStep((prev) => (prev === s ? prev : s))
        raf.current = requestAnimationFrame(loop)
      }

      raf.current = requestAnimationFrame(loop)
    },
    [disabled, duration, steps, releaseRate, haptic, move],
  )

  const release = useCallback(() => {
    if (phaseRef.current !== "holding") {
      return
    }
    down.current = false
    origin.current = null
    move("releasing")
    abort.current?.()
  }, [move])

  useEffect(() => {
    const bail = () => release()
    const onVisibility = () => {
      if (document.hidden) {
        release()
      }
    }
    window.addEventListener("blur", bail)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("blur", bail)
      document.removeEventListener("visibilitychange", onVisibility)
      cancelAnimationFrame(raf.current)
      raf.current = 0
    }
  }, [release])

  const bind = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) {
        return
      }
      e.currentTarget.setPointerCapture?.(e.pointerId)
      begin({ x: e.clientX, y: e.clientY })
    },
    onPointerMove: (e: React.PointerEvent) => {
      const from = origin.current
      if (phaseRef.current !== "holding" || !from) {
        return
      }
      if (Math.hypot(e.clientX - from.x, e.clientY - from.y) > moveTolerance) {
        release()
      }
    },
    onPointerUp: release,
    onPointerCancel: release,
    onPointerLeave: release,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phaseRef.current === "holding" || phaseRef.current === "releasing") {
          e.preventDefault()
          reset()
        }
        return
      }
      if (e.repeat) {
        return
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        begin()
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        release()
      }
    },
    onBlur: release,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      if (phaseRef.current === "committed") {
        e.stopPropagation()
      }
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }

  return {
    bind,
    step,
    steps,
    phase,
    progress: step / steps,
    reset,
  }
}

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

export default function HoldToConfirmExample({ active = true }: { active?: boolean }) {
  const [archived, setArchived] = useState(false)
  const { bind, phase, reset } = useHoldToConfirm({
    onConfirm: () => setArchived(true),
    duration: 1600,
    haptic: false,
    disabled: !active || archived,
  })
  const reduced = useReducedMotion() !== false
  const hintId = useId()
  const swept = useMotionValue(0)
  const clipPath = useTransform(swept, (value) => `inset(0 ${(1 - value) * 100}% 0 0)`)
  useEffect(() => {
    if (!active) {
      reset()
    }
  }, [active, reset])
  useEffect(() => {
    if (reduced) {
      swept.set(phase === "committed" ? 1 : 0)
      return
    }
    const from = swept.get()
    const target = phase === "holding" || phase === "committed" ? 1 : 0
    const duration = phase === "committed" ? 0.12 : target ? 1.6 * (1 - from) : (1.6 * from) / 2.5
    const controls = animate(swept, target, { duration, ease: "linear" })
    return () => controls.stop()
  }, [phase, reduced, swept])
  const text = archived ? "Project archived" : phase === "holding" ? "Keep holding…" : "Hold to archive"
  return (
    <div style={{ ...stage, background: "#eeeae5" }}>
      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          aria-label={text}
          aria-disabled={!active || archived}
          aria-describedby={hintId}
          {...bind}
          style={{ ...button, overflow: "hidden", width: 204, userSelect: "none", WebkitTouchCallout: "none" }}
        >
          <span aria-hidden>{text}</span>
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "#3e463c",
              color: "white",
              clipPath,
            }}
          >
            {text}
          </motion.span>
        </button>
        <p
          id={hintId}
          style={{ fontSize: 11, color: "#6d6259", maxWidth: 240, lineHeight: 1.6, margin: "18px auto 0" }}
        >
          Hold for 1.6 seconds. Release or press Escape to cancel.
        </p>
        <button
          type="button"
          onClick={() => {
            setArchived(false)
            reset()
          }}
          style={{
            ...button,
            minHeight: 44,
            border: 0,
            background: "transparent",
            boxShadow: "none",
            fontSize: 11,
            visibility: archived ? "visible" : "hidden",
          }}
        >
          Reset example
        </button>
        <span role="status" style={hidden}>
          {archived ? "Project archived" : ""}
        </span>
      </div>
    </div>
  )
}
