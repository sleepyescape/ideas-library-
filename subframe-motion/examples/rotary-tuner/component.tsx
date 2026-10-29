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

import { useRef, useState } from "react"

const stations = [
  { name: "Sonder", frequency: "88.4" },
  { name: "Night service", frequency: "92.6" },
  { name: "Open frequency", frequency: "97.2" },
  { name: "Small hours", frequency: "103.8" },
  { name: "Common ground", frequency: "107.1" },
]

export default function RotaryTuner({ active = true }: { active?: boolean }) {
  const [station, setStation] = useState(2)
  const [rotation, setRotation] = useState(0)
  const [instant, setInstant] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{
    x: number
    scale: number
    rotation: number
    angle: number
    angular: boolean
    pointerId: number
  } | null>(null)
  const finish = () => {
    if (!drag.current) {
      return
    }
    drag.current = null
    setDragging(false)
    setRotation(-120 + station * 60)
  }
  return (
    <div
      className="sf-tuner"
      data-active={active}
      data-instant={instant}
      data-dragging={dragging}
      data-wide={stations[station].frequency.length > 4}
    >
      <style>{`
.sf-tuner{height:100%;min-height:300px;display:grid;place-items:center;background:#efefec;font-family:Arial,sans-serif;color:#31342f;overflow:hidden}
.sf-tuner *{box-sizing:border-box}
.sf-tuner-body{position:relative;width:min(342px,90%);padding:21px 22px 17px;border:1px solid #c8cac3;border-radius:11px;background:linear-gradient(125deg,#f5f5f0 0%,#e7e7df 62%,#dddfd6);box-shadow:inset 0 1px 1px #fff,inset 1px 0 1px #fff9,inset -1px -2px 2px #8e958045,0 1px 1px #353a3526,1px 3px 3px #343b3221,4px 10px 10px -5px #343b3226,9px 24px 25px -12px #303a3047;display:grid;grid-template-columns:minmax(0,1fr) 108px;column-gap:22px;align-items:center}
.sf-tuner-body:before{content:"";position:absolute;inset:4px;border:1px solid #fff6;border-bottom-color:#a8ac9e55;border-right-color:#a8ac9e55;border-radius:7px;pointer-events:none}


.sf-tuner-grille{position:relative;align-self:stretch;min-height:132px;border-radius:3px;background:radial-gradient(circle at 50% 40%,#18221d 0 1px,#778072 1.35px,#f7f8f1 1.75px,#e3e6dd 2px) 0 0/5px 5px;box-shadow:inset 0 1px 2px #505d5140,0 1px #fff8;overflow:hidden}
.sf-tuner-grille:after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,#fff2,transparent 45%,#47544415);pointer-events:none}
.sf-tuner-controls{display:flex;flex-direction:column;gap:14px;align-items:center}
.sf-tuner-screen{align-self:stretch;position:relative;border:1px solid #959f85;border-radius:3px;background:linear-gradient(150deg,#c4cda4,#dde1ba 62%,#ccd3ac);color:#37432d;padding:8px 8px 7px;box-shadow:inset 0 2px 3px #47593b55,inset 1px 0 2px #66754a55,0 1px 0 #fff;overflow:hidden}
.sf-tuner-screen:after{content:"";position:absolute;inset:0;background:linear-gradient(145deg,#fff3,transparent 37%,transparent 62%,#fff1);pointer-events:none}
.sf-tuner-screen output{position:relative;display:flex;align-items:baseline;justify-content:space-between;height:31px;font:31px/31px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-2px;font-variant-numeric:tabular-nums;text-shadow:0 1px #edf0d070}
.sf-tuner[data-wide=true] .sf-tuner-screen output{font-size:27px}.sf-tuner-screen small{font:8px/1 Arial,sans-serif;letter-spacing:0}
.sf-tuner-screen p{margin:6px 0 0;font:8px/1.2 Arial,sans-serif;white-space:nowrap;letter-spacing:.15px}
.sf-tuner-knob{position:relative;width:88px;height:88px;border-radius:50%;cursor:grab;touch-action:none;user-select:none;outline-offset:6px;display:grid;place-items:center;background:linear-gradient(135deg,#b1b5a9,#fffef4 58%,#f5f5ed);box-shadow:inset 1px 2px 3px #616d5652,0 1px #fff;isolation:isolate}
.sf-tuner-knob:before{content:"";position:absolute;inset:5px;border-radius:50%;background:#27372f;box-shadow:0 1px 1px #19271d80,1px 3px 3px #15201955,3px 7px 5px -2px #23312466,7px 12px 10px -5px #26322270}
.sf-tuner-rim{position:absolute;inset:6px;border-radius:50%;background:repeating-conic-gradient(from 2deg,#6b7c6f 0deg 1deg,#334b3c 2deg 4deg,#1d3026 5deg 7deg);box-shadow:inset 0 1px #9eac9b,inset 0 -2px 2px #0b1a1380;pointer-events:none}
.sf-tuner-face{position:absolute;inset:11px;border-radius:50%;background:linear-gradient(140deg,#637a65,#405946 48%,#2f4739);box-shadow:inset 0 1px 1px #b7c9ae8c,inset 1px 0 #a4b99a40,inset 0 -1px 1px #182e2070,0 0 0 1px #293f31;pointer-events:none}
.sf-tuner-face:after{content:"";position:absolute;inset:7px;border-radius:50%;background:radial-gradient(ellipse at 70% 90%,#82977d19,transparent 65%);box-shadow:inset 1px 2px 4px #1f35242b,inset -1px -1px 1px #c5d2bc0f}
.sf-tuner-knob i{position:absolute;inset:12px;display:block;border-radius:50%;transition:transform 200ms cubic-bezier(.22,1,.36,1);pointer-events:none}
.sf-tuner-knob i:after{content:"";position:absolute;width:2px;height:10px;background:#f4e4b7;left:calc(50% - 1px);top:5px;border-radius:1px;box-shadow:1px 0 1px #1a2d2490}
.sf-tuner-knob:focus-visible{outline:2px solid #2d684e}
.sf-tuner[data-dragging=true] .sf-tuner-knob{cursor:grabbing}



.sf-tuner[data-active=false] i,.sf-tuner[data-instant=true] i,.sf-tuner[data-dragging=true] i{transition:none}
@media(prefers-reduced-motion:reduce){.sf-tuner i{transition:none}}
@media(max-width:380px){.sf-tuner-body{padding:19px 18px 16px;column-gap:17px;grid-template-columns:minmax(0,1fr) 99px}.sf-tuner-screen output{font-size:29px}.sf-tuner[data-wide=true] .sf-tuner-screen output{font-size:25px}}
`}</style>
      <div className="sf-tuner-body">
        <div className="sf-tuner-grille" aria-hidden="true" />
        <div className="sf-tuner-controls">
          <div className="sf-tuner-screen">
            <output aria-live="polite">
              {stations[station].frequency}
              <small>FM</small>
            </output>
            <p>{stations[station].name}</p>
          </div>
          <div
            className="sf-tuner-knob"
            role="slider"
            aria-label="Radio station"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={station}
            aria-valuetext={`${stations[station].name}, ${stations[station].frequency} FM`}
            tabIndex={0}
            onPointerDown={(e) => {
              if (e.button !== 0 || drag.current) {
                return
              }
              const r = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - r.left - r.width / 2
              const y = e.clientY - r.top - r.height / 2
              setInstant(false)
              setDragging(true)
              drag.current = {
                x: e.clientX,
                scale: e.currentTarget.offsetWidth / r.width,
                rotation,
                angle: Math.atan2(y, x),
                angular: Math.hypot(x, y) > r.width * 0.23,
                pointerId: e.pointerId,
              }
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              const d = drag.current
              if (!d || e.pointerId !== d.pointerId) {
                return
              }
              let next = d.rotation + (e.clientX - d.x) * d.scale * 2.4
              if (d.angular) {
                const r = e.currentTarget.getBoundingClientRect()
                const angle = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2)
                let delta = ((angle - d.angle) * 180) / Math.PI
                if (delta > 180) {
                  delta -= 360
                }
                if (delta < -180) {
                  delta += 360
                }
                next = d.rotation + delta
                d.angle = angle
                d.rotation = Math.max(-120, Math.min(120, next))
              }
              next = Math.max(-120, Math.min(120, next))
              setRotation(next)
              setStation(Math.round((next + 120) / 60))
            }}
            onPointerUp={finish}
            onPointerCancel={finish}
            onLostPointerCapture={finish}
            onBlur={finish}
            onKeyDown={(e) => {
              if (!["Home", "End", "ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(e.key)) {
                return
              }
              e.preventDefault()
              const next = Math.max(
                0,
                Math.min(
                  4,
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                    ? 4
                    : station + (["ArrowRight", "ArrowUp"].includes(e.key) ? 1 : -1),
                ),
              )
              setInstant(true)
              setStation(next)
              setRotation(-120 + next * 60)
            }}
          >
            <span className="sf-tuner-rim" />
            <span className="sf-tuner-face" />
            <i style={{ transform: `rotate(${rotation}deg)` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
