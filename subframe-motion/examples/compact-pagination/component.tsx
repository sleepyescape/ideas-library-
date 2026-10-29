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

  const [page, setPage] = React.useState(8)
  const start = Math.max(1, Math.min(20 - 4, page - 2))

  return (
    <div
      className="sf-compact-pagination"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="pagination">
        <div className="page-sheet">
          <span className="page-line long" />
          <span className="page-line" />
          <div className="page-art" style={{ transform: `rotate(${((page % 5) - 2) * 3}deg)` }}>
            <span>{String(page).padStart(2, "0")}</span>
          </div>
          <div className="page-lines">
            <i />
            <i />
            <i />
          </div>
        </div>
        <nav aria-label="Pages" className="page-control">
          <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          <div className="page-window">
            <div className="page-numbers" style={{ transform: `translateX(-${(start - 1) * 32}px)` }}>
              {Array.from({ length: 20 }, (_, i) => (
                <button
                  key={i}
                  tabIndex={i + 1 >= start && i + 1 < start + 5 ? 0 : -1}
                  aria-current={page === i + 1 ? "page" : undefined}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <button aria-label="Next page" disabled={page === 20} onClick={() => setPage((p) => p + 1)}>
            ›
          </button>
        </nav>
      </div>
      <style>{`
.sf-compact-pagination {
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
.sf-compact-pagination * {
  box-sizing: border-box;
}
.sf-compact-pagination button,
.sf-compact-pagination input,
.sf-compact-pagination textarea,
.sf-compact-pagination select {
  font: inherit;
  color: inherit;
}
.sf-compact-pagination button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-compact-pagination button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-compact-pagination button:focus-visible,
.sf-compact-pagination input:focus-visible,
.sf-compact-pagination textarea:focus-visible,
.sf-compact-pagination [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-compact-pagination button {
  border: 0;
  background: transparent;
}
.sf-compact-pagination .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-compact-pagination .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-compact-pagination svg {
  display: block;
}
.sf-compact-pagination[data-keyboard="true"] *,
.sf-compact-pagination[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-compact-pagination *,
  .sf-compact-pagination *::before,
  .sf-compact-pagination *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-compact-pagination {
  background: #e6e7ea;
}
.sf-compact-pagination .pagination {
  display: grid;
  justify-items: center;
  gap: 19px;
}
.sf-compact-pagination .page-sheet {
  width: 140px;
  height: 150px;
  padding: 15px 17px;
  background: #fff;
  border: 1px solid #d2d6df;
  border-radius: 3px;
  box-shadow: 0 5px 15px #2b354818;
  position: relative;
}
.sf-compact-pagination .page-line {
  display: block;
  height: 3px;
  width: 38%;
  background: #bdc6d6;
  margin-bottom: 5px;
}
.sf-compact-pagination .page-line.long {
  width: 67%;
  background: #7488a8;
}
.sf-compact-pagination .page-art {
  width: 60px;
  height: 60px;
  position: absolute;
  right: 17px;
  top: 40px;
  background: #dbe1ed;
  color: #5e6c82;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  transition: transform 230ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-compact-pagination .page-art span {
  font: 26px Georgia;
}
.sf-compact-pagination .page-lines {
  position: absolute;
  bottom: 17px;
  left: 17px;
  right: 17px;
}
.sf-compact-pagination .page-lines i {
  display: block;
  height: 2px;
  background: #e5e9ef;
  margin-top: 5px;
}
.sf-compact-pagination .page-lines i:last-child {
  width: 74%;
}
.sf-compact-pagination .page-control {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
  background: #fafbfc;
  border-radius: 11px;
  border: 1px solid #d8dfe8;
  box-shadow: 0 4px 9px #24385109;
}
.sf-compact-pagination .page-control > button {
  height: 34px;
  width: 28px;
  color: #727c8a;
  font-size: 22px;
}
.sf-compact-pagination .page-window {
  width: 160px;
  overflow: hidden;
}
.sf-compact-pagination .page-numbers {
  display: flex;
  width: 640px;
  transition: transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sf-compact-pagination .page-numbers button {
  flex: 0 0 32px;
  height: 32px;
  font: 11px ui-monospace;
  color: #6b7584;
  border-radius: 7px;
}
.sf-compact-pagination .page-numbers [aria-current="page"] {
  background: #dfe7f5;
  color: #5276a5;
}
`}</style>
    </div>
  )
}
