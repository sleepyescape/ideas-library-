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

float trace(float x, float t) {
  return .13 * sin(x * 15.0 - t * 1.25) + .032 * sin(x * 37.0 + t * .71);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = (gl_FragCoord.xy - .5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float pixel = 1.0 / min(u_resolution.x, u_resolution.y);
  vec2 grid = abs(fract(p * 12.0 + .5) - .5);
  float ruled = 1.0 - smoothstep(.013, .028, min(grid.x, grid.y));
  float axis = 1.0 - smoothstep(pixel, pixel * 2.0, min(abs(p.x), abs(p.y)));
  float d = abs(p.y - trace(p.x, u_time));
  float signal = exp(-d * 620.0) + .23 * exp(-d * 65.0);
  float ghost = exp(-abs(p.y - trace(p.x, u_time - .2)) * 200.0) * .15;
  float sweep = .24 + .76 * (1.0 - smoothstep(0.0, .85, fract(uv.x - .15 * u_time)));
  vec3 color = vec3(.015,.043,.025) + ruled * vec3(.017,.065,.028) + axis * vec3(.012,.04,.02);
  color += vec3(.52,1.0,.24) * (signal * sweep + ghost);
  color *= .94 + .06 * sin(gl_FragCoord.y * 3.14159);
  color *= 1.0 - .37 * pow(length((uv - .5) * 1.3), 2.0);
  gl_FragColor = vec4(color, 1.0);
}
`

export default function PhosphorTraceExample({ active = true }: { active?: boolean }) {
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
      className="sg-phosphor-trace"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        containerType: "inline-size",
        background: "#06110b",
        color: "#b2ff80",
      }}
    >
      <div className="sg-phosphor-trace-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      <span className="sg-phosphor-trace-top">
        <i /> SIGNAL LAB.
      </span>
      <span className="sg-phosphor-trace-readout">
        OSC—01
        <br />
        <b>
          ANALOG
          <br />
          FEELING.
        </b>
      </span>
      <div className="sg-phosphor-trace-bottom">
        <span>
          CH 01 <strong>∿</strong>
        </span>
        <span>
          CH 02 <strong>⌁</strong>
        </span>
        <span>CONTINUOUS / SYNTHETIC</span>
      </div>
      {available && !reduced && (
        <button
          className="sg-phosphor-trace-pause"
          type="button"
          disabled={!active}
          aria-label={paused ? "Play animation" : "Pause animation"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play" : "Pause"}
        </button>
      )}
      <style>{`
.sg-phosphor-trace *{box-sizing:border-box}
.sg-phosphor-trace-fallback{position:absolute;inset:0;background:linear-gradient(transparent 49%,#87d160 49.5%,#152c18 50.5%,transparent 51%),repeating-linear-gradient(0deg,transparent 0 29px,#132b1c 30px 31px),repeating-linear-gradient(90deg,#06110b 0 29px,#132b1c 30px 31px)}
.sg-phosphor-trace-pause{position:absolute;right:22px;bottom:18px;padding:7px 9px;border:1px solid currentColor;border-radius:0;font:10px/1 monospace;color:#b2ff80;background:#06110b;cursor:pointer;min-width:44px;min-height:44px;opacity:.9}
.sg-phosphor-trace-pause:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.sg-phosphor-trace-pause:disabled{opacity:.5;cursor:default}

.sg-phosphor-trace-top{position:absolute;left:25px;top:24px;font:11px/1 monospace;letter-spacing:.1em;display:flex;align-items:center;gap:9px}
.sg-phosphor-trace-top i{width:6px;height:6px;border-radius:50%;background:#b2ff80}
.sg-phosphor-trace-readout{position:absolute;right:25px;top:24px;font:9px/1.5 monospace;text-align:right;color:#a0cd8b}
.sg-phosphor-trace-readout b{font-size:13px;line-height:1.2;display:block;margin-top:8px;color:#b2ff80;letter-spacing:-.035em}
.sg-phosphor-trace-bottom{position:absolute;left:25px;right:25px;bottom:24px;display:flex;gap:24px;align-items:end;font:9px/1 monospace;letter-spacing:.04em}
.sg-phosphor-trace-bottom strong{font-size:29px;display:block;font-weight:400;line-height:1.4}
.sg-phosphor-trace-bottom>span:last-child{margin-left:auto;margin-right:62px;font-size:8px;text-align:right;max-width:90px;line-height:1.5}

      `}</style>
    </div>
  )
}
