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

import { useEffect, useRef, useState } from "react"

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

float terrain(vec2 p) {
  p += .045 * vec2(sin(u_time * .17), cos(u_time * .13));
  float a = exp(-dot(p - vec2(.22,.12), p - vec2(.22,.12)) * 4.0);
  float b = .72 * exp(-dot(p - vec2(-.4,-.2), p - vec2(-.4,-.2)) * 7.5);
  float valley = .37 * exp(-dot(p - vec2(-.02,-.25), p - vec2(-.02,-.25)) * 18.0);
  return a + b - valley + .027 * sin(p.x * 18.0 + sin(p.y * 12.0));
}
void main() {
  vec2 p = (gl_FragCoord.xy - .5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float altitude = terrain(p * 1.6);
  float band = floor(altitude * 15.0) / 15.0;
  float edge = fract(altitude * 15.0);
  float contour = 1.0 - smoothstep(.024, .115, min(edge, 1.0 - edge));
  float shade = smoothstep(.06, .19, edge) * (1.0 - smoothstep(.84,.98,edge));
  vec3 orange = vec3(.76,.205,.062);
  vec3 sand = vec3(.98,.87,.63);
  vec3 color = mix(orange, sand, clamp(band * .78, 0.0, .9));
  color *= .9 + .1 * shade;
  color = mix(color, vec3(.99,.92,.75), contour * .78);
  vec2 marks = abs(fract(p * 5.0 + .5) - .5);
  float cross = (1.0 - smoothstep(.005,.011,marks.x)) * (1.0 - smoothstep(.035,.04,marks.y));
  cross = max(cross, (1.0 - smoothstep(.005,.011,marks.y)) * (1.0 - smoothstep(.035,.04,marks.x)));
  color = mix(color, vec3(.44,.11,.045), cross * .6);
  gl_FragColor = vec4(color, 1.0);
}
`

export default function ContourTerrainExample({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})
  const timeRef = useRef(3)
  const contextLeaseRef = useRef(0)
  const [paused, setPaused] = useState(false)
  const [available, setAvailable] = useState(false)
  const [reduced, setReduced] = useState(false)
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
    const draw = () => {
      if (disposed || lost) {
        return
      }
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, reduce ? 3 : timeRef.current)
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
  }, [active, paused])

  return (
    <div
      className="sg-contour-terrain"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        containerType: "inline-size",
        background: "#c34520",
        color: "#fbebc4",
      }}
    >
      <div className="sg-contour-terrain-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      <span className="sg-contour-terrain-top">
        TERRAIN STUDIES <span>005 / RELIEF</span>
      </span>
      <div className="sg-contour-terrain-title">
        Beyond
        <br />
        <em>the grid.</em>
      </div>
      <span className="sg-contour-terrain-scale">
        <i /> A STUDY IN ELEVATION
      </span>
      {available && !reduced && (
        <button
          className="sg-contour-terrain-pause"
          type="button"
          disabled={!active}
          aria-label={paused ? "Play animation" : "Pause animation"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play" : "Pause"}
        </button>
      )}
      <style>{`
.sg-contour-terrain *{box-sizing:border-box}
.sg-contour-terrain-fallback{position:absolute;inset:0;background:repeating-radial-gradient(ellipse at 62% 43%,#f4d49c 0 14px,#d8753a 15px 25px,#b13713 26px 28px)}
.sg-contour-terrain-pause{position:absolute;right:22px;bottom:18px;padding:7px 9px;border:1px solid currentColor;border-radius:0;font:10px/1 monospace;color:#fbebc4;background:#c34520;cursor:pointer;min-width:44px;min-height:44px;opacity:.9}
.sg-contour-terrain-pause:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.sg-contour-terrain-pause:disabled{opacity:.5;cursor:default}

.sg-contour-terrain-top{position:absolute;left:24px;right:24px;top:24px;display:flex;justify-content:space-between;gap:12px;font:9px/1.3 monospace;letter-spacing:.04em;color:#491b0a;background:#fbecc7e8;padding:7px 8px}
.sg-contour-terrain-title{position:absolute;left:27px;bottom:57px;font:clamp(42px,9cqw,60px)/.92 Georgia,serif;letter-spacing:-.065em;background:#aa3013;box-shadow:0 0 0 8px #aa3013}
.sg-contour-terrain-title em{font-weight:400}
.sg-contour-terrain-scale{position:absolute;left:27px;bottom:25px;display:flex;align-items:center;gap:10px;font:8px/1 monospace;letter-spacing:.045em}
.sg-contour-terrain-scale i{width:48px;height:5px;border:1px solid currentColor;border-top:0}

      `}</style>
    </div>
  )
}
