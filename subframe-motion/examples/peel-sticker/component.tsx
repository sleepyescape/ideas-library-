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

export default function PeelSticker({ active = true }: { active?: boolean }) {
  const id = useId().replace(/:/g, "")
  const [peeled, setPeeled] = useState(false)
  const [progress, setProgress] = useState(0)
  const position = useRef(0)
  const [instant, setInstant] = useState(false)
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(q.matches)
    sync()
    q.addEventListener("change", sync)
    return () => q.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    const to = peeled ? 1 : 0
    if (reduced || instant) {
      position.current = to
      setProgress(to)
      return
    }
    if (!active) {
      return
    }
    const from = position.current
    if (from === to) {
      return
    }
    let frame = 0,
      started = 0
    const duration = 560 * Math.max(0.4, Math.abs(to - from))
    const tick = (now: number) => {
      started ||= now
      const t = Math.min(1, (now - started) / duration)
      const value = from + (to - from) * (1 - Math.pow(1 - t, 3))
      position.current = value
      setProgress(value)
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [peeled, active, reduced, instant])
  const fold = 150 - progress * 113
  return (
    <section className="sf-peel-sticker" aria-label="Secret ingredient seal" data-peeled={peeled}>
      <div className="ps-packet">
        <div className="ps-brand">
          little
          <br />
          <em>ritual.</em>
        </div>
        <span className="ps-product">
          Infused olive oil
          <br />
          <small>250 ml</small>
        </span>
        <div className="ps-seal">
          <div className="ps-ingredient" aria-hidden={!peeled}>
            <svg viewBox="0 0 80 70" aria-hidden="true">
              <path
                d="M40 61Q42 33 37 10M40 43C19 43 18 28 14 24C34 21 40 30 40 43M40 36C58 38 65 22 64 16C46 18 41 24 40 36M37 23C22 20 28 5 27 4C39 8 42 15 37 23"
                fill="#3d5a29"
              />
              <path d="M38 39L23 30M42 32L57 22" stroke="#a9b879" strokeWidth=".6" fill="none" />
            </svg>
            <strong>Basil</strong>
          </div>
          <button
            type="button"
            className="ps-foil"
            disabled={!active}
            aria-label={peeled ? "Reseal the ingredient" : "Peel to reveal the ingredient"}
            aria-pressed={peeled}
            onClick={(e) => {
              setInstant(e.detail === 0)
              setPeeled((v) => !v)
            }}
          >
            <svg viewBox="0 0 160 160" aria-hidden="true" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id={`${id}-gold`} x1="0" x2="1" y1="0" y2=".35">
                  <stop stopColor="#ad8339" />
                  <stop offset=".24" stopColor="#dbbc69" />
                  <stop offset=".46" stopColor="#f6e5a7" />
                  <stop offset=".53" stopColor="#dbc277" />
                  <stop offset=".78" stopColor="#e7d38e" />
                  <stop offset="1" stopColor="#a58745" />
                </linearGradient>
                <linearGradient id={`${id}-back`} x1="0" x2="1">
                  <stop stopColor="#c1af79" />
                  <stop offset=".4" stopColor="#f4edcb" />
                  <stop offset=".8" stopColor="#d9c995" />
                  <stop offset="1" stopColor="#9f8f5e" />
                </linearGradient>
                <linearGradient id={`${id}-crease`} gradientUnits="userSpaceOnUse" x1={fold - 8} x2={fold + 2}>
                  <stop stopColor="#3e3218" stopOpacity="0" />
                  <stop offset=".6" stopColor="#3e3218" stopOpacity=".16" />
                  <stop offset=".84" stopColor="#ffffdf" stopOpacity=".65" />
                  <stop offset="1" stopColor="#5a4922" stopOpacity=".25" />
                </linearGradient>
                <clipPath id={`${id}-front`}>
                  <rect x="0" y="0" width={fold} height="160" />
                </clipPath>
                <clipPath id={`${id}-fold`}>
                  <rect x={fold} y="0" width={160 - fold} height="160" />
                </clipPath>
                <filter id={`${id}-shadow`} x="-35%" y="-30%" width="170%" height="170%">
                  <feGaussianBlur stdDeviation={1.5 + progress * 2} />
                </filter>
              </defs>
              <circle
                cx="80"
                cy="80"
                r="77"
                fill="#443c23"
                opacity={0.14 * (1 - progress)}
                transform="translate(1 3)"
              />
              <g clipPath={`url(#${id}-front)`}>
                <circle cx="80" cy="80" r="77" fill={`url(#${id}-gold)`} stroke="#b69c59" strokeWidth=".6" />
                <circle cx="80" cy="80" r="66" fill="none" stroke="#6f592c" strokeOpacity=".45" strokeWidth=".6" />
                <text
                  x="80"
                  y="98"
                  textAnchor="middle"
                  fill="#56491f"
                  fontFamily="Georgia,serif"
                  fontStyle="italic"
                  fontSize="62"
                >
                  r.
                </text>
                <text
                  x="80"
                  y="124"
                  textAnchor="middle"
                  fill="#66562a"
                  fontFamily="Arial,sans-serif"
                  fontSize="7"
                  letterSpacing="1.3"
                >
                  PEEL TO DISCOVER
                </text>
              </g>
              <g
                transform={`translate(${fold * 2 + 4} 5) scale(-1 1)`}
                opacity={0.08 + progress * 0.2}
                filter={`url(#${id}-shadow)`}
              >
                <circle cx="80" cy="80" r="77" fill="#433a24" clipPath={`url(#${id}-fold)`} />
              </g>
              <g transform={`translate(${fold * 2} 0) scale(-1 1)`}>
                <circle
                  cx="80"
                  cy="80"
                  r="77"
                  fill={`url(#${id}-back)`}
                  stroke="#b6a370"
                  strokeWidth=".5"
                  clipPath={`url(#${id}-fold)`}
                />
              </g>
              <circle cx="80" cy="80" r="77" fill={`url(#${id}-crease)`} clipPath={`url(#${id}-front)`} />
            </svg>
          </button>
        </div>
      </div>
      <style>{`.sf-peel-sticker{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;background:#d1d6c5;color:#263c26;font-family:Arial,sans-serif}.sf-peel-sticker *{box-sizing:border-box}.sf-peel-sticker .ps-packet{position:absolute;left:100px;top:65px;width:400px;height:238px;background:linear-gradient(90deg,#8c9873,#b6bea0 2%,#b9c0a3 92%,#9fa986 99%,#84906b);border-radius:1px;box-shadow:0 1px 2px #39422b20,5px 12px 18px #46523b2c,inset 1px 0 1px #dae1c4,inset 0 1px 0 #d5dabb}.sf-peel-sticker .ps-packet:before,.sf-peel-sticker .ps-packet:after{content:'';position:absolute;left:7px;right:7px;height:3px;background:repeating-linear-gradient(90deg,#7f896c55 0 1px,transparent 1px 3px);opacity:.5}.sf-peel-sticker .ps-packet:before{top:4px}.sf-peel-sticker .ps-packet:after{bottom:4px}.sf-peel-sticker .ps-brand{position:absolute;left:27px;top:29px;font:35px/.86 Georgia,serif;letter-spacing:-1.8px}.sf-peel-sticker .ps-brand em{font-weight:400}.sf-peel-sticker .ps-product{position:absolute;left:28px;bottom:28px;font:10px/1.5 Arial,sans-serif;color:#48563a}.sf-peel-sticker .ps-product small{font-size:9px;color:#647050}.sf-peel-sticker .ps-seal{position:absolute;left:228px;top:46px;width:160px;height:160px}.sf-peel-sticker .ps-ingredient{position:absolute;inset:3px;border-radius:50%;background:#e9e6c6;box-shadow:inset 0 0 0 .7px #54613b25;display:flex;flex-direction:column;align-items:center;justify-content:center}.sf-peel-sticker .ps-ingredient svg{width:65px;height:60px}.sf-peel-sticker .ps-ingredient strong{font:29px/1 Georgia,serif;letter-spacing:-.5px}.sf-peel-sticker .ps-ingredient small{font:5.6px/1 Arial,sans-serif;letter-spacing:1.1px;margin-top:12px}.sf-peel-sticker .ps-foil{position:absolute;left:-80px;top:0;width:240px;height:160px;padding:0;border:0;background:none;cursor:pointer;touch-action:manipulation;color:inherit}.sf-peel-sticker .ps-foil>svg{display:block;width:160px;height:160px;margin-left:80px;pointer-events:none}.sf-peel-sticker .ps-foil:focus-visible{outline:2px solid #29472d;outline-offset:8px;border-radius:50%}.sf-peel-sticker .ps-foil:disabled{cursor:default}.sf-peel-sticker .ps-foil:active:not(:disabled){filter:brightness(.97)}`}</style>
    </section>
  )
}
