/**
 * MIT License
 * Copyright (c) 2026 Subframe
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

"use client"
import * as React from "react"
function usePreview(active: boolean) {
  const [reduced, setReduced] = React.useState(true),
    [instant, setInstant] = React.useState(false)
  React.useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setReduced(q.matches)
    read()
    q.addEventListener("change", read)
    return () => q.removeEventListener("change", read)
  }, [])
  return {
    still: !active || reduced || instant,
    reduced,
    onKeyDownCapture: () => setInstant(true),
    onPointerDownCapture: () => setInstant(false),
  }
}

export default function Example({ active = true }: { active?: boolean }) {
  const preview = usePreview(active)

  const [quote, setQuote] = React.useState({ now: 128.46, old: 128.18, id: 0 }),
    [flash, setFlash] = React.useState(false)
  React.useEffect(() => {
    if (!active || !flash) {
      return
    }
    const t = setTimeout(() => setFlash(false), 800)
    return () => clearTimeout(t)
  }, [quote.id, flash, active])
  const update = (delta: number) => {
    setQuote((q) => ({ now: Math.round((q.now + delta) * 100) / 100, old: q.now, id: q.id + 1 }))
    setFlash(true)
  }
  const change = Math.round((quote.now - quote.old) * 100) / 100,
    up = change >= 0

  return (
    <section
      className="sf-w2-quote-tick"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="instrument">
        <div className="row between">
          <div>
            <b>ALTO</b>
            <span className="symbol"> / DEMO</span>
          </div>
          <span className="venue">Last trade</span>
        </div>
        <div className="price" data-flash={flash} data-up={up}>
          <span
            className="number"
            key={quote.id}
            style={{ "--tick-travel": up ? "8px" : "-8px" } as React.CSSProperties}
          >
            {quote.now.toFixed(2)}
          </span>
          <span className="unit">USD</span>
        </div>
        <div className="comparison">
          <span>{quote.old.toFixed(2)}</span>
          <svg viewBox="0 0 50 16" aria-hidden>
            <path d="M1 8H47M40 2l7 6-7 6" />
          </svg>
          <b data-up={up}>
            {up ? "+" : ""}
            {change.toFixed(2)} <span aria-hidden>{up ? "↗" : "↘"}</span>
          </b>
        </div>
        <div className="ticks" aria-hidden>
          {Array.from({ length: 41 }, (_, i) => (
            <i key={i} style={{ height: i % 5 ? 5 : 10 }} />
          ))}
        </div>
        <div className="controls">
          <button type="button" onClick={() => update(-0.37)}>
            − Down tick
          </button>
          <button type="button" onClick={() => update(0.52)}>
            + Up tick
          </button>
        </div>
        <p className="sr" role="status">
          {quote.now.toFixed(2)} dollars, {up ? "up" : "down"} {Math.abs(change).toFixed(2)} from {quote.old.toFixed(2)}
        </p>
      </div>

      <style>{`.sf-w2-quote-tick{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-quote-tick *{box-sizing:border-box}.sf-w2-quote-tick button,.sf-w2-quote-tick input,.sf-w2-quote-tick select,.sf-w2-quote-tick textarea{font:inherit}.sf-w2-quote-tick button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-quote-tick button:disabled{opacity:.4;cursor:default}.sf-w2-quote-tick button:active:not(:disabled){transform:scale(.98)}.sf-w2-quote-tick input,.sf-w2-quote-tick textarea{font-size:16px;min-width:0}.sf-w2-quote-tick button:focus-visible,.sf-w2-quote-tick input:focus-visible,.sf-w2-quote-tick select:focus-visible,.sf-w2-quote-tick textarea:focus-visible,.sf-w2-quote-tick [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-quote-tick h2,.sf-w2-quote-tick p{margin:0}.sf-w2-quote-tick .row{display:flex;align-items:center;gap:12px}.sf-w2-quote-tick .between{justify-content:space-between}.sf-w2-quote-tick .muted{opacity:.6}.sf-w2-quote-tick .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-quote-tick[data-still=true] *,.sf-w2-quote-tick[data-still=true] *::before,.sf-w2-quote-tick[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-quote-tick *,.sf-w2-quote-tick *::before,.sf-w2-quote-tick *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-quote-tick button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-quote-tick{display:grid;place-items:center;background:#111316;color:#f4f4f4;padding:28px}.sf-w2-quote-tick .instrument{width:min(100%,380px)}.sf-w2-quote-tick b{font-weight:500}.sf-w2-quote-tick .symbol{color:#747a82;font-size:11px}.sf-w2-quote-tick .venue{color:#8a9199;font-size:11px}.sf-w2-quote-tick .price{display:flex;align-items:baseline;gap:13px;overflow:hidden;border-bottom:1px solid #373c43;padding:17px 0 13px;transition:color .2s}.sf-w2-quote-tick .number{font-size:clamp(42px,10cqw,65px);letter-spacing:-3px;font-variant-numeric:tabular-nums;line-height:1.2;animation:quote-w2 .22s cubic-bezier(.2,.8,.2,1)}.sf-w2-quote-tick .unit{font-size:12px;color:#969ca5}.sf-w2-quote-tick .price[data-flash=true][data-up=true]{color:#8dbdab}.sf-w2-quote-tick .price[data-flash=true][data-up=false]{color:#ea8e7b}.sf-w2-quote-tick .comparison{display:flex;align-items:center;gap:19px;font:13px monospace;margin-top:19px;color:#868f99}.sf-w2-quote-tick .comparison svg{width:47px;fill:none;stroke:#5b626c}.sf-w2-quote-tick .comparison b[data-up=true]{color:#a3d0b5}.sf-w2-quote-tick .comparison b[data-up=false]{color:#ea8e7b}.sf-w2-quote-tick .ticks{display:flex;justify-content:space-between;align-items:end;margin-top:21px;height:12px}.sf-w2-quote-tick .ticks i{width:1px;background:#444b55}.sf-w2-quote-tick .controls{display:flex;justify-content:space-between;margin-top:9px;font-size:11px}.sf-w2-quote-tick .controls button{padding:0 10px;border-bottom:1px solid #404751}@keyframes quote-w2{from{opacity:.2;transform:translateY(var(--tick-travel,8px))}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  )
}
