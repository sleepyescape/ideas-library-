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

function InnerPrint({ offset, width }: { offset: number; width: number }) {
  return (
    <svg viewBox={`${offset} 0 ${width} 236`} width="100%" height="100%" aria-hidden="true">
      <rect width="384" height="236" fill="#13378a" />
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse
          key={i}
          cx="192"
          cy="117"
          rx={24 + i * 8.3}
          ry={78 - i * 2.7}
          fill="none"
          stroke="#ebe8d9"
          strokeWidth="1.4"
          transform={`rotate(${i * 3.5} 192 117)`}
        />
      ))}
      <text x="16" y="217" fill="#ebe8d9" fontFamily="Arial,sans-serif" fontSize="10" letterSpacing="1.2">
        SINE
      </text>
      <text x="368" y="217" fill="#ebe8d9" fontFamily="Arial,sans-serif" fontSize="9" textAnchor="end">
        22 OCT · 20:00
      </text>
    </svg>
  )
}

function CoverPrint({ offset }: { offset: number }) {
  return (
    <svg viewBox={`${offset} 0 96 236`} width="100%" height="100%" aria-hidden="true">
      <rect width="192" height="236" fill="#f34832" />
      <text
        x="12"
        y="69"
        fill="#272120"
        fontFamily="Arial,sans-serif"
        fontSize="62"
        fontWeight="900"
        letterSpacing="-5"
        textLength="163"
        lengthAdjust="spacingAndGlyphs"
      >
        SINE
      </text>
      <g fill="none" stroke="#272120" strokeWidth="1.3">
        {Array.from({ length: 13 }, (_, i) => (
          <ellipse key={i} cx="96" cy="137" rx={18 + i * 5.3} ry={47 - i * 1.9} transform={`rotate(${i * 6} 96 137)`} />
        ))}
      </g>
      <text x="14" y="218" fill="#272120" fontFamily="Arial,sans-serif" fontSize="8" letterSpacing="1">
        LIVE
      </text>
      <text x="178" y="218" fill="#272120" fontFamily="Arial,sans-serif" fontSize="8" textAnchor="end">
        22.10
      </text>
    </svg>
  )
}

