/**
 * MIT License
 * Copyright (c) 2026 Subframe
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
"use client"

import { useEffect, useState } from "react"

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

export default function TypeInstrument({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [glyph, setGlyph] = useState("g")
  const [width, setWidth] = useState(100),
    [lean, setLean] = useState(0),
    [weight, setWeight] = useState(700),
    [scale, setScale] = useState(100)
  const [instant, setInstant] = useState(false)
  const controls = [
    { label: "Width", value: width, min: 60, max: 130, step: 1, set: setWidth },
    { label: "Lean", value: lean, min: -16, max: 16, step: 1, set: setLean },
    { label: "Weight", value: weight, min: 400, max: 700, step: 300, set: setWeight },
    { label: "Scale", value: scale, min: 65, max: 110, step: 1, set: setScale },
  ]
  return (
    <section className="sf-type-instrument" data-instant={!active || reduced || instant}>
      <div className="sf-type-instrument-proof" aria-label="Live type specimen">
        <div className="sf-type-instrument-baseline" />
        <span
          key={glyph}
          style={{ fontWeight: weight, transform: `scaleX(${width / 100}) skewX(${-lean}deg) scale(${scale / 100})` }}
        >
          {glyph}
        </span>
      </div>
      <div className="sf-type-instrument-rack">
        {controls.map((c) => (
          <label key={c.label}>
            <span>{c.label}</span>
            <input
              aria-label={`Specimen ${c.label.toLowerCase()}`}
              type="range"
              min={c.min}
              max={c.max}
              step={c.step}
              value={c.value}
              onChange={(e) => c.set(Number(e.target.value))}
            />
            <output>{c.value}</output>
          </label>
        ))}
      </div>
      <div className="sf-type-instrument-glyphs">
        {["g", "&", "R"].map((g) => (
          <button
            type="button"
            aria-label={`Show ${g} glyph`}
            aria-pressed={g === glyph}
            key={g}
            onClick={(e) => {
              setInstant(e.detail === 0)
              setGlyph(g)
            }}
          >
            {g}
          </button>
        ))}
        <button
          type="button"
          className="sf-type-instrument-reset"
          onClick={() => {
            setWidth(100)
            setLean(0)
            setWeight(700)
            setScale(100)
          }}
        >
          Reset<span aria-hidden="true">↺</span>
        </button>
      </div>
      <style>{`.sf-type-instrument{position:relative;container-type:size;display:grid;grid-template-columns:1fr clamp(128px,29%,174px);grid-template-rows:1fr 55px;width:100%;height:100%;min-height:280px;overflow:hidden;background:#f9d900;color:#19130d;font:11px Arial,sans-serif}.sf-type-instrument *{box-sizing:border-box}.sf-type-instrument-proof{position:relative;display:grid;place-items:center;overflow:hidden;padding:5px 15px 24px}.sf-type-instrument-proof>span{position:relative;z-index:1;display:inline-block;font-family:Georgia,serif;font-size:clamp(130px,42cqw,260px);line-height:.8;letter-spacing:-.06em;transform-origin:50% 70%;animation:sf-type-glyph 220ms cubic-bezier(.22,1,.36,1)}.sf-type-instrument-baseline{position:absolute;left:22px;right:0;top:77%;border-top:1px solid #9c760080}.sf-type-instrument-baseline:before{content:"";position:absolute;right:0;top:-135px;left:0;border-top:1px dashed #9c760080}.sf-type-instrument-rack{display:grid;grid-template-columns:1fr 1fr;align-content:center;padding:12px 11px 7px 7px;gap:14px 6px;border-left:1px solid #16110a2b;background:#edbc00}.sf-type-instrument-rack label{display:flex;flex-direction:column;align-items:center;gap:2px}.sf-type-instrument-rack label>span{font-size:10px}.sf-type-instrument input{writing-mode:vertical-lr;direction:rtl;appearance:none;width:44px;height:74px;background:transparent;cursor:ns-resize;touch-action:none;margin:0}.sf-type-instrument input::-webkit-slider-runnable-track{width:3px;border-radius:1px;background:#9f6d004d;border:1px solid #9f6d004d}.sf-type-instrument input::-webkit-slider-thumb{appearance:none;width:25px;height:17px;margin-left:-12px;border-radius:3px;background:linear-gradient(#f14f24,#d52908);border:1px solid #a22206;box-shadow:0 3px 3px #6736065c,inset 0 2px 1px #ff9970}.sf-type-instrument input::-moz-range-track{width:3px;background:#9f6d004d}.sf-type-instrument input::-moz-range-thumb{width:25px;height:17px;border-radius:3px;background:#e23a13;border:1px solid #a22206}.sf-type-instrument output{font:10px ui-monospace,monospace;font-variant-numeric:tabular-nums;opacity:.7}.sf-type-instrument-glyphs{grid-column:1/-1;display:flex;align-items:stretch;border-top:1px solid #17110b3b;padding-left:14px;background:#f9d900}.sf-type-instrument button{border:0;background:transparent;color:inherit;min-width:52px;min-height:44px;font:26px Georgia,serif;cursor:pointer}.sf-type-instrument button[aria-pressed=true]{background:#18120d;color:#f9d900}.sf-type-instrument button:active{opacity:.7}.sf-type-instrument .sf-type-instrument-reset{margin-left:auto;display:flex;align-items:center;gap:18px;font:11px Arial;padding:0 20px}.sf-type-instrument-reset span{font-size:20px}.sf-type-instrument :focus-visible{outline:2px solid #111;outline-offset:-4px}.sf-type-instrument[data-instant=true] .sf-type-instrument-proof>span{animation:none}@container(max-width:400px){.sf-type-instrument{grid-template-columns:1fr 130px}.sf-type-instrument-rack{gap:11px 0;padding:8px 2px}.sf-type-instrument-proof{padding-left:0;padding-right:0}.sf-type-instrument-proof>span{font-size:160px}}@keyframes sf-type-glyph{from{opacity:.35;filter:blur(3px)}to{opacity:1;filter:blur(0)}}@media(prefers-reduced-motion:reduce){.sf-type-instrument-proof>span{animation:none!important}}`}</style>
    </section>
  )
}
