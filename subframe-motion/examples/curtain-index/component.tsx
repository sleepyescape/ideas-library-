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
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client"

import { type CSSProperties, useEffect, useId, useRef, useState } from "react"

const sections = ["Objects", "Films", "Notes"]

export default function CurtainIndex({ active = true }: { active?: boolean }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const [instant, setInstant] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (open) {
      menu.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true })
    }
  }, [open])

  function close(index?: number) {
    if (index !== undefined) {
      setSelected(index)
    }
    setOpen(false)
    toggle.current?.focus({ preventScroll: true })
  }

  return (
    <section
      className="sf-curtain-index"
      data-open={open}
      data-still={!active || instant}
      onPointerDownCapture={() => setInstant(false)}
      onKeyDownCapture={(event) => {
        setInstant(true)
        if (event.key === "Escape" && open) {
          event.preventDefault()
          close()
        }
      }}
      aria-label="Editorial section navigation"
    >
      <div className="ci-current" aria-hidden={open}>
        <svg viewBox="0 0 280 200" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.4">
            {Array.from({ length: 15 }, (_, i) => (
              <ellipse
                key={i}
                cx="140"
                cy="100"
                rx={35 + i * 4.6}
                ry={16 + i * 4.1}
                transform={`rotate(${selected === 0 ? i * 7 : selected === 1 ? 60 - i * 7 : i * 12} 140 100)`}
              />
            ))}
          </g>
        </svg>
        <span>{sections[selected]}</span>
      </div>
      <div className="ci-curtain" aria-hidden="true" />
      <div ref={menu} className="ci-menu" id={id} inert={!open} aria-hidden={!open} aria-label="Choose section">
        {sections.map((name, index) => (
          <button
            type="button"
            key={name}
            aria-current={selected === index ? "page" : undefined}
            style={{ "--order": index } as CSSProperties}
            onClick={() => close(index)}
          >
            <span>{name}</span>
            <i aria-hidden="true">↗</i>
          </button>
        ))}
      </div>
      <button
        ref={toggle}
        type="button"
        className="ci-toggle"
        aria-controls={id}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span>{open ? "Close" : "Index"}</span>
        <i aria-hidden="true">
          <b />
          <b />
        </i>
      </button>
      <style>{`
        .sf-curtain-index{position:relative;width:100%;height:100%;min-height:280px;background:#f355d9;color:#571a3a;overflow:hidden;isolation:isolate;box-sizing:border-box;font-family:Arial,sans-serif}.sf-curtain-index *{box-sizing:border-box}.sf-curtain-index .ci-current{position:absolute;inset:0;display:grid;place-items:center}.sf-curtain-index .ci-current svg{height:80%;width:65%;max-width:350px;opacity:.75}.sf-curtain-index .ci-current>span{position:absolute;bottom:24px;left:28px;font:italic 54px/.95 Georgia,serif;letter-spacing:-3px}.sf-curtain-index .ci-curtain{position:absolute;inset:0;background:#571a3a;transform:scaleY(0);transform-origin:top;transition:transform .38s cubic-bezier(.76,0,.24,1)}.sf-curtain-index[data-open=true] .ci-curtain{transform:scaleY(1)}.sf-curtain-index button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation}.sf-curtain-index .ci-toggle{position:absolute;top:12px;right:20px;z-index:3;display:flex;align-items:center;gap:25px;min-height:44px;border:0;background:none;font-size:12px}.sf-curtain-index .ci-toggle i{position:relative;width:26px;height:12px}.sf-curtain-index .ci-toggle b{position:absolute;width:26px;height:1px;background:currentColor;left:0;transition:transform .22s cubic-bezier(.2,.8,.2,1)}.sf-curtain-index .ci-toggle b:first-child{top:3px}.sf-curtain-index .ci-toggle b:last-child{top:9px}.sf-curtain-index[data-open=true] .ci-toggle{color:#ffa9eb}.sf-curtain-index[data-open=true] .ci-toggle b:first-child{transform:translateY(3px) rotate(45deg)}.sf-curtain-index[data-open=true] .ci-toggle b:last-child{transform:translateY(-3px) rotate(-45deg)}.sf-curtain-index .ci-menu{position:absolute;inset:61px 28px 21px;display:flex;flex-direction:column;justify-content:center;visibility:hidden;transition:visibility 0s .38s}.sf-curtain-index[data-open=true] .ci-menu{visibility:visible;transition-delay:0s}.sf-curtain-index .ci-menu button{display:flex;align-items:center;justify-content:space-between;flex:1;max-height:84px;min-height:52px;border:0;border-top:1px solid #e285b646;background:none;text-align:left;padding:1px 0;color:#ffa9eb;opacity:0;transform:translateY(-12px);transition:opacity .12s ease,transform .2s cubic-bezier(.2,.8,.2,1)}.sf-curtain-index .ci-menu button span{font:italic clamp(42px,8vw,65px)/1 Georgia,serif;letter-spacing:-3px}.sf-curtain-index .ci-menu button i{font:normal 28px Arial,sans-serif;opacity:0;transition:opacity .15s ease}.sf-curtain-index .ci-menu button[aria-current=page] i{opacity:1}.sf-curtain-index[data-open=true] .ci-menu button{opacity:1;transform:translateY(0);transition:opacity .18s ease,transform .3s cubic-bezier(.2,.8,.2,1);transition-delay:calc(100ms + var(--order)*35ms)}.sf-curtain-index button:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-curtain-index[data-still=true] *{transition:none!important;animation:none!important}@media(hover:hover) and (pointer:fine){.sf-curtain-index .ci-menu button:hover{color:#fff}.sf-curtain-index .ci-menu button:hover i{opacity:1}}@media(prefers-reduced-motion:reduce){.sf-curtain-index *{transition:none!important;animation:none!important}}`}</style>
    </section>
  )
}
