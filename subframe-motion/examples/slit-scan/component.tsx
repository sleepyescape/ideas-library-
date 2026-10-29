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

import { useEffect, useId, useRef, useState } from "react"

const fragment = `precision highp float;varying vec2 uv;uniform vec2 resolution;uniform float time;uniform float value;

float box(vec2 p,vec2 s,float r){vec2 q=abs(p)-s+r;return min(max(q.x,q.y),0.)+length(max(q,0.))-r;}
float edge(float d){return 1.-smoothstep(-1.4/resolution.y,1.4/resolution.y,d);}
void main(){
 vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.);p.y-=.035;
 // Each column samples a different instant of the same rigid motion.
 // Zero spread is an ordinary frame, not a second effect or alternate mesh.
 float sampleTime=time*.52+(uv.x-.5)*value*15.;
 float angle=sampleTime*.85+.48;
 mat2 rotation=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
 vec2 q=rotation*(p-vec2(sin(sampleTime*.71)*.14,cos(sampleTime*.47)*.045));
 float depth=.66+.24*cos(sampleTime*.63);q.x/=depth;
 float outer=box(q,vec2(.26,.25),.08),inner=box(q,vec2(.167,.157),.022);
 float shape=max(outer,-inner);
 vec3 background=vec3(.027,.235,.245);
 float shadow=edge(max(box(q+vec2(-.018,.025),vec2(.263,.253),.08),-box(q+vec2(-.018,.025),vec2(.164,.154),.022)));
 background*=1.-shadow*.27;
 float facing=clamp(.52+q.x*.8-q.y*.34,0.,1.);
 vec3 ceramic=mix(vec3(.56,.68,.64),vec3(.99,.96,.83),facing);
 float bevel=exp(-abs(shape)*130.);
 ceramic+=bevel*.17;
 vec3 color=mix(background,ceramic,edge(shape));
 float channel=edge(abs(q.y)-.0012)*edge(abs(q.x)-.23)*edge(-abs(q.x)+.17);
 color=mix(color,vec3(.25,.42,.39),channel*.55);
 gl_FragColor=vec4(color,1.);
}`

