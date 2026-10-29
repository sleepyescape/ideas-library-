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

  const [image, setImage] = React.useState<string | null>(null),
    [name, setName] = React.useState(""),
    [error, setError] = React.useState(""),
    [drag, setDrag] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null),
    url = React.useRef<string | null>(null),
    depth = React.useRef(0)
  const clear = () => {
    if (url.current) {
      URL.revokeObjectURL(url.current)
    }
    url.current = null
    setImage(null)
    setName("")
    setError("")
  }
  const take = (file?: File) => {
    setDrag(false)
    depth.current = 0
    if (!file) {
      return
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPG or WebP image.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.")
      return
    }
    if (url.current) {
      URL.revokeObjectURL(url.current)
    }
    const next = URL.createObjectURL(file)
    url.current = next
    setImage(next)
    setName(file.name)
    setError("")
  }
  React.useEffect(
    () => () => {
      if (url.current) {
        URL.revokeObjectURL(url.current)
      }
    },
    [],
  )
  React.useEffect(() => {
    if (!active) {
      depth.current = 0
      setDrag(false)
    }
  }, [active])

  return (
    <section
      className="sf-w2-dropzone-preview"
      data-still={preview.still}
      onKeyDownCapture={preview.onKeyDownCapture}
      onPointerDownCapture={preview.onPointerDownCapture}
    >
      <div className="import">
        <header className="row between">
          <h2>Cover image</h2>
        </header>
        <div
          className="well"
          data-drag={drag}
          onDragEnter={(e) => {
            e.preventDefault()
            depth.current++
            setDrag(true)
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault()
            if (--depth.current <= 0) {
              setDrag(false)
            }
          }}
          onDrop={(e) => {
            e.preventDefault()
            take(e.dataTransfer.files[0])
          }}
        >
          {image ? (
            <>
              <img
                src={image}
                alt="Selected local cover"
                onError={() => {
                  clear()
                  setError("This file could not be decoded as an image.")
                }}
              />
              <button type="button" className="remove" aria-label="Remove selected image" onClick={clear}>
                ×
              </button>
            </>
          ) : (
            <>
              <div className="papers" aria-hidden>
                <i />
                <b />
                <span>↥</span>
              </div>
              <button type="button" className="browse" onClick={() => input.current?.click()}>
                {drag ? "Drop image here" : "Choose an image"}
              </button>
              <p>or drop one here</p>
            </>
          )}
          <input
            ref={input}
            type="file"
            className="sr"
            tabIndex={-1}
            accept="image/png,image/jpeg,image/webp"
            aria-label="Choose local image"
            onChange={(e) => {
              take(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </div>
        <footer>
          <span role="status" className={error ? "error" : ""}>
            {error || name || "PNG, JPG, WebP · up to 5 MB"}
          </span>
          {image && (
            <button type="button" onClick={() => input.current?.click()}>
              Replace
            </button>
          )}
        </footer>
      </div>

      <style>{`.sf-w2-dropzone-preview{position:relative;isolation:isolate;container-type:inline-size;width:100%;height:100%;min-height:280px;overflow:hidden;box-sizing:border-box;font:13px/1.4 Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-w2-dropzone-preview *{box-sizing:border-box}.sf-w2-dropzone-preview button,.sf-w2-dropzone-preview input,.sf-w2-dropzone-preview select,.sf-w2-dropzone-preview textarea{font:inherit}.sf-w2-dropzone-preview button{cursor:pointer;touch-action:manipulation;min-height:44px;border:0;background:none;color:inherit}.sf-w2-dropzone-preview button:disabled{opacity:.4;cursor:default}.sf-w2-dropzone-preview button:active:not(:disabled){transform:scale(.98)}.sf-w2-dropzone-preview input,.sf-w2-dropzone-preview textarea{font-size:16px;min-width:0}.sf-w2-dropzone-preview button:focus-visible,.sf-w2-dropzone-preview input:focus-visible,.sf-w2-dropzone-preview select:focus-visible,.sf-w2-dropzone-preview textarea:focus-visible,.sf-w2-dropzone-preview [tabindex]:focus-visible{outline:2px solid #3376ef;outline-offset:3px}.sf-w2-dropzone-preview h2,.sf-w2-dropzone-preview p{margin:0}.sf-w2-dropzone-preview .row{display:flex;align-items:center;gap:12px}.sf-w2-dropzone-preview .between{justify-content:space-between}.sf-w2-dropzone-preview .muted{opacity:.6}.sf-w2-dropzone-preview .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.sf-w2-dropzone-preview[data-still=true] *,.sf-w2-dropzone-preview[data-still=true] *::before,.sf-w2-dropzone-preview[data-still=true] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}@media(prefers-reduced-motion:reduce){.sf-w2-dropzone-preview *,.sf-w2-dropzone-preview *::before,.sf-w2-dropzone-preview *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}@media(hover:hover) and (pointer:fine){.sf-w2-dropzone-preview button:hover:not(:disabled){filter:brightness(.96)}}.sf-w2-dropzone-preview{display:grid;place-items:center;padding:22px;background:#f5f5f3;color:#253335}.sf-w2-dropzone-preview .import{width:min(100%,380px)}.sf-w2-dropzone-preview header{height:38px;font-size:10px;margin-bottom:9px}.sf-w2-dropzone-preview h2{font-size:14px;font-weight:500;letter-spacing:-.2px}.sf-w2-dropzone-preview .well{height:194px;border:1px dashed #b6c8c8;background:#edf3f2;border-radius:5px;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:background .18s,border-color .18s}.sf-w2-dropzone-preview .well[data-drag=true]{background:#d9ecea;border-color:#438c86;border-style:solid}.sf-w2-dropzone-preview .papers{position:relative;width:74px;height:71px;margin:4px 0 5px;transition:transform .2s cubic-bezier(.2,.8,.2,1)}.sf-w2-dropzone-preview .papers i,.sf-w2-dropzone-preview .papers b{position:absolute;width:41px;height:54px;left:17px;top:6px;background:#d1e2df;border:1px solid #8aaba5;border-radius:3px;transform:rotate(-12deg);transition:transform .2s}.sf-w2-dropzone-preview .papers b{background:#fff;transform:rotate(8deg)}.sf-w2-dropzone-preview .papers span{position:absolute;left:33px;top:21px;font-size:25px;color:#558b84}.sf-w2-dropzone-preview [data-drag=true] .papers i{transform:rotate(-20deg) translateX(-5px)}.sf-w2-dropzone-preview [data-drag=true] .papers b{transform:rotate(0)}.sf-w2-dropzone-preview .browse{font-size:11px;background:white;border:1px solid #b7cfca;border-radius:4px;padding:0 16px;color:#315d56;min-height:44px}.sf-w2-dropzone-preview .well p{font-size:10px;color:#92aaa6;margin-top:7px}.sf-w2-dropzone-preview .well>img{width:100%;height:100%;object-fit:contain;background:#e7eeeb}.sf-w2-dropzone-preview .remove{position:absolute;right:8px;top:8px;width:44px;background:#fffffff0;border-radius:4px;color:#34564f;font-size:20px;box-shadow:0 2px 5px #20362817}.sf-w2-dropzone-preview footer{min-height:42px;display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:10px;color:#92a39f}.sf-w2-dropzone-preview footer>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sf-w2-dropzone-preview footer .error{white-space:normal;color:#ae5146}.sf-w2-dropzone-preview footer button{font-size:11px;color:#507f76;flex-shrink:0;padding:0}`}</style>
    </section>
  )
}
