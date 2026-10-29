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

import { memo, useEffect, useId, useRef, useState } from "react"

type Point = { x: number; y: number }
const START: Point = { x: 344, y: 111 }
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const rosette = Array.from({ length: 24 }, (_, i) => {
  const points = Array.from({ length: 241 }, (_, j) => {
    const angle = (j / 240) * Math.PI * 2
    const radius = 49 + i * 1.25 + Math.sin(angle * 11 + i * 0.16) * 12
    return `${j ? "L" : "M"}${(349 + Math.cos(angle) * radius).toFixed(2)} ${(122 + Math.sin(angle) * radius).toFixed(
      2,
    )}`
  })
  return points.join(" ") + "Z"
})

const PassArtwork = memo(function PassArtwork({ ultraviolet = false }: { ultraviolet?: boolean }) {
  return (
    <svg viewBox="0 0 464 244" aria-hidden="true" className="sf-uv-art">
      <rect width="464" height="244" fill={ultraviolet ? "#25205b" : "#ef8d51"} />
      <path d="M322 0V244" stroke={ultraviolet ? "#6685ad" : "#733f31"} strokeOpacity=".4" strokeDasharray="2 4" />
      <text
        x="28"
        y="99"
        fontSize="91"
        fontWeight="800"
        letterSpacing="-6"
        fill={ultraviolet ? "#c9fae9" : "#392a25"}
        fontFamily="Arial, sans-serif"
        textLength="256"
        lengthAdjust="spacingAndGlyphs"
      >
        night
      </text>
      <text
        x="25"
        y="177"
        fontSize="91"
        fontWeight="800"
        letterSpacing="-6"
        fill={ultraviolet ? "#c9fae9" : "#392a25"}
        fontFamily="Arial, sans-serif"
        textLength="248"
        lengthAdjust="spacingAndGlyphs"
      >
        shift
      </text>
      {!ultraviolet && (
        <g fill="#392a25" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="17" letterSpacing="-.5">
          <text x="349" y="112">
            ADMIT
          </text>
          <text x="349" y="132">
            ONE
          </text>
        </g>
      )}
      {ultraviolet && (
        <g fill="none" stroke="#78f9d3" strokeWidth=".45" opacity=".85">
          {rosette.map((d, i) => (
            <path d={d} key={i} />
          ))}
        </g>
      )}
      {ultraviolet && (
        <g fill="none" stroke="#86bfed" strokeWidth=".55" opacity=".55">
          {Array.from({ length: 11 }, (_, i) => (
            <path
              key={i}
              d={`M-20 ${196 + i * 3}C77 ${165 + i * 3} 116 ${229 + i * 3} 194 ${186 + i * 3}S308 ${142 + i * 3} 341 ${
                200 + i * 3
              }`}
            />
          ))}
        </g>
      )}
      {ultraviolet && (
        <g fill="#b8ffdf">
          <path d="m349 98 5 16 17 1-13 10 4 17-13-10-14 10 5-17-14-10 18-1Z" />
        </g>
      )}
    </svg>
  )
})

