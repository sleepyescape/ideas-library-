"use client"

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
import { useEffect, useRef, useState } from "react"

const PADS = [
  { name: "Cobalt", note: "C3", hz: 130.81, color: "#173ce0", ink: "#fff", wave: "sine" },
  { name: "Vermilion", note: "D3", hz: 146.83, color: "#f53525", ink: "#360c05", wave: "triangle" },
  { name: "Citron", note: "E3", hz: 164.81, color: "#eff01d", ink: "#262900", wave: "sine" },
  { name: "Emerald", note: "G3", hz: 196, color: "#08764b", ink: "#d1f653", wave: "triangle" },
  { name: "Orchid", note: "A3", hz: 220, color: "#cd76ed", ink: "#2c124b", wave: "sine" },
  { name: "Carbon", note: "B3", hz: 246.94, color: "#232425", ink: "#eee", wave: "triangle" },
] as const

export default function ChromaticSampler({ active = true }: { active?: boolean }) {
  const [sound, setSound] = useState(true)
  const [pressed, setPressed] = useState<number | null>(null)
  const [instant, setInstant] = useState(false)
  const audio = useRef<AudioContext | null>(null)
  const voices = useRef(new Set<OscillatorNode>())
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stop = () => {
    voices.current.forEach((v) => {
      try {
        v.stop()
      } catch {}
    })
    voices.current.clear()
  }
  useEffect(() => {
    if (!active) {
      stop()
      setPressed(null)
    }
  }, [active])
  useEffect(
    () => () => {
      stop()
      if (timer.current) {
        clearTimeout(timer.current)
      }
      void audio.current?.close()
      audio.current = null
    },
    [],
  )
  const enabled = useRef(true)
  const live = useRef(active)
  live.current = active
  const enable = () => {
    enabled.current = !enabled.current
    setSound(enabled.current)
    if (!enabled.current) {
      stop()
    }
  }
  const play = async (index: number) => {
    if (!active) {
      return
    }
    setPressed(index)
    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = setTimeout(() => setPressed(null), 180)
    if (!enabled.current) {
      return
    }
    try {
      audio.current ??= new AudioContext()
      const ctx = audio.current
      if (ctx.state !== "running") {
        await ctx.resume()
      }
      if (!enabled.current || !live.current || audio.current !== ctx || ctx.state !== "running") {
        return
      }
      if (voices.current.size >= 8) {
        stop()
      }
      const osc = ctx.createOscillator(),
        gain = ctx.createGain()
      osc.type = PADS[index].wave
      osc.frequency.value = PADS[index].hz
      const t = ctx.currentTime
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.1, t + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.44)
      osc.connect(gain)
      gain.connect(ctx.destination)
      voices.current.add(osc)
      osc.onended = () => {
        voices.current.delete(osc)
        osc.disconnect()
        gain.disconnect()
      }
      osc.start(t)
      osc.stop(t + 0.46)
    } catch {
      enabled.current = false
      setSound(false)
    }
  }
  return (
    <section
      className="sf-chromatic-sampler"
      data-still={instant || !active}
      onKeyDownCapture={(e) => {
        setInstant(true)
        if (/^[1-6]$/.test(e.key) && !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault()
          void play(Number(e.key) - 1)
        }
      }}
      onPointerDownCapture={() => setInstant(false)}
    >
      <header>
        <button type="button" disabled={!active} onClick={enable} aria-pressed={sound}>
          {sound ? "Sound on" : "Sound off"}
          <span aria-hidden="true">{sound ? "◖))" : "◖×"}</span>
        </button>
      </header>
      <div className="sf-cs-pads">
        {PADS.map((pad, index) => (
          <button
            type="button"
            key={pad.name}
            disabled={!active}
            onClick={() => void play(index)}
            aria-label={`Play ${pad.name}, ${pad.note}`}
            data-pressed={pressed === index}
            style={{ "--pad": pad.color, "--ink": pad.ink } as React.CSSProperties}
          >
            <span className="sf-cs-face">
              <b>{pad.note}</b>
              <svg aria-hidden="true" viewBox="0 0 100 100">
                {index === 0 && (
                  <>
                    <circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" strokeWidth="14" />
                    <circle cx="50" cy="50" r="7" />
                  </>
                )}
                {index === 1 && <path d="M9 33Q29 5 50 33T91 33V67Q71 95 50 67T9 67Z" />}
                {index === 2 && (
                  <path d="M50 5 60 34 90 20 72 47 98 63 66 64 65 96 47 70 22 91 31 61 1 50 33 43 20 12 45 31Z" />
                )}
                {index === 3 && (
                  <>
                    <path d="M10 76V20h18v56zM40 76V36h18v40zM70 76V7h18v69z" />
                    <path d="M10 84h78v8H10z" />
                  </>
                )}
                {index === 4 && <path d="M12 50 50 12 88 50 50 88Z M35 50 50 65 65 50 50 35Z" fillRule="evenodd" />}
                {index === 5 && (
                  <>
                    <path d="M10 10h35v35H10zM55 55h35v35H55z" />
                    <circle cx="72.5" cy="27.5" r="17.5" />
                    <circle cx="27.5" cy="72.5" r="17.5" />
                  </>
                )}
              </svg>
              <span>{pad.name}</span>
            </span>
          </button>
        ))}
      </div>
      <style>{`.sf-chromatic-sampler{width:100%;height:100%;min-height:280px;display:flex;flex-direction:column;background:#f7f7f2;color:#171717;font-family:Arial,sans-serif;overflow:hidden}.sf-chromatic-sampler *{box-sizing:border-box}.sf-chromatic-sampler header{height:55px;flex-shrink:0;padding:0 19px;display:flex;align-items:center;justify-content:flex-end}.sf-chromatic-sampler header button{background:none;border:0;color:#171717;min-height:44px;display:flex;gap:10px;align-items:center;font:11px Arial;cursor:pointer}.sf-chromatic-sampler header button span{font-size:18px}.sf-cs-pads{flex:1;min-height:0;display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;background:#171717;padding:3px;gap:3px}.sf-cs-pads>button{border:0;padding:0;background:#171717;color:var(--ink);position:relative;min-width:0;cursor:pointer;overflow:hidden;touch-action:manipulation}.sf-cs-face{position:absolute;inset:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:13px 15px;background:var(--pad);border:1px solid transparent;transition:transform 110ms cubic-bezier(.2,.7,.3,1);transform-origin:center}.sf-cs-face b{font-size:12px;font-weight:500;font-variant-numeric:tabular-nums}.sf-cs-face svg{position:absolute;width:84px;height:84px;left:50%;top:50%;transform:translate(-50%,-50%);fill:currentColor}.sf-cs-face>span{font-size:10px;letter-spacing:.03em}.sf-cs-pads>button[data-pressed=true] .sf-cs-face,.sf-cs-pads>button:active .sf-cs-face{transform:translate(5px,5px);background:var(--ink);color:var(--pad);border-color:var(--pad)}.sf-chromatic-sampler button:disabled{cursor:default}.sf-chromatic-sampler button:focus-visible{outline:3px solid currentColor;outline-offset:-5px}.sf-chromatic-sampler[data-still=true] .sf-cs-face{transition:none}@media(prefers-reduced-motion:reduce){.sf-cs-face{transition:none;transform:none!important}}`}</style>
    </section>
  )
}
