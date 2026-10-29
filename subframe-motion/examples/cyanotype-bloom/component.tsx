"use client"

/*
 * Copyright (c) 2026 Subframe
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useEffect, useId, useRef, useState } from "react"

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_control;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
void main(){
 vec2 uv=gl_FragCoord.xy/u_resolution;
 vec2 p=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;
 float grain=hash(floor(uv*u_resolution*.65));
 float cloud=noise(p*5.)*.5+noise(p*13.)*.25+noise(p*29.)*.13;
 float exposure=smoothstep(.02,1.,u_control);
 float front=(uv.y+cloud*.15)/1.1;
 float wet=smoothstep(front-.10,front+.13,u_control);
 vec3 paper=vec3(.89,.88,.77),blue=mix(vec3(.16,.42,.50),vec3(.018,.115,.38),exposure);
 vec3 c=mix(paper,blue,wet);
 c+=(grain-.5)*.035;
 float edge=smoothstep(.47,.50,abs(uv.y-.5))+smoothstep(.47,.50,abs(uv.x-.5));
 c=mix(c,paper,clamp(edge*.23,0.,.3));
 gl_FragColor=vec4(c,1.);
}
`

// One vector path per specimen keeps the fine branch structure sharp at any preview scale.
function specimenPath(lean: number) {
  const paths: string[] = []
  const point = (x: number, y: number) =>
    `${(x * Math.cos(lean) - y * Math.sin(lean)).toFixed(2)},${(x * Math.sin(lean) + y * Math.cos(lean)).toFixed(2)}`
  paths.push(`M0,0 Q${point(7, -95)} ${point(0, -224)}`)
  for (let i = 0; i < 21; i++) {
    const t = i / 21,
      y = -14 - t * 201,
      span = 9 + Math.sin(t * Math.PI) * 54 * (1 - t * 0.35)
    for (const side of [-1, 1]) {
      const x0 = Math.sin(t * Math.PI) * 3,
        rise = 10 + (1 - t) * 16
      paths.push(`M${point(x0, y)} Q${point(side * span * 0.5, y - 5)} ${point(side * span, y - rise)}`)
      for (let n = 1; n <= 8; n++) {
        const f = n / 9,
          x = x0 + side * span * f,
          by = y - rise * f
        const length = (3 + (1 - t) * 7) * (1 - f * 0.6)
        paths.push(
          `M${point(x, by)} Q${point(x + side * length * 0.3, by - length)} ${point(
            x + side * length,
            by - length * 1.2,
          )}`,
        )
        paths.push(
          `M${point(x, by)} Q${point(x + side * length * 0.6, by + length * 0.45)} ${point(
            x + side * length,
            by + length * 0.2,
          )}`,
        )
      }
    }
  }
  return paths.join(" ")
}
const SPECIMENS = [specimenPath(-0.48), specimenPath(0.08), specimenPath(0.52)]

export default function CyanotypeBloomExample({ active = true }: { active?: boolean }) {
  const maskId = useId()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})
  const timeRef = useRef(3)
  const contextLeaseRef = useRef(0)
  const controlRef = useRef(0.72)
  const [control, setControl] = useState(0.72)
  const paused = true
  const [available, setAvailable] = useState(false)
  const [, setReduced] = useState(false)
  runningRef.current = active && !paused

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" })
    if (!gl) {
      return
    }
    const lease = ++contextLeaseRef.current
    let disposed = false
    let frame = 0
    let last = 0
    let lost = false
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduce = preference.matches
    setReduced(reduce)
    const shaders: WebGLShader[] = []
    const compile = (type: number, code: string) => {
      const shader = gl.createShader(type)
      if (!shader) {
        return null
      }
      shaders.push(shader)
      gl.shaderSource(shader, code)
      gl.compileShader(shader)
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
    }
    const vertex = compile(
      gl.VERTEX_SHADER,
      "attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}",
    )
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    const buffer = gl.createBuffer()
    if (!vertex || !fragment || !program || !buffer) {
      shaders.forEach((shader) => gl.deleteShader(shader))
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach((shader) => gl.deleteShader(shader))
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      return
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, "u_resolution")
    const time = gl.getUniformLocation(program, "u_time")
    const adjustment = gl.getUniformLocation(program, "u_control")
    const draw = () => {
      if (disposed || lost) {
        return
      }
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, reduce ? 3 : timeRef.current)
      gl.uniform1f(adjustment, controlRef.current)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const tick = (now: number) => {
      if (disposed || lost || reduce || !runningRef.current || document.hidden) {
        frame = 0
        last = 0
        return
      }
      if (last) {
        timeRef.current += Math.min((now - last) / 1000, 0.05)
      }
      last = now
      draw()
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
      if (disposed || lost) {
        return
      }
      draw()
      if (runningRef.current && !reduce && !document.hidden) {
        frame = requestAnimationFrame(tick)
      }
    }
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) {
        return
      }
      // Size the drawing buffer from displayed pixels, including ancestor scale.
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3600000 / (width * height)))
      const nextWidth = Math.max(1, Math.round(width * ratio))
      const nextHeight = Math.max(1, Math.round(height * ratio))
      if (canvas.width === nextWidth && canvas.height === nextHeight) {
        return
      }
      canvas.width = nextWidth
      canvas.height = nextHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      draw()
    }
    const updatePreference = () => {
      reduce = preference.matches
      setReduced(reduce)
      sync()
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      lost = true
      cancelAnimationFrame(frame)
      setAvailable(false)
    }
    // Keep the static artwork after context loss. Remount to create fresh GPU resources.
    canvas.addEventListener("webglcontextlost", contextLost)
    preference.addEventListener("change", updatePreference)
    document.addEventListener("visibilitychange", sync)
    const observer = new ResizeObserver(resize)
    // ResizeObserver alone cannot see a transform on the preview composition.
    const transforms = new MutationObserver(resize)
    for (let node: HTMLElement | null = canvas; node; node = node.parentElement) {
      observer.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", resize)
    syncRef.current = sync
    resize()
    setAvailable(true)
    sync()
    const releaseContext = () => {
      if (contextLeaseRef.current === lease) {
        gl.getExtension("WEBGL_lose_context")?.loseContext()
      }
    }
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      syncRef.current = () => {}
      observer.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("webglcontextlost", contextLost)
      preference.removeEventListener("change", updatePreference)
      document.removeEventListener("visibilitychange", sync)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      shaders.forEach((shader) => gl.deleteShader(shader))
      // Defer context release so React Strict Mode can reacquire this canvas.
      queueMicrotask(releaseContext)
    }
  }, [])

  useEffect(() => {
    syncRef.current()
  }, [active, paused, control])

  return (
    <div
      className="sg-cyanotype-bloom"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        background: "#1946a1",
      }}
    >
      <div className="sg-cyanotype-bloom-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A botanical silhouette emerges through the grain of a deep blue contact print."
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 600 375"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: Math.pow(control, 0.38),
        }}
      >
        <defs>
          <linearGradient id={`${maskId}-development`} x1="0" y1="1" x2="0" y2="0">
            <stop offset={Math.max(0, control * 1.16 - 0.16)} stopColor="white" />
            <stop offset={Math.min(1, control * 1.16 + 0.04)} stopColor={control === 1 ? "white" : "black"} />
          </linearGradient>
          <mask id={`${maskId}-specimen`}>
            <rect width="600" height="375" fill={`url(#${maskId}-development)`} />
          </mask>
        </defs>
        <g mask={`url(#${maskId}-specimen)`} fill="#e2ebd8" stroke="#e2ebd8" strokeWidth=".6" strokeLinecap="round">
          {SPECIMENS.map((d, index) => (
            <path key={index} d={d} transform={`translate(${260 + index * 35} ${index === 1 ? 313 : 287})`} />
          ))}
        </g>
      </svg>
      {available && (
        <label className="sg-cyanotype-bloom-control">
          <span>Exposure</span>
          <input
            type="range"
            disabled={!active}
            min="0"
            max="1"
            step="0.01"
            aria-valuetext={`${Math.round(control * 100)}% exposed`}
            value={control}
            onChange={(event) => {
              const value = Number(event.currentTarget.value)
              controlRef.current = value
              setControl(value)
            }}
          />
        </label>
      )}
      <style>{`
.sg-cyanotype-bloom *{box-sizing:border-box}
.sg-cyanotype-bloom-fallback{position:absolute;inset:0;background:radial-gradient(ellipse at 38% 35%,#f3f0e055,transparent 55%),linear-gradient(145deg,#1946a1,#27313b)}
.sg-cyanotype-bloom-control{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:10px;padding:0 12px;min-height:44px;border-radius:22px;background:#f5f4f0;color:#222624;font:11px/1.2 Arial,sans-serif;box-shadow:0 2px 8px #0002}
.sg-cyanotype-bloom-control input{width:190px;max-width:38vw;height:44px;margin:0;accent-color:#353b37;cursor:pointer}
.sg-cyanotype-bloom-pause{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;color:#222624;background:#f5f4f0;box-shadow:0 2px 8px #0002;cursor:pointer}
.sg-cyanotype-bloom-pause:focus-visible,.sg-cyanotype-bloom-control input:focus-visible{outline:2px solid #386bd8;outline-offset:3px}
.sg-cyanotype-bloom-pause:disabled{opacity:.5;cursor:default}
      `}</style>
    </div>
  )
}
