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

  const [items, setItems] = React.useState([5, 4, 3, 2, 1, 0]),
    [unread, setUnread] = React.useState(0)
  const viewport = React.useRef<HTMLDivElement>(null),
    offset = React.useRef<number | null>(null)
  const labels = [
    "Created the collection",
    "Added the wordmark",
    "Updated the cover",
    "Adjusted the spacing",
    "Published a preview",
    "Requested a review",
    "Added a new direction",
    "Revised the final frame",
    "Prepared the handoff",
    "Approved the collection",
  ]
  React.useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTop = 56
    }
  }, [])
  React.useLayoutEffect(() => {
    const el = viewport.current
    if (el && offset.current !== null) {
      el.scrollTop = el.scrollHeight - offset.current
      offset.current = null
    }
  }, [items.length])
  const add = () => {
    if (items.length >= 10) {
      return
    }
    const el = viewport.current!
    if (el.scrollTop > 8) {
      offset.current = el.scrollHeight - el.scrollTop
      setUnread((n) => n + 1)
    }
    setItems((a) => [a.length, ...a])
  }
  const jump = () => {
    setUnread(0)
    viewport.current?.scrollTo({ top: 0, behavior: preview.still ? "auto" : "smooth" })
    viewport.current?.focus({ preventScroll: true })
  }

  return (
    <section
      className="sf-w2-deferred-feed"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="feed">
        <header className="row between">
          <h2>Project activity</h2>
          <button type="button" onClick={add} disabled={items.length >= 10} aria-label="Add a preview update">
            ＋
          </button>
        </header>
        <div
          className="viewport"
          ref={viewport}
          tabIndex={0}
          aria-label="Project activity feed"
          onScroll={(e) => {
            if (e.currentTarget.scrollTop < 8) {
              setUnread(0)
            }
          }}
        >
          {items.map((i) => (
            <article key={i}>
              <i className="dot" aria-hidden />
              <div>
                <p>{labels[i]}</p>
                <small>{i >= 6 ? "Just now" : `${(6 - i) * 4} min ago`}</small>
              </div>
              <span aria-hidden>{i % 2 ? "J" : "M"}</span>
            </article>
          ))}
        </div>
        {unread > 0 && (
          <button type="button" className="new" onClick={jump}>
            ↑ {unread} new {unread === 1 ? "update" : "updates"}
          </button>
        )}
        <div className="status sr" role="status">
          {unread ? `${unread} unread updates` : ""}
        </div>
      </div>

      <style>{`.sf-w2-deferred-feed{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-deferred-feed *{box-sizing:border-box}.sf-w2-deferred-feed button,.sf-w2-deferred-feed input,.sf-w2-deferred-feed select,.sf-w2-deferred-feed textarea{font:inherit}.sf-w2-deferred-feed button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-deferred-feed button:disabled{opacity:.4;cursor:default}.sf-w2-deferred-feed button:active:not(:disabled){transform:scale(.98)}.sf-w2-deferred-feed input,.sf-w2-deferred-feed textarea{font-size:16px;min-width:0}.sf-w2-deferred-feed button:focus-visible,.sf-w2-deferred-feed input:focus-visible,.sf-w2-deferred-feed select:focus-visible,.sf-w2-deferred-feed textarea:focus-visible,.sf-w2-deferred-feed [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-deferred-feed h2,.sf-w2-deferred-feed p{margin:0}.sf-w2-deferred-feed .row{display:flex;align-items:center;gap:12px}.sf-w2-deferred-feed .between{justify-content:space-between}.sf-w2-deferred-feed .muted{opacity:.6}.sf-w2-deferred-feed .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-deferred-feed[data-still=true] *,.sf-w2-deferred-feed[data-still=true] *::before,.sf-w2-deferred-feed[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-deferred-feed *,.sf-w2-deferred-feed *::before,.sf-w2-deferred-feed *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-deferred-feed button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-deferred-feed{display:grid;place-items:center;background:#ededeb;color:#252525;padding:22px}.sf-w2-deferred-feed .feed{width:min(100%,410px);position:relative;border:1px solid #d5d5d0;border-radius:7px;background:#fff;overflow:hidden}.sf-w2-deferred-feed header{height:49px;padding:0 17px;border-bottom:1px solid #e7e7e3}.sf-w2-deferred-feed h2{font-size:12px;font-weight:500}.sf-w2-deferred-feed header button{width:44px;color:#656762;font-size:20px}.sf-w2-deferred-feed .viewport{height:190px;overflow:auto;scrollbar-width:thin;overflow-anchor:none;overscroll-behavior:contain;padding:4px 17px}.sf-w2-deferred-feed article{position:relative;display:flex;align-items:center;gap:13px;height:57px}.sf-w2-deferred-feed .dot{width:7px;height:7px;border:1px solid #9a9c96;border-radius:50%;flex-shrink:0}.sf-w2-deferred-feed article:not(:last-child)::after{content:'';position:absolute;width:1px;background:#e5e5e0;height:35px;left:3px;top:40px}.sf-w2-deferred-feed article p{font-size:11px}.sf-w2-deferred-feed article small{display:block;color:#82867d;font-size:9px;margin-top:3px}.sf-w2-deferred-feed article>span{margin-left:auto;font-size:8px;border:1px solid #d9dbd4;border-radius:50%;width:21px;height:21px;display:grid;place-items:center;color:#687060}.sf-w2-deferred-feed .new{position:absolute;top:57px;left:50%;transform:translateX(-50%);background:#244c9a;color:white;border:1px solid #193e89;border-radius:22px;min-height:44px;padding:0 15px;white-space:nowrap;font-size:11px;box-shadow:0 3px 7px #14327822;animation:feed-w2 .18s ease-out}.sf-w2-deferred-feed .new:active{transform:translateX(-50%) scale(.98)}.sf-w2-deferred-feed .status{font-size:9px;color:#82867d;padding:10px 17px;border-top:1px solid #eef2f5}@keyframes feed-w2{from{opacity:0;translate:0 -5px}to{opacity:1;translate:0 0}}`}</style>
    </section>
  )
}
