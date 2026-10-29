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
function Stamp({ inverted, rotation }: { inverted: boolean; rotation: number }) {
  return (
    <svg viewBox="0 0 180 180" className="stamp" style={{ transform: `rotate(${rotation * 90}deg)` }} aria-hidden>
      <rect
        x=".5"
        y=".5"
        width="179"
        height="179"
        rx="3"
        fill={inverted ? "#193bc1" : "#eee9db"}
        stroke={inverted ? "#ffffff12" : "#00000014"}
      />
      <g fill={inverted ? "#eee9db" : "#193bc1"}>
        <path d="M88 27a63 63 0 1 1-63 63h34a29 29 0 1 0 29-29Z" />
        <path d="M27 27h42v42H27z" />
      </g>
    </svg>
  )
}
export default function Example({ active = true }: { active?: boolean }) {
  const [objects, setObjects] = React.useState([{ inverted: false, rotation: 0 }])
  const [target, setTarget] = React.useState(0)
  const copies = objects.length - 1
  const edit = (change: (item: { inverted: boolean; rotation: number }) => { inverted: boolean; rotation: number }) =>
    setObjects((items) => items.map((item, i) => (i === target ? change(item) : item)))
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null),
    [keyboard, setKeyboard] = React.useState(false),
    [notice, setNotice] = React.useState("Original")
  const root = React.useRef<HTMLDivElement>(null),
    menu = React.useRef<HTMLDivElement>(null),
    trigger = React.useRef<HTMLButtonElement>(null)
  const opener = React.useRef<HTMLElement | null>(null)
  const open = (element: HTMLElement, x?: number, y?: number, index = target) => {
    if (!active || !root.current) {
      return
    }
    opener.current = element
    setTarget(index)
    const r = root.current.getBoundingClientRect(),
      scale = 600 / r.width
    const px = x === undefined ? 410 : (x - r.left) * scale,
      py = y === undefined ? 82 : (y - r.top) * scale
    setPosition({ x: Math.max(16, Math.min(px, 398)), y: Math.max(16, Math.min(py, 215)) })
  }
  const close = (restore = true) => {
    setPosition(null)
    if (restore) {
      opener.current?.focus({ preventScroll: true })
    }
  }
  React.useEffect(() => {
    if (position) {
      menu.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true })
    }
  }, [position])
  React.useEffect(() => {
    if (!active) {
      setPosition(null)
    }
  }, [active])
  React.useEffect(() => {
    if (!position) {
      return
    }
    const outside = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node) && !trigger.current?.contains(e.target as Node)) {
        setPosition(null)
      }
    }
    const blur = () => setPosition(null)
    document.addEventListener("pointerdown", outside)
    window.addEventListener("blur", blur)
    return () => {
      document.removeEventListener("pointerdown", outside)
      window.removeEventListener("blur", blur)
    }
  }, [position])
  return (
    <section
      className="sf-cursor-menu"
      ref={root}
      data-still={!active || keyboard}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDownCapture={() => setKeyboard(true)}
      aria-label="Artwork context actions"
    >
      <div className="workspace">
        <header>
          <span className="file-icon" aria-hidden>
            <svg viewBox="0 0 20 20">
              <path d="M4 3h8l4 4v10H4zM12 3v5h4" />
            </svg>
          </span>
          <strong>Counterform</strong>
          <span className="extension">.svg</span>
          <button
            type="button"
            ref={trigger}
            disabled={!active}
            className="options"
            aria-label="Artwork actions"
            aria-haspopup="menu"
            aria-expanded={!!position}
            onClick={(e) => (position ? close() : open(e.currentTarget))}
          >
            •••
          </button>
        </header>
        <div className="artboard" data-copies={copies}>
          {objects.map((object, i) => (
            <button
              type="button"
              key={i}
              disabled={!active}
              className="object"
              aria-label={i ? "Open copy actions" : "Open artwork actions"}
              aria-haspopup="menu"
              aria-expanded={!!position && target === i}
              onClick={(e) =>
                open(e.currentTarget, e.detail === 0 ? undefined : e.clientX, e.detail === 0 ? undefined : e.clientY, i)
              }
              onContextMenu={(e) => {
                e.preventDefault()
                open(e.currentTarget, e.clientX, e.clientY, i)
              }}
              onKeyDown={(e) => {
                if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
                  e.preventDefault()
                  open(e.currentTarget, undefined, undefined, i)
                }
              }}
            >
              <Stamp inverted={object.inverted} rotation={object.rotation} />
              {copies > 0 && <span>{i ? "Copy" : "Original"}</span>}
            </button>
          ))}
        </div>
        <footer>
          <span role="status">
            <i aria-hidden />
            {notice}
          </span>
          <span>
            {copies + 1} {copies ? "objects" : "object"}
          </span>
          {(copies > 0 || objects.some((item) => item.rotation > 0 || item.inverted)) && (
            <button
              type="button"
              disabled={!active}
              onClick={() => {
                setObjects([{ inverted: false, rotation: 0 }])
                setTarget(0)
                setNotice("Original")
              }}
            >
              Reset
            </button>
          )}
        </footer>
      </div>
      {position && (
        <div
          className="menu"
          role="menu"
          aria-label="Artwork actions"
          ref={menu}
          style={{ left: position.x, top: position.y }}
          onKeyDown={(e) => {
            const nodes = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")),
              i = nodes.indexOf(document.activeElement as HTMLButtonElement)
            if (e.key === "Escape") {
              e.preventDefault()
              close()
            } else if (e.key === "Tab") {
              close(false)
            } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
              e.preventDefault()
              nodes[
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                  ? nodes.length - 1
                  : (i + (e.key === "ArrowDown" ? 1 : -1) + nodes.length) % nodes.length
              ]?.focus()
            }
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              edit((item) => ({ ...item, rotation: item.rotation + 1 }))
              setNotice("Rotated 90°")
              close()
            }}
          >
            <svg viewBox="0 0 20 20" aria-hidden>
              <path d="M5 5a7 7 0 1 1-2 7M5 1v5H1" />
            </svg>
            Rotate 90°
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              edit((item) => ({ ...item, inverted: !item.inverted }))
              setNotice(objects[target].inverted ? "Paper restored" : "Ink inverted")
              close()
            }}
          >
            <svg viewBox="0 0 20 20" aria-hidden>
              <circle cx="10" cy="10" r="7" />
              <path d="M10 3a7 7 0 0 1 0 14Z" fill="currentColor" />
            </svg>
            Invert ink
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={copies >= 1}
            onClick={() => {
              setObjects((items) => [...items, { ...items[target] }])
              setNotice("Copy created")
              close()
            }}
          >
            <svg viewBox="0 0 20 20" aria-hidden>
              <rect x="7" y="7" width="10" height="10" rx="1.5" />
              <path d="M12 4V2H2v10h2" />
            </svg>
            Duplicate
          </button>
        </div>
      )}
      <style>{`
.sf-cursor-menu{width:100%;height:100%;position:relative;display:grid;place-items:center;background:#d9dce2;color:#30343e;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;isolation:isolate;-webkit-font-smoothing:antialiased}.sf-cursor-menu *{box-sizing:border-box}.sf-cursor-menu button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation}.sf-cursor-menu button:disabled{cursor:default;opacity:.4}.sf-cursor-menu :focus-visible{outline:2px solid #345bc7;outline-offset:3px}.sf-cursor-menu .workspace{width:486px;height:295px;background:#f8f9fb;border:1px solid #b9c0cb;border-radius:10px;box-shadow:0 14px 30px -10px #29344930,0 1px 3px #29344912;overflow:hidden}.sf-cursor-menu header{height:45px;display:flex;align-items:center;padding:0 15px;border-bottom:1px solid #dfe4eb;background:linear-gradient(#fdfefe,#f1f3f7)}.sf-cursor-menu header strong{font-size:11px;font-weight:500;margin-left:8px}.sf-cursor-menu .extension{color:#9ca3af;font-size:11px}.sf-cursor-menu .file-icon svg{width:17px;height:17px;fill:none;stroke:#7b8699;stroke-width:1.2}.sf-cursor-menu .options{width:44px;height:44px;margin-left:auto;border:0;background:none;font-size:14px;letter-spacing:1px}.sf-cursor-menu .artboard{height:210px;display:flex;justify-content:center;align-items:center;gap:18px;background-image:radial-gradient(#b9c0cd70 .7px,transparent .7px);background-size:10px 10px}.sf-cursor-menu .object{position:relative;width:170px;height:170px;padding:0;background:none;border:0;transition:transform 260ms cubic-bezier(.22,1,.36,1);box-shadow:0 3px 5px #17264512,0 15px 24px -15px #17264550;border-radius:3px}.sf-cursor-menu .object .stamp{display:block;width:100%;height:100%;transition:transform 280ms cubic-bezier(.22,1,.36,1)}.sf-cursor-menu .artboard[data-copies="1"] .object{width:152px;height:152px;animation:sf-context-copy 220ms cubic-bezier(.22,1,.36,1)}.sf-cursor-menu .object>span{position:absolute;bottom:-22px;left:0;width:100%;color:#8490a0;font-size:9px}.sf-cursor-menu footer{height:39px;border-top:1px solid #e1e5ec;display:flex;align-items:center;gap:15px;padding:0 15px;color:#8d95a1;font-size:10px}.sf-cursor-menu footer>span:first-child{margin-right:auto;display:flex;align-items:center;gap:6px;color:#727e90}.sf-cursor-menu footer i{width:4px;height:4px;border-radius:50%;background:#637cab}.sf-cursor-menu footer button{border:0;background:none;padding:0;height:36px;font-size:10px;color:#516fa8}.sf-cursor-menu .menu{position:absolute;z-index:5;width:186px;background:#fff;border:1px solid #c4cbd4;border-radius:9px;padding:5px;box-shadow:0 3px 6px #202d4014,0 16px 34px #14254238;animation:sf-context-menu 150ms cubic-bezier(.22,1,.36,1);transform-origin:top left}.sf-cursor-menu .menu button{display:flex;align-items:center;gap:9px;height:44px;width:100%;text-align:left;border:0;background:none;padding:0 9px;border-radius:5px;font-size:11px}.sf-cursor-menu .menu button:focus{background:#edf1f8;outline:none;color:#28456f}.sf-cursor-menu .menu svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}.sf-cursor-menu .menu span{margin-left:auto;color:#a9b0bb;font-size:10px}.sf-cursor-menu .menu button:last-child{border-top:1px solid #eef0f4;border-radius:0 0 5px 5px}.sf-cursor-menu[data-still=true] *{transition:none!important;animation:none!important}@media(prefers-reduced-motion:reduce){.sf-cursor-menu *{transition:none!important;animation:none!important}}@keyframes sf-context-menu{from{opacity:0;transform:scale(.97) translateY(-2px)}to{opacity:1;transform:none}}@keyframes sf-context-copy{from{opacity:.5;transform:translateX(-8px)}to{opacity:1;transform:none}}`}</style>
    </section>
  )
}
