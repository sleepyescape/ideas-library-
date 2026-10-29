/**
 * Adapted from https://github.com/ddoemonn/interior/blob/314800833bf01e23e6ae74c2a17fbdaac3688c84/components/interior/poll-results.tsx
 * Retains the poll result derivation, clipped spring fills, MotionValue percentage readouts and winner check.
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

import { animate, AnimatePresence, motion, motionValue, useMotionValueEvent, useTransform } from "motion/react"
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

const FILL = { type: "spring", stiffness: 210, damping: 34, mass: 0.9 } as const

const POP = { type: "spring", stiffness: 640, damping: 22, mass: 0.7 } as const
const EASE = [0.23, 1, 0.32, 1] as const
const ENTER = { duration: 0.2, ease: EASE } as const
const STILL = { duration: 0 } as const

export type PollOption = {
  id: string
  label: string
  votes: number
}

export type UsePollResultsOptions = {
  options: PollOption[]

  value?: string | null
  defaultValue?: string | null
  onVote?: (id: string) => void
}

export function usePollResults({ options, value, defaultValue = null, onVote }: UsePollResultsOptions) {
  const [internal, setInternal] = useState<string | null>(defaultValue)
  const controlled = value !== undefined
  const chosen = controlled ? value : internal

  const emit = useRef(onVote)
  emit.current = onVote

  const vote = useCallback(
    (id: string) => {
      if (chosen !== null) {
        return
      }
      if (!controlled) {
        setInternal(id)
      }
      emit.current?.(id)
    },
    [chosen, controlled],
  )

  const total = options.reduce((sum, o) => sum + Math.max(0, o.votes), 0)
  const top = options.reduce((best, o) => (o.votes > best ? o.votes : best), 0)

  const rows = options.map((option) => ({
    ...option,
    share: total > 0 ? Math.max(0, option.votes) / total : 0,
    winner: total > 0 && option.votes === top,
    mine: option.id === chosen,
  }))

  return {
    rows,
    total,
    chosen,
    revealed: chosen !== null,
    vote,
  }
}

const Tick = (
  <svg viewBox="0 0 256 256" width="11" height="11" fill="none" aria-hidden>
    <polyline
      points="216 72 104 184 48 128"
      stroke="currentColor"
      strokeWidth="26"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

type RowProps = {
  label: string
  share: number
  winner: boolean
  mine: boolean
  revealed: boolean
  reduced: boolean
  onPick: () => void
}

function Row({ label, share, winner, mine, revealed, reduced, onPick }: RowProps) {
  const progress = useRef(motionValue(0)).current
  const clipPath = useTransform(progress, (p) => `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0 round 5px)`)

  const [landed, setLanded] = useState(false)
  const readout = useRef<HTMLSpanElement | null>(null)

  useMotionValueEvent(progress, "change", (p) => {
    const node = readout.current
    if (!node) {
      return
    }
    const next = `${Math.round(p * 100)}%`
    if (node.textContent !== next) {
      node.textContent = next
    }
  })

  useEffect(() => {
    if (!revealed) {
      return
    }
    if (reduced) {
      progress.jump(share)
      setLanded(true)
      return
    }
    const controls = animate(progress, share, FILL)
    let live = true
    void controls.then(() => {
      if (live) {
        setLanded(true)
      }
    })
    return () => {
      live = false
      controls.stop()
    }
  }, [revealed, share, reduced, progress])

  return (
    <button
      type="button"
      onClick={onPick}
      aria-disabled={revealed}
      aria-pressed={revealed ? mine : undefined}
      aria-label={`${label}${revealed ? `, ${Math.round(share * 100)} percent` : ""}`}
      style={{
        ...button,
        display: "block",
        width: "100%",
        minHeight: 44,
        padding: "0 12px",
        overflow: "hidden",
        textAlign: "left",
        background: revealed ? "#f3f1eb" : "#fff",
        cursor: revealed ? "default" : "pointer",
        boxShadow: "none",
      }}
    >
      <motion.span
        aria-hidden
        style={{ position: "absolute", inset: 3, borderRadius: 6, background: mine ? "#d5e3c5" : "#e2e2d7", clipPath }}
      />
      <span aria-hidden style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, fontSize: 12 }}>{label}</span>
        <span style={{ width: 14, display: "grid", placeItems: "center" }}>
          <AnimatePresence initial={false}>
            {revealed && winner && landed && (
              <motion.span
                initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={reduced ? STILL : POP}
              >
                {Tick}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <motion.span
          ref={readout}
          initial={false}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={reduced ? STILL : ENTER}
          style={{
            minWidth: 32,
            textAlign: "right",
            fontSize: 11,
            fontVariantNumeric: "tabular-nums",
            fontFamily: "monospace",
          }}
        >
          0%
        </motion.span>
      </span>
    </button>
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

const OPTIONS = [
  { id: "forest", label: "A cabin in the woods", votes: 42 },
  { id: "coast", label: "Somewhere by the sea", votes: 35 },
  { id: "city", label: "A city to get lost in", votes: 23 },
]

function PollCard({ active }: { active: boolean }) {
  const [chosen, setChosen] = useState<string | null>(null)
  const options = OPTIONS.map((option) => ({ ...option, votes: option.votes + (chosen === option.id ? 1 : 0) }))
  const poll = usePollResults({ options, value: chosen, onVote: setChosen })
  const reduced = useReducedMotion() !== false || !active
  return (
    <>
      <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 500 }}>Where would you rather be?</p>
      <div role="group" aria-label="Choose your ideal getaway" style={{ display: "grid", gap: 7 }}>
        {poll.rows.map((row) => (
          <Row key={row.id} {...row} revealed={poll.revealed} reduced={reduced} onPick={() => poll.vote(row.id)} />
        ))}
      </div>
      <p role="status" style={{ fontSize: 10, color: "#606e4e", margin: "12px 0 0", minHeight: 14 }}>
        {poll.revealed
          ? `${poll.total} votes · ${poll.rows.find((row) => row.winner)?.label} leads`
          : "Choose one to see the results"}
      </p>
    </>
  )
}

export default function PollResultsExample({ active = true }: { active?: boolean }) {
  const [version, setVersion] = useState(0)
  return (
    <div style={{ ...stage, background: "#eeeede" }}>
      <div style={{ width: "100%", maxWidth: 284 }}>
        <PollCard key={version} active={active} />
        <button
          type="button"
          onClick={() => setVersion((value) => value + 1)}
          style={{
            ...button,
            minHeight: 44,
            marginTop: 6,
            padding: 0,
            background: "transparent",
            border: 0,
            boxShadow: "none",
            fontSize: 10,
            color: "#606e4e",
          }}
        >
          Reset poll
        </button>
      </div>
    </div>
  )
}
