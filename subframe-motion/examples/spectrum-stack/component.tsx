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
function useReduced() {
  const [reduced, setReduced] = React.useState(true)
  React.useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return reduced
}

function closeContext(ctx: AudioContext) {
  if (ctx.state !== "closed") {
    void ctx.close().catch(() => {})
  }
}

type Synth = { ctx: AudioContext; osc: OscillatorNode; analyser: AnalyserNode }
function previewBands(freq: number) {
  return Array.from({ length: 40 }, (_, i) => {
    const hz = 60 * Math.pow(16000 / 60, i / 39)
    let value = 0.025
    for (let h = 1; h <= 12; h++) {
      value = Math.max(value, (Math.exp(-Math.pow(Math.log(hz / (freq * h)) * 11, 2)) * 0.9) / Math.sqrt(h))
    }
    return value
  })
}
export default function Example({ active = true }: { active?: boolean }) {
  const [enabled, setEnabled] = React.useState(false),
    [freq, setFreq] = React.useState(440),
    [levels, setLevels] = React.useState<number[]>(previewBands(440)),
    [notice, setNotice] = React.useState("")
  const synth = React.useRef<Synth | null>(null),
    generation = React.useRef(0)
  const reduced = useReduced()
  const stop = React.useCallback(() => {
    generation.current++
    const s = synth.current
    synth.current = null
    if (s) {
      closeContext(s.ctx)
    }
    setEnabled(false)
    setLevels(previewBands(440))
  }, [])
  React.useEffect(
    () => () => {
      generation.current++
      const s = synth.current
      if (s) {
        closeContext(s.ctx)
        synth.current = null
      }
    },
    [],
  )
  React.useEffect(() => {
    if (!active) {
      stop()
    }
  }, [active, stop])
  async function toggle() {
    if (enabled) {
      stop()
      return
    }
    stop()
    const gen = ++generation.current
    let ctx: AudioContext | null = null
    try {
      ctx = new AudioContext()
      const osc = ctx.createOscillator(),
        gain = ctx.createGain(),
        analyser = ctx.createAnalyser()
      synth.current = { ctx, osc, analyser }
      osc.type = "sawtooth"
      osc.frequency.value = freq
      gain.gain.value = 0.035
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.75
      osc.connect(analyser)
      analyser.connect(gain)
      gain.connect(ctx.destination)
      await ctx.resume()
      if (gen !== generation.current) {
        closeContext(ctx)
        return
      }
      osc.start()
      setEnabled(true)
      setNotice("")
    } catch {
      if (ctx) {
        closeContext(ctx)
      }
      if (synth.current?.ctx === ctx) {
        synth.current = null
      }
      if (gen === generation.current) {
        setEnabled(false)
        setNotice("Audio is unavailable in this browser.")
      }
    }
  }
  React.useEffect(() => {
    if (synth.current) {
      synth.current.osc.frequency.setTargetAtTime(freq, synth.current.ctx.currentTime, 0.025)
    } else {
      setLevels(previewBands(freq))
    }
  }, [freq, enabled])
  React.useEffect(() => {
    if (!enabled || !active) {
      return
    }
    const s = synth.current
    if (!s) {
      return
    }
    const data = new Uint8Array(s.analyser.frequencyBinCount)
    const update = () => {
      s.analyser.getByteFrequencyData(data)
      setLevels(
        Array.from({ length: 40 }, (_, i) => {
          const hz = 60 * Math.pow(16000 / 60, i / 39),
            bin = Math.round(hz / (s.ctx.sampleRate / 2048))
          return Math.max(0.025, data[Math.min(data.length - 1, bin)] / 255)
        }),
      )
    }
    update()
    const id = setInterval(update, reduced ? 250 : 33)
    return () => clearInterval(id)
  }, [enabled, active, reduced])
  return (
    <div className="sf-spectrum-stack" data-error={Boolean(notice)} data-paused={!active || reduced}>
      <section className="instrument">
        <header>
          <strong>{enabled ? "Measured spectrum" : "Spectrum preview"}</strong>
          <output>
            {freq}
            <small>Hz</small>
          </output>
        </header>
        <div className="bands" aria-label={enabled ? "Measured frequency bands" : "Analytical harmonic preview"}>
          {levels.map((v, i) => (
            <i key={i} style={{ transform: `scaleY(${v})`, transition: reduced ? "none" : "transform 70ms linear" }} />
          ))}
        </div>
        <div className="scale" aria-hidden>
          <span>60</span>
          <span>250</span>
          <span>1k</span>
          <span>4k</span>
          <span>16k</span>
        </div>
        <footer>
          <input
            aria-label="Oscillator frequency"
            disabled={!active}
            type="range"
            min="110"
            max="1760"
            step="1"
            value={freq}
            onChange={(e) => setFreq(+e.target.value)}
          />
          <button disabled={!active} onClick={() => void toggle()}>
            {enabled ? "Sound off" : "Enable sound"}
          </button>
        </footer>
        {notice && <p role="status">{notice}</p>}
      </section>
      <style>{`.sf-spectrum-stack{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-spectrum-stack *{box-sizing:border-box}.sf-spectrum-stack button,.sf-spectrum-stack input,.sf-spectrum-stack select,.sf-spectrum-stack textarea{font:inherit;color:inherit}.sf-spectrum-stack button{cursor:pointer;touch-action:manipulation}.sf-spectrum-stack button:disabled{cursor:default;opacity:.45}.sf-spectrum-stack :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-spectrum-stack input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-spectrum-stack .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-spectrum-stack[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-spectrum-stack *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-spectrum-stack{background:#456c9c;color:#f2eadb;padding:28px}.sf-spectrum-stack .instrument{width:min(100%,460px)}.sf-spectrum-stack header{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1px solid #ffffff2b;padding-bottom:12px}.sf-spectrum-stack strong{font-size:11px;font-weight:400;letter-spacing:.4px}.sf-spectrum-stack output{font-size:31px;font-weight:300;letter-spacing:-1px;font-variant-numeric:tabular-nums;line-height:1}.sf-spectrum-stack small{font-size:10px;margin-left:6px;letter-spacing:0}.sf-spectrum-stack .bands{height:135px;display:flex;align-items:flex-end;justify-content:space-between;gap:3px;padding-top:16px;background:repeating-linear-gradient(0deg,transparent 0 31px,#ffffff10 31px 32px)}.sf-spectrum-stack .bands i{height:100%;width:3px;background:#f7ebd2;transform-origin:bottom;display:block}.sf-spectrum-stack .scale{display:flex;justify-content:space-between;font:9px ui-monospace,monospace;opacity:.65;margin-top:10px}.sf-spectrum-stack footer{display:flex;gap:23px;align-items:center;margin-top:15px}.sf-spectrum-stack input{width:100%;accent-color:#ff784b}.sf-spectrum-stack button{min-width:105px;height:44px;background:#f0e5ce;color:#254975;border:0;border-radius:4px;font-size:11px}.sf-spectrum-stack p{font-size:11px;margin:6px 0 0}@container(max-width:330px){.sf-spectrum-stack .bands{height:111px}.sf-spectrum-stack[data-error=true] .bands{height:85px}}`}</style>
    </div>
  )
}
