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

import { useId, useRef, useState } from "react"

const tools = ["Move", "Draw", "Type", "Shape", "Crop", "Measure"]
const glyphs = [
  "M12 3v18M3 12h18M8 7l4-4 4 4M7 8l-4 4 4 4",
  "m5 19 3-7 9-9 4 4-9 9-7 3Zm3-7 4 4",
  "M4 5h16M12 5v16M8 21h8",
  "M4 4h16v16H4Z",
  "M7 2v15h15M2 7h15v15",
  "m3 16 13-13 5 5-13 13-5-5ZM8 11l3 3M12 7l3 3",
]

export default function RadialToolMenu({ active = true }: { active?: boolean }) {
  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState(0)
  const [focused, setFocused] = useState(0)
  const [instant, setInstant] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  return (
    <div
      className="sf-radial"
      data-active={active}
      data-instant={instant}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setInstant(true)
          setOpen(false)
          trigger.current?.focus()
        }
      }}
    >
      <style>{`
        .sf-radial{container-type:inline-size;height:100%;width:100%;min-height:300px;background:#e9e9e5;color:#171917;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:Arial,sans-serif;box-sizing:border-box;background-image:radial-gradient(#aaa 1px,transparent 1px);background-size:16px 16px}.sf-radial *{box-sizing:border-box}.sf-radial-cross{position:absolute;width:330px;height:170px;border:1px solid #bbbeb8;transform:rotate(-12deg);pointer-events:none}.sf-radial-cross:before,.sf-radial-cross:after{content:"";position:absolute;width:6px;height:6px;background:#f26336;border:1px solid #171917}.sf-radial-cross:before{left:-3px;top:-3px}.sf-radial-cross:after{right:-3px;bottom:-3px}.sf-radial-dial{position:relative;width:264px;height:264px;border-radius:50%;background:#e9e9e5dd;box-shadow:0 0 0 1px #c4c7bf inset}.sf-radial-ring{position:absolute;inset:43px;border:1px solid #c5c8c0;border-radius:50%;pointer-events:none}.sf-radial-tool{position:absolute;left:50%;top:50%;margin:-25px 0 0 -26px;width:52px;height:50px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;border:0;background:#e9e9e5;color:#171917;cursor:pointer;transition:transform 200ms cubic-bezier(.19,1,.22,1),opacity 140ms ease}.sf-radial-tool svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.sf-radial-tool span{font-size:9px}.sf-radial-tool[aria-checked=true]{color:#bd340e}.sf-radial-trigger{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px;border:1px solid #191b19;background:#191b19;color:#f7f6ee;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;z-index:2}.sf-radial-trigger strong{font-size:20px;line-height:1;font-weight:400}.sf-radial-trigger span{font-size:8px;margin-top:5px;letter-spacing:.04em}.sf-radial button:focus-visible{outline:2px solid #c8441d;outline-offset:4px}.sf-radial[data-active=false] *,.sf-radial[data-instant=true] *{transition:none!important}@media(hover:hover) and (pointer:fine){.sf-radial-tool:hover{background:#fff}.sf-radial-trigger:hover{background:#363a33}}.sf-radial-trigger:active{background:#f26336;color:#171917}@media(prefers-reduced-motion:reduce){.sf-radial *{transition:none!important}}
      `}</style>
      <div className="sf-radial-cross" aria-hidden="true" />
      <div className="sf-radial-dial">
        <div className="sf-radial-ring" aria-hidden="true" />
        <div
          id={id}
          role="menu"
          aria-label="Drawing tools"
          aria-hidden={!open}
          onKeyDown={(event) => {
            const current = buttons.current.indexOf(document.activeElement as HTMLButtonElement)
            if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
              event.preventDefault()
              setInstant(true)
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                  ? 5
                  : (current + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + 6) % 6
              buttons.current[next]?.focus()
            }
          }}
        >
          {tools.map((tool, index) => {
            const angle = ((index * 60 - 90) * Math.PI) / 180
            return (
              <button
                type="button"
                key={tool}
                ref={(element) => {
                  buttons.current[index] = element
                }}
                role="menuitemradio"
                aria-checked={selected === index}
                tabIndex={open && focused === index ? 0 : -1}
                onFocus={() => setFocused(index)}
                className="sf-radial-tool"
                style={{
                  transform: `translate(${Math.cos(angle) * (open ? 93 : 40)}px,${
                    Math.sin(angle) * (open ? 93 : 40)
                  }px)`,
                  opacity: open ? 1 : 0,
                  visibility: open ? "visible" : "hidden",
                }}
                onClick={(event) => {
                  setInstant(event.detail === 0)
                  setSelected(index)
                  setOpen(false)
                  trigger.current?.focus()
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={glyphs[index]} />
                </svg>
                <span>{tool}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="sf-radial-trigger"
          ref={trigger}
          aria-label={`${open ? "Close" : "Open"} drawing tools. ${tools[selected]} selected`}
          aria-expanded={open}
          aria-controls={id}
          aria-haspopup="menu"
          onClick={(event) => {
            const next = !open
            setInstant(event.detail === 0)
            setOpen(next)
            if (next && event.detail === 0) {
              requestAnimationFrame(() => buttons.current[selected]?.focus())
            }
          }}
        >
          <strong aria-hidden="true">{open ? "×" : "+"}</strong>
          <span>{tools[selected].toUpperCase()}</span>
        </button>
      </div>
    </div>
  )
}
