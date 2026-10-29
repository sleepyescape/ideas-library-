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

import { useEffect, useRef, useState } from "react"

export default function TicketTear({ active = true }: { active?: boolean }) {
  const [admitted, setAdmitted] = useState(false)
  const [pull, setPull] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [keyboard, setKeyboard] = useState(false)
  const origin = useRef<{ id: number; x: number; scale: number } | null>(null)
  const pullRef = useRef(0)
  useEffect(() => {
    if (!active) {
      origin.current = null
      pullRef.current = 0
      setPull(0)
      setDragging(false)
    }
  }, [active])
  const cancel = () => {
    origin.current = null
    pullRef.current = 0
    setPull(0)
    setDragging(false)
  }
  return (
    <div className="sf-ticket" data-active={active} data-keyboard={keyboard} data-admitted={admitted}>
      <style>{`
        .sf-ticket{container-type:inline-size;width:100%;height:100%;min-height:300px;background:#263cda;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;overflow:hidden;padding:22px;color:#ffead2;font-family:Arial,sans-serif;box-sizing:border-box}.sf-ticket *{box-sizing:border-box}.sf-ticket-paper{position:relative;width:min(100%,360px);height:184px;display:grid;grid-template-columns:1fr 70px;filter:drop-shadow(0 12px 15px #0d177d55)}.sf-ticket-body{padding:17px 18px;background:#ff8c43;color:#232bd0;position:relative;overflow:hidden}.sf-ticket-heading{font-size:clamp(40px,10cqw,59px);font-weight:900;line-height:.78;letter-spacing:-3px}.sf-ticket-meta{position:absolute;bottom:14px;left:18px;right:16px;display:flex;justify-content:space-between;font:10px monospace}.sf-ticket-stub{border:0;border-left:2px dashed #253acf;background:#ff8c43;color:#232bd0;position:relative;padding:0;transform-origin:left bottom;transition:transform 240ms cubic-bezier(.19,1,.22,1),opacity 160ms ease;touch-action:pan-y;cursor:grab;user-select:none}.sf-ticket-stub:active{cursor:grabbing}.sf-ticket-stub[disabled]{cursor:default}.sf-ticket-stub[data-dragging=true]{transition:none}.sf-ticket-stub:before,.sf-ticket-stub:after{content:"";position:absolute;left:-8px;width:14px;height:14px;border-radius:50%;background:#263cda}.sf-ticket-stub:before{top:-7px}.sf-ticket-stub:after{bottom:-7px}.sf-ticket-stub-label{position:absolute;top:18px;left:26px;writing-mode:vertical-rl;font:700 11px monospace;letter-spacing:.15em}.sf-ticket-stub-arrow{position:absolute;bottom:20px;left:20px;font-size:29px;line-height:1}.sf-ticket-barcode{display:block;margin-top:13px;width:71px;height:13px;background:repeating-linear-gradient(90deg,#232bd0 0 2px,transparent 2px 4px,#232bd0 4px 5px,transparent 5px 7px)}.sf-ticket-stamp{position:absolute;inset:43px 15px auto;transform:rotate(-9deg) scale(.96);opacity:0;border:3px solid #263cda;background:#ffe8c6;padding:8px 2px;text-align:center;font:900 28px/.9 Arial,sans-serif;letter-spacing:-1px;transition:transform 240ms cubic-bezier(.19,1,.22,1),opacity 160ms ease;pointer-events:none}.sf-ticket[data-admitted=true] .sf-ticket-stamp{opacity:1;transform:rotate(-9deg) scale(1)}.sf-ticket-action{height:44px;min-width:110px;border:0;background:transparent;color:#ffead2;font:11px monospace;cursor:pointer;text-decoration:underline;text-underline-offset:5px}.sf-ticket button:focus-visible{outline:2px solid #fff;outline-offset:4px}.sf-ticket-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-ticket[data-active=false] *,.sf-ticket[data-keyboard=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-ticket *{transition:none!important}.sf-ticket-stub{transform:none!important}.sf-ticket-stamp{transform:none!important}}@container(max-width:360px){.sf-ticket{padding:18px}.sf-ticket-paper{grid-template-columns:1fr 55px}.sf-ticket-heading{font-size:43px;letter-spacing:-2px}.sf-ticket-stub-label{left:18px}.sf-ticket-stub-arrow{left:14px}}
      `}</style>
      <div className="sf-ticket-paper" data-admitted={admitted}>
        <div className="sf-ticket-body">
          <div className="sf-ticket-heading">
            OFF
            <br />
            GRID.
          </div>
          <span className="sf-ticket-barcode" aria-hidden="true" />
          <div className="sf-ticket-meta">
            <span>FRI / 22:00</span>
            <span>ADMIT ONE</span>
          </div>
          <div className="sf-ticket-stamp" style={{ opacity: admitted ? 1 : 0 }}>
            YOU’RE IN.
          </div>
        </div>
        <button
          type="button"
          className="sf-ticket-stub"
          aria-label="Tear admission ticket"
          disabled={admitted || !active}
          data-dragging={dragging}
          style={{
            transform: admitted
              ? "translate(85px, 75px) rotate(24deg)"
              : `translateX(${pull * 0.65}px) rotate(${pull * 0.13}deg)`,
            opacity: admitted ? 0 : 1,
          }}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0 || origin.current) {
              return
            }
            setKeyboard(false)
            origin.current = {
              id: event.pointerId,
              x: event.clientX,
              scale: event.currentTarget.offsetWidth / event.currentTarget.getBoundingClientRect().width,
            }
            setDragging(true)
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            if (origin.current?.id !== event.pointerId) {
              return
            }
            const distance = Math.max(0, Math.min(125, (event.clientX - origin.current.x) * origin.current.scale))
            pullRef.current = distance
            setPull(distance)
          }}
          onPointerUp={(event) => {
            if (origin.current?.id !== event.pointerId) {
              return
            }
            const commit = pullRef.current >= 65
            cancel()
            if (commit) {
              setAdmitted(true)
            }
          }}
          onPointerCancel={cancel}
          onLostPointerCapture={cancel}
          onClick={(event) => {
            if (event.detail === 0) {
              setKeyboard(true)
              setAdmitted(true)
            }
          }}
        >
          <span className="sf-ticket-stub-label">PULL TO ENTER</span>
          <span className="sf-ticket-stub-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </div>
      <button
        type="button"
        className="sf-ticket-action"
        onClick={(event) => {
          setKeyboard(event.detail === 0)
          cancel()
          setAdmitted(!admitted)
        }}
      >
        {admitted ? "Another ticket ↺" : "Tear ticket →"}
      </button>
      <span className="sf-ticket-status" role="status">
        {admitted ? "Ticket admitted. You’re in." : "Ticket ready. Drag the stub right or use Tear ticket."}
      </span>
    </div>
  )
}
