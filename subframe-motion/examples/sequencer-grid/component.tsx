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

import { useEffect, useState } from "react"

const initialPattern = [
  true,
  false,
  false,
  true,
  false,
  false,
  true,
  false,
  true,
  false,
  true,
  false,
  false,
  true,
  false,
  false,
]

export default function SequencerGrid({ active = true }: { active?: boolean }) {
  const [steps, setSteps] = useState(initialPattern)
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState(0)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    if (!active || !playing || reduced) {
      return
    }
    const timer = window.setInterval(() => setBeat((value) => (value + 1) % 16), 250)
    return () => window.clearInterval(timer)
  }, [active, playing, reduced])
  return (
    <div className="sf-stepbank" data-active={active}>
      <style>{`
.sf-stepbank{height:100%;min-height:300px;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at 50% 10%,#aaa7a2,#848783 100%);font-family:Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#d6d7d2}
.sf-stepbank *{box-sizing:border-box}.sf-stepbank button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.sf-stepbank-machine{position:relative;width:424px;padding:24px 22px 22px;border:1px solid #282d2d;border-radius:10px;background:linear-gradient(110deg,#545b5b 0%,#383f40 40%,#2c3334 100%);box-shadow:inset 0 1px 1px #ffffff55,inset 1px 0 1px #b4bbbb44,inset -1px -1px 1px #0a1112,0 4px #222a2b,0 6px 1px #172123,0 8px 3px #1b212aaa,2px 15px 10px -7px #111e2299,9px 30px 30px -14px #19262599}
.sf-stepbank-machine:before{content:"";position:absolute;inset:4px;border-radius:6px;border:1px solid #b7c3bd0e;border-bottom-color:#0005;pointer-events:none}
.sf-stepbank-top{display:grid;grid-template-columns:1fr 46px;gap:19px;align-items:center;margin-bottom:23px}
.sf-stepbank-display{height:54px;position:relative;overflow:hidden;padding:10px 13px;border:1px solid #131b1d;border-radius:4px;background:linear-gradient(115deg,#1c2526,#0d171a);box-shadow:inset 1px 2px 3px #000b,0 1px #ffffff24,0 -1px #0007}
.sf-stepbank-display:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,#bddecb0d 0%,#b1cab813 52%,transparent 52.5%);pointer-events:none}
.sf-stepbank-display-top{display:flex;justify-content:space-between;align-items:baseline;font:8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1.4px;color:#94aaa6;font-variant-numeric:tabular-nums}.sf-stepbank-display-top output{font-size:12px;letter-spacing:1px;color:#eec290;text-shadow:0 0 5px #d9a16544}
.sf-stepbank-track{display:flex;gap:5px;margin-top:8px;height:8px;align-items:end}.sf-stepbank-track i{flex:1;height:3px;border-radius:1px;background:#2b3a3c}.sf-stepbank-track i[data-on=true]{height:7px;background:#947256;box-shadow:0 0 2px #b1713d22}.sf-stepbank-track i[data-current=true]{background:#f8d4a2;box-shadow:0 0 4px #f8ce9344}
.sf-stepbank-play{display:grid;place-items:center;width:46px;height:46px;padding:0;border:1px solid #1e2628;border-radius:5px;color:#303c3d;background:linear-gradient(145deg,#e0e3df 0%,#bdc6c2 42%,#92a09d);box-shadow:inset 0 1px 1px #fff,inset 1px 0 1px #e3e8e7aa,inset -1px -1px 1px #738481,0 3px #465251,0 4px 2px #0b1719cc,2px 6px 5px #091b1d77;cursor:pointer;transition:transform 100ms cubic-bezier(.2,.8,.2,1)}
.sf-stepbank-play[aria-pressed=true]{color:#9d491e;background:linear-gradient(145deg,#cbd2cb,#a9b9b2)}.sf-stepbank-play:active{transform:translateY(2px);box-shadow:inset 0 1px #fff9,0 1px #4a5655,0 2px 2px #0b1719cc}
.sf-stepbank-grid{display:grid;grid-template-columns:repeat(8,44px);gap:13px 3px;position:relative}
.sf-stepbank-key{position:relative;width:44px;height:54px;padding:0;border:0;background:transparent;cursor:pointer}
.sf-stepbank-key:before{content:"";position:absolute;inset:1px 1px -2px;border:1px solid #101819;border-radius:5px;background:#1d2729;box-shadow:0 1px #b2bdbc33,inset 0 1px 3px #0009}
.sf-stepbank-face{position:absolute;inset:1px 3px 1px;border:1px solid #212829;border-radius:4px;background:linear-gradient(125deg,#636b6b,#434e50 65%,#394347);box-shadow:inset 0 1px 1px #b5c0b899,inset 1px 0 #a6b1ac22,inset -1px -1px 1px #111d1fc7,0 3px #253133,0 4px 1px #000c,1px 6px 4px #0a13198c;transition:transform 100ms cubic-bezier(.2,.8,.2,1);pointer-events:none}
.sf-stepbank-face:before{content:"";position:absolute;inset:5px 4px 7px;border-radius:3px;background:radial-gradient(ellipse at 55% 100%,#95a1a12b,transparent 75%);box-shadow:inset 1px 2px 3px #0c19182c}
.sf-stepbank-key:nth-child(n+9) .sf-stepbank-face{border-color:#8b9590;background:linear-gradient(125deg,#e3e4db,#c9d0c7 65%,#b4bfb6);box-shadow:inset 0 1px 1px #fffffa,inset 1px 0 #f3f6eaaa,inset -1px -1px 1px #8a978c,0 3px #7f9087,0 4px 1px #000b,1px 6px 4px #0a13198c}
.sf-stepbank-key:nth-child(n+9) .sf-stepbank-face:before{background:radial-gradient(ellipse at 55% 100%,#ffffef55,transparent 75%);box-shadow:inset 1px 2px 3px #89958b30}
.sf-stepbank-number{position:absolute;left:7px;top:7px;font:500 9px ui-monospace,SFMono-Regular,Consolas,monospace;color:#dbe0d8}.sf-stepbank-key:nth-child(n+9) .sf-stepbank-number{color:#34473c;text-shadow:none}
.sf-stepbank-light{position:absolute;bottom:10px;left:8px;right:8px;height:3px;border:1px solid #172426;border-radius:2px;background:#1c2b2c;box-shadow:0 1px #d3e0d122,inset 0 1px #0008}.sf-stepbank-key:nth-child(n+9) .sf-stepbank-light{border-color:#7b8576;background:#667264}
.sf-stepbank-key[aria-pressed=true] .sf-stepbank-face{transform:translateY(1px)}
.sf-stepbank-key[aria-pressed=true] .sf-stepbank-light{border-color:#703416;background:#faac65;box-shadow:inset 0 1px #fff1bb,0 0 4px #ff964f66,0 3px 7px #f3954733}
.sf-stepbank-key[data-current=true][aria-pressed=true] .sf-stepbank-light{border-color:#aca681;background:#ffefd0;box-shadow:inset 0 1px #fff,0 0 5px #fff1c488,0 3px 9px #e9d78a55}
.sf-stepbank-key:after{content:"";position:absolute;left:15px;right:15px;top:-5px;height:2px;background:#fff3c6;box-shadow:0 0 4px #fff1c666;opacity:0}.sf-stepbank-key[data-current=true]:after{opacity:1}
.sf-stepbank-key:active .sf-stepbank-face{transform:translateY(3px);box-shadow:inset 0 1px #b9c0b955,0 1px #1e292a,0 2px 2px #081115aa}
.sf-stepbank-bottom{display:flex;align-items:center;justify-content:space-between;margin-top:15px;padding:0 3px;color:#bec8c2;font:7px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1.1px}.sf-stepbank-bottom span:last-child{color:#8e9d98}
.sf-stepbank-next{border:0;background:none;padding:3px;color:#e0b887;font:inherit;text-decoration:underline;cursor:pointer}
.sf-stepbank button:focus-visible{outline:2px solid #ffcd89;outline-offset:3px}.sf-stepbank-key:focus-visible .sf-stepbank-face,.sf-stepbank-play:focus-visible,.sf-stepbank[data-active=false] *{transition:none}
@media(prefers-reduced-motion:reduce){.sf-stepbank *{transition:none}.sf-stepbank-key:active .sf-stepbank-face,.sf-stepbank-key[aria-pressed=true] .sf-stepbank-face,.sf-stepbank-play:active{transform:none}}
@media(max-width:450px){.sf-stepbank-machine{transform:scale(.82)}}
`}</style>
      <div className="sf-stepbank-machine">
        <div className="sf-stepbank-top">
          <div className="sf-stepbank-display">
            <div className="sf-stepbank-display-top">
              <span>{playing ? (active ? (reduced ? "STEP MODE" : "PLAYING") : "PAUSED") : "PATTERN 01"}</span>
              <output aria-label="Current step" aria-live="off">
                {String(beat + 1).padStart(2, "0")} / 16
              </output>
            </div>
            <div className="sf-stepbank-track" aria-hidden="true">
              {steps.map((on, index) => (
                <i key={index} data-on={on} data-current={playing && beat === index} />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="sf-stepbank-play"
            aria-label={playing ? "Pause visual sequence" : "Play visual sequence"}
            aria-pressed={playing}
            onClick={() => setPlaying(!playing)}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
              {playing ? <path d="M5 4H8V16H5ZM12 4H15V16H12Z" /> : <path d="M6 3.5 16 10 6 16.5Z" />}
            </svg>
          </button>
        </div>
        <div className="sf-stepbank-grid" role="group" aria-label="Sixteen-step pattern">
          {steps.map((on, index) => (
            <button
              type="button"
              key={index}
              className="sf-stepbank-key"
              aria-label={`Step ${index + 1}`}
              aria-pressed={on}
              data-current={playing && beat === index}
              onClick={() => setSteps((current) => current.map((value, i) => (i === index ? !value : value)))}
            >
              <span className="sf-stepbank-face" aria-hidden="true">
                <span className="sf-stepbank-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="sf-stepbank-light" />
              </span>
            </button>
          ))}
        </div>
        <div className="sf-stepbank-bottom">
          <span>16 STEP SEQUENCER</span>
          {reduced && playing ? (
            <button
              type="button"
              className="sf-stepbank-next"
              aria-label="Advance one step"
              onClick={() => setBeat((value) => (value + 1) % 16)}
            >
              NEXT STEP →
            </button>
          ) : (
            <span>120 BPM · ⅛</span>
          )}
        </div>
      </div>
    </div>
  )
}
