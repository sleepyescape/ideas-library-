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

import { useEffect, useLayoutEffect, useRef, useState } from "react"

type Config = { moveMs: number; exitLeadMs: number; departurePx: number; markChanges: boolean }
export const DEFAULT_CONFIG: Config = { moveMs: 260, exitLeadMs: 60, departurePx: 12, markChanges: true }

type Word = { id: string; text: string }
const COPY = [
  ["Make room for ideas.", "Make room for everyone."],
  ["Make more room for ideas.", "Make room for everyone."],
  ["Make room for better ideas.", "Make space for everyone."],
]
let nextWordId = 0
function matchWords(previous: Word[], words: string[]): Word[] {
  const lengths = Array.from({ length: previous.length + 1 }, () => Array<number>(words.length + 1).fill(0))
  for (let i = previous.length - 1; i >= 0; i--) {
    for (let j = words.length - 1; j >= 0; j--) {
      lengths[i][j] =
        previous[i].text === words[j] ? 1 + lengths[i + 1][j + 1] : Math.max(lengths[i + 1][j], lengths[i][j + 1])
    }
  }
  const identities = new Map<number, string>()
  let i = 0,
    j = 0
  while (i < previous.length && j < words.length) {
    if (previous[i].text === words[j]) {
      identities.set(j, previous[i].id)
      i++
      j++
    } else if (lengths[i + 1][j] > lengths[i][j + 1]) {
      i++
    } else {
      j++
    }
  }
  return words.map((text, index) => ({ text, id: identities.get(index) ?? `word-${nextWordId++}` }))
}
const REVISIONS: Word[][] = []
for (const lines of COPY) {
  REVISIONS.push(matchWords(REVISIONS.at(-1) ?? [], lines.join(" ").split(" ")))
}
const WORDS = [...new Map(REVISIONS.flat().map((word) => [word.id, word])).values()]
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export default function SentenceDiffMotion({ active = true, config }: { active?: boolean; config?: Partial<Config> }) {
  const settings = { ...DEFAULT_CONFIG, ...config }
  const moveMs = clamp(Number.isFinite(settings.moveMs) ? settings.moveMs : DEFAULT_CONFIG.moveMs, 120, 420)
  const exitLeadMs = clamp(
    Number.isFinite(settings.exitLeadMs) ? settings.exitLeadMs : DEFAULT_CONFIG.exitLeadMs,
    0,
    140,
  )
  const departurePx = clamp(
    Number.isFinite(settings.departurePx) ? settings.departurePx : DEFAULT_CONFIG.departurePx,
    0,
    24,
  )
  const [revision, setRevision] = useState(0)
  const [size, setSize] = useState(0)
  const [reduced, setReduced] = useState(true)
  const [removed, setRemoved] = useState<string[]>([])
  const [added, setAdded] = useState(0)
  const [announcement, setAnnouncement] = useState(COPY[0].join(" "))
  const frame = useRef<HTMLDivElement>(null)
  const spans = useRef(new Map<string, HTMLSpanElement>())
  const measures = useRef(new Map<string, HTMLSpanElement>())
  const animations = useRef<Animation[]>([])
  const previous = useRef(0)
  const mounted = useRef(false)
  const run = useRef(0)
  const timing = useRef({ moveMs, exitLeadMs, departurePx })
  timing.current = { moveMs, exitLeadMs, departurePx }
  const enabled = useRef(active)
  enabled.current = active

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    if (!frame.current) {
      return
    }
    const observer = new ResizeObserver(() => setSize((value) => value + 1))
    observer.observe(frame.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const update = () => {
      for (const animation of animations.current) {
        if (animation.playState === "finished" || animation.playState === "idle") {
          continue
        }
        if (active && !document.hidden) {
          animation.play()
        } else {
          animation.pause()
        }
      }
    }
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [active])
  useEffect(
    () => () => {
      run.current++
      animations.current.forEach((animation) => animation.cancel())
    },
    [],
  )

  useLayoutEffect(() => {
    const container = frame.current
    if (!container) {
      return
    }
    const origin = container.getBoundingClientRect()
    const visual = new Map<string, { x: number; y: number; opacity: number }>()
    for (const [id, node] of spans.current) {
      const rect = node.getBoundingClientRect()
      visual.set(id, {
        x: rect.left - origin.left,
        y: rect.top - origin.top,
        opacity: Number(getComputedStyle(node).opacity),
      })
    }
    animations.current.forEach((animation) => animation.cancel())
    animations.current = []
    const currentRun = ++run.current
    const isRevision = mounted.current && previous.current !== revision
    const oldWords = REVISIONS[previous.current]
    const oldIds = new Set(oldWords.map((word) => word.id))
    const newIds = new Set(REVISIONS[revision].map((word) => word.id))
    if (isRevision) {
      setRemoved(oldWords.filter((word) => !newIds.has(word.id)).map((word) => word.text))
      setAdded(REVISIONS[revision].filter((word) => !oldIds.has(word.id)).length)
    }
    const { moveMs: duration, exitLeadMs: lead, departurePx: departure } = timing.current
    for (const word of WORDS) {
      const node = spans.current.get(word.id)
      if (!node) {
        continue
      }
      const from = visual.get(word.id) ?? { x: 0, y: 0, opacity: 0 }
      const measure = newIds.has(word.id) ? measures.current.get(word.id) : undefined
      const rect = measure?.getBoundingClientRect()
      const target = rect
        ? { x: rect.left - origin.left, y: rect.top - origin.top, opacity: 1 }
        : { x: from.x, y: from.y - departure, opacity: 0 }
      if (isRevision) {
        node.dataset.change = !newIds.has(word.id) ? "removed" : !oldIds.has(word.id) ? "added" : "kept"
      }
      node.style.transform = `translate(${target.x}px, ${target.y}px)`
      node.style.opacity = String(target.opacity)
      if (isRevision && !reduced && (newIds.has(word.id) || from.opacity > 0.01)) {
        const inserted = from.opacity < 0.01 && newIds.has(word.id)
        const animation = node.animate(
          [
            {
              transform: `translate(${inserted ? target.x : from.x}px, ${inserted ? target.y + departure : from.y}px)`,
              opacity: inserted ? 0 : from.opacity,
            },
            { transform: node.style.transform, opacity: target.opacity },
          ],
          {
            duration: newIds.has(word.id) ? duration : duration * 0.6,
            delay: newIds.has(word.id) ? lead : 0,
            easing: "cubic-bezier(.22,.72,.15,1)",
            fill: "both",
          },
        )
        if (!enabled.current || document.hidden) {
          animation.pause()
        }
        animations.current.push(animation)
      }
    }
    previous.current = revision
    mounted.current = true
    if (animations.current.length) {
      const running = animations.current
      void Promise.all(running.map((animation) => animation.finished)).then(
        () => {
          if (run.current !== currentRun) {
            return
          }
          running.forEach((animation) => animation.cancel())
          animations.current = []
          setAnnouncement(COPY[revision].join(" "))
        },
        () => {},
      )
    } else {
      setAnnouncement(COPY[revision].join(" "))
    }
  }, [revision, size, reduced])

  let wordIndex = 0
  return (
    <section className="sf-sentence-diff" data-marks={settings.markChanges} aria-label="Sentence revision">
      <div className="sd-heading">
        <span className="sd-count">
          {added ? `+${added}` : ""}
          {removed.length ? ` −${removed.length}` : ""}
        </span>
      </div>
      <div className="sd-proof" ref={frame} aria-hidden="true">
        <div className="sd-measure">
          {COPY[revision].map((line, lineIndex) => (
            <div className="sd-line" key={lineIndex}>
              {line.split(" ").map(() => {
                const word = REVISIONS[revision][wordIndex++]
                return (
                  <span
                    key={word.id}
                    ref={(node) => {
                      if (node) {
                        measures.current.set(word.id, node)
                      } else {
                        measures.current.delete(word.id)
                      }
                    }}
                  >
                    {word.text}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
        {WORDS.map((word) => (
          <span
            className="sd-word"
            key={word.id}
            ref={(node) => {
              if (node) {
                spans.current.set(word.id, node)
              } else {
                spans.current.delete(word.id)
              }
            }}
            style={{ opacity: 0 }}
          >
            {word.text}
          </span>
        ))}
      </div>
      <div className="sd-deletions" aria-hidden="true">
        {settings.markChanges && removed.length > 0 && (
          <>
            <span>Removed</span>
            <del>{removed.join(" ")}</del>
          </>
        )}
      </div>
      <p className="sd-sr" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <footer>
        <div className="sd-revisions" role="group" aria-label="Choose a revision">
          {["Original", "More room", "New direction"].map((label, index) => (
            <button
              type="button"
              disabled={!active}
              key={label}
              aria-pressed={revision === index}
              onClick={() => setRevision(index)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {label}
            </button>
          ))}
        </div>
      </footer>
      <style>{`.sf-sentence-diff{position:relative;width:100%;height:100%;min-height:300px;overflow:hidden;background:#f3df3d;color:#201f16;font-family:Arial,Helvetica,sans-serif;container-type:inline-size}.sf-sentence-diff *{box-sizing:border-box}.sf-sentence-diff .sd-heading{position:absolute;left:7%;right:7%;top:10%;display:flex;justify-content:flex-end;font-size:12px;font-weight:600;letter-spacing:-.02em}.sf-sentence-diff .sd-count{color:#ad2e20;font:12px ui-monospace,monospace}.sf-sentence-diff .sd-proof{position:absolute;left:7%;right:5%;top:31%;height:140px;font-size:clamp(22px,6cqw,37px);line-height:1.3;font-weight:650;letter-spacing:-.055em}.sf-sentence-diff .sd-measure{position:absolute;inset:0;visibility:hidden}.sf-sentence-diff .sd-line{display:flex;flex-wrap:wrap;gap:0 .24em;min-height:1.3em}.sf-sentence-diff .sd-word{position:absolute;left:0;top:0;white-space:nowrap;will-change:transform,opacity;pointer-events:none}.sf-sentence-diff[data-marks=true] .sd-word[data-change=added]{color:#b32d20;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px}.sf-sentence-diff[data-marks=true] .sd-word[data-change=removed]{color:#9b291e;text-decoration:line-through}.sf-sentence-diff .sd-deletions{position:absolute;top:71%;left:7%;right:7%;min-height:18px;display:flex;gap:12px;align-items:center;color:#9b291e;font-size:12px}.sf-sentence-diff .sd-deletions>span{font-size:10px;text-transform:uppercase;letter-spacing:.08em}.sf-sentence-diff footer{position:absolute;left:7%;right:7%;bottom:5%;border-top:1px solid #201f162b;padding-top:5px}.sf-sentence-diff .sd-revisions{display:flex;justify-content:space-between;gap:6px}.sf-sentence-diff button{display:flex;align-items:center;gap:8px;min-height:44px;background:none;border:0;padding:0 5px;color:#595222;font:12px Arial,sans-serif;cursor:pointer;touch-action:manipulation}.sf-sentence-diff button>span{display:grid;place-items:center;width:24px;height:24px;border:1px solid #201f1633;border-radius:50%;font:9px ui-monospace,monospace}.sf-sentence-diff button[aria-pressed=true]{color:#201f16;font-weight:700}.sf-sentence-diff button[aria-pressed=true]>span{background:#201f16;border-color:#201f16;color:#f3df3d}.sf-sentence-diff button:focus-visible{outline:2px solid #a3271b;outline-offset:2px;border-radius:3px}.sf-sentence-diff button:disabled{cursor:default;opacity:.5}.sf-sentence-diff button:active:not(:disabled){opacity:.65}.sf-sentence-diff .sd-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@media(hover:hover) and (pointer:fine){.sf-sentence-diff button:hover{color:#a3271b}}@media(prefers-reduced-motion:reduce){.sf-sentence-diff *{animation:none!important;transition:none!important}}`}</style>
    </section>
  )
}
