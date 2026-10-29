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

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
const groups = [
  {
    name: "Collection",
    items: [
      ["Photography", "Portraits", "Architecture", "Landscape"],
      ["Print & paper", "Woodblock", "Botanical", "Typography"],
    ],
  },
  {
    name: "Explore",
    items: [
      ["By period", "1800–1899", "1900–1949", "1950–today"],
      ["By medium", "Photograph", "Print", "Object"],
    ],
  },
]
export default function LayeredMenu({ active = true }: { active?: boolean }) {
  const panelId = useId()
  const [open, setOpen] = useState<number | null>(0),
    [level, setLevel] = useState<number | null>(null),
    [selected, setSelected] = useState("Architecture"),
    [instant, setInstant] = useState(false),
    root = useRef<HTMLElement>(null),
    triggers = useRef<(HTMLButtonElement | null)[]>([])
  const previousLevel = useRef<number | null>(null)
  useLayoutEffect(() => {
    if (level !== null) {
      root.current?.querySelector<HTMLButtonElement>(".lm-back")?.focus({ preventScroll: true })
    } else if (previousLevel.current !== null) {
      root.current
        ?.querySelectorAll<HTMLButtonElement>(".lm-page")[0]
        ?.querySelectorAll("button")
        [previousLevel.current]?.focus({ preventScroll: true })
    }
    previousLevel.current = level
  }, [level])
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(null)
        setLevel(null)
      }
    }
    document.addEventListener("pointerdown", outside)
    return () => document.removeEventListener("pointerdown", outside)
  }, [])
  const close = () => {
    const i = open
    setOpen(null)
    setLevel(null)
    if (i !== null) {
      triggers.current[i]?.focus({ preventScroll: true })
    }
  }
  const choose = (value: string) => {
    setSelected(value)
    close()
  }
  return (
    <section
      ref={root}
      className="sf-layered-menu"
      inert={!active}
      data-still={!active || instant}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setInstant(true)
          level !== null ? setLevel(null) : close()
        }
      }}
      onBlur={(e) => {
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(null)
          setLevel(null)
        }
      }}
    >
      <header>
        <nav aria-label="Archive navigation">
          {groups.map((g, i) => (
            <button
              type="button"
              key={g.name}
              ref={(el) => {
                triggers.current[i] = el
              }}
              aria-expanded={open === i}
              aria-controls={panelId}
              onClick={(e) => {
                setInstant(e.detail === 0)
                setOpen(open === i ? null : i)
                setLevel(null)
              }}
            >
              {g.name}
              <span aria-hidden="true">⌄</span>
            </button>
          ))}
        </nav>
      </header>
      <div className="lm-background">
        <span>Selected collection</span>
        <strong>{selected}</strong>
      </div>
      {open !== null && (
        <div className="lm-panel" id={panelId}>
          <div className="lm-track" data-deep={level !== null}>
            <div className="lm-page" inert={level !== null}>
              <small>{groups[open].name}</small>
              {groups[open].items.map((g, i) => (
                <button
                  type="button"
                  key={g[0]}
                  onClick={(e) => {
                    setInstant(e.detail === 0)
                    setLevel(i)
                  }}
                >
                  <span className="lm-glyph">{i ? "▦" : "◫"}</span>
                  <span>
                    {g[0]}
                    <small>{g.slice(1).join(" · ")}</small>
                  </span>
                  <b aria-hidden="true">→</b>
                </button>
              ))}
            </div>
            <div className="lm-page" inert={level === null}>
              <button
                type="button"
                className="lm-back"
                onClick={(e) => {
                  setInstant(e.detail === 0)
                  setLevel(null)
                }}
              >
                ← <span>{level !== null ? groups[open].items[level][0] : ""}</span>
              </button>
              {level !== null &&
                groups[open].items[level].slice(1).map((v) => (
                  <button type="button" key={v} className="lm-leaf" onClick={() => choose(v)}>
                    <span>{v}</span>
                    {selected === v && <i />}
                    <b aria-hidden="true">↗</b>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      <style>{`.sf-layered-menu{width:100%;height:100%;box-sizing:border-box;padding:20px;background:#f1f2f0;color:#1c211e;position:relative;font-family:Arial,sans-serif;overflow:hidden;container-type:size}.sf-layered-menu header{height:42px;display:flex;align-items:center;gap:28px;border-bottom:1px solid #d4d9d5;position:relative;z-index:2}.sf-layered-menu nav{display:flex;gap:3px}.sf-layered-menu button{background:none;border:0;color:inherit;font:12px Arial;cursor:pointer}.sf-layered-menu nav button{height:44px;display:flex;align-items:center;gap:7px;padding:0 10px}.sf-layered-menu nav button[aria-expanded=true]{color:#131916}.lm-background{padding:45px 12px}.lm-background>span{font-size:10px;color:#727972}.lm-background>strong{display:block;font:normal 39px Georgia;letter-spacing:-.05em;margin-top:8px}.lm-panel{position:absolute;z-index:3;top:70px;left:20px;width:min(340px,calc(100% - 40px));background:#fff;border-radius:12px;border:1px solid #151a1420;box-shadow:0 12px 28px #17241918,0 2px 6px #00000009;overflow:hidden}.lm-track{display:flex;width:200%;transform:translateX(0);transition:transform .24s cubic-bezier(.22,1,.36,1)}.lm-track[data-deep=true]{transform:translateX(-50%)}.lm-page{width:50%;flex-shrink:0;box-sizing:border-box;padding:12px}.lm-page>small{display:block;font-size:10px;color:#6e766f;padding:4px 8px 8px}.lm-page>button{display:flex;align-items:center;gap:12px;width:100%;min-height:54px;padding:8px;border-radius:6px;text-align:left}.lm-page button:hover{background:#f3f5f1}.lm-page button:focus-visible,.sf-layered-menu nav button:focus-visible{outline:2px solid #304238;outline-offset:-2px}.lm-page button>span>small{display:block;font:10px/1.5 Arial;color:#7a807b;margin-top:4px}.lm-page button>b{font:15px Arial;margin-left:auto}.lm-page .lm-glyph{font:24px Arial;color:#6e7b71}.lm-page .lm-back{font-size:11px;min-height:35px;border-bottom:1px solid #eceeeb;border-radius:0;margin-bottom:4px;color:#68716a}.lm-page .lm-leaf{min-height:44px}.lm-leaf i{height:5px;width:5px;background:#c39828;border-radius:50%;margin-left:auto}.lm-leaf i+b{margin-left:0!important}.sf-layered-menu[data-still=true] .lm-track{transition:none}@media(prefers-reduced-motion:reduce){.sf-layered-menu .lm-track{transition:none}}@container(max-width:380px){.sf-layered-menu header{gap:17px}.sf-layered-menu{padding:16px}.lm-panel{left:16px;width:calc(100% - 32px)}}`}</style>
    </section>
  )
}
