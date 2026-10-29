/**
 * MIT License
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
import * as React from "react"

export const DEFAULT_CONFIG = { timeScale: 2, noteFrequency: 196, minimumSegment: 10, showEnvelopeCursor: true }
type Config = typeof DEFAULT_CONFIG
type Envelope = { attack: number; decay: number; sustain: number; release: number }
type Voice = {
  context: AudioContext
  oscillator: OscillatorNode
  gain: GainNode
  started: number
  envelope: Envelope
  releaseAt: number | null
  releaseGain: number
  cursor: boolean
  reduced: boolean
}
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : min))
export function envelopeGain(elapsed: number, envelope: Envelope) {
  if (elapsed <= 0) {
    return 0
  }
  if (elapsed < envelope.attack) {
    return elapsed / envelope.attack
  }
  if (elapsed < envelope.attack + envelope.decay) {
    return 1 - ((1 - envelope.sustain) * (elapsed - envelope.attack)) / envelope.decay
  }
  return envelope.sustain
}
const INITIAL = { attack: 0.18, decay: 0.3, sustain: 0.58, release: 0.6 }

function useFittedStage() {
  const viewport = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)
  React.useLayoutEffect(() => {
    const element = viewport.current!
    const fit = () => setScale(Math.min(element.clientWidth / 600, element.clientHeight / 375))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { viewport, scale }
}

export default function Example({ active = true, config }: { active?: boolean; config?: Partial<Config> }) {
  const fitted = useFittedStage()
  const settings = { ...DEFAULT_CONFIG, ...config }
  const minimum = clamp(settings.minimumSegment, 5, 50) / 1000
  const [envelope, setEnvelope] = React.useState<Envelope>(INITIAL)
  const [keyboard, setKeyboard] = React.useState(true)
  const [stage, setStage] = React.useState("Ready")
  const [held, setHeld] = React.useState(false)
  const [audioError, setAudioError] = React.useState(false)
  const screen = React.useRef<HTMLDivElement>(null),
    cursor = React.useRef<HTMLDivElement>(null),
    meter = React.useRef<HTMLDivElement>(null)
  const voice = React.useRef<Voice | null>(null),
    intent = React.useRef(false),
    frame = React.useRef(0),
    generation = React.useRef(0)
  const drag = React.useRef<{
    kind: "attack" | "decay" | "release"
    base: Envelope
    owner: HTMLButtonElement
    id: number
  } | null>(null)
  const view = Math.max(
    clamp(settings.timeScale, 0.5, 4),
    envelope.attack + envelope.decay + 0.6 + envelope.release + 0.08,
  )
  const x = (t: number) => 24 + (t / view) * 388
  const points = [
    { kind: "attack" as const, x: x(envelope.attack), y: 24 },
    { kind: "decay" as const, x: x(envelope.attack + envelope.decay), y: 126 - envelope.sustain * 102 },
    { kind: "release" as const, x: x(envelope.attack + envelope.decay + 0.6 + envelope.release), y: 126 },
  ]
  const curve = `M24 126 L${points[0].x} 24 L${points[1].x} ${points[1].y} H${x(
    envelope.attack + envelope.decay + 0.6,
  )} L${points[2].x} 126`
  const dispose = React.useCallback(() => {
    generation.current++
    intent.current = false
    cancelAnimationFrame(frame.current)
    const v = voice.current
    voice.current = null
    if (v) {
      v.oscillator.stop()
      v.oscillator.disconnect()
      v.gain.disconnect()
      if (v.context.state !== "closed") {
        void v.context.close()
      }
    }
    if (meter.current) {
      meter.current.style.transform = "scaleX(0)"
    }
    if (cursor.current) {
      cursor.current.style.opacity = "0"
    }
    setHeld(false)
    setStage("Ready")
  }, [])
  const cancelDrag = React.useCallback(() => {
    const d = drag.current
    drag.current = null
    if (d) {
      setEnvelope(d.base)
      if (d.owner.hasPointerCapture(d.id)) {
        d.owner.releasePointerCapture(d.id)
      }
    }
  }, [])
  const release = React.useCallback(() => {
    intent.current = false
    setHeld(false)
    const v = voice.current
    if (!v || v.releaseAt !== null) {
      return
    }
    const now = v.context.currentTime
    const gain = envelopeGain(now - v.started, v.envelope)
    v.gain.gain.cancelScheduledValues(now)
    v.gain.gain.setValueAtTime(gain * 0.13, now)
    v.gain.gain.linearRampToValueAtTime(0, now + v.envelope.release)
    v.releaseAt = now
    v.releaseGain = gain
    setStage("Release")
  }, [])
  React.useEffect(() => {
    if (!active) {
      dispose()
      cancelDrag()
    }
  }, [active, dispose, cancelDrag])
  React.useEffect(() => {
    setEnvelope((v) => ({
      ...v,
      attack: Math.max(v.attack, minimum),
      decay: Math.max(v.decay, minimum),
      release: Math.max(v.release, minimum),
    }))
  }, [minimum])
  React.useEffect(() => {
    const blur = () => {
      release()
      cancelDrag()
    }
    const hidden = () => {
      if (document.hidden) {
        dispose()
        cancelDrag()
      }
    }
    window.addEventListener("blur", blur)
    document.addEventListener("visibilitychange", hidden)
    return () => {
      window.removeEventListener("blur", blur)
      document.removeEventListener("visibilitychange", hidden)
      dispose()
    }
  }, [dispose, release, cancelDrag])
  async function play() {
    if (!active || intent.current) {
      return
    }
    dispose()
    intent.current = true
    setHeld(true)
    setAudioError(false)
    const token = generation.current
    try {
      const context = new AudioContext()
      await context.resume()
      if (!intent.current || token !== generation.current) {
        void context.close()
        return
      }
      const oscillator = context.createOscillator(),
        gain = context.createGain(),
        start = context.currentTime
      oscillator.type = "triangle"
      oscillator.frequency.value = clamp(settings.noteFrequency, 98, 392)
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.13, start + envelope.attack)
      gain.gain.linearRampToValueAtTime(envelope.sustain * 0.13, start + envelope.attack + envelope.decay)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(start)
      voice.current = {
        context,
        oscillator,
        gain,
        started: start,
        envelope: { ...envelope },
        releaseAt: null,
        releaseGain: 0,
        cursor: settings.showEnvelopeCursor,
        reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      }
      const tick = () => {
        const v = voice.current
        if (!v) {
          return
        }
        const elapsed = v.context.currentTime - v.started,
          released = v.releaseAt === null ? 0 : v.context.currentTime - v.releaseAt
        if (v.releaseAt !== null && released >= v.envelope.release) {
          dispose()
          return
        }
        const amplitude =
          v.releaseAt === null ? envelopeGain(elapsed, v.envelope) : v.releaseGain * (1 - released / v.envelope.release)
        const name =
          v.releaseAt !== null
            ? "Release"
            : elapsed < v.envelope.attack
            ? "Attack"
            : elapsed < v.envelope.attack + v.envelope.decay
            ? "Decay"
            : "Sustain"
        setStage((previous) => (previous === name ? previous : name))
        if (meter.current) {
          meter.current.style.transform = `scaleX(${v.reduced ? 1 : amplitude})`
        }
        if (cursor.current) {
          const t =
            v.releaseAt !== null
              ? v.envelope.attack + v.envelope.decay + 0.6 + released
              : Math.min(elapsed, v.envelope.attack + v.envelope.decay + 0.6)
          cursor.current.style.transform = `translateX(${((24 + (t / view) * 388) / 436) * 100}%)`
          cursor.current.style.opacity = v.cursor && !v.reduced ? "1" : "0"
        }
        frame.current = requestAnimationFrame(tick)
      }
      frame.current = requestAnimationFrame(tick)
    } catch {
      dispose()
      setAudioError(true)
    }
  }
  function move(event: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current,
      element = screen.current
    if (!d || !element) {
      return
    }
    const rect = element.getBoundingClientRect(),
      px = ((event.clientX - rect.left) / rect.width) * 436,
      py = ((event.clientY - rect.top) / rect.height) * 150
    const t = ((px - 24) / 388) * view
    setEnvelope((e) =>
      d.kind === "attack"
        ? { ...e, attack: clamp(t, minimum, 1.2) }
        : d.kind === "decay"
        ? {
            ...e,
            decay: clamp(t - e.attack, minimum, 1.2),
            sustain: Math.round(clamp((126 - py) / 102, 0, 1) * 100) / 100,
          }
        : { ...e, release: clamp(t - e.attack - e.decay - 0.6, minimum, 1.5) },
    )
  }
  return (
    <div
      ref={fitted.viewport}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "16 / 10",
        position: "relative",
        overflow: "hidden",
        background: "#333a3c",
      }}
    >
      <div
        style={{
          width: 600,
          height: 375,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${fitted.scale})`,
          transformOrigin: "center",
        }}
      >
        <div
          className="envelope-shaper"
          data-envelope={JSON.stringify(envelope)}
          data-stage={stage}
          data-keyboard={keyboard}
          onKeyDownCapture={() => setKeyboard(true)}
          onPointerDownCapture={() => setKeyboard(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              cancelDrag()
              release()
            }
          }}
        >
          <style>{`
    .envelope-shaper{height:100%;width:100%;display:flex;align-items:center;justify-content:center;background:#333a3c;font-family:Arial,sans-serif;padding:25px;box-sizing:border-box;color:#252a2c}.envelope-shaper *{box-sizing:border-box}.es-unit{width:500px;padding:21px 26px 20px;border-radius:16px;background:linear-gradient(135deg,#e6e6e0,#c7cac6);border:1px solid #f0f0e8;box-shadow:0 2px 0 #929894,0 5px 0 #6e7774,0 18px 30px #0005;position:relative}.es-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.es-header strong{font-size:11px;letter-spacing:1px;font-weight:700}.es-header span{font:9px monospace;color:#6a7471;letter-spacing:.6px}.es-screen{height:154px;border:2px solid #78817a;border-radius:7px;background:#172722;box-shadow:inset 0 3px 9px #000a,0 1px #ffffffa1;position:relative;overflow:hidden}.es-screen svg{width:100%;height:100%;display:block}.es-cursor{position:absolute;left:0;top:13%;height:72%;width:100%;opacity:0;pointer-events:none}.es-cursor:after{content:"";position:absolute;inset:0 auto 0 0;width:1px;background:#e8b857;box-shadow:0 0 7px #edbc5480}.es-handle{position:absolute;width:44px;height:44px;transform:translate(-50%,-50%);border:0;background:none;touch-action:none;cursor:ew-resize;display:grid;place-items:center;padding:0}.es-handle:after{content:"";width:8px;height:8px;border:2px solid #edc376;background:#20372d;box-shadow:0 0 0 3px #152b22;border-radius:50%}.es-handle[data-kind=decay]{cursor:move}.es-handle:hover:after,.es-handle:active:after{background:#edc376;box-shadow:0 0 0 4px #edc37625}.envelope-shaper[data-keyboard=true] .es-handle:focus-visible{outline:1px solid #f0c676;outline-offset:-6px;border-radius:50%}.es-values{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 2px 15px;border-bottom:1px solid #aeb6ae80}.es-value span{display:block;font:8px monospace;letter-spacing:.7px;color:#66716b;margin-bottom:4px}.es-value strong{font:13px monospace;font-weight:400}.es-value small{font:9px monospace;color:#67736a;margin-left:3px}.es-footer{display:flex;align-items:center;justify-content:space-between;padding-top:13px}.es-state{display:flex;align-items:center;gap:10px;font-size:10px;color:#4e5a52}.es-meter{width:47px;height:5px;background:#a4aea6;border-radius:1px;overflow:hidden}.es-meter div{height:100%;background:#526d45;transform:scaleX(0);transform-origin:left}.es-key{position:relative;min-width:124px;height:38px;border:1px solid #6e7970;border-radius:7px;background:linear-gradient(#f3f1e7,#c9d0c5);box-shadow:inset 0 1px #fff,0 3px 0 #7c877d,0 4px 5px #35463630;color:#344334;font-size:11px;cursor:pointer;touch-action:none;transition:transform 90ms ease,box-shadow 90ms ease}.es-key[aria-pressed=true]{transform:translateY(2px);box-shadow:inset 0 1px 3px #34433430,0 1px 0 #7c877d}.es-key:before{content:"";display:inline-block;width:5px;height:5px;margin-right:10px;border-radius:50%;background:#7c8b72;box-shadow:inset 0 1px 2px #0003}.es-key[aria-pressed=true]:before{background:#f9bd55;box-shadow:0 0 5px #f1a424}.envelope-shaper[data-keyboard=true] .es-key:focus-visible{outline:2px solid #344b2e;outline-offset:4px}.es-key:disabled{opacity:.5;cursor:default}.es-screw{position:absolute;width:4px;height:4px;border:1px solid #89968b;border-radius:50%;box-shadow:0 1px #fff8;right:9px;top:9px}.es-screw:after{content:"";position:absolute;top:1px;left:0;width:2px;height:1px;background:#879187}
    @media(prefers-reduced-motion:reduce){.es-key{transition:none}}
    `}</style>
          <section className="es-unit" aria-label="Amplitude envelope instrument">
            <i className="es-screw" />
            <div className="es-header">
              <strong>CONTOUR</strong>
              <span>AMPLITUDE</span>
            </div>
            <div className="es-screen" ref={screen}>
              <svg viewBox="0 0 436 150" preserveAspectRatio="none" aria-hidden="true">
                <path d="M24 24H412M24 75H412M24 126H412" stroke="#6b8b7020" strokeWidth=".6" />
                {Array.from({ length: 13 }, (_, i) => (
                  <path key={i} d={`M${24 + i * 32.3} 24V126`} stroke="#6b8b7020" strokeWidth=".6" />
                ))}
                <path d={`${curve} H24 Z`} fill="#d4b5680e" />
                <path d={curve} fill="none" stroke="#e6bd70" strokeWidth="1.6" strokeLinejoin="round" />
                <path
                  d={`M${x(envelope.attack + envelope.decay + 0.6)} 24V126`}
                  stroke="#a5bca74a"
                  strokeWidth=".6"
                  strokeDasharray="2 4"
                />
                <text x="26" y="143" fill="#85917c" fontFamily="monospace" fontSize="7">
                  0
                </text>
                <text x="408" y="143" fill="#85917c" fontFamily="monospace" fontSize="7" textAnchor="end">
                  {view.toFixed(1)} s
                </text>
              </svg>
              <div className="es-cursor" ref={cursor} />
              {points.map((p) => (
                <button
                  key={p.kind}
                  className="es-handle"
                  data-kind={p.kind}
                  role="slider"
                  aria-label={p.kind === "decay" ? "Decay and sustain" : `${p.kind[0].toUpperCase()}${p.kind.slice(1)}`}
                  aria-valuemin={minimum * 1000}
                  aria-valuemax={p.kind === "release" ? 1500 : 1200}
                  aria-valuenow={Math.round(envelope[p.kind] * 1000)}
                  aria-valuetext={
                    p.kind === "decay"
                      ? `${Math.round(envelope.decay * 1000)} milliseconds decay, ${Math.round(
                          envelope.sustain * 100,
                        )} percent sustain. Left and right change decay; up and down change sustain.`
                      : `${Math.round(envelope[p.kind] * 1000)} milliseconds`
                  }
                  disabled={!active}
                  style={{ left: `${(p.x / 436) * 100}%`, top: `${(p.y / 150) * 100}%` }}
                  onPointerDown={(e) => {
                    if (e.button !== 0) {
                      return
                    }
                    e.preventDefault()
                    e.currentTarget.focus()
                    drag.current = { kind: p.kind, base: { ...envelope }, owner: e.currentTarget, id: e.pointerId }
                    e.currentTarget.setPointerCapture(e.pointerId)
                  }}
                  onPointerMove={move}
                  onPointerUp={(e) => {
                    drag.current = null
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                      e.currentTarget.releasePointerCapture(e.pointerId)
                    }
                  }}
                  onPointerCancel={cancelDrag}
                  onLostPointerCapture={() => {
                    if (drag.current) {
                      cancelDrag()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
                      return
                    }
                    e.preventDefault()
                    const direction = ["ArrowLeft", "ArrowDown"].includes(e.key) ? -1 : 1
                    setEnvelope((v) =>
                      p.kind === "decay" && ["ArrowUp", "ArrowDown"].includes(e.key)
                        ? { ...v, sustain: clamp(v.sustain + direction * 0.05, 0, 1) }
                        : {
                            ...v,
                            [p.kind]: clamp(v[p.kind] + direction * 0.01, minimum, p.kind === "release" ? 1.5 : 1.2),
                          },
                    )
                  }}
                />
              ))}
            </div>
            <div className="es-values">
              {(
                [
                  ["Attack", envelope.attack * 1000, "ms"],
                  ["Decay", envelope.decay * 1000, "ms"],
                  ["Sustain", envelope.sustain * 100, "%"],
                  ["Release", envelope.release * 1000, "ms"],
                ] as const
              ).map(([label, value, unit]) => (
                <div className="es-value" key={label}>
                  <span>{label.toUpperCase()}</span>
                  <strong>{Math.round(value)}</strong>
                  <small>{unit}</small>
                </div>
              ))}
            </div>
            <div className="es-footer">
              <div className="es-state">
                <div className="es-meter">
                  <div ref={meter} />
                </div>
                <span role="status">{audioError ? "Audio unavailable" : stage}</span>
              </div>
              <button
                className="es-key"
                aria-pressed={held}
                aria-label="Hold to play note"
                disabled={!active}
                onPointerDown={(e) => {
                  if (e.button !== 0) {
                    return
                  }
                  e.preventDefault()
                  e.currentTarget.focus()
                  e.currentTarget.setPointerCapture(e.pointerId)
                  void play()
                }}
                onPointerUp={release}
                onPointerCancel={release}
                onLostPointerCapture={release}
                onBlur={release}
                onKeyDown={(e) => {
                  if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                    e.preventDefault()
                    void play()
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault()
                    release()
                  }
                }}
              >
                Hold to play
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
