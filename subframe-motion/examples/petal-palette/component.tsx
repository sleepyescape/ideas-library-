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

import { type CSSProperties, useId, useRef, useState } from "react"

const PIGMENTS = [
  [52, 87, "Cadmium"],
  [29, 85, "Saffron"],
  [8, 80, "Vermilion"],
  [351, 72, "Carmine"],
  [325, 65, "Fuchsia"],
  [278, 63, "Violet"],
  [249, 74, "Indigo"],
  [226, 82, "Ultramarine"],
  [197, 75, "Cerulean"],
  [167, 65, "Viridian"],
  [139, 65, "Emerald"],
  [82, 72, "Chartreuse"],
] as const
const BOARD =
  "M40 19C103 -1 342 -1 411 17C445 26 460 58 454 92C450 119 439 134 446 161C456 193 443 215 417 228C375 250 302 250 243 242C191 235 154 228 110 235C60 242 17 231 9 206C-2 175 28 164 23 135C19 110 6 82 15 52C20 34 27 25 40 19Z"
const HOLE = "M53 182C57 171 68 167 77 174C88 182 86 195 79 206C71 218 60 217 54 207C49 200 49 192 53 182Z"
const DAUBS = [
  "M7 27C7 24 13 23 16 24C20 20 27 20 31 22C37 21 41 25 46 25C50 26 50 31 48 34C46 38 49 41 46 44C42 48 37 46 33 47C28 50 23 46 18 48C13 48 13 44 9 43C6 40 6 31 7 27Z",
  "M12 39C13 32 19 27 21 21C23 17 28 17 31 19C35 23 39 23 42 27C46 31 41 35 43 38C48 42 46 46 41 48C34 51 29 48 24 49C20 50 17 46 13 46C9 44 10 42 12 39Z",
  "M6 27C7 23 12 23 17 24C20 24 23 21 28 22C34 21 39 26 44 25C50 24 52 28 49 32C46 35 48 39 46 42C43 47 40 47 34 46C30 43 24 48 18 47C14 48 10 43 9 41C5 36 5 31 6 27Z",
  "M9 28C13 23 19 20 25 22C30 21 35 25 39 26C42 29 49 28 50 33C52 39 45 40 44 44C42 48 36 46 31 48C25 48 23 45 18 47C12 46 12 40 9 37C6 34 6 31 9 28Z",
]
const RELIEF = [
  {
    fold: "M9 28C15 25 20 25 26 24C32 25 38 29 44 29C48 34 42 39 34 37C25 34 15 39 9 36Z",
    ridge: "M9 28C15 25 20 25 26 24C32 25 38 29 44 29",
    fibers: ["M12 38C23 35 32 38 42 40", "M18 44C26 41 32 44 38 43"],
  },
  {
    fold: "M16 26C19 23 25 20 29 21C34 21 36 25 40 28C41 31 37 34 32 32C27 29 20 33 15 33Z",
    ridge: "M16 26C19 23 25 20 29 21C34 21 36 25 40 28",
    fibers: ["M14 38C21 34 31 39 39 39", "M20 45C29 44 35 45 40 44"],
  },
  {
    fold: "M9 29C16 27 18 25 23 27C32 30 39 30 48 29C48 34 42 37 35 37C25 34 15 40 9 36Z",
    ridge: "M9 29C16 27 18 25 23 27C32 30 39 30 48 29",
    fibers: ["M12 40C24 36 30 40 41 39", "M17 44C24 42 32 45 37 43"],
  },
  {
    fold: "M11 28C19 26 25 25 31 29C36 32 42 33 47 34C48 38 42 40 37 38C24 33 17 38 11 35Z",
    ridge: "M11 28C19 26 25 25 31 29C36 32 42 33 47 34",
    fibers: ["M13 39C22 36 30 39 40 41", "M20 43C28 42 34 45 38 43"],
  },
]
const rotations = [-8, 7, -5, 6, -9, 4, 8, -6, 5, -4, 7, -8]

function color(hue: number, saturation: number, lightness: number) {
  const l = lightness / 100,
    a = (saturation / 100) * Math.min(l, 1 - l)
  return (
    "#" +
    [0, 8, 4]
      .map((n) => {
        const k = (n + hue / 30) % 12
        return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
          .toString(16)
          .padStart(2, "0")
      })
      .join("")
      .toUpperCase()
  )
}

