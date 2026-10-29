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

export default function Example({ active = true }: { active?: boolean }) {
  const [ready, setReady] = React.useState(false),
    [busy, setBusy] = React.useState(false),
    [recording, setRecording] = React.useState(false),
    [seconds, setSeconds] = React.useState(0),
    [src, setSrc] = React.useState(""),
    [playing, setPlaying] = React.useState(false),
    [notice, setNotice] = React.useState("Record a local voice note")
  const stream = React.useRef<MediaStream | null>(null),
    recorder = React.useRef<MediaRecorder | null>(null),
    audio = React.useRef<HTMLAudioElement>(null),
    url = React.useRef(""),
    generation = React.useRef(0),
    discard = React.useRef(false),
    takeId = React.useRef(0),
    reduced = useReduced()
  const stop = React.useCallback((cancel = false) => {
    discard.current = cancel
    if (cancel) {
      takeId.current++
    }
    const r = recorder.current
    if (r?.state === "recording") {
      r.stop()
    }
    setRecording(false)
  }, [])
  const release = React.useCallback(() => {
    generation.current++
    stop(true)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    audio.current?.pause()
    setReady(false)
    setBusy(false)
  }, [stop])
  React.useEffect(() => {
    if (!active) {
      release()
    }
  }, [active, release])
  React.useEffect(
    () => () => {
      generation.current++
      discard.current = true
      const r = recorder.current
      if (r?.state === "recording") {
        r.stop()
      }
      stream.current?.getTracks().forEach((t) => t.stop())
      if (url.current) {
        URL.revokeObjectURL(url.current)
      }
    },
    [],
  )
  async function enable() {
    setBusy(true)
    const gen = ++generation.current
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw Error()
      }
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (gen !== generation.current) {
        s.getTracks().forEach((t) => t.stop())
        return
      }
      stream.current = s
      setReady(true)
      setBusy(false)
      setNotice("Hold to record · release to finish")
    } catch {
      if (gen === generation.current) {
        setBusy(false)
        setNotice("Microphone unavailable or permission denied.")
      }
    }
  }
  function start() {
    if (!active || !ready || !stream.current || recorder.current?.state === "recording") {
      return
    }
    audio.current?.pause()
    discard.current = false
    const gen = generation.current,
      take = ++takeId.current
    try {
      const r = new MediaRecorder(stream.current),
        chunks: Blob[] = []
      recorder.current = r
      r.ondataavailable = (e) => {
        if (e.data.size) {
          chunks.push(e.data)
        }
      }
      r.onstop = () => {
        if (discard.current || gen !== generation.current || take !== takeId.current) {
          return
        }
        if (url.current) {
          URL.revokeObjectURL(url.current)
        }
        url.current = URL.createObjectURL(new Blob(chunks, { type: r.mimeType }))
        setSrc(url.current)
        setNotice("Saved on this device only")
      }
      r.start()
      setSeconds(0)
      setRecording(true)
    } catch {
      setNotice("Recording is not supported by this browser.")
    }
  }
  React.useEffect(() => {
    if (!recording) {
      return
    }
    const started = performance.now()
    const id = setInterval(() => {
      const elapsed = (performance.now() - started) / 1000
      setSeconds(elapsed)
      if (elapsed >= 30) {
        stop()
      }
    }, 100)
    return () => clearInterval(id)
  }, [recording, stop])
  async function playback() {
    if (!audio.current) {
      return
    }
    if (playing) {
      audio.current.pause()
      return
    }
    try {
      await audio.current.play()
    } catch {
      setNotice("This browser could not play the take.")
    }
  }
  return (
    <div className="sf-push-to-talk" data-paused={!active || reduced}>
      <section className="recorder">
        <div className="take">
          <span className="light" data-on={recording} />
          <output>
            {seconds.toFixed(1).padStart(4, "0")}
            <small>s</small>
          </output>
          <span className="limit">/ 30</span>
        </div>
        <button
          className="hold"
          disabled={!active || !ready}
          data-recording={recording}
          onPointerDown={(e) => {
            e.preventDefault()
            e.currentTarget.setPointerCapture(e.pointerId)
            start()
          }}
          onPointerUp={() => stop()}
          onPointerCancel={() => stop(true)}
          onLostPointerCapture={() => {
            if (recorder.current?.state === "recording") {
              stop(true)
            }
          }}
          onKeyDown={(e) => {
            if ([" ", "Enter"].includes(e.key)) {
              e.preventDefault()
              if (!e.repeat) {
                start()
              }
            }
            if (e.key === "Escape") {
              stop(true)
            }
          }}
          onKeyUp={(e) => {
            if ([" ", "Enter"].includes(e.key)) {
              e.preventDefault()
              stop()
            }
          }}
          onBlur={() => {
            if (recorder.current?.state === "recording") {
              stop(true)
            }
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <rect x="9" y="3" width="6" height="12" rx="3" />
            <path d="M6 10v2a6 6 0 0 0 12 0v-2M12 18v3" />
          </svg>
          {recording ? "Release to finish" : "Hold to talk"}
          <span className="key" aria-hidden>
            space
          </span>
        </button>
        <p role="status">{notice}</p>
        <footer>
          <button disabled={!active || busy} onClick={() => (ready ? release() : void enable())}>
            {busy ? "Opening…" : ready ? "Disable microphone" : "Enable microphone"}
          </button>
          {src && (
            <button disabled={!active || recording} onClick={() => void playback()}>
              {playing ? "Pause take" : "Play take"}
            </button>
          )}
        </footer>
        <audio
          ref={audio}
          src={src || undefined}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      </section>
      <style>{`.sf-push-to-talk{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-push-to-talk *{box-sizing:border-box}.sf-push-to-talk button,.sf-push-to-talk input,.sf-push-to-talk select,.sf-push-to-talk textarea{font:inherit;color:inherit}.sf-push-to-talk button{cursor:pointer;touch-action:manipulation}.sf-push-to-talk button:disabled{cursor:default;opacity:.45}.sf-push-to-talk :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-push-to-talk input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-push-to-talk .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-push-to-talk[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-push-to-talk *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-push-to-talk{background:#1c211c;color:#edf4de;padding:24px}.sf-push-to-talk .recorder{width:min(100%,375px)}.sf-push-to-talk .take{display:flex;align-items:center;gap:13px;margin-bottom:26px}.sf-push-to-talk .light{width:7px;height:7px;border-radius:50%;background:#4d584b}.sf-push-to-talk .light[data-on=true]{background:#c7ed58;box-shadow:0 0 13px #c7ed5860}.sf-push-to-talk output{font-size:43px;line-height:1;font-weight:300;letter-spacing:-1px;font-variant-numeric:tabular-nums}.sf-push-to-talk small{font-size:13px;margin-left:5px;color:#9eac91}.sf-push-to-talk .limit{font-size:11px;color:#61735c;margin-left:auto}.sf-push-to-talk .hold{width:100%;height:64px;border:1px solid #5f704a;background:#2b3426;border-radius:12px;color:#deedc5;padding:0 17px;display:flex;align-items:center;gap:13px;text-align:left;touch-action:none;user-select:none;font-size:15px;transition:background 140ms,color 140ms}.sf-push-to-talk .hold[data-recording=true]{background:#c7ec63;color:#27331c;border-color:#c7ec63}.sf-push-to-talk .hold svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}.sf-push-to-talk .key{margin-left:auto;border:1px solid currentColor;opacity:.45;border-radius:3px;padding:2px 5px;font:9px ui-monospace,monospace}.sf-push-to-talk p{font-size:11px;color:#889780;margin:13px 0;min-height:16px}.sf-push-to-talk footer{display:flex;justify-content:space-between;gap:8px}.sf-push-to-talk footer button{border:0;background:none;color:#b3c696;font-size:11px;min-height:44px;padding:0}.sf-push-to-talk .hold:disabled{opacity:.55}`}</style>
    </div>
  )
}
