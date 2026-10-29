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

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

export default function IssueTurn({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion()
  const [opened, setOpened] = useState(false)
  const cover = useRef<HTMLDivElement>(null)
  const animation = useRef<Animation | null>(null)
  const current = useRef(false)

  useEffect(() => {
    if (!animation.current) {
      return
    }
    if (reduced) {
      animation.current.finish()
      return
    }
    if (active && animation.current.playState === "paused") {
      animation.current.play()
    } else if (!active && animation.current.playState === "running") {
      animation.current.pause()
    }
  }, [active, reduced])
  useEffect(() => () => animation.current?.cancel(), [])

  function turn(animate: boolean) {
    const next = !current.current
    current.current = next
    const element = cover.current
    if (!element) {
      return
    }
    const from = getComputedStyle(element).transform
    animation.current?.cancel()
    const to = next ? "rotateY(-152deg)" : "rotateY(-12deg)"
    element.style.transform = to
    if (animate && active && !reduced) {
      animation.current = element.animate([{ transform: from }, { transform: to }], {
        duration: 640,
        easing: "cubic-bezier(.22,.8,.2,1)",
      })
    } else {
      animation.current = null
    }
    setOpened(next)
  }

  return (
    <section className="sf-issue" data-open={opened}>
      <span className="sf-issue-wordmark">OOO.</span>
      <span className="sf-issue-tagline">
        A JOURNAL FOR
        <br />
        THE OTHER IDEAS.
      </span>
      <div className="sf-issue-book">
        <div className="sf-issue-pages">
          <div className="sf-issue-content" aria-hidden={!opened}>
            <span>THE OFFBEAT ISSUE</span>
            <h3>
              Off
              <br />
              the
              <br />
              <em>clock.</em>
            </h3>
            <p>
              A studio visit after dark.
              <br />
              Six places where the
              <br />
              side project became
              <br />
              the main event.
            </p>
            <b>003</b>
          </div>
        </div>
        <div ref={cover} className="sf-issue-cover" aria-hidden={opened}>
          <div className="sf-issue-front">
            <span className="sf-issue-edition">INDEPENDENT CULTURE / VOL. 03</span>
            <h3>
              ODD
              <br />
              ONE
              <br />
              OUT.
            </h3>
            <svg viewBox="0 0 160 160" aria-hidden="true">
              <path
                d="M9 147C9 29 151 18 151 103C151 174 51 177 51 92C51 36 112 41 112 79C112 113 82 117 82 84"
                fill="none"
                stroke="#101112"
                strokeWidth="19"
              />
            </svg>
            <span className="sf-issue-subtitle">
              PHOTOGRAPHY. DESIGN.
              <br />
              NIGHTLIFE.
            </span>
          </div>
          <div className="sf-issue-back" aria-hidden="true">
            <span>
              AFTER
              <br />
              HOURS
              <br />
              BEFORE
              <br />
              DAWN.
            </span>
          </div>
        </div>
      </div>
      <button
        className="sf-issue-toggle"
        type="button"
        aria-expanded={opened}
        onClick={(event) => turn(event.detail > 0)}
      >
        {opened ? "Close the issue" : "Take a look inside"}
        <span aria-hidden="true">{opened ? "↙" : "↗"}</span>
      </button>
      <style>{`
        .sf-issue{width:100%;height:100%;min-height:300px;background:#096df7;color:#000;position:relative;overflow:hidden;font-family:Arial,Helvetica,sans-serif;container-type:size}.sf-issue *{box-sizing:border-box}.sf-issue-wordmark{position:absolute;top:21px;left:23px;font-size:30px;font-weight:950;letter-spacing:-.09em;line-height:1}.sf-issue-tagline{position:absolute;right:23px;top:24px;font-size:8px;font-weight:650;line-height:1.2;letter-spacing:.04em}
        .sf-issue-book{position:absolute;width:170px;height:237px;left:50%;top:51%;transform:translate(-25%,-50%) rotate(7deg);perspective:1100px}.sf-issue-pages{position:absolute;inset:0;background:#f3f1e7;box-shadow:3px 1px 0 #cfdbd2,5px 2px 0 #f3f1e7,7px 3px 0 #d3dfd8,11px 10px 16px #00387855;overflow:hidden}.sf-issue-content{padding:19px 17px;color:#141817;position:relative;height:100%;box-shadow:inset 10px 0 14px #00000010}.sf-issue-content>span{font:7px ui-monospace,monospace;letter-spacing:.03em}.sf-issue-content h3{font-size:31px;line-height:.99;letter-spacing:-.075em;margin:20px 0 13px}.sf-issue-content h3 em{font-family:Georgia,serif;font-weight:400}.sf-issue-content p{font-size:9px;line-height:1.45;letter-spacing:-.01em;margin:0}.sf-issue-content b{position:absolute;bottom:16px;right:15px;font:8px ui-monospace,monospace}
        .sf-issue-cover{position:absolute;inset:0;transform:rotateY(-12deg);transform-origin:left center;transform-style:preserve-3d;will-change:transform}.sf-issue-front,.sf-issue-back{position:absolute;inset:0;backface-visibility:hidden;overflow:hidden;background:#72ffe9;box-shadow:inset 4px 0 4px #001c1a20}.sf-issue-front{padding:14px;color:#101112}.sf-issue-edition{display:block;font:6px/1.2 ui-monospace,monospace;letter-spacing:.01em}.sf-issue-front h3{margin:17px 0 0;font-size:50px;line-height:.78;font-weight:900;letter-spacing:-.085em;position:relative;z-index:1}.sf-issue-front svg{position:absolute;width:132px;height:132px;right:-28px;bottom:-14px;transform:rotate(-17deg)}.sf-issue-subtitle{position:absolute;bottom:15px;left:14px;font:6px/1.3 ui-monospace,monospace;font-weight:700}.sf-issue-back{transform:rotateY(180deg);display:flex;align-items:center;justify-content:center;background:#082e3c;color:#72ffe9}.sf-issue-back span{font-size:30px;line-height:.84;font-weight:850;letter-spacing:-.065em;transform:rotate(-90deg)}
        .sf-issue-toggle{position:absolute;bottom:15px;left:23px;right:23px;display:flex;justify-content:space-between;align-items:center;min-height:38px;border:0;border-top:1px solid #08244e66;padding:6px 0 0;background:transparent;color:#000;font-size:11px;cursor:pointer}.sf-issue-toggle span{font-size:24px}.sf-issue-toggle:focus-visible{outline:2px solid #072345;outline-offset:4px}.sf-issue-toggle:active{opacity:.65}
        @container(max-width:350px){.sf-issue-book{width:150px;height:213px;left:48%;top:50%;transform:translate(-25%,-50%) rotate(5deg)}.sf-issue-front h3{font-size:44px}.sf-issue-content h3{font-size:27px;margin-top:17px}.sf-issue-content p{font-size:8px}.sf-issue-wordmark{font-size:25px}.sf-issue-tagline{font-size:7px}.sf-issue-front svg{width:118px;height:118px}.sf-issue-edition{font-size:5px}}
        @container(max-height:340px){.sf-issue-book{width:146px;height:203px;top:46%}.sf-issue-front h3{font-size:42px}.sf-issue-front svg{width:115px;height:115px}.sf-issue-content{padding:15px}.sf-issue-content h3{font-size:27px;margin-top:15px}.sf-issue-content p{font-size:8px}.sf-issue-edition{font-size:5px}}
      `}</style>
    </section>
  )
}
