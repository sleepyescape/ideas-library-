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

export default function OpticToggle({ active = true }: { active?: boolean }) {
  const [on, setOn] = useState(true)
  const [reduced, setReduced] = useState(true)
  const [map, setMap] = useState("")
  const [enhanced, setEnhanced] = useState(false)
  const thumb = useRef<HTMLSpanElement>(null)
  const id = "optic-" + useId().replace(/:/g, "")
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    // SVG backdrop displacement currently has consistent rendering in Chromium.
    // Other engines keep the translucent, blurred material and functional switch.
    setEnhanced(/Chrome|Chromium|Edg\//.test(navigator.userAgent) && CSS.supports("backdrop-filter", "blur(1px)"))
    return () => media.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    const el = thumb.current
    if (!el) {
      return
    }
    let key = ""
    const measure = () => {
      const w = Math.round(el.clientWidth),
        h = Math.round(el.clientHeight)
      if (!w || !h || key === `${w},${h}`) {
        return
      }
      key = `${w},${h}`
      const canvas = document.createElement("canvas")
      canvas.width = w * 2
      canvas.height = h * 2
      const context = canvas.getContext("2d")
      if (!context) {
        return
      }
      const pixels = context.createImageData(canvas.width, canvas.height)
      const radius = Math.min(w, h) / 2
      const distance = (x: number, y: number) => {
        const qx = Math.abs(x - w / 2) - (w / 2 - radius)
        const qy = Math.abs(y - h / 2) - (h / 2 - radius)
        return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius
      }
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const px = (x + 0.5) / 2,
            py = (y + 0.5) / 2,
            inside = -distance(px, py),
            i = (y * canvas.width + x) * 4
          const gx = distance(px + 0.25, py) - distance(px - 0.25, py),
            gy = distance(px, py + 0.25) - distance(px, py - 0.25)
          const norm = Math.hypot(gx, gy) || 1
          const t = Math.max(0, Math.min(1, inside / 12))
          const strength = inside > 0 && inside < 12 ? Math.sin(t * Math.PI) * 0.72 : 0
          pixels.data[i] = Math.round(128 - ((100 * gx) / norm) * strength)
          pixels.data[i + 1] = Math.round(128 - ((100 * gy) / norm) * strength)
          pixels.data[i + 2] = 128
          pixels.data[i + 3] = 255
        }
      }
      context.putImageData(pixels, 0, 0)
      setMap(canvas.toDataURL())
      canvas.width = canvas.height = 1
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    measure()
    return () => observer.disconnect()
  }, [])
  const filter = enhanced && map ? `url(#${id}) blur(.7px)` : "blur(3px) saturate(1.2)"
  return (
    <section
      className="sf-optic-toggle"
      data-on={on}
      data-calm={reduced || !active}
      aria-label="Studio lighting control"
    >
      <style>{`.sf-optic-toggle{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;background:#242424;color:#fff;font-family:Arial,sans-serif;container-type:size}.sf-optic-toggle *{box-sizing:border-box}.sf-optic-toggle .ot-field{position:absolute;inset:0;background-color:#f76d25;background-image:repeating-linear-gradient(120deg,transparent 0 29px,#262421 29px 44px);transform:scale(1.2);filter:brightness(.4) saturate(.4);transition:filter 240ms ease-out}.sf-optic-toggle[data-on=true] .ot-field{filter:brightness(1) saturate(1)}.sf-optic-toggle .ot-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 10%,#14161480 100%);pointer-events:none}.sf-optic-toggle .ot-switch{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);width:186px;height:80px;border-radius:44px;padding:5px;border:1px solid #fff5;background:#10151422;box-shadow:inset 0 2px 7px #0007,0 3px 0 #fff3;cursor:pointer;touch-action:manipulation;isolation:isolate}.sf-optic-toggle .ot-track{position:absolute;inset:0;display:flex;justify-content:space-between;align-items:center;padding:0 31px;color:#fff8;font:12px Arial;pointer-events:none}.sf-optic-toggle .ot-thumb{position:absolute;width:102px;height:68px;left:5px;top:5px;border-radius:36px;transform:translateX(0);transition:transform 260ms cubic-bezier(.22,1,.36,1);background:linear-gradient(145deg,#ffffff3b,#ffffff08 38%,#ffffff1f);box-shadow:inset 0 1px 1px #fff,inset 0 -2px 2px #fff9,inset 2px 0 3px #fffc,inset -2px 0 3px #0005,0 4px 7px #0004;pointer-events:none}.sf-optic-toggle[data-on=true] .ot-thumb{transform:translateX(72px)}.sf-optic-toggle .ot-thumb:after{content:'';position:absolute;inset:5px;border-radius:inherit;border-top:1px solid #fff9;background:linear-gradient(155deg,#fff4,transparent 35%);pointer-events:none}.sf-optic-toggle .ot-dot{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:50%;background:#e3e3d8;box-shadow:0 1px 3px #0005}.sf-optic-toggle[data-on=true] .ot-dot{background:#e3ff94;box-shadow:0 0 9px #d3ff98}.sf-optic-toggle .ot-switch:focus-visible{outline:2px solid #fff;outline-offset:7px}.sf-optic-toggle .ot-switch:active .ot-thumb{box-shadow:inset 0 1px 2px #fff,0 1px 2px #0008}.sf-optic-toggle .ot-label{position:absolute;top:calc(47% + 63px);left:0;right:0;display:flex;gap:9px;justify-content:center;align-items:center;font-size:11px;letter-spacing:.08em;text-shadow:0 1px 3px #0008}.sf-optic-toggle .ot-label span:last-child{opacity:.7}.sf-optic-toggle[data-calm=true] .ot-field,.sf-optic-toggle[data-calm=true] .ot-thumb{transition:none}`}</style>
      <div className="ot-field" />
      <div className="ot-vignette" />
      {enhanced && map && (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
          <defs>
            <filter
              id={id}
              x="0"
              y="0"
              width="102"
              height="68"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage href={map} x="0" y="0" width="102" height="68" preserveAspectRatio="none" result="edge" />
              <feDisplacementMap in="SourceGraphic" in2="edge" scale="28" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Studio light"
        className="ot-switch"
        onClick={() => setOn((v) => !v)}
      >
        <span className="ot-track" aria-hidden="true">
          <span>O</span>
          <span>I</span>
        </span>
        <span ref={thumb} className="ot-thumb" style={{ backdropFilter: filter, WebkitBackdropFilter: filter }}>
          <span className="ot-dot" />
        </span>
      </button>
      <div className="ot-label" aria-hidden="true">
        <span>STUDIO LIGHT</span>
        <span>{on ? "ON" : "OFF"}</span>
      </div>
    </section>
  )
}
