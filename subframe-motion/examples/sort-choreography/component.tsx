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

const BUILDINGS = [
  { id: "woolworth", name: "Woolworth", height: 241, year: 1913 },
  { id: "chrysler", name: "Chrysler", height: 319, year: 1930 },
  { id: "empire", name: "Empire State", height: 381, year: 1931 },
  { id: "seagram", name: "Seagram", height: 157, year: 1958 },
  { id: "oneworld", name: "One World", height: 541, year: 2014 },
] as const

const YEARS = [1913, 1930, 1931, 1958, 2014] as const
type BuildingId = (typeof BUILDINGS)[number]["id"]

const OUTLINES: Record<BuildingId, string> = {
  woolworth:
    "M9 400V301H15V291H22V279H27V226H32V205H37V193H40V180L50 159L60 180V193H63V205H68V226H73V279H78V291H85V301H91V400Z",
  chrysler:
    "M13 400V329H18V314H24V232H28V215Q28 193 35 182Q35 166 43 151L48 130L50 81L52 130L57 151Q65 166 65 182Q72 193 72 215V232H76V314H82V329H87V400Z",
  empire:
    "M12 400V333H20V319H26V162H32V134H38V110H42V77H45V56H48V19H52V56H55V77H58V110H62V134H68V162H74V319H80V333H88V400Z",
  seagram: "M9 400V243H91V400Z",
  oneworld: "M14 400V343L30 -17H46V-51H48V-122L50 -141L52 -122V-51H54V-17H70L86 343V400Z",
}

function Elevation({ id, instance }: { id: BuildingId; instance: string }) {
  const clip = `${instance}-${id}-outline`
  const windows = `${instance}-${id}-windows`
  const seagram = id === "seagram"
  return (
    <svg viewBox="0 -141 100 541" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d={OUTLINES[id]} />
        </clipPath>
        <pattern id={windows} width={seagram ? 9 : 8} height={seagram ? 8 : 9} patternUnits="userSpaceOnUse">
          {seagram ? (
            <path d="M1 0V8M0 7.5H9" fill="none" stroke="currentColor" strokeWidth=".6" />
          ) : (
            <path d="M2 1V6H5V1Z" fill="currentColor" fillOpacity=".6" stroke="none" />
          )}
        </pattern>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <path d={OUTLINES[id]} fill="#dce3e8" />
        <rect
          x="0"
          y={id === "oneworld" ? -17 : id === "chrysler" ? 223 : id === "woolworth" ? 207 : id === "empire" ? 114 : 252}
          width="100"
          height="541"
          fill={`url(#${windows})`}
        />
        {id === "woolworth" && (
          <g fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M9 303H91M9 316H91M27 229H73M32 207H68M37 193H63M40 180H60M50 160V192M42 192L50 178L58 192M27 230V400M73 230V400M17 305V400M83 305V400" />
            <path d="M33 279V240Q37 225 41 240V279M45 279V240Q50 225 55 240V279M59 279V240Q63 225 67 240V279" />
          </g>
        )}
        {id === "chrysler" && (
          <g fill="#e6ebef" stroke="currentColor" strokeWidth="1.1">
            <path d="M28 218Q50 178 72 218M29 204Q50 170 71 204M34 187Q50 158 66 187M38 174Q50 150 62 174M43 159Q50 141 57 159" />
            <path
              d="M34 212L37 204L40 208ZM46 202L50 195L54 202ZM60 208L63 204L66 212Z"
              fill="currentColor"
              stroke="none"
            />
            <path d="M24 232H76M18 314H82M13 331H87M31 235V312M69 235V312" fill="none" />
          </g>
        )}
        {id === "empire" && (
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M20 320H80M12 334H88M26 164H74M32 136H68M38 111H62M42 78H58M45 58H55M32 166V317M39 139V317M46 114V317M54 114V317M61 139V317M68 166V317M46 78V107M50 60V107M54 78V107" />
            <path d="M43 399V374Q50 368 57 374V399" fill="#c2cbd2" />
          </g>
        )}
        {id === "oneworld" && (
          <g fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M30 -17L86 343M70 -17L14 343M14 343H86M20 270H80M24 196H76M28 120H72M30 45H70M50 -17V343M17 365H83M46 -51H54" />
          </g>
        )}
        {seagram && (
          <g fill="none" stroke="currentColor">
            <path d="M9 252H91M9 386H91M9 393H91" strokeWidth="2" />
            <path d="M18 245V400M36 245V400M54 245V400M72 245V400M90 245V400" strokeWidth="1.4" />
          </g>
        )}
      </g>
      <path d={OUTLINES[id]} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="miter" />
    </svg>
  )
}