function PaintDaub({ hue, saturation, variant, id }: { hue: number; saturation: number; variant: number; id: string }) {
  const paint = (offset: number) => `hsl(${hue} ${saturation}% ${47 + offset}%)`
  const shape = DAUBS[variant % 4],
    relief = RELIEF[variant % 4]
  return (
    <svg viewBox="0 0 58 62" aria-hidden="true">
      <defs>
        <linearGradient id={id + "-paint"} x1=".15" y1="0" x2=".85" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor={paint(7)} />
          <stop offset=".29" stopColor={paint(1)} />
          <stop offset=".72" stopColor={paint(-5)} />
          <stop offset="1" stopColor={paint(-16)} />
        </linearGradient>
        <radialGradient id={id + "-fold"} cx=".5" cy="0" r="1">
          <stop stopColor={paint(13)} />
          <stop offset=".4" stopColor={paint(3)} />
          <stop offset="1" stopColor={paint(-7)} />
        </radialGradient>
        <clipPath id={id + "-clip"}>
          <path d={shape} />
        </clipPath>
      </defs>
      <path d={shape} transform="translate(.6 1.5)" fill="#241205" opacity=".3" stroke="#241205" strokeWidth=".4" />
      <path d={shape} fill={`url(#${id}-paint)`} />
      <g clipPath={`url(#${id}-clip)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={relief.fold} fill={`url(#${id}-fold)`} />
        <path d={relief.ridge} transform="translate(0 1.1)" stroke={paint(-24)} strokeOpacity=".28" strokeWidth="1.4" />
        <path d={relief.ridge} stroke={paint(22)} strokeOpacity=".44" strokeWidth="1.3" />
        {relief.fibers.map((path, index) => (
          <g key={index}>
            <path d={path} stroke={paint(-24)} strokeOpacity=".25" strokeWidth=".8" />
            <path d={path} transform="translate(0 -.7)" stroke={paint(25)} strokeOpacity=".33" strokeWidth=".5" />
          </g>
        ))}
        <path d={shape} stroke={paint(24)} strokeWidth=".85" strokeOpacity=".4" transform="translate(.25 .8)" />
      </g>
    </svg>
  )
}

export default function PainterPalette({ active = true }: { active?: boolean }) {
  const [selected, setSelected] = useState(7),
    [lightness, setLightness] = useState(47),
    [keyboard, setKeyboard] = useState(false)
  const id = useId(),
    swatches = useRef<(HTMLButtonElement | null)[]>([])
  const [hue, saturation, name]: readonly [number, number, string] = PIGMENTS[selected],
    hex = color(hue, saturation, lightness)
  return (
    <section
      className="sf-painter"
      data-paused={!active}
      data-keyboard={keyboard}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDownCapture={() => setKeyboard(true)}
      style={{ "--paint": hex } as CSSProperties}
    >
      <div className="sf-painter-workbench">
        <div className="sf-painter-board">
          <svg className="sf-painter-wood" viewBox="0 0 460 256" aria-hidden="true">
            <defs>
              <linearGradient id={id + "-wood"} x1="0" y1="0" x2=".85" y2="1">
                <stop stopColor="#d9b67f" />
                <stop offset=".5" stopColor="#bc8d54" />
                <stop offset="1" stopColor="#a67440" />
              </linearGradient>
              <linearGradient id={id + "-edge"} x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#a97842" />
                <stop offset="1" stopColor="#79502d" />
              </linearGradient>
              <clipPath id={id + "-wood-clip"}>
                <path d={BOARD + HOLE} clipRule="evenodd" />
              </clipPath>
              <filter id={id + "-grain"} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency=".011 .33" numOctaves="2" seed="8" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <filter id={id + "-shadow"} x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#38220c" floodOpacity=".3" />
                <feDropShadow dx="3" dy="10" stdDeviation="7" floodColor="#382a19" floodOpacity=".27" />
              </filter>
            </defs>
            <g filter={`url(#${id}-shadow)`}>
              <path d={BOARD + HOLE} fillRule="evenodd" fill={`url(#${id}-edge)`} transform="translate(0 4)" />
              <path d={BOARD + HOLE} fillRule="evenodd" fill={`url(#${id}-wood)`} stroke="#e5c490" strokeWidth="1" />
            </g>
            <g clipPath={`url(#${id}-wood-clip)`}>
              {[19, 43, 64, 88, 114, 139, 169, 197, 221, 237].map((y, i) => (
                <path
                  key={y}
                  d={`M-20 ${y}C80 ${y + 12} 167 ${y - 17} 252 ${y - 4}S379 ${y + 16} 490 ${y - 5}`}
                  fill="none"
                  stroke={i % 2 ? "#f6dfab" : "#754524"}
                  strokeOpacity={i % 2 ? ".06" : ".035"}
                  strokeWidth={i % 3 ? ".65" : "1.2"}
                />
              ))}
              <rect
                x="0"
                y="0"
                width="460"
                height="250"
                filter={`url(#${id}-grain)`}
                opacity=".045"
                style={{ mixBlendMode: "multiply" }}
              />
              <path d="M59 176C44 192 49 215 65 217" fill="none" stroke="#6d492b" strokeWidth="2" opacity=".43" />
            </g>
          </svg>
          <div className="sf-painter-daubs" role="radiogroup" aria-label="Paint pigment">
            {PIGMENTS.map(([h, s, label], index) => (
              <button
                key={label}
                ref={(node) => {
                  swatches.current[index] = node
                }}
                type="button"
                role="radio"
                aria-label={label}
                aria-checked={selected === index}
                tabIndex={selected === index ? 0 : -1}
                style={{ "--turn": `${rotations[index]}deg` } as CSSProperties}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  const step =
                    event.key === "ArrowDown"
                      ? 6
                      : event.key === "ArrowUp"
                      ? -6
                      : event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                      ? -1
                      : 0
                  if (!step && !["Home", "End"].includes(event.key)) {
                    return
                  }
                  event.preventDefault()
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                      ? PIGMENTS.length - 1
                      : (index + step + PIGMENTS.length) % PIGMENTS.length
                  setSelected(next)
                  swatches.current[next]?.focus()
                }}
              >
                <span className="sf-painter-daub">
                  <PaintDaub hue={h} saturation={s} variant={index} id={`${id}-daub-${index}`} />
                </span>
                <span className="sf-painter-selection" aria-hidden="true" />
              </button>
            ))}
          </div>
          <svg className="sf-painter-stroke" viewBox="0 0 300 90" aria-hidden="true">
            <defs>
              <linearGradient id={id + "-stroke"} x1="0" y1="0" x2=".2" y2="1">
                <stop stopColor={`hsl(${hue} ${saturation}% ${Math.min(94, lightness + 8)}%)`} />
                <stop offset=".5" stopColor={hex} />
                <stop offset="1" stopColor={`hsl(${hue} ${saturation}% ${Math.max(3, lightness - 13)}%)`} />
              </linearGradient>
              <clipPath id={id + "-stroke-clip"}>
                <path d="M24 29C66 16 122 18 167 23L262 24C270 24 279 26 274 29L267 32C277 31 280 35 275 38L269 43C280 43 280 46 272 49L258 54C266 53 272 55 267 58L254 62C249 65 239 65 232 64C174 68 107 67 39 64C19 63 9 60 10 53C10 45 9 37 24 29Z" />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id}-stroke-clip)`}>
              <rect x="0" y="0" width="300" height="90" fill={`url(#${id}-stroke)`} />
              <path
                d="M12 43C82 54 157 40 267 45L280 57C156 52 62 70 12 53Z"
                fill={`hsl(${hue} ${saturation}% ${Math.max(4, lightness - 5)}%)`}
              />
              <path d="M11 42C99 57 171 37 282 46" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="2" />
              <path d="M11 40C99 55 171 35 282 44" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.1" />
              {[29, 32, 35, 38, 48, 52, 57, 60].map((y, index) => (
                <path
                  key={y}
                  d={`M${17 + index * 5} ${y}C100 ${y + 8} 167 ${y - 4} ${278 - index * 2} ${y + 3}`}
                  fill="none"
                  stroke={index % 2 ? "#fff" : "#000"}
                  strokeOpacity={index % 2 ? ".08" : ".1"}
                  strokeWidth={index % 3 ? ".6" : "1"}
                />
              ))}
              <path
                d="M257 28L286 29M258 36L288 35M251 53L285 55M245 62L278 61"
                stroke="#bc8d54"
                strokeOpacity=".7"
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>
        <div className="sf-painter-controls">
          <div className="sf-painter-color">
            <span>{name}</span>
            <output aria-label="Selected paint color" aria-live="polite">
              {hex}
            </output>
          </div>
          <div className="sf-painter-tone">
            <label htmlFor={id + "-lightness"}>Lightness</label>
            <input
              id={id + "-lightness"}
              type="range"
              min="15"
              max="85"
              step="1"
              value={lightness}
              onChange={(event) => setLightness(Number(event.target.value))}
              style={{
                backgroundImage: `linear-gradient(90deg,hsl(${hue} ${saturation}% 15%),hsl(${hue} ${saturation}% 50%),hsl(${hue} ${saturation}% 85%))`,
              }}
            />
            <output aria-live="off">{lightness}%</output>
          </div>
        </div>
      </div>
      <style>{`
.sf-painter{width:100%;height:100%;container-type:size;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at 35% 20%,#eeeae1,#d8d3c8);color:#504737;font-family:Arial,sans-serif;-webkit-font-smoothing:antialiased}.sf-painter *{box-sizing:border-box}.sf-painter-workbench{width:min(82cqw,142cqh);max-width:490px}.sf-painter-board{position:relative;aspect-ratio:460/256}.sf-painter-wood{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.sf-painter-daubs{position:absolute;left:12%;right:8%;top:8%;display:grid;grid-template-columns:repeat(6,1fr);gap:1px 5px}.sf-painter-daubs button{position:relative;aspect-ratio:1/1;min-width:0;min-height:44px;padding:0;background:none;border:0;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}.sf-painter-daub{display:block;width:100%;height:100%;transform:rotate(var(--turn));filter:drop-shadow(.5px 1.5px .8px #38220b50);transform-origin:center 75%;transition:transform 120ms cubic-bezier(.2,.8,.2,1),filter 120ms ease}.sf-painter-daub svg{display:block;width:100%;height:100%;overflow:visible}.sf-painter-selection{position:absolute;bottom:0;left:calc(50% - 5px);width:10px;height:2px;border-radius:2px 1px 2px 1px;background:#493219;box-shadow:0 1px #f6d39d;opacity:0}.sf-painter-daubs button[aria-checked=true] .sf-painter-selection{opacity:1}.sf-painter-stroke{position:absolute;left:28%;top:58%;width:61%;height:32%;overflow:visible;transform:rotate(-5deg);filter:drop-shadow(0 1px .6px #37200f66);pointer-events:none}.sf-painter-controls{display:flex;align-items:center;justify-content:space-between;gap:15px;width:84%;margin:12px auto 0}.sf-painter-color{min-width:0;display:flex;flex-direction:column;gap:6px;font-size:10px}.sf-painter-color span{color:#736a5a}.sf-painter-color output{font:11px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.2px;color:#443a2c}.sf-painter-tone{display:flex;align-items:center;gap:9px;font-size:9px}.sf-painter-tone input{appearance:none;-webkit-appearance:none;width:106px;height:44px;margin:0;background-color:transparent;background-size:100% 7px;background-position:center;background-repeat:no-repeat;border-radius:4px;cursor:ew-resize}.sf-painter-tone input::-webkit-slider-thumb{appearance:none;width:13px;height:21px;background:linear-gradient(100deg,#f8f4e8,#e0d7c5);border:1px solid #aa9c84;border-radius:3px;box-shadow:inset 0 1px #fff,0 1px 2px #48361e33}.sf-painter-tone input::-moz-range-thumb{width:11px;height:19px;background:#f4efdf;border:1px solid #aa9c84;border-radius:3px}.sf-painter-tone output{font:9px ui-monospace,monospace;min-width:24px;font-variant-numeric:tabular-nums}.sf-painter :focus-visible{outline:2px solid #684720;outline-offset:2px}.sf-painter[data-keyboard=true] *,.sf-painter[data-paused=true] *{transition:none!important}@media(hover:hover) and (pointer:fine){.sf-painter-daubs button:hover .sf-painter-daub{filter:brightness(1.045) drop-shadow(.5px 1.5px .8px #38220b50)}}.sf-painter-daubs button:active .sf-painter-daub{transform:rotate(var(--turn)) scale(1.015,.975);filter:drop-shadow(0 .7px .6px #38220b55)}@media(prefers-reduced-motion:reduce){.sf-painter *{transition:none!important}.sf-painter-daubs button:hover .sf-painter-daub,.sf-painter-daubs button[aria-checked=true] .sf-painter-daub,.sf-painter-daubs button:active .sf-painter-daub{transform:rotate(var(--turn))}}@container(max-width:420px){.sf-painter-controls{gap:8px}.sf-painter-tone{gap:5px}.sf-painter-tone input{width:75px}.sf-painter-daubs{gap:0 2px}.sf-painter-daubs button{min-height:0}}
`}</style>
    </section>
  )
}
