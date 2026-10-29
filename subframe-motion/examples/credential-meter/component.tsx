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

  const [value, setValue] = React.useState(""),
    [shown, setShown] = React.useState(false)
  const id = React.useId()
  const rules = [
    { label: "12 characters", met: value.length >= 12 },
    { label: "Mixed case", met: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: "A number", met: /\d/.test(value) },
    { label: "A symbol", met: /[^\w\s]/.test(value) },
  ]
  const count = rules.filter((r) => r.met).length

  return (
    <section
      className="sf-w2-credential-meter"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="vault">
        <label htmlFor={id}>New password</label>
        <div className="field">
          <input
            id={id}
            type={shown ? "text" : "password"}
            autoComplete="new-password"
            value={value}
            placeholder="At least 12 characters"
            onChange={(e) => setValue(e.target.value)}
            maxLength={80}
          />
          <button type="button" onClick={() => setShown(!shown)} aria-label={shown ? "Hide password" : "Show password"}>
            {shown ? "Hide" : "Show"}
          </button>
        </div>
        <div
          className="meter"
          role="meter"
          aria-label="Password requirements met"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={count}
        >
          {rules.map((r, i) => (
            <i key={r.label} data-met={i < count} />
          ))}
        </div>
        <div className="rules">
          {rules.map((r) => (
            <span key={r.label} data-met={r.met}>
              <b aria-hidden>{r.met ? "✓" : "·"}</b>
              {r.label}
            </span>
          ))}
        </div>
        <div className="foot" role="status">
          {count === 4 ? "All requirements met" : `${count} of 4 requirements met`}
        </div>
      </div>

      <style>{`.sf-w2-credential-meter{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-credential-meter *{box-sizing:border-box}.sf-w2-credential-meter button,.sf-w2-credential-meter input,.sf-w2-credential-meter select,.sf-w2-credential-meter textarea{font:inherit}.sf-w2-credential-meter button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-credential-meter button:disabled{opacity:.4;cursor:default}.sf-w2-credential-meter button:active:not(:disabled){transform:scale(.98)}.sf-w2-credential-meter input,.sf-w2-credential-meter textarea{font-size:16px;min-width:0}.sf-w2-credential-meter button:focus-visible,.sf-w2-credential-meter input:focus-visible,.sf-w2-credential-meter select:focus-visible,.sf-w2-credential-meter textarea:focus-visible,.sf-w2-credential-meter [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-credential-meter p{margin:0}.sf-w2-credential-meter .muted{opacity:.6}.sf-w2-credential-meter .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-credential-meter[data-still=true] *,.sf-w2-credential-meter[data-still=true] *::before,.sf-w2-credential-meter[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-credential-meter *,.sf-w2-credential-meter *::before,.sf-w2-credential-meter *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-credential-meter button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-credential-meter{background:#121514;color:#f0f3f1;display:grid;place-items:center;padding:24px}.sf-w2-credential-meter .vault{width:min(100%,364px)}.sf-w2-credential-meter .key{font-size:25px;color:#9db9ac}.sf-w2-credential-meter label{display:block;margin:0 0 7px;color:#bbc5bf;font-size:12px}.sf-w2-credential-meter .field{display:flex;border:1px solid #424b45;border-radius:8px;background:#1e2420;overflow:hidden}.sf-w2-credential-meter input{flex:1;width:100%;border:0;background:transparent;color:#f2f7f3;padding:12px}.sf-w2-credential-meter input::placeholder{font-size:13px;color:#858f88}.sf-w2-credential-meter .field button{font-size:11px;padding:0 14px;color:#cbd5ce}.sf-w2-credential-meter .meter{display:flex;gap:5px;margin:17px 0}.sf-w2-credential-meter .meter i{height:3px;flex:1;background:#364039;transition:background .18s}.sf-w2-credential-meter .meter i[data-met=true]{background:#89c8a7}.sf-w2-credential-meter .rules{display:grid;grid-template-columns:1fr 1fr;gap:10px;color:#87938b;font-size:12px}.sf-w2-credential-meter .rules span{display:flex;gap:7px;align-items:center;transition:color .18s}.sf-w2-credential-meter .rules span[data-met=true]{color:#c9e6d7}.sf-w2-credential-meter .rules b{display:grid;place-items:center;width:15px;font-size:13px}.sf-w2-credential-meter .foot{font-size:11px;color:#9aa99f;margin-top:20px;padding-top:14px;border-top:1px solid #303a33}`}</style>
    </section>
  )
}
