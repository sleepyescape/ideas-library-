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
import * as React from "react"

const PLACES = [
  { city: "London", code: "LON", zone: "Europe/London", lat: 51.507, lng: -0.128 },
  { city: "New York", code: "NYC", zone: "America/New_York", lat: 40.713, lng: -74.006 },
  { city: "Tokyo", code: "TYO", zone: "Asia/Tokyo", lat: 35.676, lng: 139.65 },
]
const RAD = Math.PI / 180
const normalize = (n: number) => ((((n + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI
export default function Example({ active = true }: { active?: boolean }) {
  const canvas = React.useRef<HTMLCanvasElement>(null),
    frame = React.useRef(0),
    camera = React.useRef({ yaw: PLACES[0].lng * RAD, pitch: PLACES[0].lat * RAD }),
    aim = React.useRef({ ...camera.current }),
    size = React.useRef({ w: 300, h: 300 }),
    reduced = React.useRef(false)
  const drag = React.useRef<{ id: number; x: number; y: number; yaw: number; pitch: number; moved: boolean } | null>(
      null,
    ),
    selectedRef = React.useRef(0)
  const [selected, setSelected] = React.useState(0),
    [now, setNow] = React.useState<Date | null>(null)
  const draw = React.useRef<() => void>(() => {})
  const resume = React.useRef<() => void>(() => {})
  React.useEffect(() => {
    setNow(new Date())
    if (!active) {
      return
    }
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [active])
  React.useEffect(() => {
    const el = canvas.current
    if (!el) {
      return
    }
    const context = el.getContext("2d")
    if (!context) {
      return
    }
    const ctx = context
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      sync = () => {
        reduced.current = media.matches
        if (media.matches) {
          cancelAnimationFrame(frame.current)
          camera.current = { ...aim.current }
          draw.current()
        }
      }
    sync()
    media.addEventListener("change", sync)
    function project(lat: number, lng: number) {
      const { yaw, pitch } = camera.current
      const x = Math.cos(lat) * Math.sin(lng - yaw),
        z = Math.cos(lat) * Math.cos(lng - yaw)
      return {
        x,
        y: Math.sin(lat) * Math.cos(pitch) - z * Math.sin(pitch),
        z: Math.sin(lat) * Math.sin(pitch) + z * Math.cos(pitch),
      }
    }
    draw.current = () => {
      const { w, h } = size.current,
        r = Math.min(w, h) * 0.405,
        cx = w * 0.5,
        cy = h * 0.5
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "#50182c"
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#bd889c"
      ctx.lineWidth = 0.7
      ctx.globalAlpha = 0.55
      ctx.stroke()
      function line(points: { x: number; y: number; z: number }[]) {
        ctx.beginPath()
        let down = false
        for (const p of points) {
          if (p.z < 0) {
            down = false
            continue
          }
          if (!down) {
            ctx.moveTo(cx + p.x * r, cy - p.y * r)
          } else {
            ctx.lineTo(cx + p.x * r, cy - p.y * r)
          }
          down = true
        }
        ctx.stroke()
      }
      for (let lon = 0; lon < 360; lon += 20) {
        const p = []
        for (let lat = -90; lat <= 90; lat += 3) {
          p.push(project(lat * RAD, lon * RAD))
        }
        line(p)
      }
      for (let lat = -60; lat <= 60; lat += 20) {
        const p = []
        for (let lon = 0; lon <= 360; lon += 3) {
          p.push(project(lat * RAD, lon * RAD))
        }
        line(p)
      }
      ctx.globalAlpha = 1
      PLACES.forEach((place, i) => {
        const p = project(place.lat * RAD, place.lng * RAD)
        if (p.z < 0) {
          return
        }
        const x = cx + p.x * r,
          y = cy - p.y * r
        ctx.fillStyle = i === selectedRef.current ? "#f9fae9" : "#e699b2"
        ctx.strokeStyle = "#50182c"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, i === selectedRef.current ? 6 : 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.font = "10px monospace"
        ctx.fillText(place.code, x + 12, y + 3)
      })
      ctx.strokeStyle = "#b5778d"
      ctx.globalAlpha = 0.45
      ctx.lineWidth = 0.6
      ctx.beginPath()
      for (let i = 0; i < 60; i++) {
        const a = (i * Math.PI) / 30,
          len = i % 5 === 0 ? 6 : 2
        ctx.moveTo(cx + Math.sin(a) * (r + 13), cy + Math.cos(a) * (r + 13))
        ctx.lineTo(cx + Math.sin(a) * (r + 13 + len), cy + Math.cos(a) * (r + 13 + len))
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      size.current = { w: el.clientWidth, h: el.clientHeight }
      const display = el.getBoundingClientRect()
      el.width = Math.max(1, Math.round(display.width * dpr))
      el.height = Math.max(1, Math.round(display.height * dpr))
      ctx.setTransform(el.width / Math.max(1, size.current.w), 0, 0, el.height / Math.max(1, size.current.h), 0, 0)
      draw.current()
    }
    let resizeFrame = 0
    const scheduleResize = () => {
      cancelAnimationFrame(resizeFrame)
      // Ancestor transforms can settle after layout observers have run.
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(resize)
      })
    }
    const transforms = new MutationObserver(scheduleResize)
    for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
      transforms.observe(ancestor, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", scheduleResize)
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    draw.current()
    return () => {
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", scheduleResize)
      cancelAnimationFrame(resizeFrame)
      media.removeEventListener("change", sync)
      cancelAnimationFrame(frame.current)
    }
  }, [])
  React.useEffect(() => {
    if (!active) {
      cancelAnimationFrame(frame.current)
      drag.current = null
    } else if (
      Math.abs(camera.current.yaw - aim.current.yaw) + Math.abs(camera.current.pitch - aim.current.pitch) >
      0.001
    ) {
      resume.current()
    }
  }, [active])
  function focusPlace(i: number, instant = false) {
    selectedRef.current = i
    setSelected(i)
    const p = PLACES[i],
      from = { ...camera.current }
    aim.current = { yaw: from.yaw + normalize(p.lng * RAD - from.yaw), pitch: p.lat * RAD }
    cancelAnimationFrame(frame.current)
    if (instant || !active || reduced.current) {
      camera.current = { ...aim.current }
      draw.current()
      return
    }
    let start = 0
    const tick = (t: number) => {
      if (!start) {
        start = t
      }
      if (document.hidden) {
        return
      }
      const f = Math.min(1, (t - start) / 480),
        e = 1 - (1 - f) ** 3
      camera.current = {
        yaw: from.yaw + (aim.current.yaw - from.yaw) * e,
        pitch: from.pitch + (aim.current.pitch - from.pitch) * e,
      }
      draw.current()
      if (f < 1) {
        frame.current = requestAnimationFrame(tick)
      }
    }
    frame.current = requestAnimationFrame(tick)
  }
  resume.current = () => focusPlace(selectedRef.current)
  return (
    <div className="sf-world-clock-orbit">
      <div className="wo-globe">
        <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label="Interactive globe. Drag to rotate; arrow keys rotate; Home returns to the selected city."
          onKeyDown={(e) => {
            if (e.key === "Home") {
              e.preventDefault()
              focusPlace(selected, true)
              return
            }
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
              return
            }
            e.preventDefault()
            cancelAnimationFrame(frame.current)
            camera.current = {
              yaw: camera.current.yaw + (e.key === "ArrowRight" ? 0.16 : e.key === "ArrowLeft" ? -0.16 : 0),
              pitch: Math.max(
                -1.3,
                Math.min(1.3, camera.current.pitch + (e.key === "ArrowUp" ? 0.12 : e.key === "ArrowDown" ? -0.12 : 0)),
              ),
            }
            aim.current = { ...camera.current }
            draw.current()
          }}
          onPointerDown={(e) => {
            if (e.button !== 0 || !active) {
              return
            }
            cancelAnimationFrame(frame.current)
            e.currentTarget.setPointerCapture(e.pointerId)
            drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ...camera.current, moved: false }
          }}
          onPointerMove={(e) => {
            const d = drag.current
            if (!d || d.id !== e.pointerId) {
              return
            }
            const rect = e.currentTarget.getBoundingClientRect()
            const dx = ((e.clientX - d.x) * e.currentTarget.clientWidth) / rect.width
            const dy = ((e.clientY - d.y) * e.currentTarget.clientHeight) / rect.height
            d.moved ||= Math.hypot(dx, dy) > 4
            camera.current = {
              yaw: d.yaw - dx * 0.012,
              pitch: Math.max(-1.3, Math.min(1.3, d.pitch + dy * 0.009)),
            }
            aim.current = { ...camera.current }
            draw.current()
          }}
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
          onLostPointerCapture={() => {
            drag.current = null
          }}
        />
        <span className="wo-coordinate">
          {Math.abs(PLACES[selected].lat).toFixed(2)}°N / {Math.abs(PLACES[selected].lng).toFixed(2)}°
          {PLACES[selected].lng < 0 ? "W" : "E"}
        </span>
      </div>
      <div className="wo-cities">
        <h3>Local time</h3>
        {PLACES.map((place, i) => (
          <button key={place.zone} aria-pressed={selected === i} onClick={(e) => focusPlace(i, e.detail === 0)}>
            <span>
              {place.city}
              <i>{selected === i ? "↗" : "·"}</i>
            </span>
            <strong>
              {now
                ? new Intl.DateTimeFormat("en-GB", {
                    timeZone: place.zone,
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23",
                  }).format(now)
                : "––:––"}
            </strong>
            <small>
              {now
                ? new Intl.DateTimeFormat("en-GB", {
                    timeZone: place.zone,
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  }).format(now)
                : "Local date"}
            </small>
          </button>
        ))}
      </div>
      <style>{`.sf-world-clock-orbit{width:100%;height:100%;min-height:280px;background:#671d39;color:#faebef;display:flex;overflow:hidden;font-family:Arial,sans-serif;container-type:size}.sf-world-clock-orbit *{box-sizing:border-box}.sf-world-clock-orbit .wo-globe{position:relative;flex:1;min-width:0}.sf-world-clock-orbit canvas{position:absolute;inset:20px 0;width:100%;height:calc(100% - 40px);cursor:grab;touch-action:none}.sf-world-clock-orbit canvas:active{cursor:grabbing}.sf-world-clock-orbit canvas:focus-visible{outline:1px solid #f9de77;outline-offset:-4px}.sf-world-clock-orbit .wo-coordinate{position:absolute;bottom:20px;left:0;right:0;text-align:center;font:9px monospace;opacity:.68;pointer-events:none}.sf-world-clock-orbit .wo-cities{width:185px;flex-shrink:0;border-left:1px solid #a359743f;padding:24px 22px 16px 20px}.sf-world-clock-orbit h3{font-size:12px;font-weight:400;margin:0 0 13px;color:#dfb6c4}.sf-world-clock-orbit button{display:block;text-align:left;background:none;border:0;border-top:1px solid #ad6b812f;color:inherit;width:100%;padding:10px 0;cursor:pointer;touch-action:manipulation;opacity:.6}.sf-world-clock-orbit button[aria-pressed=true]{opacity:1}.sf-world-clock-orbit button>span{display:flex;justify-content:space-between;font-size:11px}.sf-world-clock-orbit button i{font-style:normal;font-size:14px}.sf-world-clock-orbit strong{display:block;font-size:30px;line-height:1.1;letter-spacing:-.055em;font-weight:400;font-variant-numeric:tabular-nums}.sf-world-clock-orbit small{display:block;font-size:9px;margin-top:3px;color:#dfb6c4}.sf-world-clock-orbit button:focus-visible{outline:2px solid #f9de77;outline-offset:3px}@container(max-width:420px){.sf-world-clock-orbit .wo-cities{width:122px;padding:25px 12px 10px}.sf-world-clock-orbit strong{font-size:24px}.sf-world-clock-orbit h3{font-size:11px}.sf-world-clock-orbit .wo-coordinate{font-size:8px;bottom:35px}.sf-world-clock-orbit button{padding:9px 0}}`}</style>
    </div>
  )
}
