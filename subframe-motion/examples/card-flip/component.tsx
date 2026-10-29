/**
 * Adapted from https://github.com/kokonut-labs/kokonutui/blob/83eec6d982d400a18438001a8efdbac1f159dd43/components/kokonutui/card-flip.tsx
 * Retains the perspective/backface 3D flip, ten staggered pulse layers and cascading feature reveal; adds touch and keyboard toggling.
 * Standalone styles and original demo content; reduced-motion and preview controls.
 *
 * MIT License
 *
 * Copyright (c) 2025 kokonutUI
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

export default function CardFlipExample({ active = true }: { active?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false)
  return (
    <div className="sf-flip-stage" data-active={active}>
      <button
        type="button"
        className="sf-flip-boundary"
        aria-label="Explore the field kit"
        aria-pressed={isFlipped}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            setIsFlipped(true)
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            setIsFlipped(false)
          }
        }}
        onClick={() => setIsFlipped((value) => !value)}
      >
        <span className="sf-flip-card" data-flipped={isFlipped}>
          <span className="sf-flip-face sf-flip-front" aria-hidden={isFlipped}>
            <span className="sf-flip-orbit" aria-hidden>
              {Array.from({ length: 10 }, (_, index) => (
                <span key={index} style={{ animationDelay: `${index * 0.3}s` }} />
              ))}
            </span>
            <span className="sf-flip-copy">
              <strong>The field kit</strong>
            </span>
            <span className="sf-flip-hint" aria-hidden>
              ↔
            </span>
          </span>
          <span className="sf-flip-face sf-flip-back" aria-hidden={!isFlipped}>
            <span className="sf-flip-features">
              {["A fresh notebook", "An open mind", "Time to explore"].map((feature, index) => (
                <span
                  key={feature}
                  style={{
                    transform: isFlipped ? "translateX(0)" : "translateX(-10px)",
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: `${index * 50 + 150}ms`,
                  }}
                >
                  ↗ &nbsp;{feature}
                </span>
              ))}
            </span>
          </span>
        </span>
      </button>
      <style>{`
      .sf-flip-stage { width:100%; height:100%; min-height:260px; display:grid; place-items:center; padding:20px; box-sizing:border-box; background:#efebe5; color:#4a4239; font-family:inherit }
      .sf-flip-boundary { display:block; width:242px; max-width:100%; height:214px; position:relative; perspective:2000px; padding:0; border:0; background:transparent; text-align:left; color:inherit; font:inherit; cursor:pointer; outline-offset:6px; border-radius:16px; touch-action:manipulation }
      .sf-flip-card { position:relative; display:block; width:100%; height:100%; transform-style:preserve-3d; transform:rotateY(0); transition:transform 500ms cubic-bezier(.77,0,.175,1) }
      .sf-flip-card[data-flipped="true"] { transform:rotateY(180deg) }
      .sf-flip-face { position:absolute; inset:0; overflow:hidden; border-radius:16px; border:1px solid #dad0c3; background:linear-gradient(#f5f0e8,#fffdf9); backface-visibility:hidden; box-shadow:0 3px 8px #46341f08; box-sizing:border-box }
      .sf-flip-front { transform:rotateY(0) }
      .sf-flip-back { transform:rotateY(180deg); display:flex; flex-direction:column; justify-content:center; padding:23px }
      .sf-flip-orbit { position:absolute; display:grid; place-items:center; inset:0 0 58px }
      .sf-flip-orbit > span { position:absolute; width:50px; height:50px; border-radius:100%; background:#d2ad7933; box-shadow:0 0 40px #dfb07455; opacity:0; animation:sf-flip-scale 3s linear infinite }
      .sf-flip-copy { position:absolute; bottom:25px; left:23px; display:grid; gap:8px }
      .sf-flip-face strong { font-size:15px; font-weight:550; letter-spacing:-.03em }
      .sf-flip-hint { position:absolute; right:23px; bottom:21px; color:#aa7a3e; font-size:18px }
      .sf-flip-features { display:grid; gap:8px; font-size:11px; color:#786449 }
      .sf-flip-features > span { transition:transform 300ms cubic-bezier(.23,1,.32,1),opacity 300ms }
      @keyframes sf-flip-scale { 0% { transform:scale(2); opacity:0 } 50% { transform:translateY(-5px) scale(1); opacity:1 } 100% { transform:translateY(5px) scale(.1); opacity:0 } }
      .sf-flip-stage[data-active="false"] .sf-flip-orbit > span { animation-play-state:paused }
      .sf-flip-stage[data-active="false"] .sf-flip-card,.sf-flip-stage[data-active="false"] .sf-flip-features > span { transition:none }
      @media (prefers-reduced-motion:reduce) { .sf-flip-orbit > span { animation:none; opacity:.3; transform:none } .sf-flip-card,.sf-flip-card[data-flipped="true"],.sf-flip-face { transform:none; transition:none } .sf-flip-face[aria-hidden="true"] { visibility:hidden } .sf-flip-features > span { transform:none!important; transition:none } }
    `}</style>
    </div>
  )
}
