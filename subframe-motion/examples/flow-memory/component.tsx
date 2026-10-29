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

function useCalm(active: boolean) {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])
  return reduced || !active
}

const GRID = 64
export default function FlowMemory({ active = true }: { active?: boolean }) {
  const calm = useCalm(active),
    canvas = useRef<HTMLCanvasElement>(null),
    field = useRef({
      u: new Float32Array(GRID * GRID),
      v: new Float32Array(GRID * GRID),
      dye: new Float32Array(GRID * GRID),
      seeded: false,
    }),
    decay = useRef(0.998 - 0.35 * 0.035),
    splat = useRef<(x: number, y: number, dx: number, dy: number) => void>(() => {}),
    clear = useRef<() => void>(() => {}),
    lastPoint = useRef<{ x: number; y: number } | null>(null),
    [dissipation, setDissipation] = useState(35),
    [failed, setFailed] = useState(false)
  useEffect(() => {
    const el = canvas.current
    if (!el) {
      return
    }
    const gl = el.getContext("webgl", { alpha: false, antialias: false })
    if (!gl) {
      setFailed(true)
      return
    }
    let stopped = false,
      raf = 0,
      last = 0
    const shaders: WebGLShader[] = []
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        throw Error("Material shader failed")
      }
      shaders.push(shader)
      return shader
    }
    let program: WebGLProgram | null = null
    try {
      program = gl.createProgram()!
      gl.attachShader(
        program,
        compile(
          gl.VERTEX_SHADER,
          `attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`,
        ),
      )
      gl.attachShader(
        program,
        compile(
          gl.FRAGMENT_SHADER,
          `precision highp float;varying vec2 v_uv;uniform sampler2D u_flow;uniform sampler2D u_image;uniform float u_aspect;void main(){vec2 uv=vec2(v_uv.x,1.-v_uv.y);vec4 field=texture2D(u_flow,uv);vec2 speed=(field.rg-.5)*.12;vec2 imageUV=vec2((uv.x-.5)*min(1.,u_aspect/1.5)+.5,(uv.y-.5)*min(1.,1.5/u_aspect)+.5);vec3 metal=texture2D(u_image,clamp(imageUV+speed,0.,1.)).rgb;float dye=field.b;vec3 tint=mix(metal*.52,vec3(.67,.81,.28),dye*.8);gl_FragColor=vec4(tint,1.);}`,
        ),
      )
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw Error("Material link failed")
      }
    } catch {
      shaders.forEach((s) => gl.deleteShader(s))
      if (program) {
        gl.deleteProgram(program)
      }
      setFailed(true)
      return
    }
    shaders.forEach((s) => gl.deleteShader(s))
    gl.useProgram(program)
    const buffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const textures = [gl.createTexture()!, gl.createTexture()!]
    textures.forEach((texture, i) => {
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) {
        gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR)
      }
      for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) {
        gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE)
      }
    })
    gl.uniform1i(gl.getUniformLocation(program, "u_flow"), 0)
    gl.uniform1i(gl.getUniformLocation(program, "u_image"), 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([150, 157, 145, 255]))
    const image = new Image()
    image.onload = () => {
      if (stopped || gl.isContextLost()) {
        return
      }
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, textures[1])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      draw()
    }
    image.onerror = () => {
      if (!stopped) {
        setFailed(true)
      }
    }
    image.src = "/motion/assets/silver-leather.webp"
    const n = GRID,
      total = n * n,
      u = field.current.u,
      v = field.current.v,
      dye = field.current.dye,
      a = new Float32Array(total),
      b = new Float32Array(total),
      c = new Float32Array(total),
      pressure = new Float32Array(total),
      divergence = new Float32Array(total),
      pixels = new Uint8Array(total * 4)
    const sample = (field: Float32Array, x: number, y: number) => {
      x = Math.max(0.5, Math.min(n - 1.5, x))
      y = Math.max(0.5, Math.min(n - 1.5, y))
      const ix = Math.floor(x),
        iy = Math.floor(y),
        fx = x - ix,
        fy = y - iy
      return (
        (field[iy * n + ix] * (1 - fx) + field[iy * n + ix + 1] * fx) * (1 - fy) +
        (field[(iy + 1) * n + ix] * (1 - fx) + field[(iy + 1) * n + ix + 1] * fx) * fy
      )
    }
    const step = (delta = 1) => {
      const velocityDecay = Math.pow(0.994, delta)
      const dyeDecay = Math.pow(decay.current, delta)
      for (let y = 1; y < n - 1; y++) {
        for (let x = 1; x < n - 1; x++) {
          const i = y * n + x
          a[i] = sample(u, x - u[i] * 0.02 * delta, y - v[i] * 0.02 * delta) * velocityDecay
          b[i] = sample(v, x - u[i] * 0.02 * delta, y - v[i] * 0.02 * delta) * velocityDecay
        }
      }
      u.set(a)
      v.set(b)
      pressure.fill(0)
      for (let y = 1; y < n - 1; y++) {
        for (let x = 1; x < n - 1; x++) {
          const i = y * n + x
          divergence[i] = (u[i + 1] - u[i - 1] + v[i + n] - v[i - n]) * 0.5
        }
      }
      for (let k = 0; k < 12; k++) {
        for (let y = 1; y < n - 1; y++) {
          for (let x = 1; x < n - 1; x++) {
            const i = y * n + x
            c[i] = (pressure[i - 1] + pressure[i + 1] + pressure[i - n] + pressure[i + n] - divergence[i]) * 0.25
          }
        }
        pressure.set(c)
      }
      for (let y = 1; y < n - 1; y++) {
        for (let x = 1; x < n - 1; x++) {
          const i = y * n + x
          u[i] -= (pressure[i + 1] - pressure[i - 1]) * 0.5
          v[i] -= (pressure[i + n] - pressure[i - n]) * 0.5
          a[i] = sample(dye, x - u[i] * 0.02 * delta, y - v[i] * 0.02 * delta) * dyeDecay
        }
      }
      dye.set(a)
    }
    const draw = () => {
      if (stopped || gl.isContextLost()) {
        return
      }
      for (let i = 0; i < total; i++) {
        pixels[i * 4] = Math.max(0, Math.min(255, 128 + u[i] * 3))
        pixels[i * 4 + 1] = Math.max(0, Math.min(255, 128 + v[i] * 3))
        pixels[i * 4 + 2] = Math.min(255, dye[i] * 255)
        pixels[i * 4 + 3] = 255
      }
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textures[0])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const inject = (x: number, y: number, dx: number, dy: number) => {
      const gx = x * n,
        gy = y * n
      for (let yy = Math.max(1, Math.floor(gy) - 6); yy < Math.min(n - 1, gy + 6); yy++) {
        for (let xx = Math.max(1, Math.floor(gx) - 6); xx < Math.min(n - 1, gx + 6); xx++) {
          const weight = Math.exp(-((xx - gx) ** 2 + (yy - gy) ** 2) / 9),
            i = yy * n + xx
          u[i] += dx * weight * 250
          v[i] += dy * weight * 250
          dye[i] = Math.min(1, dye[i] + weight * 0.4)
        }
      }
      if (calm) {
        step()
        draw()
      }
    }
    splat.current = inject
    clear.current = () => {
      u.fill(0)
      v.fill(0)
      dye.fill(0)
      draw()
    }
    if (!field.current.seeded) {
      field.current.seeded = true
      inject(0.37, 0.42, 0.16, -0.02)
      inject(0.58, 0.59, -0.11, 0.05)
    }
    const resize = () => {
      const r = el.getBoundingClientRect(),
        ratio = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3600000 / Math.max(1, r.width * r.height)))
      const nextWidth = Math.max(1, Math.round(r.width * ratio))
      const nextHeight = Math.max(1, Math.round(r.height * ratio))
      if (el.width !== nextWidth || el.height !== nextHeight) {
        el.width = nextWidth
        el.height = nextHeight
      }
      gl.viewport(0, 0, el.width, el.height)
      gl.uniform1f(gl.getUniformLocation(program!, "u_aspect"), r.width / Math.max(1, r.height))
      draw()
    }
    let accumulated = 0
    const frame = (time: number) => {
      raf = 0
      // Fixed 60 Hz simulation; display refresh rate must not change its speed.
      accumulated += last ? Math.min(time - last, 50) : 1000 / 60
      last = time
      while (accumulated >= 1000 / 60) {
        step(0.5)
        accumulated -= 1000 / 60
      }
      draw()
      if (!calm && !document.hidden) {
        raf = requestAnimationFrame(frame)
      }
    }
    const visibility = () => {
      cancelAnimationFrame(raf)
      last = 0
      accumulated = 0
      if (!calm && !document.hidden) {
        raf = requestAnimationFrame(frame)
      }
    }
    const ro = new ResizeObserver(resize)
    const transforms = new MutationObserver(resize)
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
      ro.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", resize)
    resize()
    visibility()
    document.addEventListener("visibilitychange", visibility)
    const lost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      setFailed(true)
    }
    el.addEventListener("webglcontextlost", lost)
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", visibility)
      el.removeEventListener("webglcontextlost", lost)
      image.onload = null
      image.onerror = null
      image.src = ""
      textures.forEach((t) => gl.deleteTexture(t))
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      splat.current = () => {}
      clear.current = () => {}
    }
  }, [calm])
  return (
    <section className="sf-flow-memory">
      <style>{`.sf-flow-memory{width:100%;height:100%;min-height:280px;position:relative;background:#18251f;color:#e5f1cc;font-family:Arial,sans-serif;overflow:hidden}.sf-flow-memory canvas{width:100%;height:calc(100% - 48px);display:block;touch-action:none;outline:none}.sf-flow-memory canvas:focus-visible{outline:2px solid #ddea68;outline-offset:-4px}.sf-flow-memory footer{position:absolute;bottom:4px;left:18px;right:18px;display:flex;align-items:center;justify-content:space-between;gap:14px;font-size:9px;letter-spacing:.1em}.sf-flow-memory label{display:flex;gap:10px;align-items:center}.sf-flow-memory input{width:95px;accent-color:#c9e681}.sf-flow-memory button{min-height:44px;min-width:55px;background:transparent;border:1px solid #e5f1cc44;color:inherit;font:inherit;cursor:pointer}.sf-flow-memory :focus-visible{outline:2px solid #ddea68;outline-offset:3px}.sf-flow-memory .fm-fallback{position:absolute;inset:0 0 48px;background:radial-gradient(ellipse at 30% 40%,#9bba59,transparent 45%),#2f5144}`}</style>
      <canvas
        ref={canvas}
        tabIndex={0}
        aria-label="Move across the material to stir the fluid; press Enter to inject a current"
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          lastPoint.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect(),
            x = (e.clientX - r.left) / r.width,
            y = (e.clientY - r.top) / r.height,
            p = lastPoint.current
          lastPoint.current = { x, y }
          if (p) {
            splat.current(x, y, x - p.x, y - p.y)
          }
        }}
        onPointerLeave={() => (lastPoint.current = null)}
        onPointerUp={(e) => {
          lastPoint.current = null
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
        }}
        onPointerCancel={() => (lastPoint.current = null)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            splat.current(0.5, 0.5, 0.13, -0.08)
          }
        }}
      />
      {failed && <div className="fm-fallback" />}
      <footer>
        <label>
          DISSIPATION
          <input
            aria-label="Fluid dissipation"
            type="range"
            min="0"
            max="100"
            value={dissipation}
            onChange={(e) => {
              setDissipation(+e.target.value)
              decay.current = 0.998 - (+e.target.value / 100) * 0.035
            }}
          />
        </label>
        <button onClick={() => clear.current()}>CLEAR</button>
      </footer>
    </section>
  )
}
