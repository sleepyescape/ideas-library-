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

import { useEffect, useRef, useState } from "react"

function useCalm(active: boolean) {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])
  return reduced || !active
}

const files = [
  ["/motion/assets/suruga-wind.webp", "Wind study", "01"],
  ["/motion/assets/fuji-storm.webp", "Storm study", "02"],
  ["/motion/assets/plum-garden.webp", "Branch study", "03"],
]
export default function ArchiveFolder({ active = true }: { active?: boolean }) {
  const calm = useCalm(active),
    trigger = useRef<HTMLButtonElement | null>(null),
    previousSelection = useRef<number | null>(null),
    [open, setOpen] = useState(false),
    [selected, setSelected] = useState<number | null>(null),
    [instant, setInstant] = useState(false)
  useEffect(() => {
    if (selected === null && previousSelection.current !== null) {
      trigger.current?.focus()
    }
    previousSelection.current = selected
  }, [selected])
  const toggle = (keyboard = false) => {
    setInstant(keyboard)
    setSelected(null)
    setOpen(!open)
  }
  return (
    <section
      className="sf-archive-folder"
      data-open={open}
      data-calm={calm || instant}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setInstant(true)
          if (selected !== null) {
            setSelected(null)
          } else {
            setOpen(false)
          }
        }
      }}
      aria-label="Print archive folder"
    >
      <style>{`.sf-archive-folder{position:relative;width:100%;height:100%;min-height:280px;container-type:size;overflow:hidden;background:#e94f29;color:#292016;font-family:Arial,sans-serif}.sf-archive-folder *{box-sizing:border-box}.sf-archive-folder .af-shell{position:absolute;left:50%;top:56%;width:210px;height:144px;transform:translate(-50%,-50%);perspective:800px}.sf-archive-folder .af-back{position:absolute;inset:0;background:#9d7626;border-radius:3px 7px 7px 7px;box-shadow:0 14px 25px #671d182e}.sf-archive-folder .af-back:before{content:'';position:absolute;top:-15px;left:0;width:74px;height:24px;background:#9d7626;border-radius:4px 10px 0 0}.sf-archive-folder .af-cover{position:absolute;inset:13px 0 0;background:linear-gradient(120deg,#d7b663,#c5a54e);border:0;border-top:1px solid #eedda3;border-radius:4px 4px 7px 7px;transform-origin:center bottom;transform:rotateX(0);transition:transform 420ms cubic-bezier(.22,1,.36,1);z-index:8;cursor:pointer;text-align:left;padding:64px 17px 12px;color:#30240f;font-size:11px;letter-spacing:.08em}.sf-archive-folder[data-open=true] .af-cover{transform:rotateX(-46deg)}.sf-archive-folder .af-document{position:absolute;left:36px;top:3px;width:138px;height:124px;padding:7px;background:#f5edda;border:0;box-shadow:0 2px 8px #432e2536;transform-origin:center bottom;transition:transform 480ms cubic-bezier(.22,1,.36,1),box-shadow 200ms ease;cursor:pointer}.sf-archive-folder .af-document img{display:block;width:100%;height:88px;object-fit:cover}.sf-archive-folder .af-document span{display:block;font-size:8px;text-align:left;margin-top:5px}.sf-archive-folder .af-document:focus-visible,.sf-archive-folder .af-cover:focus-visible{outline:2px solid #162b20;outline-offset:4px}.sf-archive-folder .af-view{position:absolute;inset:18px;background:#f8f2e5;z-index:30;display:flex;align-items:center;justify-content:center;flex-direction:column;box-shadow:0 15px 30px #67251f44}.sf-archive-folder .af-view img{width:calc(100% - 32px);height:calc(100% - 58px);object-fit:contain}.sf-archive-folder .af-view span{font:italic 14px Georgia,serif;margin:8px}.sf-archive-folder .af-close{position:absolute;right:3px;top:3px;width:44px;height:44px;border:0;background:#f8f2e5;color:#30240f;font-size:22px;cursor:pointer}.sf-archive-folder[data-calm=true] .af-document,.sf-archive-folder[data-calm=true] .af-cover{transition:none}`}</style>
      <div className="af-shell" inert={selected !== null}>
        <div className="af-back" />
        {files.map(([image, title], i) => (
          <button
            className="af-document"
            key={image}
            tabIndex={open ? 0 : -1}
            aria-label={`Open ${title}`}
            style={{
              zIndex: i + 1,
              transform: open
                ? `translate(${(i - 1) * 86}px,${-81 - Math.abs(i - 1) * 5}px) rotate(${(i - 1) * 9}deg)`
                : `translateY(${-i * 3}px) rotate(${i - 1}deg)`,
            }}
            onClick={(e) => {
              if (!open) {
                return
              }
              setInstant(e.detail === 0)
              trigger.current = e.currentTarget
              setSelected(i)
            }}
          >
            <img src={image} alt="" />
            <span>{title}</span>
          </button>
        ))}
        <button className="af-cover" aria-expanded={open} onClick={(e) => toggle(e.detail === 0)}>
          WEATHER STUDIES
        </button>
      </div>
      {selected !== null && (
        <div className="af-view" role="dialog" aria-label={files[selected][1]}>
          <button className="af-close" autoFocus aria-label="Return to folder" onClick={() => setSelected(null)}>
            ×
          </button>
          <img src={files[selected][0]} alt={files[selected][1]} />
          <span>{files[selected][1]}</span>
        </div>
      )}
    </section>
  )
}
