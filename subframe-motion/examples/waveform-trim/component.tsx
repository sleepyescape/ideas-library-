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

const BARS = Array.from({ length: 180 }, (_, i) => {
  const x = i / 180
  const envelope = (x > 0.09 && x < 0.37) || (x > 0.43 && x < 0.69) || (x > 0.74 && x < 0.91) ? 1 : 0.035
  return (3 + Math.abs(Math.sin(i * 1.73) * Math.cos(i * 0.17)) * 65) * envelope
})
export default function Example({ active = true }: { active?: boolean }) {
  const [range, setRange] = React.useState([17, 78])
  const track = React.useRef<HTMLDivElement>(null),
    drag = React.useRef<{ x: number; range: number[]; mode: number } | null>(null)
  function change(mode: number, value: number) {
    setRange((r) =>
      mode === 0 ? [Math.max(0, Math.min(r[1] - 5, value)), r[1]] : [r[0], Math.min(100, Math.max(r[0] + 5, value))],
    )
  }
  function down(e: React.PointerEvent<HTMLButtonElement>, mode: number) {
    if (!active) {
      return
    }
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, range: [...range], mode }
  }
  function move(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current
    if (!d || !active || !track.current) {
      return
    }
    const delta = ((e.clientX - d.x) / track.current.getBoundingClientRect().width) * 100
    if (d.mode === 2) {
      const clamped = Math.max(-d.range[0], Math.min(100 - d.range[1], delta))
      setRange([d.range[0] + clamped, d.range[1] + clamped])
    } else {
      change(d.mode, d.range[d.mode] + delta)
    }
  }
  function key(e: React.KeyboardEvent<HTMLButtonElement>, mode: number) {
    if (!active) {
      return
    }
    const amount = e.shiftKey ? 5 : 1
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      e.preventDefault()
      if (mode === 2) {
        const delta =
          e.key === "Home"
            ? -range[0]
            : e.key === "End"
            ? 100 - range[1]
            : Math.max(-range[0], Math.min(100 - range[1], e.key === "ArrowLeft" ? -amount : amount))
        setRange([range[0] + delta, range[1] + delta])
      } else {
        change(
          mode,
          e.key === "Home" ? 0 : e.key === "End" ? 100 : range[mode] + (e.key === "ArrowLeft" ? -amount : amount),
        )
      }
    }
  }
  React.useEffect(() => {
    if (!active) {
      drag.current = null
    }
  }, [active])
  return (
    <div className="sf-waveform-trim">
      <section className="clip">
        <header>
          <strong>Field recording</strong>
          <span>00:42</span>
        </header>
        <div className="ruler" aria-hidden>
          {[0, 7, 14, 21, 28, 35, 42].map((n) => (
            <span key={n}>{String(n).padStart(2, "0")}</span>
          ))}
        </div>
        <div className="wave" ref={track}>
          <svg viewBox="0 0 540 90" preserveAspectRatio="none" aria-hidden>
            {BARS.map((h, i) => (
              <path
                key={i}
                d={`M${i * 3 + 1} ${45 - h / 2}v${h}`}
                stroke={i / 1.8 >= range[0] && i / 1.8 <= range[1] ? "#313738" : "#c6cbca"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="selection" style={{ left: range[0] + "%", width: range[1] - range[0] + "%" }}>
            <button
              className="region"
              disabled={!active}
              aria-label="Move selected range"
              onPointerDown={(e) => down(e, 2)}
              onPointerMove={move}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onLostPointerCapture={() => (drag.current = null)}
              onKeyDown={(e) => key(e, 2)}
            />
          </div>
          {[0, 1].map((mode) => (
            <button
              key={mode}
              disabled={!active}
              className="handle"
              data-edge={mode}
              role="slider"
              aria-label={mode ? "Trim end" : "Trim start"}
              aria-valuemin={mode ? range[0] + 5 : 0}
              aria-valuemax={mode ? 100 : range[1] - 5}
              aria-valuenow={Math.round(range[mode])}
              aria-valuetext={(range[mode] * 0.42).toFixed(1) + " seconds"}
              style={{ left: range[mode] + "%" }}
              onPointerDown={(e) => down(e, mode)}
              onPointerMove={move}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onLostPointerCapture={() => (drag.current = null)}
              onKeyDown={(e) => key(e, mode)}
            >
              <span aria-hidden />
            </button>
          ))}
        </div>
        <footer>
          <span>
            <small>IN</small>
            <output>{(range[0] * 0.42).toFixed(2)}</output>
          </span>
          <output className="duration">{((range[1] - range[0]) * 0.42).toFixed(2)} s</output>
          <span>
            <small>OUT</small>
            <output>{(range[1] * 0.42).toFixed(2)}</output>
          </span>
        </footer>
      </section>
      <style>{`.sf-waveform-trim{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-waveform-trim *{box-sizing:border-box}.sf-waveform-trim button,.sf-waveform-trim input,.sf-waveform-trim select,.sf-waveform-trim textarea{font:inherit;color:inherit}.sf-waveform-trim button{cursor:pointer;touch-action:manipulation}.sf-waveform-trim button:disabled{cursor:default;opacity:.45}.sf-waveform-trim :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-waveform-trim input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-waveform-trim .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-waveform-trim[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-waveform-trim *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-waveform-trim{background:#eeeeeb;padding:28px}.sf-waveform-trim .clip{width:min(100%,470px);background:#fcfcfa;border:1px solid #d8dcd8;border-radius:10px;padding:20px 22px 16px;box-shadow:0 1px 2px #00000004}.sf-waveform-trim header{display:flex;justify-content:space-between;align-items:center;margin-bottom:27px}.sf-waveform-trim strong{font-weight:500;font-size:13px}.sf-waveform-trim header span{font:11px ui-monospace,monospace;color:#848b85}.sf-waveform-trim .ruler{display:flex;justify-content:space-between;font:9px ui-monospace,monospace;color:#8b938a;margin-bottom:10px}.sf-waveform-trim .ruler span{position:relative}.sf-waveform-trim .ruler span:after{content:'';position:absolute;width:1px;height:4px;background:#c5cdc5;top:14px;left:50%}.sf-waveform-trim .wave{height:90px;position:relative}.sf-waveform-trim svg{width:100%;height:90px;display:block}.sf-waveform-trim .selection{position:absolute;top:0;height:100%;border-block:1px solid #303834;background:#52665006}.sf-waveform-trim .region{position:absolute;inset:0;width:100%;height:100%;background:none;border:0;cursor:grab;touch-action:none}.sf-waveform-trim .handle{position:absolute;top:-3px;width:44px;transform:translateX(-50%);height:96px;border:0;padding:0;background:transparent;touch-action:none;cursor:ew-resize}.sf-waveform-trim .handle[data-edge="0"]{transform:translateX(-100%)}.sf-waveform-trim .handle[data-edge="1"]{transform:none}.sf-waveform-trim .handle[data-edge="0"] span{margin-left:auto;margin-right:-3px}.sf-waveform-trim .handle[data-edge="1"] span{margin-left:-3px;margin-right:auto}.sf-waveform-trim .handle span{display:block;width:7px;height:100%;margin:auto;border-radius:3px;background:#303834;position:relative}.sf-waveform-trim .handle span:after{content:'';position:absolute;top:43px;left:3px;height:11px;width:1px;background:#ffffffb3}.sf-waveform-trim footer{display:flex;align-items:center;justify-content:space-between;margin-top:21px;font:11px ui-monospace,monospace;font-variant-numeric:tabular-nums}.sf-waveform-trim footer>span{display:flex;gap:7px}.sf-waveform-trim small{font:9px -apple-system,sans-serif;color:#929b91}.sf-waveform-trim .duration{border:1px solid #e1e5df;border-radius:4px;padding:3px 8px;color:#5c6c5b}@container(max-width:320px){.sf-waveform-trim .clip{padding:17px}.sf-waveform-trim footer>span{flex-direction:column;gap:3px}}`}</style>
    </div>
  )
}
