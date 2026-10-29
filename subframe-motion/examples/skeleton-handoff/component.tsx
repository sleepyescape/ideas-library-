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

  const [request, setRequest] = React.useState(0),
    [loading, setLoading] = React.useState(false),
    [skeleton, setSkeleton] = React.useState(false),
    [edition, setEdition] = React.useState(0),
    [fast, setFast] = React.useState(false)
  const start = () => {
    if (loading) {
      return
    }
    setLoading(true)
    setRequest((n) => n + 1)
  }
  React.useEffect(() => {
    if (!loading || !active) {
      return
    }
    const show = setTimeout(() => setSkeleton(true), 140)
    const finish = setTimeout(
      () => {
        setEdition((n) => (n + 1) % 3)
        setLoading(false)
        setSkeleton(false)
      },
      fast ? 65 : 850,
    )
    return () => {
      clearTimeout(show)
      clearTimeout(finish)
    }
  }, [request, loading, active, fast])

  return (
    <section
      className="sf-w2-skeleton-handoff"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="publication">
        <div className="row between top">
          <span>From the archive</span>
          <button type="button" aria-label="Reload publication preview" disabled={loading} onClick={start}>
            ↻
          </button>
        </div>
        <div className="content" aria-busy={loading} data-skeleton={skeleton}>
          <div className="cover" aria-hidden>
            <div className="shape" style={{ transform: `rotate(${edition * 45}deg)` }} />
            <strong>{["a", "b", "c"][edition]}</strong>
          </div>
          <div className="copy">
            <small>FIELD NOTES</small>
            <h2>
              {["Structures<br/>of silence.", "A different<br/>measure.", "Forms<br/>in motion."][edition]
                .split("<br/>")
                .map((s, i) => (
                  <React.Fragment key={s}>
                    {i > 0 && <br />}
                    {s}
                  </React.Fragment>
                ))}
            </h2>
            <p>{["Collected essays / 2026", "Design journal / 2026", "Material studies / 2026"][edition]}</p>
          </div>
          <div className="bones" aria-hidden>
            <i />
            <div>
              <b />
              <b />
              <b />
              <span />
            </div>
          </div>
        </div>
        <footer>
          <label>
            <input type="checkbox" checked={fast} disabled={loading} onChange={(e) => setFast(e.target.checked)} />
            Fast response
          </label>
          <span role="status">{loading ? "Loading…" : "Ready"}</span>
        </footer>
      </div>

      <style>{`.sf-w2-skeleton-handoff{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-skeleton-handoff *{box-sizing:border-box}.sf-w2-skeleton-handoff button,.sf-w2-skeleton-handoff input,.sf-w2-skeleton-handoff select,.sf-w2-skeleton-handoff textarea{font:inherit}.sf-w2-skeleton-handoff button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-skeleton-handoff button:disabled{opacity:.4;cursor:default}.sf-w2-skeleton-handoff button:active:not(:disabled){transform:scale(.98)}.sf-w2-skeleton-handoff input,.sf-w2-skeleton-handoff textarea{font-size:16px;min-width:0}.sf-w2-skeleton-handoff button:focus-visible,.sf-w2-skeleton-handoff input:focus-visible,.sf-w2-skeleton-handoff select:focus-visible,.sf-w2-skeleton-handoff textarea:focus-visible,.sf-w2-skeleton-handoff [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-skeleton-handoff h2,.sf-w2-skeleton-handoff p{margin:0}.sf-w2-skeleton-handoff .row{display:flex;align-items:center;gap:12px}.sf-w2-skeleton-handoff .between{justify-content:space-between}.sf-w2-skeleton-handoff .muted{opacity:.6}.sf-w2-skeleton-handoff .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-skeleton-handoff[data-still=true] *,.sf-w2-skeleton-handoff[data-still=true] *::before,.sf-w2-skeleton-handoff[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-skeleton-handoff *,.sf-w2-skeleton-handoff *::before,.sf-w2-skeleton-handoff *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-skeleton-handoff button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-skeleton-handoff{display:grid;place-items:center;background:#24477b;color:#f6f7fa;padding:22px}.sf-w2-skeleton-handoff .publication{width:min(100%,430px)}.sf-w2-skeleton-handoff .top{font-size:10px;border-bottom:1px solid #52709b;margin-bottom:22px;height:38px}.sf-w2-skeleton-handoff .top button{font-size:20px;width:44px;color:#b7c8e1}.sf-w2-skeleton-handoff .content{position:relative;display:flex;gap:26px;min-height:166px}.sf-w2-skeleton-handoff .cover{width:118px;flex-shrink:0;height:166px;background:#e4e5d9;position:relative;overflow:hidden;color:#193e6c;transition:opacity .2s}.sf-w2-skeleton-handoff .shape{position:absolute;left:54px;top:10px;width:150px;height:150px;border:1px solid #284874;border-radius:50%;transition:transform .22s}.sf-w2-skeleton-handoff .cover strong{font:100px Georgia,serif;position:absolute;bottom:-3px;left:15px;font-weight:400}.sf-w2-skeleton-handoff .copy{padding:12px 0;transition:opacity .2s}.sf-w2-skeleton-handoff .copy small{font:9px monospace;letter-spacing:1px;color:#a1b5d2}.sf-w2-skeleton-handoff h2{font:31px/1.02 Georgia,serif;font-weight:400;margin:20px 0 16px;letter-spacing:-.8px}.sf-w2-skeleton-handoff .copy p{font-size:10px;color:#a1b5d2}.sf-w2-skeleton-handoff .bones{position:absolute;inset:0;display:flex;gap:26px;opacity:0;pointer-events:none;transition:opacity .15s}.sf-w2-skeleton-handoff .bones>i{width:118px;height:166px;background:#4d6c98;flex-shrink:0}.sf-w2-skeleton-handoff .bones>div{padding-top:13px;flex:1}.sf-w2-skeleton-handoff .bones b{display:block;background:#4d6c98;height:15px;width:90%;margin:17px 0}.sf-w2-skeleton-handoff .bones b:first-child{height:5px;width:40%;margin:0 0 26px}.sf-w2-skeleton-handoff .bones b:nth-child(3){width:72%}.sf-w2-skeleton-handoff .bones span{display:block;width:70%;height:5px;background:#4d6c98;margin-top:28px}.sf-w2-skeleton-handoff [data-skeleton=true] .cover,.sf-w2-skeleton-handoff [data-skeleton=true] .copy{opacity:0}.sf-w2-skeleton-handoff [data-skeleton=true] .bones{opacity:1}.sf-w2-skeleton-handoff footer{display:flex;justify-content:space-between;margin-top:20px;font-size:10px;color:#a6bddb}.sf-w2-skeleton-handoff footer label{display:flex;align-items:center;gap:7px;min-height:44px}.sf-w2-skeleton-handoff footer input{accent-color:#bdcce0;width:13px;height:13px}.sf-w2-skeleton-handoff footer>span{align-self:center}@container(max-width:400px){.sf-w2-skeleton-handoff .content,.sf-w2-skeleton-handoff .bones{gap:17px}.sf-w2-skeleton-handoff h2{font-size:25px}.sf-w2-skeleton-handoff .cover,.sf-w2-skeleton-handoff .bones>i{width:89px;height:151px}.sf-w2-skeleton-handoff .content{min-height:151px}.sf-w2-skeleton-handoff .cover strong{font-size:85px;left:12px}.sf-w2-skeleton-handoff .top{margin-bottom:10px}.sf-w2-skeleton-handoff footer{margin-top:10px}}`}</style>
    </section>
  )
}
