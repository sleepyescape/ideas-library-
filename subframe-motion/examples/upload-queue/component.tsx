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

  const [progress, setProgress] = React.useState([100, 56, 12]),
    [play, setPlay] = React.useState(false),
    [removed, setRemoved] = React.useState<number[]>([])
  React.useEffect(() => {
    if (!active || !play) {
      return
    }
    const id = setInterval(() => setProgress((v) => v.map((n, i) => Math.min(100, n + 4 + i * 2))), 400)
    return () => clearInterval(id)
  }, [active, play])
  React.useEffect(() => {
    if (play && progress.every((value, index) => value === 100 || removed.includes(index))) {
      setPlay(false)
    }
  }, [play, progress, removed])
  const names = ["Cover artwork.svg", "Lookbook.pdf", "Material studies.zip"]

  return (
    <div
      className="sf-upload-queue"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="uploads">
        <div className="row between">
          <strong>Files</strong>
          <button
            className="run"
            onClick={() => {
              if (progress.every((x, i) => x === 100 || removed.includes(i))) {
                setProgress([0, 0, 0])
                setRemoved([])
                setPlay(true)
              } else {
                setPlay(!play)
              }
            }}
          >
            {play
              ? "Pause"
              : progress.every((value, index) => value === 100 || removed.includes(index))
              ? "Replay upload"
              : "Preview upload"}
          </button>
        </div>
        {names.map(
          (name, i) =>
            !removed.includes(i) && (
              <div className="upload" key={name}>
                <span className={"type type" + i} aria-hidden>
                  {["◇", "▤", "▦"][i]}
                </span>
                <div className="file-info">
                  <div className="row between">
                    <span>{name}</span>
                    <span className="percent">{progress[i] === 100 ? "✓" : progress[i] + "%"}</span>
                  </div>
                  <div
                    className="progress"
                    role="progressbar"
                    aria-label={name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress[i]}
                  >
                    <i style={{ transform: `scaleX(${progress[i] / 100})` }} />
                  </div>
                </div>
                <button aria-label={"Remove " + name} onClick={() => setRemoved((v) => [...v, i])}>
                  ×
                </button>
              </div>
            ),
        )}
        <div className="total">{progress.filter((p, i) => p === 100 && !removed.includes(i)).length} complete</div>
      </div>
      <style>{`
.sf-upload-queue {
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
.sf-upload-queue * {
  box-sizing: border-box;
}
.sf-upload-queue button,
.sf-upload-queue input,
.sf-upload-queue textarea,
.sf-upload-queue select {
  font: inherit;
  color: inherit;
}
.sf-upload-queue button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-upload-queue button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-upload-queue button:focus-visible,
.sf-upload-queue input:focus-visible,
.sf-upload-queue textarea:focus-visible,
.sf-upload-queue [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-upload-queue button {
  border: 0;
  background: transparent;
}
.sf-upload-queue .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-upload-queue .between {
  justify-content: space-between;
}
.sf-upload-queue .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-upload-queue svg {
  display: block;
}
.sf-upload-queue[data-keyboard="true"] *,
.sf-upload-queue[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-upload-queue *,
  .sf-upload-queue *::before,
  .sf-upload-queue *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-upload-queue {
  background: #e8ecef;
}
.sf-upload-queue .uploads {
  width: min(100%, 390px);
  background: #fff;
  border: 1px solid #d7dfe5;
  border-radius: 13px;
  padding: 18px;
  box-shadow: 0 15px 35px #243f5313;
}
.sf-upload-queue .uploads > .row {
  font-size: 12px;
  margin-bottom: 14px;
}
.sf-upload-queue .run {
  font-size: 10px;
  color: #64859c;
  min-height: 32px;
  padding: 3px 6px;
}
.sf-upload-queue .upload {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 13px 0;
}
.sf-upload-queue .type {
  width: 31px;
  height: 36px;
  background: #edf3f5;
  border: 1px solid #dce7ed;
  border-radius: 5px;
  color: #6e97aa;
  display: grid;
  place-items: center;
  font-size: 20px;
}
.sf-upload-queue .type1 {
  color: #a78085;
  background: #f8f0f0;
  border-color: #eee0e0;
}
.sf-upload-queue .type2 {
  color: #988b63;
  background: #f6f3e9;
  border-color: #e9e4d3;
}
.sf-upload-queue .file-info {
  flex: 1;
  min-width: 0;
  font-size: 10px;
}
.sf-upload-queue .file-info > .row > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sf-upload-queue .percent {
  font: 9px ui-monospace;
  color: #5f756b;
}
.sf-upload-queue .progress {
  height: 3px;
  background: #edf1f3;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}
.sf-upload-queue .progress i {
  display: block;
  background: #78a192;
  width: 100%;
  height: 100%;
  transform-origin: left;
  transition: transform 400ms linear;
}
.sf-upload-queue .upload > button {
  width: 23px;
  height: 36px;
  color: #7f878e;
}
.sf-upload-queue .total {
  font-size: 10px;
  color: #747c83;
  border-top: 1px solid #eef2f4;
  padding-top: 13px;
  margin-top: 15px;
}
`}</style>
    </div>
  )
}
