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

export default function ResponsiveCreature({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const state = useRef({ time: 0, sleep: 0, food: 0, play: 0 })
  const repaint = useRef<() => void>(() => {})
  const [sleeping, setSleeping] = useState(false)
  const [action, setAction] = useState("Awake")
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d")
    if (!el || !ctx) {
      return
    }
    let w = 1,
      h = 1,
      frame = 0,
      last = 0
    function draw() {
      if (!ctx) {
        return
      }
      ctx.clearRect(0, 0, w, h)
      const s = state.current,
        t = s.time,
        r = Math.min(w * 0.27, h * 0.38) * (1 + s.food * 0.15),
        rest = 1 - s.sleep
      const points = Array.from({ length: 42 }, (_, i) => {
        const a = (i / 42) * Math.PI * 2,
          phase = t * (0.5 + s.play) + s.play * 0.8,
          breath = 1 + Math.sin(t * 1.2) * 0.025
        return {
          x:
            w / 2 +
            (Math.cos(a) * (0.77 + rest * 0.18 * Math.sin(a * 3 + phase)) + rest * 0.23 * Math.sin(a * 3 - phase)) *
              r *
              breath,
          y:
            h * 0.5 +
            (Math.sin(a) * (0.85 + rest * 0.15 * Math.cos(a * 2 + phase)) + rest * 0.2 * Math.cos(a * 4 + phase)) *
              r *
              breath,
        }
      })
      ctx.strokeStyle = "#60189d"
      ctx.lineWidth = 1.1
      for (let j = 0; j < 3; j++) {
        ctx.globalAlpha = j === 0 ? 1 : 0.4 * rest
        ctx.beginPath()
        points.forEach((p, i) => {
          const q = points[(i + (j === 0 ? 1 : j === 1 ? 5 : 13)) % points.length]
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
        })
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.fillStyle = "#60189d"
      points.forEach((p, i) => {
        if (i % 3 === 0) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      if (s.food > 0.04) {
        ctx.fillStyle = "#60189d"
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2,
            dist = r * (1 + 0.75 * s.food)
          ctx.beginPath()
          ctx.arc(w / 2 + Math.cos(a) * dist, h * 0.5 + Math.sin(a) * dist, 2 * s.food, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    repaint.current = draw
    const resize = () => {
      if (!el || !ctx) {
        return
      }
      w = el.clientWidth
      h = el.clientHeight
      const d = Math.min(devicePixelRatio || 1, 2)
      const display = el.getBoundingClientRect()
      el.width = Math.max(1, Math.round(display.width * d))
      el.height = Math.max(1, Math.round(display.height * d))
      ctx.setTransform(el.width / Math.max(1, w), 0, 0, el.height / Math.max(1, h), 0, 0)
      draw()
    }
    let resizeFrame = 0
    const scheduleResize = () => {
      cancelAnimationFrame(resizeFrame)
      // Ancestor transforms can settle after layout observers have run.
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(resize)
      })
    }
    const transforms = new MutationObserver(scheduleResize)
    for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", scheduleResize)
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()
    if (reduced || !active) {
      state.current.sleep = sleeping ? 1 : 0
      draw()
    }
    function tick(now: number) {
      const delta = last ? Math.min(now - last, 48) / 1000 : 0
      last = now
      const s = state.current
      s.time += delta
      s.sleep += (Number(sleeping) - s.sleep) * Math.min(1, delta * 5)
      s.food = Math.max(0, s.food - delta * 0.5)
      s.play = Math.max(0, s.play - delta * 0.35)
      draw()
      frame = requestAnimationFrame(tick)
    }
    if (active && !reduced) {
      frame = requestAnimationFrame(tick)
    }
    return () => {
      observer.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", scheduleResize)
      cancelAnimationFrame(resizeFrame)
      cancelAnimationFrame(frame)
      repaint.current = () => {}
    }
  }, [active, reduced, sleeping])
  function feed() {
    state.current.food = 1
    setAction("Nourished")
    repaint.current()
  }
  function play() {
    state.current.play = 1
    setSleeping(false)
    setAction("Playful")
    repaint.current()
  }
  return (
    <section className="sf-responsive-creature">
      <div className="sf-rc-top">
        <strong>Little life</strong>
        <span role="status">{action}</span>
      </div>
      <canvas
        ref={canvas}
        role="img"
        aria-label={sleeping ? "Resting circular organism" : "Awake connected organism"}
      />
      <div className="sf-rc-controls">
        <button type="button" onClick={feed}>
          Feed <span>·</span>
        </button>
        <button
          type="button"
          aria-pressed={sleeping}
          onClick={() => {
            setSleeping(!sleeping)
            setAction(sleeping ? "Awake" : "Resting")
          }}
        >
          {sleeping ? "Wake" : "Rest"}
          <span>{sleeping ? "↗" : "◡"}</span>
        </button>
        <button type="button" onClick={play}>
          Play <span>↝</span>
        </button>
      </div>
      <style>{`.sf-responsive-creature{width:100%;height:100%;min-height:280px;position:relative;overflow:hidden;background:#d1f63a;color:#60189d;font-family:Arial,sans-serif;box-sizing:border-box}.sf-responsive-creature *{box-sizing:border-box}.sf-rc-top{position:absolute;left:24px;right:24px;top:21px;display:flex;align-items:baseline;justify-content:space-between;z-index:1}.sf-rc-top strong{font:italic 23px Georgia,serif;letter-spacing:-.7px}.sf-rc-top>span{font:9px monospace}.sf-responsive-creature canvas{position:absolute;left:0;top:51px;width:100%;height:calc(100% - 113px);display:block}.sf-rc-controls{position:absolute;bottom:14px;left:24px;right:24px;display:flex;gap:0;border-top:1px solid #60189d66}.sf-rc-controls button{flex:1;min-height:44px;border:0;background:none;color:inherit;padding:0 10px;font:11px monospace;display:flex;align-items:center;justify-content:space-between;gap:15px;cursor:pointer}.sf-rc-controls button+button{border-left:1px solid #60189d33}.sf-rc-controls button>span{font:20px Georgia,serif}.sf-rc-controls button[aria-pressed=true]{background:#60189d;color:#d1f63a}.sf-rc-controls button:focus-visible{outline:2px solid #60189d;outline-offset:3px}.sf-rc-controls button:active{background:#60189d18}.sf-rc-controls button[aria-pressed=true]:active{background:#60189d}`}</style>
    </section>
  )
}
