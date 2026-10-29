/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/interactive-hover-button.tsx
 * Retains the upstream expanding dot, translated/faded first label and overlaid arrow label. Replaces lucide with inline SVG, scopes CSS and provides instant keyboard/reduced-motion feedback.
 *
 * MIT License
 *
 * Copyright (c) Magic UI
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

export default function InteractiveHoverButton({ active = true }: { active?: boolean }) {
  const [selected, setSelected] = useState(false)
  return (
    <div className="mg-hoverbutton" data-running={active}>
      <style>{`
        .mg-hoverbutton{height:100%;width:100%;min-height:240px;display:grid;place-content:center;justify-items:center;background:#f1e6d6;color:#594b3d;font-family:inherit}
        .mg-hoverbutton .mg-hoverbutton-action{position:relative;isolation:isolate;overflow:hidden;height:52px;min-width:183px;border:1px solid #cfbda6;background:#f8eedf;border-radius:99px;padding:0 23px;font:inherit;font-size:13px;color:#5d4d3d;cursor:pointer;outline-offset:5px;touch-action:manipulation}
        .mg-hoverbutton .mg-hoverbutton-first{display:flex;align-items:center;justify-content:center;gap:10px}.mg-hoverbutton .mg-hoverbutton-dot{width:7px;height:7px;flex-shrink:0;border-radius:50%;background:#897054;transition:transform 300ms cubic-bezier(.19,1,.22,1);position:relative;z-index:-1}
        .mg-hoverbutton .mg-hoverbutton-firsttext{transition:transform 250ms ease,opacity 180ms ease}.mg-hoverbutton .mg-hoverbutton-second{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:9px;color:#fff8ec;transform:translateX(24px);opacity:0;transition:transform 300ms cubic-bezier(.19,1,.22,1),opacity 200ms ease}
        @media(hover:hover) and (pointer:fine){.mg-hoverbutton[data-running="true"] .mg-hoverbutton-action:hover .mg-hoverbutton-dot{transform:scale(80)}.mg-hoverbutton[data-running="true"] .mg-hoverbutton-action:hover .mg-hoverbutton-firsttext{transform:translateX(22px);opacity:0}.mg-hoverbutton[data-running="true"] .mg-hoverbutton-action:hover .mg-hoverbutton-second{transform:translateX(0);opacity:1}}
        .mg-hoverbutton .mg-hoverbutton-action:focus-visible{background:#897054;color:#fff8ec}.mg-hoverbutton .mg-hoverbutton-action:focus-visible .mg-hoverbutton-dot{background:#fff8ec}.mg-hoverbutton .mg-hoverbutton-action:active{background:#796149;color:#fff8ec}
        @media(prefers-reduced-motion:reduce){.mg-hoverbutton .mg-hoverbutton-dot,.mg-hoverbutton .mg-hoverbutton-firsttext,.mg-hoverbutton .mg-hoverbutton-second{transition:none!important}.mg-hoverbutton .mg-hoverbutton-action:hover .mg-hoverbutton-dot{transform:none!important}.mg-hoverbutton .mg-hoverbutton-action:hover .mg-hoverbutton-firsttext{transform:none!important;opacity:1!important}.mg-hoverbutton .mg-hoverbutton-action:hover .mg-hoverbutton-second{display:none}.mg-hoverbutton .mg-hoverbutton-action:hover{background:#897054;color:#fff8ec}}
      `}</style>
      <button
        className="mg-hoverbutton-action"
        type="button"
        aria-pressed={selected}
        onClick={() => setSelected(!selected)}
      >
        <span className="mg-hoverbutton-first">
          <span className="mg-hoverbutton-dot" aria-hidden="true" />
          <span className="mg-hoverbutton-firsttext">{selected ? "You're on the list" : "Step inside"}</span>
        </span>
        <span className="mg-hoverbutton-second" aria-hidden="true">
          {selected ? "You're on the list" : "Step inside"}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10m-4-4 4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  )
}
