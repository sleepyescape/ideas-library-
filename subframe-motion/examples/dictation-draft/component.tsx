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

const FRAMES = [
  ["", "The city"],
  ["", "The city is a quiet"],
  ["The city is", "a choir"],
  ["The city is a choir.", "Every window"],
  ["The city is a choir.", "Every window holds a note."],
  ["The city is a choir. Every window holds a note.", ""],
]
export default function Example({ active = true }: { active?: boolean }) {
  const [step, setStep] = React.useState(0),
    [running, setRunning] = React.useState(false),
    [draft, setDraft] = React.useState("")
  const reduced = useReduced(),
    clock = React.useRef(0)
  React.useEffect(() => {
    if (!active || !running) {
      return
    }
    let id = 0,
      last = performance.now()
    const tick = (now: number) => {
      clock.current += now - last
      last = now
      if (clock.current > 850) {
        clock.current = 0
        setStep((s) => {
          if (s >= FRAMES.length - 2) {
            setRunning(false)
            setDraft(FRAMES[5][0])
            return 5
          }
          return s + 1
        })
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [active, running])
  return (
    <div className="sf-dictation-draft" data-paused={!active || reduced}>
      <section className="note">
        <header>
          <span>Draft</span>
          <span className="mode">{step === 5 ? "Editable" : "Dictation preview"}</span>
        </header>
        {step === 5 ? (
          <textarea
            aria-label="Edit transcribed draft"
            value={draft}
            disabled={!active}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <p className="words">
            <span>{FRAMES[step][0]} </span>
            <span className="partial">
              {FRAMES[step][1]}
              <i aria-hidden />
            </span>
          </p>
        )}
        <footer>
          <button
            disabled={!active}
            className="record"
            onClick={() => {
              if (running) {
                setRunning(false)
                return
              }
              if (step === 5) {
                setStep(0)
                setDraft("")
              }
              clock.current = 0
              setRunning(true)
            }}
          >
            <span aria-hidden>{running ? "Ⅱ" : "▷"}</span>
            {running ? "Pause" : "Preview"}
          </button>
          <button
            disabled={!active || (!step && !running)}
            className="clear"
            onClick={() => {
              setRunning(false)
              setStep(0)
              setDraft("")
              clock.current = 0
            }}
          >
            Reset
          </button>
        </footer>
      </section>
      <style>{`.sf-dictation-draft{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-dictation-draft *{box-sizing:border-box}.sf-dictation-draft button,.sf-dictation-draft input,.sf-dictation-draft select,.sf-dictation-draft textarea{font:inherit;color:inherit}.sf-dictation-draft button{cursor:pointer;touch-action:manipulation}.sf-dictation-draft button:disabled{cursor:default;opacity:.45}.sf-dictation-draft :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-dictation-draft input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-dictation-draft .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-dictation-draft[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-dictation-draft *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-dictation-draft{background:#d1b595;color:#35271c;padding:24px}.sf-dictation-draft .note{width:min(100%,420px);background:#f3e9d7;padding:24px 26px 15px;box-shadow:0 5px 13px #5d361920;position:relative}.sf-dictation-draft .note:before{content:'';position:absolute;left:0;right:0;top:0;height:4px;background:#ff5c19}.sf-dictation-draft header{display:flex;justify-content:space-between;font-size:11px;color:#7b6d5d}.sf-dictation-draft .mode{font-size:10px}.sf-dictation-draft .words,.sf-dictation-draft textarea{font:29px/1.25 Georgia,serif;letter-spacing:-.75px;height:123px;margin:27px 0 14px;width:100%;resize:none;border:0;background:transparent;padding:0}.sf-dictation-draft .partial{color:#8e715a;text-decoration:underline;text-decoration-color:#ee5c23;text-underline-offset:6px;text-decoration-thickness:1px}.sf-dictation-draft .partial i{display:inline-block;width:1px;height:25px;vertical-align:-3px;background:#ee5c23;margin-left:4px;animation:sf-dictate-caret 1s step-end infinite}.sf-dictation-draft footer{display:flex;justify-content:space-between;align-items:center}.sf-dictation-draft button{height:44px;border:0;font-size:12px;background:none}.sf-dictation-draft .record{display:flex;align-items:center;gap:9px}.sf-dictation-draft .record span{display:grid;place-items:center;background:#e75a22;color:#ffead0;border-radius:50%;width:27px;height:27px}.sf-dictation-draft .clear{color:#8d7761}@keyframes sf-dictate-caret{50%{opacity:0}}@container(max-width:330px){.sf-dictation-draft .note{padding:20px 18px 12px}.sf-dictation-draft .words,.sf-dictation-draft textarea{font-size:25px;height:118px;margin:20px 0 8px}}`}</style>
    </div>
  )
}
