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

function useCalm(active: boolean) {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])
  return reduced || !active
}

const archive = [
  ["/motion/assets/concrete-geometries.webp", "GEOMETRY"],
  ["/motion/assets/cathedral-columns.webp", "RHYTHM"],
  ["/motion/assets/paris-street.webp", "PASSAGE"],
  ["/motion/assets/concrete-projections.webp", "MASS"],
  ["/motion/assets/montmartre.webp", "CONTOUR"],
]
export default function ThumbnailIndex({ active = true }: { active?: boolean }) {
  const calm = useCalm(active)
  const [current, setCurrent] = useState(0)
  const [instant, setInstant] = useState(false)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const choose = (n: number, immediate = false) => {
    if (!active) {
      return
    }
    setInstant(immediate)
    setCurrent(Math.max(0, Math.min(archive.length - 1, n)))
  }
  return (
    <section className="sf-thumbnail-index" data-calm={calm || instant} aria-label="Architecture thumbnail index">
      <style>{`.sf-thumbnail-index{width:100%;height:100%;min-height:280px;background:#242820;color:#fff;position:relative;overflow:hidden;font-family:Arial,sans-serif;container-type:size}.sf-thumbnail-index *{box-sizing:border-box}.sf-thumbnail-index .ti-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity 260ms ease,transform 420ms cubic-bezier(.22,1,.36,1)}.sf-thumbnail-index:after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,#0007,transparent 52%);pointer-events:none}.sf-thumbnail-index .ti-label{position:absolute;z-index:2;bottom:26px;left:28px;right:130px}.sf-thumbnail-index .ti-label strong{display:block;font-size:41px;letter-spacing:-.055em;line-height:1;font-weight:500}.sf-thumbnail-index .ti-rail{position:absolute;z-index:3;right:20px;top:50%;transform:translateY(-50%);width:83px;padding:7px;display:grid;gap:5px;background:#141714e8;box-shadow:0 0 0 1px #ffffff1f,0 6px 24px #0004;border-radius:7px}.sf-thumbnail-index .ti-rail button{position:relative;display:block;width:69px;height:49px;border:0;padding:2px;background:transparent;border-radius:3px;cursor:pointer;transition:background 140ms ease}.sf-thumbnail-index .ti-rail button[aria-current=true]{background:#fff;box-shadow:inset 0 0 0 1px #10181040}.sf-thumbnail-index .ti-rail button:not([aria-current=true]):hover{background:#ffffff45}.sf-thumbnail-index .ti-rail img{display:block;width:100%;height:100%;object-fit:cover;border-radius:1px;filter:brightness(.82)}.sf-thumbnail-index .ti-rail button[aria-current=true] img{filter:none}.sf-thumbnail-index .ti-rail span{position:absolute;left:7px;bottom:6px;font:9px/1 Arial,sans-serif;color:#fff;text-shadow:0 1px 3px #000,0 0 5px #000}.sf-thumbnail-index button:focus-visible{outline:2px solid #ffe0a4;outline-offset:3px}.sf-thumbnail-index button:disabled{cursor:default}.sf-thumbnail-index[data-calm=true] .ti-image{transition:none}`}</style>
      {archive.map(([image, label], i) => (
        <img
          className="ti-image"
          key={image}
          src={image}
          alt={current === i ? label : ""}
          aria-hidden={current !== i}
          style={{ opacity: current === i ? 1 : 0, transform: `scale(${current === i ? 1 : 1.025})` }}
        />
      ))}
      <div className="ti-label">
        <strong>{archive[current][1]}</strong>
      </div>
      <div
        className="ti-rail"
        role="group"
        aria-label="Architecture index"
        onKeyDown={(e) => {
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key) || !active) {
            return
          }
          e.preventDefault()
          const next =
            e.key === "Home"
              ? 0
              : e.key === "End"
              ? 4
              : Math.max(0, Math.min(4, current + (e.key === "ArrowDown" ? 1 : -1)))
          choose(next, true)
          buttons.current[next]?.focus()
        }}
      >
        {archive.map(([image, label], i) => (
          <button
            key={image}
            ref={(el) => {
              buttons.current[i] = el
            }}
            type="button"
            aria-label={`View ${label.toLowerCase()}`}
            aria-current={current === i}
            disabled={!active}
            tabIndex={current === i ? 0 : -1}
            onClick={(e) => choose(i, e.detail === 0)}
          >
            <img src={image} alt="" />
            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
