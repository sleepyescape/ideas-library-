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

const fragment = `precision highp float;varying vec2 uv;uniform sampler2D photo;uniform vec2 size;uniform float imageAspect;uniform float now;uniform float strength;uniform vec4 marks[12];
vec2 cover(vec2 p){float a=size.x/size.y;return (p-.5)*vec2(min(1.,a/imageAspect),min(1.,imageAspect/a))+.5;}
void main(){vec2 p=uv;float aspect=size.x/size.y;vec2 d=vec2(0.);for(int i=0;i<12;i++){float age=now-marks[i].z;if(marks[i].w>0.&&age>=0.&&age<2.6){vec2 delta=(p-marks[i].xy)*vec2(aspect,1.);float r=length(delta);float front=age*.16;float band=exp(-pow((r-front)/(.035+age*.025),2.));float wave=sin((r-front)*85.)*band*exp(-age*1.9)*marks[i].w;d+=normalize(delta+vec2(.0001))*wave*.012/vec2(aspect,1.);}}vec2 q=cover(p+d*strength);vec3 c=texture2D(photo,q).rgb;gl_FragColor=vec4(c,1.);}`
export default function WakeImage({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [failed, setFailed] = useState(false),
    [strength, setStrength] = useState(0.8),
    reduced = useReduced(),
    live = useRef({ active, reduced, strength }),
    control = useRef<{ clear: () => void; wake: () => void; stop: () => void } | null>(null)
  live.current = { active, reduced, strength }
  useEffect(() => {
    const c = canvas.current!,
      gl = c.getContext("webgl", { alpha: false, antialias: false })
    if (!gl) {
      setFailed(true)
      return
    }
    let dead = false,
      raf = 0,
      last = 0,
      time = 0,
      loaded = false,
      w = 1,
      h = 1,
      head = 0,
      lastPointer = 0,
      energy = 0
    const marks = new Float32Array(48)
    const shaders: WebGLShader[] = []
    const compile = (type: number, code: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, code)
      gl.compileShader(shader)
      shaders.push(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw Error(gl.getShaderInfoLog(shader) || "Shader failed")
      }
      return shader
    }
    const program = gl.createProgram()!
    let buffer: WebGLBuffer, texture: WebGLTexture
    try {
      gl.attachShader(
        program,
        compile(
          gl.VERTEX_SHADER,
          "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}",
        ),
      )
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw Error("Link failed")
      }
      gl.useProgram(program)
      buffer = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
      const pos = gl.getAttribLocation(program, "p")
      gl.enableVertexAttribArray(pos)
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
      texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    } catch {
      gl.deleteProgram(program)
      shaders.forEach((s) => gl.deleteShader(s))
      setFailed(true)
      return
    }
    const u = (name: string) => gl.getUniformLocation(program, name),
      loc = { size: u("size"), aspect: u("imageAspect"), now: u("now"), strength: u("strength"), marks: u("marks[0]") }
    const image = new Image()
    const paint = () => {
      if (!loaded || dead || gl.isContextLost()) {
        return
      }
      gl.viewport(0, 0, c.width, c.height)
      gl.uniform2f(loc.size, w, h)
      gl.uniform1f(loc.aspect, image.width / image.height)
      gl.uniform1f(loc.now, time)
      gl.uniform1f(loc.strength, live.current.reduced ? 0 : live.current.strength)
      gl.uniform4fv(loc.marks, marks)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const size = () => {
      const r = c.getBoundingClientRect()
      w = r.width
      h = r.height
      const d = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3600000 / Math.max(1, r.width * r.height)))
      const nextWidth = Math.max(1, Math.round(w * d))
      const nextHeight = Math.max(1, Math.round(h * d))
      if (c.width !== nextWidth || c.height !== nextHeight) {
        c.width = nextWidth
        c.height = nextHeight
      }
      paint()
    }
    const tick = (t: number) => {
      raf = 0
      if (!live.current.active || live.current.reduced || document.hidden || gl.isContextLost()) {
        return
      }
      const dt = Math.min(0.04, (t - last) / 1000 || 0.016)
      last = t
      time += dt
      energy -= dt
      paint()
      if (energy > 0) {
        raf = requestAnimationFrame(tick)
      }
    }
    const wake = () => {
      paint()
      if (
        !raf &&
        energy > 0 &&
        live.current.active &&
        !live.current.reduced &&
        !document.hidden &&
        !gl.isContextLost()
      ) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
    }
    const move = (e: PointerEvent) => {
      if (live.current.reduced || !loaded || (e.pointerType !== "mouse" && !e.buttons)) {
        return
      }
      const t = performance.now()
      if (t - lastPointer < 18) {
        return
      }
      lastPointer = t
      const r = c.getBoundingClientRect(),
        i = head++ % 12
      marks[i * 4] = (e.clientX - r.left) / r.width
      marks[i * 4 + 1] = 1 - (e.clientY - r.top) / r.height
      marks[i * 4 + 2] = time
      marks[i * 4 + 3] = 1
      energy = 2.7
      wake()
    }
    const lost = (e: Event) => {
      e.preventDefault()
      stop()
      setFailed(true)
    }
    image.onload = () => {
      if (dead) {
        return
      }
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      loaded = true
      size()
    }
    image.onerror = () => {
      if (!dead) {
        setFailed(true)
      }
    }
    image.src = "/motion/assets/coastal-break.webp"
    const ro = new ResizeObserver(size)
    const transforms = new MutationObserver(size)
    for (let node: HTMLElement | null = c; node; node = node.parentElement) {
      ro.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", size)
    size()
    c.addEventListener("pointermove", move)
    c.addEventListener("pointerdown", move)
    c.addEventListener("webglcontextlost", lost)
    const visibility = () => (document.hidden ? stop() : wake())
    document.addEventListener("visibilitychange", visibility)
    control.current = {
      clear: () => {
        marks.fill(0)
        energy = 0
        stop()
        paint()
      },
      wake,
      stop,
    }
    return () => {
      dead = true
      control.current = null
      stop()
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", size)
      c.removeEventListener("pointermove", move)
      c.removeEventListener("pointerdown", move)
      c.removeEventListener("webglcontextlost", lost)
      document.removeEventListener("visibilitychange", visibility)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      shaders.forEach((s) => gl.deleteShader(s))
    }
  }, [])
  useEffect(() => {
    if (active && !reduced) {
      control.current?.wake()
    } else {
      control.current?.stop()
      control.current?.wake()
    }
  }, [active, reduced, strength])
  return (
    <section className="sf-wake-image" inert={!active}>
      <img src="/motion/assets/coastal-break.webp" alt="Turquoise waves crossing a dark rocky coastline" />
      <canvas ref={canvas} aria-hidden="true" style={{ visibility: failed ? "hidden" : "visible" }} />
      <header>
        <b>LOW TIDE</b>
        <span>Field notes</span>
      </header>
      <footer>
        <label>
          Wake
          <input
            aria-label="Wake intensity"
            type="range"
            min="0"
            max="1.5"
            step=".05"
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
          />
        </label>
        <button type="button" onClick={() => control.current?.clear()}>
          Clear
        </button>
      </footer>
      <style>{`.sf-wake-image{width:100%;height:100%;position:relative;background:#007f8f;overflow:hidden;font-family:Arial,sans-serif;color:#fff}.sf-wake-image>img,.sf-wake-image canvas{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}.sf-wake-image canvas{touch-action:pan-y;cursor:crosshair}.sf-wake-image header{position:absolute;left:20px;right:20px;top:18px;display:flex;align-items:center;justify-content:space-between;pointer-events:none;text-shadow:0 1px 8px #00393f88;font-size:10px}.sf-wake-image header b{font-size:11px;letter-spacing:.16em}.sf-wake-image footer{position:absolute;left:18px;right:18px;bottom:14px;display:flex;justify-content:space-between;align-items:center;gap:24px;font-size:10px;text-shadow:0 1px 8px #00393f88}.sf-wake-image label{display:flex;align-items:center;gap:10px}.sf-wake-image input{width:90px;height:30px;accent-color:white}.sf-wake-image button{position:relative;border:1px solid #ffffff66;border-radius:18px;color:white;background:#053c4470;font:10px Arial;height:32px;min-width:60px;cursor:pointer}.sf-wake-image button:before{content:'';position:absolute;inset:-6px}.sf-wake-image button:focus-visible,.sf-wake-image input:focus-visible{outline:2px solid white;outline-offset:3px}`}</style>
    </section>
  )
}
