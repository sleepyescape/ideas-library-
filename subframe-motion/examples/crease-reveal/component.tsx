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

export default function CreaseReveal({ active = true }: { active?: boolean }) {
  const calm = useCalm(active),
    canvas = useRef<HTMLCanvasElement>(null),
    amount = useRef(0.25),
    target = useRef(0.25),
    kick = useRef<(instant?: boolean) => void>(() => {}),
    [fold, setFold] = useState(25),
    [failed, setFailed] = useState(false)
  useEffect(() => {
    const el = canvas.current
    if (!el) {
      return
    }
    const gl = el.getContext("webgl", { alpha: true, antialias: true })
    if (!gl) {
      setFailed(true)
      return
    }
    let raf = 0,
      disposed = false
    const shaders: WebGLShader[] = []
    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, source)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s)
        throw Error("Unable to draw paper")
      }
      shaders.push(s)
      return s
    }
    let program: WebGLProgram | null = null
    try {
      program = gl.createProgram()!
      gl.attachShader(
        program,
        compile(
          gl.VERTEX_SHADER,
          `attribute vec3 a_position;attribute vec3 a_normal;attribute vec2 a_uv;uniform float u_aspect;varying vec3 v_normal;varying vec2 v_uv;void main(){float perspective=2.8/(2.8-a_position.z);gl_Position=vec4(a_position.x/u_aspect*perspective,a_position.y*perspective,a_position.z*.15,1.);v_normal=a_normal;v_uv=a_uv;}`,
        ),
      )
      gl.attachShader(
        program,
        compile(
          gl.FRAGMENT_SHADER,
          `precision mediump float;uniform sampler2D u_paper;varying vec3 v_normal;varying vec2 v_uv;void main(){vec3 n=normalize(v_normal);float light=.42+.58*abs(dot(n,normalize(vec3(-.35,.45,1.))));vec3 ink=texture2D(u_paper,v_uv).rgb;gl_FragColor=vec4(ink*light,1.);}`,
        ),
      )
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw Error("Unable to link paper")
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
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0, 0, 0, 0)
    const paper = document.createElement("canvas")
    paper.width = 1024
    paper.height = 1360
    const ctx = paper.getContext("2d")!
    ctx.scale(2, 2)
    ctx.fillStyle = "#e0ed47"
    ctx.fillRect(0, 0, 512, 680)
    ctx.fillStyle = "#20241e"
    ctx.font = "bold 146px Arial"
    ctx.fillText("NO", 24, 175)
    ctx.font = "bold 112px Arial"
    ctx.fillText("WASTE", 20, 278)
    ctx.lineWidth = 2
    ctx.strokeStyle = "#20241e"
    ctx.strokeRect(24, 24, 464, 632)
    ctx.font = "16px Arial"
    ctx.fillText("A NEW SHAPE IS STILL A SHAPE.", 28, 615)
    ctx.font = "bold 250px Arial"
    ctx.fillText("↻", 116, 535)
    const texture = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paper)
    for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) {
      gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR)
    }
    for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) {
      gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE)
    }
    const buffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    const N = 28,
      data = new Float32Array(N * N * 6 * 8)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
    for (const [name, size, offset] of [
      ["a_position", 3, 0],
      ["a_normal", 3, 12],
      ["a_uv", 2, 24],
    ] as const) {
      const loc = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 32, offset)
    }
    const aspect = gl.getUniformLocation(program, "u_aspect")
    const point = (u: number, v: number) => {
      const p = amount.current,
        a = (u - 0.5) * Math.PI * 2.1,
        b = (v - 0.5) * Math.PI * 0.88,
        r = 0.35 + 0.054 * Math.sin(u * 29 + v * 23) + 0.035 * Math.cos(v * 41 - u * 17),
        t = Math.pow(p, 0.78)
      return [
        (u - 0.5) * 1.44 * (1 - t) + Math.sin(a) * Math.cos(b) * r * t,
        (0.5 - v) * 1.84 * (1 - t) - Math.sin(b) * r * 1.25 * t,
        (Math.cos(a) * Math.cos(b) * r + 0.07 * Math.sin(u * 37 + v * 19)) * t,
      ]
    }
    const draw = () => {
      if (disposed || gl.isContextLost()) {
        return
      }
      let at = 0
      const tri = (uv: number[][]) => {
        const a = point(uv[0][0], uv[0][1]),
          b = point(uv[1][0], uv[1][1]),
          c = point(uv[2][0], uv[2][1]),
          ab = b.map((v, i) => v - a[i]),
          ac = c.map((v, i) => v - a[i]),
          normal = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]]
        for (let i = 0; i < 3; i++) {
          data.set([...[a, b, c][i], ...normal, ...uv[i]], at)
          at += 8
        }
      }
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const u = i / N,
            v = j / N,
            q = 1 / N
          tri([
            [u, v],
            [u + q, v],
            [u, v + q],
          ])
          tri([
            [u + q, v],
            [u + q, v + q],
            [u, v + q],
          ])
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, N * N * 6)
    }
    let last = 0
    const frame = (t: number) => {
      raf = 0
      const dt = last ? Math.min(32, t - last) : 16
      last = t
      amount.current += (target.current - amount.current) * (1 - Math.exp(-dt / 95))
      draw()
      if (Math.abs(target.current - amount.current) > 0.001 && !document.hidden) {
        raf = requestAnimationFrame(frame)
      }
    }
    const start = (instant = false) => {
      cancelAnimationFrame(raf)
      last = 0
      if (calm || instant) {
        amount.current = target.current
        draw()
      } else if (!document.hidden) {
        raf = requestAnimationFrame(frame)
      }
    }
    kick.current = start
    const resize = () => {
      const r = el.getBoundingClientRect(),
        d = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3600000 / Math.max(1, r.width * r.height)))
      const nextWidth = Math.max(1, Math.round(r.width * d))
      const nextHeight = Math.max(1, Math.round(r.height * d))
      if (el.width !== nextWidth || el.height !== nextHeight) {
        el.width = nextWidth
        el.height = nextHeight
      }
      gl.viewport(0, 0, el.width, el.height)
      gl.uniform1f(aspect, r.width / Math.max(1, r.height))
      draw()
    }
    const ro = new ResizeObserver(resize)
    const transforms = new MutationObserver(resize)
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
      ro.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", resize)
    resize()
    if (active) {
      start()
    }
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (active) {
        start()
      }
    }
    const lost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      setFailed(true)
    }
    document.addEventListener("visibilitychange", visibility)
    el.addEventListener("webglcontextlost", lost)
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", visibility)
      el.removeEventListener("webglcontextlost", lost)
      gl.deleteBuffer(buffer)
      gl.deleteTexture(texture)
      gl.deleteProgram(program)
      paper.width = 0
      paper.height = 0
      kick.current = () => {}
    }
  }, [calm, active])
  return (
    <section className="sf-crease-reveal">
      <style>{`.sf-crease-reveal{width:100%;height:100%;min-height:280px;position:relative;container-type:size;background:#20241e;color:#e0ed47;font-family:Arial,sans-serif;overflow:hidden}.sf-crease-reveal canvas{display:block;width:100%;height:calc(100% - 48px)}.sf-crease-reveal footer{position:absolute;bottom:5px;left:18px;right:18px;display:flex;align-items:center;justify-content:space-between;gap:15px;font-size:10px;letter-spacing:.1em}.sf-crease-reveal footer label{display:flex;align-items:center;gap:10px}.sf-crease-reveal input{width:clamp(70px,23cqw,135px);accent-color:#e0ed47}.sf-crease-reveal button{border:1px solid #e0ed4755;background:transparent;color:inherit;min-height:44px;min-width:86px;padding:0 12px;cursor:pointer;font:inherit}.sf-crease-reveal :focus-visible{outline:2px solid #fff;outline-offset:3px}.sf-crease-reveal .cr-fallback{position:absolute;top:18px;bottom:70px;left:50%;transform:translateX(-50%);width:150px;padding:15px;background:#e0ed47;color:#20241e;font-weight:900;font-size:38px;line-height:1}`}</style>
      <canvas ref={canvas} aria-label="An acid-yellow printed sheet compresses into a faceted paper object" />
      {failed && (
        <div className="cr-fallback">
          NO
          <br />
          WASTE
        </div>
      )}
      <footer>
        <label>
          CREASE
          <input
            aria-label="Paper crumple amount"
            type="range"
            min="0"
            max="100"
            value={fold}
            onChange={(e) => {
              const n = +e.target.value
              setFold(n)
              target.current = n / 100
              kick.current(true)
            }}
          />
        </label>
        <button
          onClick={(e) => {
            const n = fold > 50 ? 0 : 100
            setFold(n)
            target.current = n / 100
            kick.current(e.detail === 0)
          }}
        >
          {fold > 50 ? "FLATTEN" : "CRUMPLE"}
        </button>
      </footer>
    </section>
  )
}
