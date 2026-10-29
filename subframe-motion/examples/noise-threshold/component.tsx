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

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float field(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float noise(vec2 p){float n=0.,a=.54;for(int i=0;i<5;i++){n+=a*field(p);p=mat2(.8,-.6,.6,.8)*p*2.05+3.71;a*=.48;}return n;}
float edge(float d){return 1.-smoothstep(-1.5/resolution.y,1.5/resolution.y,d);}
void main(){
 vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.);p.y-=.04;
 vec2 a=p+vec2(.105,-.055),b=p-vec2(.13,-.04);
 float circleA=edge(length(a)-.3),circleB=edge(length(b)-.3);
 float waveA=sin((length(a)*26.+atan(a.y,a.x)*.9)*6.28318);
 float waveB=sin((b.x*.72+b.y*.7)*120.);
 float aa=140./resolution.y;
 vec3 blue=vec3(19.,70.,211.)/255.,paper=vec3(245.,241.,232.)/255.,red=vec3(215.,38.,38.)/255.,yellow=vec3(255.,213.,31.)/255.,ink=vec3(21.)/255.;
 vec3 front=blue;
 front=mix(front,paper,circleA*smoothstep(-aa,aa,waveA));
 front=mix(front,red,circleB*smoothstep(-aa,aa,waveB));
 vec3 back=yellow;
 float shell=edge(abs(length(p)-.247)-.043);
 float bar=edge(abs(p.x*.78+p.y*.63)-.056)*edge(abs(p.y)-.29);
 back=mix(back,ink,max(shell,bar));
 // Coverage has a fixed seed and no clock dependence. Endpoints are exact.
 float threshold=noise(p*5.8+vec2(13.4,8.2));
 float reveal=smoothstep(threshold-.028,threshold+.028,mix(-.1,1.1,value));
 vec3 color=mix(front,back,reveal);
 float grain=(hash(gl_FragCoord.xy)-.5)*.015;
 gl_FragColor=vec4(color+grain,1.);
}`

export default function NoiseThreshold({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    elapsed = useRef(0)
  const [value, setValue] = useState(42),
    [playing] = useState(false)
  const [available, setAvailable] = useState(false),
    [, setReduced] = useState(false)
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
    <div className="sf-noise-threshold" data-shader-ready={available}>
      <svg
        className="sf-noise-threshold-fallback"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="800" height="500" fill="oklch(0.4670 0.2216 264.01)" />
        <circle cx="340" cy="240" r="130" fill="none" stroke="oklch(0.9588 0.0127 86.83)" strokeWidth="70" />
        <path d="M410 90l95 280" stroke="oklch(0.5680 0.2107 27.24)" strokeWidth="120" />
      </svg>
      <canvas
        ref={canvas}
        className="sf-noise-threshold-canvas"
        style={{ opacity: available ? 1 : 0 }}
        aria-label="Noise threshold material study"
        role="img"
      />
      <div className="sf-noise-threshold-controls">
        <label htmlFor={id}>Reveal</label>
        <input
          id={id}
          aria-label="Reveal"
          type="range"
          disabled={!available}
          min="0"
          max="100"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
        <output htmlFor={id}>{value + "%"}</output>
      </div>
      <style>{`
        .sf-noise-threshold { width:100%; height:100%; min-height:0; position:relative; overflow:hidden; background:oklch(0.4670 0.2216 264.01); color:oklch(0.1957 0 0); font-family:Arial,sans-serif; isolation:isolate; }
        .sf-noise-threshold-fallback,.sf-noise-threshold-canvas { position:absolute; inset:0; width:100%; height:100%; display:block; pointer-events:none; }
        .sf-noise-threshold-controls { position:absolute; bottom:7%; left:50%; transform:translateX(-50%); display:flex; gap:14px; align-items:center; width:min(78%,390px); font-size:11px; line-height:1; background:oklch(0.9588 0.0127 86.83); box-shadow:0 0 0 8px oklch(0.9588 0.0127 86.83); }
        .sf-noise-threshold-controls label { white-space:nowrap; }
        .sf-noise-threshold-controls input { width:100%; min-width:40px; height:44px; margin:0; accent-color:oklch(0.1957 0 0); cursor:ew-resize; }
        .sf-noise-threshold-controls output { min-width:42px; text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
        .sf-noise-threshold-controls button { width:44px; height:44px; flex:none; border:1px solid currentColor; border-radius:50%; background:transparent; color:inherit; padding:11px; cursor:pointer; transition:opacity 140ms ease,transform 140ms ease; }
        .sf-noise-threshold-controls button svg { width:20px; height:20px; display:block; }
        .sf-noise-threshold-controls button:active { transform:scale(.97); }
        .sf-noise-threshold-controls button:disabled { opacity:.4; cursor:default; }
        .sf-noise-threshold-controls :focus-visible { outline:2px solid currentColor; outline-offset:4px; }
        @media (prefers-reduced-motion:reduce) { .sf-noise-threshold-controls button { transition:none; } }
      `}</style>
    </div>
  )
}
