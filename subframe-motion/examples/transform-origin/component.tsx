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

import { useState } from "react"
export default function TransformOrigin({ active = true }: { active?: boolean }) {
  const [origin, setOrigin] = useState(4),
    [turned, setTurned] = useState(true),
    [instant, setInstant] = useState(false)
  const x = (origin % 3) * 50,
    y = Math.floor(origin / 3) * 50
  return (
    <div className="sf-pivot" data-active={active} data-instant={instant}>
      <style>{`
.sf-pivot{height:100%;min-height:300px;display:flex;align-items:center;justify-content:center;gap:50px;background:#e5e9f0;color:#273a65;font-family:Arial,sans-serif;overflow:hidden}.sf-pivot *{box-sizing:border-box}.sf-pivot-object{position:relative;width:118px;height:145px}.sf-pivot-ghost{position:absolute;inset:0;border:1px dashed #8e9bb2;border-radius:4px}.sf-pivot-sheet{position:absolute;inset:0;background:linear-gradient(135deg,#4e70b3,#2c4683);border-radius:4px;box-shadow:4px 9px 15px #17346726,inset 0 1px #99b6ef;transition:transform 400ms cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;justify-content:center;padding:22px;color:#e8efff}.sf-pivot-sheet strong{font:italic 28px Georgia;line-height:1}.sf-pivot-sheet i{height:1px;background:#afc0e366;margin-top:14px}.sf-pivot-pin{position:absolute;width:9px;height:9px;border:2px solid #fff;background:#e89168;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 1px #ad7758;z-index:2}.sf-pivot-controls{display:flex;align-items:center;flex-direction:column;gap:20px}.sf-pivot-grid{display:grid;grid-template-columns:repeat(3,30px);padding:8px;background:#f8f9fb;border:1px solid #c8d1df;border-radius:8px;box-shadow:0 3px 10px #263b5a12}.sf-pivot-grid button{width:30px;height:30px;border:0;background:none;cursor:pointer;display:grid;place-items:center;border-radius:4px}.sf-pivot-grid button:after{content:"";width:5px;height:5px;border-radius:50%;background:#9ba9bf}.sf-pivot-grid button[aria-pressed=true]{background:#e5ebf5}.sf-pivot-grid button[aria-pressed=true]:after{background:#3b62a6;box-shadow:0 0 0 3px #a7bedf66}.sf-pivot-toggle{border:1px solid #b8c5d8;border-radius:20px;min-height:36px;padding:0 13px;color:#3e5578;background:#f4f6fa;font:11px Arial;cursor:pointer}.sf-pivot button:focus-visible{outline:2px solid #4d6fac;outline-offset:2px}.sf-pivot[data-active=false] *,.sf-pivot[data-instant=true] *{transition:none}@media(prefers-reduced-motion:reduce){.sf-pivot *{transition:none}}@media(max-width:370px){.sf-pivot{gap:30px}}
`}</style>
      <div className="sf-pivot-object">
        <div className="sf-pivot-ghost" />
        <div
          className="sf-pivot-sheet"
          style={{ transformOrigin: `${x}% ${y}%`, transform: `rotate(${turned ? -20 : 0}deg)` }}
        >
          <strong>
            Field
            <br />
            notes
          </strong>
          <i />
          <i />
        </div>
        <div className="sf-pivot-pin" style={{ left: `${x}%`, top: `${y}%` }} />
      </div>
      <div className="sf-pivot-controls">
        <div className="sf-pivot-grid" aria-label="Transform origin">
          {Array.from({ length: 9 }, (_, i) => (
            <button
              type="button"
              key={i}
              aria-label={`${["Top", "Center", "Bottom"][Math.floor(i / 3)]} ${["left", "center", "right"][i % 3]}`}
              aria-pressed={origin === i}
              onClick={(e) => {
                setInstant(e.detail === 0)
                setOrigin(i)
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="sf-pivot-toggle"
          onClick={(e) => {
            setInstant(e.detail === 0)
            setTurned(!turned)
          }}
        >
          Rotate {turned ? "back" : "−20°"}
        </button>
      </div>
    </div>
  )
}
