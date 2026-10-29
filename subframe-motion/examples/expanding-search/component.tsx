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

import { useEffect, useId, useRef, useState } from "react"

const documents = [
  { title: "Ways of seeing", type: "Essay", pages: 24, color: "#e7522d", mark: "circle" },
  { title: "A house in the hills", type: "Architecture", pages: 48, color: "#375b4a", mark: "arch" },
  { title: "The shape of sound", type: "Research", pages: 16, color: "#253e94", mark: "wave" },
  { title: "Collected fragments", type: "Journal", pages: 32, color: "#ddbb56", mark: "grid" },
]

export default function ExpandingSearch({ active = true }: { active?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<number | null>(null)
  const [highlighted, setHighlighted] = useState(-1)
  const [instant, setInstant] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const resultsId = useId()
  const results = documents
    .map((item, index) => ({ ...item, index }))
    .filter((item) => `${item.title} ${item.type}`.toLowerCase().includes(query.trim().toLowerCase()))
  useEffect(() => {
    if (open) {
      input.current?.focus()
    }
  }, [open])
  const close = (restoreFocus = true) => {
    setOpen(false)
    setQuery("")
    setHighlighted(-1)
    if (restoreFocus) {
      trigger.current?.focus()
    }
  }
  const choose = (index: number) => {
    setSelected(index)
    close()
  }
  return (
    <div className="sf-index-search" data-open={open} data-instant={instant} data-active={active}>
      <style>{`
.sf-index-search{position:relative;height:100%;min-height:300px;display:grid;place-items:center;overflow:hidden;background:#e5e2db;color:#242824;font-family:Arial,sans-serif;-webkit-font-smoothing:antialiased}
.sf-index-search *{box-sizing:border-box}.sf-index-search button,.sf-index-search input{font:inherit;-webkit-tap-highlight-color:transparent}
.sf-index-drawer{position:relative;width:382px;height:277px;transform:translate(65px,104px);transition:transform 320ms cubic-bezier(.22,1,.36,1)}
.sf-index-search[data-open=true] .sf-index-drawer{transform:translate(0,0)}
.sf-index-paper{position:absolute;inset:0;border-radius:2px;background:#faf9f4;border:1px solid #cfcec6;clip-path:inset(0 130px 218px 0);transition:clip-path 320ms cubic-bezier(.22,1,.36,1);pointer-events:none}
.sf-index-search[data-open=true] .sf-index-paper{clip-path:inset(0)}
.sf-index-head{height:59px;position:relative;display:flex;align-items:center}
.sf-index-tab{position:absolute;z-index:2;left:0;top:0;width:47px;height:59px;border:0;border-radius:2px 0 0 2px;background:#d74129;color:#fff9ec;padding:0;cursor:pointer;box-shadow:inset 0 1px #ffbea233,inset 0 -1px #92312044;touch-action:manipulation}
.sf-index-tab:before{content:"";position:absolute;left:8px;right:8px;top:13px;height:1px;background:#ffdac34d}.sf-index-tab:after{content:"";position:absolute;left:8px;right:8px;bottom:13px;height:1px;background:#a8281944}
.sf-index-tab svg{position:absolute;left:14px;top:20px;width:19px;height:19px;transition:opacity 100ms ease}.sf-index-tab .sf-index-close{opacity:0}.sf-index-search[data-open=true] .sf-index-tab .sf-index-close{opacity:1}.sf-index-search[data-open=true] .sf-index-tab .sf-index-find{opacity:0}
.sf-index-tab:active{background:#bb321e}
.sf-index-collapsed{position:absolute;left:47px;top:0;display:flex;align-items:center;justify-content:space-between;gap:14px;width:205px;height:59px;border:0;background:transparent;padding:0 17px 0 15px;cursor:pointer;text-align:left;color:#272e29;transition:opacity 100ms ease;white-space:nowrap;overflow:hidden}
.sf-index-collapsed span{font-size:14px;letter-spacing:-.35px;overflow:hidden;text-overflow:ellipsis}
.sf-index-search[data-open=true] .sf-index-collapsed{opacity:0;pointer-events:none}
.sf-index-field{position:absolute;left:63px;right:17px;top:0;height:59px;display:flex;align-items:center;gap:12px;opacity:0;pointer-events:none;transition:opacity 140ms ease}
.sf-index-search[data-open=true] .sf-index-field{opacity:1;pointer-events:auto}
.sf-index-field input{min-width:0;flex:1;width:100%;padding:0;border:0;outline:0;background:none;color:#28332a;font-size:16px;line-height:24px;caret-color:#d74129;letter-spacing:-.3px}.sf-index-field input::placeholder{color:#818578}
.sf-index-field:focus-within:after{content:"";position:absolute;bottom:10px;left:0;right:0;height:1px;background:#c8cbbc}
.sf-index-field kbd{font:8px ui-monospace,monospace;color:#8b9084;border:1px solid #d9dbd1;border-bottom-width:2px;padding:3px;border-radius:3px}
.sf-index-results{position:relative;padding:0 17px;opacity:0;transform:translateY(-9px);transition:opacity 150ms ease,transform 250ms cubic-bezier(.22,1,.36,1)}
.sf-index-search[data-open=true] .sf-index-results{opacity:1;transform:none}
.sf-index-rule{height:1px;background:#1e2923;margin-bottom:7px}
.sf-index-result{position:relative;display:flex;align-items:center;gap:11px;width:100%;height:45px;margin:0;border:0;border-bottom:1px solid #dedfd5;background:none;text-align:left;padding:5px 0;color:#2d352c;cursor:pointer}
.sf-index-cover{position:relative;width:23px;height:32px;flex-shrink:0;display:grid;place-items:center;overflow:hidden;border:1px solid #0002;box-shadow:inset 2px 0 #00000017,1px 1px 0 #b7b9af88}.sf-index-cover svg{width:17px;height:24px;color:#fcf9e9}
.sf-index-result-title{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;font-size:12px;letter-spacing:-.15px}.sf-index-result-title small{font:8px ui-monospace,SFMono-Regular,Consolas,monospace;color:#808679;letter-spacing:0}
.sf-index-accession{font:9px ui-monospace,SFMono-Regular,Consolas,monospace;color:#858a7e;display:flex;gap:9px;align-items:center}.sf-index-accession svg{width:12px;height:12px;opacity:0;transform:translateX(-3px);transition:transform 120ms ease-out,opacity 120ms ease}
.sf-index-result[aria-selected=true]{background:#eaece3;color:#263c2f}.sf-index-result[aria-selected=true] .sf-index-accession svg{opacity:1;transform:none}
.sf-index-empty{height:180px;margin:0;display:grid;place-items:center;font-size:12px;color:#717a69}
.sf-index-footer{display:flex;justify-content:space-between;margin-top:10px;font:8px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.3px;color:#7e8678}
.sf-index-search button:focus-visible{outline:2px solid #213f32;outline-offset:3px}.sf-index-tab:focus-visible{outline-offset:3px}
.sf-index-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@media(hover:hover)and(pointer:fine){.sf-index-result:hover{background:#eeeee5}.sf-index-result:hover .sf-index-accession svg{opacity:1;transform:none}.sf-index-collapsed:hover{color:#b23720}}
.sf-index-search[data-instant=true] *,.sf-index-search[data-active=false] *{transition:none}
@media(prefers-reduced-motion:reduce){.sf-index-search *{transition:none}}
@media(max-width:410px){.sf-index-search{transform-origin:center}.sf-index-drawer{width:350px}.sf-index-search:not([data-open=true]) .sf-index-drawer{transform:translate(49px,104px)}.sf-index-paper{clip-path:inset(0 98px 218px 0)}}
`}</style>
      <div
        className="sf-index-drawer"
        onBlur={(event) => {
          if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
            close(false)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault()
            setInstant(true)
            close()
          }
        }}
      >
        <div className="sf-index-paper" aria-hidden="true" />
        <div className="sf-index-head">
          <button
            type="button"
            ref={trigger}
            className="sf-index-tab"
            aria-label={open ? "Close archive search" : "Search archive"}
            aria-expanded={open}
            aria-controls={resultsId}
            onClick={(event) => {
              setInstant(event.detail === 0)
              if (open) {
                close()
              } else {
                setOpen(true)
              }
            }}
          >
            <svg
              className="sf-index-find"
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <circle cx="8" cy="8" r="4.5" />
              <path d="m11.5 11.5 5 5" />
            </svg>
            <svg
              className="sf-index-close"
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
          <button
            type="button"
            className="sf-index-collapsed"
            tabIndex={-1}
            inert={open}
            aria-label="Search archive"
            onClick={(event) => {
              setInstant(event.detail === 0)
              setOpen(true)
            }}
          >
            <span>{selected === null ? "Find in the archive" : documents[selected].title}</span>
          </button>
          <div className="sf-index-field" inert={!open}>
            <input
              ref={input}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-label="Search archive titles"
              aria-controls={resultsId}
              aria-activedescendant={
                highlighted >= 0 && results[highlighted] ? `${resultsId}-${results[highlighted].index}` : undefined
              }
              placeholder="Search the archive"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setHighlighted(-1)
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) {
                  return
                }
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault()
                  setInstant(true)
                  if (results.length) {
                    setHighlighted((index) =>
                      index < 0
                        ? event.key === "ArrowDown"
                          ? 0
                          : results.length - 1
                        : (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length,
                    )
                  }
                }
                if (event.key === "Enter" && results.length) {
                  event.preventDefault()
                  setInstant(true)
                  choose(results[Math.max(0, highlighted)].index)
                }
              }}
            />
            <kbd aria-hidden="true">ESC</kbd>
          </div>
        </div>
        <div className="sf-index-results" inert={!open}>
          <div className="sf-index-rule" />
          <div id={resultsId} role="listbox" aria-label="Archive documents">
            {results.map((item, index) => (
              <button
                type="button"
                key={item.title}
                id={`${resultsId}-${item.index}`}
                role="option"
                aria-selected={index === highlighted}
                tabIndex={-1}
                className="sf-index-result"
                onClick={(event) => {
                  setInstant(event.detail === 0)
                  choose(item.index)
                }}
                onPointerMove={() => setHighlighted(index)}
              >
                <span className="sf-index-cover" style={{ background: item.color }} aria-hidden="true">
                  <svg viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.1">
                    {item.mark === "circle" && (
                      <>
                        <circle cx="12" cy="13" r="7" />
                        <path d="M5 24H19" />
                      </>
                    )}
                    {item.mark === "arch" && <path d="M5 27V12a7 7 0 0 1 14 0v15M8 27V13a4 4 0 0 1 8 0v14" />}
                    {item.mark === "wave" && (
                      <path d="M3 11Q8 2 12 11T21 11M3 17Q8 8 12 17T21 17M3 23Q8 14 12 23T21 23" />
                    )}
                    {item.mark === "grid" && <path d="M4 7H20V25H4ZM4 13H20M4 19H20M10 7V25M15 7V25" />}
                  </svg>
                </span>
                <span className="sf-index-result-title">
                  {item.title}
                  <small>
                    {item.type} · {item.pages} pages
                  </small>
                </span>
                <span className="sf-index-accession">
                  <span>00{item.index + 1}</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                    <path d="M2 8H13M8 3l5 5-5 5" />
                  </svg>
                </span>
              </button>
            ))}
            {!results.length && (
              <p className="sf-index-empty" role="status">
                No matching titles
              </p>
            )}
          </div>
          <div className="sf-index-footer">
            <span>{String(results.length).padStart(2, "0")} TITLES</span>
            <span>↑↓ MOVE · ↵ SELECT</span>
          </div>
        </div>
        <span className="sf-index-status" role="status">
          {selected !== null ? `Selected ${documents[selected].title}` : ""}
        </span>
      </div>
    </div>
  )
}
