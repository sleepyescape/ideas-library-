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

import { useEffect, useRef, useState } from "react"

const plates = [
  ["/motion/assets/botanical-turban-lily.webp", "Turban lily"],
  ["/motion/assets/botanical-iris.webp", "Gold-banded iris"],
  ["/motion/assets/botanical-crocus.webp", "Crocus sativus"],
  ["/motion/assets/botanical-cabbage-rose.webp", "Cabbage rose"],
]

export default function SpecimenBook({ active = true }: { active?: boolean }) {
  const [leaf, setLeaf] = useState(1)
  const [moving, setMoving] = useState(-1)
  const [instant, setInstant] = useState(false)
  const [reduced, setReduced] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(q.matches)
    sync()
    q.addEventListener("change", sync)
    return () => {
      q.removeEventListener("change", sync)
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [])
  useEffect(() => {
    if (!active || reduced) {
      if (timer.current) {
        clearTimeout(timer.current)
      }
      setMoving(-1)
    }
  }, [active, reduced])
  const turn = (next: number, keyboard = false) => {
    if (!active) {
      return
    }
    if (timer.current) {
      clearTimeout(timer.current)
    }
    setInstant(keyboard)
    setMoving(Math.min(leaf, next))
    setLeaf(next)
    timer.current = setTimeout(() => setMoving(-1), reduced || keyboard ? 0 : 660)
  }
  const print = (i: number) => <img src={plates[i][0]} alt="" draggable={false} />
  return (
    <section
      className="sf-specimen-book"
      data-calm={reduced || !active || instant}
      aria-label="Botanical specimen book"
      data-spread={leaf}
    >
      <div className="sb-volume" style={{ transform: `translateX(${leaf > 0 ? 83 : 0}px)` }} aria-hidden="true">
        <div className="sb-board" />
        <div className="sb-block" />
        <div className="sb-face sb-base">{print(3)}</div>
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`sb-leaf sb-leaf-${i}`}
            style={{
              transform: `rotateY(${i < leaf ? -180 : 0}deg)`,
              zIndex: moving === i ? 20 : i < leaf ? i + 1 : 8 - i,
            }}
          >
            <div className={`sb-face ${i === 0 ? "sb-cover" : ""}`}>
              {i === 0 ? (
                <>
                  <strong>FLORA</strong>
                  <svg viewBox="0 0 100 150">
                    <path
                      d="M52 138C40 100 54 68 51 35M49 97Q17 82 21 54Q49 60 49 97M51 73Q85 66 81 43Q57 45 51 73M50 110Q70 115 80 90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth=".8"
                    />
                    <path
                      d="M51 42C25 47 28 23 40 24C35 6 55 10 55 23C72 8 79 28 65 33C83 43 58 58 51 42Z"
                      fill="none"
                      stroke="currentColor"
                    />
                    <circle cx="52" cy="34" r="5" fill="currentColor" />
                  </svg>
                  <small>Four botanical plates</small>
                </>
              ) : (
                print(1)
              )}
            </div>
            <div className="sb-face sb-back">{print(i === 0 ? 0 : 2)}</div>
          </div>
        ))}
      </div>
      <footer>
        <button
          type="button"
          aria-label="Previous spread"
          disabled={!active || leaf === 0}
          onClick={(e) => turn(leaf - 1, e.detail === 0)}
        >
          ←
        </button>
        <span aria-live="polite">{leaf === 0 ? "Cover" : `${leaf} / 2`}</span>
        <button
          type="button"
          aria-label={leaf === 2 ? "Close book" : "Next spread"}
          disabled={!active}
          onClick={(e) => turn(leaf === 2 ? 0 : leaf + 1, e.detail === 0)}
        >
          {leaf === 2 ? "↶" : "→"}
        </button>
      </footer>
      <span className="sb-sr">
        {leaf === 0
          ? "Flora: four botanical plates"
          : `${plates[(leaf - 1) * 2][1]} and ${plates[(leaf - 1) * 2 + 1][1]}`}
      </span>
      <style>{`.sf-specimen-book{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;background:radial-gradient(ellipse at 30% 20%,#d8d8ce,#b7b9ac);color:#273b28;font-family:Georgia,serif}.sf-specimen-book *{box-sizing:border-box}.sf-specimen-book .sb-volume{position:absolute;left:calc(50% - 83px);top:40px;width:166px;height:248px;perspective:1700px;transform-style:preserve-3d;transition:transform 540ms cubic-bezier(.22,1,.36,1)}.sf-specimen-book .sb-board{transform:translateZ(-1px);position:absolute;inset:-4px -5px -7px -3px;border-radius:1px 4px 4px 1px;background:#233c2c;box-shadow:1px 2px 1px #32402a66,3px 8px 7px #26332126,8px 22px 24px #1725182c}.sf-specimen-book .sb-block{position:absolute;inset:1px -2px -3px 1px;border-radius:0 3px 3px 0;background:repeating-linear-gradient(0deg,#d8d3c0 0 1px,#f0ebdc 1px 2px);box-shadow:1px 1px 1px #817e6b;transform:translateZ(-.6px)}.sf-specimen-book .sb-leaf{position:absolute;inset:0;transform-origin:left center;transform-style:preserve-3d;transition:transform 640ms cubic-bezier(.32,.72,0,1)}.sf-specimen-book .sb-face{position:absolute;inset:0;backface-visibility:hidden;background:#f4f0e5;border-radius:0 2px 2px 0;overflow:hidden;box-shadow:0 1px 1px #50463440,2px 4px 6px #332c1d25;padding:8px 10px;display:flex;align-items:center;justify-content:center}.sf-specimen-book .sb-base{transform:translateZ(-.5px)}.sf-specimen-book .sb-face:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#211b132e,transparent 3%,#ffffff24 7%,transparent 15%,transparent 85%,#60503a0b);pointer-events:none}.sf-specimen-book .sb-back{transform:rotateY(180deg);border-radius:2px 0 0 2px}.sf-specimen-book .sb-leaf-0 .sb-back{box-shadow:0 0 0 3px #2c4631,0 1px 2px 3px #22302320}.sf-specimen-book .sb-back:after{background:linear-gradient(270deg,#211b1333,transparent 4%,#ffffff24 8%,transparent 17%)}.sf-specimen-book .sb-face img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}.sf-specimen-book .sb-cover{padding:23px 18px;flex-direction:column;background:repeating-linear-gradient(0deg,#ffffff02 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,#00000008 0 1px,transparent 1px 3px),#24472e;color:#d4c796;box-shadow:inset 0 0 0 1px #607054,2px 4px 6px #28302030}.sf-specimen-book .sb-cover:after{background:linear-gradient(90deg,#10241399,#435a4122 3%,#9cab643b 5%,transparent 9%)}.sf-specimen-book .sb-cover strong{font:normal 30px Georgia,serif;letter-spacing:.1em;text-shadow:0 1px 0 #0c2a17}.sf-specimen-book .sb-cover svg{width:88px;height:144px;margin:6px 0}.sf-specimen-book .sb-cover small{font:9px Georgia,serif;letter-spacing:.02em}.sf-specimen-book footer{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:18px;font:11px Arial,sans-serif}.sf-specimen-book footer span{min-width:30px;text-align:center}.sf-specimen-book button{width:44px;height:44px;border:1px solid #4f5c4135;border-radius:50%;background:#f8f8ec35;color:inherit;font-size:19px;cursor:pointer;transition:background 150ms ease;touch-action:manipulation}.sf-specimen-book button:hover:not(:disabled){background:#fff7}.sf-specimen-book button:active:not(:disabled){background:#87968040}.sf-specimen-book button:disabled{opacity:.3;cursor:default}.sf-specimen-book button:focus-visible{outline:2px solid #173e2c;outline-offset:3px}.sf-specimen-book[data-calm=true] .sb-volume,.sf-specimen-book[data-calm=true] .sb-leaf{transition:none}.sf-specimen-book .sb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}`}</style>
    </section>
  )
}
