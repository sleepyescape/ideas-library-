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

export type Config = {
  portSpacing: number
  signalFrequency: number
  showIncompatiblePorts: boolean
  cableSettleMs: number
}
export const DEFAULT_CONFIG: Config = {
  portSpacing: 64,
  signalFrequency: 220,
  showIncompatiblePorts: true,
  cableSettleMs: 160,
}
type Output = "sine" | "triangle" | "filter"
type Input = "filter-in" | "output"
type Cable = { from: Output; to: Input; animate?: boolean }
type Point = { x: number; y: number }
type AudioRack = {
  context: AudioContext
  oscillators: OscillatorNode[]
  sources: GainNode[]
  filter: BiquadFilterNode
  analyser: AnalyserNode
  master: GainNode
}
const NAMES = { sine: "Sine", triangle: "Triangle", filter: "Filter", "filter-in": "Filter", output: "Output" }
const COLORS = { sine: "#deddd3", triangle: "#ec6856", filter: "#ec6856" }
const bound = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
const curve = (from: Point, to: Point) =>
  `M${from.x} ${from.y}C${from.x + 55} ${from.y + 20},${to.x - 55} ${to.y + 20},${to.x} ${to.y}`

export default function Example({ active = true, config }: { active?: boolean; config?: Partial<Config> }) {
  const settings = { ...DEFAULT_CONFIG, ...config }
  settings.portSpacing = bound(settings.portSpacing, 48, 80)
  settings.signalFrequency = bound(settings.signalFrequency, 110, 440)
  settings.cableSettleMs = bound(settings.cableSettleMs, 0, 240)
  const [cables, setCables] = React.useState<Cable[]>([
    { from: "sine", to: "filter-in" },
    { from: "filter", to: "output" },
  ])
  const [pending, setPending] = React.useState<Output | null>(null)
  const [point, setPoint] = React.useState<Point | null>(null)
  const [playing, setPlaying] = React.useState(false)
  const [status, setStatus] = React.useState("Connect a source to an input")
  const [keyboard, setKeyboard] = React.useState(false)
  const body = React.useRef<HTMLDivElement>(null)
  const meter = React.useRef<HTMLSpanElement>(null)
  const rack = React.useRef<AudioRack | null>(null)
  const frame = React.useRef(0)
  const drag = React.useRef<{ from: Output; start: Point; owner: HTMLButtonElement; pointerId: number } | null>(null)
  const positions: Record<Output | Input, Point> = {
    sine: { x: 132, y: 106 - settings.portSpacing / 2 },
    triangle: { x: 132, y: 106 + settings.portSpacing / 2 },
    "filter-in": { x: 244, y: 106 },
    filter: { x: 344, y: 106 },
    output: { x: 444, y: 106 },
  }
  const cancelDrag = React.useCallback(() => {
    const previous = drag.current
    drag.current = null
    if (previous?.owner.hasPointerCapture(previous.pointerId)) {
      previous.owner.releasePointerCapture(previous.pointerId)
    }
    setPending(null)
    setPoint(null)
  }, [])
  const stop = React.useCallback(() => {
    cancelAnimationFrame(frame.current)
    const previous = rack.current
    rack.current = null
    if (previous) {
      previous.oscillators.forEach((node) => node.stop())
      previous.master.disconnect()
      if (previous.context.state !== "closed") {
        void previous.context.close()
      }
    }
    if (meter.current) {
      meter.current.style.transform = "scaleX(0)"
    }
    setPlaying(false)
  }, [])
  React.useEffect(() => {
    if (!active) {
      stop()
      cancelDrag()
    }
  }, [active, stop, cancelDrag])
  React.useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        stop()
        cancelDrag()
      }
    }
    document.addEventListener("visibilitychange", hide)
    return () => {
      document.removeEventListener("visibilitychange", hide)
      stop()
    }
  }, [stop, cancelDrag])
  React.useEffect(() => {
    cancelDrag()
  }, [settings.portSpacing, cancelDrag])
  React.useEffect(() => {
    const audio = rack.current
    if (!audio || !playing) {
      return
    }
    audio.sources.forEach((node) => node.disconnect())
    audio.filter.disconnect()
    cables.forEach((cable) => {
      const from = cable.from === "filter" ? audio.filter : audio.sources[cable.from === "sine" ? 0 : 1]
      from.connect(cable.to === "filter-in" ? audio.filter : audio.master)
    })
  }, [cables, playing])
  React.useEffect(() => {
    if (!playing) {
      return
    }
    const samples = new Float32Array(256)
    const update = () => {
      const audio = rack.current
      if (!audio) {
        return
      }
      audio.analyser.getFloatTimeDomainData(samples)
      const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length)
      if (meter.current) {
        meter.current.style.transform = `scaleX(${Math.min(1, rms * 18)})`
      }
      frame.current = requestAnimationFrame(update)
    }
    frame.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame.current)
  }, [playing])
  const listen = async () => {
    if (!active) {
      return
    }
    if (rack.current) {
      stop()
      return
    }
    if (typeof AudioContext === "undefined") {
      setStatus("Audio is unavailable in this browser")
      return
    }
    const context = new AudioContext()
    const master = context.createGain()
    master.gain.value = 0.55
    const analyser = context.createAnalyser()
    analyser.fftSize = 256
    master.connect(analyser)
    analyser.connect(context.destination)
    const filter = context.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 650
    filter.Q.value = 0.7
    const sources = [context.createGain(), context.createGain()]
    sources.forEach((node) => {
      node.gain.value = 0.045
    })
    const oscillators = sources.map((gain, i) => {
      const oscillator = context.createOscillator()
      oscillator.type = i ? "triangle" : "sine"
      oscillator.frequency.value = settings.signalFrequency * (i ? 1.5 : 1)
      oscillator.connect(gain)
      oscillator.start()
      return oscillator
    })
    const audio = { context, master, analyser, filter, sources, oscillators }
    rack.current = audio
    try {
      await context.resume()
      if (rack.current === audio) {
        setPlaying(true)
        setStatus("Listening to the connected route")
      }
    } catch {
      if (rack.current === audio) {
        stop()
        setStatus("Audio could not start. Try Listen again.")
      }
    }
  }
  const connect = (from: Output, to: Input) => {
    if (!active) {
      return
    }
    if (from === "filter" && to === "filter-in") {
      setStatus("A filter cannot connect to itself")
      return
    }
    if (cables.some((c) => c.from === from && c.to === to)) {
      setStatus("That connection already exists")
      cancelDrag()
      return
    }
    const retained = to === "filter-in" ? cables.filter((c) => c.to !== "filter-in") : cables
    if (retained.length >= 3) {
      setStatus("Remove a cable before adding another")
      cancelDrag()
      return
    }
    setCables([...retained, { from, to, animate: true }])
    setStatus(`${NAMES[from]} connected to ${NAMES[to]}`)
    cancelDrag()
  }
  const localPoint = (event: React.PointerEvent): Point => {
    const rect = body.current!.getBoundingClientRect()
    return { x: ((event.clientX - rect.left) / rect.width) * 520, y: ((event.clientY - rect.top) / rect.height) * 210 }
  }
  const begin = (event: React.PointerEvent<HTMLButtonElement>, from: Output) => {
    if (!active || event.button !== 0) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    const start = localPoint(event)
    drag.current = { from, start, owner: event.currentTarget, pointerId: event.pointerId }
    setPending(from)
    setPoint(null)
    setStatus(`Choose an input for ${NAMES[from]}`)
  }
  const end = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current
    if (!current) {
      return
    }
    const endPoint = localPoint(event)
    const moved = Math.hypot(endPoint.x - current.start.x, endPoint.y - current.start.y) > 7
    drag.current = null
    if (current.owner.hasPointerCapture(current.pointerId)) {
      current.owner.releasePointerCapture(current.pointerId)
    }
    if (moved) {
      const target = (["filter-in", "output"] as Input[]).find(
        (id) => Math.hypot(positions[id].x - endPoint.x, positions[id].y - endPoint.y) < 28,
      )
      if (target) {
        connect(current.from, target)
      } else {
        setPending(null)
        setStatus("Connection cancelled")
      }
    }
    setPoint(null)
  }
  return (
    <section
      className="sf-audio-patchbay"
      aria-label="Audio routing patchbay"
      data-still={!active || keyboard}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDownCapture={(event) => {
        setKeyboard(true)
        if (event.key === "Escape") {
          cancelDrag()
          setStatus("Connection cancelled")
        }
      }}
      style={{ "--ap-duration": `${settings.cableSettleMs}ms` } as React.CSSProperties}
    >
      <div className="ap-rack">
        <header>
          <strong>Signal path</strong>
          <button
            type="button"
            className="ap-listen"
            disabled={!active}
            onClick={() => {
              void listen()
            }}
            aria-pressed={playing}
          >
            <svg viewBox="0 0 16 16" aria-hidden>
              {playing ? <path d="M5 4v8M11 4v8" /> : <path d="m5 3 8 5-8 5Z" />}
            </svg>
            {playing ? "Stop" : "Listen"}
          </button>
        </header>
        <div className="ap-body" ref={body}>
          <svg viewBox="0 0 520 210" aria-hidden>
            {["sine", "triangle"].map((id) => {
              const key = id as "sine" | "triangle"
              const p = positions[key]
              return (
                <g key={id}>
                  <rect x="24" y={p.y - 22} width="108" height="44" rx="7" fill="#343a3f" stroke="#5b6368" />
                  <text x="39" y={p.y - 2} className="ap-node-label">
                    {NAMES[key]}
                  </text>
                  <path
                    d={key === "sine" ? `M39 ${p.y + 10}q5-9 10 0t10 0t10 0` : `M39 ${p.y + 10}l8-5 8 10 8-10 8 5`}
                    fill="none"
                    stroke="#9ba4a8"
                    strokeWidth="1.2"
                  />
                </g>
              )
            })}
            <rect x="244" y="72" width="100" height="68" rx="7" fill="#343a3f" stroke="#5b6368" />
            <text x="294" y="96" textAnchor="middle" className="ap-node-label">
              Low-pass
            </text>
            <path d="M272 119h20q5 0 8 6l8 8" fill="none" stroke="#9ba4a8" strokeWidth="1.3" />
            <rect x="444" y="72" width="60" height="68" rx="7" fill="#343a3f" stroke="#5b6368" />
            <text x="474" y="97" textAnchor="middle" className="ap-node-label">
              Output
            </text>
            <path d="M465 114h4l5-4v16l-5-4h-4Zm13-1q7 5 0 10" fill="none" stroke="#9ba4a8" strokeWidth="1.3" />
            {cables.map((cable) => (
              <g key={`${cable.from}:${cable.to}`} className={cable.animate ? "ap-cable" : undefined}>
                <path
                  d={curve(positions[cable.from], positions[cable.to])}
                  fill="none"
                  stroke="#111518"
                  strokeWidth="7"
                  transform="translate(0 3)"
                  opacity=".45"
                />
                <path
                  d={curve(positions[cable.from], positions[cable.to])}
                  fill="none"
                  stroke={COLORS[cable.from]}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>
            ))}
            {pending && point ? (
              <path
                d={curve(positions[pending], point)}
                fill="none"
                stroke={COLORS[pending]}
                strokeWidth="2"
                strokeDasharray="5 5"
              />
            ) : null}
            {(Object.keys(positions) as (Output | Input)[]).map((id) => {
              const p = positions[id]
              const incompatible = pending === "filter" && id === "filter-in"
              return (
                <g key={id} opacity={incompatible ? (settings.showIncompatiblePorts ? 0.3 : 0) : 1}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="10"
                    fill="#191d20"
                    stroke={pending === id ? "#f2f1e7" : "#a4adaf"}
                    strokeWidth="2"
                  />
                  <circle cx={p.x} cy={p.y} r="4" fill={pending === id ? "#deddd3" : "#858f92"} />
                </g>
              )
            })}
            <text x="24" y="188" className="ap-section-label">
              SOURCES
            </text>
            <text x="244" y="188" className="ap-section-label">
              PROCESS
            </text>
            <text x="444" y="188" className="ap-section-label">
              OUT
            </text>
          </svg>
          {(["sine", "triangle", "filter"] as Output[]).map((id) => (
            <button
              type="button"
              key={id}
              className="ap-socket"
              style={{ left: `${(positions[id].x / 520) * 100}%`, top: `${(positions[id].y / 210) * 100}%` }}
              aria-label={`Connect ${NAMES[id]} output`}
              aria-pressed={pending === id}
              disabled={!active}
              onPointerDown={(event) => begin(event, id)}
              onPointerMove={(event) => {
                if (drag.current) {
                  setPoint(localPoint(event))
                }
              }}
              onPointerUp={end}
              onPointerCancel={cancelDrag}
              onLostPointerCapture={() => {
                if (drag.current) {
                  cancelDrag()
                }
              }}
              onClick={(event) => {
                if (event.detail === 0 && active) {
                  setPending(pending === id ? null : id)
                  setPoint(null)
                  setStatus(`Choose an input for ${NAMES[id]}`)
                }
              }}
            />
          ))}
          {(["filter-in", "output"] as Input[]).map((id) => (
            <button
              type="button"
              key={id}
              className="ap-socket ap-input"
              style={{
                left: `${(positions[id].x / 520) * 100}%`,
                top: `${(positions[id].y / 210) * 100}%`,
                visibility:
                  pending === "filter" && id === "filter-in" && !settings.showIncompatiblePorts ? "hidden" : undefined,
              }}
              aria-label={`${NAMES[id]} input${pending ? `, connect ${NAMES[pending]}` : ", select a source first"}`}
              disabled={!active || !pending}
              onClick={() => {
                if (pending) {
                  connect(pending, id)
                }
              }}
            />
          ))}
        </div>
        <footer>
          <div className="ap-routes" aria-label="Connections">
            {cables.map((cable) => (
              <button
                type="button"
                key={`${cable.from}:${cable.to}`}
                disabled={!active}
                aria-label={`Disconnect ${NAMES[cable.from]} from ${NAMES[cable.to]}`}
                onClick={() => {
                  setCables((previous) => previous.filter((c) => c !== cable))
                  setStatus(`${NAMES[cable.from]} disconnected from ${NAMES[cable.to]}`)
                }}
              >
                <i style={{ background: COLORS[cable.from] }} />
                {NAMES[cable.from]}
                <span>→</span>
                {NAMES[cable.to]}
                <b aria-hidden>×</b>
              </button>
            ))}
          </div>
          <div className="ap-level" aria-label={playing ? "Output level" : "Audio stopped"}>
            <span ref={meter} />
          </div>
        </footer>
        <span className="ap-status" role="status">
          {status}
        </span>
      </div>
      <style>{`
.sf-audio-patchbay{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;place-items:center;padding:25px;background:#202427;color:#ecece6;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;isolation:isolate}.sf-audio-patchbay *{box-sizing:border-box}.sf-audio-patchbay button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation}.sf-audio-patchbay button:disabled{cursor:default}.sf-audio-patchbay .ap-rack{width:100%;max-width:550px;background:#2d3134;border:1px solid #51575b;border-radius:14px;box-shadow:0 2px 4px #10131430,0 18px 35px #10131435;overflow:hidden}.sf-audio-patchbay header{height:59px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid #444b50}.sf-audio-patchbay header strong{font-size:14px;font-weight:500;letter-spacing:-.15px}.sf-audio-patchbay .ap-listen{height:44px;min-width:84px;border:1px solid #727b80;background:#3b4247;border-radius:7px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:11px}.sf-audio-patchbay .ap-listen svg{width:12px;height:12px;fill:currentColor;stroke:currentColor;stroke-width:1.7}.sf-audio-patchbay .ap-listen[aria-pressed=true]{background:#deddd3;border-color:#deddd3;color:#2b302d}.sf-audio-patchbay .ap-body{position:relative;aspect-ratio:520/210;width:100%}.sf-audio-patchbay .ap-body>svg{display:block;width:100%;height:100%}.sf-audio-patchbay .ap-node-label{font:11px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:#ecece6}.sf-audio-patchbay .ap-section-label{font:8px ui-monospace,SFMono-Regular,monospace;letter-spacing:1px;fill:#8f999e}.sf-audio-patchbay .ap-socket{position:absolute;transform:translate(-50%,-50%);width:44px;height:44px;border:0;background:transparent;border-radius:50%;padding:0;touch-action:none}.sf-audio-patchbay .ap-socket:focus-visible{outline:2px solid #fff2c7;outline-offset:-7px}.sf-audio-patchbay .ap-input:not(:disabled){background:radial-gradient(circle,transparent 12px,#deddd315 12px,#deddd315 19px,transparent 19px)}.sf-audio-patchbay .ap-cable{animation:ap-connect var(--ap-duration) ease-out}.sf-audio-patchbay footer{min-height:54px;display:flex;align-items:center;gap:12px;justify-content:space-between;padding:4px 18px;border-top:1px solid #444b50}.sf-audio-patchbay .ap-routes{display:flex;flex-wrap:wrap;gap:4px}.sf-audio-patchbay .ap-routes button{display:flex;align-items:center;gap:5px;min-height:44px;background:none;border:0;border-radius:5px;padding:4px;font-size:9px;color:#c1c9cb;white-space:nowrap}.sf-audio-patchbay .ap-routes i{width:4px;height:4px;border-radius:50%}.sf-audio-patchbay .ap-routes span{color:#879297}.sf-audio-patchbay .ap-routes b{font-size:13px;font-weight:400;color:#9eaaae;padding-left:2px}.sf-audio-patchbay .ap-level{width:40px;height:5px;border-radius:1px;background:#191d20;flex:none;overflow:hidden}.sf-audio-patchbay .ap-level span{display:block;width:100%;height:100%;background:#deddd3;transform:scaleX(0);transform-origin:left}.sf-audio-patchbay .ap-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-audio-patchbay button:focus-visible{outline:2px solid #fff2c7;outline-offset:2px}.sf-audio-patchbay[data-still=true] *{animation:none!important;transition:none!important}@keyframes ap-connect{from{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){.sf-audio-patchbay *{animation:none!important;transition:none!important}}@media(max-width:430px){.sf-audio-patchbay{padding:14px}.sf-audio-patchbay header{padding:0 15px}.sf-audio-patchbay footer{padding:4px 10px}.sf-audio-patchbay .ap-routes button{font-size:8px;gap:3px}}
    `}</style>
    </section>
  )
}