export default function PaperFold({ active = true }: { active?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="sf-paper-fold" data-active={active} data-open={open}>
      <button
        className="pf-object"
        type="button"
        aria-label={open ? "Close the Sine invitation" : "Open the Sine invitation"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="pf-print" aria-hidden="true">
          <span className="pf-center">
            <InnerPrint offset={96} width={192} />
            <span className="pf-crease-left" />
            <span className="pf-crease-right" />
          </span>
          <span className="pf-wing pf-left">
            <span className="pf-face pf-inner">
              <InnerPrint offset={0} width={96} />
            </span>
            <span className="pf-face pf-cover">
              <CoverPrint offset={0} />
            </span>
          </span>
          <span className="pf-wing pf-right">
            <span className="pf-face pf-inner">
              <InnerPrint offset={288} width={96} />
            </span>
            <span className="pf-face pf-cover">
              <CoverPrint offset={96} />
            </span>
          </span>
        </span>
      </button>
      <button type="button" className="pf-action" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Fold" : "Unfold"}
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d={open ? "M2 6 6 10 2 14M18 6 14 10 18 14M6 10h8" : "m6 6-4 4 4 4m8-8 4 4-4 4M2 10h16"}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <style>{`
.sf-paper-fold{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;background:#d7d6d2;color:#343633;font-family:Arial,sans-serif;box-sizing:border-box}
.sf-paper-fold *{box-sizing:border-box}
.sf-paper-fold button{font:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.sf-paper-fold .pf-object{position:absolute;left:50%;top:30px;transform:translateX(-50%);width:430px;height:272px;border:0;background:none;padding:0;perspective:1000px;outline-offset:2px}
.sf-paper-fold .pf-object:focus-visible{outline:2px solid #173582;border-radius:4px}
.sf-paper-fold .pf-print{position:absolute;left:119px;top:10px;width:192px;height:236px;transform-style:preserve-3d;transform:rotateZ(-5deg);transition:transform 720ms cubic-bezier(.25,.75,.2,1)}
.sf-paper-fold[data-open=true] .pf-print{transform:rotateZ(-2deg)}
.sf-paper-fold .pf-center{position:absolute;inset:0;box-shadow:0 18px 19px -12px #27292570,0 2px 2px #22222228;transform:translateZ(-.5px);background:#13378a}
.sf-paper-fold .pf-wing{position:absolute;top:0;width:96px;height:236px;transform-style:preserve-3d;transition:transform 720ms cubic-bezier(.25,.75,.2,1);}
.sf-paper-fold .pf-left{left:-96px;transform-origin:100% 50%;transform:rotateY(180deg)}
.sf-paper-fold .pf-right{right:-96px;transform-origin:0 50%;transform:rotateY(-180deg)}
.sf-paper-fold[data-open=true] .pf-left{transform:rotateY(0deg)}
.sf-paper-fold[data-open=true] .pf-right{transform:rotateY(0deg)}
.sf-paper-fold .pf-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.sf-paper-fold .pf-inner{background:#13378a;box-shadow:0 16px 15px -11px #20252865,0 1px 1px #19263866;transform:translateZ(.5px)}
.sf-paper-fold .pf-cover{transform:rotateY(180deg) translateZ(.6px);background:#f34832;box-shadow:inset 0 1px 0 #ffbfa778,inset 0 -1px 0 #66140824}
.sf-paper-fold .pf-face>svg,.sf-paper-fold .pf-center>svg{width:200%;height:200%;max-width:none;transform:scale(.5);transform-origin:0 0}
.sf-paper-fold .pf-face::after{content:"";position:absolute;inset:0;pointer-events:none}
.sf-paper-fold .pf-left .pf-inner::after{background:linear-gradient(90deg,#0000 72%,#02082030)}
.sf-paper-fold .pf-right .pf-inner::after{background:linear-gradient(90deg,#02082038,#0000 25%)}
.sf-paper-fold .pf-left .pf-cover::after{background:linear-gradient(90deg,#fff1,#0000 70%,#55150c14);border-right:1px solid #54110620}
.sf-paper-fold .pf-right .pf-cover::after{background:linear-gradient(90deg,#5c160b17,#fff0 14%,#fff1);border-left:1px solid #ff8a7055}
.sf-paper-fold .pf-crease-left,.sf-paper-fold .pf-crease-right{position:absolute;top:0;bottom:0;width:15px;pointer-events:none;opacity:1;transition:opacity 720ms cubic-bezier(.25,.75,.2,1)}
.sf-paper-fold .pf-crease-left{left:0;background:linear-gradient(90deg,#010a2760,#0000)}.sf-paper-fold .pf-crease-right{right:0;background:linear-gradient(-90deg,#010a2760,#0000)}
.sf-paper-fold[data-open=true] .pf-crease-left,.sf-paper-fold[data-open=true] .pf-crease-right{opacity:.45}
.sf-paper-fold .pf-action{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);border:1px solid #b6b6b2;border-radius:24px;min-width:112px;height:44px;padding:0 17px;background:#e2e2dd;color:#444741;display:flex;align-items:center;justify-content:center;gap:15px;font-size:12px;box-shadow:0 1px 1px #fff7 inset;transition:background-color 150ms ease}
.sf-paper-fold .pf-action:focus-visible{outline:2px solid #173582;outline-offset:3px}
@media(hover:hover){.sf-paper-fold .pf-action:hover{background:#eeeee8}}
.sf-paper-fold .pf-action:active{background:#c7c9c3}
.sf-paper-fold[data-active=false] *{transition:none!important}
@media(prefers-reduced-motion:reduce){.sf-paper-fold *{transition:none!important}}
`}</style>
    </section>
  )
}