export default function SpotlightStory({ active = true }: { active?: boolean }) {
  const [point, setPoint] = useState<Point>(START)
  const [all, setAll] = useState(false)
  const card = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ id: number; start: Point } | null>(null)
  const help = useId()
  const finish = (cancel = false) => {
    const value = drag.current
    drag.current = null
    if (!value) {
      return
    }
    if (cancel) {
      setPoint(value.start)
    }
    if (card.current?.hasPointerCapture(value.id)) {
      card.current.releasePointerCapture(value.id)
    }
  }
  useEffect(() => {
    if (!active) {
      finish(true)
    }
  }, [active])
  const locate = (clientX: number, clientY: number) => {
    const box = card.current!.getBoundingClientRect()
    setPoint({
      x: clamp(((clientX - box.left) / box.width) * 464, 0, 464),
      y: clamp(((clientY - box.top) / box.height) * 244, 0, 244),
    })
  }
  return (
    <section className="sf-uv" data-active={active} data-full={all} aria-label="Ultraviolet ink pass">
      <style>{`
.sf-uv{width:100%;height:100%;min-height:320px;background:#312b2b;position:relative;isolation:isolate;overflow:hidden;font-family:Arial,sans-serif;color:#d5cccc}.sf-uv *{box-sizing:border-box}.sf-uv-pass{position:absolute;left:68px;top:42px;width:464px;height:244px;padding:0;border:0;border-radius:8px;background:transparent;box-shadow:0 1px 1px #09070980,0 12px 18px -8px #09070999,0 30px 50px -25px #110b0bbf;cursor:crosshair;touch-action:none;text-align:left;-webkit-tap-highlight-color:transparent}.sf-uv-pass:focus-visible{outline:2px solid #b2d9ff;outline-offset:6px}.sf-uv-pass:disabled{cursor:default}.sf-uv-paper{position:absolute;inset:0;overflow:hidden;border-radius:8px;mask-image:radial-gradient(circle at 69.4% 0,transparent 0 8px,#000 8.5px),radial-gradient(circle at 69.4% 100%,transparent 0 8px,#000 8.5px);mask-composite:intersect}.sf-uv-art{display:block;width:100%;height:100%;pointer-events:none}.sf-uv-hidden{position:absolute;inset:0;pointer-events:none}.sf-uv-paper:after{content:"";position:absolute;inset:0;border:1px solid #ffddbb29;border-radius:8px;pointer-events:none;background:repeating-linear-gradient(0deg,#fff2 0 .3px,transparent .3px 2px);opacity:.16;mix-blend-mode:soft-light}.sf-uv-lens{position:absolute;left:0;top:0;width:136px;height:136px;margin:-68px 0 0 -68px;border:1px solid #abbcff15;border-radius:50%;pointer-events:none;box-shadow:0 0 0 5px #6e66df0b,inset 0 0 10px #807fff14}.sf-uv-lens:after{content:"";position:absolute;left:64px;top:64px;width:6px;height:6px;border:1px solid #d1ecff99;border-radius:50%;opacity:.65}.sf-uv-footer{position:absolute;left:68px;right:68px;top:308px;display:flex;justify-content:space-between;align-items:center}.sf-uv-caption{display:flex;gap:8px;align-items:center;font-size:11px;color:#cfc6c8}.sf-uv-caption svg{color:#b5abf2}.sf-uv-toggle{height:34px;border:1px solid #6a5966;background:#4b3f4b;color:#f1e6f0;border-radius:6px;font:11px Arial,sans-serif;padding:0 13px;position:relative;cursor:pointer;transition:background-color 140ms ease,color 140ms ease;touch-action:manipulation}.sf-uv-toggle:before{content:"";position:absolute;inset:-6px -2px}.sf-uv-toggle[aria-pressed=true]{background:#c3b9f0;border-color:#c3b9f0;color:#2c2543}.sf-uv-toggle:focus-visible{outline:2px solid #c6c5ff;outline-offset:4px}.sf-uv-toggle:disabled{cursor:default;opacity:.55}.sf-uv-help{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}@media(hover:hover) and (pointer:fine){.sf-uv-toggle:hover{background:#67516b;color:#fff}}@media(prefers-reduced-motion:reduce){.sf-uv-toggle{transition:none}}.sf-uv[data-active=false] .sf-uv-toggle{transition:none}
      `}</style>
      <button
        ref={card}
        type="button"
        className="sf-uv-pass"
        aria-label={
          all
            ? "Nightshift entry pass, all ultraviolet ink revealed"
            : "Nightshift entry pass, ultraviolet inspection lens"
        }
        aria-describedby={help}
        disabled={!active}
        onPointerDown={(e) => {
          if (e.button !== 0 || drag.current || all) {
            return
          }
          drag.current = { id: e.pointerId, start: point }
          e.currentTarget.setPointerCapture(e.pointerId)
          locate(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (!active || all) {
            return
          }
          if (drag.current?.id === e.pointerId || (e.pointerType === "mouse" && e.buttons === 0 && !drag.current)) {
            locate(e.clientX, e.clientY)
          }
        }}
        onPointerUp={(e) => {
          if (drag.current?.id === e.pointerId) {
            finish()
          }
        }}
        onPointerCancel={(e) => {
          if (drag.current?.id === e.pointerId) {
            finish(true)
          }
        }}
        onLostPointerCapture={() => {
          if (drag.current) {
            finish(true)
          }
        }}
        onBlur={() => finish(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault()
            finish(true)
            return
          }
          if (e.key === "Home") {
            e.preventDefault()
            finish()
            setPoint(START)
            return
          }
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault()
            setAll(false)
            const step = e.shiftKey ? 32 : 12
            setPoint((p) => ({
              x: clamp(p.x + (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0), 0, 464),
              y: clamp(p.y + (e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0), 0, 244),
            }))
          }
        }}
        onClick={(e) => {
          if (e.detail === 0) {
            setAll((v) => !v)
          }
        }}
      >
        <div className="sf-uv-paper">
          <PassArtwork />
          <div
            className="sf-uv-hidden"
            style={{
              maskImage: all
                ? "none"
                : `radial-gradient(circle at ${point.x}px ${point.y}px, #000 0 62px, transparent 69px)`,
            }}
          >
            <PassArtwork ultraviolet />
          </div>
          {!all && <div className="sf-uv-lens" style={{ transform: `translate(${point.x}px, ${point.y}px)` }} />}
        </div>
      </button>
      <div className="sf-uv-footer">
        <span className="sf-uv-caption">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M3 4v7a3 3 0 0 0 6 0V4m3 0 2.5 10L17 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Ultraviolet
        </span>
        <button
          className="sf-uv-toggle"
          type="button"
          aria-pressed={all}
          disabled={!active}
          onClick={() => {
            finish()
            setAll((v) => !v)
          }}
        >
          {all ? "Use lens" : "Reveal all"}
        </button>
      </div>
      <span className="sf-uv-help" id={help}>
        Move over the pass or drag to inspect its ultraviolet ink. Arrow keys move the lens, Shift moves farther, Home
        resets and Escape cancels a drag. Enter or Space toggles the full ink layer.
      </span>
    </section>
  )
}
