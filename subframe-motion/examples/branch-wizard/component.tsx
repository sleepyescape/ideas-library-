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

  const [step, setStep] = React.useState(0),
    [name, setName] = React.useState(""),
    [format, setFormat] = React.useState("PDF"),
    [quality, setQuality] = React.useState("Print"),
    [error, setError] = React.useState(false),
    [done, setDone] = React.useState(false),
    [direction, setDirection] = React.useState(1)
  const panel = React.useRef<HTMLDivElement>(null),
    id = React.useId()
  const go = (next: number) => {
    if (next > 0 && !name.trim()) {
      setError(true)
      return
    }
    setDirection(next > step ? 1 : -1)
    setStep(next)
    setError(false)
  }
  React.useEffect(() => {
    if (step > 0) {
      panel.current?.focus({ preventScroll: true })
    }
  }, [step])

  return (
    <section
      className="sf-w2-branch-wizard"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="wizard">
        <header className="row between">
          <h2>Export collection</h2>
          <span>{done ? "Ready" : `${step + 1} / 3`}</span>
        </header>
        <div className="rail" aria-label="Export steps">
          {["Name", "Format", "Review"].map((s, i) => (
            <button
              type="button"
              key={s}
              disabled={i > step || done}
              aria-current={i === step && !done ? "step" : undefined}
              onClick={() => go(i)}
            >
              <i aria-hidden>{i < step || done ? "✓" : i + 1}</i>
              {s}
            </button>
          ))}
        </div>
        <div
          ref={panel}
          className="panel"
          role="group"
          aria-label={done ? "Export ready" : ["Name collection", "Choose export format", "Review export"][step]}
          tabIndex={-1}
        >
          <div
            key={done ? "done" : step}
            className="step"
            style={{ "--travel": `${direction * 8}px` } as React.CSSProperties}
          >
            {done ? (
              <div className="complete">
                <span aria-hidden>✓</span>
                <h3>
                  {name}.{format.toLowerCase()}
                </h3>
                <p>Prepared locally</p>
              </div>
            ) : step === 0 ? (
              <>
                <label htmlFor={id}>Collection name</label>
                <input
                  id={id}
                  value={name}
                  placeholder="Untitled collection"
                  aria-invalid={error}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError(false)
                  }}
                  maxLength={32}
                />
                <p className="error" role="status">
                  {error ? "Enter a collection name" : ""}
                </p>
              </>
            ) : step === 1 ? (
              <>
                <div className="choices" role="group" aria-label="File format">
                  {["PDF", "PNG", "SVG"].map((f) => (
                    <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)}>
                      <span aria-hidden>{f === "PDF" ? "▤" : f === "PNG" ? "▧" : "◇"}</span>
                      {f}
                    </button>
                  ))}
                </div>
                <label className="quality">
                  Quality{" "}
                  <select aria-label="Export quality" value={quality} onChange={(e) => setQuality(e.target.value)}>
                    <option>Print</option>
                    <option>Screen</option>
                  </select>
                </label>
              </>
            ) : (
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{name}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>
                    {format} · {quality}
                  </dd>
                </div>
                <div>
                  <dt>Contents</dt>
                  <dd>12 frames</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
        <footer>
          <button
            type="button"
            disabled={step === 0 && !done}
            onClick={() => (done ? (setDone(false), go(0)) : go(step - 1))}
          >
            {done ? "Start again" : "← Back"}
          </button>
          {!done && (
            <button type="button" className="next" onClick={() => (step === 2 ? setDone(true) : go(step + 1))}>
              {step === 2 ? "Prepare export" : "Continue"} <span aria-hidden>→</span>
            </button>
          )}
        </footer>
      </div>

      <style>{`.sf-w2-branch-wizard{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-branch-wizard *{box-sizing:border-box}.sf-w2-branch-wizard button,.sf-w2-branch-wizard input,.sf-w2-branch-wizard select,.sf-w2-branch-wizard textarea{font:inherit}.sf-w2-branch-wizard button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-branch-wizard button:disabled{opacity:.4;cursor:default}.sf-w2-branch-wizard button:active:not(:disabled){transform:scale(.98)}.sf-w2-branch-wizard input,.sf-w2-branch-wizard textarea{font-size:16px;min-width:0}.sf-w2-branch-wizard button:focus-visible,.sf-w2-branch-wizard input:focus-visible,.sf-w2-branch-wizard select:focus-visible,.sf-w2-branch-wizard textarea:focus-visible,.sf-w2-branch-wizard [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-branch-wizard h2,.sf-w2-branch-wizard p{margin:0}.sf-w2-branch-wizard .row{display:flex;align-items:center;gap:12px}.sf-w2-branch-wizard .between{justify-content:space-between}.sf-w2-branch-wizard .muted{opacity:.6}.sf-w2-branch-wizard .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-branch-wizard[data-still=true] *,.sf-w2-branch-wizard[data-still=true] *::before,.sf-w2-branch-wizard[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-branch-wizard *,.sf-w2-branch-wizard *::before,.sf-w2-branch-wizard *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-branch-wizard button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-branch-wizard{display:grid;place-items:center;padding:20px;background:#e6eaed;color:#263643}.sf-w2-branch-wizard .wizard{width:min(100%,390px);background:#f9fbfc;border:1px solid #cdd7de;border-radius:6px;padding:17px 20px;box-shadow:0 3px 6px #253c4c09}.sf-w2-branch-wizard h2{font-size:15px;font-weight:500;letter-spacing:-.3px}.sf-w2-branch-wizard header>span{font:10px monospace;color:#7f929f}.sf-w2-branch-wizard .rail{display:flex;justify-content:space-between;position:relative;margin:12px 0 10px}.sf-w2-branch-wizard .rail::before{content:'';position:absolute;left:10px;right:10px;top:21px;height:1px;background:#d5e0e7}.sf-w2-branch-wizard .rail button{position:relative;display:flex;align-items:center;gap:6px;font-size:10px;background:#f9fbfc;padding:0 5px;color:#7c8f9d}.sf-w2-branch-wizard .rail i{font:9px monospace;border:1px solid #d0dce4;border-radius:50%;width:19px;height:19px;display:grid;place-items:center;background:#f9fbfc}.sf-w2-branch-wizard .rail [aria-current=step]{color:#245f96}.sf-w2-branch-wizard .rail [aria-current=step] i{border-color:#4c789f;color:#245f96}.sf-w2-branch-wizard .panel{height:119px;overflow:hidden;outline-offset:0}.sf-w2-branch-wizard .step{animation:wizard-w2 .2s ease-out}.sf-w2-branch-wizard .step>label{display:block;font-size:11px;margin:2px 0 7px}.sf-w2-branch-wizard .step>input{width:100%;height:44px;border:1px solid #cbd6dd;border-radius:4px;padding:0 10px;background:white;font-size:16px;color:#243d4d}.sf-w2-branch-wizard .error{font-size:10px;color:#8798a6;margin-top:8px}.sf-w2-branch-wizard input[aria-invalid=true]{border-color:#c65d4c}.sf-w2-branch-wizard input[aria-invalid=true]+.error{color:#af4f3f}.sf-w2-branch-wizard footer{display:flex;justify-content:space-between;gap:10px;border-top:1px solid #e5eaee;padding-top:6px}.sf-w2-branch-wizard footer button{font-size:10px;padding:0 5px}.sf-w2-branch-wizard footer .next{padding:0 12px;background:#345d80;color:white;border-radius:4px;min-height:44px}.sf-w2-branch-wizard .choices{display:flex;gap:8px}.sf-w2-branch-wizard .choices button{flex:1;border:1px solid #d1dae0;border-radius:4px;display:flex;justify-content:center;align-items:center;gap:7px;font-size:11px;background:white}.sf-w2-branch-wizard .choices [aria-pressed=true]{border-color:#668ca9;color:#1c5c87;box-shadow:0 0 0 1px #668ca9 inset}.sf-w2-branch-wizard .choices span{font-size:17px}.sf-w2-branch-wizard .step .quality{display:flex;justify-content:space-between;align-items:center;margin-top:8px;color:#8193a0}.sf-w2-branch-wizard select{height:44px;border:0;background:none;color:#3c5568;font-size:11px}.sf-w2-branch-wizard dl{margin:0;font-size:11px}.sf-w2-branch-wizard dl>div{display:flex;justify-content:space-between;gap:10px;padding:8px 0}.sf-w2-branch-wizard dt{color:#8798a6}.sf-w2-branch-wizard dd{margin:0;max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sf-w2-branch-wizard .complete{text-align:center;padding:1px}.sf-w2-branch-wizard .complete>span{display:block;font-size:25px;color:#3c7c60}.sf-w2-branch-wizard .complete h3{font-weight:500;font-size:13px;margin:9px 0 5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sf-w2-branch-wizard .complete p{font-size:10px;color:#91a1ae}@container(max-width:360px){.sf-w2-branch-wizard .wizard{padding:12px 14px}.sf-w2-branch-wizard .rail{margin:8px 0 6px}.sf-w2-branch-wizard .panel{height:111px}}@keyframes wizard-w2{from{opacity:0;transform:translateX(var(--travel))}to{opacity:1;transform:translateX(0)}}`}</style>
    </section>
  )
}
