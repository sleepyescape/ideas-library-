/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/animated-shiny-text.tsx
 * Retains the upstream narrow gradient clipped to text and delayed background-position sweep. Uses scoped CSS with pause and reduced-motion static text.
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

export default function AnimatedShinyText({ active = true }: { active?: boolean }) {
  const [paused, setPaused] = useState(false)
  return (
    <div className="mg-shinytext" data-running={active && !paused}>
      <style>{`
        .mg-shinytext{width:100%;height:100%;min-height:240px;position:relative;display:grid;place-content:center;justify-items:center;gap:19px;background:#202126;font-family:inherit;color:#e9e8e6;text-align:center}
        .mg-shinytext .mg-shinytext-pill{padding:8px 13px;border:1px solid #414147;border-radius:99px;font-size:11px;color:#b7b8bd}
        .mg-shinytext h3{font-size:clamp(24px,4vw,36px);font-weight:500;letter-spacing:-1.1px;line-height:1.16;margin:0;padding:0 22px}
        .mg-shinytext .mg-shinytext-shine{color:#aaa9afaa;background-image:linear-gradient(90deg,transparent,#fff,transparent);background-repeat:no-repeat;background-size:80px 100%;background-clip:text;-webkit-background-clip:text;animation:mg-shinytext-pass 4.5s ease-in-out infinite}
        .mg-shinytext .mg-shinytext-pause{position:absolute;right:12px;bottom:0;min-height:44px;padding:0 8px;font:inherit;font-size:10px;border:0;background:none;color:#aba9b4;cursor:pointer}
        .mg-shinytext[data-running="false"] .mg-shinytext-shine{animation-play-state:paused}
        @keyframes mg-shinytext-pass{0%,90%,100%{background-position:calc(-100% - 80px) 0}30%,60%{background-position:calc(100% + 80px) 0}}
        @media(prefers-reduced-motion:reduce){.mg-shinytext .mg-shinytext-shine{animation:none;background:none;color:#d3d2d7}}
      `}</style>
      <span className="mg-shinytext-pill">A small detail. A different feeling.</span>
      <h3>
        <span className="mg-shinytext-shine">
          Let the light
          <br />
          find the words.
        </span>
      </h3>
      <button className="mg-shinytext-pause" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? "Play shine" : "Pause shine"}
      </button>
    </div>
  )
}
