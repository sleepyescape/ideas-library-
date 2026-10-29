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
import * as React from "react"
function usePreview(active: boolean) {
  const [reduced, setReduced] = React.useState(true),
    [instant, setInstant] = React.useState(false)
  React.useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setReduced(q.matches)
    read()
    q.addEventListener("change", read)
    return () => q.removeEventListener("change", read)
  }, [])
  return {
    still: !active || reduced || instant,
    reduced,
    onKeyDownCapture: () => setInstant(true),
    onPointerDownCapture: () => setInstant(false),
  }
}

type Box = { x: number; y: number; w: number; h: number }
function CropArt() {
  return (
    <>
      <rect width="320" height="200" fill="#ecebe5" />
      <rect x="0" y="0" width="105" height="200" fill="#ad2929" />
      <g fill="none" stroke="#1f2524" strokeWidth="10">
        <path d="M153 42H266V156H153ZM158 49l103 100M263 50 159 149" />
        <circle cx="53" cy="104" r="33" stroke="#eae8dd" strokeWidth="13" />
        <path d="M120 184h172" strokeWidth="1" />
      </g>
      <text x="122" y="21" fontFamily="Arial,sans-serif" fontSize="8" letterSpacing="2" fill="#252827">
        COUNTERFORM
      </text>
      <path d="M15 170h76M15 179h44" stroke="#df9184" strokeWidth="1" />
    </>
  )
}

