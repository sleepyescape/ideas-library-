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
export default function InertialLauncher({ active = true }: { active?: boolean }) {
  const [pull, setPull] = useState({ x: 0, y: 0 }),
    [dragging, setDragging] = useState(false)
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [reduced, setReduced] = useState(false)
  const ref = useRef<HTMLDivElement>(null),
    ball = useRef<HTMLButtonElement>(null),
    shadow = useRef<HTMLDivElement>(null),
    shadowAnimation = useRef<Animation | null>(null),
    animation = useRef<Animation | null>(null),
    position = useRef({ x: 0, y: 0 }),
    grab = useRef<{ pointerId: number; x: number; y: number; start: { x: number; y: number } } | null>(null)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)"),
      sync = () => {
        setReduced(q.matches)
        if (q.matches) {
          animation.current?.cancel()
          shadowAnimation.current?.cancel()
        }
      }
    sync()
    q.addEventListener("change", sync)
    return () => q.removeEventListener("change", sync)
  }, [])
  useEffect(() => {
    if (active) {
      if (animation.current?.playState === "paused") {
        animation.current.play()
      }
      if (shadowAnimation.current?.playState === "paused") {
        shadowAnimation.current.play()
      }
    } else {
      animation.current?.pause()
      shadowAnimation.current?.pause()
    }
  }, [active])
  useEffect(
    () => () => {
      animation.current?.cancel()
      shadowAnimation.current?.cancel()
    },
    [],
  )
  const launch = (offset = position.current) => {
    setDragging(false)
    grab.current = null
    position.current = { x: 0, y: 0 }
    setPull(position.current)
    setScale({ x: 1, y: 1 })
    animation.current?.cancel()
    shadowAnimation.current?.cancel()
    if (!active || reduced) {
      return
    }
    const horizontalLimit = Math.max(0, Math.min(105, ((ref.current?.clientWidth ?? 320) - 84) / 2 - 12))
    const x = Math.max(-horizontalLimit, Math.min(horizontalLimit, -offset.x * 1.35))
    const height = 42 + Math.abs(offset.y) * 0.8
    const frames = [
      { x: offset.x, y: offset.y, sx: scale.x, sy: scale.y, at: 0, ease: "cubic-bezier(.2,.7,.35,1)" },
      { x, y: -height, sx: 0.99, sy: 1.01, at: 0.29, ease: "cubic-bezier(.55,0,.9,.45)" },
      { x: x * 0.65, y: 0, sx: 1.08, sy: 0.92, at: 0.53, ease: "cubic-bezier(.2,.7,.35,1)" },
      { x: x * 0.35, y: -height * 0.3, sx: 0.99, sy: 1.01, at: 0.7, ease: "cubic-bezier(.55,0,.9,.45)" },
      { x: x * 0.12, y: 0, sx: 1.025, sy: 0.975, at: 0.85, ease: "cubic-bezier(.2,.7,.35,1)" },
      { x: 0, y: 0, sx: 1, sy: 1, at: 1, ease: "linear" },
    ]
    animation.current =
      ball.current?.animate(
        frames.map((frame) => ({
          transform: `translate(${frame.x}px,${frame.y}px) scale(${frame.sx},${frame.sy})`,
          offset: frame.at,
          easing: frame.ease,
        })),
        { duration: 1100 },
      ) ?? null
    shadowAnimation.current =
      shadow.current?.animate(
        frames.map((frame) => ({
          transform: `translateX(${frame.x}px) scale(${1 + Math.max(0, -frame.y) / 140})`,
          opacity: 1 - Math.min(0.65, Math.max(0, -frame.y) / 140),
          offset: frame.at,
          easing: frame.ease,
        })),
        { duration: 1100 },
      ) ?? null
  }

  return (
    <div className="sf-launch" ref={ref} data-drag={dragging}>
      <style>{`
.sf-launch { position:relative; height:100%; min-height:300px; overflow:hidden; display:grid; place-items:center; background:#f7f6f3; font:12px Arial,sans-serif; }
.sf-launch * { box-sizing:border-box; }
.sf-launch-shadow { position:absolute; left:calc(50% - 37px); top:calc(50% + 39px); width:74px; height:8px; border-radius:50%; background:#4a362623; filter:blur(5px); pointer-events:none; }
.sf-launch-shadow:before { content:""; position:absolute; inset:-7px -15px; border-radius:50%; background:#60422a14; filter:blur(7px); }
.sf-launch-shadow:after { content:""; position:absolute; inset:2px 13px; border-radius:50%; background:#311c184d; filter:blur(1px); }
.sf-launch-ball { position:relative; width:84px; height:84px; padding:0; border:0; border-radius:50%; background:radial-gradient(ellipse at 29% 19%,#ffbb94 0%,#f89c71 13%,#e46640 39%,#bc3f29 65%,#8c2b21 87%,#6f2922 100%); box-shadow:inset -3px -4px 5px #5c211a40,inset 1px 1px 2px #ffcf9c88; cursor:grab; touch-action:none; -webkit-tap-highlight-color:transparent; }
.sf-launch-ball:before { content:""; position:absolute; top:10px; left:17px; width:26px; height:12px; border-radius:50%; transform:rotate(-35deg); background:linear-gradient(150deg,#ffe7c8b3,#ffe0bd00 85%); filter:blur(1.5px); }
.sf-launch-ball:after { content:""; position:absolute; inset:1px; border-radius:50%; box-shadow:inset 0 -2px 3px #ffe4c026; background:radial-gradient(ellipse at 69% 81%,#ffb27714,transparent 42%); }
.sf-launch-ball:focus-visible { outline:2px solid #ac482b; outline-offset:8px; }
.sf-launch[data-drag=true] .sf-launch-ball { cursor:grabbing; }
`}</style>
      <div
        ref={shadow}
        className="sf-launch-shadow"
        aria-hidden="true"
        style={{
          transform: `translateX(${pull.x}px) scale(${1 + Math.max(0, -pull.y) / 140})`,
          opacity: 1 - Math.min(0.65, Math.max(0, -pull.y) / 140),
        }}
      />
      <button
        ref={ball}
        type="button"
        className="sf-launch-ball"
        aria-label="Pull and release the ball. Press Enter to bounce."
        style={{ transform: `translate(${pull.x}px,${pull.y}px) scale(${scale.x},${scale.y})` }}
        onPointerDown={(e) => {
          if (grab.current) {
            return
          }
          const matrix = new DOMMatrixReadOnly(getComputedStyle(e.currentTarget).transform)
          const start = { x: matrix.m41, y: matrix.m42 }
          position.current = start
          grab.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, start }
          setPull(start)
          setScale({ x: matrix.m11, y: matrix.m22 })
          animation.current?.cancel()
          shadowAnimation.current?.cancel()
          animation.current = null
          shadowAnimation.current = null
          setDragging(true)
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const gesture = grab.current
          if (!gesture || gesture.pointerId !== e.pointerId) {
            return
          }
          const { start } = gesture
          const area = ref.current!
          const bounds = area.getBoundingClientRect()
          const dx = ((e.clientX - gesture.x) * area.clientWidth) / bounds.width
          const dy = ((e.clientY - gesture.y) * area.clientHeight) / bounds.height
          position.current = {
            x: Math.max(Math.min(-65, start.x), Math.min(Math.max(65, start.x), start.x + dx)),
            y: Math.max(Math.min(-65, start.y), Math.min(Math.max(65, start.y), start.y + dy)),
          }
          setPull(position.current)
        }}
        onPointerUp={(e) => {
          if (grab.current?.pointerId === e.pointerId) {
            launch()
          }
        }}
        onPointerCancel={() => {
          grab.current = null
          position.current = { x: 0, y: 0 }
          setDragging(false)
          setPull(position.current)
          setScale({ x: 1, y: 1 })
        }}
        onLostPointerCapture={() => {
          if (grab.current) {
            grab.current = null
            position.current = { x: 0, y: 0 }
            setDragging(false)
            setPull(position.current)
            setScale({ x: 1, y: 1 })
          }
        }}
        onClick={(e) => {
          if (e.detail === 0) {
            launch({ x: 0, y: 0 })
          }
        }}
      />
    </div>
  )
}
