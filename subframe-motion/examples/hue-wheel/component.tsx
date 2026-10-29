/**
 * MIT License
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
import * as React from "react"

export default function Example({ active = true }: { active?: boolean }) {
  const [reduced, setReduced] = React.useState(true)
  const [keyboard, setKeyboard] = React.useState(false)
  React.useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(m.matches)
    update()
    m.addEventListener("change", update)
    return () => m.removeEventListener("change", update)
  }, [])
  const running = active && !reduced

  const [hue, setHue] = React.useState(225),
    [drag, setDrag] = React.useState(false)
  function update(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    const a = (Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180) / Math.PI + 90
    setHue(Math.round((a + 360) % 360))
  }
  const color = `hsl(${hue} 44% 64%)`

  return (
    <div
      className="sf-hue-wheel"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="color-editor">
        <div
          className="wheel"
          role="slider"
          tabIndex={0}
          aria-label="Hue"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={hue}
          onKeyDown={(e) => {
            if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(e.key)) {
              e.preventDefault()
              setHue((h) => (h + (["ArrowRight", "ArrowUp"].includes(e.key) ? 1 : 359)) % 360)
            }
            if (e.key === "Home") {
              setHue(0)
            }
            if (e.key === "End") {
              setHue(359)
            }
          }}
          onPointerDown={(e) => {
            setDrag(true)
            e.currentTarget.setPointerCapture(e.pointerId)
            update(e)
          }}
          onPointerMove={(e) => {
            if (drag) {
              update(e)
            }
          }}
          onPointerUp={() => setDrag(false)}
          onPointerCancel={() => setDrag(false)}
        >
          <div className="wheel-center" style={{ background: color }} />
          <span className="wheel-thumb" style={{ transform: `rotate(${hue}deg)` }}>
            <i />
          </span>
        </div>
        <div className="color-data">
          <span>Hue</span>
          <output className="mono">{hue}°</output>
        </div>
        <div className="swatches">
          {[195, 225, 280, 335, 35, 115].map((h) => (
            <button
              key={h}
              style={{ background: `hsl(${h} 44% 64%)` }}
              aria-label={"Set hue to " + h + " degrees"}
              aria-pressed={hue === h}
              onClick={() => setHue(h)}
            >
              {hue === h ? "✓" : ""}
            </button>
          ))}
        </div>
      </div>
      <style>{`
.sf-hue-wheel {
  width: 100%;
  height: 100%;
  min-height: 260px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: 20px;
  background: #edf0f3;
  color: #22272d;
  font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  isolation: isolate;
  overflow: hidden;
}
.sf-hue-wheel * {
  box-sizing: border-box;
}
.sf-hue-wheel button,
.sf-hue-wheel input,
.sf-hue-wheel textarea,
.sf-hue-wheel select {
  font: inherit;
  color: inherit;
}
.sf-hue-wheel button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-hue-wheel button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-hue-wheel button:focus-visible,
.sf-hue-wheel input:focus-visible,
.sf-hue-wheel textarea:focus-visible,
.sf-hue-wheel [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-hue-wheel button {
  border: 0;
  background: transparent;
}
.sf-hue-wheel .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-hue-wheel .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-hue-wheel .mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-variant-numeric: tabular-nums;
}
.sf-hue-wheel svg {
  display: block;
}
.sf-hue-wheel[data-keyboard="true"] *,
.sf-hue-wheel[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-hue-wheel *,
  .sf-hue-wheel *::before,
  .sf-hue-wheel *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-hue-wheel {
  background: #ebeaf0;
}
.sf-hue-wheel .color-editor {
  width: 240px;
  max-width: 100%;
  padding: 21px;
  background: #faf9fd;
  border: 1px solid #dcd8e8;
  border-radius: 18px;
  box-shadow: 0 15px 40px #3a2d5a17;
}
.sf-hue-wheel .wheel {
  width: 148px;
  height: 148px;
  margin: auto;
  border-radius: 50%;
  background: conic-gradient(
    #d19a9a,
    #d1d19a,
    #9ad19a,
    #9ad1d1,
    #9a9ad1,
    #d19ad1,
    #d19a9a
  );
  position: relative;
  touch-action: none;
  cursor: crosshair;
  box-shadow: inset 0 0 0 1px #00000008;
}
.sf-hue-wheel .wheel:after {
  content: "";
  position: absolute;
  inset: 15px;
  border-radius: 50%;
  background: #faf9fd;
  box-shadow: 0 0 0 1px #ffffff90;
}
.sf-hue-wheel .wheel-center {
  position: absolute;
  inset: 29px;
  border-radius: 50%;
  z-index: 1;
  box-shadow: inset 0 2px 5px #ffffff40, 0 4px 10px #3522450d;
}
.sf-hue-wheel .wheel-thumb {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
.sf-hue-wheel .wheel-thumb i {
  position: absolute;
  top: 0;
  left: 65px;
  width: 18px;
  height: 18px;
  background: transparent;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 5px #4b3e6440;
}
.sf-hue-wheel .color-data {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #716981;
  padding: 15px 6px 13px;
}
.sf-hue-wheel output {
  color: #75648f;
}
.sf-hue-wheel .swatches {
  display: flex;
  justify-content: space-between;
  gap: 7px;
  padding: 0 5px;
}
.sf-hue-wheel .swatches button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 11px;
  color: #ffffff;
}
.sf-hue-wheel {
  background: #e4e2e9;
}
.sf-hue-wheel .color-editor {
  background: #fdfcfe;
  box-shadow: 0 20px 40px #30254425, inset 0 1px white;
  border-color: #ccc6d7;
}
.sf-hue-wheel .wheel {
  background: conic-gradient(
    #dc7474,
    #dcdc74,
    #74dc74,
    #74dcdc,
    #7474dc,
    #dc74dc,
    #dc7474
  );
  box-shadow: inset 0 1px 3px #0001;
}
.sf-hue-wheel .color-data {
  color: #756785;
}
`}</style>
    </div>
  )
}
