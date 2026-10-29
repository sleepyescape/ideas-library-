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

type Sources = { ctx: AudioContext; oscs: OscillatorNode[]; gains: GainNode[] }
export default function Example({ active = true }: { active?: boolean }) {
  const [blend, setBlend] = React.useState(0.36),
    [sound, setSound] = React.useState(false),
    [message, setMessage] = React.useState("")
  const audio = React.useRef<Sources | null>(null),
    gen = React.useRef(0)
  const reduced = useReduced()
  const stop = React.useCallback(() => {
    gen.current++
    if (audio.current) {
      closeContext(audio.current.ctx)
      audio.current = null
    }
    setSound(false)
  }, [])
  React.useEffect(
    () => () => {
      gen.current++
      if (audio.current) {
        closeContext(audio.current.ctx)
        audio.current = null
      }
    },
    [],
  )
  React.useEffect(() => {
    if (!active) {
      stop()
    }
  }, [active, stop])
  React.useEffect(() => {
    const a = audio.current
    if (a) {
      a.gains.forEach((g, i) =>
        g.gain.setTargetAtTime(
          (i ? Math.sin((blend * Math.PI) / 2) : Math.cos((blend * Math.PI) / 2)) * 0.045,
          a.ctx.currentTime,
          0.025,
        ),
      )
    }
  }, [blend])
  async function toggle() {
    if (sound) {
      stop()
      return
    }
    stop()
    const request = ++gen.current
    let ctx: AudioContext | null = null
    try {
      ctx = new AudioContext()
      const oscs = [ctx.createOscillator(), ctx.createOscillator()],
        gains = [ctx.createGain(), ctx.createGain()]
      audio.current = { ctx, oscs, gains }
      const destination = ctx.destination
      oscs.forEach((o, i) => {
        o.type = i ? "triangle" : "sine"
        o.frequency.value = i ? 330 : 220
        gains[i].gain.value = (i ? Math.sin((blend * Math.PI) / 2) : Math.cos((blend * Math.PI) / 2)) * 0.045
        o.connect(gains[i])
        gains[i].connect(destination)
      })
      await ctx.resume()
      if (request !== gen.current) {
        closeContext(ctx)
        return
      }
      oscs.forEach((o) => o.start())
      setSound(true)
      setMessage("")
    } catch {
      if (ctx) {
        closeContext(ctx)
      }
      if (audio.current?.ctx === ctx) {
        audio.current = null
      }
      if (request === gen.current) {
        setSound(false)
        setMessage("Audio is unavailable.")
      }
    }
  }
  const a = Math.cos((blend * Math.PI) / 2),
    b = Math.sin((blend * Math.PI) / 2)
  return (
    <div className="sf-stereo-blend" data-error={Boolean(message)} data-paused={!active || reduced}>
      <section className="schematic">
        <header>
          <span>Pure tone</span>
          <button disabled={!active} onClick={() => void toggle()}>
            {sound ? "Mute" : "Enable sound"}
          </button>
          <span>Overtone</span>
        </header>
        <svg
          viewBox="0 0 400 132"
          aria-label={`Equal-power gains ${Math.round(a * 100)} and ${Math.round(b * 100)} percent`}
        >
          <path d="M0 116H400M0 58H400M100 0V132M200 0V132M300 0V132" stroke="#ffffff21" fill="none" />
          {[0, 1].map((i) => (
            <path
              key={i}
              d={Array.from(
                { length: 81 },
                (_, x) =>
                  `${x ? "L" : "M"}${x * 5} ${
                    116 - (i ? Math.sin(((x / 80) * Math.PI) / 2) : Math.cos(((x / 80) * Math.PI) / 2)) * 100
                  }`,
              ).join(" ")}
              fill="none"
              stroke={i ? "#b8d8fc" : "#f4e8c9"}
              strokeWidth="2"
            />
          ))}
          <path d={`M${blend * 400} 0V132`} stroke="#ff6c4a" />
          <circle cx={blend * 400} cy={116 - a * 100} r="5" fill="#f4e8c9" />
          <circle cx={blend * 400} cy={116 - b * 100} r="5" fill="#b8d8fc" />
        </svg>
        <label>
          <span>A</span>
          <input
            type="range"
            aria-label="Equal-power blend"
            min="0"
            max="1"
            step=".01"
            value={blend}
            disabled={!active}
            onChange={(e) => setBlend(+e.target.value)}
          />
          <span>B</span>
        </label>
        <footer>
          <output>{Math.round(a * 100)}%</output>
          <span>Equal power</span>
          <output>{Math.round(b * 100)}%</output>
        </footer>
        {message && <p role="status">{message}</p>}
      </section>
      <style>{`.sf-stereo-blend{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-stereo-blend *{box-sizing:border-box}.sf-stereo-blend button,.sf-stereo-blend input,.sf-stereo-blend select,.sf-stereo-blend textarea{font:inherit;color:inherit}.sf-stereo-blend button{cursor:pointer;touch-action:manipulation}.sf-stereo-blend button:disabled{cursor:default;opacity:.45}.sf-stereo-blend :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-stereo-blend input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-stereo-blend .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-stereo-blend[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-stereo-blend *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-stereo-blend{background:#244d97;color:#e7ecf4;padding:26px}.sf-stereo-blend .schematic{width:min(100%,430px)}.sf-stereo-blend header{display:flex;align-items:center;justify-content:space-between;font-size:11px;margin-bottom:14px}.sf-stereo-blend button{min-height:44px;border:1px solid #ffffff40;border-radius:3px;background:none;color:#f5e9c9;padding:0 12px;font-size:10px}.sf-stereo-blend svg{display:block;width:100%;height:132px;border-block:1px solid #ffffff36}.sf-stereo-blend label{display:flex;gap:14px;align-items:center;margin-top:8px;font:11px ui-monospace,monospace}.sf-stereo-blend input{width:100%;accent-color:#fa704e}.sf-stereo-blend footer{display:flex;justify-content:space-between;font:12px ui-monospace,monospace}.sf-stereo-blend footer span{font:10px -apple-system,sans-serif;opacity:.55}.sf-stereo-blend p{font-size:11px}@container(max-width:330px){.sf-stereo-blend svg{height:119px}.sf-stereo-blend[data-error=true] svg{height:85px}}`}</style>
    </div>
  )
}
