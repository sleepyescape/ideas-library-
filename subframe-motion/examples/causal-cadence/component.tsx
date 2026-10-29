/**
 * MIT License
 *
 * Copyright (c) 2026 Subframe
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

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

type Config = { travelDuration: number; captionOffset: number; captionDuration: number; travelDistance: number }
export const DEFAULT_CONFIG: Config = {
  travelDuration: 1200,
  captionOffset: 160,
  captionDuration: 220,
  travelDistance: 180,
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const ease = (value: number) => 1 - Math.pow(1 - value, 3)
const seconds = (value: number) => `${(value / 1000).toFixed(2)}s`

export default function CausalCadence({ active = true, config }: { active?: boolean; config?: Partial<Config> }) {
  const settings = { ...DEFAULT_CONFIG, ...config }
  const configuredTravelDuration = clamp(
    Number.isFinite(settings.travelDuration) ? settings.travelDuration : DEFAULT_CONFIG.travelDuration,
    500,
    2400,
  )
  const configuredCaptionOffset = clamp(
    Number.isFinite(settings.captionOffset) ? settings.captionOffset : DEFAULT_CONFIG.captionOffset,
    0,
    600,
  )
  const configuredCaptionDuration = clamp(
    Number.isFinite(settings.captionDuration) ? settings.captionDuration : DEFAULT_CONFIG.captionDuration,
    100,
    500,
  )
  const travelDistance = clamp(
    Number.isFinite(settings.travelDistance) ? settings.travelDistance : DEFAULT_CONFIG.travelDistance,
    100,
    240,
  )
  const [mode, setMode] = useState<"departure" | "arrival">("arrival")
  const [playing, setPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [sequence, setSequence] = useState({
    travelDuration: configuredTravelDuration,
    captionOffset: configuredCaptionOffset,
    captionDuration: configuredCaptionDuration,
  })
  const travelDuration = hasPlayed ? sequence.travelDuration : configuredTravelDuration
  const captionOffset = hasPlayed ? sequence.captionOffset : configuredCaptionOffset
  const captionDuration = hasPlayed ? sequence.captionDuration : configuredCaptionDuration
  const [reduced, setReduced] = useState(true)
  const [run, setRun] = useState(0)
  const [announcement, setAnnouncement] = useState("")
  const point = useRef<SVGCircleElement>(null)
  const caption = useRef<SVGGElement>(null)
  const progress = useRef<SVGLineElement>(null)
  const clock = useRef<SVGTextElement>(null)
  const elapsed = useRef(0)
  const lastReduced = useRef(reduced)
  const cueAt = (mode === "arrival" ? travelDuration : 0) + captionOffset
  const endAt = Math.max(travelDuration, cueAt + captionDuration)
  const params = useRef({ travelDuration, travelDistance, captionDuration, cueAt, endAt })
  params.current = { travelDuration, travelDistance, captionDuration, cueAt, endAt }

  const paint = useCallback((time: number) => {
    const p = params.current
    const travel = ease(clamp(time / p.travelDuration, 0, 1))
    const entrance = ease(clamp((time - p.cueAt) / p.captionDuration, 0, 1))
    point.current?.setAttribute("cx", String(108 + travel * p.travelDistance))
    caption.current?.setAttribute("opacity", String(entrance))
    caption.current?.setAttribute("transform", `translate(0 ${12 * (1 - entrance)})`)
    progress.current?.setAttribute("x2", String(44 + 512 * clamp(time / p.endAt, 0, 1)))
    if (clock.current) {
      clock.current.textContent = seconds(Math.min(time, p.endAt))
    }
  }, [])

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useLayoutEffect(() => {
    const restoredMotion = lastReduced.current && !reduced
    lastReduced.current = reduced
    if (restoredMotion && hasPlayed) {
      paint(elapsed.current)
      setPlaying(false)
      return
    }
    elapsed.current = reduced && hasPlayed ? endAt : 0
    paint(elapsed.current)
    if (hasPlayed) {
      setPlaying(!reduced)
      if (reduced) {
        setAnnouncement(`Point arrives at ${seconds(travelDuration)}. Caption starts at ${seconds(cueAt)}.`)
      }
    }
    // Travel distance deliberately preserves the clock when adjusted.
  }, [travelDuration, captionDuration, captionOffset, mode, run, reduced, hasPlayed, endAt, cueAt, paint])

  useLayoutEffect(() => {
    paint(elapsed.current)
  }, [travelDistance, paint])

  useEffect(() => {
    if (!active || !playing || reduced) {
      return
    }
    let frame = 0
    let last: number | undefined
    const tick = (now: number) => {
      if (last !== undefined) {
        elapsed.current += now - last
      }
      last = now
      paint(elapsed.current)
      if (elapsed.current >= params.current.endAt) {
        elapsed.current = params.current.endAt
        setPlaying(false)
        setAnnouncement(
          `Point arrives at ${seconds(params.current.travelDuration)}. Caption starts at ${seconds(
            params.current.cueAt,
          )}.`,
        )
      } else {
        frame = requestAnimationFrame(tick)
      }
    }
    const visibility = () => {
      cancelAnimationFrame(frame)
      last = undefined
      if (!document.hidden) {
        frame = requestAnimationFrame(tick)
      }
    }
    visibility()
    document.addEventListener("visibilitychange", visibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [active, playing, reduced, run, travelDuration, captionDuration, captionOffset, mode, paint])

  const play = () => {
    if (!active) {
      return
    }
    setSequence({
      travelDuration: configuredTravelDuration,
      captionOffset: configuredCaptionOffset,
      captionDuration: configuredCaptionDuration,
    })
    setHasPlayed(true)
    setRun((value) => value + 1)
    setAnnouncement("")
  }
  const selectMode = (value: "departure" | "arrival") => {
    if (!active) {
      return
    }
    setMode(value)
    play()
  }

  return (
    <section className="sf-causal-cadence" aria-label="Caption timing comparison">
      <svg viewBox="0 0 600 375" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect x="40" y="48" width="520" height="176" rx="2" fill="#181817" />
        <line x1="108" y1="136" x2={108 + travelDistance} y2="136" stroke="#ffffff38" strokeDasharray="2 6" />
        <circle cx={108 + travelDistance} cy="136" r="37" fill="none" stroke="#ffffff45" strokeDasharray="2 5" />
        <circle ref={point} cx="108" cy="136" r="36" fill="#fffdf7" />
        <g
          ref={caption}
          opacity="0"
          fill="#fffdf7"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="32"
          fontWeight="600"
          letterSpacing="-1.6"
        >
          <text x="396" y="128">
            Point
          </text>
          <text x="396" y="162">
            made.
          </text>
        </g>
        <text x="44" y="255" fontSize="11" fill="#35211b">
          Point arrives <tspan fontWeight="700">{seconds(travelDuration)}</tspan>
        </text>
        <text x="556" y="255" textAnchor="end" fontSize="11" fill="#35211b">
          Words appear <tspan fontWeight="700">{seconds(cueAt)}</tspan>
        </text>
        <line x1="44" y1="278" x2="556" y2="278" stroke="#412a2140" />
        <line ref={progress} x1="44" y1="278" x2="44" y2="278" stroke="#231b17" strokeWidth="2" />
        <path d={`M${44 + (512 * cueAt) / endAt} 272v12`} stroke="#a03825" strokeWidth="2" />
        <text
          ref={clock}
          x="556"
          y="300"
          textAnchor="end"
          fontFamily="ui-monospace,monospace"
          fontSize="10"
          fill="#594034"
        >
          0.00s
        </text>
      </svg>
      <footer>
        <div role="group" aria-label="Caption starts relative to">
          <button
            type="button"
            disabled={!active}
            onClick={() => selectMode("departure")}
            aria-pressed={mode === "departure"}
          >
            Departure
          </button>
          <button
            type="button"
            disabled={!active}
            onClick={() => selectMode("arrival")}
            aria-pressed={mode === "arrival"}
          >
            Arrival
          </button>
        </div>
        <div className="cc-actions">
          {hasPlayed && !reduced && (
            <button
              type="button"
              className="cc-pause"
              onClick={() => setPlaying((value) => !value)}
              disabled={!active || (!playing && elapsed.current >= endAt)}
              aria-label={playing ? "Pause sequence" : "Resume sequence"}
            >
              {playing ? "Pause" : "Resume"}
            </button>
          )}
          <button type="button" disabled={!active} className="cc-play" onClick={play}>
            <span aria-hidden="true">↗</span>
            {hasPlayed ? "Replay" : "Play"}
          </button>
        </div>
      </footer>
      <p className="cc-sr" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <style>{`.sf-causal-cadence{position:relative;width:100%;height:100%;min-height:300px;overflow:hidden;background:#f09d81;color:#211c17;font-family:Arial,Helvetica,sans-serif;container-type:inline-size}.sf-causal-cadence *{box-sizing:border-box}.sf-causal-cadence svg{display:block;width:100%;height:100%;font-family:Arial,Helvetica,sans-serif;pointer-events:none}.sf-causal-cadence footer{position:absolute;bottom:4%;left:7.3%;right:7.3%;display:flex;align-items:center;justify-content:space-between;gap:8px}.sf-causal-cadence footer>div{display:flex;align-items:center;gap:3px}.sf-causal-cadence button{min-height:44px;border:0;background:transparent;padding:0 12px;color:#50362c;font:12px Arial,sans-serif;cursor:pointer;touch-action:manipulation}.sf-causal-cadence button[aria-pressed=true]{background:#211c17;color:#f4b294;border-radius:3px}.sf-causal-cadence button.cc-play{display:flex;align-items:center;gap:10px;color:#211c17;font-weight:700;padding-right:0;min-width:64px}.sf-causal-cadence .cc-play>span{font-size:24px;font-weight:400}.sf-causal-cadence button.cc-pause{font-size:11px;padding:0 8px}.sf-causal-cadence button:disabled{opacity:.35;cursor:default}.sf-causal-cadence button:focus-visible{outline:2px solid #211c17;outline-offset:3px;border-radius:3px}.sf-causal-cadence button:active:not(:disabled){opacity:.65}.sf-causal-cadence .cc-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@media(hover:hover) and (pointer:fine){.sf-causal-cadence button:hover:not(:disabled){text-decoration:underline;text-underline-offset:4px}}@container(max-width:400px){.sf-causal-cadence button{padding:0 8px;font-size:11px}.sf-causal-cadence .cc-pause{display:none}}`}</style>
    </section>
  )
}
