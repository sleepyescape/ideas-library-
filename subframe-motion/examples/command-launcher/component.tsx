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

export default function Example({ active = true }: { active?: boolean }) {
  const [reduced, setReduced] = React.useState(true)
  const [keyboard, setKeyboard] = React.useState(false)
  React.useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(m.matches)
    update()
    m.addEventListener("change", update)
    return () => m.removeEventListener("change", update)
  }, [])
  const running = active && !reduced

  const commands = [
    { icon: "↗", name: "Open latest draft", key: "D" },
    { icon: "＋", name: "Create a collection", key: "C" },
    { icon: "↥", name: "Upload a file", key: "U" },
    { icon: "◷", name: "View activity", key: "A" },
  ]
  const [query, setQuery] = React.useState(""),
    [index, setIndex] = React.useState(0),
    [chosen, setChosen] = React.useState("")
  const list = commands.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
  const uid = React.useId()

  return (
    <div
      className="sf-command-launcher"
      data-keyboard={keyboard}
      data-paused={!running}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
    >
      <div className="command">
        <div className="search">
          <span aria-hidden>⌕</span>
          <input
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls={uid}
            aria-activedescendant={list[index] ? uid + index : undefined}
            placeholder="What would you like to do?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIndex(0)
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault()
                setIndex((i) => Math.max(0, Math.min(list.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))))
              }
              if (e.key === "Enter" && list[index]) {
                setChosen(list[index].name)
              }
              if (e.key === "Escape") {
                setQuery("")
                setChosen("")
              }
            }}
          />
          <kbd>⌘ K</kbd>
        </div>
        <div role="listbox" id={uid}>
          {list.map((c, i) => (
            <button
              role="option"
              aria-selected={i === index}
              id={uid + i}
              key={c.name}
              onPointerMove={() => {
                setKeyboard(false)
                setIndex(i)
              }}
              onClick={() => setChosen(c.name)}
            >
              <span className="symbol">{c.icon}</span>
              {c.name}
              <kbd>{c.key}</kbd>
            </button>
          ))}
          {!list.length && <p className="empty">No matching actions</p>}
        </div>
        <div className="command-status" role="status">
          {chosen || "↑ ↓ to navigate"}
          <span>↵</span>
        </div>
      </div>
      <style>{`
.sf-command-launcher {
  width: 100%;
  height: 100%;
  min-height: 260px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: 20px;
  background: #edf0f3;
  color: #22272d;
  font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  isolation: isolate;
  overflow: hidden;
}
.sf-command-launcher * {
  box-sizing: border-box;
}
.sf-command-launcher button,
.sf-command-launcher input,
.sf-command-launcher textarea,
.sf-command-launcher select {
  font: inherit;
  color: inherit;
}
.sf-command-launcher button {
  cursor: pointer;
  touch-action: manipulation;
}
.sf-command-launcher button:disabled {
  cursor: default;
  opacity: 0.4;
}
.sf-command-launcher button:focus-visible,
.sf-command-launcher input:focus-visible,
.sf-command-launcher textarea:focus-visible,
.sf-command-launcher [tabindex]:focus-visible {
  outline: 2px solid #4269e1;
  outline-offset: 3px;
}
.sf-command-launcher button {
  border: 0;
  background: transparent;
}
.sf-command-launcher .row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sf-command-launcher .muted {
  color: #7a8189;
  font-size: 12px;
}
.sf-command-launcher svg {
  display: block;
}
.sf-command-launcher[data-keyboard="true"] *,
.sf-command-launcher[data-paused="true"] * {
  transition-duration: 0s !important;
  animation-play-state: paused !important;
}
@media (prefers-reduced-motion: reduce) {
  .sf-command-launcher *,
  .sf-command-launcher *::before,
  .sf-command-launcher *::after {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
.sf-command-launcher {
  background: #dce1e8;
}
.sf-command-launcher .command {
  width: min(100%, 400px);
  background: #fafbfe;
  border: 1px solid #bac4d14d;
  border-radius: 14px;
  box-shadow: 0 22px 50px #243b5626, 0 2px 5px #25385410;
  overflow: hidden;
}
.sf-command-launcher .search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #dfe5ed;
}
.sf-command-launcher .search > span {
  font-size: 27px;
  color: #7a8ba0;
}
.sf-command-launcher input {
  width: 100%;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 16px;
}
.sf-command-launcher input::placeholder {
  font-size: 12px;
}
.sf-command-launcher kbd {
  white-space: nowrap;
  font: 10px ui-monospace;
  color: #616a76;
  border: 1px solid #dce2e9;
  border-radius: 4px;
  padding: 2px 4px;
}
.sf-command-launcher [role="listbox"] {
  padding: 7px;
}
.sf-command-launcher [role="option"] {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 44px;
  text-align: left;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
}
.sf-command-launcher [aria-selected="true"] {
  background: #e7edf7;
  color: #243e6a;
}
.sf-command-launcher [role="option"] kbd {
  margin-left: auto;
}
.sf-command-launcher .symbol {
  width: 20px;
  font-size: 20px;
  color: #6d80a0;
}
.sf-command-launcher .command-status {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e3e8ef;
  padding: 8px 17px;
  font-size: 10px;
  color: #646c78;
}
.sf-command-launcher .empty {
  padding: 12px;
  color: #7f8999;
  font-size: 12px;
}
.sf-command-launcher {
  background: #232426;
  color: #d8dadd;
}
.sf-command-launcher .command {
  background: linear-gradient(#353638, #2c2d2f);
  border: 1px solid #515254;
  box-shadow: 0 30px 45px #0005, inset 0 1px #ffffff12;
}
.sf-command-launcher .search,
.sf-command-launcher .command-status {
  border-color: #ffffff13;
}
.sf-command-launcher .search > span,
.sf-command-launcher .symbol {
  color: #a6aaaf;
}
.sf-command-launcher input::placeholder {
  color: #97999d;
}
.sf-command-launcher kbd {
  color: #a7aaaf;
  border-color: #626366;
  background: #ffffff05;
}
.sf-command-launcher [aria-selected="true"] {
  background: #ffffff11;
  color: #f4f5f6;
}
.sf-command-launcher .command-status {
  color: #989a9e;
}
`}</style>
    </div>
  )
}
