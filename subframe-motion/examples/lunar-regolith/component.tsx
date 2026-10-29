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
float seed(vec2 p) {
  return fract(sin(p.x*127.13+p.y*311.71)*43719.17);
}
float grain(vec2 p) {
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(seed(i),seed(i+vec2(1,0)),f.x),mix(seed(i+vec2(0,1)),seed(i+vec2(1)),f.x),f.y);
}
float layered(vec2 p) {
  float v=0.0,w=.54;
  for(int i=0;i<4;i++) {
    v+=w*grain(p);
    p=mat2(1.63,1.21,-1.21,1.63)*p+7.17;
    w*=.47;
  }
  return v;
}

vec2 frame() {
  return (gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);
}
float rock(vec2 uv) {
  return layered(uv*8.0)*.65+grain(uv*60.0)*.2+grain(uv*160.0)*.08;
}
void main() {
  vec2 p=frame()-vec2(.05,0);
  float r=length(p);
  float radius=.36;
  vec3 c=vec3(.85,.89,.90);
  if(r<radius) {
    vec3 n=vec3(p/radius,sqrt(max(0.0,1.0-r*r/(radius*radius))));
    vec2 uv=vec2(atan(n.x,n.z),asin(n.y));
    uv.x+=u_time*.025;
    float h=rock(uv);
    float e=.002;
    vec3 b=normalize(n+vec3((h-rock(uv+vec2(e,0)))*14.0,(h-rock(uv+vec2(0,e)))*14.0,0));
    vec3 light=normalize(vec3(-1.3+u_control*1.8,.45,.7));
    float diffuse=max(dot(b,light),0.0);
    c=vec3(.54,.51,.46)*(.06+diffuse*.94)*( .7+h*.7);
    float cell=grain(uv*20.0);
    c*=.85+.15*smoothstep(.24,.4,cell);
  }
  gl_FragColor=vec4(c,1);
}
`

export default function LunarRegolithExample({ active = true }: { active?: boolean }) {
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
      className="sg-lunar-regolith"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        background: "#dce6e8",
      }}
    >
      <div className="sg-lunar-regolith-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Raking light reveals a rough mineral moon against an icy white field."
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      {available && (
        <label className="sg-lunar-regolith-control">
          <span>Sun angle</span>
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
          className="sg-lunar-regolith-pause"
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
.sg-lunar-regolith *{box-sizing:border-box}
.sg-lunar-regolith-fallback{position:absolute;inset:0;background:radial-gradient(ellipse at 38% 35%,#f3f0e055,transparent 55%),linear-gradient(145deg,#dce6e8,#27313b)}
.sg-lunar-regolith-control{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:10px;padding:0 12px;min-height:44px;border-radius:22px;background:#f5f4f0;color:#222624;font:11px/1.2 Arial,sans-serif;box-shadow:0 2px 8px #0002}
.sg-lunar-regolith-control input{width:78px;max-width:23vw;height:44px;margin:0;accent-color:#353b37;cursor:pointer}
.sg-lunar-regolith-pause{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;color:#222624;background:#f5f4f0;box-shadow:0 2px 8px #0002;cursor:pointer}
.sg-lunar-regolith-pause:focus-visible,.sg-lunar-regolith-control input:focus-visible{outline:2px solid #386bd8;outline-offset:3px}
.sg-lunar-regolith-pause:disabled{opacity:.5;cursor:default}
      `}</style>
    </div>
  )
}
