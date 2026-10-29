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

const CUES = [
  { at: 0, title: "First light", detail: "A room wakes up." },
  { at: 7, title: "Open water", detail: "The horizon widens." },
  { at: 16, title: "Low tide", detail: "Everything slows down." },
  { at: 25, title: "Home again", detail: "A familiar place." },
]
const DURATION = 32
export default function Example({ active = true }: { active?: boolean }) {
  const [time, setTime] = React.useState(9.4),
    [playing, setPlaying] = React.useState(false),
    [hover, setHover] = React.useState<number | null>(null)
  const clock = React.useRef(time),
    resume = React.useRef(false),
    track = React.useRef<HTMLDivElement>(null)
  const reduced = useReduced()
  React.useEffect(() => {
    if (!active || !playing) {
      return
    }
    let id = 0,
      last = performance.now()
    const tick = (now: number) => {
      clock.current = Math.min(DURATION, clock.current + (now - last) / 1000)
      last = now
      setTime(clock.current)
      if (clock.current === DURATION) {
        setPlaying(false)
      } else {
        id = requestAnimationFrame(tick)
      }
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [active, playing])
  const cue = Math.max(
      0,
      CUES.reduce((last, c, i) => (c.at <= time ? i : last), -1),
    ),
    preview =
      hover === null
        ? cue
        : Math.max(
            0,
            CUES.reduce((last, c, i) => (c.at <= hover ? i : last), -1),
          )
  function seek(t: number) {
    clock.current = t
    setTime(t)
  }
  return (
    <div className="sf-cue-scrubber">
      <section className="editor">
        <div className="readout">
          <span className="number">0{cue + 1}</span>
          <div>
            <h3>{CUES[cue].title}</h3>
            <p>{CUES[cue].detail}</p>
          </div>
          <button
            disabled={!active}
            aria-label={playing ? "Pause cue preview" : "Play cue preview"}
            onClick={() => {
              if (time >= DURATION) {
                seek(0)
              }
              setPlaying(!playing)
            }}
          >
            {playing ? "Ⅱ" : "▷"}
          </button>
        </div>
        <div
          className="track"
          ref={track}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setHover(Math.max(0, Math.min(DURATION, ((e.clientX - r.left) / r.width) * DURATION)))
          }}
          onPointerLeave={() => setHover(null)}
        >
          {hover !== null && (
            <div
              className="preview-position"
              style={{ transform: `translateX(${Math.min(80, Math.max(20, (hover / DURATION) * 100))}%)` }}
            >
              <output className="preview">
                {CUES[preview].title} · {hover.toFixed(1)}s
              </output>
            </div>
          )}
          <div className="segments" aria-hidden>
            {CUES.map((c, i) => (
              <i
                key={c.at}
                style={{
                  width: (((CUES[i + 1]?.at || DURATION) - c.at) / DURATION) * 100 + "%",
                  background: cue === i ? "#2b302d" : "#d5d9d4",
                }}
              />
            ))}
          </div>
          <input
            aria-label="Cue position"
            disabled={!active}
            type="range"
            min="0"
            max={DURATION}
            step=".1"
            value={time}
            onPointerDown={() => {
              resume.current = playing
              setPlaying(false)
            }}
            onPointerUp={() => {
              if (resume.current) {
                setPlaying(true)
              }
              resume.current = false
            }}
            onPointerCancel={() => {
              resume.current = false
            }}
            onChange={(e) => seek(+e.target.value)}
          />
        </div>
        <nav aria-label="Chapters">
          {CUES.map((c, i) => (
            <button
              key={c.at}
              disabled={!active}
              aria-current={i === cue ? "true" : undefined}
              onClick={() => seek(c.at)}
            >
              <span>0{i + 1}</span>
              <span>{c.title}</span>
            </button>
          ))}
        </nav>
        <footer>
          <output>{time.toFixed(1).padStart(4, "0")} / 32.0</output>
          <span>Silent cue preview</span>
        </footer>
      </section>
      <style>{`.sf-cue-scrubber{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-cue-scrubber *{box-sizing:border-box}.sf-cue-scrubber button,.sf-cue-scrubber input,.sf-cue-scrubber select,.sf-cue-scrubber textarea{font:inherit;color:inherit}.sf-cue-scrubber button{cursor:pointer;touch-action:manipulation}.sf-cue-scrubber button:disabled{cursor:default;opacity:.45}.sf-cue-scrubber :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-cue-scrubber input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-cue-scrubber .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-cue-scrubber[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-cue-scrubber *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-cue-scrubber{background:#f4f5f1;padding:24px}.sf-cue-scrubber .editor{width:min(100%,470px)}.sf-cue-scrubber .readout{display:flex;align-items:center;gap:18px;margin-bottom:36px}.sf-cue-scrubber .number{font-size:76px;line-height:1;letter-spacing:-6px;font-weight:500;color:#242c25}.sf-cue-scrubber h3{margin:0;font-size:19px;letter-spacing:-.5px;font-weight:500}.sf-cue-scrubber p{margin:5px 0 0;color:#7a8679;font-size:12px}.sf-cue-scrubber .readout button{margin-left:auto;width:44px;height:44px;flex-shrink:0;border-radius:50%;border:1px solid #cfd7cb;background:none;font-size:24px}.sf-cue-scrubber .track{height:44px;position:relative}.sf-cue-scrubber .segments{display:flex;gap:3px;position:absolute;left:0;right:0;top:18px;height:8px}.sf-cue-scrubber .segments i{display:block;border-radius:2px}.sf-cue-scrubber .track input{position:absolute;inset:0;width:100%;margin:0;opacity:.85;accent-color:#e4472d;background:transparent;appearance:none}.sf-cue-scrubber input::-webkit-slider-runnable-track{height:0;background:transparent}.sf-cue-scrubber input::-webkit-slider-thumb{appearance:none;background:#e4472d;border:3px solid #f4f5f1;width:14px;height:24px;transform:translateY(-12px);border-radius:5px}.sf-cue-scrubber .preview-position{position:absolute;left:0;top:-22px;width:100%;pointer-events:none}.sf-cue-scrubber .preview{display:inline-block;transform:translateX(-50%);font-size:10px;color:#586250;white-space:nowrap}.sf-cue-scrubber nav{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.sf-cue-scrubber nav button{min-height:51px;background:none;border:0;display:flex;flex-direction:column;align-items:flex-start;gap:5px;padding:5px 0;text-align:left;font-size:10px;color:#7d887a}.sf-cue-scrubber nav button span:first-child{font:10px ui-monospace,monospace}.sf-cue-scrubber nav [aria-current=true]{color:#273524}.sf-cue-scrubber footer{display:flex;justify-content:space-between;margin-top:20px;font:10px ui-monospace,monospace;color:#8d9688}@container(max-width:340px){.sf-cue-scrubber .number{font-size:62px}.sf-cue-scrubber .readout{gap:12px;margin-bottom:30px}.sf-cue-scrubber h3{font-size:16px}.sf-cue-scrubber p{font-size:10px}.sf-cue-scrubber nav button{font-size:9px}}`}</style>
    </div>
  )
}
