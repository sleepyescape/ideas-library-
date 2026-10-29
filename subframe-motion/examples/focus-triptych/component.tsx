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

import { useEffect, useId, useState } from "react"

const vessels = [
  {
    name: "Silt",
    body: "M35 114C35 108 38 102 44 100L45 91C44 85 116 85 117 91L119 101C132 108 138 123 136 146C135 175 115 191 85 191C58 192 34 178 32 152C30 134 31 123 35 114Z",
    rim: [81, 92, 36, 9],
    colors: ["#777968", "#b8b798", "#8b8b6d", "#4c5041"],
    foot: [60, 184, 48, 12],
  },
  {
    name: "Salt",
    body: "M61 44C60 39 98 39 100 44L99 65C99 77 111 87 119 103C130 126 135 151 130 174C127 191 113 199 85 200C53 201 38 192 36 173C33 151 42 122 49 103C56 85 62 73 62 63Z",
    rim: [80, 44, 19, 5],
    colors: ["#bebca7", "#f0ead7", "#d9d0b9", "#827a64"],
    foot: [58, 195, 54, 10],
  },
  {
    name: "Rust",
    body: "M54 101L54 88C54 82 109 82 110 88L110 101C135 113 142 133 139 157C136 183 116 198 84 198C52 198 31 183 29 159C26 132 33 111 54 101Z",
    rim: [82, 88, 28, 7],
    colors: ["#824d38", "#c88d60", "#a46546", "#553522"],
    foot: [60, 192, 49, 13],
  },
]

