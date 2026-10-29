/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/marquee.tsx
 * Retains repeated flex groups and translateX(calc(-100% - gap)) keyframes. Opposing directions, hover/pause control, hidden duplicate content and readable reduced-motion wrapping.
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

export default function Marquee({ active = true }: { active?: boolean }) {
  const [paused, setPaused] = useState(false)
  const rows = [
    ["MAKE SOMETHING", "WORTH FEELING", "TAKE YOUR TIME"],
    ["FORM & FEELING", "LESS, BUT BETTER", "KEEP EXPLORING"],
  ]
  return (
    <div className="mg-marquee" data-running={active && !paused}>
      <style>{`
        .mg-marquee{height:100%;width:100%;min-height:240px;display:flex;flex-direction:column;justify-content:center;gap:16px;position:relative;overflow:hidden;background:#dce4cf;color:#374433;font-family:inherit}
        .mg-marquee .mg-marquee-row{display:flex;gap:24px;overflow:hidden;flex-shrink:0}
        .mg-marquee .mg-marquee-group{display:flex;gap:24px;flex-shrink:0;align-items:center;animation:mg-marquee-travel 30s linear infinite}
        .mg-marquee .mg-marquee-reverse .mg-marquee-group{animation-direction:reverse}
        .mg-marquee .mg-marquee-word{display:flex;gap:24px;align-items:center;white-space:nowrap;font-size:30px;font-weight:500;letter-spacing:-1.3px;line-height:1.3}
        .mg-marquee .mg-marquee-reverse .mg-marquee-word{font-family:Georgia,serif;font-style:italic;font-size:35px;font-weight:400}
        .mg-marquee .mg-marquee-star{font-size:22px;color:#879974;font-style:normal;font-family:inherit}
        .mg-marquee .mg-marquee-pause{position:absolute;right:12px;bottom:0;min-height:44px;padding:0 8px;font:inherit;font-size:10px;border:0;background:none;color:#56674b;cursor:pointer}
        .mg-marquee[data-running="false"] .mg-marquee-group{animation-play-state:paused}
        @media(hover:hover) and (pointer:fine){.mg-marquee:hover .mg-marquee-group{animation-play-state:paused}}
        @keyframes mg-marquee-travel{to{transform:translateX(calc(-100% - 24px))}}
        @media(prefers-reduced-motion:reduce){.mg-marquee{padding:24px;box-sizing:border-box;gap:12px}.mg-marquee .mg-marquee-group{animation:none;flex-wrap:wrap;justify-content:center;gap:8px 18px;flex-shrink:1}.mg-marquee .mg-marquee-group[aria-hidden="true"]{display:none}.mg-marquee .mg-marquee-word,.mg-marquee .mg-marquee-reverse .mg-marquee-word{font-size:14px;letter-spacing:0;gap:12px}.mg-marquee .mg-marquee-row{justify-content:center}}
      `}</style>
      {rows.map((words, row) => (
        <div className={`mg-marquee-row ${row ? "mg-marquee-reverse" : ""}`} key={row}>
          {[0, 1, 2].map((copy) => (
            <div className="mg-marquee-group" aria-hidden={copy > 0 ? true : undefined} key={copy}>
              {words.map((word) => (
                <span className="mg-marquee-word" key={word}>
                  {word}
                  <span className="mg-marquee-star" aria-hidden="true">
                    ✳
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
      <button className="mg-marquee-pause" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? "Play marquee" : "Pause marquee"}
      </button>
    </div>
  )
}