export default function SlitScan({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    elapsed = useRef(0)
  const [value, setValue] = useState(66),
    [playing, setPlaying] = useState(true)
  const [available, setAvailable] = useState(false),
    [reduced, setReduced] = useState(false)
  const id = useId(),
    control = useRef<(() => void) | null>(null)
  const live = useRef({ active, value, playing })
  live.current = { active, value, playing }

  useEffect(() => {
    const element = canvas.current!
    const gl = element.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" })
    if (!gl) {
      return
    }
    const preference = matchMedia("(prefers-reduced-motion: reduce)")
    let reduced = preference.matches,
      disposed = false,
      lost = false,
      inView = true,
      frame = 0,
      last = 0
    let program: WebGLProgram | null = null,
      buffer: WebGLBuffer | null = null
    let shaders: WebGLShader[] = []
    let resolution: WebGLUniformLocation | null = null,
      clock: WebGLUniformLocation | null = null,
      adjustment: WebGLUniformLocation | null = null
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
    }
    const release = () => {
      stop()
      shaders.forEach((shader) => gl.deleteShader(shader))
      shaders = []
      if (buffer) {
        gl.deleteBuffer(buffer)
      }
      if (program) {
        gl.deleteProgram(program)
      }
      program = null
      buffer = null
    }
    const paint = () => {
      if (disposed || lost || !program || document.hidden) {
        return
      }
      gl.viewport(0, 0, element.width, element.height)
      gl.uniform2f(resolution, element.width, element.height)
      gl.uniform1f(clock, elapsed.current)
      gl.uniform1f(adjustment, live.current.value / 100)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const tick = (now: number) => {
      frame = 0
      if (disposed || lost || reduced || !inView || !live.current.active || !live.current.playing || document.hidden) {
        last = 0
        return
      }
      if (last) {
        elapsed.current += Math.min((now - last) / 1000, 0.04)
      }
      last = now
      paint()
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      stop()
      paint()
      if (
        program &&
        !disposed &&
        !lost &&
        !reduced &&
        inView &&
        live.current.active &&
        live.current.playing &&
        !document.hidden
      ) {
        frame = requestAnimationFrame(tick)
      }
    }
    const resize = () => {
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) {
        return
      }
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(2400000 / (rect.width * rect.height)))
      const width = Math.max(1, Math.round(rect.width * dpr)),
        height = Math.max(1, Math.round(rect.height * dpr))
      if (element.width !== width || element.height !== height) {
        element.width = width
        element.height = height
      }
      paint()
    }
    const initialize = () => {
      release()
      try {
        program = gl.createProgram()
        if (!program) {
          throw new Error("Unable to create program")
        }
        for (const [type, source] of [
          [
            gl.VERTEX_SHADER,
            "attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}",
          ],
          [gl.FRAGMENT_SHADER, fragment],
        ] as const) {
          const shader = gl.createShader(type)
          if (!shader) {
            throw new Error("Unable to create shader")
          }
          shaders.push(shader)
          gl.shaderSource(shader, source)
          gl.compileShader(shader)
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed")
          }
          gl.attachShader(program, shader)
        }
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error("Shader linking failed")
        }
        gl.useProgram(program)
        buffer = gl.createBuffer()
        if (!buffer) {
          throw new Error("Unable to create buffer")
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
        const position = gl.getAttribLocation(program, "position")
        gl.enableVertexAttribArray(position)
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
        resolution = gl.getUniformLocation(program, "resolution")
        clock = gl.getUniformLocation(program, "time")
        adjustment = gl.getUniformLocation(program, "value")
        setAvailable(true)
        resize()
        sync()
      } catch {
        release()
        setAvailable(false)
      }
    }
    const changePreference = () => {
      reduced = preference.matches
      setReduced(reduced)
      sync()
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      lost = true
      stop()
      setAvailable(false)
    }
    const contextRestored = () => {
      lost = false
      initialize()
    }
    const observer = new ResizeObserver(resize),
      transforms = new MutationObserver(resize)
    for (let node: HTMLElement | null = element.parentElement; node; node = node.parentElement) {
      observer.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    observer.observe(element)
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })
    intersection.observe(element)
    preference.addEventListener("change", changePreference)
    element.addEventListener("webglcontextlost", contextLost)
    element.addEventListener("webglcontextrestored", contextRestored)
    document.addEventListener("visibilitychange", sync)
    window.addEventListener("resize", resize)
    control.current = sync
    setReduced(reduced)
    initialize()
    return () => {
      disposed = true
      control.current = null
      observer.disconnect()
      intersection.disconnect()
      transforms.disconnect()
      preference.removeEventListener("change", changePreference)
      element.removeEventListener("webglcontextlost", contextLost)
      element.removeEventListener("webglcontextrestored", contextRestored)
      document.removeEventListener("visibilitychange", sync)
      window.removeEventListener("resize", resize)
      release()
      // StrictMode replays effects while connected; only a real removal releases the context.
      queueMicrotask(() => {
        if (!element.isConnected) {
          gl.getExtension("WEBGL_lose_context")?.loseContext()
        }
      })
    }
  }, [])
  useEffect(() => control.current?.(), [active, value, playing])

  return (
    <div className="sf-slit-scan" data-shader-ready={available}>
      <svg
        className="sf-slit-scan-fallback"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          d="M250 340C410 420 180 110 380 140S350 440 560 195"
          fill="none"
          stroke="#e4e8d4"
          strokeWidth="50"
          strokeLinejoin="round"
        />
      </svg>
      <canvas
        ref={canvas}
        className="sf-slit-scan-canvas"
        style={{ opacity: available ? 1 : 0 }}
        aria-label="Slit scan material study"
        role="img"
      />
      <div className="sf-slit-scan-controls">
        <label htmlFor={id}>Time spread</label>
        <input
          id={id}
          aria-label="Time spread"
          type="range"
          disabled={!available}
          min="0"
          max="100"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
        <output htmlFor={id}>{(value * 0.15).toFixed(1) + " s"}</output>
        <button
          type="button"
          aria-label={playing ? "Pause animation" : "Play animation"}
          aria-pressed={playing}
          disabled={reduced || !available}
          onClick={() => setPlaying(!playing)}
        >
          {playing && !reduced ? (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7 5v10M13 5v10" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m7 4 9 6-9 6z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
      <style>{`
        .sf-slit-scan { width:100%; height:100%; min-height:0; position:relative; overflow:hidden; background:#073c3e; color:#e2ebd4; font-family:Arial,sans-serif; isolation:isolate; }
        .sf-slit-scan-fallback,.sf-slit-scan-canvas { position:absolute; inset:0; width:100%; height:100%; display:block; pointer-events:none; }
        .sf-slit-scan-controls { position:absolute; bottom:7%; left:50%; transform:translateX(-50%); display:flex; gap:14px; align-items:center; width:min(78%,390px); font-size:11px; line-height:1; }
        .sf-slit-scan-controls label { white-space:nowrap; }
        .sf-slit-scan-controls input { width:100%; min-width:40px; height:44px; margin:0; accent-color:#e2ebd4; cursor:ew-resize; }
        .sf-slit-scan-controls output { min-width:42px; text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
        .sf-slit-scan-controls button { width:44px; height:44px; flex:none; border:1px solid currentColor; border-radius:50%; background:transparent; color:inherit; padding:11px; cursor:pointer; transition:opacity 140ms ease,transform 140ms ease; }
        .sf-slit-scan-controls button svg { width:20px; height:20px; display:block; }
        .sf-slit-scan-controls button:active { transform:scale(.97); }
        .sf-slit-scan-controls button:disabled { opacity:.4; cursor:default; }
        .sf-slit-scan-controls :focus-visible { outline:2px solid currentColor; outline-offset:4px; }
        @media (prefers-reduced-motion:reduce) { .sf-slit-scan-controls button { transition:none; } }
      `}</style>
    </div>
  )
}
