/**
 * MIT License
 *
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

import { Fragment, useEffect, useRef, useState } from "react"
const names = ["FORM", "VOID", "FIELD"],
  colors = ["#e33427", "#eeece6", "#1d3bc5"],
  inks = ["#211511", "#1b1b1b", "#f1f0e5"]
export default function FolioStack({ active = true }: { active?: boolean }) {
  const box = useRef<HTMLDivElement>(null),
    draw = useRef<() => void>(() => {})
  const [page, setPage] = useState(0),
    [reduced, setReduced] = useState(true)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    const el = box.current
    if (!el) {
      return
    }
    const update = () => {
      const cards = Array.from(el.querySelectorAll<HTMLElement>(".fs-slot")),
        anchors = Array.from(el.querySelectorAll<HTMLElement>(".fs-anchor")),
        h = el.clientHeight
      let selected = 0
      cards.forEach((slot, i) => {
        const cover = slot.firstElementChild as HTMLElement,
          next = cards[i + 1],
          top = next ? anchors[i + 1].offsetTop - el.scrollTop : h
        const depth = next ? Math.max(0, Math.min(1, (h - 30 - top) / (h - 55))) : 0
        cover.style.transform = reduced ? "" : `scale(${1 - depth * 0.09})`
        cover.style.filter = reduced ? "" : `brightness(${1 - depth * 0.2})`
        if (el.scrollTop >= anchors[i].offsetTop - i * 12 - 20) {
          selected = i
        }
      })
      setPage(selected)
    }
    draw.current = update
    const observer = new ResizeObserver(update)
    observer.observe(el)
    update()
    return () => {
      observer.disconnect()
      draw.current = () => {}
    }
  }, [reduced])
  useEffect(() => {
    if ((!active || reduced) && box.current) {
      box.current.scrollTo({ top: box.current.scrollTop, behavior: "instant" })
    }
  }, [active, reduced])
  return (
    <section className="sf-folio-stack">
      <header>
        <span>COLLECTED / 2026</span>
        <span>{String(page + 1).padStart(2, "0")} — 03</span>
      </header>
      <div
        className="fs-scroll"
        ref={box}
        onScroll={() => draw.current()}
        tabIndex={0}
        aria-label="Scroll three exhibition folios"
      >
        {names.map((name, i) => (
          <Fragment key={name}>
            <span className="fs-anchor" aria-hidden="true" />
            <article className="fs-slot" style={{ top: 10 + i * 12, zIndex: i + 1 }}>
              <div className="fs-cover" style={{ background: colors[i], color: inks[i] }}>
                <div className="fs-meta">
                  <span>STUDIES IN SPACE</span>
                  <span>Nº 0{i + 1}</span>
                </div>
                <strong>{name}</strong>
                <svg viewBox="0 0 400 120" aria-hidden="true">
                  {i === 0 ? (
                    <>
                      {Array.from({ length: 10 }, (_, j) => (
                        <path
                          key={j}
                          d={`M${80 + j * 9} 10 L${130 + j * 9} 110 L${280 - j * 5} 110 L${230 - j * 5} 10Z`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      ))}
                    </>
                  ) : i === 1 ? (
                    <>
                      <rect x="45" y="10" width="310" height="100" fill="currentColor" />
                      <ellipse cx="200" cy="60" rx="106" ry="50" fill={colors[i]} />
                      <ellipse cx="200" cy="60" rx="36" ry="50" fill="currentColor" />
                    </>
                  ) : (
                    <>
                      {Array.from({ length: 22 }, (_, j) => (
                        <path
                          key={j}
                          d={`M${24 + j * 16} 105 Q${200 + (j - 11) * 3} ${-40 + Math.abs(j - 11) * 6} ${
                            375 - j * 8
                          } 105`}
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="1"
                        />
                      ))}
                    </>
                  )}
                </svg>
                <span className="fs-edition">OBJECTS & OBSERVATIONS</span>
              </div>
            </article>
          </Fragment>
        ))}
        <div className="fs-tail" />
      </div>
      <button
        className="fs-next"
        type="button"
        aria-label={page === 2 ? "Return to first folio" : "Next folio"}
        onClick={(e) => {
          const el = box.current
          if (!el) {
            return
          }
          const next = (page + 1) % 3,
            slot = el.querySelectorAll<HTMLElement>(".fs-anchor")[next]
          el.scrollTo({
            top: slot.offsetTop - next * 12 - 10,
            behavior: active && !reduced && e.detail !== 0 ? "smooth" : "instant",
          })
        }}
      >
        ↓
      </button>
      <style>{`.sf-folio-stack{position:relative;box-sizing:border-box;width:100%;height:100%;min-height:280px;overflow:hidden;background:#262a30;color:#d7d9d9;font-family:Arial,sans-serif;container-type:size}.sf-folio-stack *{box-sizing:border-box}.sf-folio-stack header{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;font:9px monospace;letter-spacing:.07em}.sf-folio-stack .fs-scroll{height:calc(100% - 44px);overflow:auto;overscroll-behavior:contain;scrollbar-width:none;position:relative;padding:0 24px}.sf-folio-stack .fs-scroll::-webkit-scrollbar{display:none}.sf-folio-stack .fs-anchor{display:block;height:0;width:0}.sf-folio-stack .fs-slot{height:calc(100cqh - 100px);min-height:180px;position:sticky;margin-bottom:26px}.sf-folio-stack .fs-cover{height:100%;padding:18px 22px;position:relative;overflow:hidden;transform-origin:50% 0;box-shadow:0 3px 7px #0003}.sf-folio-stack .fs-meta{display:flex;justify-content:space-between;font:8px monospace;letter-spacing:.06em}.sf-folio-stack strong{font:900 clamp(38px,12cqw,74px)/.9 Arial;letter-spacing:-.08em;display:block;margin:14px 0 0}.sf-folio-stack svg{width:70%;height:42%;display:block;position:absolute;right:2%;bottom:12%}.sf-folio-stack .fs-edition{position:absolute;left:22px;bottom:15px;font:7px monospace;letter-spacing:.1em}.sf-folio-stack .fs-tail{height:60px}.sf-folio-stack .fs-next{position:absolute;bottom:10px;right:5px;z-index:5;border:1px solid #ffffff2a;border-radius:50%;width:44px;height:44px;background:#262a30;color:#eee;font:24px Arial;cursor:pointer}.sf-folio-stack :focus-visible{outline:2px solid #fff;outline-offset:-3px}@container(max-width:380px){.sf-folio-stack .fs-scroll{padding:0 17px}.sf-folio-stack .fs-cover{padding:16px}.sf-folio-stack strong{margin-top:19px}.sf-folio-stack .fs-edition{left:16px;font-size:6px}}`}</style>
    </section>
  )
}
