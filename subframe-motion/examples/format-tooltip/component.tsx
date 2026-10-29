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

  const [selected, setSelected] = React.useState<boolean[]>([false, false, false, false]),
    [tip, setTip] = React.useState<number | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null),
    warmUntil = React.useRef(0),
    blocked = React.useRef<number | null>(null)
  const names = ["Bold", "Italic", "Underline", "Strikethrough"],
    id = React.useId()
  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = null
  }
  const show = (i: number, immediate = false) => {
    clear()
    if (blocked.current === i) {
      return
    }
    if (immediate || performance.now() < warmUntil.current) {
      setTip(i)
      warmUntil.current = performance.now() + 800
    } else {
      timer.current = setTimeout(() => {
        setTip(i)
        warmUntil.current = performance.now() + 800
      }, 400)
    }
  }
  const hide = () => {
    clear()
    if (tip !== null || performance.now() < warmUntil.current) {
      warmUntil.current = performance.now() + 650
    }
    timer.current = setTimeout(() => setTip(null), 90)
  }
  React.useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    },
    [],
  )
  React.useEffect(() => {
    if (!active) {
      if (timer.current) {
        clearTimeout(timer.current)
      }
      setTip(null)
      warmUntil.current = 0
    }
  }, [active])

  return (
    <section
      className="sf-w2-format-tooltip"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="document">
        <p
          className="quote"
          style={{
            fontWeight: selected[0] ? 700 : 400,
            fontStyle: selected[1] ? "italic" : "normal",
            textDecoration: [selected[2] ? "underline" : "", selected[3] ? "line-through" : ""].join(" "),
          }}
        >
          Leave room
          <br />
          for the unexpected.
        </p>
        <div
          className="toolbar"
          role="group"
          aria-label="Text formatting"
          onPointerLeave={() => {
            blocked.current = null
            hide()
          }}
        >
          {names.map((n, i) => (
            <button
              type="button"
              key={n}
              aria-label={n}
              aria-pressed={selected[i]}
              aria-describedby={tip === i ? id : undefined}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse" && active) {
                  show(i)
                }
              }}
              onPointerLeave={() => {
                blocked.current = null
                hide()
              }}
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible")) {
                  show(i, true)
                }
              }}
              onBlur={hide}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  clear()
                  setTip(null)
                  blocked.current = i
                }
              }}
              onClick={() => {
                setSelected((s) => s.map((v, j) => (i === j ? !v : v)))
                clear()
                setTip(null)
                blocked.current = i
              }}
            >
              <span
                style={{
                  fontWeight: i === 0 ? 700 : 400,
                  fontStyle: i === 1 ? "italic" : "normal",
                  textDecoration: i === 2 ? "underline" : i === 3 ? "line-through" : "none",
                }}
              >
                {["B", "I", "U", "S"][i]}
              </span>
            </button>
          ))}
          <div
            id={id}
            role="tooltip"
            className="tip"
            aria-hidden={tip === null}
            style={{
              opacity: tip === null ? 0 : 1,
              transform: `translateX(${(tip ?? 0) * 48}px) translateY(${tip === null ? 4 : 0}px)`,
            }}
          >
            {names[tip ?? 0]}
          </div>
        </div>
      </div>

      <style>{`.sf-w2-format-tooltip{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-format-tooltip *{box-sizing:border-box}.sf-w2-format-tooltip button,.sf-w2-format-tooltip input,.sf-w2-format-tooltip select,.sf-w2-format-tooltip textarea{font:inherit}.sf-w2-format-tooltip button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-format-tooltip button:disabled{opacity:.4;cursor:default}.sf-w2-format-tooltip button:active:not(:disabled){transform:scale(.98)}.sf-w2-format-tooltip input,.sf-w2-format-tooltip textarea{font-size:16px;min-width:0}.sf-w2-format-tooltip button:focus-visible,.sf-w2-format-tooltip input:focus-visible,.sf-w2-format-tooltip select:focus-visible,.sf-w2-format-tooltip textarea:focus-visible,.sf-w2-format-tooltip [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-format-tooltip h2,.sf-w2-format-tooltip p{margin:0}.sf-w2-format-tooltip .row{display:flex;align-items:center;gap:12px}.sf-w2-format-tooltip .between{justify-content:space-between}.sf-w2-format-tooltip .muted{opacity:.6}.sf-w2-format-tooltip .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-format-tooltip[data-still=true] *,.sf-w2-format-tooltip[data-still=true] *::before,.sf-w2-format-tooltip[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-format-tooltip *,.sf-w2-format-tooltip *::before,.sf-w2-format-tooltip *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-format-tooltip button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-format-tooltip{display:grid;place-items:center;background:#e8ebe9;color:#1f2c29;padding:24px}.sf-w2-format-tooltip .document{position:relative;width:min(100%,390px);height:244px;background:#fff;padding:23px 25px;border:1px solid #d7ded9;box-shadow:0 8px 18px #20372b07}.sf-w2-format-tooltip .quote{font:30px/1.12 Georgia,serif;letter-spacing:-.8px;margin-top:20px}.sf-w2-format-tooltip .toolbar{position:absolute;bottom:18px;left:25px;display:flex;gap:4px;background:#f1f4f2;border:1px solid #dfe6e1;padding:4px;border-radius:8px}.sf-w2-format-tooltip .toolbar button{width:44px;padding:0;border-radius:4px;color:#63766a}.sf-w2-format-tooltip .toolbar button[aria-pressed=true]{background:white;box-shadow:0 1px 3px #24452b1a;color:#173c2b}.sf-w2-format-tooltip .toolbar button span{font-size:16px;font-family:Georgia,serif}.sf-w2-format-tooltip .tip{position:absolute;left:4px;bottom:calc(100% + 9px);height:29px;min-width:60px;background:#213a2e;color:#f5f8f6;padding:7px 9px;border-radius:5px;font-size:10px;pointer-events:none;transition:transform .16s cubic-bezier(.2,.8,.2,1),opacity .12s;white-space:nowrap}.sf-w2-format-tooltip .tip::after{content:'';position:absolute;left:17px;bottom:-3px;width:6px;height:6px;background:#213a2e;transform:rotate(45deg)}@container(max-width:360px){.sf-w2-format-tooltip .document{padding:20px;height:234px}.sf-w2-format-tooltip .quote{font-size:27px}.sf-w2-format-tooltip .toolbar{left:20px}}`}</style>
    </section>
  )
}
