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

import { useEffect, useId, useRef, useState } from "react"

type Phase = "edit" | "top" | "bottom" | "tuck" | "sealed"
const LENGTH: Record<"top" | "bottom" | "tuck", number> = { top: 360, bottom: 360, tuck: 450 }

export default function AirmailNote({ active = true }: { active?: boolean }) {
  const id = useId()
  const [recipient, setRecipient] = useState("")
  const [message, setMessage] = useState("")
  const [phase, setPhase] = useState<Phase>("edit")
  const [reduced, setReduced] = useState(true)
  const [hidden, setHidden] = useState(false)
  const remaining = useRef(0)
  const previous = useRef<Phase>("edit")
  const recipientInput = useRef<HTMLInputElement>(null)
  const note = useRef<HTMLTextAreaElement>(null)
  const openButton = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef(false)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    const visibility = () => setHidden(document.hidden)
    update()
    visibility()
    media.addEventListener("change", update)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      media.removeEventListener("change", update)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [])
  useEffect(() => {
    if (phase === "edit" || phase === "sealed") {
      return
    }
    if (previous.current !== phase) {
      remaining.current = LENGTH[phase]
      previous.current = phase
    }
    if (!active || hidden) {
      return
    }
    if (reduced) {
      setPhase("sealed")
      return
    }
    const start = performance.now()
    const timer = window.setTimeout(
      () => setPhase(phase === "top" ? "bottom" : phase === "bottom" ? "tuck" : "sealed"),
      remaining.current,
    )
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (performance.now() - start))
    }
  }, [phase, active, hidden, reduced])
  useEffect(() => {
    if (phase === "sealed") {
      openButton.current?.focus({ preventScroll: true })
    } else if (phase === "edit" && restoreFocus.current) {
      restoreFocus.current = false
      note.current?.focus({ preventScroll: true })
    }
  }, [phase])
  function unfold() {
    previous.current = "edit"
    restoreFocus.current = true
    setPhase("edit")
  }
  const folding = phase !== "edit" && phase !== "sealed"
  return (
    <section
      className="sf-airmail-note"
      data-phase={phase}
      data-paused={!active || hidden}
      aria-label="Fold a private note"
    >
      <div className="paper-space">
        {phase !== "sealed" && (
          <div className="paper">
            <form
              className="form"
              inert={phase !== "edit"}
              aria-hidden={phase !== "edit"}
              onSubmit={(event) => {
                event.preventDefault()
                if (!message.trim()) {
                  note.current?.setCustomValidity("Write a note before sealing it.")
                  note.current?.reportValidity()
                  return
                }
                if (active) {
                  previous.current = "edit"
                  setPhase(reduced ? "sealed" : "top")
                }
              }}
            >
              <fieldset disabled={!active || phase !== "edit"}>
                <label className="address">
                  <span>To</span>
                  <input
                    ref={recipientInput}
                    type="email"
                    aria-label="Recipient email"
                    autoComplete="off"
                    required
                    maxLength={60}
                    value={recipient}
                    placeholder="someone@somewhere.com"
                    onChange={(event) => setRecipient(event.target.value)}
                  />
                </label>
                <div className="writing">
                  <label className="sr" htmlFor={`${id}-note`}>
                    Your note
                  </label>
                  <textarea
                    ref={note}
                    id={`${id}-note`}
                    required
                    maxLength={120}
                    value={message}
                    onChange={(event) => {
                      event.target.setCustomValidity("")
                      setMessage(event.target.value)
                    }}
                    placeholder={"Something just\nfor you."}
                  />
                </div>
                <div className="closing">
                  <span>Local draft</span>
                  <button type="submit">
                    Seal note
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path d="M5 12h14M14 7l5 5-5 5" />
                    </svg>
                  </button>
                </div>
              </fieldset>
            </form>
            {folding && (
              <div className="fold-model" aria-hidden>
                <div className="middle">
                  <p>{message}</p>
                </div>
                <div className="flap upper">
                  <div className="front">
                    <span>To</span>
                    <p>{recipient}</p>
                  </div>
                  <div className="back" />
                </div>
                <div className="flap lower">
                  <div className="front">
                    <small>Local draft</small>
                    <b>
                      Seal note
                      <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M14 7l5 5-5 5" />
                      </svg>
                    </b>
                  </div>
                  <div className="back">
                    <div>
                      <span>To</span>
                      <p>{recipient}</p>
                    </div>
                    <i />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {phase === "sealed" && (
          <div className="sealed-note">
            <div className="seam" />
            <span>To</span>
            <p>{recipient}</p>
            <i className="closure" aria-hidden />
            <small>Sealed draft</small>
          </div>
        )}
      </div>
      <div className="actions">
        {folding ? (
          <button disabled={!active} onClick={unfold}>
            Cancel folding
          </button>
        ) : phase === "sealed" ? (
          <button ref={openButton} disabled={!active} onClick={unfold}>
            Open note
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M6 14a7 7 0 1 1 2 5M6 7v7h7" />
            </svg>
          </button>
        ) : (
          <span aria-hidden />
        )}
      </div>
      <span role="status" className="sr">
        {phase === "sealed" ? "Your local draft is sealed. Nothing was sent." : folding ? "Folding your note" : ""}
      </span>
      <style>{`
.sf-airmail-note{width:100%;height:100%;display:grid;place-content:center;gap:13px;background:#303332;color:#421919;overflow:hidden;container-type:inline-size;isolation:isolate;font:13px/1.4 Arial,sans-serif}.sf-airmail-note *{box-sizing:border-box}.sf-airmail-note .paper-space{position:relative;width:min(426px,84cqw);height:258px;perspective:1100px;display:grid;place-items:center}.sf-airmail-note .paper{position:relative;width:100%;height:258px;transform-style:preserve-3d;filter:drop-shadow(0 17px 14px #0003)}.sf-airmail-note .form{height:258px;background:#ef4d36;box-shadow:inset 0 1px #ff9b80,inset -1px 0 #a72f1d,inset 1px 0 #ff785c;border-radius:1px}.sf-airmail-note fieldset{border:0;padding:0;margin:0;min-width:0}.sf-airmail-note .address{height:86px;padding:20px 27px;display:flex;align-items:center;gap:15px;border-bottom:1px solid #a6372238;box-shadow:0 1px #ffaf8e34;position:relative}.sf-airmail-note .address>span{font:12px Georgia,serif;font-style:italic}.sf-airmail-note input{border:0;background:none;color:inherit;font:16px Arial,sans-serif;min-width:0;width:100%;height:44px;padding:0}.sf-airmail-note input::placeholder{color:#712c27;opacity:.8}.sf-airmail-note .writing{height:86px;padding:5px 27px 0;background:linear-gradient(#ce462419,transparent 20px,transparent 70px,#a72c0e08)}.sf-airmail-note textarea{display:block;font:27px/1.13 Georgia,"Times New Roman",serif;letter-spacing:-.8px;width:100%;height:81px;resize:none;color:#421919;border:0;background:transparent;padding:2px 0 0;overflow:auto}.sf-airmail-note textarea::placeholder{color:#6c251d;opacity:1}.sf-airmail-note .closing{height:86px;display:flex;align-items:center;justify-content:space-between;padding:0 27px;border-top:1px solid #bf3e2440;box-shadow:inset 0 1px #ffaf8e38;background:linear-gradient(#ff8b5820,#de432200)}.sf-airmail-note .closing>span{font:9px ui-monospace,monospace;color:#6b211c}.sf-airmail-note button{font:11px Arial,sans-serif;cursor:pointer;touch-action:manipulation}.sf-airmail-note .closing button{background:#511f1b;color:#ffe6d6;border:1px solid #3c1512;border-radius:3px;min-height:44px;padding:0 13px;display:flex;align-items:center;gap:23px;box-shadow:0 1px #fa8a69, inset 0 1px #82483d;transition:transform .13s ease}.sf-airmail-note button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}.sf-airmail-note button:active{transform:translateY(1px)}.sf-airmail-note button:disabled{cursor:default;opacity:.55}.sf-airmail-note :focus-visible{outline:2px solid #421919;outline-offset:3px}.sf-airmail-note .closing button:focus-visible{outline-color:#ffeadb}.sf-airmail-note .actions{height:35px;display:flex;justify-content:center;align-items:center;color:#c3c6bf}.sf-airmail-note .actions>span{font:10px Georgia,serif;color:#a6aaa2;font-style:italic}.sf-airmail-note .actions button{display:flex;align-items:center;gap:14px;border:0;border-bottom:1px solid #6c716a;background:transparent;color:#ebeee7;min-height:35px;padding:0 4px}.sf-airmail-note .actions button:focus-visible{outline-color:#fff}.sf-airmail-note[data-phase=top] .form,.sf-airmail-note[data-phase=bottom] .form,.sf-airmail-note[data-phase=tuck] .form{visibility:hidden}.sf-airmail-note .fold-model{position:absolute;inset:0;transform-style:preserve-3d}.sf-airmail-note .middle{position:absolute;top:86px;height:86px;left:0;right:0;padding:8px 27px;background:#ef4d36;box-shadow:inset 0 2px 3px #90241122}.sf-airmail-note .middle p{font:27px/1.13 Georgia,serif;letter-spacing:-.8px;margin:0;white-space:pre-wrap;overflow:hidden;max-height:73px}.sf-airmail-note .flap{position:absolute;height:86px;left:0;right:0;transform-style:preserve-3d}.sf-airmail-note .flap>div{position:absolute;inset:0;backface-visibility:hidden;box-shadow:inset 0 1px #ffad8c88,inset -1px 0 #b72c10,inset 1px 0 #ff9070;background:#ef4d36}.sf-airmail-note .upper{top:0;transform-origin:50% 100%;z-index:2}.sf-airmail-note .upper .front{display:flex;align-items:center;gap:15px;padding:0 27px}.sf-airmail-note .upper .front>span{font:italic 12px Georgia,serif}.sf-airmail-note .upper .front p{font:16px Arial,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sf-airmail-note .flap .back{transform:rotateX(180deg);background:linear-gradient(#f47956,#f47d56 85%,#da5133 100%);box-shadow:inset 0 1px #ffccaa,0 2px 2px #6b130b33}.sf-airmail-note .lower{top:172px;transform-origin:50% 0%;z-index:3}.sf-airmail-note .lower .front{display:flex;align-items:center;justify-content:space-between;padding:0 27px;background:linear-gradient(#f3593b,#ef4d36)}.sf-airmail-note .lower .front small{font:9px ui-monospace,monospace;color:#6b211c}.sf-airmail-note .lower .front b{background:#511f1b;color:#ffe6d6;border:1px solid #3c1512;border-radius:3px;height:44px;padding:0 13px;display:flex;align-items:center;gap:23px;box-shadow:0 1px #fa8a69,inset 0 1px #82483d;font:11px Arial,sans-serif}.sf-airmail-note .lower .front svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}.sf-airmail-note .lower .back{display:flex;align-items:flex-start;padding:17px 25px;background:linear-gradient(#ee6544,#f8835d 99%,#ffc89d);box-shadow:inset 0 1px #ffb192,0 -2px 2px #9d2e1733}.sf-airmail-note .lower .back>div{width:80%;overflow:hidden}.sf-airmail-note .lower .back>div>span{font:italic 10px Georgia,serif}.sf-airmail-note .lower .back p{margin:4px 0 0;font:14px/1.4 Arial,sans-serif;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.sf-airmail-note .lower .back i,.sf-airmail-note .closure{position:absolute;right:34px;top:0;bottom:0;width:24px;background:linear-gradient(90deg,#b92f2433,#682a263a 3%,#6628233c 95%,#ffb19020);border-left:1px solid #a7443020;border-right:1px solid #ffad8a44;transform:rotate(-3deg)}.sf-airmail-note[data-phase=top] .upper{animation:sf-note-top .36s cubic-bezier(.32,.72,0,1) forwards}.sf-airmail-note[data-phase=bottom] .upper,.sf-airmail-note[data-phase=tuck] .upper{transform:rotateX(-180deg)}.sf-airmail-note[data-phase=bottom] .lower{animation:sf-note-bottom .36s cubic-bezier(.32,.72,0,1) forwards}.sf-airmail-note[data-phase=tuck] .lower{transform:rotateX(180deg)}.sf-airmail-note[data-phase=tuck] .paper{animation:sf-note-tuck .45s cubic-bezier(.32,.72,0,1) forwards}.sf-airmail-note .sealed-note{height:86px;width:100%;position:relative;background:linear-gradient(#ee6544,#f8835d 99%,#ffc89d);box-shadow:0 23px 26px -14px #0006,0 1px 1px #1005,inset 0 1px #ffbd97,inset -1px 0 #d34c2a;transform:rotate(-3deg) scale(.9);padding:17px 25px;color:#6a261e}.sf-airmail-note .sealed-note>span{font:italic 10px Georgia,serif}.sf-airmail-note .sealed-note p{margin:4px 0 0;font-size:14px;max-width:80%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sf-airmail-note .sealed-note small{position:absolute;bottom:-22px;left:0;color:#9fa59b;font:9px ui-monospace,monospace;transform:rotate(3deg)}.sf-airmail-note .sealed-note .seam{position:absolute;left:0;right:0;top:0;border-top:1px solid #dd6e4433;box-shadow:0 -2px #ffb48b44}.sf-airmail-note[data-phase=sealed] .paper-space{height:258px}.sf-airmail-note .sr{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}.sf-airmail-note[data-paused=true] *{animation-play-state:paused!important}@keyframes sf-note-top{to{transform:rotateX(-180deg)}}@keyframes sf-note-bottom{to{transform:rotateX(180deg)}}@keyframes sf-note-tuck{to{transform:rotate(-3deg) scale(.9)}}@container(max-width:380px){.sf-airmail-note .paper-space{width:88cqw}.sf-airmail-note .address{padding:15px 20px}.sf-airmail-note .writing{padding-left:20px;padding-right:20px}.sf-airmail-note .closing{padding:0 20px}.sf-airmail-note textarea,.sf-airmail-note .middle p{font-size:24px}.sf-airmail-note input{font-size:16px}}@media(prefers-reduced-motion:reduce){.sf-airmail-note *{animation:none!important;transition:none!important}.sf-airmail-note .sealed-note{transform:none}}
      `}</style>
    </section>
  )
}
