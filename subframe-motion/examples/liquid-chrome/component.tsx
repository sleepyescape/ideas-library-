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

mat2 turn(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
float object(vec3 p) {
  p.xy = turn(-.38) * p.xy;
  p.yz = turn(.48 + .2 * sin(u_time * .16)) * p.yz;
  p.xz = turn(.12 * u_time) * p.xz;
  float a = atan(p.y, p.x);
  float rim = .66 + .065 * sin(3.0 * a + .22 * u_time);
  float tube = .225 + .035 * cos(2.0 * a - .16 * u_time);
  return length(vec2(length(p.xy) - rim, p.z)) - tube;
}
void main() {
  vec2 p = (gl_FragCoord.xy - .5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec3 eye = vec3(0.0, 0.0, 3.6);
  vec3 ray = normalize(vec3(p * 2.2, -3.0));
  float travel = 0.0;
  float hit = 0.0;
  for (int i = 0; i < 68; i++) {
    float d = object(eye + ray * travel);
    if (d < .002) { hit = 1.0; break; }
    travel += d * .78;
    if (travel > 6.0) break;
  }
  vec3 color = vec3(.067) + .018 * (1.0 - length(p));
  if (hit > .5) {
    vec3 q = eye + ray * travel;
    float e = .003;
    vec3 n = normalize(vec3(
      object(q + vec3(e,0,0)) - object(q - vec3(e,0,0)),
      object(q + vec3(0,e,0)) - object(q - vec3(0,e,0)),
      object(q + vec3(0,0,e)) - object(q - vec3(0,0,e))
    ));
    vec3 reflection = reflect(ray, n);
    float studio = smoothstep(-.12, .12, reflection.y + .16 * reflection.x);
    float strip = 1.0 - smoothstep(.045, .14, abs(reflection.y - .52));
    float edge = pow(1.0 - max(dot(n, -ray), 0.0), 2.0);
    color = mix(vec3(.035,.04,.05), vec3(.8,.82,.84), studio);
    color += strip * .7 + edge * .27;
    float red = smoothstep(.55, .85, reflection.x) * (1.0 - studio * .65);
    color = mix(color, vec3(.82,.025,.014), red * .85);
    color *= .72 + .28 * max(n.z, 0.0);
  }
  gl_FragColor = vec4(color, 1.0);
}
`

export default function LiquidChromeExample({ active = true }: { active?: boolean }) {
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
      className="sg-liquid-chrome"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        containerType: "inline-size",
        background: "#141414",
        color: "#f3f2ee",
      }}
    >
      <div className="sg-liquid-chrome-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      <span className="sg-liquid-chrome-top">MATERIAL EXPERIMENTS / 02</span>
      <div className="sg-liquid-chrome-title">CHROME</div>
      <span className="sg-liquid-chrome-side">SOLID / FLUID</span>
      {available && !reduced && (
        <button
          className="sg-liquid-chrome-pause"
          type="button"
          disabled={!active}
          aria-label={paused ? "Play animation" : "Pause animation"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play" : "Pause"}
        </button>
      )}
      <style>{`
.sg-liquid-chrome *{box-sizing:border-box}
.sg-liquid-chrome-fallback{position:absolute;inset:0;background:radial-gradient(ellipse at 53% 47%,#141414 0 15%,#383a3c 16%,#f2f2f2 20%,#6e7378 25%,#111 33%,#171717 35%)}
.sg-liquid-chrome-pause{position:absolute;right:22px;bottom:18px;padding:7px 9px;border:1px solid currentColor;border-radius:0;font:10px/1 monospace;color:#f3f2ee;background:#141414;cursor:pointer;min-width:44px;min-height:44px;opacity:.9}
.sg-liquid-chrome-pause:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.sg-liquid-chrome-pause:disabled{opacity:.5;cursor:default}

.sg-liquid-chrome-top{position:absolute;left:25px;top:24px;font:9px/1.2 monospace;letter-spacing:.12em}
.sg-liquid-chrome-title{position:absolute;left:22px;bottom:17px;font:900 clamp(41px,11cqw,72px)/.88 Arial,sans-serif;letter-spacing:-.07em}
.sg-liquid-chrome-side{position:absolute;right:0;top:47%;background:#f13323;color:#130c08;padding:8px 11px;font:9px/1 monospace;letter-spacing:.08em}

      `}</style>
    </div>
  )
}
