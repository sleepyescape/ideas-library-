/**
 * Adapted from https://github.com/magicuidesign/magicui/blob/85f97fd27b053339af74ba9dd4ca428ee25989fb/apps/www/registry/magicui/border-beam.tsx
 * Converted Tailwind styles and Motion offset-distance to native scoped CSS; explicit border mask; muted colors; pause control and reduced-motion static frame; functional local idea form.
 *
 * MIT License
 *
 * Copyright (c) Magic UI
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

import { useState } from "react"

export default function BorderBeam({ active = true }: { active?: boolean }) {
  const [paused, setPaused] = useState(false)
  const [idea, setIdea] = useState("")
  const [saved, setSaved] = useState(false)
  const canAnimate = active && !paused

  return (
    <div
      data-motion-example="border-beam"
      data-running={canAnimate}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 240,
        display: "grid",
        placeItems: "center",
        position: "relative",
        background: "#20241f",
        color: "#e7ebe4",
        fontFamily: "inherit",
      }}
    >
      <style>{`
        [data-motion-example="border-beam"] textarea::placeholder { color: #a0aa97; opacity: 1; }
        [data-motion-example="border-beam"] .mg-border-light { offset-distance: 35%; animation: mg-border-trace 5s linear infinite; }
        [data-motion-example="border-beam"][data-running="false"] .mg-border-light { animation-play-state: paused; }
        @keyframes mg-border-trace { from { offset-distance: 0%; } to { offset-distance: 100%; } }
        @media (prefers-reduced-motion: reduce) { [data-motion-example="border-beam"] .mg-border-light { animation: none; offset-distance: 35%; } }
      `}</style>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSaved(true)
        }}
        style={{
          position: "relative",
          width: "min(292px, calc(100% - 48px))",
          padding: 17,
          marginBottom: 14,
          border: "1px solid #41493d",
          borderRadius: 17,
          background: "#292e26",
          boxShadow: "0 12px 24px #11160d30",
          boxSizing: "border-box",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 17,
            padding: 1,
            overflow: "hidden",
            pointerEvents: "none",
            maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
            maskClip: "content-box, border-box",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
          }}
        >
          <div
            className="mg-border-light"
            style={{
              position: "absolute",
              width: 90,
              height: 90,
              offsetPath: "rect(0 auto auto 0 round 17px)",
              background: "linear-gradient(to left, #d7e8c6, #a1b990, transparent)",
            }}
          />
        </div>
        <label style={{ display: "block", fontSize: 12, color: "#e4e8df", marginBottom: 9 }}>
          What should we make?
          <textarea
            aria-label="Describe your idea"
            value={idea}
            onChange={(event) => {
              setIdea(event.target.value)
              setSaved(false)
            }}
            placeholder="Describe your idea…"
            rows={2}
            style={{
              display: "block",
              marginTop: 9,
              width: "100%",
              padding: "4px 0",
              resize: "none",
              border: 0,
              borderRadius: 3,
              background: "transparent",
              color: "#d6ddce",
              font: "inherit",
              fontSize: 16,
              lineHeight: 1.6,
              outlineOffset: 5,
              boxSizing: "border-box",
            }}
          />
        </label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span role="status" style={{ fontSize: 10, color: "#a0aa97" }}>
            {saved ? "Idea saved in this preview" : ""}
          </span>
          <button
            type="submit"
            disabled={!idea.trim()}
            aria-label="Save idea in this preview"
            style={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              border: "1px solid #505b47",
              borderRadius: 11,
              background: "#434e39",
              color: "#e7efde",
              cursor: idea.trim() ? "pointer" : "default",
              opacity: idea.trim() ? 1 : 0.6,
              outlineOffset: 3,
              touchAction: "manipulation",
            }}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 12V3M4 7l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
      <button
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
        style={{
          position: "absolute",
          bottom: 2,
          right: 12,
          padding: "0 9px",
          minHeight: 44,
          border: 0,
          borderRadius: 5,
          background: "transparent",
          color: "#b0b8a9",
          font: "inherit",
          fontSize: 10,
          cursor: "pointer",
          outlineOffset: 2,
          touchAction: "manipulation",
        }}
      >
        {paused ? "Play glow" : "Pause glow"}
      </button>
    </div>
  )
}
