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

function spectrum() {
  const columns = 120,
    bins = 64,
    size = 128,
    rate = 1024,
    hop = 32,
    values = new Float32Array(columns * bins)
  for (let x = 0; x < columns; x++) {
    const samples = Array.from({ length: size }, (_, n) => {
      const t = (x * hop + n) / rate
      return (
        (Math.sin(2 * Math.PI * (72 * t + 26 * t * t)) * 0.6 +
          Math.sin(2 * Math.PI * 300 * t) * Math.exp(-Math.pow((t - 2.25) * 4, 2)) * 0.6) *
        (0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1)))
      )
    })
    for (let k = 0; k < bins; k++) {
      let re = 0,
        im = 0
      for (let n = 0; n < size; n++) {
        const a = (2 * Math.PI * k * n) / size
        re += samples[n] * Math.cos(a)
        im -= samples[n] * Math.sin(a)
      }
      values[x * bins + k] = Math.max(0, Math.min(1, (20 * Math.log10(Math.hypot(re, im) / size + 1e-6) + 64) / 55))
    }
  }
  return values
}
export default function Example({ active = true }: { active?: boolean }) {
  const canvas = React.useRef<HTMLCanvasElement>(null),
    [box, setBox] = React.useState([0.34, 0.18, 0.73, 0.62]),
    drag = React.useRef<number[] | null>(null)
  const data = React.useMemo(spectrum, [])
  React.useEffect(() => {
    const c = canvas.current
    if (!c) {
      return
    }
    const ctx = c.getContext("2d")
    if (!ctx) {
      return
    }
    // The FFT bins are data samples, not display pixels. Interpolate the heatmap
    // into a display-density canvas while retaining the exact selection coordinates.
    const source = document.createElement("canvas")
    source.width = 120
    source.height = 64
    const sourceContext = source.getContext("2d")!
    const image = sourceContext.createImageData(120, 64)
    for (let x = 0; x < 120; x++) {
      for (let y = 0; y < 64; y++) {
        const v = data[x * 64 + 63 - y],
          i = (y * 120 + x) * 4
        image.data[i] = 22 + Math.pow(v, 0.8) * 233
        image.data[i + 1] = 18 + Math.pow(v, 2.1) * 177
        image.data[i + 2] = 17 + Math.pow(v, 4) * 76
        image.data[i + 3] = 255
      }
    }
    sourceContext.putImageData(image, 0, 0)
    const resize = () => {
      const bounds = c.getBoundingClientRect()
      const density = Math.min(devicePixelRatio || 1, 2)
      c.width = Math.max(1, Math.round(bounds.width * density))
      c.height = Math.max(1, Math.round(bounds.height * density))
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(source, 0, 0, c.width, c.height)
    }
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(resize)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(c)
    const transforms = new MutationObserver(schedule)
    for (let ancestor = c.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", schedule)
    resize()
    return () => {
      observer.disconnect()
      transforms.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", schedule)
    }
  }, [data])
  const point = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return [
      Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    ]
  }
  React.useEffect(() => {
    if (!active) {
      drag.current = null
    }
  }, [active])
  function keyboard(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!active || !e.key.startsWith("Arrow")) {
      return
    }
    e.preventDefault()
    const dx = e.key === "ArrowLeft" ? -0.025 : e.key === "ArrowRight" ? 0.025 : 0,
      dy = e.key === "ArrowUp" ? -0.025 : e.key === "ArrowDown" ? 0.025 : 0
    setBox((b) => {
      if (e.shiftKey) {
        return [
          b[0],
          b[1],
          Math.max(b[0] + 0.03, Math.min(1, b[2] + dx)),
          Math.max(b[1] + 0.03, Math.min(1, b[3] + dy)),
        ]
      }
      const x = Math.max(-b[0], Math.min(1 - b[2], dx)),
        y = Math.max(-b[1], Math.min(1 - b[3], dy))
      return [b[0] + x, b[1] + y, b[2] + x, b[3] + y]
    })
  }
  return (
    <div className="sf-spectral-selection">
      <section className="spectrogram">
        <header>
          <strong>Spectral region</strong>
          <button disabled={!active} onClick={() => setBox([0, 0, 1, 1])}>
            Select all
          </button>
        </header>
        <div className="plot">
          <aside aria-hidden>
            <span>512</span>
            <span>256</span>
            <span>0 Hz</span>
          </aside>
          <div
            className="field"
            role="group"
            tabIndex={0}
            aria-label="Time and frequency selection. Drag to select; arrow keys move; shift arrows resize."
            onKeyDown={keyboard}
            onPointerDown={(e) => {
              if (!active) {
                return
              }
              e.currentTarget.setPointerCapture(e.pointerId)
              drag.current = point(e)
              setBox([drag.current[0], drag.current[1], drag.current[0], drag.current[1]])
            }}
            onPointerMove={(e) => {
              if (!drag.current || !active) {
                return
              }
              const p = point(e),
                d = drag.current
              setBox([Math.min(p[0], d[0]), Math.min(p[1], d[1]), Math.max(p[0], d[0]), Math.max(p[1], d[1])])
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onLostPointerCapture={() => (drag.current = null)}
          >
            <canvas ref={canvas} aria-label="Hann-windowed spectrum of an original chirp and brief 300 Hz tone" />
            <div
              className="selection"
              style={{
                left: box[0] * 100 + "%",
                top: box[1] * 100 + "%",
                width: (box[2] - box[0]) * 100 + "%",
                height: (box[3] - box[1]) * 100 + "%",
              }}
            />
          </div>
        </div>
        <div className="axis" aria-hidden>
          <span>0.0</span>
          <span>1.0</span>
          <span>2.0</span>
          <span>3.75 s</span>
        </div>
        <footer>
          <output>
            {(box[0] * 3.75).toFixed(2)}–{(box[2] * 3.75).toFixed(2)} s
          </output>
          <output>
            {Math.round((1 - box[3]) * 512)}–{Math.round((1 - box[1]) * 512)} Hz
          </output>
        </footer>
      </section>
      <style>{`.sf-spectral-selection{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-spectral-selection *{box-sizing:border-box}.sf-spectral-selection button,.sf-spectral-selection input,.sf-spectral-selection select,.sf-spectral-selection textarea{font:inherit;color:inherit}.sf-spectral-selection button{cursor:pointer;touch-action:manipulation}.sf-spectral-selection button:disabled{cursor:default;opacity:.45}.sf-spectral-selection :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-spectral-selection input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-spectral-selection .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-spectral-selection[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-spectral-selection *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-spectral-selection{background:#211c19;color:#e3d4c4;padding:24px}.sf-spectral-selection .spectrogram{width:min(100%,470px)}.sf-spectral-selection header{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}.sf-spectral-selection strong{font-size:12px;font-weight:500}.sf-spectral-selection button{height:44px;padding:0 9px;background:none;border:0;color:#b18c6b;font-size:10px}.sf-spectral-selection .plot{display:flex;height:169px;gap:11px}.sf-spectral-selection aside{display:flex;flex-direction:column;justify-content:space-between;width:31px;flex-shrink:0;text-align:right;font:9px ui-monospace,monospace;color:#8c7e70}.sf-spectral-selection .field{flex:1;min-width:0;position:relative;touch-action:none;cursor:crosshair;border:1px solid #5d4633;overflow:hidden}.sf-spectral-selection canvas{width:100%;height:100%;display:block}.sf-spectral-selection .selection{position:absolute;border:1px solid #fff6df;background:#fff6df0b;box-shadow:0 0 0 500px #110a0640;pointer-events:none}.sf-spectral-selection .axis{display:flex;justify-content:space-between;margin:9px 0 0 43px;font:9px ui-monospace,monospace;color:#8c7e70}.sf-spectral-selection footer{display:flex;justify-content:space-between;margin:18px 0 0 43px;font:11px ui-monospace,monospace;color:#d9c5a9}@container(max-width:330px){.sf-spectral-selection .plot{height:151px}.sf-spectral-selection footer{font-size:10px}}`}</style>
    </div>
  )
}
