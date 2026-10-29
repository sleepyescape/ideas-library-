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

  const [value, setValue] = React.useState("studio-north"),
    [touched, setTouched] = React.useState(false),
    [status, setStatus] = React.useState("idle")
  const id = React.useId()
  React.useEffect(() => {
    if (!touched || !active) {
      return
    }
    setStatus("checking")
    const timer = setTimeout(
      () =>
        setStatus(
          !/^[a-z][a-z0-9-]{2,23}$/.test(value)
            ? "invalid"
            : ["studio", "admin", "subframe"].includes(value)
            ? "taken"
            : "available",
        ),
      450,
    )
    return () => clearTimeout(timer)
  }, [value, touched, active])
  const message =
    status === "available"
      ? "Available"
      : status === "taken"
      ? "This address is already in use"
      : status === "invalid"
      ? "Use 3–24 lowercase letters, numbers or hyphens"
      : status === "checking"
      ? "Checking address…"
      : "Choose a unique project address"

  return (
    <section
      className="sf-w2-address-check"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setTouched(true)
        }}
        className="setup"
      >
        <div className="project-icon" aria-hidden>
          <span />
        </div>
        <label htmlFor={id}>Project address</label>
        <div className="domain" data-invalid={status === "invalid" || status === "taken"}>
          <input
            id={id}
            value={value}
            spellCheck={false}
            autoComplete="off"
            aria-describedby={id + "-status"}
            aria-invalid={status === "invalid" || status === "taken"}
            onBlur={() => setTouched(true)}
            onChange={(e) => {
              setValue(e.target.value)
              if (touched) {
                setStatus("checking")
              }
            }}
          />
          <span>.site</span>
        </div>
        <p id={id + "-status"} className="status" data-state={status} role="status">
          {status === "available" ? "✓ " : ""}
          {message}
        </p>
        <button className="primary" type="submit">
          Check address <span aria-hidden>↗</span>
        </button>
      </form>

      <style>{`.sf-w2-address-check{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-address-check *{box-sizing:border-box}.sf-w2-address-check button,.sf-w2-address-check input,.sf-w2-address-check select,.sf-w2-address-check textarea{font:inherit}.sf-w2-address-check button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-address-check button:disabled{opacity:.4;cursor:default}.sf-w2-address-check button:active:not(:disabled){transform:scale(.98)}.sf-w2-address-check input,.sf-w2-address-check textarea{font-size:16px;min-width:0}.sf-w2-address-check button:focus-visible,.sf-w2-address-check input:focus-visible,.sf-w2-address-check select:focus-visible,.sf-w2-address-check textarea:focus-visible,.sf-w2-address-check [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-address-check p{margin:0}.sf-w2-address-check .row{display:flex;align-items:center;gap:12px}.sf-w2-address-check .between{justify-content:space-between}.sf-w2-address-check .muted{opacity:.6}.sf-w2-address-check .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-address-check[data-still=true] *,.sf-w2-address-check[data-still=true] *::before,.sf-w2-address-check[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-address-check *,.sf-w2-address-check *::before,.sf-w2-address-check *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-address-check button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-address-check{display:grid;place-items:center;background:#fafafa;color:#181818;padding:24px}.sf-w2-address-check .setup{width:min(100%,354px)}.sf-w2-address-check .project-icon{width:30px;height:30px;background:#183326;position:relative;margin-bottom:15px;border-radius:5px}.sf-w2-address-check .project-icon span{position:absolute;inset:7px;border:1px solid #d9ede0;transform:rotate(45deg)}.sf-w2-address-check label{font-size:12px;display:block;margin-bottom:7px}.sf-w2-address-check .domain{display:flex;align-items:center;border:1px solid #d4d7d5;border-radius:7px;background:white;box-shadow:0 1px 2px #00000005;transition:border-color .15s}.sf-w2-address-check .domain[data-invalid=true]{border-color:#c44538}.sf-w2-address-check .domain input{width:100%;padding:12px;border:0;background:transparent;outline-offset:0}.sf-w2-address-check .domain span{font-size:13px;color:#808680;padding:0 13px;border-left:1px solid #e8eae9}.sf-w2-address-check .status{font-size:11px;margin-top:8px;min-height:34px;color:#797f7b}.sf-w2-address-check .status[data-state=available]{color:#257341}.sf-w2-address-check .status[data-state=invalid],.sf-w2-address-check .status[data-state=taken]{color:#b33f33}.sf-w2-address-check .primary{width:100%;background:#1b211e;color:white;border-radius:6px;text-align:left;padding:0 13px;margin-top:9px;display:flex;justify-content:space-between;align-items:center}`}</style>
    </section>
  )
}
