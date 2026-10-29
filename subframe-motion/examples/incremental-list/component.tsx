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

  const [count, setCount] = React.useState(3),
    [phase, setPhase] = React.useState<"idle" | "loading" | "error">("idle"),
    [failed, setFailed] = React.useState(false)
  const viewport = React.useRef<HTMLDivElement>(null)
  const records = [
    "Counterform",
    "Collected forms",
    "Soft systems",
    "After the light",
    "Field studies",
    "In the interval",
    "Quiet construction",
    "Moving matter",
    "Common ground",
  ]
  React.useEffect(() => {
    if (phase !== "loading" || !active) {
      return
    }
    const t = setTimeout(() => {
      if (!failed) {
        setPhase("error")
        setFailed(true)
      } else {
        setCount((c) => Math.min(9, c + 3))
        setPhase("idle")
      }
    }, 600)
    return () => clearTimeout(t)
  }, [phase, active, failed])

  return (
    <section
      className="sf-w2-incremental-list"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="archive">
        <header className="row between">
          <h2>Reading room</h2>
          <span>{count} / 9</span>
        </header>
        <div ref={viewport} className="list" tabIndex={0} aria-label="Loaded publications">
          {records.slice(0, count).map((n, i) => (
            <div className="record" key={n}>
              <span
                className="cover"
                aria-hidden
                style={{ background: i % 3 === 0 ? "#ad342e" : i % 3 === 1 ? "#292d2b" : "#a8acaa" }}
              >
                <i style={{ transform: `rotate(${i * 23}deg)` }} />
              </span>
              <div>
                <b>{n}</b>
                <span>Volume {String(i + 1).padStart(2, "0")}</span>
              </div>
              <small>↗</small>
            </div>
          ))}
        </div>
        <footer>
          <div role="status">
            {phase === "error"
              ? "Couldn't load this batch."
              : count === 9
              ? "All publications loaded"
              : phase === "loading"
              ? "Loading next batch…"
              : `${9 - count} more publications`}
          </div>
          <button type="button" disabled={phase === "loading" || count === 9} onClick={() => setPhase("loading")}>
            {phase === "error" ? "Try again" : count === 9 ? "Complete" : "Load more"}
            <span aria-hidden>{phase === "error" ? "↺" : "↓"}</span>
          </button>
        </footer>
      </div>

      <style>{`.sf-w2-incremental-list{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-incremental-list *{box-sizing:border-box}.sf-w2-incremental-list button,.sf-w2-incremental-list input,.sf-w2-incremental-list select,.sf-w2-incremental-list textarea{font:inherit}.sf-w2-incremental-list button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-incremental-list button:disabled{opacity:.4;cursor:default}.sf-w2-incremental-list button:active:not(:disabled){transform:scale(.98)}.sf-w2-incremental-list input,.sf-w2-incremental-list textarea{font-size:16px;min-width:0}.sf-w2-incremental-list button:focus-visible,.sf-w2-incremental-list input:focus-visible,.sf-w2-incremental-list select:focus-visible,.sf-w2-incremental-list textarea:focus-visible,.sf-w2-incremental-list [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-incremental-list h2,.sf-w2-incremental-list p{margin:0}.sf-w2-incremental-list .row{display:flex;align-items:center;gap:12px}.sf-w2-incremental-list .between{justify-content:space-between}.sf-w2-incremental-list .muted{opacity:.6}.sf-w2-incremental-list .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-incremental-list[data-still=true] *,.sf-w2-incremental-list[data-still=true] *::before,.sf-w2-incremental-list[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-incremental-list *,.sf-w2-incremental-list *::before,.sf-w2-incremental-list *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-incremental-list button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-incremental-list{display:grid;place-items:center;padding:20px;background:#f3f2ee;color:#252624}.sf-w2-incremental-list .archive{width:min(100%,416px)}.sf-w2-incremental-list header{height:42px;border-bottom:1px solid #c4c7c0;padding-bottom:12px}.sf-w2-incremental-list h2{font:22px Georgia,serif;letter-spacing:-.5px}.sf-w2-incremental-list header>span{font:10px monospace;color:#84877f}.sf-w2-incremental-list .list{height:186px;overflow:auto;scrollbar-width:thin;overscroll-behavior:contain}.sf-w2-incremental-list .record{height:62px;display:flex;gap:13px;align-items:center;border-bottom:1px solid #d9dcd5;animation:load-w2 .18s ease-out}.sf-w2-incremental-list .cover{display:block;width:30px;height:39px;overflow:hidden;position:relative}.sf-w2-incremental-list .cover i{display:block;position:absolute;width:29px;height:29px;border:1px solid #eee9dc;top:8px;left:8px;border-radius:50%}.sf-w2-incremental-list .record b{font-size:12px;font-weight:400;display:block}.sf-w2-incremental-list .record div>span{display:block;margin-top:2px;font:9px monospace;color:#898c83}.sf-w2-incremental-list small{margin-left:auto;color:#90958a;font-size:15px}.sf-w2-incremental-list footer{display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#7e8579;margin-top:8px;gap:8px}.sf-w2-incremental-list footer button{display:flex;align-items:center;gap:15px;font-size:11px;color:#363f33;padding:0 0 0 12px}@keyframes load-w2{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  )
}
