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

import { useRef, useState } from "react"
const collections = ["New arrivals", "Deep listening", "After hours"]
export default function PushNavigation({ active = true }: { active?: boolean }) {
  const [open, setOpen] = useState(false),
    [collection, setCollection] = useState(0),
    [instant, setInstant] = useState(false),
    trigger = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null)
  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }
  return (
    <section
      className="sf-push-navigation"
      inert={!active}
      data-open={open}
      data-still={!active || instant}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setInstant(true)
          close()
        }
      }}
    >
      <div className="pn-drawer" ref={panel} inert={!open}>
        <p>LIBRARY</p>
        <nav aria-label="Record collections">
          {collections.map((v, i) => (
            <button
              type="button"
              key={v}
              aria-current={collection === i ? "page" : undefined}
              onClick={(e) => {
                setInstant(e.detail === 0)
                setCollection(i)
                close()
              }}
            >
              {v}
              <span>{i === collection ? "•" : "↗"}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="pn-plate">
        <div className="pn-sleeve" aria-label={collections[collection]}>
          <div className="pn-art" data-variant={collection}>
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="pn-title">
            <span>
              {["ANOTHER\nROOM", "LONG\nFORM", "NIGHT\nSHIFT"][collection].split("\n").map((t, i) => (
                <span key={i}>
                  {t}
                  <br />
                </span>
              ))}
            </span>
            <small>{["JUNE ENSEMBLE", "EVERYDAY MUSIC", "ONE MORE HOUR"][collection]}</small>
          </div>
        </div>
        <footer>
          {collections[collection]} <span>{["LP / 2026", "2×LP / 2025", "EP / 2026"][collection]}</span>
        </footer>
      </div>
      <button
        type="button"
        className="pn-toggle"
        ref={trigger}
        aria-expanded={open}
        aria-label={open ? "Close collections" : "Open collections"}
        onClick={(e) => {
          setInstant(e.detail === 0)
          setOpen(!open)
          if (!open) {
            requestAnimationFrame(() => panel.current?.querySelector("button")?.focus())
          }
        }}
      >
        {open ? "Close" : "Index"}
        <span>{open ? "−" : "+"}</span>
      </button>
      <style>{`.sf-push-navigation{width:100%;height:100%;background:#ecebe7;color:#181a19;position:relative;overflow:hidden;font-family:Arial,sans-serif;container-type:size}.pn-drawer{position:absolute;inset:0 auto 0 0;width:52%;box-sizing:border-box;padding:24px;display:flex;flex-direction:column;justify-content:center}.pn-drawer p{font:10px Arial;letter-spacing:.12em;margin:0 0 16px}.pn-drawer nav{display:flex;flex-direction:column;gap:5px}.pn-drawer nav button{background:none;border:0;border-bottom:1px solid #14141422;color:#222;padding:13px 0;min-height:44px;text-align:left;font:15px Arial;display:flex;justify-content:space-between;gap:8px;cursor:pointer}.pn-plate{position:absolute;inset:0;background:#153ce6;color:#fff;transform-origin:100% 50%;transition:transform .38s cubic-bezier(.22,1,.36,1),border-radius .38s ease;display:flex;flex-direction:column;padding:18px 22px;box-sizing:border-box;overflow:hidden;box-shadow:-4px 0 25px #0001}.sf-push-navigation[data-open=true] .pn-plate{transform:translateX(54%) scale(.88);border-radius:18px}.pn-plate footer{display:flex;justify-content:space-between;align-items:center;font-size:10px;flex-shrink:0}.pn-toggle{font:10px Arial;position:absolute;top:18px;right:22px;color:#fff;background:none;border:1px solid #fff5;border-radius:20px;height:34px;padding:0 13px;min-width:70px;cursor:pointer;display:flex;gap:12px;align-items:center;justify-content:center}.pn-toggle:before{content:'';position:absolute;inset:-5px}.pn-sleeve{position:relative;flex:1;min-height:0;width:min(100%,360px);align-self:center;margin:44px 0 16px;overflow:hidden;background:#eef0ea;color:#19256a;box-shadow:0 9px 20px #00148055;display:flex}.pn-art{position:absolute;inset:0;display:flex;gap:0;align-items:center;justify-content:center;transform:rotate(-25deg) scale(1.4)}.pn-art i{display:block;border:11px solid #1844f0;border-radius:50%;width:45px;height:170px;margin-left:-17px}.pn-art[data-variant='1']{transform:rotate(25deg) scale(1.5)}.pn-art[data-variant='2']{transform:rotate(90deg) scale(1.6)}.pn-title{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:space-between;padding:15px;mix-blend-mode:multiply}.pn-title>span{font:bold clamp(26px,7cqw,44px)/.87 Arial;letter-spacing:-.07em}.pn-title small{font:8px Arial;letter-spacing:.1em}.pn-plate footer{font-size:11px} .sf-push-navigation button:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-push-navigation[data-still=true] .pn-plate{transition:none}@media(prefers-reduced-motion:reduce){.sf-push-navigation .pn-plate{transition:none}}@container(max-width:380px){.pn-drawer{padding:16px}.pn-drawer nav button{font-size:13px}.pn-plate{padding:16px}.pn-toggle{top:16px;right:16px}}`}</style>
    </section>
  )
}
