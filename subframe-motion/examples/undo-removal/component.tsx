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

export default function Example({ active = true }: { active?: boolean }) {
  const preview = usePreview(active)

  const [removed, setRemoved] = React.useState(false),
    [remaining, setRemaining] = React.useState(8),
    [hovered, setHovered] = React.useState(false),
    [focused, setFocused] = React.useState(false),
    [committed, setCommitted] = React.useState(false)
  const hold = hovered || focused
  const remove = () => {
    setHovered(false)
    setFocused(false)
    setRemoved(true)
    setCommitted(false)
    setRemaining(8)
  }
  const restore = () => {
    setHovered(false)
    setFocused(false)
    setRemoved(false)
    setCommitted(false)
    setRemaining(8)
  }
  React.useEffect(() => {
    if (!removed || committed || hold || !active) {
      return
    }
    const t = setTimeout(() => {
      if (remaining <= 1) {
        setRemaining(0)
        setCommitted(true)
      } else {
        setRemaining((r) => r - 1)
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [removed, committed, remaining, hold, active])

  return (
    <section
      className="sf-w2-undo-removal"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="files">
        <header className="row between">
          <h2>Project files</h2>
          <span>{removed ? "2" : "3"} items</span>
        </header>
        <div className="file">
          <i aria-hidden>▤</i>
          <span>
            Brief.pdf<small>Updated today</small>
          </span>
          <b>2.4 MB</b>
        </div>
        {!removed && (
          <div className="file removable">
            <i aria-hidden>▧</i>
            <span>
              Exploration.png<small>Draft</small>
            </span>
            <button type="button" onClick={remove} aria-label="Remove Exploration.png">
              ×
            </button>
          </div>
        )}
        <div className="file">
          <i aria-hidden>◇</i>
          <span>
            Wordmark.svg<small>Approved</small>
          </span>
          <b>18 KB</b>
        </div>
        <div className="recovery">
          {removed && !committed ? (
            <div
              className="undo"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") {
                  setHovered(true)
                }
              }}
              onPointerLeave={() => setHovered(false)}
              onFocusCapture={() => setFocused(true)}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setFocused(false)
                }
              }}
            >
              <span role="status">File removed</span>
              <button type="button" onClick={restore}>
                Undo <span aria-hidden>↶</span>
              </button>
              <i aria-hidden style={{ transform: `scaleX(${remaining / 8})` }} />
            </div>
          ) : committed ? (
            <div className="finished">
              <span>Removed from this preview</span>
              <button type="button" onClick={restore}>
                Reset
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`.sf-w2-undo-removal{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-undo-removal *{box-sizing:border-box}.sf-w2-undo-removal button,.sf-w2-undo-removal input,.sf-w2-undo-removal select,.sf-w2-undo-removal textarea{font:inherit}.sf-w2-undo-removal button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-undo-removal button:disabled{opacity:.4;cursor:default}.sf-w2-undo-removal button:active:not(:disabled){transform:scale(.98)}.sf-w2-undo-removal input,.sf-w2-undo-removal textarea{font-size:16px;min-width:0}.sf-w2-undo-removal button:focus-visible,.sf-w2-undo-removal input:focus-visible,.sf-w2-undo-removal select:focus-visible,.sf-w2-undo-removal textarea:focus-visible,.sf-w2-undo-removal [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-undo-removal h2,.sf-w2-undo-removal p{margin:0}.sf-w2-undo-removal .row{display:flex;align-items:center;gap:12px}.sf-w2-undo-removal .between{justify-content:space-between}.sf-w2-undo-removal .muted{opacity:.6}.sf-w2-undo-removal .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-undo-removal[data-still=true] *,.sf-w2-undo-removal[data-still=true] *::before,.sf-w2-undo-removal[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-undo-removal *,.sf-w2-undo-removal *::before,.sf-w2-undo-removal *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-undo-removal button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-undo-removal{display:grid;place-items:center;padding:24px;background:#f0f0ee;color:#242424}.sf-w2-undo-removal .files{width:min(100%,393px)}.sf-w2-undo-removal header{height:42px;border-bottom:1px solid #d2d2cf;padding-bottom:10px}.sf-w2-undo-removal h2{font-size:14px;font-weight:500}.sf-w2-undo-removal header>span{font-size:10px;color:#888885}.sf-w2-undo-removal .file{display:flex;align-items:center;gap:12px;border-bottom:1px solid #dadad6;height:58px;animation:undo-file-w2 .18s ease-out}.sf-w2-undo-removal .file>i{font-style:normal;color:#7a7a76;font-size:23px;width:23px}.sf-w2-undo-removal .file>span{font-size:12px}.sf-w2-undo-removal .file small{display:block;margin-top:2px;font-size:9px;color:#8d8d89}.sf-w2-undo-removal .file>b{margin-left:auto;font:9px monospace;color:#898985}.sf-w2-undo-removal .file button{margin-left:auto;width:44px;color:#777773;font-size:22px}.sf-w2-undo-removal .recovery{height:58px;margin-top:13px}.sf-w2-undo-removal .undo{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#282826;color:#f3f3ed;border-radius:5px;padding:0 15px;overflow:hidden;animation:undo-toast-w2 .2s cubic-bezier(.2,.8,.2,1);height:48px;font-size:11px;box-shadow:0 8px 16px #31445a17}.sf-w2-undo-removal .undo button{color:#e8e8df;display:flex;align-items:center;gap:14px;font-size:11px}.sf-w2-undo-removal .undo>i{position:absolute;bottom:0;left:0;right:0;height:2px;background:#d59055;transform-origin:left;transition:transform 1s linear}.sf-w2-undo-removal .footnote{font-size:9px;color:#99a5b1}.sf-w2-undo-removal .finished{display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#8997a6}.sf-w2-undo-removal .finished button{font-size:11px;color:#426783}@keyframes undo-toast-w2{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes undo-file-w2{from{opacity:0}to{opacity:1}}`}</style>
    </section>
  )
}
