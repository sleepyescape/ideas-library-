/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/shimmer-button.tsx
 * Retains the upstream container-sized sliding spark, rotating conic gradient, inset backdrop and highlight. Scoped CSS replaces Tailwind; adds pause and reduced-motion controls.
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

export default function ShimmerButton({ active = true }: { active?: boolean }) {
  const [paused, setPaused] = useState(false)
  const [saved, setSaved] = useState(false)
  return (
    <div className="mg-shimmer" data-running={active && !paused}>
      <style>{`
        .mg-shimmer{height:100%;width:100%;min-height:240px;display:grid;place-content:center;justify-items:center;position:relative;background:#252826;color:#f6f5ec;font-family:inherit}
        .mg-shimmer .mg-shimmer-action{isolation:isolate;position:relative;overflow:hidden;border:1px solid #ffffff16;background:#303530;color:#f6f5ec;border-radius:100px;padding:0 27px;min-height:52px;min-width:176px;font:inherit;font-size:14px;cursor:pointer;transition:transform 150ms ease;outline-offset:5px;touch-action:manipulation}
        .mg-shimmer .mg-shimmer-sparkbox{position:absolute;inset:0;container-type:size;z-index:-3;filter:blur(2px)}
        .mg-shimmer .mg-shimmer-spark{position:absolute;inset:0;height:100cqh;aspect-ratio:1;animation:mg-shimmer-slide 3s ease-in-out infinite alternate}
        .mg-shimmer .mg-shimmer-light{position:absolute;inset:-100%;background:conic-gradient(from 225deg,transparent 0,#dbedc8 90deg,transparent 90deg);animation:mg-shimmer-spin 6s linear infinite}
        .mg-shimmer .mg-shimmer-backdrop{position:absolute;inset:1px;border-radius:inherit;background:#303530;z-index:-2}
        .mg-shimmer .mg-shimmer-highlight{position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 -8px 10px #ffffff12;pointer-events:none}
        .mg-shimmer .mg-shimmer-pause{position:absolute;right:12px;bottom:0;min-height:44px;padding:0 8px;font:inherit;font-size:10px;background:none;border:0;color:#b0b7aa;cursor:pointer;outline-offset:2px}
        .mg-shimmer[data-running="false"] .mg-shimmer-spark,.mg-shimmer[data-running="false"] .mg-shimmer-light{animation-play-state:paused}
        .mg-shimmer[data-running="true"] .mg-shimmer-action:active{transform:scale(.97)}
        @keyframes mg-shimmer-slide{to{transform:translate(calc(100cqw - 100%),0)}}
        @keyframes mg-shimmer-spin{0%{transform:rotate(0)}15%,35%{transform:rotate(90deg)}65%,85%{transform:rotate(270deg)}100%{transform:rotate(360deg)}}
        @media(prefers-reduced-motion:reduce){.mg-shimmer .mg-shimmer-spark,.mg-shimmer .mg-shimmer-light{animation:none}.mg-shimmer .mg-shimmer-action:active{transform:none!important}}
      `}</style>
      <button type="button" className="mg-shimmer-action" onClick={() => setSaved(!saved)} aria-pressed={saved}>
        <span aria-hidden="true" className="mg-shimmer-sparkbox">
          <span className="mg-shimmer-spark">
            <span className="mg-shimmer-light" />
          </span>
        </span>
        <span className="mg-shimmer-backdrop" aria-hidden="true" />
        <span className="mg-shimmer-highlight" aria-hidden="true" />
        {saved ? "On the list ✓" : "Join the waitlist"}
      </button>
      <button className="mg-shimmer-pause" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? "Play shimmer" : "Pause shimmer"}
      </button>
    </div>
  )
}
