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

import { useCallback, useEffect, useRef, useState } from "react"

const limit = (x: number, y: number) => {
  const scale = 1 / Math.max(1, Math.hypot(x, y))
  return { x: x * scale, y: y * scale }
}
const neutral = { x: 0, y: 0 }

export default function SpringJoystick({ active = true }: { active?: boolean }) {
  const [point, setPoint] = useState(neutral)
  const [dragging, setDragging] = useState(false)
  const [instant, setInstant] = useState(false)
  const pad = useRef<HTMLButtonElement>(null)
  const pointer = useRef<number | null>(null)
  const keys = useRef(new Set<string>())
  const move = (x: number, y: number) => {
    const rect = pad.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    setPoint(
      limit(
        (x - rect.left - rect.width / 2) / (rect.width * 0.32),
        (y - rect.top - rect.height / 2) / (rect.height * 0.32),
      ),
    )
  }
  const release = useCallback(() => {
    const id = pointer.current
    pointer.current = null
    keys.current.clear()
    setDragging(false)
    setPoint(neutral)
    if (id !== null && pad.current?.hasPointerCapture(id)) {
      pad.current.releasePointerCapture(id)
    }
  }, [])
  useEffect(() => {
    if (!active) {
      release()
    }
  }, [active, release])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        release()
      }
    }
    window.addEventListener("blur", release)
    document.addEventListener("visibilitychange", hide)
    return () => {
      window.removeEventListener("blur", release)
      document.removeEventListener("visibilitychange", hide)
    }
  }, [release])
  const keyboardPoint = () =>
    setPoint(
      limit(
        (Number(keys.current.has("ArrowRight")) - Number(keys.current.has("ArrowLeft"))) * 0.75,
        (Number(keys.current.has("ArrowDown")) - Number(keys.current.has("ArrowUp"))) * 0.75,
      ),
    )
  const angle = (value: number) =>
    `${value < -0.01 ? "−" : "+"}${Math.abs(value * 30)
      .toFixed(0)
      .padStart(2, "0")}°`
  return (
    <div className="sf-gimbal" data-drag={dragging} data-instant={instant} data-active={active}>
      <style>{`
.sf-gimbal{height:100%;min-height:300px;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at 40% 15%,#e2e5e6,#ccd1d2);font-family:Arial,sans-serif;color:#252c2e;-webkit-font-smoothing:antialiased}
.sf-gimbal *{box-sizing:border-box}.sf-gimbal button{-webkit-tap-highlight-color:transparent}
.sf-gimbal-case{position:relative;width:370px;padding:25px 25px 21px;border:1px solid #929b9f;border-radius:13px;background:linear-gradient(115deg,#f1f3f2 0%,#d8dddf 38%,#b9c0c2 100%);box-shadow:inset 0 1px 1px #fff,inset 1px 0 1px #ffffffbb,inset -1px -1px 1px #687176,0 3px #8b9599,0 4px 1px #677177,0 6px 4px #35404744,3px 14px 14px -6px #27323955,8px 28px 30px -16px #28383e77}
.sf-gimbal-case:before,.sf-gimbal-case:after{content:"";position:absolute;top:9px;width:6px;height:6px;border:1px solid #717b7d;border-radius:50%;background:linear-gradient(135deg,#dce2e2 41%,#757f83 43% 55%,#d4dada 58%);box-shadow:0 1px #fff8,inset 0 1px 1px #66727566}.sf-gimbal-case:before{left:10px}.sf-gimbal-case:after{right:10px}
.sf-gimbal-top{display:flex;align-items:center;justify-content:space-between;margin:0 0 17px;font-size:8px;letter-spacing:1.5px;font-weight:700;text-shadow:0 1px #fff8}
.sf-gimbal-body{display:grid;grid-template-columns:160px 128px;gap:29px;align-items:center}
.sf-gimbal-screen{height:130px;position:relative;border:4px solid #525d60;border-radius:7px;background:#131e22;box-shadow:0 1px #ffffffba,-1px -1px 1px #b3bcbf,inset 0 2px 5px #000;overflow:hidden;color:#b2d4d2}
.sf-gimbal-screen:after{content:"";position:absolute;inset:0;border:1px solid #142024;border-radius:3px;background:linear-gradient(130deg,#f1ffff18,transparent 45%,transparent 75%,#ffffff07);pointer-events:none}
.sf-gimbal-screen svg{position:absolute;inset:0;width:100%;height:100%}
.sf-gimbal-cross{position:absolute;left:calc(50% - 17px);top:calc(50% - 17px);width:34px;height:34px;transition:transform 450ms cubic-bezier(.2,1.25,.3,1);filter:drop-shadow(0 0 3px #9fe1de44)}
.sf-gimbal-screen-label{position:absolute;left:8px;top:8px;font:7px ui-monospace,monospace;letter-spacing:1px;display:flex;align-items:center;gap:5px}.sf-gimbal-screen-label i{width:3px;height:3px;border-radius:50%;background:#a5cdba;box-shadow:0 0 4px #addec37a}
.sf-gimbal-readouts{display:flex;justify-content:space-between;margin-top:12px;padding:0 1px;font:8px ui-monospace,SFMono-Regular,Consolas,monospace;font-variant-numeric:tabular-nums;color:#596468}.sf-gimbal-readouts span{display:flex;align-items:center;gap:8px}.sf-gimbal-readouts output{font-size:11px;color:#25373c;text-shadow:0 1px #fff8}
.sf-gimbal-pad{position:relative;width:128px;height:142px;border:1px solid #818b8e;border-radius:10px;background:linear-gradient(120deg,#a1aaad,#eef1ef);box-shadow:inset 1px 2px 2px #66727566,0 1px #fff9;padding:0;cursor:grab;touch-action:none;outline-offset:5px;perspective:450px;align-self:start}
.sf-gimbal-pad:active{cursor:grabbing}.sf-gimbal-pad:focus-visible{outline:2px solid #b4421e}
.sf-gimbal-well{position:absolute;inset:5px;border:1px solid #242b2d;border-radius:7px;background:linear-gradient(130deg,#303a3d,#0e161a);box-shadow:inset 1px 2px 6px #0009,0 1px 1px #eef5f4a8}
.sf-gimbal-fold{position:absolute;inset:13px 12px 14px;border-radius:9px;border:3px solid #283339;background:linear-gradient(130deg,#424d52,#162127 65%);box-shadow:inset 0 1px 1px #71818799,inset 0 -2px 2px #071014,0 2px 2px #071016bb;transition:transform 450ms cubic-bezier(.2,1.25,.3,1)}
.sf-gimbal-fold:nth-child(3){inset:23px 22px 24px;border-radius:8px}.sf-gimbal-fold:nth-child(4){inset:33px 32px 34px;border-radius:7px}
.sf-gimbal-grip{position:absolute;left:32px;top:34px;width:64px;height:68px;border-radius:10px 10px 12px 12px;background:linear-gradient(130deg,#fc9f5d,#e96c32 30%,#b13d18 88%);box-shadow:inset 0 1px 1px #ffe2be,inset 1px 0 1px #ffb57d,inset -1px -2px 1px #6f260fee,0 3px #84321f,0 4px 2px #081015cc,3px 10px 5px -2px #061115bd,9px 17px 12px -4px #061015b5;transition:transform 450ms cubic-bezier(.2,1.25,.3,1);pointer-events:none;transform-style:preserve-3d}
.sf-gimbal-grip:before{content:"";position:absolute;inset:6px 7px 9px;border-radius:6px;background:linear-gradient(150deg,#d05426,#ee783b 68%,#f7934d);box-shadow:inset 1px 2px 4px #73301244,inset -1px -1px 1px #ffb1776b}
.sf-gimbal-ribs{position:absolute;inset:18px 15px;display:flex;flex-direction:column;justify-content:space-between}.sf-gimbal-ribs i{height:2px;border-radius:1px;background:#a441207d;box-shadow:0 1px #ffb37a55}
.sf-gimbal[data-drag=true] .sf-gimbal-fold,.sf-gimbal[data-drag=true] .sf-gimbal-grip,.sf-gimbal[data-drag=true] .sf-gimbal-cross,.sf-gimbal[data-instant=true] *,.sf-gimbal[data-active=false] *{transition:none}
@media(prefers-reduced-motion:reduce){.sf-gimbal *{transition:none}}
@media(max-width:410px){.sf-gimbal-case{transform:scale(.85)}}
`}</style>
      <div className="sf-gimbal-case">
        <div className="sf-gimbal-top" aria-hidden="true">
          <span>CAMERA POSITION</span>
        </div>
        <div className="sf-gimbal-body">
          <div>
            <div className="sf-gimbal-screen" aria-hidden="true">
              <svg viewBox="0 0 152 122" fill="none">
                <path
                  d="M25 0V122M51 0V122M76 0V122M101 0V122M127 0V122M0 35H152M0 61H152M0 87H152"
                  stroke="#648486"
                  strokeOpacity=".17"
                  strokeWidth=".6"
                />
                <path
                  d="M76 16V106M20 61H132"
                  stroke="#739a9c"
                  strokeOpacity=".45"
                  strokeWidth=".7"
                  strokeDasharray="2 3"
                />
                <path d="M13 39V28H24M128 28H139V39M13 84V95H24M128 95H139V84" stroke="#799395" strokeWidth=".75" />
              </svg>
              <div className="sf-gimbal-screen-label">
                <i /> PAN / TILT
              </div>
              <div className="sf-gimbal-cross" style={{ transform: `translate(${point.x * 43}px,${point.y * 32}px)` }}>
                <svg viewBox="0 0 34 34" fill="none" stroke="currentColor">
                  <path d="M0 9V0H9M25 0H34V9M0 25V34H9M25 34H34V25M12 17H22M17 12V22" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
            <div className="sf-gimbal-readouts">
              <span>
                PAN <output aria-live="off">{angle(point.x)}</output>
              </span>
              <span>
                TILT <output aria-live="off">{angle(-point.y)}</output>
              </span>
            </div>
          </div>
          <div>
            <button
              type="button"
              ref={pad}
              className="sf-gimbal-pad"
              aria-label="Pan and tilt joystick. Drag or hold arrow keys; release to center."
              onPointerDown={(event) => {
                if (event.button !== 0 || pointer.current !== null) {
                  return
                }
                pointer.current = event.pointerId
                event.currentTarget.setPointerCapture(event.pointerId)
                setInstant(false)
                setDragging(true)
                move(event.clientX, event.clientY)
              }}
              onPointerMove={(event) => {
                if (pointer.current === event.pointerId) {
                  move(event.clientX, event.clientY)
                }
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onLostPointerCapture={release}
              onBlur={release}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
                  return
                }
                event.preventDefault()
                setInstant(true)
                keys.current.add(event.key)
                keyboardPoint()
              }}
              onKeyUp={(event) => {
                if (!keys.current.has(event.key)) {
                  return
                }
                event.preventDefault()
                keys.current.delete(event.key)
                keyboardPoint()
              }}
            >
              <span className="sf-gimbal-well" aria-hidden="true" />
              {[0.13, 0.3, 0.5].map((scale, index) => (
                <span
                  key={index}
                  className="sf-gimbal-fold"
                  aria-hidden="true"
                  style={{ transform: `translate(${point.x * 29 * scale}px,${point.y * 29 * scale}px)` }}
                />
              ))}
              <span
                className="sf-gimbal-grip"
                aria-hidden="true"
                style={{
                  transform: `translate(${point.x * 27}px,${point.y * 27}px) rotateX(${-point.y * 13}deg) rotateY(${
                    point.x * 13
                  }deg)`,
                }}
              >
                <span className="sf-gimbal-ribs">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <i key={i} />
                  ))}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
