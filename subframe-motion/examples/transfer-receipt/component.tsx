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

  const [phase, setPhase] = React.useState<"ready" | "pending" | "done">("ready"),
    [amount, setAmount] = React.useState("240")
  React.useEffect(() => {
    if (phase !== "pending" || !active) {
      return
    }
    const t = setTimeout(() => setPhase("done"), 1600)
    return () => clearTimeout(t)
  }, [phase, active])
  const valid = Number.isFinite(Number(amount)) && Number(amount) > 0 && Number(amount) <= 2480

  return (
    <section
      className="sf-w2-transfer-receipt"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="receipt" data-done={phase === "done"}>
        <div className="row between top">
          <h2>{phase === "done" ? "Transfer complete" : "Between accounts"}</h2>
          <span className="seal" aria-hidden>
            {phase === "done" ? "✓" : "↗"}
          </span>
        </div>
        <div className="accounts">
          <div className="account">
            <span className="mark" aria-hidden>
              ↗
            </span>
            <div>
              <b>Everyday</b>
              <small>•• 2084</small>
            </div>
            <strong>{phase === "done" ? `−$${Number(amount).toFixed(2)}` : "$2,480.00"}</strong>
          </div>
          <div className="join" aria-hidden>
            <span />
          </div>
          <div className="account">
            <span className="mark" aria-hidden>
              ↘
            </span>
            <div>
              <b>Reserve</b>
              <small>•• 6012</small>
            </div>
            <strong>{phase === "done" ? `+$${Number(amount).toFixed(2)}` : "USD"}</strong>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (valid) {
              setPhase("pending")
            }
          }}
        >
          <label className="amount">
            Amount <span>$</span>
            <input
              aria-label="Transfer amount in dollars"
              type="number"
              min=".01"
              max="2480"
              step=".01"
              value={amount}
              disabled={phase !== "ready"}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <div className="actions">
            {phase === "done" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setPhase("ready")
                }}
              >
                New preview
              </button>
            ) : phase === "pending" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setPhase("ready")
                }}
              >
                Cancel preview
              </button>
            ) : (
              <button type="submit" disabled={!valid}>
                Preview transfer <span aria-hidden>→</span>
              </button>
            )}
          </div>
        </form>
        <p className="status" role="status">
          {phase === "pending"
            ? "Processing local preview…"
            : phase === "done"
            ? "Recorded in this preview"
            : "Preview only · no funds move"}
        </p>
      </div>

      <style>{`.sf-w2-transfer-receipt{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-transfer-receipt *{box-sizing:border-box}.sf-w2-transfer-receipt button,.sf-w2-transfer-receipt input,.sf-w2-transfer-receipt select,.sf-w2-transfer-receipt textarea{font:inherit}.sf-w2-transfer-receipt button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-transfer-receipt button:disabled{opacity:.4;cursor:default}.sf-w2-transfer-receipt button:active:not(:disabled){transform:scale(.98)}.sf-w2-transfer-receipt input,.sf-w2-transfer-receipt textarea{font-size:16px;min-width:0}.sf-w2-transfer-receipt button:focus-visible,.sf-w2-transfer-receipt input:focus-visible,.sf-w2-transfer-receipt select:focus-visible,.sf-w2-transfer-receipt textarea:focus-visible,.sf-w2-transfer-receipt [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-transfer-receipt h2,.sf-w2-transfer-receipt p{margin:0}.sf-w2-transfer-receipt .row{display:flex;align-items:center;gap:12px}.sf-w2-transfer-receipt .between{justify-content:space-between}.sf-w2-transfer-receipt .muted{opacity:.6}.sf-w2-transfer-receipt .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-transfer-receipt[data-still=true] *,.sf-w2-transfer-receipt[data-still=true] *::before,.sf-w2-transfer-receipt[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-transfer-receipt *,.sf-w2-transfer-receipt *::before,.sf-w2-transfer-receipt *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-transfer-receipt button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-transfer-receipt{display:grid;place-items:center;background:#163d32;color:#1e372c;padding:20px}.sf-w2-transfer-receipt .receipt{width:min(100%,370px)}.sf-w2-transfer-receipt .top{color:#eef5ef;margin-bottom:13px}.sf-w2-transfer-receipt h2{font-size:18px;font-weight:500;letter-spacing:-.4px}.sf-w2-transfer-receipt .seal{width:29px;height:29px;border:1px solid #618373;border-radius:50%;display:grid;place-items:center;color:#c8e9d2}.sf-w2-transfer-receipt .accounts{position:relative}.sf-w2-transfer-receipt .account{height:67px;display:flex;align-items:center;gap:12px;padding:13px 17px;background:#f1f5ef;border-radius:6px;transition:transform .3s cubic-bezier(.2,.8,.2,1),border-radius .3s}.sf-w2-transfer-receipt .account:last-child{margin-top:12px}.sf-w2-transfer-receipt .account .mark{font-size:20px;opacity:.4}.sf-w2-transfer-receipt .account b{font-size:12px;font-weight:500;display:block}.sf-w2-transfer-receipt .account small{font-size:10px;color:#8b978e}.sf-w2-transfer-receipt .account strong{margin-left:auto;font:13px monospace}.sf-w2-transfer-receipt .join{position:absolute;top:61px;left:34px;height:23px;z-index:2;width:1px;background:#b1c0b4;transition:transform .3s;transform-origin:top}.sf-w2-transfer-receipt .join span{display:block;position:absolute;width:5px;height:5px;background:#e0f1e3;border:1px solid #9baa9e;border-radius:50%;left:-2px;top:9px}.sf-w2-transfer-receipt .receipt[data-done=true] .account:first-child{border-radius:6px 6px 0 0}.sf-w2-transfer-receipt .receipt[data-done=true] .account:last-child{transform:translateY(-12px);border-radius:0 0 6px 6px;border-top:1px dashed #c8d1c7}.sf-w2-transfer-receipt .receipt[data-done=true] .join{transform:scaleY(0)}.sf-w2-transfer-receipt form{display:flex;align-items:center;gap:12px;margin-top:16px}.sf-w2-transfer-receipt .amount{display:flex;align-items:center;gap:8px;color:#c4d8cc;font-size:11px;min-width:0;flex:1}.sf-w2-transfer-receipt .amount>span{margin-left:auto}.sf-w2-transfer-receipt input{width:66px;background:transparent;color:#f5faf5;border:0;border-bottom:1px solid #577367;padding:9px 0;font-size:16px;min-height:44px;appearance:textfield}.sf-w2-transfer-receipt .actions button{font-size:11px;white-space:nowrap;padding:0 12px;background:#d6e8d5;border-radius:4px;color:#1e3e2e}.sf-w2-transfer-receipt .status{font-size:10px;color:#8eb29e;margin-top:8px;min-height:14px}`}</style>
    </section>
  )
}