function Vessel({ index }: { index: number }) {
  const uid = useId().replace(/:/g, "")
  const v = vessels[index]
  return (
    <svg viewBox="0 0 170 230" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-body`}>
          <stop stopColor={v.colors[0]} />
          <stop offset=".28" stopColor={v.colors[1]} />
          <stop offset=".67" stopColor={v.colors[2]} />
          <stop offset="1" stopColor={v.colors[3]} />
        </linearGradient>
        <radialGradient id={`${uid}-lip`} cx="40%" cy="20%">
          <stop stopColor={v.colors[0]} />
          <stop offset=".7" stopColor={v.colors[3]} />
          <stop offset="1" stopColor="#242318" />
        </radialGradient>
        <linearGradient id={`${uid}-glaze`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fff" stopOpacity=".04" />
          <stop offset=".4" stopColor="#4f3d26" stopOpacity=".12" />
          <stop offset="1" stopColor="#362b22" stopOpacity=".24" />
        </linearGradient>
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".64" numOctaves="3" seed={index + 8} />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
        <clipPath id={`${uid}-clip`}>
          <path d={v.body} />
        </clipPath>
        <filter id={`${uid}-shadow`} x="-40%" y="-100%" width="180%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <ellipse
        cx="89"
        cy="206"
        rx={index === 0 ? 57 : 55}
        ry="5"
        fill="#524733"
        opacity=".23"
        filter={`url(#${uid}-shadow)`}
      />
      <ellipse cx="86" cy="205.4" rx="23" ry="1.2" fill="#463b2b" opacity=".38" />
      <g transform={index === 0 ? "translate(0 8)" : undefined}>
        {index === 1 && (
          <>
            <path
              d="M108 96C154 84 151 159 128 161L124 148C139 135 138 105 116 109Z"
              fill={`url(#${uid}-body)`}
              stroke="#aba48e"
              strokeWidth="1"
            />
            <path d="M120 101C145 99 144 139 130 153" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
          </>
        )}
        <rect x={v.foot[0]} y={v.foot[1]} width={v.foot[2]} height={v.foot[3]} rx="5" fill={v.colors[3]} />
        <path d={v.body} fill={`url(#${uid}-body)`} stroke={v.colors[0]} strokeWidth=".7" />
        <g clipPath={`url(#${uid}-clip)`}>
          <path d="M0 110Q30 114 51 107T91 111T132 105L170 109V240H0Z" fill={`url(#${uid}-glaze)`} />
          {Array.from({ length: 14 }, (_, i) => (
            <path
              key={i}
              d={`M18 ${95 + i * 7}Q84 ${105 + i * 7 + (i % 3)} 150 ${94 + i * 7}`}
              fill="none"
              stroke={i % 2 ? "#fff" : "#322b1d"}
              strokeWidth={i % 3 === 0 ? ".7" : ".35"}
              opacity={index === 1 ? ".07" : ".13"}
            />
          ))}
          <rect
            x="20"
            y="28"
            width="130"
            height="180"
            fill={v.colors[1]}
            filter={`url(#${uid}-grain)`}
            opacity={index === 1 ? ".12" : ".24"}
          />
          {Array.from({ length: 105 }, (_, i) => (
            <ellipse
              key={i}
              cx={26 + ((i * 43.7) % 119)}
              cy={52 + ((i * 23.3) % 151)}
              rx={0.2 + (i % 4) * 0.13}
              ry={0.35 + (i % 3) * 0.13}
              fill={i % 4 === 0 ? "#f7e8c1" : "#302e1f"}
              opacity={index === 1 ? ".32" : ".25"}
            />
          ))}
          {index === 1 && (
            <path
              d="M68 58C73 110 48 121 51 162C54 185 66 188 70 190"
              fill="none"
              stroke="#fffef1"
              strokeWidth="4"
              opacity=".18"
            />
          )}
        </g>
        <ellipse
          cx={v.rim[0]}
          cy={v.rim[1]}
          rx={v.rim[2]}
          ry={v.rim[3]}
          fill={v.colors[1]}
          stroke={v.colors[0]}
          strokeWidth="1"
        />
        <ellipse
          cx={v.rim[0]}
          cy={v.rim[1] - 0.5}
          rx={v.rim[2] - 3.5}
          ry={Math.max(2, v.rim[3] - 2)}
          fill={`url(#${uid}-lip)`}
        />
        <path
          d={`M${v.rim[0] - v.rim[2] + 2} ${v.rim[1]}Q${v.rim[0]} ${v.rim[1] + v.rim[3] * 1.65} ${
            v.rim[0] + v.rim[2] - 2
          } ${v.rim[1]}`}
          fill="none"
          stroke={v.colors[1]}
          strokeWidth="1.4"
        />
      </g>
    </svg>
  )
}

export default function FocusTriptych({ active = true }: { active?: boolean }) {
  const [reduced, setReduced] = useState(true)
  const [instant, setInstant] = useState(false)
  const [selected, setSelected] = useState(1)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(q.matches)
    sync()
    q.addEventListener("change", sync)
    return () => q.removeEventListener("change", sync)
  }, [])
  return (
    <section
      className="sf-focus-triptych"
      data-still={!active || reduced || instant}
      aria-label="Three ceramic vessels"
      onKeyDownCapture={() => setInstant(true)}
      onPointerDownCapture={() => setInstant(false)}
    >
      <div className="shelf" />
      <div className="vessels">
        {vessels.map((v, i) => (
          <button
            type="button"
            key={v.name}
            disabled={!active}
            aria-pressed={selected === i}
            onFocus={() => {
              if (active) {
                setSelected(i)
              }
            }}
            onPointerEnter={(e) => {
              if (active && e.pointerType === "mouse") {
                setInstant(false)
                setSelected(i)
              }
            }}
            onClick={() => setSelected(i)}
          >
            <span className="object">
              <Vessel index={i} />
            </span>
            <span className="name">{v.name}</span>
          </button>
        ))}
      </div>
      <style>{`.sf-focus-triptych{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;background:radial-gradient(ellipse at 18% 5%,#e7e4d8,#d4cfbe 75%);color:#504b3c;font-family:Georgia,serif}.sf-focus-triptych *{box-sizing:border-box}.sf-focus-triptych .shelf{position:absolute;left:6%;right:6%;top:283px;height:18px;background:linear-gradient(#c2b9a0,#aaa189 2px,#b6ad96 4px,#bdb49e);box-shadow:0 9px 12px #695e4628;border-radius:1px}.sf-focus-triptych .vessels{position:absolute;left:6%;right:6%;top:68px;height:258px;display:flex;gap:8px}.sf-focus-triptych button{flex:1;min-width:0;padding:0;border:0;background:none;color:inherit;cursor:pointer;touch-action:manipulation}.sf-focus-triptych .object{display:block;width:100%;height:230px;transform:translateY(10px);transition:filter 240ms ease,opacity 240ms ease}.sf-focus-triptych svg{display:block;width:100%;height:100%;overflow:visible}.sf-focus-triptych button:not([aria-pressed=true]) .object{filter:blur(1.15px);opacity:.62}.sf-focus-triptych .name{display:inline-block;font:13px/28px Georgia,serif;border-bottom:1px solid transparent;transition:border-color 180ms ease}.sf-focus-triptych button[aria-pressed=true] .name{border-color:#6c624c}.sf-focus-triptych button:focus-visible{outline:2px solid #8d643d;outline-offset:4px;border-radius:3px}.sf-focus-triptych button:disabled{cursor:default}.sf-focus-triptych[data-still=true] *{transition:none!important}@media(prefers-reduced-motion:reduce){.sf-focus-triptych *{transition:none!important}}`}</style>
    </section>
  )
}
