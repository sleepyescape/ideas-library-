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

export default function ElasticArtboard({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [instant, setInstant] = useState(false)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const start = useRef({ x: 0, y: 0 })
  function end() {
    setDragging(false)
    setPosition({ x: 0, y: 0 })
  }
  return (
    <section
      className="sf-elastic-artboard"
      data-still={!active || reduced || instant}
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="mat">
        <button
          type="button"
          className="drawing"
          aria-label="Movable study. Drag to move, release to return. Arrow keys nudge; Escape resets."
          style={{
            transform: `translate(${position.x}px,${position.y}px) rotate(${position.x * 0.06}deg)`,
            transition: dragging ? "none" : undefined,
          }}
          onPointerDown={(e) => {
            start.current = { x: e.clientX, y: e.clientY }
            setDragging(true)
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!dragging) {
              return
            }
            const mat = e.currentTarget.parentElement!,
              bounds = mat.getBoundingClientRect(),
              scaleX = mat.offsetWidth / bounds.width,
              scaleY = mat.offsetHeight / bounds.height
            setPosition({
              x: Math.max(-45, Math.min(45, (e.clientX - start.current.x) * scaleX * 0.65)),
              y: Math.max(-30, Math.min(30, (e.clientY - start.current.y) * scaleY * 0.65)),
            })
          }}
          onPointerUp={end}
          onPointerCancel={end}
          onLostPointerCapture={() => setDragging(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              end()
            }
            if (e.key.startsWith("Arrow")) {
              e.preventDefault()
              setPosition((p) => ({
                x: Math.max(-45, Math.min(45, p.x + (e.key === "ArrowRight" ? 8 : e.key === "ArrowLeft" ? -8 : 0))),
                y: Math.max(-30, Math.min(30, p.y + (e.key === "ArrowDown" ? 8 : e.key === "ArrowUp" ? -8 : 0))),
              }))
            }
          }}
        >
          <svg viewBox="0 0 220 240" aria-hidden="true">
            <path
              d="M38 165 110 55 184 165 110 204Z M38 165 110 141 184 165M110 55V204"
              fill="none"
              stroke="#535855"
              strokeWidth="1"
            />
            {Array.from({ length: 10 }, (_, i) => (
              <path
                key={i}
                d={`M${40 + i * 7} ${164 - i * 11} ${111 + i * 7} ${203 - i * 4}`}
                fill="none"
                stroke="#5e6558"
                opacity=".3"
              />
            ))}
            <circle cx="110" cy="141" r="75" fill="none" stroke="#a04736" strokeWidth=".7" />
          </svg>
          <span>Study for a suspended form</span>
        </button>
        <i className="pin" />
      </div>
      <style>{`.sf-elastic-artboard{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;font-family:Arial,sans-serif;color:#202020;background:#777f7f;box-sizing:border-box}.sf-elastic-artboard *{box-sizing:border-box}.sf-elastic-artboard button,.sf-elastic-artboard input{font:inherit}.sf-elastic-artboard button{cursor:pointer;touch-action:manipulation;min-width:44px;min-height:44px}.sf-elastic-artboard button:focus-visible,.sf-elastic-artboard input:focus-visible,.sf-elastic-artboard [tabindex]:focus-visible{outline:2px solid currentColor;outline-offset:4px}.sf-elastic-artboard[data-still=true] *{transition:none!important;animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-elastic-artboard *{transition:none!important;animation:none!important}}.sf-elastic-artboard .mat{position:absolute;inset:20px 12%;border:1px solid #a9b0aa;background:radial-gradient(ellipse at center,#9aa39f,#757f7c);box-shadow:inset 0 2px 12px #1b302b30}.sf-elastic-artboard .drawing{position:absolute;left:calc(50% - 95px);top:calc(50% - 117px);width:190px;height:234px;border:0;background:#eeecdf;box-shadow:0 15px 18px #1f292d45;padding:0;touch-action:none;transition:transform .65s cubic-bezier(.2,1.35,.3,1);cursor:grab}.sf-elastic-artboard .drawing:active{cursor:grabbing}.sf-elastic-artboard .drawing svg{width:100%;height:90%}.sf-elastic-artboard .drawing span{font:8px Georgia;color:#74746a}.sf-elastic-artboard .pin{position:absolute;left:calc(50% - 4px);top:calc(50% - 123px);width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#d8d8d0,#465054);box-shadow:1px 3px 3px #3338;pointer-events:none}`}</style>
    </section>
  )
}
