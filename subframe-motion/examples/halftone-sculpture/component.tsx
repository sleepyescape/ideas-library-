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

float heightAt(vec2 p) {
  float a = atan(p.y, p.x) + u_time * .075;
  float radius = .34 + .075 * cos(3.0 * a) + .025 * sin(5.0 * a);
  return sqrt(max(0.0, radius * radius - dot(p,p)));
}
void main() {
  vec2 p = (gl_FragCoord.xy - .5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float wide = smoothstep(1.0, 1.6, u_resolution.x / u_resolution.y);
  p -= vec2(mix(.025, .15, wide), mix(.105, .012, wide));
  p *= mix(1.12, 1.0, wide);
  float spacing = .015;
  vec2 cell = floor(p / spacing) + .5;
  vec2 center = cell * spacing;
  float h = heightAt(center);
  vec3 paper = vec3(.948,.938,.907);
  float texture = fract(sin(dot(floor(gl_FragCoord.xy / 2.0), vec2(31.7,17.3))) * 771.73);
  paper -= texture * .025;
  vec3 color = paper;
  if (h > .0) {
    float e = .002;
    vec3 normal = normalize(vec3(
      (heightAt(center - vec2(e,0)) - heightAt(center + vec2(e,0))) / (2.0 * e),
      (heightAt(center - vec2(0,e)) - heightAt(center + vec2(0,e))) / (2.0 * e), 1.0));
    vec3 lamp = normalize(vec3(-.6 + .3 * sin(u_time * .22), .7, .9));
    float shade = .16 + .84 * max(0.0, dot(normal,lamp));
    float inkRadius = .47 * sqrt(1.0 - shade * .77);
    float spot = length(fract(p / spacing) - .5);
    float aa = 1.0 / (min(u_resolution.x,u_resolution.y) * spacing);
    float ink = 1.0 - smoothstep(inkRadius - aa * .45, inkRadius + aa * .45, spot);
    color = mix(paper, vec3(.06,.16,.73), ink);
  }
  gl_FragColor = vec4(color,1.0);
}
`

export default function HalftoneSculptureExample({ active = true }: { active?: boolean }) {
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
      className="sg-halftone-sculpture"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        containerType: "inline-size",
        background: "#f0eee5",
        color: "#183bcf",
      }}
    >
      <div className="sg-halftone-sculpture-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      <span className="sg-halftone-sculpture-top">SUBFRAME / FORM STUDIES</span>
      <div className="sg-halftone-sculpture-title">
        Soft
        <br />
        matter.
      </div>
      <span className="sg-halftone-sculpture-number">06</span>
      <span className="sg-halftone-sculpture-bottom">INK. LIGHT. VOLUME.</span>
      {available && !reduced && (
        <button
          className="sg-halftone-sculpture-pause"
          type="button"
          disabled={!active}
          aria-label={paused ? "Play animation" : "Pause animation"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play" : "Pause"}
        </button>
      )}
      <style>{`
.sg-halftone-sculpture *{box-sizing:border-box}
.sg-halftone-sculpture-fallback{position:absolute;inset:0;background:radial-gradient(circle at 65% 48%,#183bcf 0 20%,transparent 20.5%)}
.sg-halftone-sculpture-pause{position:absolute;right:22px;bottom:18px;padding:7px 9px;border:1px solid currentColor;border-radius:0;font:10px/1 monospace;color:#183bcf;background:#f0eee5;cursor:pointer;min-width:44px;min-height:44px;opacity:.9}
.sg-halftone-sculpture-pause:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.sg-halftone-sculpture-pause:disabled{opacity:.5;cursor:default}

.sg-halftone-sculpture-top{position:absolute;left:25px;top:24px;font:9px/1 monospace;letter-spacing:.1em}
.sg-halftone-sculpture-title{position:absolute;left:24px;bottom:63px;font:900 clamp(43px,10cqw,64px)/.85 Arial,sans-serif;letter-spacing:-.08em}
.sg-halftone-sculpture-number{position:absolute;right:24px;top:19px;font:30px/1 Georgia,serif;letter-spacing:-.075em}
.sg-halftone-sculpture-bottom{position:absolute;left:25px;bottom:26px;font:9px/1 monospace;letter-spacing:.11em}

      `}</style>
    </div>
  )
}
