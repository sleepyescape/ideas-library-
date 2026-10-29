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
const PATH = ["Studio", "Editions", "Kinetic", "Cover.svg"]
function Folder() {
  return (
    <svg viewBox="0 0 24 20" aria-hidden>
      <path d="M2 4h7l2 2h11v12H2z" />
      <path d="M2 5V2h7l2 2h9v2" />
    </svg>
  )
}
function ArtworkFile() {
  return (
    <svg className="artwork-file" viewBox="0 0 24 28" aria-hidden>
      <path d="M4 2h10l6 6v18H4z" />
      <path d="M14 2v6h6M8 13l8 6m-8-1 4 3" fill="none" />
    </svg>
  )
}
export default function Example({ active = true }: { active?: boolean }) {
  const [expanded, setExpanded] = React.useState(false),
    [depth, setDepth] = React.useState(3),
    [keyboard, setKeyboard] = React.useState(false)
  const trigger = React.useRef<HTMLButtonElement>(null),
    middle = React.useRef<HTMLDivElement>(null)
  const visible = expanded || depth < 3
  const [parentWidth, setParentWidth] = React.useState(132)
  const returnFocus = React.useRef(false)
  const enterParents = React.useRef(false)
  React.useLayoutEffect(() => {
    if (middle.current) {
      setParentWidth(middle.current.scrollWidth)
    }
    if (expanded && enterParents.current) {
      middle.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true })
    }
    enterParents.current = false
    if (!expanded && returnFocus.current) {
      trigger.current?.focus({ preventScroll: true })
      returnFocus.current = false
    }
  }, [depth, expanded])
  const navigate = (next: number) => {
    setDepth(next)
    setExpanded(false)
  }
  const collapse = () => {
    returnFocus.current = true
    setExpanded(false)
  }
  return (
    <section
      className="sf-breadcrumb-collapse"
      data-still={!active || keyboard}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDownCapture={(e) => {
        setKeyboard(true)
        if (e.key === "Escape") {
          collapse()
        }
      }}
      aria-label="Expandable project path"
    >
      <div className="path-card">
        <nav aria-label="Document location">
          <ol>
            <li>
              {depth === 0 ? (
                <span className="current" aria-current="page">
                  <Folder />
                  Studio
                </span>
              ) : (
                <button type="button" disabled={!active} onClick={() => navigate(0)}>
                  <Folder />
                  Studio
                </button>
              )}
            </li>
            {depth > 0 && (
              <>
                <li className="separator" aria-hidden>
                  /
                </li>
                {depth > 1 && (
                  <>
                    <li className="parent-wrap" style={{ width: visible ? parentWidth : 42 }}>
                      {depth === 3 && (
                        <button
                          type="button"
                          className="ellipsis"
                          ref={trigger}
                          disabled={!active || expanded}
                          aria-label="Expand parent folders"
                          aria-expanded={expanded}
                          aria-hidden={expanded}
                          tabIndex={expanded ? -1 : undefined}
                          data-visible={!expanded}
                          onClick={(event) => {
                            enterParents.current = event.detail === 0
                            setExpanded(true)
                          }}
                        >
                          <span>···</span>
                        </button>
                      )}
                      <div ref={middle} className="parents" inert={!visible} data-visible={visible}>
                        {PATH.slice(1, depth).map((name, i) => (
                          <React.Fragment key={name}>
                            {i > 0 && (
                              <span className="separator" aria-hidden>
                                /
                              </span>
                            )}
                            <button type="button" disabled={!active} onClick={() => navigate(i + 1)}>
                              {name}
                            </button>
                          </React.Fragment>
                        ))}
                      </div>
                    </li>
                    <li className="separator" aria-hidden>
                      /
                    </li>
                  </>
                )}
                <li className="current" aria-current="page">
                  {PATH[depth]}
                </li>
              </>
            )}
          </ol>
          {depth === 3 && expanded && (
            <button
              type="button"
              className="collapse"
              disabled={!active}
              aria-label="Collapse parent folders"
              aria-expanded={expanded}
              onClick={collapse}
            >
              <svg viewBox="0 0 16 16" aria-hidden>
                <path d="m6 4-4 4 4 4m4-8 4 4-4 4" />
              </svg>
            </button>
          )}
        </nav>
        <div className="content" key={depth}>
          {depth === 3 ? (
            <div className="file-detail">
              <div className="cover" aria-hidden>
                <svg viewBox="0 0 92 122">
                  <rect width="92" height="122" fill="#da4c2b" />
                  {Array.from({ length: 6 }, (_, i) => (
                    <path key={i} d={`M${-13 + i * 13} 13 108 ${91 + i * 4}`} stroke="#f4e4c6" strokeWidth="5" />
                  ))}
                  <path d="M11 102h33" stroke="#351f19" strokeWidth="3" />
                </svg>
              </div>
              <div>
                <strong>Cover.svg</strong>
                <span>1600 × 2400</span>
                <small>Vector artwork</small>
              </div>
              <span className="saved">
                <i />
                Saved
              </span>
            </div>
          ) : (
            <button type="button" className="folder-row" disabled={!active} onClick={() => navigate(depth + 1)}>
              <span className="folder-art" aria-hidden>
                {depth === 2 ? <ArtworkFile /> : <Folder />}
              </span>
              <span>
                <strong>{PATH[depth + 1]}</strong>
                <small>{depth === 2 ? "Vector artwork" : "1 item"}</small>
              </span>
              <svg className="next" viewBox="0 0 16 16" aria-hidden>
                <path d="m6 3 5 5-5 5" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="sr" role="status">
        Current location: {PATH.slice(0, depth + 1).join(", ")}
      </div>
      <style>{`
.sf-breadcrumb-collapse{width:100%;height:100%;display:grid;place-items:center;background:#d8e0e6;color:#354958;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}.sf-breadcrumb-collapse *{box-sizing:border-box}.sf-breadcrumb-collapse button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation;border:0;background:none}.sf-breadcrumb-collapse button:disabled{cursor:default}.sf-breadcrumb-collapse :focus-visible{outline:2px solid #4b7b9b;outline-offset:2px}.sf-breadcrumb-collapse .path-card{width:528px;overflow:hidden;background:#fcfdfd;border-radius:12px;border:1px solid #b9c8d2;box-shadow:0 18px 35px -18px #29445666,0 2px 4px #344e6010}.sf-breadcrumb-collapse nav{height:76px;display:flex;align-items:center;padding:0 21px;border-bottom:1px solid #dce4e9;background:linear-gradient(#fff,#f4f7f9)}.sf-breadcrumb-collapse ol{display:flex;align-items:center;gap:0;padding:0;margin:0;list-style:none;min-width:0}.sf-breadcrumb-collapse li{display:flex;align-items:center;flex:none}.sf-breadcrumb-collapse nav button{height:44px;display:flex;align-items:center;gap:7px;padding:0 5px;border-radius:6px;font-size:14px;white-space:nowrap;letter-spacing:-.25px}.sf-breadcrumb-collapse nav button:hover{background:#eaf0f4}.sf-breadcrumb-collapse nav svg{width:17px;height:16px;fill:#bdcdd8;stroke:#849cab;stroke-width:1;stroke-linejoin:round}.sf-breadcrumb-collapse .separator{font-size:16px;font-weight:300;color:#b1c0ca;padding:0 10px}.sf-breadcrumb-collapse .current{font-size:14px;font-weight:550;letter-spacing:-.3px;color:#2d4b60;white-space:nowrap;display:flex;align-items:center;gap:7px}.sf-breadcrumb-collapse .ellipsis{position:absolute;top:0;left:0;opacity:0;pointer-events:none;transition:opacity 120ms;width:42px;justify-content:center;padding:0;background:#e3ebf0;box-shadow:inset 0 1px 2px #3b5a7012;border:1px solid #d6e0e7}.sf-breadcrumb-collapse .ellipsis[data-visible=true]{opacity:1;pointer-events:auto}.sf-breadcrumb-collapse .ellipsis span{font-size:23px;line-height:1;margin-top:-8px;color:#638399;letter-spacing:1px}.sf-breadcrumb-collapse .parent-wrap{position:relative;height:44px;overflow:hidden;transition:width 280ms cubic-bezier(.22,1,.36,1)}.sf-breadcrumb-collapse .parents{position:absolute;left:0;top:0;display:flex;align-items:center;width:max-content;opacity:0;transform:translateX(-8px);transition:opacity 170ms ease,transform 280ms cubic-bezier(.22,1,.36,1)}.sf-breadcrumb-collapse .parents[data-visible=true]{opacity:1;transform:none}.sf-breadcrumb-collapse .parents button{font-size:13px}.sf-breadcrumb-collapse .parents .separator{padding:0 8px}.sf-breadcrumb-collapse .collapse{margin-left:auto;width:28px;padding:0!important;justify-content:center}.sf-breadcrumb-collapse .collapse svg{width:14px;fill:none;stroke:#9aacb8;stroke-width:1.3}.sf-breadcrumb-collapse .content{height:164px;padding:22px 26px;animation:sf-path-content 220ms cubic-bezier(.22,1,.36,1)}.sf-breadcrumb-collapse .file-detail{height:100%;display:flex;align-items:center;gap:21px}.sf-breadcrumb-collapse .cover{width:77px;height:103px;flex:none;transform:rotate(-3deg);box-shadow:0 2px 3px #273c4926,0 9px 12px -5px #273c4936;border:3px solid #fff;outline:1px solid #dbe0df}.sf-breadcrumb-collapse .cover svg{width:100%;height:100%;display:block}.sf-breadcrumb-collapse .file-detail strong{display:block;font-size:13px;font-weight:500;color:#465b69}.sf-breadcrumb-collapse .file-detail div>span{display:block;margin-top:5px;font-size:11px;color:#8b9ca8}.sf-breadcrumb-collapse .file-detail small{display:block;font-size:10px;color:#a4b0b7;margin-top:3px}.sf-breadcrumb-collapse .saved{margin-left:auto;align-self:flex-start;display:flex;align-items:center;gap:5px;color:#91a09b;font-size:9px;padding-top:5px}.sf-breadcrumb-collapse .saved i{width:4px;height:4px;border-radius:50%;background:#78a894}.sf-breadcrumb-collapse .folder-row{height:100%;display:flex;align-items:center;width:100%;gap:19px;text-align:left;border-radius:7px;padding:0 15px}.sf-breadcrumb-collapse .folder-row:hover{background:#f1f5f7}.sf-breadcrumb-collapse .folder-art{width:65px;height:54px}.sf-breadcrumb-collapse .folder-art svg{width:100%;height:100%;fill:#aac3d1;stroke:#7e9cad;stroke-width:.5}.sf-breadcrumb-collapse .folder-row strong{display:block;font-size:15px;font-weight:500}.sf-breadcrumb-collapse .folder-row small{display:block;font-size:10px;margin-top:5px;color:#95a5af}.sf-breadcrumb-collapse .next{margin-left:auto;width:15px;fill:none;stroke:#9daeba;stroke-width:1}.sf-breadcrumb-collapse footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5ebee;height:36px;padding:0 23px;font-size:9px;color:#a3afb8;background:#f9fbfc}.sf-breadcrumb-collapse .sr{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}.sf-breadcrumb-collapse[data-still=true] *{transition:none!important;animation:none!important}@media(prefers-reduced-motion:reduce){.sf-breadcrumb-collapse *{transition:none!important;animation:none!important}}@keyframes sf-path-content{from{opacity:.4;transform:translateX(5px)}to{opacity:1;transform:none}}`}</style>
    </section>
  )
}
