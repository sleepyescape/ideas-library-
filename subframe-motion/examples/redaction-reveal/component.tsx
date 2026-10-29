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

import { useEffect, useState } from "react"

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

export default function RedactionReveal({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [open, setOpen] = useState(false)
  return (
    <section
      className="sf-redaction-reveal"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <article className="document">
        <div className="stamp">RELEASED</div>
        <p>To whoever finds this,</p>
        <p className="note">
          We left the <span data-open={open}>lights on</span>.<br />
          The city is <span data-open={open}>still ours</span>.<br />
          Meet me <span data-open={open}>after midnight</span>.
        </p>
        <p className="sign">— M.</p>
      </article>
      <button type="button" className="toggle" aria-pressed={open} onClick={() => setOpen(!open)}>
        {open ? "Redact" : "Open the record"}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <style>{`.sf-redaction-reveal{position:relative;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#f2f0e6;box-sizing:border-box}.sf-redaction-reveal *{box-sizing:border-box}.sf-redaction-reveal button,.sf-redaction-reveal input{font:inherit}.sf-redaction-reveal button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-redaction-reveal button:focus-visible,.sf-redaction-reveal input:focus-visible,.sf-redaction-reveal [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-redaction-reveal[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-redaction-reveal *{transition:none!important;animation:none!important}}.sf-redaction-reveal .document{position:absolute;inset:25px 12% 55px;transform:rotate(-2deg);color:#343833;font:13px/1.6 'Courier New',monospace}.sf-redaction-reveal .document p{margin:14px 0}.sf-redaction-reveal .note{font:clamp(17px,3.5cqw,22px)/1.7 'Courier New',monospace}.sf-redaction-reveal .note span{position:relative;white-space:nowrap}.sf-redaction-reveal .note span:after{content:'';position:absolute;inset:0 -2px;background:#242a25;transform-origin:left;transition:transform .55s cubic-bezier(.25,.8,.3,1)}.sf-redaction-reveal .note span[data-open=true]:after{transform:scaleX(0)}.sf-redaction-reveal .note span:nth-of-type(2):after{transition-delay:60ms}.sf-redaction-reveal .note span:nth-of-type(3):after{transition-delay:120ms}.sf-redaction-reveal .stamp{position:absolute;right:-4px;top:8px;color:#a14536;border:2px solid #a14536;transform:rotate(8deg);padding:3px 8px;font:bold 9px monospace;letter-spacing:2px}.sf-redaction-reveal .sign{font:italic 22px Georgia}.sf-redaction-reveal .toggle{position:absolute;left:12%;right:12%;bottom:15px;height:44px;border:0;border-top:1px solid #c7c7b9;background:none;display:flex;justify-content:space-between;align-items:center;font:11px monospace;color:#3c483c}`}</style>
    </section>
  )
}
