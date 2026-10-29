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

import { useState } from "react"

const heron =
  "M111 70 190 52C207 46 224 52 227 66C232 81 216 95 205 109C187 131 187 149 207 157C226 165 245 151 263 164C280 178 285 191 309 197C279 206 250 204 231 192L225 236 239 240 218 237 222 187C203 188 181 176 179 158C177 137 193 116 207 99C221 82 219 73 205 74C189 77 159 79 111 70"

export default function SignatureDraw({ active = true }: { active?: boolean }) {
  const [run, setRun] = useState(0)
  return (
    <section className="sf-signature-draw" data-active={active}>
      <div className="sd-stock">
        <svg className="sd-emblem" viewBox="0 0 400 260" role="img" aria-label="An original line-drawn heron emblem">
          <path
            className="sd-impression"
            d={heron}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            key={run}
            className="sd-ink"
            data-replay={run > 0}
            d={heron}
            pathLength="100"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100 101"
            strokeDashoffset="0"
          />
          <circle className="sd-eye" data-replay={run > 0} key={`eye-${run}`} cx="213" cy="59" r="1.55" />
        </svg>
        <span className="sd-wordmark" aria-hidden="true">
          reed
        </span>
        <button
          type="button"
          className="sd-replay"
          aria-label="Replay emblem drawing"
          onClick={() => {
            setRun((value) => value + 1)
          }}
        >
          <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true">
            <path
              d="M4 8a6 6 0 1 1 .6 5M4 8V3m0 5h5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <style>{`
.sf-signature-draw{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;background:#bf3324;color:#6b2114;font-family:Arial,sans-serif;box-sizing:border-box}
.sf-signature-draw *{box-sizing:border-box}
.sf-signature-draw .sd-stock{position:absolute;left:50%;top:28px;width:328px;height:310px;transform:translateX(-50%) rotate(-3deg);background:#efbf3e;box-shadow:0 1px 0 #ffe57a inset,1px 1px 1px #62281226,0 17px 24px -16px #5717079c;isolation:isolate}
.sf-signature-draw .sd-stock::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,#4d240d04 0 1px,#fff0 1px 3px);opacity:.45}
.sf-signature-draw .sd-emblem{position:absolute;top:3px;left:-7px;width:342px;height:249px;overflow:visible}
.sf-signature-draw .sd-impression{stroke:#b786252a;transform:translate(.7px,1px)}
.sf-signature-draw .sd-ink{stroke:#632319}
.sf-signature-draw .sd-ink[data-replay=true]{animation:sd-heron-ink 2100ms cubic-bezier(.37,.12,.28,1) both}
.sf-signature-draw .sd-eye{fill:#632319}
.sf-signature-draw .sd-eye[data-replay=true]{animation:sd-heron-eye 2100ms linear both}
.sf-signature-draw .sd-wordmark{position:absolute;bottom:16px;left:0;right:0;text-align:center;font:54px/.95 Georgia,serif;letter-spacing:-5px;color:#632319}
.sf-signature-draw .sd-replay{position:absolute;right:7px;bottom:7px;width:44px;height:44px;border:0;padding:0;display:grid;place-items:center;background:none;color:#632319;cursor:pointer;border-radius:50%;touch-action:manipulation;transition:background-color 150ms ease,transform 150ms ease;z-index:1}
.sf-signature-draw .sd-replay:focus-visible{outline:2px solid #632319;outline-offset:-4px}
@media(hover:hover){.sf-signature-draw .sd-replay:hover{background:#7734180c}}
.sf-signature-draw .sd-replay:active{transform:scale(.94);background:#77341815}
@keyframes sd-heron-ink{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
@keyframes sd-heron-eye{0%,22%{opacity:0}25%,100%{opacity:1}}
.sf-signature-draw[data-active=false] .sd-ink,.sf-signature-draw[data-active=false] .sd-eye{animation-play-state:paused}
@media(prefers-reduced-motion:reduce){.sf-signature-draw *{animation:none!important;transition:none!important}}
`}</style>
    </section>
  )
}
