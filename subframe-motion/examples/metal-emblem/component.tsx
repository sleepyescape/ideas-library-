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

const metal = `precision highp float;varying vec2 uv;uniform sampler2D glyph;uniform vec2 resolution;uniform vec2 light;uniform float time;
float heightAt(vec2 q){vec2 h=texture2D(glyph,q).rg;return dot(h,vec2(65280.,255.))/65535.;}
void main(){vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.)*.98+.5;float h=heightAt(p),e=.005;vec2 grad=vec2(heightAt(p+vec2(e,0.))-heightAt(p-vec2(e,0.)),heightAt(p+vec2(0.,e))-heightAt(p-vec2(0.,e)));vec3 n=normalize(vec3(-grad*5.,.18));vec3 l=normalize(vec3(light*.8+vec2(sin(time*.33)*.25,0.),1.));float spec=pow(max(0.,dot(reflect(-l,n),vec3(0.,0.,1.))),22.);float band=sin((n.x*.46+n.y*.3+p.x*.13+time*.018)*22.);float metalTone=.34+band*.27+max(0.,dot(n,l))*.22;vec3 silver=vec3(metalTone*.96,metalTone,metalTone*1.04)+spec*.62;float bevel=smoothstep(.1,.78,h);float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);vec3 bg=vec3(.16,.17,.18)+(grain-.5)*.018;float shadow=heightAt(p+vec2(-.017,.027))*(1.-bevel);bg*=1.-shadow*.55;gl_FragColor=vec4(mix(bg,silver,bevel),1.);}`
export default function MetalEmblem({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [text, setText] = useState("M"),
    [playing, setPlaying] = useState(true),
    [failed, setFailed] = useState(false),
    reduced = useReduced(),
    live = useRef({ active, playing, reduced, text }),
    control = useRef<{ update: () => void; wake: () => void; stop: () => void } | null>(null)
  live.current = { active, playing, reduced, text }
  useEffect(() => {
    const c = canvas.current!,
      gl = c.getContext("webgl", { antialias: false, alpha: false })
    if (!gl) {
      setFailed(true)
      return
    }
    let dead = false,
      raf = 0,
      last = 0,
      time = 0
    const shaders: WebGLShader[] = []
    const compile = (kind: number, code: string) => {
      const s = gl.createShader(kind)!
      gl.shaderSource(s, code)
      gl.compileShader(s)
      shaders.push(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw Error("Compile failed")
      }
      return s
    }
    const p = gl.createProgram()!
    let b: WebGLBuffer, t: WebGLTexture
    try {
      gl.attachShader(
        p,
        compile(
          gl.VERTEX_SHADER,
          "attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}",
        ),
      )
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, metal))
      gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw Error("Link failed")
      }
      gl.useProgram(p)
      b = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, b)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
      const a = gl.getAttribLocation(p, "position")
      gl.enableVertexAttribArray(a)
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
      t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      for (const axis of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) {
        gl.texParameteri(gl.TEXTURE_2D, axis, gl.CLAMP_TO_EDGE)
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    } catch {
      gl.deleteProgram(p)
      shaders.forEach((s) => gl.deleteShader(s))
      setFailed(true)
      return
    }
    const shape = document.createElement("canvas")
    shape.width = shape.height = 1024
    const ctx = shape.getContext("2d", { willReadFrequently: true })!,
      u = {
        resolution: gl.getUniformLocation(p, "resolution"),
        time: gl.getUniformLocation(p, "time"),
        light: gl.getUniformLocation(p, "light"),
      }
    let light = { x: -0.4, y: 0.65 }
    const paint = () => {
      if (dead || gl.isContextLost()) {
        return
      }
      gl.viewport(0, 0, c.width, c.height)
      gl.uniform2f(u.resolution, c.width, c.height)
      gl.uniform2f(u.light, light.x, light.y)
      gl.uniform1f(u.time, time)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const update = () => {
      ctx.setTransform(2, 0, 0, 2, 0, 0)
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, 512, 512)
      ctx.fillStyle = "#fff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = `900 ${live.current.text.length > 1 ? 235 : 340}px Arial`
      ctx.fillText(live.current.text || "M", 256, 269)
      // Keep bevel heights in floating point while blurring, then encode 16 bits.
      // An 8-bit blurred mask produces visible bands in a reflective normal field.
      const size = shape.width
      const pixels = ctx.getImageData(0, 0, size, size).data
      let heights = new Float32Array(size * size)
      let scratch = new Float32Array(heights.length)
      for (let i = 0; i < heights.length; i++) {
        heights[i] = pixels[i * 4] / 255
      }
      const radius = 9
      for (let pass = 0; pass < 3; pass++) {
        for (const vertical of [false, true]) {
          const stride = vertical ? size : 1
          for (let line = 0; line < size; line++) {
            const start = vertical ? line : line * size
            let sum = 0
            for (let k = -radius; k <= radius; k++) {
              sum += heights[start + Math.max(0, k) * stride]
            }
            for (let at = 0; at < size; at++) {
              scratch[start + at * stride] = sum / (radius * 2 + 1)
              sum += heights[start + Math.min(size - 1, at + radius + 1) * stride]
              sum -= heights[start + Math.max(0, at - radius) * stride]
            }
          }
          ;[heights, scratch] = [scratch, heights]
        }
      }
      const encoded = new Uint8Array(size * size * 4)
      for (let i = 0; i < heights.length; i++) {
        const height = Math.round(Math.max(0, Math.min(1, heights[i])) * 65535)
        encoded[i * 4] = height >> 8
        encoded[i * 4 + 1] = height & 255
        encoded[i * 4 + 3] = 255
      }
      gl.bindTexture(gl.TEXTURE_2D, t)
      // Typed-array uploads do not support UNPACK_FLIP_Y_WEBGL.
      const row = size * 4
      for (let y = 0; y < size / 2; y++) {
        const opposite = (size - y - 1) * row
        for (let x = 0; x < row; x++) {
          const at = y * row + x
          const value = encoded[at]
          encoded[at] = encoded[opposite + x]
          encoded[opposite + x] = value
        }
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, encoded)
      paint()
    }
    const size = () => {
      const r = c.getBoundingClientRect(),
        d = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3600000 / Math.max(1, r.width * r.height)))
      const nextWidth = Math.max(1, Math.round(r.width * d))
      const nextHeight = Math.max(1, Math.round(r.height * d))
      if (c.width !== nextWidth || c.height !== nextHeight) {
        c.width = nextWidth
        c.height = nextHeight
      }
      paint()
    }
    const tick = (now: number) => {
      raf = 0
      if (
        !live.current.active ||
        !live.current.playing ||
        live.current.reduced ||
        document.hidden ||
        gl.isContextLost()
      ) {
        return
      }
      time += Math.min(0.04, (now - last) / 1000 || 0.016)
      last = now
      paint()
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (
        !raf &&
        live.current.active &&
        live.current.playing &&
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
    }
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      light = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: 1 - ((e.clientY - r.top) / r.height) * 2 }
      paint()
    }
    const lost = (e: Event) => {
      e.preventDefault()
      stop()
      setFailed(true)
    }
    const ro = new ResizeObserver(size)
    const transforms = new MutationObserver(size)
    for (let node: HTMLElement | null = c; node; node = node.parentElement) {
      ro.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", size)
    c.addEventListener("pointermove", move)
    c.addEventListener("webglcontextlost", lost)
    const visibility = () => (document.hidden ? stop() : wake())
    document.addEventListener("visibilitychange", visibility)
    control.current = { update, wake, stop }
    size()
    update()
    wake()
    return () => {
      dead = true
      control.current = null
      stop()
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", size)
      c.removeEventListener("pointermove", move)
      c.removeEventListener("webglcontextlost", lost)
      document.removeEventListener("visibilitychange", visibility)
      gl.deleteTexture(t)
      gl.deleteBuffer(b)
      gl.deleteProgram(p)
      shaders.forEach((s) => gl.deleteShader(s))
      shape.width = 0
      shape.height = 0
    }
  }, [])
  useEffect(() => {
    control.current?.update()
  }, [text])
  useEffect(() => {
    if (active && playing && !reduced) {
      control.current?.wake()
    } else {
      control.current?.stop()
    }
  }, [active, playing, reduced])
  return (
    <section className="sf-metal-emblem" inert={!active}>
      <div className="me-fallback" aria-hidden="true">
        {text}
      </div>
      <canvas
        ref={canvas}
        role="img"
        aria-label={`Silver relief of ${text || "M"}`}
        style={{ visibility: failed ? "hidden" : "visible" }}
      />
      <header>
        <span>STAMP / STUDIO</span>
        <span>Ag</span>
      </header>
      <footer>
        <label>
          Mark{" "}
          <input
            aria-label="Emblem letters"
            value={text}
            maxLength={2}
            onChange={(e) => setText(e.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase())}
          />
        </label>
        <button type="button" disabled={reduced} onClick={() => setPlaying(!playing)}>
          {playing && !reduced ? "Hold light" : "Move light"}
        </button>
      </footer>
      <style>{`.sf-metal-emblem{height:100%;width:100%;position:relative;overflow:hidden;background:#292b2e;color:#d7dadd;font-family:Arial,sans-serif}.sf-metal-emblem canvas{position:absolute;inset:0;height:100%;width:100%;display:block}.me-fallback{position:absolute;inset:0;display:grid;place-items:center;font:900 160px Arial;color:#bdc4cb}.sf-metal-emblem header{position:absolute;top:20px;left:22px;right:22px;display:flex;justify-content:space-between;pointer-events:none;font:9px Arial;letter-spacing:.1em;color:#b0b6bb}.sf-metal-emblem header span:last-child{font:italic 18px Georgia;letter-spacing:0}.sf-metal-emblem footer{position:absolute;bottom:16px;left:20px;right:20px;display:flex;align-items:center;justify-content:space-between;font:10px Arial}.sf-metal-emblem label{display:flex;align-items:center;gap:10px;color:#9ca5ab}.sf-metal-emblem input{font:12px Arial;color:#e1e5e7;background:#202225;border:1px solid #737b8155;border-radius:3px;width:48px;padding:8px;box-sizing:border-box;height:34px}.sf-metal-emblem button{background:transparent;color:#b9c1c6;border:1px solid #737b8155;border-radius:3px;padding:0 12px;height:34px;position:relative;font:10px Arial;cursor:pointer}.sf-metal-emblem button:before{content:'';position:absolute;inset:-5px}.sf-metal-emblem button:disabled{opacity:.4}.sf-metal-emblem button:focus-visible,.sf-metal-emblem input:focus-visible{outline:2px solid white;outline-offset:3px}`}</style>
    </section>
  )
}
