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
function useReduced() {
  const [reduced, setReduced] = React.useState(true)
  React.useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return reduced
}

const BLOCKS = [
  "A small room can still sound generous.",
  "Start with one soft surface opposite the speakers. A rug, a curtain, or a wall of books will take the sharp edge off reflections.",
  "Then move your chair. Even a hand’s width can change how the low notes gather.",
  "Listen again at a lower volume. You’re looking for space between the sounds, not more sound.",
]
export default function Example({ active = true }: { active?: boolean }) {
  const reduced = useReduced(),
    [count, setCount] = React.useState(BLOCKS[0].length + 2 + BLOCKS[1].length),
    [streaming, setStreaming] = React.useState(false),
    [following, setFollowing] = React.useState(true)
  const viewport = React.useRef<HTMLDivElement>(null),
    follow = React.useRef(true)
  const all = BLOCKS.join("\n\n")
  React.useEffect(() => {
    if (!streaming || !active) {
      return
    }
    const id = setInterval(
      () =>
        setCount((n) => {
          if (n >= all.length) {
            setStreaming(false)
            return n
          }
          return Math.min(all.length, n + 3)
        }),
      35,
    )
    return () => clearInterval(id)
  }, [streaming, active, all.length])
  React.useLayoutEffect(() => {
    if (streaming && follow.current && viewport.current) {
      viewport.current.scrollTop = viewport.current.scrollHeight
    }
  }, [count, streaming])
  function latest() {
    follow.current = true
    setFollowing(true)
    const el = viewport.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "instant" : "smooth" })
    }
  }
  return (
    <div className="sf-answer-stream">
      <section className="pane">
        <header>
          <span className="mark" aria-hidden>
            ↗
          </span>
          <strong>A room for listening</strong>
          <button
            disabled={!active}
            aria-label={streaming ? "Stop response" : "Replay response"}
            onClick={() => {
              if (streaming) {
                setStreaming(false)
                return
              }
              setCount(0)
              follow.current = true
              setFollowing(true)
              setStreaming(true)
            }}
          >
            {streaming ? "Stop" : "Replay"}
          </button>
        </header>
        <div
          className="viewport"
          ref={viewport}
          tabIndex={0}
          aria-label="Response preview"
          onScroll={(e) => {
            const el = e.currentTarget
            const near = el.scrollHeight - el.clientHeight - el.scrollTop < 28
            follow.current = near
            setFollowing(near)
          }}
        >
          {all
            .slice(0, count)
            .split("\n\n")
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        {!following && (
          <button className="latest" disabled={!active} onClick={latest}>
            Latest response ↓
          </button>
        )}
        <footer>
          <i data-on={streaming} aria-hidden />
          <span>
            {streaming ? "Streaming preview" : count >= all.length ? "Response complete" : "Local response preview"}
          </span>
        </footer>
      </section>
      <style>{`.sf-answer-stream{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-answer-stream *{box-sizing:border-box}.sf-answer-stream button,.sf-answer-stream input,.sf-answer-stream select,.sf-answer-stream textarea{font:inherit;color:inherit}.sf-answer-stream button{cursor:pointer;touch-action:manipulation}.sf-answer-stream button:disabled{cursor:default;opacity:.45}.sf-answer-stream :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-answer-stream input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-answer-stream .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-answer-stream[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-answer-stream *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-answer-stream{background:#e8ebf0;color:#1c304b;padding:22px}.sf-answer-stream .pane{width:min(100%,420px);height:280px;background:#fbfcfe;border:1px solid #d5dce7;border-radius:11px;display:flex;flex-direction:column;position:relative;overflow:hidden;box-shadow:0 5px 17px #233c5b09}.sf-answer-stream header{display:flex;align-items:center;gap:10px;padding:5px 16px;border-bottom:1px solid #e9edf3;min-height:49px}.sf-answer-stream .mark{font-size:22px;color:#3f608d}.sf-answer-stream strong{font-size:12px;font-weight:500}.sf-answer-stream header button{margin-left:auto;background:none;border:0;font-size:11px;color:#5b7291;height:44px}.sf-answer-stream .viewport{overflow:auto;padding:8px 21px 22px;flex:1;scrollbar-width:thin;scrollbar-color:#c8d2df transparent}.sf-answer-stream p{font:16px/1.55 Georgia,serif;margin:12px 0}.sf-answer-stream p:first-child{font-size:22px;line-height:1.25;letter-spacing:-.4px;margin-bottom:18px}.sf-answer-stream footer{display:flex;align-items:center;gap:7px;padding:9px 19px;border-top:1px solid #e9edf3;font-size:10px;color:#8090a7}.sf-answer-stream footer i{width:5px;height:5px;border-radius:50%;background:#aab6c6}.sf-answer-stream footer i[data-on=true]{background:#3b66a3}.sf-answer-stream .latest{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);white-space:nowrap;border:1px solid #cfd8e6;border-radius:22px;min-height:44px;background:#fff;box-shadow:0 3px 9px #102b4a14;padding:0 14px;color:#37557b;font-size:11px}@container(max-width:330px){.sf-answer-stream .pane{height:266px}.sf-answer-stream .viewport{padding:4px 16px 15px}.sf-answer-stream header{padding-inline:12px}}`}</style>
    </div>
  )
}
