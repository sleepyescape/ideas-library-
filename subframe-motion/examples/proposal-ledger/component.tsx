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
const CHANGES = [
  { field: "Release", before: "v1.8.4", after: "v2.0.0" },
  { field: "Rollout", before: "25%", after: "100%" },
  { field: "Region", before: "US East", after: "Global" },
]
type Decision = "pending" | "accepted" | "rejected"
export default function Example({ active = true }: { active?: boolean }) {
  const [decisions, setDecisions] = React.useState<Decision[]>(["pending", "pending", "pending"])
  const [keyboard, setKeyboard] = React.useState(false)
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const focus = React.useRef<number | null>(null)
  React.useLayoutEffect(() => {
    if (focus.current !== null) {
      refs.current[focus.current]?.focus({ preventScroll: true })
      focus.current = null
    }
  }, [decisions])
  const pending = decisions.filter((v) => v === "pending").length,
    accepted = decisions.filter((v) => v === "accepted").length
  const decide = (i: number, d: Decision) => {
    focus.current = i
    setDecisions((v) => v.map((x, j) => (j === i ? d : x)))
  }
  return (
    <section
      className="sf-proposal-ledger"
      data-still={!active || keyboard}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDownCapture={() => setKeyboard(true)}
      aria-label="Review release settings"
    >
      <div className="ledger">
        <header>
          <span className="branch" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M6 5v11a3 3 0 0 0 3 3h6M6 10h9" />
              <circle cx="6" cy="4" r="2" />
              <circle cx="17" cy="10" r="2" />
              <circle cx="17" cy="19" r="2" />
            </svg>
          </span>
          <div>
            <strong>Release settings</strong>
            <span>production</span>
          </div>
          <div className="progress" aria-label={`${3 - pending} of 3 changes reviewed`}>
            {decisions.map((v, i) => (
              <i key={i} data-state={v} />
            ))}
          </div>
        </header>
        <div className="table-head" aria-hidden>
          <span>Property</span>
          <span>Current</span>
          <span>Proposed</span>
        </div>
        <div role="table" aria-label="Proposed changes">
          {CHANGES.map((change, i) => (
            <div className="change" key={change.field} data-state={decisions[i]} role="row">
              <strong role="rowheader">{change.field}</strong>
              <div className="values" role="cell" aria-label={`${change.before} to ${change.after}; ${decisions[i]}`}>
                <span className="old" aria-hidden>
                  {change.before}
                </span>
                <span className="direction" aria-hidden>
                  →
                </span>
                <span className="new" aria-hidden>
                  {change.after}
                </span>
                <span className="result" aria-hidden>
                  {decisions[i] === "accepted" ? "Applied" : "Kept current"}
                </span>
              </div>
              <div className="actions" role="cell">
                {decisions[i] === "pending" ? (
                  <>
                    <button
                      type="button"
                      ref={(n) => {
                        refs.current[i] = n
                      }}
                      disabled={!active}
                      aria-label={`Reject ${change.field} change`}
                      title="Keep current"
                      className="reject"
                      onClick={() => decide(i, "rejected")}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden>
                        <path d="m4 4 8 8m0-8-8 8" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={!active}
                      aria-label={`Accept ${change.field} change`}
                      title="Apply change"
                      className="accept"
                      onClick={() => decide(i, "accepted")}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden>
                        <path d="m3 8 3 3 7-7" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    ref={(n) => {
                      refs.current[i] = n
                    }}
                    disabled={!active}
                    aria-label={`Undo ${change.field} decision`}
                    className="undo"
                    onClick={() => decide(i, "pending")}
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <footer>
          <span role="status">
            {pending ? (
              <>
                <b>{pending}</b> {pending === 1 ? "change" : "changes"} to review
              </>
            ) : (
              <>
                <i aria-hidden>✓</i> {accepted} applied{accepted < 3 ? `, ${3 - accepted} kept` : ""}
              </>
            )}
          </span>
          <button
            type="button"
            disabled={!active}
            onClick={() =>
              setDecisions(
                pending ? decisions.map((d) => (d === "pending" ? "accepted" : d)) : ["pending", "pending", "pending"],
              )
            }
          >
            {pending ? "Apply remaining" : "Review again"}
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d={pending ? "M3 8h10M9 4l4 4-4 4" : "M3 6a5 5 0 1 1 0 5M3 2v4h4"} />
            </svg>
          </button>
        </footer>
      </div>
      <style>{`
.sf-proposal-ledger{width:100%;height:100%;display:grid;place-items:center;background:#e6e9ed;color:#30343b;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}.sf-proposal-ledger *{box-sizing:border-box}.sf-proposal-ledger button{font:inherit;cursor:pointer;touch-action:manipulation}.sf-proposal-ledger button:disabled{cursor:default}.sf-proposal-ledger :focus-visible{outline:2px solid #307f72;outline-offset:3px}.sf-proposal-ledger .ledger{width:510px;border:1px solid #bcc4cc;border-radius:14px;background:#fff;box-shadow:0 18px 38px -15px #39455442,0 2px 4px #172d4210;overflow:hidden}.sf-proposal-ledger header{display:flex;align-items:center;gap:10px;padding:17px 21px;border-bottom:1px solid #e9eced;background:linear-gradient(#fff,#fbfcfd)}.sf-proposal-ledger .branch{width:32px;height:32px;display:grid;place-items:center;border:1px solid #dfe3e6;border-radius:8px;background:white;box-shadow:0 1px 2px #00000008}.sf-proposal-ledger svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.sf-proposal-ledger header strong{display:block;font-size:13px;font-weight:550;letter-spacing:-.15px}.sf-proposal-ledger header div>span{display:block;font-size:10px;color:#89929a;margin-top:1px}.sf-proposal-ledger .progress{display:flex;gap:4px;margin-left:auto}.sf-proposal-ledger .progress i{width:20px;height:4px;border-radius:4px;background:#e2e6e8;transition:background-color 150ms}.sf-proposal-ledger .progress i[data-state=accepted]{background:#1b947c}.sf-proposal-ledger .progress i[data-state=rejected]{background:#9aa3aa}.sf-proposal-ledger .table-head{height:33px;display:grid;grid-template-columns:109px 107px 1fr;padding:0 22px;align-items:center;background:#fafbfc;color:#858f99;font-size:10px}.sf-proposal-ledger .change{display:grid;grid-template-columns:109px 1fr 76px;align-items:center;padding:0 15px 0 22px;height:58px;border-top:1px solid #edf0f2;position:relative;transition:background-color 180ms ease}.sf-proposal-ledger .change:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#229d83;opacity:0;transition:opacity 180ms}.sf-proposal-ledger .change>strong{font-size:11px;font-weight:550}.sf-proposal-ledger .values{position:relative;height:28px;font-variant-numeric:tabular-nums}.sf-proposal-ledger .values>span{position:absolute;top:5px;white-space:nowrap;transition:opacity 160ms ease,transform 260ms cubic-bezier(.22,1,.36,1)}.sf-proposal-ledger .old{left:0;color:#879099}.sf-proposal-ledger .direction{left:77px;color:#b5bec4}.sf-proposal-ledger .new{left:107px;color:#364252;font-weight:550}.sf-proposal-ledger .new:before{content:"";position:absolute;inset:-4px -7px;background:#edf0f4;border:1px solid #e1e5ea;border-radius:5px;z-index:0;mix-blend-mode:multiply;pointer-events:none}.sf-proposal-ledger .result{left:107px;font-size:10px;color:#197c65;opacity:0;transform:translateY(6px)}.sf-proposal-ledger .change[data-state=accepted]{background:#f0faf6}.sf-proposal-ledger .change[data-state=accepted]:before{opacity:1}.sf-proposal-ledger .change[data-state=accepted] .old{opacity:0;transform:translateX(-15px)}.sf-proposal-ledger .change[data-state=accepted] .direction{opacity:0}.sf-proposal-ledger .change[data-state=accepted] .new{transform:translateX(-107px);color:#16785f}.sf-proposal-ledger .change[data-state=accepted] .new:before{background:#d0eee2;border-color:#b9e2d2}.sf-proposal-ledger .change:not([data-state=pending]) .result{opacity:1;transform:none}.sf-proposal-ledger .change[data-state=rejected] .direction,.sf-proposal-ledger .change[data-state=rejected] .new{opacity:0;transform:translateX(12px)}.sf-proposal-ledger .change[data-state=rejected] .result{color:#929aa2}.sf-proposal-ledger .change[data-state=rejected] .old{color:#49525c}.sf-proposal-ledger .actions{display:flex;justify-content:flex-end;align-items:center;gap:5px}.sf-proposal-ledger .actions button{width:32px;height:32px;position:relative;display:grid;place-items:center;border:1px solid #dde4e7;border-radius:7px;background:linear-gradient(#fff,#f4f6f7);color:#7e8891;box-shadow:0 1px 2px #15283808}.sf-proposal-ledger .actions button:after{content:"";position:absolute;inset:-6px 0}.sf-proposal-ledger .actions .accept{color:#27816f;border-color:#c4dbd3;background:linear-gradient(#f6fffb,#edf7f2)}.sf-proposal-ledger .actions button:active{box-shadow:inset 0 1px 3px #15283820;transform:translateY(1px)}.sf-proposal-ledger .actions .undo{width:54px;font-size:10px;background:transparent;box-shadow:none;border-color:transparent;color:#788e85}.sf-proposal-ledger footer{height:57px;display:flex;align-items:center;justify-content:space-between;padding:0 18px 0 22px;border-top:1px solid #e3e9eb;background:#fafcfc;font-size:10px;color:#8b959b}.sf-proposal-ledger footer b{font-weight:500;color:#505c66}.sf-proposal-ledger footer i{font-style:normal;color:#14886d;margin-right:5px}.sf-proposal-ledger footer button{height:33px;padding:0 11px;display:flex;align-items:center;gap:10px;border:1px solid #31413c;border-radius:7px;color:#fff;background:linear-gradient(#384b43,#25392f);box-shadow:inset 0 1px 0 #ffffff1a,0 1px 2px #0002;font-size:10px}.sf-proposal-ledger footer button svg{width:13px}.sf-proposal-ledger[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-proposal-ledger *{transition:none!important}}`}</style>
    </section>
  )
}
