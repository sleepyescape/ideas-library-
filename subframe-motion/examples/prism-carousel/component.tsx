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

function useReduced() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(q.matches)
    sync()
    q.addEventListener("change", sync)
    return () => q.removeEventListener("change", sync)
  }, [])
  return reduced
}

const prints = [
  ["/motion/assets/concrete-geometries.webp", "Concrete geometries"],
  ["/motion/assets/concrete-projections.webp", "Cantilever"],
  ["/motion/assets/cathedral-columns.webp", "Stone rhythm"],
]
const prism = `precision highp float;varying vec2 uv;uniform sampler2D atlas;uniform vec2 size;uniform float position;uniform float focus;uniform float chosen;uniform float velocity;
vec3 field(vec2 p){vec3 bg=vec3(234.,235.,234.)/255.;float a=size.x/size.y;float x=(p.x-.5)*a+position*.73;float id=floor((x+.365)/.73);float local=mod(x+.365,.73);float shrink=1.-min(.09,abs(velocity)*.008);vec2 q=vec2((local-.035)/.66,(p.y-.10)/.80);q=(q-.5)/shrink+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return bg;float image=mod(id+300.,3.);return texture2D(atlas,vec2((image+clamp(q.x,0.002,.998))/3.,clamp(q.y,.002,.998))).rgb;}
void main(){float rim=pow(abs(uv.x-.5)*2.,2.4)*(1.-focus);vec2 p=uv;p.x+=sign(uv.x-.5)*rim*.10;p.y=.5+(uv.y-.5)*(1.+rim*.56);p.y+=sin(uv.y*6.283)*rim*.018;vec2 ca=vec2(.006,.001)*rim;vec3 col=vec3(field(p+ca).r,field(p).g,field(p-ca).b);vec2 q=vec2((uv.x-.5)*(size.x/size.y)/.768+.5,(uv.y-.5)/.96+.5);vec3 front=vec3(234.,235.,234.)/255.;if(q.x>=0.&&q.x<=1.&&q.y>=0.&&q.y<=1.)front=texture2D(atlas,vec2((chosen+clamp(q.x,.002,.998))/3.,clamp(q.y,.002,.998))).rgb;gl_FragColor=vec4(mix(col,front,focus),1.);}`
export default function PrismCarousel({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [index, setIndex] = useState(0),
    [focused, setFocused] = useState(false),
    [failed, setFailed] = useState(false),
    reduced = useReduced(),
    live = useRef({ active, reduced }),
    control = useRef<{
      go: (direction: number, instant: boolean) => void
      focus: (value: boolean, instant: boolean) => void
      stop: () => void
      wake: () => void
    } | null>(null)
  live.current = { active, reduced }
  useEffect(() => {
    const c = canvas.current!,
      gl = c.getContext("webgl", { alpha: false, antialias: false })
    if (!gl) {
      setFailed(true)
      return
    }
    let dead = false,
      loaded = false,
      w = 1,
      h = 1,
      raf = 0,
      last = 0,
      position = 0,
      target = 0,
      speed = 0,
      focus = 0,
      focusTarget = 0,
      chosen = 0
    const shaders: WebGLShader[] = []
    const compile = (type: number, code: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, code)
      gl.compileShader(s)
      shaders.push(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw Error("Compile failed")
      }
      return s
    }
    const p = gl.createProgram()!
    let buffer: WebGLBuffer, texture: WebGLTexture
    try {
      gl.attachShader(
        p,
        compile(
          gl.VERTEX_SHADER,
          "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}",
        ),
      )
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, prism))
      gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw Error("Link failed")
      }
      gl.useProgram(p)
      buffer = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
      const a = gl.getAttribLocation(p, "p")
      gl.enableVertexAttribArray(a)
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
      texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    } catch {
      gl.deleteProgram(p)
      setFailed(true)
      shaders.forEach((s) => gl.deleteShader(s))
      return
    }
    const get = (n: string) => gl.getUniformLocation(p, n),
      u = {
        size: get("size"),
        position: get("position"),
        focus: get("focus"),
        chosen: get("chosen"),
        velocity: get("velocity"),
      }
    const paint = () => {
      if (!loaded || dead || gl.isContextLost()) {
        return
      }
      gl.viewport(0, 0, c.width, c.height)
      gl.uniform2f(u.size, w, h)
      gl.uniform1f(u.position, position)
      gl.uniform1f(u.focus, focus)
      gl.uniform1f(u.chosen, chosen)
      gl.uniform1f(u.velocity, speed)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    let dragging: {
      id: number
      x: number
      position: number
      target: number
      moved: boolean
      lastX: number
      lastT: number
    } | null = null
    const tick = (t: number) => {
      raf = 0
      if (!live.current.active || live.current.reduced || document.hidden || gl.isContextLost()) {
        return
      }
      const dt = Math.min(0.032, (t - last) / 1000 || 0.016)
      last = t
      if (!dragging) {
        speed += (target - position) * 155 * dt
        speed *= Math.exp(-22 * dt)
        position += speed * dt
      }
      focus += (focusTarget - focus) * (1 - Math.exp(-dt / 0.11))
      if (Math.abs(focus - focusTarget) < 0.001) {
        focus = focusTarget
      }
      paint()
      if (dragging || Math.abs(target - position) > 0.0003 || Math.abs(speed) > 0.003 || focus !== focusTarget) {
        raf = requestAnimationFrame(tick)
      }
    }
    const wake = () => {
      if (!raf && live.current.active && !live.current.reduced && !document.hidden && !gl.isContextLost()) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
    }
    const choose = () => {
      chosen = ((Math.round(target) % 3) + 3) % 3
      setIndex(chosen)
    }
    const go = (direction: number, instant: boolean) => {
      target = Math.round(target) + direction
      focusTarget = 0
      setFocused(false)
      choose()
      if (instant || !live.current.active || live.current.reduced) {
        position = target
        speed = 0
        focus = 0
        paint()
      } else {
        wake()
      }
    }
    const setFocus = (v: boolean, instant: boolean) => {
      focusTarget = +v
      setFocused(v)
      if (instant || !live.current.active || live.current.reduced) {
        focus = focusTarget
        paint()
      } else {
        wake()
      }
    }
    const size = () => {
      const r = c.getBoundingClientRect(),
        d = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3600000 / Math.max(1, r.width * r.height)))
      w = r.width
      h = r.height
      const nextWidth = Math.max(1, Math.round(w * d))
      const nextHeight = Math.max(1, Math.round(h * d))
      if (c.width !== nextWidth || c.height !== nextHeight) {
        c.width = nextWidth
        c.height = nextHeight
      }
      paint()
    }
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || focusTarget) {
        return
      }
      dragging = {
        id: e.pointerId,
        x: e.clientX,
        position,
        target,
        moved: false,
        lastX: e.clientX,
        lastT: performance.now(),
      }
      c.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!dragging || dragging.id !== e.pointerId) {
        return
      }
      const dx = e.clientX - dragging.x
      if (Math.abs(dx) > 4) {
        dragging.moved = true
      }
      if (!dragging.moved) {
        return
      }
      const now = performance.now()
      const height = c.getBoundingClientRect().height
      speed = ((-(e.clientX - dragging.lastX) / Math.max(10, now - dragging.lastT)) * 1000) / (height * 0.73)
      position = dragging.position - dx / (height * 0.73)
      target = position
      dragging.lastX = e.clientX
      dragging.lastT = now
      paint()
    }
    const up = (e: PointerEvent) => {
      if (!dragging || dragging.id !== e.pointerId) {
        return
      }
      const d = dragging
      dragging = null
      if (e.type === "pointercancel") {
        target = d.target
        position = d.position
        speed = 0
        paint()
        return
      }
      target = Math.round(position + Math.max(-0.45, Math.min(0.45, speed * 0.05)))
      choose()
      if (live.current.reduced || !live.current.active) {
        position = target
        speed = 0
        paint()
      } else {
        wake()
      }
    }
    const sheet = document.createElement("canvas")
    sheet.width = 2400
    sheet.height = 1000
    const ctx = sheet.getContext("2d")!
    let count = 0
    const images = prints.map(([src], i) => {
      const im = new Image()
      im.onload = () => {
        if (dead) {
          return
        }
        const s = Math.max(800 / im.width, 1000 / im.height)
        ctx.save()
        ctx.beginPath()
        ctx.rect(i * 800, 0, 800, 1000)
        ctx.clip()
        ctx.drawImage(im, i * 800 + (800 - im.width * s) / 2, (1000 - im.height * s) / 2, im.width * s, im.height * s)
        ctx.restore()
        count++
        if (count === 3) {
          gl.bindTexture(gl.TEXTURE_2D, texture)
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet)
          loaded = true
          size()
        }
      }
      im.onerror = () => {
        if (!dead) {
          setFailed(true)
        }
      }
      im.src = src
      return im
    })
    const ro = new ResizeObserver(size)
    const transforms = new MutationObserver(size)
    for (let node: HTMLElement | null = c; node; node = node.parentElement) {
      ro.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", size)
    size()
    c.addEventListener("pointerdown", down)
    c.addEventListener("pointermove", move)
    c.addEventListener("pointerup", up)
    c.addEventListener("pointercancel", up)
    const lost = (e: Event) => {
      e.preventDefault()
      stop()
      setFailed(true)
    }
    c.addEventListener("webglcontextlost", lost)
    const visibility = () => (document.hidden ? stop() : wake())
    document.addEventListener("visibilitychange", visibility)
    control.current = { go, focus: setFocus, wake, stop }
    return () => {
      dead = true
      images.forEach((im) => {
        im.onload = null
        im.onerror = null
      })
      stop()
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", size)
      control.current = null
      c.removeEventListener("pointerdown", down)
      c.removeEventListener("pointermove", move)
      c.removeEventListener("pointerup", up)
      c.removeEventListener("pointercancel", up)
      c.removeEventListener("webglcontextlost", lost)
      document.removeEventListener("visibilitychange", visibility)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(p)
      shaders.forEach((s) => gl.deleteShader(s))
      sheet.width = 0
      sheet.height = 0
    }
  }, [])
  useEffect(() => {
    if (active && !reduced) {
      control.current?.wake()
    } else {
      control.current?.stop()
    }
  }, [active, reduced])
  const navigate = (direction: number, instant: boolean) => {
    if (!active) {
      return
    }
    if (failed) {
      setIndex((i) => (i + direction + prints.length) % prints.length)
      setFocused(false)
    } else {
      control.current?.go(direction, instant)
    }
  }
  const inspect = (value: boolean, instant: boolean) => {
    if (!active) {
      return
    }
    if (failed) {
      setFocused(value)
    } else {
      control.current?.focus(value, instant)
    }
  }
  return (
    <section className="sf-prism-carousel" inert={!active}>
      <header>
        <b>SOLID / OPTIC</b>
        <button type="button" aria-pressed={focused} onClick={(e) => inspect(!focused, e.detail === 0)}>
          {focused ? "Return" : "Inspect"} {focused ? "↙" : "↗"}
        </button>
      </header>
      <div className="pc-stage">
        <img
          className="pc-fallback"
          style={focused ? { inset: "2%", width: "96%", height: "96%" } : undefined}
          src={prints[index][0]}
          alt={prints[index][1]}
        />
        <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label={
            "Refracted architectural image carousel. " +
            prints[index][1] +
            ". Use arrow keys to change image, Enter to inspect, Escape to return."
          }
          style={{ visibility: failed ? "hidden" : "visible" }}
          onKeyDown={(e) => {
            if (["ArrowLeft", "ArrowRight", "Enter", "Escape"].includes(e.key)) {
              e.preventDefault()
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                navigate(e.key === "ArrowLeft" ? -1 : 1, true)
              } else {
                inspect(e.key === "Enter" ? !focused : false, true)
              }
            }
          }}
        />
      </div>
      <footer>
        <button type="button" aria-label="Previous print" onClick={(e) => navigate(-1, e.detail === 0)}>
          ←
        </button>
        <span>{prints[index][1]}</span>
        <button type="button" aria-label="Next print" onClick={(e) => navigate(1, e.detail === 0)}>
          →
        </button>
      </footer>
      <style>{`.sf-prism-carousel{height:100%;width:100%;display:flex;flex-direction:column;background:#eaebea;color:#292d2b;font-family:Arial,sans-serif;overflow:hidden}.sf-prism-carousel header{display:flex;justify-content:space-between;align-items:center;padding:9px 20px 0;height:36px;flex-shrink:0}.sf-prism-carousel header b{font-size:10px;letter-spacing:.11em}.sf-prism-carousel button{border:0;background:none;color:#292d2b;min-height:44px;font:10px Arial;cursor:pointer}.pc-stage{position:relative;flex:1;min-height:0;overflow:hidden}.pc-stage canvas{position:absolute;inset:0;height:100%;width:100%;display:block;touch-action:pan-y;cursor:grab}.pc-stage canvas:active{cursor:grabbing}.pc-fallback{position:absolute;inset:10%;height:80%;width:80%;object-fit:contain}.sf-prism-carousel footer{height:45px;display:flex;align-items:center;justify-content:center;gap:20px;flex-shrink:0}.sf-prism-carousel footer span{font:italic 17px Georgia;min-width:180px;text-align:center}.sf-prism-carousel footer button{font:20px Arial;width:44px}.sf-prism-carousel button:focus-visible,.sf-prism-carousel canvas:focus-visible{outline:2px solid #596b62;outline-offset:-3px}`}</style>
    </section>
  )
}