export default function SortChoreography({ active = true }: { active?: boolean }) {
  const instance = useId()
  const [year, setYear] = useState<number>(2014)
  const [keyboardInput, setKeyboardInput] = useState(false)
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  const builtHeight = (building: (typeof BUILDINGS)[number]) => (building.year <= year ? building.height : 0)
  const order = [...BUILDINGS].sort((a, b) => builtHeight(b) - builtHeight(a) || a.year - b.year)

  return (
    <section
      className="sf-sort-choreography"
      data-still={!active || reduced || keyboardInput}
      aria-label="Manhattan architectural height comparison"
    >
      <div className="sf-sort-heading">
        <h2>Manhattan</h2>
        <div className="sf-sort-controls" role="group" aria-label="Skyline year">
          {YEARS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={year === value}
              onClick={(event) => {
                setKeyboardInput(event.detail === 0)
                setYear(value)
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div
        className="sf-sort-chart"
        role="img"
        aria-label={`Five selected Manhattan landmarks as of ${year}, tallest completed first. ${order
          .map((b) => `${b.name}: ${b.year <= year ? `${b.height} metres` : "not yet completed"}`)
          .join(". ")}.`}
      >
        <div className="sf-sort-grid" aria-hidden="true">
          {[100, 300, 500].map((height) => (
            <div key={height} style={{ bottom: `${height * 0.35}px` }}>
              <span>{height}</span>
            </div>
          ))}
        </div>
        <div className="sf-sort-buildings" aria-hidden="true">
          {BUILDINGS.map((building) => (
            <div
              className="sf-sort-building"
              key={building.id}
              data-building={building.id}
              style={{ transform: `translateX(${order.indexOf(building) * 100}%)` }}
            >
              <div
                className="sf-sort-measurement"
                style={{ transform: `translateY(${-builtHeight(building) * 0.35 - 8}px)` }}
              >
                {builtHeight(building) || "—"}
                {builtHeight(building) > 0 && <span> m</span>}
              </div>
              <div
                className="sf-sort-elevation"
                style={{
                  transform: `scaleY(${building.year <= year ? 1 : 0})`,
                  opacity: building.year <= year ? 1 : 0,
                }}
              >
                <Elevation id={building.id} instance={instance} />
              </div>
              <div className="sf-sort-caption">
                <strong>{building.name}</strong>
                <span>{building.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sf-sort-announcement" role="status">
        {year}:{" "}
        {order
          .filter((b) => b.year <= year)
          .map((b) => b.name)
          .join(", ")}
        , tallest first.
      </span>
      <style>{`
        .sf-sort-choreography{position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;isolation:isolate;box-sizing:border-box;background:#e9eef1;color:#22333e;font-family:"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
        .sf-sort-choreography *{box-sizing:border-box}
        .sf-sort-heading{position:absolute;left:36px;right:36px;top:30px;display:flex;align-items:center;justify-content:space-between}
        .sf-sort-heading h2{margin:0;font-size:25px;line-height:1;font-weight:500;letter-spacing:-1.1px}
        .sf-sort-controls{display:flex;padding:3px;gap:2px;background:#dce3e8;border:1px solid #ccd5dc;border-radius:7px}
        .sf-sort-controls button{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;min-width:43px;min-height:38px;padding:0 8px;border:1px solid transparent;border-radius:4px;font:500 11px/1 "Helvetica Neue",Arial,sans-serif;color:#52626c;background:transparent;cursor:pointer;touch-action:manipulation;transition:background-color 120ms ease,color 120ms ease;outline-offset:4px}
        .sf-sort-controls button::before{content:"";position:absolute;inset:-5px 0}
        .sf-sort-controls button svg{opacity:.45}
        .sf-sort-controls button[aria-pressed=true]{background:#f8fafb;color:#1c2c37;border-color:#ffffff;box-shadow:0 1px 2px #2134431f}
        .sf-sort-controls button[aria-pressed=true] svg{opacity:1}
        .sf-sort-controls button:active{background:#c6d1d9}
        .sf-sort-controls button:focus-visible{outline:2px solid #145fa0}
        .sf-sort-chart{position:absolute;left:48px;right:28px;bottom:75px;height:211px;border-bottom:1px solid #8c9aa4}
        .sf-sort-grid{position:absolute;inset:0;pointer-events:none}
        .sf-sort-grid>div{position:absolute;left:0;right:0;border-top:1px solid #cdd6dc}
        .sf-sort-grid span{position:absolute;right:calc(100% + 10px);top:-5px;color:#566b78;font:9px/1 "SFMono-Regular",Consolas,monospace;font-variant-numeric:tabular-nums}
        .sf-sort-buildings{position:absolute;inset:0;list-style:none;padding:0;margin:0}
        .sf-sort-building{position:absolute;left:0;bottom:0;height:100%;width:20%;transition:transform 650ms cubic-bezier(.22,.8,.24,1)}
        .sf-sort-elevation{position:absolute;width:100%;height:189.35px;bottom:0;transform-origin:center bottom;transition:transform 650ms cubic-bezier(.22,.8,.24,1),opacity 180ms linear}.sf-sort-elevation>svg{position:absolute;width:100px;height:189.35px;left:50%;bottom:0;transform:translateX(-50%);overflow:visible}
        .sf-sort-measurement{position:absolute;left:0;right:0;bottom:0;text-align:center;transition:transform 650ms cubic-bezier(.22,.8,.24,1);font:500 12px/1 "SFMono-Regular",Consolas,monospace;font-variant-numeric:tabular-nums;color:#b63e28}
        .sf-sort-measurement span{font-size:9px;color:#8c564c}
        .sf-sort-caption{position:absolute;top:calc(100% + 12px);left:0;right:0;display:flex;align-items:center;flex-direction:column;gap:7px;white-space:nowrap}
        .sf-sort-caption strong{font-size:11px;line-height:1.2;font-weight:500;letter-spacing:-.15px}
        .sf-sort-caption>span{font:10px/1 "SFMono-Regular",Consolas,monospace;color:#566b78;font-variant-numeric:tabular-nums}
        .sf-sort-announcement{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
        .sf-sort-choreography[data-still=true] .sf-sort-elevation,.sf-sort-choreography[data-still=true] .sf-sort-measurement,.sf-sort-choreography[data-still=true] .sf-sort-building,.sf-sort-choreography[data-still=true] button{transition:none}
        @media(hover:hover) and (pointer:fine){.sf-sort-controls button:hover{color:#142a39;background:#edf2f5}}
        @media(prefers-reduced-motion:reduce){.sf-sort-choreography .sf-sort-elevation,.sf-sort-choreography .sf-sort-measurement,.sf-sort-choreography .sf-sort-building,.sf-sort-choreography button{transition:none}}
      `}</style>
    </section>
  )
}
