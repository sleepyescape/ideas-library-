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

const LINES = [
  "We kept the windows open.",
  "Let the city become the score.",
  "A train. A voice. Then silence.",
  "That was the whole idea.",
]
const WORDS = LINES.flatMap((line, row) => line.split(" ").map((word) => ({ word, row })))
const STARTS = WORDS.reduce<number[]>(
  (times, entry, i) => [
    ...times,
    i ? times[i - 1] + 0.22 + WORDS[i - 1].word.length * 0.035 + (/[.,]/.test(WORDS[i - 1].word) ? 0.33 : 0) : 0,
  ],
  [],
)
const DURATION = STARTS[STARTS.length - 1] + 0.8
const ROW_STARTS = LINES.map((_, row) => STARTS[WORDS.findIndex((word) => word.row === row)])
const format = (time: number) => `00:${Math.floor(time).toString().padStart(2, "0")}`

export default function Example({ active = true }: { active?: boolean }) {
  const [time, setTime] = React.useState(2.7)
  const [playing, setPlaying] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const timeRef = React.useRef(time)
  React.useEffect(() => {
    const update = () => setHidden(document.hidden)
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  React.useEffect(() => {
    if (!playing || !active || hidden) {
      return
    }
    let last = performance.now(),
      frame = 0
    const tick = (now: number) => {
      timeRef.current = Math.min(DURATION, timeRef.current + (now - last) / 1000)
      last = now
      setTime(timeRef.current)
      if (timeRef.current >= DURATION) {
        setPlaying(false)
      } else {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, active, hidden])
  function seek(next: number) {
    timeRef.current = next
    setTime(next)
  }
  const index = STARTS.reduce((last, start, i) => (start <= time ? i : last), 0)
  const currentRow = WORDS[index].row
  return (
    <section className="sf-transcript-follow">
      <div className="sheet">
        <header>
          <span>Windows open</span>
        </header>
        <div className="cues" aria-label="Timed transcript">
          {LINES.map((line, row) => (
            <div className="cue" key={line} data-current={currentRow === row}>
              <button
                className="cue-time"
                aria-label={`Seek to sentence ${row + 1}`}
                disabled={!active}
                onClick={() => seek(ROW_STARTS[row])}
              >
                {format(ROW_STARTS[row])}
              </button>
              <p>
                {WORDS.map((entry, wordIndex) =>
                  entry.row === row ? (
                    <React.Fragment key={wordIndex}>
                      <button
                        aria-label={`Seek to ${entry.word}, word ${wordIndex + 1}`}
                        aria-current={wordIndex === index ? "true" : undefined}
                        data-past={wordIndex < index}
                        disabled={!active}
                        onClick={() => seek(STARTS[wordIndex])}
                      >
                        {entry.word}
                      </button>{" "}
                    </React.Fragment>
                  ) : null,
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="transport">
          <button
            className="play"
            disabled={!active}
            aria-label={playing ? "Pause transcript" : "Play transcript"}
            onClick={() => {
              if (timeRef.current >= DURATION) {
                seek(0)
              }
              setPlaying(!playing)
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              {playing ? (
                <>
                  <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="3" />
                </>
              ) : (
                <path d="m9 5 10 7-10 7Z" fill="currentColor" />
              )}
            </svg>
          </button>
          <div className="rail">
            <div className="wave" aria-hidden>
              <svg viewBox="0 0 420 36" preserveAspectRatio="none">
                {Array.from({ length: 105 }, (_, i) => {
                  const height = 3 + Math.abs(Math.sin(i * 0.71) * Math.cos(i * 0.153)) * 27
                  return (
                    <rect
                      key={i}
                      x={i * 4}
                      y={(36 - height) / 2}
                      width="2"
                      height={height}
                      rx="1"
                      fill={i / 104 <= time / DURATION ? "#e8f169" : "#62685f"}
                    />
                  )
                })}
              </svg>
              <div className="playhead" style={{ transform: `translateX(${(time / DURATION) * 100}%)` }}>
                <i />
              </div>
            </div>
            <input
              type="range"
              aria-label="Transcript position"
              min="0"
              max={DURATION}
              step=".01"
              value={time}
              disabled={!active}
              onChange={(event) => seek(+event.target.value)}
            />
          </div>
          <output>
            {format(time)}
            <span> / {format(DURATION)}</span>
          </output>
        </div>
        <footer>
          <span>Timing preview · no audio</span>
        </footer>
      </div>
      <style>{`
.sf-transcript-follow{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;container-type:inline-size;isolation:isolate;background:#d4d9d0;color:#292f2e;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.sf-transcript-follow *{box-sizing:border-box}.sf-transcript-follow .sheet{width:min(500px,calc(100% - 48px));padding:0 23px;background:#f8f9f6;border:1px solid #bfc7bc;border-radius:7px;box-shadow:0 20px 28px -24px #2d3c3670,0 1px 2px #293d2412}.sf-transcript-follow header{height:51px;display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:600;border-bottom:1px solid #d6dbd1}.sf-transcript-follow .cues{padding:10px 0 12px}.sf-transcript-follow .cue{display:grid;grid-template-columns:44px 1fr;align-items:center;min-height:44px;position:relative}.sf-transcript-follow button{font:inherit;touch-action:manipulation;cursor:pointer;color:inherit}.sf-transcript-follow .cue-time{font:9px ui-monospace,monospace;background:none;border:0;padding:0;text-align:left;height:44px;color:#93988e;transition:color .12s ease}.sf-transcript-follow .cue[data-current=true] .cue-time{color:#333b2f}.sf-transcript-follow p{margin:0;font:19px/1.4 Georgia,"Times New Roman",serif;letter-spacing:-.35px;white-space:nowrap}.sf-transcript-follow p button{display:inline;position:relative;border:0;border-radius:2px;background:none;padding:3px 0;color:#6c7564;transition:color .15s ease;line-height:1.4;isolation:isolate}.sf-transcript-follow p button:after{content:"";position:absolute;inset:-8px -1px;z-index:-1}.sf-transcript-follow p [data-past=true]{color:#343c32}.sf-transcript-follow p [aria-current=true]{color:#252f1e;background:#e8f169;box-shadow:3px 0 #e8f169,-3px 0 #e8f169}.sf-transcript-follow .transport{height:65px;padding:0 13px 0 10px;margin:0 -10px;display:flex;align-items:center;gap:14px;background:#2c342d;border:1px solid #253026;border-radius:6px;box-shadow:inset 0 1px #ffffff14}.sf-transcript-follow .play{height:44px;width:44px;flex:none;display:grid;place-items:center;border:1px solid #e3eb8c;border-radius:50%;background:#e8f169;color:#2d3427;transition:transform .15s ease}.sf-transcript-follow .play svg{height:20px;width:20px}.sf-transcript-follow .play:active{transform:scale(.96)}.sf-transcript-follow .rail{height:44px;position:relative;flex:1;min-width:0}.sf-transcript-follow .wave{position:absolute;inset:4px 0;pointer-events:none}.sf-transcript-follow .wave svg{display:block;width:100%;height:100%}.sf-transcript-follow .playhead{position:absolute;left:0;top:-2px;bottom:-2px;width:100%;pointer-events:none}.sf-transcript-follow .playhead:after{content:"";position:absolute;inset:0 auto 0 -.5px;width:1px;background:#e8f169}.sf-transcript-follow .playhead i{position:absolute;top:-1px;left:-2px;width:5px;height:4px;background:#e8f169;border-radius:1px}.sf-transcript-follow input{position:absolute;inset:0;margin:0;appearance:none;-webkit-appearance:none;background:none;width:100%;height:44px;cursor:ew-resize;touch-action:pan-y}.sf-transcript-follow input::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:12px;height:42px;background:transparent;border:0}.sf-transcript-follow input::-moz-range-thumb{width:12px;height:42px;background:transparent;border:0}.sf-transcript-follow .transport output{font:10px ui-monospace,monospace;color:#f3f7e9;font-variant-numeric:tabular-nums;white-space:nowrap;min-width:32px}.sf-transcript-follow .transport output span{display:block;font-size:9px;color:#a8b09f;margin-top:4px}.sf-transcript-follow footer{height:31px;display:flex;align-items:center;justify-content:space-between;color:#7b8476;font:9px ui-monospace,monospace}.sf-transcript-follow :focus-visible{outline:2px solid #356340;outline-offset:3px}.sf-transcript-follow .transport :focus-visible{outline-color:#edf99b}.sf-transcript-follow button:disabled{cursor:default}.sf-transcript-follow input:disabled{cursor:default}@media(hover:hover){.sf-transcript-follow p button:not([aria-current=true]):hover{color:#253322;background:#ebeee3}.sf-transcript-follow .play:hover{background:#f3f99a}}@container(max-width:420px){.sf-transcript-follow .sheet{width:calc(100% - 24px);padding:0 15px}.sf-transcript-follow p{font-size:16px;letter-spacing:-.3px}.sf-transcript-follow .cue{grid-template-columns:38px 1fr}.sf-transcript-follow .transport{gap:9px}.sf-transcript-follow header{height:43px}.sf-transcript-follow .cues{padding:6px 0 8px}.sf-transcript-follow .cue{min-height:40px}.sf-transcript-follow .cue-time{height:40px}}@media(prefers-reduced-motion:reduce){.sf-transcript-follow *{transition:none!important}}
      `}</style>
    </section>
  )
}
