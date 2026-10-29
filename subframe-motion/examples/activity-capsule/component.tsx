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

  const [expanded, setExpanded] = React.useState(true),
    [progress, setProgress] = React.useState(36),
    [phase, setPhase] = React.useState<"idle" | "running" | "cancelled" | "done">("idle")
  React.useEffect(() => {
    if (!active || phase !== "running") {
      return
    }
    const t = setTimeout(() => {
      if (progress >= 88) {
        setProgress(100)
        setPhase("done")
      } else {
        setProgress((p) => p + 13)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [phase, progress, active])
  const start = () => {
    setProgress(0)
    setPhase("running")
  }

  return (
    <section
      className="sf-w2-activity-capsule"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="capsule" data-expanded={expanded}>
        <button type="button" className="summary" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          <span className="glyph" aria-hidden>
            {phase === "done" ? "✓" : phase === "cancelled" ? "×" : "↗"}
          </span>
          <span>
            {expanded
              ? "Export collection"
              : phase === "running"
              ? `Exporting · ${progress}%`
              : phase === "done"
              ? "Export ready"
              : phase === "cancelled"
              ? "Export cancelled"
              : "Export collection"}
          </span>
          <span className="chevron" aria-hidden>
            {expanded ? "−" : "+"}
          </span>
        </button>
        {expanded && (
          <div className="details">
            <div className="file">
              <div className="cover" aria-hidden>
                <i />
              </div>
              <div>
                <b>After hours</b>
                <span>12 frames · PNG</span>
              </div>
              <span className="size">28 MB</span>
            </div>
            <div
              className="segments"
              role="progressbar"
              aria-label="Export progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={phase === "idle" ? 0 : progress}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <i key={i} data-on={phase !== "idle" && i < (progress / 100) * 24} />
              ))}
            </div>
            <div className="row between footer">
              <span role="status">
                {phase === "running"
                  ? `${progress}% rendered`
                  : phase === "done"
                  ? "Ready to save"
                  : phase === "cancelled"
                  ? "Stopped"
                  : "Local render preview"}
              </span>
              <button type="button" onClick={() => (phase === "running" ? setPhase("cancelled") : start())}>
                {phase === "running" ? "Cancel" : phase === "idle" ? "Render" : "Render again"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`.sf-w2-activity-capsule{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-activity-capsule *{box-sizing:border-box}.sf-w2-activity-capsule button,.sf-w2-activity-capsule input,.sf-w2-activity-capsule select,.sf-w2-activity-capsule textarea{font:inherit}.sf-w2-activity-capsule button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-activity-capsule button:disabled{opacity:.4;cursor:default}.sf-w2-activity-capsule button:active:not(:disabled){transform:scale(.98)}.sf-w2-activity-capsule input,.sf-w2-activity-capsule textarea{font-size:16px;min-width:0}.sf-w2-activity-capsule button:focus-visible,.sf-w2-activity-capsule input:focus-visible,.sf-w2-activity-capsule select:focus-visible,.sf-w2-activity-capsule textarea:focus-visible,.sf-w2-activity-capsule [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-activity-capsule h2,.sf-w2-activity-capsule p{margin:0}.sf-w2-activity-capsule .row{display:flex;align-items:center;gap:12px}.sf-w2-activity-capsule .between{justify-content:space-between}.sf-w2-activity-capsule .muted{opacity:.6}.sf-w2-activity-capsule .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-activity-capsule[data-still=true] *,.sf-w2-activity-capsule[data-still=true] *::before,.sf-w2-activity-capsule[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-activity-capsule *,.sf-w2-activity-capsule *::before,.sf-w2-activity-capsule *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-activity-capsule button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-activity-capsule{display:flex;flex-direction:column;align-items:center;justify-content:center;background:#d5d8dc;color:#f1f0ed;padding:20px}.sf-w2-activity-capsule .capsule{width:min(100%,365px);background:#24262a;border-radius:17px;border:1px solid #1c1e20;box-shadow:0 2px 3px #1115,0 18px 38px #17212d20;overflow:hidden;transition:width .25s cubic-bezier(.2,.8,.2,1),border-radius .25s}.sf-w2-activity-capsule .capsule[data-expanded=false]{width:230px;border-radius:28px}.sf-w2-activity-capsule .summary{display:flex;width:100%;align-items:center;gap:10px;height:57px;padding:0 20px;text-align:left;font-size:12px}.sf-w2-activity-capsule .glyph{color:#e6b77b;font-size:19px}.sf-w2-activity-capsule .chevron{margin-left:auto;color:#8e9299}.sf-w2-activity-capsule .details{padding:0 20px 15px;animation:activity-w2 .18s ease-out}.sf-w2-activity-capsule .file{display:flex;align-items:center;gap:12px;padding:12px 0 22px;border-top:1px solid #3d4148}.sf-w2-activity-capsule .cover{height:48px;width:37px;background:#cec4ae;position:relative;overflow:hidden;flex-shrink:0}.sf-w2-activity-capsule .cover i{position:absolute;border:5px solid #31342f;border-radius:50%;width:30px;height:60px;left:15px;top:-5px;transform:rotate(25deg)}.sf-w2-activity-capsule .file b{display:block;font:19px Georgia,serif;color:#eee6d7}.sf-w2-activity-capsule .file span{display:block;font-size:10px;color:#858b95;margin-top:4px}.sf-w2-activity-capsule .file>.size{margin-left:auto;white-space:nowrap}.sf-w2-activity-capsule .segments{display:flex;gap:3px;height:14px}.sf-w2-activity-capsule .segments i{flex:1;background:#383d44;transition:background .16s}.sf-w2-activity-capsule .segments i[data-on=true]{background:#ce9f64}.sf-w2-activity-capsule .footer{margin-top:6px;font-size:10px;color:#a1a6af}.sf-w2-activity-capsule .footer button{color:#e9d8be;font-size:11px;padding:0 6px}@keyframes activity-w2{from{opacity:0}to{opacity:1}}`}</style>
    </section>
  )
}
