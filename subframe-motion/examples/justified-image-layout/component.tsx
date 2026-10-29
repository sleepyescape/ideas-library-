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

type Config = { targetHeight: number; gutter: number; layoutMs: number; lastRow: "start" | "justify" }
export const DEFAULT_CONFIG: Config = { targetHeight: 116, gutter: 7, layoutMs: 340, lastRow: "justify" }
const WORKS = [
  {
    id: 8980,
    src: "/motion/assets/color-study-8980.webp",
    title: "Landscape with Two Poplars",
    width: 1000,
    height: 788,
  },
  { id: 8991, src: "/motion/assets/color-study-8991.webp", title: "Improvisation No. 30", width: 1000, height: 1004 },
  { id: 8983, src: "/motion/assets/color-study-8983.webp", title: "Painting with Troika", width: 1000, height: 734 },
  { id: 16568, src: "/motion/assets/color-study-16568.webp", title: "Water Lilies", width: 1000, height: 961 },
  {
    id: 8987,
    src: "/motion/assets/color-study-8987.webp",
    title: "Painting with Green Center",
    width: 1000,
    height: 931,
  },
  { id: 129849, src: "/motion/assets/color-study-129849.webp", title: "Houses at Murnau", width: 1000, height: 771 },
  { id: 87088, src: "/motion/assets/color-study-87088.webp", title: "Water Lily Pond", width: 1000, height: 889 },
  { id: 64818, src: "/motion/assets/color-study-64818.webp", title: "Stacks of Wheat", width: 1000, height: 591 },
]
type Box = { x: number; y: number; height: number }
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
function pack(ids: number[], target: number, gap: number, last: string) {
  const width = 532
  let best: { cost: number; boxes: Record<number, Box> } = { cost: Infinity, boxes: {} }
  for (let mask = 0; mask < 1 << (ids.length - 1); mask++) {
    const rows: number[][] = [[]]
    ids.forEach((id, i) => {
      rows[rows.length - 1].push(id)
      if (i < ids.length - 1 && mask & (1 << i)) {
        rows.push([])
      }
    })
    if (rows.length > 3) {
      continue
    }
    let y = 0,
      cost = 0
    const boxes: Record<number, Box> = {}
    rows.forEach((row, r) => {
      const sum = row.reduce((n, i) => n + WORKS[i].width / WORKS[i].height, 0)
      const natural = (width - gap * (row.length - 1)) / sum
      const h = r === rows.length - 1 && last === "start" ? Math.min(target, natural) : natural
      cost += (h - target) ** 2 + Math.max(0, h - 160) ** 2 * 4
      let x = 0
      row.forEach((i) => {
        boxes[i] = { x, y, height: h }
        x += (h * WORKS[i].width) / WORKS[i].height + gap
      })
      y += h + gap
    })
    cost += Math.max(0, y - gap - 270) ** 2 * 100
    if (cost < best.cost) {
      best = { cost, boxes }
    }
  }
  return best.boxes
}

function useStageScale(host: { current: HTMLDivElement | null }) {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const node = host.current
    if (!node) {
      return
    }
    const update = () => setScale(Math.min(node.clientWidth / 600, node.clientHeight / 375))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [host])
  return scale
}

export default function JustifiedImageLayout({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<Config>
}) {
  const host = useRef<HTMLDivElement>(null)
  const scale = useStageScale(host)
  const c = { ...DEFAULT_CONFIG, ...config }
  const [added, setAdded] = useState(false)
  const [reduced, setReduced] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const ready = useRef(false)
  const instant = useRef(false)
  const animations = useRef<Animation[]>([])
  const ids = added ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 3, 4, 5, 6]
  const boxes = pack(ids, clamp(c.targetHeight, 80, 140), clamp(c.gutter, 2, 14), c.lastRow)
  const signature = JSON.stringify(boxes)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  useLayoutEffect(() => {
    const duration = !ready.current || reduced || !active || instant.current ? 0 : clamp(c.layoutMs, 160, 460)
    root.current?.querySelectorAll<HTMLElement>("[data-work]").forEach((node) => {
      const id = Number(node.dataset.work),
        box = boxes[id]
      const from = getComputedStyle(node).transform,
        opacity = getComputedStyle(node).opacity
      node.getAnimations().forEach((a) => a.cancel())
      if (box) {
        node.style.transform = `translate(${box.x}px,${box.y}px) scale(${box.height / 100})`
      }
      node.style.opacity = box ? "1" : "0"
      if (duration) {
        animations.current.push(
          node.animate(
            [
              { transform: from === "none" ? node.style.transform : from, opacity },
              { transform: node.style.transform, opacity: box ? 1 : 0 },
            ],
            { duration, easing: "cubic-bezier(.22,.72,.2,1)" },
          ),
        )
      }
    })
    ready.current = true
    instant.current = false
    return () => {
      animations.current = animations.current.filter((a) => a.playState === "running")
    }
    // The packed geometry is the effect's input, not the fresh object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, reduced, active, c.layoutMs])
  useEffect(() => () => animations.current.forEach((a) => a.cancel()), [])
  return (
    <div
      ref={host}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "8 / 5",
        position: "relative",
        overflow: "hidden",
        background: "#fbfaf7",
      }}
    >
      <div
        ref={root}
        className="sf-justified"
        style={{
          width: 600,
          height: 375,
          background: "#fbfaf7",
          color: "#211f1b",
          fontFamily: "Arial, sans-serif",
          padding: "24px 34px",

          overflow: "hidden",
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          boxSizing: "border-box",
        }}
      >
        <style>{`.sf-justified button{border:1px solid #d8d5cd;background:transparent;color:#27241f;border-radius:50%;width:44px;height:44px;padding:0;cursor:pointer;font:11px Arial,sans-serif;display:flex;align-items:center;justify-content:center}.sf-justified button:focus-visible{outline:2px solid #e7432b;outline-offset:4px}.sf-justified button:active{background:#e7e3da}.sf-justified button:disabled{cursor:default;opacity:.5}@media(hover:hover){.sf-justified button:hover{border-color:#5b5750}}`}</style>
        <div aria-label="Art collection" style={{ height: 270, position: "relative" }}>
          {WORKS.map((work, i) => (
            <div
              key={work.id}
              data-work={i}
              aria-hidden={!boxes[i]}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: (100 * work.width) / work.height,
                height: 100,
                transformOrigin: "0 0",
                opacity: 0,
                willChange: "transform",
                background: "#dfdbd1",
              }}
            >
              <img
                alt={work.title}
                src={work.src}
                draggable={false}
                width={work.width}
                height={work.height}
                style={{ display: "block", width: "100%", height: "100%" }}
              />
            </div>
          ))}
        </div>
        <footer style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button
            aria-label={added ? "Remove study" : "Add study"}
            disabled={!active}
            onClick={(e) => {
              instant.current = e.detail === 0
              setAdded((v) => !v)
            }}
            aria-pressed={added}
          >
            <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1, color: "#df3e27" }}>
              {added ? "−" : "+"}
            </span>
          </button>
        </footer>
      </div>
    </div>
  )
}