export default function Example({ active = true }: { active?: boolean }) {
  const preview = usePreview(active)

  const [box, setBox] = React.useState({ x: 65, y: 24, w: 185, h: 150 }),
    [applied, setApplied] = React.useState(false)
  const area = React.useRef<HTMLDivElement>(null),
    drag = React.useRef<{
      id: number
      startX: number
      startY: number
      box: Box
      mode: string
      node: HTMLElement
    } | null>(null)
  const adjust = (b: Box, dx: number, dy: number, mode: string) => {
    if (mode === "move") {
      return { ...b, x: Math.max(0, Math.min(320 - b.w, b.x + dx)), y: Math.max(0, Math.min(200 - b.h, b.y + dy)) }
    }
    let x = b.x,
      y = b.y,
      right = b.x + b.w,
      bottom = b.y + b.h
    if (mode.includes("w")) {
      x = Math.max(0, Math.min(right - 80, b.x + dx))
    }
    if (mode.includes("e")) {
      right = Math.max(x + 80, Math.min(320, right + dx))
    }
    if (mode.includes("n")) {
      y = Math.max(0, Math.min(bottom - 70, b.y + dy))
    }
    if (mode.includes("s")) {
      bottom = Math.max(y + 70, Math.min(200, bottom + dy))
    }
    return { x, y, w: right - x, h: bottom - y }
  }
  const begin = (e: React.PointerEvent<HTMLElement>, mode: string) => {
    if (!active || e.button !== 0 || drag.current) {
      return
    }
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, box, mode, node: e.currentTarget }
  }
  const move = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current,
      r = area.current?.getBoundingClientRect()
    if (!d || !r || e.pointerId !== d.id) {
      return
    }
    setBox(adjust(d.box, ((e.clientX - d.startX) * 320) / r.width, ((e.clientY - d.startY) * 200) / r.height, d.mode))
  }
  const end = (e: React.PointerEvent<HTMLElement>, cancel = false) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) {
      return
    }
    drag.current = null
    if (cancel) {
      setBox(d.box)
    }
    if (d.node.hasPointerCapture(d.id)) {
      d.node.releasePointerCapture(d.id)
    }
  }
  const keys = (e: React.KeyboardEvent<HTMLElement>, mode: string) => {
    if (!e.key.startsWith("Arrow")) {
      return
    }
    e.preventDefault()
    const step = e.shiftKey ? 10 : 2
    setBox((b) =>
      adjust(
        b,
        e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0,
        e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0,
        mode,
      ),
    )
  }
  React.useEffect(() => {
    if (!active && drag.current) {
      const d = drag.current
      drag.current = null
      if (d.node.hasPointerCapture(d.id)) {
        d.node.releasePointerCapture(d.id)
      }
    }
  }, [active])

  return (
    <section
      className="sf-w2-crop-window"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="editor">
        <header className="row between">
          <span>{applied ? "Crop preview" : "Crop image"}</span>
          <span className="dimensions">
            {Math.round(box.w)} × {Math.round(box.h)}
          </span>
        </header>
        <div className="image-area" ref={area} data-applied={applied}>
          <svg
            viewBox={applied ? `${box.x} ${box.y} ${box.w} ${box.h}` : "0 0 320 200"}
            preserveAspectRatio={applied ? "xMidYMid meet" : "none"}
            role="img"
            aria-label="Original black and white modular letter specimen"
          >
            <CropArt />
          </svg>
          {!applied && (
            <>
              <div className="crop-shade" aria-hidden>
                <div
                  style={{
                    left: `${box.x / 3.2}%`,
                    top: `${box.y / 2}%`,
                    width: `${box.w / 3.2}%`,
                    height: `${box.h / 2}%`,
                  }}
                />
              </div>
              <button
                type="button"
                className="selection"
                aria-label={`Move crop, left ${Math.round(box.x)}, top ${Math.round(box.y)}. Use arrow keys.`}
                style={{
                  left: `${box.x / 3.2}%`,
                  top: `${box.y / 2}%`,
                  width: `${box.w / 3.2}%`,
                  height: `${box.h / 2}%`,
                }}
                onPointerDown={(e) => begin(e, "move")}
                onPointerMove={move}
                onPointerUp={(e) => end(e)}
                onPointerCancel={(e) => end(e, true)}
                onLostPointerCapture={(e) => end(e)}
                onKeyDown={(e) => keys(e, "move")}
              >
                <span />
                <i />
              </button>
              {["nw", "ne", "sw", "se"].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  className={"handle " + mode}
                  aria-label={`Resize ${mode} crop corner with arrow keys`}
                  style={{
                    left: `${(box.x + (mode.includes("e") ? box.w : 0)) / 3.2}%`,
                    top: `${(box.y + (mode.includes("s") ? box.h : 0)) / 2}%`,
                  }}
                  onPointerDown={(e) => begin(e, mode)}
                  onPointerMove={move}
                  onPointerUp={(e) => end(e)}
                  onPointerCancel={(e) => end(e, true)}
                  onLostPointerCapture={(e) => end(e)}
                  onKeyDown={(e) => keys(e, mode)}
                >
                  <i />
                </button>
              ))}
            </>
          )}
        </div>
        <footer>
          <button
            type="button"
            onClick={() => {
              setBox({ x: 65, y: 24, w: 185, h: 150 })
              setApplied(false)
            }}
          >
            Reset
          </button>
          <button type="button" className="apply" onClick={() => setApplied(!applied)}>
            {applied ? "Edit crop" : "Apply crop"} <span aria-hidden>{applied ? "↶" : "✓"}</span>
          </button>
        </footer>
      </div>

      <style>{`.sf-w2-crop-window{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-crop-window *{box-sizing:border-box}.sf-w2-crop-window button,.sf-w2-crop-window input,.sf-w2-crop-window select,.sf-w2-crop-window textarea{font:inherit}.sf-w2-crop-window button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-crop-window button:disabled{opacity:.4;cursor:default}.sf-w2-crop-window button:active:not(:disabled){transform:scale(.98)}.sf-w2-crop-window input,.sf-w2-crop-window textarea{font-size:16px;min-width:0}.sf-w2-crop-window button:focus-visible,.sf-w2-crop-window input:focus-visible,.sf-w2-crop-window select:focus-visible,.sf-w2-crop-window textarea:focus-visible,.sf-w2-crop-window [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-crop-window h2,.sf-w2-crop-window p{margin:0}.sf-w2-crop-window .row{display:flex;align-items:center;gap:12px}.sf-w2-crop-window .between{justify-content:space-between}.sf-w2-crop-window .muted{opacity:.6}.sf-w2-crop-window .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-crop-window[data-still=true] *,.sf-w2-crop-window[data-still=true] *::before,.sf-w2-crop-window[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-crop-window *,.sf-w2-crop-window *::before,.sf-w2-crop-window *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-crop-window button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-crop-window{display:grid;place-items:center;background:#252728;color:#e7e9e8;padding:10px 24px}.sf-w2-crop-window .editor{width:min(100%,320px)}.sf-w2-crop-window header{font-size:11px;height:22px;margin-bottom:22px}.sf-w2-crop-window .dimensions{font:10px monospace;color:#92999b}.sf-w2-crop-window .image-area{position:relative;width:100%;aspect-ratio:8/5;max-height:200px;touch-action:none;overflow:visible;background:#151717}.sf-w2-crop-window .image-area>svg{display:block;width:100%;height:100%}.sf-w2-crop-window .crop-shade{position:absolute;inset:0;overflow:hidden;pointer-events:none}.sf-w2-crop-window .crop-shade>div{position:absolute;box-shadow:0 0 0 400px #0c121290}.sf-w2-crop-window .selection{position:absolute;padding:0;border:1px solid #fff;touch-action:none;cursor:move;min-height:0;min-width:0}.sf-w2-crop-window .selection:active{transform:none}.sf-w2-crop-window .selection>span{position:absolute;left:33.333%;right:33.333%;top:0;bottom:0;border-left:1px solid #fff5;border-right:1px solid #fff5}.sf-w2-crop-window .selection>i{position:absolute;top:33.333%;bottom:33.333%;left:0;right:0;border-top:1px solid #fff5;border-bottom:1px solid #fff5}.sf-w2-crop-window .handle{position:absolute;width:44px;height:44px;min-height:44px;transform:translate(-50%,-50%);padding:0;z-index:2;touch-action:none;cursor:nwse-resize}.sf-w2-crop-window .handle.ne,.sf-w2-crop-window .handle.sw{cursor:nesw-resize}.sf-w2-crop-window .handle:active{transform:translate(-50%,-50%)}.sf-w2-crop-window .handle i{position:absolute;width:12px;height:12px;left:16px;top:16px;border:2px solid #fff;box-shadow:0 0 2px #0008}.sf-w2-crop-window .nw i{border-right:0;border-bottom:0}.sf-w2-crop-window .ne i{border-left:0;border-bottom:0}.sf-w2-crop-window .sw i{border-right:0;border-top:0}.sf-w2-crop-window .se i{border-left:0;border-top:0}.sf-w2-crop-window footer{display:flex;justify-content:space-between;margin-top:22px}.sf-w2-crop-window footer button{font-size:11px;color:#a5adac;padding:0 9px}.sf-w2-crop-window footer .apply{background:#eceee9;color:#28312d;border-radius:4px;padding:0 15px;min-height:44px}.sf-w2-crop-window .apply span{margin-left:15px}`}</style>
    </section>
  )
}
