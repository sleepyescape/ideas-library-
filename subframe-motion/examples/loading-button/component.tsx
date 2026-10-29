/**
 * Adapted from https://github.com/ddoemonn/interior/blob/314800833bf01e23e6ae74c2a17fbdaac3688c84/components/interior/loading-button.tsx
 * Retains the async run-id state machine, overlapping status faces and spring crossfades.
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

import { motion } from "motion/react"
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

const CELL = { type: "spring", stiffness: 520, damping: 34, mass: 0.45 } as const
const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const
const INSTANT = { duration: 0 } as const

export type AsyncActionStatus = "idle" | "pending" | "success" | "error"

export type UseAsyncActionOptions = {
  action: () => unknown
  resetAfter?: number
  onError?: (error: unknown) => void
}

export function useAsyncAction({ action, resetAfter = 1400, onError }: UseAsyncActionOptions) {
  const [status, setStatus] = useState<AsyncActionStatus>("idle")

  const phase = useRef<AsyncActionStatus>("idle")
  const runId = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alive = useRef(true)

  const act = useRef(action)
  const fail = useRef(onError)

  useEffect(() => {
    act.current = action
    fail.current = onError
  })

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const reset = useCallback(() => {
    runId.current += 1
    clear()
    phase.current = "idle"
    setStatus("idle")
  }, [clear])

  const run = useCallback(() => {
    if (phase.current === "pending") {
      return
    }

    clear()
    const id = ++runId.current
    phase.current = "pending"
    setStatus("pending")

    const settle = (next: "success" | "error") => {
      if (!alive.current || id !== runId.current) {
        return
      }
      clear()
      phase.current = next
      setStatus(next)
      timer.current = setTimeout(() => {
        if (!alive.current || id !== runId.current) {
          return
        }
        phase.current = "idle"
        setStatus("idle")
      }, resetAfter)
    }

    Promise.resolve()
      .then(() => act.current())
      .then(
        () => settle("success"),
        (error: unknown) => {
          fail.current?.(error)
          settle("error")
        },
      )
  }, [clear, resetAfter])

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      clear()
    }
  }, [clear])

  return {
    status,
    run,
    reset,
    pending: status === "pending",
  }
}

function Spinner({ still }: { still: boolean }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
      animate={still ? undefined : { rotate: 360 }}
      transition={still ? undefined : { duration: 0.85, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.22" />
      <path d="M10.5 6A4.5 4.5 0 0 0 6 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  )
}

function CheckMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M2.6 6.3 4.9 8.6 9.4 3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlertMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M6 2.9v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 9.05h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
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

export default function LoadingButtonExample({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion() !== false || !active
  const [failNext, setFailNext] = useState(false)
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (demoTimer.current) {
        clearTimeout(demoTimer.current)
      }
    },
    [],
  )
  const { status, run, pending } = useAsyncAction({
    action: () =>
      new Promise<void>((resolve, reject) => {
        demoTimer.current = setTimeout(() => (failNext ? reject(new Error("Demo error")) : resolve()), 1200)
      }),
  })
  const faces = [
    { key: "idle", label: "Save changes", icon: null },
    { key: "pending", label: "Saving", icon: <Spinner still={reduced || !pending} /> },
    { key: "success", label: "Changes saved", icon: <CheckMark /> },
    { key: "error", label: "Try again", icon: <AlertMark /> },
  ]
  return (
    <div style={stage}>
      <div style={{ textAlign: "center" }}>
        <motion.button
          type="button"
          aria-busy={pending}
          aria-disabled={pending}
          aria-label={faces.find((face) => face.key === status)?.label}
          onClick={run}
          whileTap={reduced || pending ? undefined : { y: 1 }}
          transition={CELL}
          style={button}
        >
          <span aria-hidden style={{ display: "grid" }}>
            {faces.map((face) => (
              <motion.span
                key={face.key}
                initial={false}
                animate={{
                  opacity: face.key === status ? 1 : 0,
                  y: reduced || face.key === status ? 0 : 3,
                  filter: reduced || face.key === status ? "blur(0px)" : "blur(3px)",
                }}
                transition={reduced ? INSTANT : CROSSFADE}
                style={{
                  gridArea: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  color: face.key === "success" ? "#367556" : face.key === "error" ? "#b94638" : undefined,
                }}
              >
                {face.icon}
                {face.label}
              </motion.span>
            ))}
          </span>
        </motion.button>
        <label
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "#646d5e",
            marginTop: 22,
            minHeight: 44,
            cursor: "pointer",
          }}
        >
          <input type="checkbox" checked={failNext} onChange={(event) => setFailNext(event.target.checked)} /> Simulate
          an error
        </label>
        <span role="status" style={hidden}>
          {status === "success" ? "Changes saved" : status === "error" ? "Unable to save. Try again." : ""}
        </span>
      </div>
    </div>
  )
}
