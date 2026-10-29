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

const views = [
  ["/motion/assets/coastal-break.webp", "Breakwater"],
  ["/motion/assets/blue-tide.webp", "High tide"],
  ["/motion/assets/mediterranean-clouds.webp", "After the storm"],
]
export default function LetterCollection({ active = true }: { active?: boolean }) {
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
  return (
    <section
      className="sf-letter-collection"
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
      aria-label="Coastal photograph envelope"
    >
      <style>{`.sf-letter-collection{width:100%;height:100%;min-height:280px;position:relative;container-type:size;overflow:hidden;background:#b8cbd0;color:#26313a;font-family:Arial,sans-serif}.sf-letter-collection *{box-sizing:border-box}.sf-letter-collection .lc-envelope{position:absolute;left:50%;top:57%;width:218px;height:144px;transform:translate(-50%,-50%);perspective:800px;z-index:4;transition:transform 420ms cubic-bezier(.22,1,.36,1)}.sf-letter-collection[data-open=true] .lc-envelope{transform:translate(-50%,-50%) translateY(20px) scale(.55)}.sf-letter-collection .lc-base{position:absolute;inset:0;background:#e8e6dd;box-shadow:0 14px 20px #384b5033}.sf-letter-collection .lc-flap{position:absolute;inset:0;z-index:6;transform-origin:top center;transition:transform 320ms cubic-bezier(.22,1,.36,1);background:#f7f6ee;clip-path:polygon(0 0,100% 0,50% 61%);backface-visibility:visible}.sf-letter-collection[data-open=true] .lc-flap{transform:rotateX(180deg);z-index:1}.sf-letter-collection .lc-front{position:absolute;inset:0;background:#f3f0e6;clip-path:polygon(0 0,50% 59%,100% 0,100% 100%,0 100%);z-index:7;pointer-events:none}.sf-letter-collection .lc-front:after{content:'';position:absolute;left:0;right:0;bottom:0;height:90px;background:#fffaf0;clip-path:polygon(0 100%,50% 0,100% 100%)}.sf-letter-collection .lc-seal{position:absolute;left:50%;top:49%;transform:translate(-50%,-50%);width:44px;height:44px;background:#273d3d;color:#f9f4e7;border:2px solid #fff3;border-radius:50%;z-index:8;box-shadow:0 2px 4px #0003;cursor:pointer;font-family:Georgia,serif;font-size:17px;transition:opacity 150ms ease}.sf-letter-collection[data-open=true] .lc-seal{opacity:0;pointer-events:none}.sf-letter-collection .lc-photo{position:absolute;width:min(164px,40cqw);height:min(150px,43cqw);top:57%;left:50%;padding:6px 6px 20px;background:#fffaf0;border:0;box-shadow:0 3px 8px #26323a33;transform-origin:center bottom;z-index:3;cursor:pointer;transition:transform 420ms cubic-bezier(.22,1,.36,1);transition-delay:100ms}.sf-letter-collection[data-open=true] .lc-photo{z-index:12}.sf-letter-collection .lc-photo img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}.sf-letter-collection .lc-photo span{position:absolute;bottom:6px;left:7px;font:italic 9px Georgia,serif;color:#26313a}.sf-letter-collection footer{position:absolute;z-index:14;bottom:12px;left:0;right:0;display:flex;justify-content:center}.sf-letter-collection footer button{min-height:44px;padding:0 14px;background:transparent;color:#26313a;border:0;font-size:10px;letter-spacing:.1em;cursor:pointer}.sf-letter-collection button:focus-visible{outline:2px solid #223e3e;outline-offset:4px}.sf-letter-collection .lc-detail{position:absolute;inset:16px;background:#fffbef;z-index:30;padding:10px 10px 36px;box-shadow:0 16px 24px #26313a33}.sf-letter-collection .lc-detail img{display:block;width:100%;height:100%;object-fit:contain}.sf-letter-collection .lc-detail button{position:absolute;bottom:0;left:50%;transform:translateX(-50%);height:40px;min-width:60px;background:transparent;border:0;font:italic 13px Georgia,serif;color:#26313a;cursor:pointer}.sf-letter-collection[data-calm=true] .lc-envelope,.sf-letter-collection[data-calm=true] .lc-photo,.sf-letter-collection[data-calm=true] .lc-flap{transition:none}`}</style>
      {views.map(([image, title], i) => (
        <button
          className="lc-photo"
          key={image}
          tabIndex={open ? 0 : -1}
          inert={selected !== null}
          aria-label={`Open ${title}`}
          style={{
            transform: open
              ? `translate(calc(-50% + ${i - 1} * min(136px,24cqw)),calc(-50% - 9cqh + ${
                  i === 1 ? -34 : 0
                }px)) rotate(${[-9, 3, 10][i]}deg)`
              : `translate(-50%,calc(-50% + ${-i * 2}px))`,
          }}
          onClick={(e) => {
            trigger.current = e.currentTarget
            setSelected(i)
          }}
        >
          <img src={image} alt="" />
          <span>{title}</span>
        </button>
      ))}
      <div className="lc-envelope" inert={selected !== null}>
        <div className="lc-base" />
        <div className="lc-flap" />
        <div className="lc-front" />
        <button
          className="lc-seal"
          aria-label="Open coastal photographs"
          tabIndex={open ? -1 : 0}
          onClick={(e) => {
            setInstant(e.detail === 0)
            setOpen(true)
          }}
        ></button>
      </div>
      <footer inert={selected !== null}>
        <button
          onClick={(e) => {
            setInstant(e.detail === 0)
            setOpen(!open)
            setSelected(null)
          }}
        >
          {open ? "Return to envelope" : "Open photographs"}
        </button>
      </footer>
      {selected !== null && (
        <div className="lc-detail">
          <img src={views[selected][0]} alt={views[selected][1]} />
          <button autoFocus aria-label="Return to photographs" onClick={() => setSelected(null)}>
            Close ×
          </button>
        </div>
      )}
    </section>
  )
}
