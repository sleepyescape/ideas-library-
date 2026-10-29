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

export type Config = { depth: number; disabledLeaves: number; showCounts: boolean; settleMs: number }
export const DEFAULT_CONFIG: Config = { depth: 3, disabledLeaves: 2, showCounts: true, settleMs: 140 }
type Node = { id: string; name: string; children?: Node[] }
const FILES = ["Wordmark.svg", "Symbol.svg", "Lockup.svg", "Regular.woff2", "Medium.woff2", "License.pdf"]
const bound = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
function fixture(depth: number): Node {
  const leaves = FILES.map((name, i) => ({ id: `file-${i}`, name }))
  if (depth === 2) {
    return { id: "root", name: "Identity", children: leaves }
  }
  return {
    id: "root",
    name: "Identity",
    children: [
      {
        id: "marks",
        name: "Marks",
        children: depth === 4 ? [{ id: "masters", name: "Masters", children: leaves.slice(0, 3) }] : leaves.slice(0, 3),
      },
      {
        id: "type",
        name: "Typography",
        children: depth === 4 ? [{ id: "family", name: "Typeface", children: leaves.slice(3) }] : leaves.slice(3),
      },
    ],
  }
}
function leafIds(node: Node): string[] {
  return node.children ? node.children.flatMap(leafIds) : [node.id]
}
function Check({
  checked,
  mixed,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  mixed: boolean
  disabled: boolean
  label: string
  onChange: () => void
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useLayoutEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = mixed
    }
  }, [mixed])
  return (
    <span className="sts-check" data-filled={checked || mixed}>
      <input ref={ref} type="checkbox" checked={checked} disabled={disabled} aria-label={label} onChange={onChange} />
      <svg viewBox="0 0 16 16" aria-hidden>
        {mixed ? <path d="M4 8h8" /> : <path d="m4 8 2.5 2.5L12 5" />}
      </svg>
    </span>
  )
}
function Selection({ active, settings }: { active: boolean; settings: Config }) {
  const tree = React.useMemo(() => fixture(settings.depth), [settings.depth])
  const unavailable = React.useMemo(
    () => new Set(FILES.slice(0, settings.disabledLeaves).map((_, i) => `file-${5 - i}`)),
    [settings.disabledLeaves],
  )
  const [selected, setSelected] = React.useState(() => new Set(["file-0", "file-1"]))
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set(["type"]))
  const [keyboard, setKeyboard] = React.useState(false)
  const count = [...selected].filter((id) => !unavailable.has(id)).length
  const change = (ids: string[]) => {
    if (!active) {
      return
    }
    setSelected((previous) => {
      const next = new Set(previous)
      const remove = ids.every((id) => previous.has(id))
      ids.forEach((id) => (remove ? next.delete(id) : next.add(id)))
      return next
    })
  }
  const branch = (node: Node, level = 0): React.ReactNode => {
    const ids = leafIds(node).filter((id) => !unavailable.has(id))
    const included = ids.filter((id) => selected.has(id)).length
    const open = !collapsed.has(node.id)
    const disabled = ids.length === 0
    return (
      <li key={node.id}>
        <div className="sts-row" data-disabled={disabled} style={{ paddingLeft: 16 + level * 22 }}>
          {node.children ? (
            <button
              type="button"
              className="sts-caret"
              aria-label={`${open ? "Collapse" : "Expand"} ${node.name}`}
              aria-expanded={open}
              disabled={!active}
              onClick={() =>
                setCollapsed((previous) => {
                  const next = new Set(previous)
                  if (open) {
                    next.add(node.id)
                  } else {
                    next.delete(node.id)
                  }
                  return next
                })
              }
            >
              <svg viewBox="0 0 16 16" aria-hidden style={{ transform: `rotate(${open ? 90 : 0}deg)` }}>
                <path d="m6 4 4 4-4 4" />
              </svg>
            </button>
          ) : (
            <span className="sts-elbow" aria-hidden />
          )}
          <Check
            checked={ids.length > 0 && included === ids.length}
            mixed={included > 0 && included < ids.length}
            disabled={!active || disabled}
            label={`${node.name}${disabled ? ", unavailable" : ""}`}
            onChange={() => change(ids)}
          />
          <button
            type="button"
            className="sts-name"
            tabIndex={-1}
            disabled={!active || disabled}
            onClick={() => change(ids)}
          >
            {node.name}
          </button>
          {disabled ? (
            <svg className="sts-lock" viewBox="0 0 16 16" aria-label="Unavailable">
              <rect x="4" y="7" width="8" height="6" rx="1.5" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
          ) : node.children && settings.showCounts ? (
            <span className="sts-count">
              {included}
              <span> / {ids.length}</span>
            </span>
          ) : null}
        </div>
        {node.children && open ? <ul>{node.children.map((child) => branch(child, level + 1))}</ul> : null}
      </li>
    )
  }
  return (
    <section
      className="sf-scope-tree"
      aria-label="Select files to export"
      data-still={!active || keyboard}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
      style={{ "--sts-duration": `${settings.settleMs}ms` } as React.CSSProperties}
    >
      <div className="sts-panel">
        <header>
          <Check
            checked={count === 6 - unavailable.size}
            mixed={count > 0 && count < 6 - unavailable.size}
            disabled={!active}
            label="Identity"
            onChange={() => change(leafIds(tree).filter((id) => !unavailable.has(id)))}
          />
          <strong>Export Identity</strong>
          {settings.showCounts ? (
            <span className="sts-count">
              {count} / {6 - unavailable.size}
            </span>
          ) : null}
        </header>
        <div className="sts-scroll">
          <ul aria-label="Identity files">{tree.children?.map((child) => branch(child))}</ul>
        </div>
        <footer>
          <span className="sts-total" aria-live="polite">
            <strong>{count}</strong> of {6 - unavailable.size} files included
          </span>
          <span>{unavailable.size ? `${unavailable.size} unavailable` : "All available"}</span>
        </footer>
      </div>
      <style>{`
.sf-scope-tree{width:100%;height:100%;min-height:260px;display:grid;place-items:center;padding:20px;box-sizing:border-box;background:#142132;color:#eaf2f6;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;isolation:isolate}.sf-scope-tree *{box-sizing:border-box}.sf-scope-tree button,.sf-scope-tree input{font:inherit;color:inherit}.sf-scope-tree button{border:0;background:none;padding:0;cursor:pointer}.sf-scope-tree button:disabled{cursor:default}.sf-scope-tree .sts-panel{width:min(360px,100%);height:334px;max-height:100%;display:flex;flex-direction:column;background:#1d2d41;border:1px solid #35455a;border-radius:14px;box-shadow:0 2px 4px #0002,0 16px 36px #07101b50;overflow:hidden}.sf-scope-tree header{display:flex;align-items:center;gap:12px;height:58px;padding:0 20px;border-bottom:1px solid #35455a;flex:none}.sf-scope-tree header strong{display:block;font-size:14px;font-weight:600;flex:1}.sf-scope-tree header>.sts-count{color:#a6b8c9;font-size:11px}.sf-scope-tree .sts-folder{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#30445a;color:#b8ebda}.sf-scope-tree .sts-folder svg{width:20px;fill:none;stroke:currentColor;stroke-width:1.25}.sf-scope-tree .sts-scroll{overflow:auto;overscroll-behavior:contain;flex:1;min-height:0;scrollbar-width:thin;scrollbar-color:#53657a transparent;padding:5px 0}.sf-scope-tree ul{margin:0;padding:0;list-style:none}.sf-scope-tree .sts-row{position:relative;display:flex;align-items:center;height:44px;padding-right:20px;gap:8px}.sf-scope-tree .sts-caret{width:20px;height:44px;flex:none}.sf-scope-tree .sts-caret svg{width:14px;fill:none;stroke:#9eafc1;stroke-width:1.5;transition:transform var(--sts-duration) ease}.sf-scope-tree .sts-elbow{width:20px;height:44px;position:relative;flex:none}.sf-scope-tree .sts-elbow:before{content:"";position:absolute;left:6px;top:0;width:10px;height:23px;border-left:1px solid #43546a;border-bottom:1px solid #43546a;border-radius:0 0 0 4px}.sf-scope-tree .sts-check{position:relative;width:16px;height:16px;flex:none;border:1px solid #667990;border-radius:4px;background:#1a293b}.sf-scope-tree .sts-check[data-filled=true]{background:#b9ead8;border-color:#b9ead8}.sf-scope-tree .sts-check input{position:absolute;inset:-14px -4px;width:24px;height:44px;margin:0;opacity:0;cursor:pointer;z-index:1}.sf-scope-tree .sts-check svg{position:absolute;inset:0;width:14px;height:14px;fill:none;stroke:#17372d;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:0;transform:scale(.7);transition:transform var(--sts-duration) ease-out,opacity var(--sts-duration) ease-out}.sf-scope-tree .sts-check[data-filled=true] svg{opacity:1;transform:scale(1)}.sf-scope-tree .sts-check:has(input:focus-visible){outline:2px solid #e7fff7;outline-offset:4px}.sf-scope-tree .sts-name{text-align:left;min-height:44px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sf-scope-tree .sts-count{font-size:11px;font-variant-numeric:tabular-nums;color:#d1e6e0}.sf-scope-tree .sts-count span{color:#8fa2b7}.sf-scope-tree .sts-row[data-disabled=true]{color:#7e91a7}.sf-scope-tree .sts-row[data-disabled=true] .sts-check{border-color:#405269}.sf-scope-tree .sts-lock{width:13px;height:13px;fill:none;stroke:#8fa2b7;stroke-width:1.2}.sf-scope-tree footer{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-top:1px solid #35455a;gap:8px;flex:none;font-size:10px;color:#8fa2b7}.sf-scope-tree .sts-total{color:#c7d5e1;font-size:11px}.sf-scope-tree .sts-total strong{color:#c9f3e3;font-variant-numeric:tabular-nums}.sf-scope-tree button:focus-visible{outline:2px solid #c9f3e3;outline-offset:1px;border-radius:4px}.sf-scope-tree[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-scope-tree *{transition:none!important}}@media(hover:hover) and (pointer:fine){.sf-scope-tree .sts-row:hover{background:#25384e}}
    `}</style>
    </section>
  )
}
export default function Example({ active = true, config }: { active?: boolean; config?: Partial<Config> }) {
  const settings = { ...DEFAULT_CONFIG, ...config }
  settings.depth = Math.round(bound(settings.depth, 2, 4))
  settings.disabledLeaves = Math.round(bound(settings.disabledLeaves, 0, 4))
  settings.settleMs = bound(settings.settleMs, 0, 240)
  return <Selection key={`${settings.depth}:${settings.disabledLeaves}`} active={active} settings={settings} />
}
