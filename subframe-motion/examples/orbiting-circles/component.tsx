/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/orbiting-circles.tsx
 * Retains upstream orbit transforms: rotate, radial translation, then counter-rotation to keep each item upright. Uses scoped CSS, fixed semantic labels and pause/reduced-motion static positions.
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

export default function OrbitingCircles({ active = true }: { active?: boolean }) {
  const [paused, setPaused] = useState(false)
  const items = ["Draw", "Build", "Share"]
  return (
    <div className="mg-orbit" data-running={active && !paused}>
      <style>{`
        .mg-orbit{height:100%;width:100%;min-height:260px;display:grid;place-items:center;position:relative;overflow:hidden;background:#e1e8ea;color:#415b66;font-family:inherit}
        .mg-orbit .mg-orbit-scene{position:relative;width:228px;height:228px;display:grid;place-items:center}
        .mg-orbit .mg-orbit-ring{position:absolute;inset:28px;border:1px solid #8fa8b04d;border-radius:50%}.mg-orbit .mg-orbit-inner{inset:65px;border-style:dashed}
        .mg-orbit .mg-orbit-center{display:grid;place-items:center;width:61px;height:61px;z-index:1;border-radius:19px;background:#405c68;color:#eaf2f5;box-shadow:0 5px 15px #344e5820;font-size:11px;letter-spacing:.02em}
        .mg-orbit .mg-orbit-item{position:absolute;width:44px;height:44px;display:grid;place-items:center;left:calc(50% - 22px);top:calc(50% - 22px);border:1px solid #bdcdd3;border-radius:50%;background:#f1f5f4;color:#46626d;font-size:10px;box-shadow:0 3px 8px #46626d0b;transform:rotate(var(--angle)) translateY(86px) rotate(calc(-1 * var(--angle)));animation:mg-orbit-travel 24s linear infinite}
        .mg-orbit .mg-orbit-pause{position:absolute;right:12px;bottom:0;min-height:44px;padding:0 8px;font:inherit;font-size:10px;border:0;background:none;color:#50676f;cursor:pointer}
        .mg-orbit[data-running="false"] .mg-orbit-item{animation-play-state:paused}
        @keyframes mg-orbit-travel{from{transform:rotate(var(--angle)) translateY(86px) rotate(calc(-1 * var(--angle)))}to{transform:rotate(calc(var(--angle) + 360deg)) translateY(86px) rotate(calc(-1 * var(--angle) - 360deg))}}
        @media(prefers-reduced-motion:reduce){.mg-orbit .mg-orbit-item{animation:none}}
      `}</style>
      <div className="mg-orbit-scene" role="img" aria-label="Draw, build and share orbit around one idea">
        <span className="mg-orbit-ring" aria-hidden="true" />
        <span className="mg-orbit-ring mg-orbit-inner" aria-hidden="true" />
        <div className="mg-orbit-center" aria-hidden="true">
          One idea
        </div>
        {items.map((item, i) => (
          <span
            className="mg-orbit-item"
            aria-hidden="true"
            key={item}
            style={{ "--angle": `${i * 120 + 60}deg` } as CSSProperties}
          >
            {item}
          </span>
        ))}
      </div>
      <button className="mg-orbit-pause" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? "Play orbit" : "Pause orbit"}
      </button>
    </div>
  )
}
