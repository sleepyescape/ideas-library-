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
const TRACKS = [
  { id: "morning", title: "A slow morning", artist: "Soft Signal", duration: "3:42", color: "#dfae70" },
  { id: "streets", title: "Side streets", artist: "North Parade", duration: "4:08", color: "#8baebb" },
  { id: "blue", title: "Blue hour", artist: "Kiri", duration: "2:57", color: "#c37b61" },
]
const STEP = 68
function reorder(items: string[], id: string, index: number) {
  const next = items.filter((v) => v !== id)
  next.splice(index, 0, id)
  return next
}
function Cover({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden>
      {index === 0 ? (
        <>
          <rect width="48" height="48" fill="#d1a566" />
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse
              key={i}
              cx="24"
              cy="24"
              rx="7"
              ry="20"
              fill="none"
              stroke="#6e332c"
              strokeWidth="2"
              transform={`rotate(${i * 30} 24 24)`}
            />
          ))}
          <circle cx="24" cy="24" r="4" fill="#5b2523" />
        </>
      ) : index === 1 ? (
        <>
          <rect width="48" height="48" fill="#a6c3c6" />
          {Array.from({ length: 6 }, (_, i) => (
            <path
              key={i}
              d={`M${i * 11 - 18} -8v30q0 6 6 6h8q6 0 6 6v23`}
              stroke="#215568"
              strokeWidth="3"
              fill="none"
            />
          ))}
        </>
      ) : (
        <>
          <rect width="48" height="48" fill="#ca7559" />
          <path d="M4 39 24 5l20 34z" fill="#332c35" />
          <circle cx="24" cy="29" r="10" fill="#e9b59a" />
          <path d="M4 39h40" stroke="#f0c5a7" strokeWidth="2" />
        </>
      )}
    </svg>
  )
}
export default function Example({ active = true }: { active?: boolean }) {
  const [order, setOrder] = React.useState(TRACKS.map((t) => t.id)),
    [drag, setDrag] = React.useState<{ id: string; y: number } | null>(null),
    [keyboard, setKeyboard] = React.useState(false),
    [announcement, setAnnouncement] = React.useState("")
  const orderRef = React.useRef(order),
    list = React.useRef<HTMLDivElement>(null)
  const gesture = React.useRef<{
    id: string
    pointer: number
    startY: number
    origin: number
    scale: number
    original: string[]
  } | null>(null)
  const update = (next: string[]) => {
    orderRef.current = next
    setOrder(next)
  }
  const finish = React.useCallback((cancel: boolean) => {
    const g = gesture.current
    if (!g) {
      return
    }
    gesture.current = null
    if (cancel) {
      orderRef.current = g.original
      setOrder(g.original)
    } else {
      setAnnouncement(
        `${TRACKS.find((t) => t.id === g.id)?.title} moved to position ${orderRef.current.indexOf(g.id) + 1}`,
      )
    }
    setDrag(null)
    if (list.current?.hasPointerCapture(g.pointer)) {
      list.current.releasePointerCapture(g.pointer)
    }
  }, [])
  React.useEffect(() => {
    if (!active) {
      finish(true)
    }
  }, [active, finish])
  React.useEffect(() => {
    const blur = () => finish(true)
    window.addEventListener("blur", blur)
    return () => window.removeEventListener("blur", blur)
  }, [finish])
  return (
    <section
      className="sf-queue-reorder"
      data-still={!active || keyboard}
      onKeyDownCapture={(e) => {
        setKeyboard(true)
        if (e.key === "Escape") {
          e.preventDefault()
          finish(true)
        }
      }}
      onPointerDownCapture={() => setKeyboard(false)}
      aria-label="Reorder listening queue"
    >
      <div className="queue">
        <header>
          <div>
            <span className="queue-icon" aria-hidden>
              <svg viewBox="0 0 20 20">
                <path d="M3 5h14M3 10h14M3 15h8" />
                <path d="m14 13 4 3-4 3z" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <strong>Up next</strong>
          </div>
          <span>3 tracks · 10:47</span>
        </header>
        <div
          className="tracks"
          ref={list}
          role="list"
          aria-label="Listening queue"
          onPointerMove={(e) => {
            const g = gesture.current
            if (!g || e.pointerId !== g.pointer) {
              return
            }
            const y = Math.max(0, Math.min(STEP * 2, g.origin + (e.clientY - g.startY) * g.scale))
            setDrag({ id: g.id, y })
            const target = Math.round(y / STEP)
            if (target !== orderRef.current.indexOf(g.id)) {
              update(reorder(orderRef.current, g.id, target))
            }
          }}
          onPointerUp={(e) => {
            if (e.pointerId === gesture.current?.pointer) {
              finish(false)
            }
          }}
          onPointerCancel={(e) => {
            if (e.pointerId === gesture.current?.pointer) {
              finish(true)
            }
          }}
          onLostPointerCapture={(e) => {
            if (e.pointerId === gesture.current?.pointer) {
              finish(true)
            }
          }}
        >
          {order.map((id, i) => {
            const index = TRACKS.findIndex((t) => t.id === id),
              t = TRACKS[index]
            return (
              <div
                key={id}
                role="listitem"
                className="track"
                data-id={id}
                data-dragging={drag?.id === id}
                style={{
                  transform: `translateY(${drag?.id === id ? drag.y : i * STEP}px)`,
                  zIndex: drag?.id === id ? 2 : 1,
                }}
              >
                <span className="number" aria-hidden>
                  {i + 1}
                </span>
                <span className="cover">
                  <Cover index={index} />
                </span>
                <div className="track-label">
                  <strong>{t.title}</strong>
                  <small>{t.artist}</small>
                </div>
                <span className="duration">{t.duration}</span>
                <button
                  type="button"
                  disabled={!active}
                  className="grip"
                  aria-label={`Move ${t.title}, use up and down arrows`}
                  onKeyDown={(e) => {
                    if (["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
                      e.preventDefault()
                      const target =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                          ? 2
                          : Math.max(0, Math.min(2, i + (e.key === "ArrowDown" ? 1 : -1)))
                      update(reorder(orderRef.current, id, target))
                      setAnnouncement(`${t.title} moved to position ${target + 1}`)
                    }
                  }}
                  onPointerDown={(e) => {
                    if (!active || gesture.current || e.button !== 0 || !list.current) {
                      return
                    }
                    e.preventDefault()
                    const r = list.current.getBoundingClientRect()
                    gesture.current = {
                      id,
                      pointer: e.pointerId,
                      startY: e.clientY,
                      origin: i * STEP,
                      scale: list.current.offsetHeight / r.height,
                      original: [...orderRef.current],
                    }
                    list.current.setPointerCapture(e.pointerId)
                    e.currentTarget.focus({ preventScroll: true })
                    setDrag({ id, y: i * STEP })
                  }}
                >
                  <svg viewBox="0 0 16 20" aria-hidden>
                    {[5, 10, 15].flatMap((y) => [5, 11].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" />))}
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
        <div className="sr" role="status">
          {announcement}
        </div>
      </div>
      <style>{`
.sf-queue-reorder{width:100%;height:100%;display:grid;place-items:center;background:#202122;color:#e9e8e4;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}.sf-queue-reorder *{box-sizing:border-box}.sf-queue-reorder button{font:inherit;color:inherit;cursor:grab;touch-action:none}.sf-queue-reorder button:disabled{cursor:default}.sf-queue-reorder :focus-visible{outline:2px solid #d2c79c;outline-offset:-4px;border-radius:7px}.sf-queue-reorder .queue{width:450px;background:linear-gradient(#343638,#2f3132);border:1px solid #4a4c4d;border-radius:15px;padding:0 14px 16px;box-shadow:inset 0 1px 0 #ffffff09,0 18px 36px -12px #0006}.sf-queue-reorder header{display:flex;align-items:center;justify-content:space-between;padding:0 7px;height:59px;border-bottom:1px solid #ffffff0b;margin-bottom:10px}.sf-queue-reorder header>div{display:flex;align-items:center;gap:9px}.sf-queue-reorder header strong{font-size:12px;font-weight:500}.sf-queue-reorder header>span{font-size:10px;color:#929593}.sf-queue-reorder header svg{width:16px;height:16px;fill:none;stroke:#aeb3ad;stroke-width:1.25;stroke-linecap:round}.sf-queue-reorder .tracks{height:204px;position:relative;touch-action:none}.sf-queue-reorder .track{position:absolute;top:0;left:0;right:0;height:64px;display:flex;gap:12px;align-items:center;background:#333536;border:1px solid transparent;border-radius:9px;padding:7px;transition:transform 220ms cubic-bezier(.22,1,.36,1),box-shadow 160ms,background-color 160ms;user-select:none}.sf-queue-reorder .track[data-dragging=true]{transition:none;background:#434646;border-color:#606664;box-shadow:0 10px 20px #11182066;cursor:grabbing}.sf-queue-reorder .track[data-dragging=true] button{cursor:grabbing;outline:none}.sf-queue-reorder .number{width:12px;text-align:center;color:#858b87;font-size:10px;font-variant-numeric:tabular-nums}.sf-queue-reorder .cover{display:block;width:46px;height:46px;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px #0005;flex:none}.sf-queue-reorder .cover svg{width:100%;height:100%;display:block}.sf-queue-reorder .track-label{flex:1;min-width:0}.sf-queue-reorder .track strong{display:block;font-size:12px;font-weight:450;letter-spacing:-.1px}.sf-queue-reorder small{display:block;color:#a0a6a0;font-size:10px;margin-top:3px}.sf-queue-reorder .duration{font-size:10px;color:#9aa19a;font-variant-numeric:tabular-nums}.sf-queue-reorder .grip{width:44px;height:48px;display:grid;place-items:center;background:none;border:0;padding:0;color:#9ca49c}.sf-queue-reorder .grip svg{width:15px;height:20px;fill:currentColor}.sf-queue-reorder .sr{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}.sf-queue-reorder[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-queue-reorder *{transition:none!important}}`}</style>
    </section>
  )
}
