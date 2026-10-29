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
uniform float u_control;

mat2 rotate(float a) {
  return mat2(cos(a),-sin(a),sin(a),cos(a));
}

vec2 frame() {
  return (gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);
}
float solid(vec3 p) {
  p.xz=rotate(u_time*.10)*p.xz;
  p.yz=rotate(.37)*p.yz;
  vec3 q=p*6.4;
  float g=abs(dot(sin(q),cos(q.yzx)))-(.25+u_control*.35);
  float box=max(max(abs(p.x),abs(p.y)),abs(p.z))-.69;
  return max(g*.10,box);
}
void main() {
  vec2 p=frame();
  vec3 eye=vec3(0,0,3.4),ray=normalize(vec3(p*2.5,-3));
  float t=0.0,hit=0.0;
  for(int i=0;i<58;i++) {
    float d=solid(eye+ray*t);
    if(d<.002) {
      hit=1.0;
      break;
    }
    t+=max(d*.55,.002);
    if(t>5.0)break;
  }
  vec3 c=vec3(.40,.43,.46);
  if(hit>.5) {
    vec3 q=eye+ray*t;
    float e=.003;
    vec3 n=normalize(vec3(solid(q+vec3(e,0,0))-solid(q-vec3(e,0,0)),solid(q+vec3(0,e,0))-solid(q-vec3(0,e,0)),solid(q+vec3(0,0,e))-solid(q-vec3(0,0,e))));
    float light=max(dot(n,normalize(vec3(-1,2,3))),0.0);
    float ao=clamp(solid(q+n*.13)/.13,.25,1.0);
    c=vec3(.91,.58,.055)*(.18+.82*light)*ao;
    c+=pow(max(n.z,0.0),22.0)*.15;
  }
  gl_FragColor=vec4(c,1);
}
`

export default function GyroidCutawayExample({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})
  const timeRef = useRef(3)
  const contextLeaseRef = useRef(0)
  const controlRef = useRef(0.5)
  const [control, setControl] = useState(0.5)
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
      className="sg-gyroid-cutaway"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        background: "#777a80",
      }}
    >
      <div className="sg-gyroid-cutaway-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A saffron porous solid turns slowly, revealing continuous internal tunnels."
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      {available && (
        <label className="sg-gyroid-cutaway-control">
          <span>Wall thickness</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={control}
            onChange={(event) => {
              const value = Number(event.currentTarget.value)
              controlRef.current = value
              setControl(value)
            }}
          />
        </label>
      )}
      {available && !reduced && (
        <button
          className="sg-gyroid-cutaway-pause"
          type="button"
          disabled={!active}
          aria-label={paused ? "Play animation" : "Pause animation"}
          onClick={() => setPaused((value) => !value)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            {paused ? (
              <path fill="currentColor" d="M4 2.5 13 8 4 13.5Z" />
            ) : (
              <path fill="currentColor" d="M4 3h3v10H4zm5 0h3v10H9z" />
            )}
          </svg>
        </button>
      )}
      <style>{`
.sg-gyroid-cutaway *{box-sizing:border-box}
.sg-gyroid-cutaway-fallback{position:absolute;inset:0;background:radial-gradient(ellipse at 38% 35%,#f3f0e055,transparent 55%),linear-gradient(145deg,#777a80,#27313b)}
.sg-gyroid-cutaway-control{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:10px;padding:0 12px;min-height:44px;border-radius:22px;background:#f5f4f0;color:#222624;font:11px/1.2 Arial,sans-serif;box-shadow:0 2px 8px #0002}
.sg-gyroid-cutaway-control input{width:78px;max-width:23vw;height:44px;margin:0;accent-color:#353b37;cursor:pointer}
.sg-gyroid-cutaway-pause{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;color:#222624;background:#f5f4f0;box-shadow:0 2px 8px #0002;cursor:pointer}
.sg-gyroid-cutaway-pause:focus-visible,.sg-gyroid-cutaway-control input:focus-visible{outline:2px solid #386bd8;outline-offset:3px}
.sg-gyroid-cutaway-pause:disabled{opacity:.5;cursor:default}
      `}</style>
    </div>
  )
}
