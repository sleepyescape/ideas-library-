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

import { useEffect, useRef, useState } from "react"

export default function ChromaticSignal({ active = true }: { active?: boolean }) {
  const [pulse, setPulse] = useState(0)
  const [busy, setBusy] = useState(false)
  const [reduced, setReduced] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => {
      q.removeEventListener("change", update)
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [])
  useEffect(() => {
    if (!active || reduced) {
      setBusy(false)
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [active, reduced])
  function disrupt() {
    if (timer.current) {
      clearTimeout(timer.current)
    }
    setPulse((p) => p + 1)
    setBusy(true)
    timer.current = setTimeout(() => setBusy(false), 480)
  }
  return (
    <section className="sf-chromatic-signal" data-pulse={busy && active && !reduced}>
      <div key={pulse} className="sf-cs-type" aria-label="Frequency Shift">
        <div className="sf-cs-small" data-text="FREQUENCY" aria-hidden="true">
          FREQUENCY
        </div>
        <div className="sf-cs-large" data-text="SHIFT" aria-hidden="true">
          SHIFT
        </div>
      </div>
      <div className="sf-cs-bottom">
        <button type="button" onClick={disrupt} data-busy={busy}>
          Disrupt signal <span>↗</span>
        </button>
      </div>
      <style>{`.sf-chromatic-signal{width:100%;height:100%;min-height:280px;container-type:inline-size;position:relative;overflow:hidden;box-sizing:border-box;background:#fff;color:#1829cb;font-family:Arial,sans-serif;padding:22px 25px;display:flex;flex-direction:column;justify-content:space-between}.sf-chromatic-signal *{box-sizing:border-box}.sf-cs-type{position:relative;line-height:.79;letter-spacing:-.075em;align-self:flex-start;width:100%;font-family:Arial,Helvetica,sans-serif;font-weight:900;flex:1;display:flex;flex-direction:column;justify-content:center}.sf-cs-type>div{position:relative;width:max-content;max-width:100%;isolation:isolate}.sf-cs-small{font-size:12.5cqw;letter-spacing:-.08em}.sf-cs-large{font-size:28.5cqw;color:#ed3126;margin-top:.025em;letter-spacing:-.075em;transform:translateX(-.04em)}.sf-cs-type>div:before,.sf-cs-type>div:after{content:attr(data-text);position:absolute;inset:0;opacity:0;pointer-events:none}.sf-cs-type>div:before{color:#1829cb;z-index:1}.sf-cs-type>div:after{color:#ed3126;z-index:2}.sf-chromatic-signal[data-pulse=true] .sf-cs-type>div:before{opacity:1;animation:sf-cs-break-a 480ms steps(1,end) both}.sf-chromatic-signal[data-pulse=true] .sf-cs-type>div:after{opacity:1;animation:sf-cs-break-b 480ms steps(1,end) both}.sf-cs-bottom{display:flex;align-items:center;justify-content:flex-end;color:#161616}.sf-cs-bottom button{min-height:44px;border:0;border-bottom:1px solid #161616;padding:0;background:none;color:inherit;display:flex;align-items:center;gap:26px;font:11px monospace;cursor:pointer}.sf-cs-bottom button:focus-visible{outline:2px solid #1829cb;outline-offset:4px}.sf-cs-bottom button:active,.sf-cs-bottom button[data-busy=true]{color:#ed3126}@keyframes sf-cs-break-a{0%{clip-path:inset(19% 0 53%);transform:translateX(-8px)}20%{clip-path:inset(61% 0 9%);transform:translateX(11px)}42%{clip-path:inset(37% 0 44%);transform:translateX(-5px)}70%{clip-path:inset(75% 0 8%);transform:translateX(4px)}100%{clip-path:inset(0);transform:translateX(0);opacity:0}}@keyframes sf-cs-break-b{0%{clip-path:inset(51% 0 17%);transform:translateX(7px)}25%{clip-path:inset(9% 0 74%);transform:translateX(-10px)}46%{clip-path:inset(70% 0 13%);transform:translateX(6px)}72%{clip-path:inset(28% 0 56%);transform:translateX(-3px)}100%{clip-path:inset(0);transform:translateX(0);opacity:0}}@media(prefers-reduced-motion:reduce){.sf-cs-type>div:before,.sf-cs-type>div:after{animation:none!important;opacity:0!important}}@container(max-width:360px){.sf-cs-small{font-size:12cqw}.sf-cs-large{font-size:28cqw}.sf-cs-type{transform:scaleY(1.24);transform-origin:center}.sf-cs-bottom button{font-size:10px;gap:20px}}`}</style>
    </section>
  )
}
