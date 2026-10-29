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

// Each duration is expressed in quarter-note beats. Pitches are staff steps above E4.
const PHRASE = [
  [0, 2, 1],
  [1, 4, 0.5],
  [1.5, 5, 0.5],
  [2, 6, 1],
  [3, 4, 1],
  [4, 3, 0.5],
  [4.5, 1, 0.5],
  [5, 2, 1],
  [6, 0, 2],
  [8, 4, 1],
  [9, 6, 0.5],
  [9.5, 7, 0.5],
  [10, 8, 1],
  [11, 6, 1],
  [12, 5, 0.5],
  [12.5, 3, 0.5],
  [13, 2, 1],
  [14, 0, 2],
]
const noteX = (beat: number) => 102 + beat * 35

export default function Example({ active = true }: { active?: boolean }) {
  const [beat, setBeat] = React.useState(0)
  const [tempo, setTempo] = React.useState(88)
  const [tempoDraft, setTempoDraft] = React.useState("88")
  const [playing, setPlaying] = React.useState(false)
  const [reduced, setReduced] = React.useState(true)
  const [visible, setVisible] = React.useState(true)
  const cursor = React.useRef(0)
  const drag = React.useRef<{ id: number; before: number } | null>(null)
  const score = React.useRef<SVGSVGElement>(null)

  React.useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(mq.matches)
    const visibility = () => setVisible(!document.hidden)
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !drag.current) {
        return
      }
      const current = drag.current
      drag.current = null
      cursor.current = current.before
      setBeat(current.before)
      if (score.current?.hasPointerCapture(current.id)) {
        score.current.releasePointerCapture(current.id)
      }
    }
    sync()
    visibility()
    mq.addEventListener("change", sync)
    document.addEventListener("visibilitychange", visibility)
    window.addEventListener("keydown", cancel)
    return () => {
      mq.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", visibility)
      window.removeEventListener("keydown", cancel)
    }
  }, [])

  React.useEffect(() => {
    if (active || !drag.current) {
      return
    }
    const current = drag.current
    drag.current = null
    cursor.current = current.before
    setBeat(current.before)
    if (score.current?.hasPointerCapture(current.id)) {
      score.current.releasePointerCapture(current.id)
    }
  }, [active])

  React.useEffect(() => {
    if (!active || !visible || !playing) {
      return
    }
    let frame = 0,
      previous = 0
    const tick = (now: number) => {
      if (previous) {
        cursor.current = Math.min(16, cursor.current + (Math.min(now - previous, 80) * tempo) / 60000)
      }
      previous = now
      setBeat(cursor.current)
      if (cursor.current >= 16) {
        setPlaying(false)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, playing, tempo, visible])

  function seek(next: number) {
    cursor.current = Math.max(0, Math.min(16, next))
    setBeat(cursor.current)
  }
  function toggle() {
    if (beat >= 16) {
      seek(0)
    }
    setPlaying((value) => !value)
  }
  function scrub(event: React.PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const width = bounds.width,
      height = bounds.height
    const scale = Math.min(width / 720, height / 280)
    const x = (event.clientX - bounds.left - (width - 720 * scale) / 2) / scale
    seek((x - 102) / 35)
  }
  const current = PHRASE.findIndex(([start, , duration]) => beat >= start && beat < start + duration)
  const cursorBeat = reduced ? PHRASE[current]?.[0] ?? beat : beat

  return (
    <div className="sf-score-follow">
      <div className="score-sheet">
        <header>
          <span className="score-meter">4/4</span>
          <span className="score-tempo">Andante</span>
          <output aria-label="Current measure">
            {Math.min(4, Math.floor(beat / 4) + 1)}
            <span> / 4</span>
          </output>
        </header>
        <svg
          ref={score}
          viewBox="0 0 720 280"
          className="score-notation"
          aria-label="Four-bar score. Drag to seek."
          onPointerDown={(event) => {
            if (event.button !== 0) {
              return
            }
            drag.current = { id: event.pointerId, before: beat }
            setPlaying(false)
            event.currentTarget.setPointerCapture(event.pointerId)
            scrub(event)
          }}
          onPointerMove={(event) => {
            if (drag.current?.id === event.pointerId) {
              scrub(event)
            }
          }}
          onPointerUp={(event) => {
            if (drag.current?.id === event.pointerId) {
              drag.current = null
            }
          }}
          onPointerCancel={() => {
            if (drag.current) {
              seek(drag.current.before)
            }
            drag.current = null
          }}
          onLostPointerCapture={() => {
            if (drag.current) {
              seek(drag.current.before)
            }
            drag.current = null
          }}
        >
          {[112, 128, 144, 160, 176].map((y) => (
            <line key={y} x1="28" x2="680" y1={y} y2={y} stroke="#d4d4d2" strokeWidth="1" />
          ))}
          {[0, 4, 8, 12, 16].map((time) => (
            <g key={time}>
              <line
                x1={noteX(time) - 20}
                x2={noteX(time) - 20}
                y1="112"
                y2="176"
                stroke="#777771"
                strokeWidth={time === 16 ? 3 : 1}
              />
              <text x={noteX(time) - 16} y="82" fill="#969690" fontSize="12" fontFamily="monospace">
                {time < 16 ? time / 4 + 1 : ""}
              </text>
            </g>
          ))}
          <path
            d="M 51 180 C 21 167 30 135 48 125 C 68 113 61 90 54 91 C 43 92 43 117 52 141 L 63 192 C 68 214 42 217 39 202 C 36 190 51 187 54 197 C 49 194 44 198 47 203 C 52 211 63 206 60 195 L 48 143 C 43 130 28 139 30 153 C 31 165 47 175 60 168 C 74 157 62 138 50 145 C 41 149 46 159 52 157"
            fill="none"
            stroke="#171916"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {!reduced && (
            <rect x={noteX(cursorBeat) - 10} y="98" width="20" height="102" rx="10" fill="#ef3927" opacity=".075" />
          )}
          <line x1={noteX(cursorBeat)} x2={noteX(cursorBeat)} y1="93" y2="201" stroke="#db3023" strokeWidth="1.5" />
          <path
            d={`M ${noteX(cursorBeat) - 4} 88 L ${noteX(cursorBeat) + 4} 88 L ${noteX(cursorBeat)} 94 Z`}
            fill="#db3023"
          />
          {PHRASE.map(([start, pitch, duration], index) => {
            const x = noteX(start),
              y = 176 - pitch * 8
            const color = index === current ? "#db3023" : "#171916"
            const down = pitch >= 4
            const stemX = x + (down ? -7 : 7),
              tip = y + (down ? 48 : -48)
            return (
              <g key={start} fill={color} stroke={color}>
                <ellipse
                  cx={x}
                  cy={y}
                  rx="8.5"
                  ry="5.6"
                  transform={`rotate(-18 ${x} ${y})`}
                  fill={duration >= 2 ? "#ffffff" : color}
                  strokeWidth="2"
                />
                <line x1={stemX} x2={stemX} y1={y} y2={tip} strokeWidth="1.7" />
                {duration === 0.5 && (
                  <path
                    d={
                      down
                        ? `M ${stemX} ${tip} C ${stemX - 1} ${tip - 14} ${stemX + 21} ${tip - 16} ${stemX + 10} ${
                            tip - 36
                          }`
                        : `M ${stemX} ${tip} C ${stemX + 1} ${tip + 14} ${stemX + 20} ${tip + 16} ${stemX + 10} ${
                            tip + 36
                          }`
                    }
                    fill="none"
                    strokeWidth="3.5"
                  />
                )}
              </g>
            )
          })}
          <path
            d="M 118 223 Q 175 244 230 223 M 398 223 Q 454 244 510 223"
            fill="none"
            stroke="#171916"
            strokeWidth="1.2"
          />
          <text x="100" y="258" fontFamily="Georgia,serif" fontStyle="italic" fontWeight="bold" fontSize="22">
            mp
          </text>
        </svg>
        <div className="score-transport">
          <button
            onClick={toggle}
            aria-label={playing ? "Pause score" : "Play score"}
            aria-pressed={playing}
            className="score-play"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {playing ? <path d="M7 5h3v14H7zM14 5h3v14h-3z" /> : <path d="M8 4 20 12 8 20Z" />}
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="16"
            step=".01"
            value={beat}
            aria-label="Score position in beats"
            aria-valuetext={
              beat >= 16
                ? "End of score, four measures complete"
                : `Measure ${Math.floor(beat / 4) + 1}, beat ${((beat % 4) + 1).toFixed(1)}`
            }
            onChange={(event) => seek(Number(event.target.value))}
          />
          <label className="score-bpm">
            <span>♩</span>
            <input
              aria-label="Tempo in beats per minute"
              type="number"
              min="40"
              max="180"
              value={tempoDraft}
              onChange={(event) => {
                setTempoDraft(event.target.value)
                const next = Number(event.target.value)
                if (next >= 40 && next <= 180) {
                  setTempo(next)
                }
              }}
              onBlur={() => {
                const next = Math.max(40, Math.min(180, Number(tempoDraft) || tempo))
                setTempo(next)
                setTempoDraft(String(next))
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur()
                }
              }}
            />
          </label>
        </div>
      </div>
      <style>{`
.sf-score-follow{width:100%;height:100%;min-height:0;background:#f4f4f1;display:grid;place-items:center;color:#171916;font-family:Arial,sans-serif;container-type:inline-size;overflow:hidden}
.sf-score-follow *{box-sizing:border-box}.sf-score-follow .score-sheet{width:88%;padding:4% 3% 2.5%;background:white;box-shadow:0 3px 5px #17191604,0 18px 30px #17191608;}
.sf-score-follow header{display:flex;align-items:center;gap:14px;padding:0 4%;font-size:clamp(9px,1.7cqw,15px)}.sf-score-follow .score-meter{border-right:1px solid #d4d4d2;padding-right:14px;font-variant-numeric:tabular-nums}.sf-score-follow .score-tempo{font-family:Georgia,serif;font-style:italic}.sf-score-follow header output{margin-left:auto;font-family:monospace}.sf-score-follow header output span{color:#94948c}
.sf-score-follow .score-notation{display:block;width:100%;height:auto;touch-action:none;cursor:ew-resize;user-select:none}.sf-score-follow .score-transport{display:flex;gap:20px;align-items:center;padding:0 4%;}.sf-score-follow .score-play{border:0;border-radius:50%;background:#db3023;color:white;width:44px;height:44px;display:grid;place-items:center;cursor:pointer;flex-shrink:0}.sf-score-follow .score-play svg{fill:currentColor;width:16px;height:16px}.sf-score-follow .score-play:hover{background:#b82017}.sf-score-follow input[type=range]{min-width:0;flex:1;height:36px;appearance:none;background:transparent;cursor:ew-resize}.sf-score-follow input[type=range]::-webkit-slider-runnable-track{height:2px;background:#dbdbd6}.sf-score-follow input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;margin-top:-6px;border-radius:50%;background:#db3023;border:0}.sf-score-follow input[type=range]::-moz-range-track{height:2px;background:#dbdbd6}.sf-score-follow input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#db3023;border:0}.sf-score-follow .score-bpm{display:flex;align-items:center;gap:3px;font-size:clamp(12px,2cqw,19px)}.sf-score-follow .score-bpm input{width:42px;border:0;background:none;color:inherit;font:12px monospace;padding:6px 0;appearance:textfield}.sf-score-follow .score-bpm input::-webkit-inner-spin-button{appearance:none}.sf-score-follow button:focus-visible,.sf-score-follow input:focus-visible{outline:2px solid #db3023;outline-offset:4px}
`}</style>
    </div>
  )
}
