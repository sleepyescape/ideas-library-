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

type Phase = "you" | "thinking" | "reply"
const REPLIES = [
  "Let’s leave a little more room for the unexpected.",
  "Keep the detail that makes it feel unmistakably yours.",
  "A quieter opening. Then one moment worth remembering.",
]

export default function Example({ active = true }: { active?: boolean }) {
  const [phase, setPhase] = React.useState<Phase>("you")
  const [draft, setDraft] = React.useState("Make it a little more unexpected.")
  const [message, setMessage] = React.useState("")
  const [turn, setTurn] = React.useState(0)
  const [shown, setShown] = React.useState(0)
  const [hidden, setHidden] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  const elapsed = React.useRef(0)
  const reply = REPLIES[Math.max(0, turn - 1) % REPLIES.length]
  const words = reply.split(" ")
  const running = active && !hidden
  React.useEffect(() => {
    const update = () => setHidden(document.hidden)
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  React.useEffect(() => {
    if (!running || phase === "you") {
      return
    }
    let last = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      elapsed.current += now - last
      last = now
      if (phase === "thinking" && elapsed.current >= 850) {
        elapsed.current = 0
        setShown(1)
        setPhase("reply")
      } else if (phase === "reply") {
        setShown(Math.min(words.length, 1 + Math.floor(elapsed.current / 220)))
        if (elapsed.current >= words.length * 220 + 600) {
          elapsed.current = 0
          setPhase("you")
        }
      }
    }, 55)
    return () => window.clearInterval(timer)
  }, [phase, running, words.length])
  function interrupt() {
    elapsed.current = 0
    setPhase("you")
    input.current?.focus({ preventScroll: true })
  }
  function send(event: React.FormEvent) {
    event.preventDefault()
    if (!draft.trim() || !active) {
      return
    }
    elapsed.current = 0
    setMessage(draft.trim())
    setDraft("")
    setShown(0)
    setTurn((n) => n + 1)
    setPhase("thinking")
  }
  return (
    <div className="sf-voice-turn-taking" data-phase={phase} data-paused={!running} data-started={turn > 0}>
      <section className="relay" aria-label="Conversation turn preview">
        <div className="channels">
          <div className="connection" aria-hidden>
            <i />
          </div>
          <section className="channel you" data-current={phase === "you"}>
            <div className="speaker">
              <span className="node" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
              </span>
              <span>You</span>
              <small>{phase === "you" ? "Your turn" : "Sent"}</small>
            </div>
            {message && <p className="message">{message}</p>}
          </section>
          <section className="channel assistant" data-current={phase !== "you"}>
            <div className="speaker">
              <span className="node" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path d="m12 3 2.1 6.9L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.1Z" />
                </svg>
              </span>
              <span>Assistant</span>
              <div className="levels" aria-hidden>
                {Array.from({ length: 9 }, (_, i) => (
                  <i
                    key={i}
                    style={{ height: 4 + Math.abs(Math.sin(i * 1.71)) * 13, animationDelay: `${-i * 0.11}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="answer" aria-live="polite" aria-atomic="true">
              {phase === "thinking" ? (
                <span className="thinking">
                  Thinking<span>···</span>
                </span>
              ) : turn ? (
                <p>
                  {words.map((word, i) => (
                    <React.Fragment key={i}>
                      <span data-visible={i < shown}>{word}</span>{" "}
                    </React.Fragment>
                  ))}
                </p>
              ) : null}
            </div>
          </section>
        </div>
        <form className="composer" onSubmit={send}>
          <input
            ref={input}
            aria-label="Message"
            value={draft}
            maxLength={90}
            disabled={!active}
            placeholder={phase === "you" ? "Your next thought…" : "Interrupt with a new thought…"}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                interrupt()
              }
            }}
          />
          {phase !== "you" && !draft.trim() ? (
            <button type="button" disabled={!active} className="stop" onClick={interrupt}>
              <span aria-hidden>■</span>Interrupt
            </button>
          ) : (
            <button type="submit" disabled={!active || !draft.trim()} aria-label="Send message">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </button>
          )}
        </form>
        <footer>Local text preview</footer>
      </section>
      <style>{`
.sf-voice-turn-taking{width:100%;height:100%;display:grid;place-items:center;background:#dce5f0;color:#f8fbff;font:13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;container-type:inline-size;isolation:isolate}.sf-voice-turn-taking *{box-sizing:border-box}.sf-voice-turn-taking .relay{width:min(442px,calc(100% - 44px));background:linear-gradient(145deg,#203958,#111f36 64%);border:1px solid #304762;border-radius:20px;box-shadow:0 22px 30px -22px #152b5c99,0 2px 3px #152b5c16,inset 0 1px #ffffff18;padding:22px 20px 11px}.sf-voice-turn-taking .channels{position:relative;padding-left:2px}.sf-voice-turn-taking .connection{position:absolute;left:16px;top:15px;width:1px;height:58px;background:#ffffff16;overflow:hidden}.sf-voice-turn-taking .connection i{display:block;width:1px;height:32px;background:linear-gradient(transparent,#a7d5ff,transparent);transform:translateY(0);transition:transform .44s cubic-bezier(.22,.68,0,1)}.sf-voice-turn-taking[data-phase=thinking] .connection i,.sf-voice-turn-taking[data-phase=reply] .connection i{transform:translateY(65px)}.sf-voice-turn-taking .channel{position:relative;min-height:44px;padding-left:44px}.sf-voice-turn-taking .speaker{display:flex;align-items:center;height:28px;gap:10px;font-size:11px;color:#abc0d9}.sf-voice-turn-taking .speaker small{font:9px ui-monospace,monospace;margin-left:auto;color:#88a3c3}.sf-voice-turn-taking .node{position:absolute;left:0;top:0;width:29px;height:29px;border:1px solid #617189;border-radius:50%;background:#21334e;display:grid;place-items:center;color:#8dabc8;box-shadow:0 0 0 5px #1b2d46;transition:color .2s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease}.sf-voice-turn-taking .node svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linejoin:round;stroke-linecap:round}.sf-voice-turn-taking .channel[data-current=true] .node{background:#adcfff;border-color:#d6e8ff;color:#193859;box-shadow:0 0 0 5px #1b2d46,0 0 17px #578dea60}.sf-voice-turn-taking .channel[data-current=true] .speaker{color:#fff}.sf-voice-turn-taking p{margin:5px 0 0;max-width:330px;font-size:14px;line-height:1.5;letter-spacing:-.15px}.sf-voice-turn-taking .message{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sf-voice-turn-taking .answer{height:0}.sf-voice-turn-taking[data-started=true] .channel{min-height:80px}.sf-voice-turn-taking[data-started=true] .answer{height:57px}.sf-voice-turn-taking[data-started=true] .connection{height:94px}.sf-voice-turn-taking .answer p{font-size:14px}.sf-voice-turn-taking .answer p span{opacity:.24;transition:opacity .15s ease}.sf-voice-turn-taking .answer p [data-visible=true]{opacity:1}.sf-voice-turn-taking .thinking{display:flex;gap:8px;align-items:center;color:#b2c7e2;font-size:13px;height:40px}.sf-voice-turn-taking .thinking>span{letter-spacing:3px;font-size:24px;animation:sf-relay-think 1s ease-in-out infinite}.sf-voice-turn-taking .levels{display:flex;align-items:center;gap:2px;height:18px;margin-left:auto;opacity:.35}.sf-voice-turn-taking .levels i{width:2px;background:#a9d8ff;border-radius:1px;transform:scaleY(.35)}.sf-voice-turn-taking[data-phase=reply] .levels{opacity:1}.sf-voice-turn-taking[data-phase=reply] .levels i{animation:sf-relay-wave .48s ease-in-out infinite alternate}.sf-voice-turn-taking .composer{display:flex;align-items:center;gap:5px;background:#0d192c;border:1px solid #45607d;border-radius:10px;padding:4px 5px 4px 13px;margin-top:7px;box-shadow:inset 0 2px 3px #040c1829}.sf-voice-turn-taking input{font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:white;width:100%;min-width:0;flex:1;border:0;background:none;outline:none;height:39px}.sf-voice-turn-taking input::placeholder{color:#849dbb}.sf-voice-turn-taking .composer:focus-within{border-color:#a9d3ff;box-shadow:0 0 0 2px #75a7e525}.sf-voice-turn-taking button{font:11px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#153253;cursor:pointer;border:1px solid #c3e0ff;border-radius:6px;background:linear-gradient(#dcf0ff,#aacced);height:44px;min-width:44px;padding:0 8px;display:flex;align-items:center;justify-content:center;gap:6px;touch-action:manipulation;box-shadow:inset 0 1px white,0 2px 3px #0002;transition:transform .13s ease,opacity .15s ease}.sf-voice-turn-taking button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.sf-voice-turn-taking button:active{transform:translateY(1px)}.sf-voice-turn-taking button:disabled{opacity:.3;cursor:default}.sf-voice-turn-taking button:focus-visible{outline:2px solid white;outline-offset:3px}.sf-voice-turn-taking .stop{background:#2d435e;color:#d6e7fa;border-color:#526a86;box-shadow:inset 0 1px #ffffff12;font-size:10px}.sf-voice-turn-taking .stop span{font-size:8px}.sf-voice-turn-taking footer{display:flex;justify-content:space-between;color:#839ab5;font-size:9px;margin:10px 2px 0}.sf-voice-turn-taking[data-paused=true] *{animation-play-state:paused!important}.sf-voice-turn-taking[data-paused=true] .connection i{transition:none}@keyframes sf-relay-wave{to{transform:scaleY(1)}}@keyframes sf-relay-think{50%{opacity:.35}}@container(max-width:380px){.sf-voice-turn-taking .relay{width:calc(100% - 24px);padding:15px 15px 10px}.sf-voice-turn-taking .channel{padding-left:39px}.sf-voice-turn-taking p,.sf-voice-turn-taking .answer p{font-size:12px}.sf-voice-turn-taking .composer{margin-top:3px}}@media(prefers-reduced-motion:reduce){.sf-voice-turn-taking *{animation:none!important;transition:none!important}.sf-voice-turn-taking[data-phase=reply] .levels i{transform:scaleY(1)}}
      `}</style>
    </div>
  )
}
