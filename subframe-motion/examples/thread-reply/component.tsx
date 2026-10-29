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

  const [text, setText] = React.useState(""),
    [replies, setReplies] = React.useState<string[]>([]),
    [resolved, setResolved] = React.useState(false)
  const scroll = React.useRef<HTMLDivElement>(null),
    input = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollTop = scroll.current.scrollHeight
    }
  }, [replies.length])
  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || replies.length >= 3) {
      return
    }
    setReplies((r) => [...r, text.trim()])
    setText("")
    input.current?.focus()
  }

  return (
    <section
      className="sf-w2-thread-reply"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="thread">
        <header className="row between">
          <span>Cover direction</span>
          <button type="button" aria-pressed={resolved} onClick={() => setResolved(!resolved)}>
            {resolved ? "↺ Reopen" : "✓ Resolve"}
          </button>
        </header>
        <div className="conversation" ref={scroll} role="log" aria-label="Review comments">
          <article>
            <div className="row byline">
              <i aria-hidden>M</i>
              <b>Mara</b>
              <span>10:42</span>
            </div>
            <p>
              The tighter crop feels right.
              <br />
              Can we try it without the border?
            </p>
          </article>
          {replies.map((r, i) => (
            <article className="reply" key={i}>
              <div className="row byline">
                <i aria-hidden>J</i>
                <b>You</b>
                <span>now</span>
              </div>
              <p>{r}</p>
            </article>
          ))}
        </div>
        <form onSubmit={send} className="composer">
          <input
            ref={input}
            aria-label="Reply to thread"
            placeholder={resolved ? "Thread resolved" : "Reply…"}
            disabled={resolved || replies.length >= 3}
            value={text}
            maxLength={160}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" disabled={resolved || !text.trim() || replies.length >= 3} aria-label="Send reply">
            ↑
          </button>
        </form>
        <p className="sr" role="status">
          {resolved ? "Thread resolved" : replies.length >= 3 ? "Three replies added." : "Thread open"}
        </p>
      </div>

      <style>{`.sf-w2-thread-reply{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-thread-reply *{box-sizing:border-box}.sf-w2-thread-reply button,.sf-w2-thread-reply input,.sf-w2-thread-reply select,.sf-w2-thread-reply textarea{font:inherit}.sf-w2-thread-reply button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-thread-reply button:disabled{opacity:.4;cursor:default}.sf-w2-thread-reply button:active:not(:disabled){transform:scale(.98)}.sf-w2-thread-reply input,.sf-w2-thread-reply textarea{font-size:16px;min-width:0}.sf-w2-thread-reply button:focus-visible,.sf-w2-thread-reply input:focus-visible,.sf-w2-thread-reply select:focus-visible,.sf-w2-thread-reply textarea:focus-visible,.sf-w2-thread-reply [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-thread-reply h2,.sf-w2-thread-reply p{margin:0}.sf-w2-thread-reply .row{display:flex;align-items:center;gap:12px}.sf-w2-thread-reply .between{justify-content:space-between}.sf-w2-thread-reply .muted{opacity:.6}.sf-w2-thread-reply .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-thread-reply[data-still=true] *,.sf-w2-thread-reply[data-still=true] *::before,.sf-w2-thread-reply[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-thread-reply *,.sf-w2-thread-reply *::before,.sf-w2-thread-reply *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-thread-reply button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-thread-reply{display:grid;place-items:center;padding:22px;background:#efeeeb;color:#252525}.sf-w2-thread-reply .thread{width:min(100%,414px);background:#fff;border:1px solid #dcdad5;border-radius:8px;box-shadow:0 5px 18px #39271c07;overflow:hidden}.sf-w2-thread-reply header{font-size:12px;padding:0 15px;border-bottom:1px solid #efeee9;height:52px}.sf-w2-thread-reply header button{font-size:11px;color:#6a746c;padding:0 3px}.sf-w2-thread-reply header button[aria-pressed=true]{color:#9d4538}.sf-w2-thread-reply .conversation{height:152px;overflow:auto;overscroll-behavior:contain;padding:18px;scrollbar-width:thin}.sf-w2-thread-reply article{font-size:13px;margin-bottom:18px}.sf-w2-thread-reply .byline{gap:7px;font-size:10px;margin-bottom:8px}.sf-w2-thread-reply .byline i{display:grid;place-items:center;width:21px;height:21px;background:#af4638;color:white;border-radius:50%;font-style:normal;font-size:9px}.sf-w2-thread-reply .byline span{color:#a29b95}.sf-w2-thread-reply .byline b{font-weight:500}.sf-w2-thread-reply article p{margin-left:28px;line-height:1.6;overflow-wrap:anywhere}.sf-w2-thread-reply .reply{animation:reply-w2 .2s ease-out}.sf-w2-thread-reply .reply .byline i{background:#383c3a}.sf-w2-thread-reply .composer{display:flex;padding:8px 9px 8px 16px;border-top:1px solid #efeee9;background:#fcfcfb;gap:8px}.sf-w2-thread-reply .composer input{width:100%;border:0;background:transparent;font-size:16px;outline-offset:0}.sf-w2-thread-reply .composer button{width:44px;flex-shrink:0;font-size:20px;color:#a44538;border-radius:5px;background:#f4eee9}@keyframes reply-w2{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  )
}
