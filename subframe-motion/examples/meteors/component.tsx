/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/meteors.tsx
 * Retains upstream rotated meteor head and gradient tail with translateX(-500px) / opacity keyframes. Uses a downward angle from the top edge, deterministic container-relative positions, bounded count and accessible pause/static reduced-motion treatment.
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

import { type CSSProperties, useState } from "react"

const meteors = Array.from({ length: 9 }, (_, i) => ({
  left: `${12 + ((i * 31) % 95)}%`,
  duration: `${4 + (i % 4)}s`,
  delay: `${-i * 1.17}s`,
}))

export default function Meteors({ active = true }: { active?: boolean }) {
  const [paused, setPaused] = useState(false)
  return (
    <div className="mg-meteors" data-running={active && !paused}>
      <style>{`
        .mg-meteors{height:100%;width:100%;min-height:250px;display:grid;place-content:center;position:relative;overflow:hidden;background:#202d3c;color:#d8e4eb;font-family:inherit;text-align:center}
        .mg-meteors .mg-meteors-meteor{position:absolute;top:-5%;height:2px;width:2px;border-radius:50%;background:#b7d0dd;box-shadow:0 0 0 1px #ffffff0a;transform:rotate(-145deg);animation:mg-meteor-fall var(--duration) linear infinite;animation-delay:var(--delay);pointer-events:none}
        .mg-meteors .mg-meteors-meteor::after{content:"";position:absolute;left:0;top:50%;height:1px;width:52px;transform:translateY(-50%);background:linear-gradient(to right,#9ab6c6,transparent)}
        .mg-meteors .mg-meteors-pause{position:absolute;right:12px;bottom:0;min-height:44px;padding:0 8px;font:inherit;font-size:10px;border:0;background:none;color:#9eb6c8;cursor:pointer}
        .mg-meteors[data-running="false"] .mg-meteors-meteor{animation-play-state:paused}
        @keyframes mg-meteor-fall{0%{transform:rotate(-145deg) translateX(0);opacity:1}70%{opacity:1}100%{transform:rotate(-145deg) translateX(-500px);opacity:0}}
        @media(prefers-reduced-motion:reduce){.mg-meteors .mg-meteors-meteor{animation:none;opacity:.5;top:15%;transform:none}.mg-meteors .mg-meteors-meteor:nth-child(2n){top:75%}.mg-meteors .mg-meteors-meteor::after{display:none}}
      `}</style>
      <div aria-hidden="true">
        {meteors.map((meteor, i) => (
          <span
            className="mg-meteors-meteor"
            key={i}
            style={{ left: meteor.left, "--duration": meteor.duration, "--delay": meteor.delay } as CSSProperties}
          />
        ))}
      </div>
      <button className="mg-meteors-pause" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? "Play sky" : "Pause sky"}
      </button>
    </div>
  )
}
