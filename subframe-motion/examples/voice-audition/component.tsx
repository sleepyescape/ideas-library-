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

const LINE = "A little room for a new perspective."
export default function VoiceAudition({ active = true }: { active?: boolean }) {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([])
  const [selected, setSelected] = React.useState("")
  const [playing, setPlaying] = React.useState("")
  const [started, setStarted] = React.useState(false)
  const [notice, setNotice] = React.useState("")
  const [word, setWord] = React.useState(-1)
  const utterance = React.useRef<SpeechSynthesisUtterance | null>(null)
  const stop = React.useCallback(() => {
    if (utterance.current) {
      utterance.current = null
      window.speechSynthesis.cancel()
    }
    setPlaying("")
    setStarted(false)
    setWord(-1)
  }, [])
  React.useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setNotice("System speech is unavailable.")
      return
    }
    const load = () => {
      const available = speechSynthesis.getVoices()
      const english = available.filter((v) => v.lang.startsWith("en"))
      const pool = english.length >= 3 ? english : available
      const next: SpeechSynthesisVoice[] = []
      const primary = pool.find((v) => v.default) || pool[0]
      if (primary) {
        next.push(primary)
      }
      for (const voice of pool) {
        if (next.length === 3) {
          break
        }
        if (!next.some((v) => v.lang === voice.lang)) {
          next.push(voice)
        }
      }
      for (const voice of pool) {
        if (next.length === 3) {
          break
        }
        if (!next.some((v) => v.voiceURI === voice.voiceURI)) {
          next.push(voice)
        }
      }
      setVoices(next)
      setSelected((s) => (next.some((v) => v.voiceURI === s) ? s : next[0]?.voiceURI || ""))
    }
    load()
    speechSynthesis.addEventListener("voiceschanged", load)
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", load)
      if (utterance.current) {
        utterance.current = null
        speechSynthesis.cancel()
      }
    }
  }, [])
  React.useEffect(() => {
    if (!active) {
      stop()
    }
  }, [active, stop])
  React.useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        stop()
      }
    }
    document.addEventListener("visibilitychange", hide)
    return () => document.removeEventListener("visibilitychange", hide)
  }, [stop])
  const preview = (v: SpeechSynthesisVoice) => {
    if (!active) {
      return
    }
    if (playing === v.voiceURI) {
      stop()
      return
    }
    if (!utterance.current && speechSynthesis.speaking) {
      setNotice("Another speech preview is playing.")
      return
    }
    stop()
    setNotice("")
    const u = new SpeechSynthesisUtterance(LINE)
    u.voice = v
    u.rate = 0.94
    u.onstart = () => {
      if (utterance.current === u) {
        setStarted(true)
      }
    }
    u.onboundary = (e) => {
      if (utterance.current === u) {
        setWord(e.charIndex)
      }
    }
    u.onend = () => {
      if (utterance.current === u) {
        utterance.current = null
        setPlaying("")
        setStarted(false)
        setWord(-1)
      }
    }
    u.onerror = (e) => {
      if (utterance.current === u) {
        utterance.current = null
        setPlaying("")
        setStarted(false)
        setWord(-1)
        if (e.error !== "interrupted" && e.error !== "canceled") {
          setNotice("This system voice could not play.")
        }
      }
    }
    utterance.current = u
    setPlaying(v.voiceURI)
    speechSynthesis.speak(u)
  }
  return (
    <section className="sf-voice-audition" data-paused={!active}>
      <div className="sf-va-tray">
        <div className="sf-va-heading">
          <span>Narrator</span>
          <span className="sf-va-device">System voices</span>
        </div>
        <div className="sf-va-voices">
          {[0, 1, 2].map((i) => {
            const v = voices[i],
              chosen = !!v && selected === v.voiceURI,
              busy = !!v && playing === v.voiceURI
            return (
              <div className="sf-va-row" key={v?.voiceURI || i} data-selected={chosen} data-playing={busy && started}>
                <button
                  className="sf-va-choose"
                  type="button"
                  disabled={!active || !v}
                  aria-pressed={chosen}
                  aria-label={v ? "Choose " + v.name : "No voice available"}
                  onClick={() => v && setSelected(v.voiceURI)}
                >
                  <span className="sf-va-indicator" aria-hidden="true" />
                  <span>
                    <strong>{v?.name || "Voice unavailable"}</strong>
                    <small>{v?.lang || "—"}</small>
                  </span>
                </button>
                <button
                  className="sf-va-play"
                  type="button"
                  disabled={!active || !v}
                  aria-pressed={busy}
                  aria-label={(busy ? "Stop " : "Preview ") + (v?.name || "voice")}
                  onClick={() => v && preview(v)}
                >
                  {busy ? (
                    <span className="sf-va-levels" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <i key={n} style={{ animationDelay: n * -0.13 + "s" }} />
                      ))}
                    </span>
                  ) : (
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="m6 4 6 4-6 4z" />
                    </svg>
                  )}
                </button>
              </div>
            )
          })}
        </div>
        <p className="sf-va-line" aria-label={LINE}>
          {LINE.split(" ").map((w, i, a) => {
            const start = a.slice(0, i).join(" ").length + (i ? 1 : 0)
            return (
              <span key={i} data-current={word >= start && word < start + w.length}>
                {w}{" "}
              </span>
            )
          })}
        </p>
        <p className="sf-va-notice" role="status">
          {notice || (!voices.length ? "No system voices are available in this browser." : "")}
        </p>
      </div>
      <style>{`.sf-voice-audition{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:#e4e8eb;color:#29313a;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.sf-voice-audition *{box-sizing:border-box}.sf-va-tray{width:390px}.sf-va-heading{display:flex;justify-content:space-between;align-items:center;margin:0 7px 13px;font-size:12px;font-weight:500}.sf-va-device{font-size:10px;color:#828d98;font-weight:400}.sf-va-voices{display:flex;flex-direction:column;gap:9px}.sf-va-row{height:65px;display:flex;align-items:center;gap:10px;padding:0 12px 0 3px;border-radius:15px;background:linear-gradient(130deg,#eff2f4,#e0e5e9);box-shadow:0 2px 3px #a5afb744,inset 0 1px 0 #fff9;border:1px solid #edf1f5;transition:box-shadow 150ms}.sf-va-row[data-selected=true]{background:linear-gradient(130deg,#e2e8ed,#dae1e7);box-shadow:inset 2px 2px 4px #9ba8b43b,inset -1px -1px 1px #fff8;border-color:#dce2e7}.sf-voice-audition button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation}.sf-va-choose{height:100%;display:flex;align-items:center;gap:16px;min-width:0;flex:1;padding:0 17px;border:0;background:none;text-align:left;border-radius:12px}.sf-va-indicator{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:#b3bdc6;box-shadow:inset 0 1px 1px #62738255,0 1px 0 #fff8}.sf-va-row[data-selected=true] .sf-va-indicator{background:#3474c1;box-shadow:inset 0 1px 1px #255493,0 0 5px #568fbc40,0 1px 0 #fff8}.sf-va-choose>span:last-child{min-width:0}.sf-va-choose strong{font-size:14px;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;letter-spacing:-.1px}.sf-va-choose small{display:block;font-size:10px;color:#8b95a0;margin-top:4px}.sf-va-play{width:44px;height:44px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;border:1px solid #eff3f6;background:linear-gradient(145deg,#f8fafb,#d9e0e6);box-shadow:2px 3px 5px #99a6b34a,-1px -1px 2px #fff9;transition:transform 120ms,box-shadow 120ms}.sf-va-play svg{width:20px;height:20px;fill:#566c80}.sf-va-play[aria-pressed=true],.sf-va-play:active{background:linear-gradient(145deg,#d3dde5,#e6ecf0);box-shadow:inset 2px 2px 4px #7b91a14a,inset -1px -1px 2px #ffffff70;transform:translateY(1px)}.sf-va-levels{display:flex;gap:2px;height:15px;align-items:center}.sf-va-levels i{height:9px;width:2px;background:#357ab3;border-radius:1px}.sf-va-row[data-playing=true] .sf-va-levels i{animation:sf-va-level 700ms ease-in-out infinite alternate}.sf-va-line{margin:20px 0 0;text-align:center;color:#687886;font-size:11px;letter-spacing:.04px}.sf-va-line span[data-current=true]{color:#2f6296}.sf-va-notice{font-size:10px;color:#7b8792;margin:8px 0 0;min-height:12px;text-align:center}.sf-voice-audition :focus-visible{outline:2px solid #367aac;outline-offset:3px}.sf-voice-audition button:disabled{opacity:.45;cursor:default}.sf-voice-audition[data-paused=true] *{animation-play-state:paused!important}@keyframes sf-va-level{to{transform:scaleY(.333333)}}@media(prefers-reduced-motion:reduce){.sf-voice-audition *{animation:none!important;transition:none!important}}`}</style>
    </section>
  )
}
