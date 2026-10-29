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

import { useId, useState } from "react"

const formats = [
  { label: "4:5", name: "Portrait", width: 198.4, height: 248, left: 203 },
  { label: "1:1", name: "Square", width: 250, height: 250, left: 155 },
  { label: "16:9", name: "Wide", width: 396, height: 222.75, left: 12 },
]

export default function FrameCrop({ active = true }: { active?: boolean }) {
  const id = useId()
  const [selected, setSelected] = useState(2)
  const format = formats[selected]
  const x = format.left
  const y = (278 - format.height) / 2

  return (
    <section className="sf-frame-crop" data-active={active} aria-label="Art print format preview">
      <div className="fc-aperture-stage">
        <img
          className="fc-image-context"
          src="/motion/assets/fuji-storm.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <div className="fc-aperture" style={{ clipPath: `inset(${y}px ${420 - x - format.width}px ${y}px ${x}px)` }}>
          <img
            src="/motion/assets/fuji-storm.webp"
            alt="Snow-capped Mount Fuji above lightning and clouds in a Japanese woodblock print"
            draggable={false}
          />
        </div>
        <div className="fc-crop-edge" aria-hidden="true">
          {[0, 1, 2, 3].map((corner) => (
            <i
              key={corner}
              style={{
                transform: `translate(${x + (corner % 2) * format.width}px, ${
                  y + Math.floor(corner / 2) * format.height
                }px)`,
              }}
            />
          ))}
        </div>
      </div>
      <fieldset className="fc-formats">
        <legend>Image format</legend>
        {formats.map((item, index) => (
          <label key={item.label} className="fc-option">
            <input
              type="radio"
              name={id}
              value={item.label}
              checked={selected === index}
              onChange={() => setSelected(index)}
              aria-label={`${item.name}, ${item.label}`}
            />
            <span className="fc-format-content">
              <span
                className="fc-format-icon"
                style={{
                  width: index === 2 ? 20 : index === 1 ? 15 : 12,
                  height: index === 0 ? 16 : index === 1 ? 15 : 12,
                }}
                aria-hidden="true"
              />
              {item.label}
            </span>
          </label>
        ))}
      </fieldset>
      <style>{`
.sf-frame-crop{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;background:#f6f6f4;color:#162634;font-family:Arial,sans-serif;box-sizing:border-box}
.sf-frame-crop *{box-sizing:border-box}
.sf-frame-crop .fc-aperture-stage{position:absolute;left:50%;top:23px;width:420px;height:278px;transform:translateX(-50%)}
.sf-frame-crop .fc-aperture{position:absolute;inset:0;transition:clip-path 620ms cubic-bezier(.22,.8,.18,1);background:#1c5a68}
.sf-frame-crop .fc-aperture img,.sf-frame-crop .fc-image-context{position:absolute;width:420px;height:290.4626px;max-width:none;left:0;top:-6.2313px;object-fit:cover;user-select:none}
.sf-frame-crop .fc-image-context{opacity:.19}
.sf-frame-crop .fc-aperture-stage{overflow:visible}.sf-frame-crop .fc-image-context{clip-path:inset(6.2313px 0)}
.sf-frame-crop .fc-crop-edge{position:absolute;inset:0;pointer-events:none}
.sf-frame-crop .fc-crop-edge i{position:absolute;width:12px;height:12px;transition:transform 620ms cubic-bezier(.22,.8,.18,1);border-color:#132c3d;border-style:solid;border-width:0}
.sf-frame-crop .fc-crop-edge i:nth-child(1){left:-5px;top:-5px;border-left-width:1px;border-top-width:1px}.sf-frame-crop .fc-crop-edge i:nth-child(2){left:-7px;top:-5px;border-right-width:1px;border-top-width:1px}.sf-frame-crop .fc-crop-edge i:nth-child(3){left:-5px;top:-7px;border-left-width:1px;border-bottom-width:1px}.sf-frame-crop .fc-crop-edge i:nth-child(4){left:-7px;top:-7px;border-right-width:1px;border-bottom-width:1px}
.sf-frame-crop .fc-formats{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);margin:0;border:1px solid #e0e5e9;padding:3px;display:flex;gap:2px;border-radius:12px;background:#fff;box-shadow:0 1px 2px #12263a06}
.sf-frame-crop .fc-formats legend{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.sf-frame-crop .fc-option{position:relative;display:block;cursor:pointer;touch-action:manipulation}
.sf-frame-crop .fc-option input{position:absolute;inset:0;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}
.sf-frame-crop .fc-format-content{height:44px;min-width:78px;padding:0 12px;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:9px;color:#74818a;font:11px Arial,sans-serif;transition:background-color 160ms ease,color 160ms ease}
.sf-frame-crop .fc-format-icon{display:block;border:1px solid currentColor;border-radius:2px}
.sf-frame-crop .fc-option input:checked+.fc-format-content{background:#eaf0f7;color:#143557}
.sf-frame-crop .fc-option input:focus-visible+.fc-format-content{outline:2px solid #2458a5;outline-offset:3px}
@media(hover:hover){.sf-frame-crop .fc-option:hover .fc-format-content{color:#143557;background:#f1f4f7}}
.sf-frame-crop .fc-option:active .fc-format-content{background:#e1e9f2}
.sf-frame-crop[data-active=false] *{transition:none!important}
@media(prefers-reduced-motion:reduce){.sf-frame-crop *{transition:none!important}}

`}</style>
    </section>
  )
}
