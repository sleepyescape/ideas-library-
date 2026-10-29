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
uniform float u_mode;
uniform sampler2D u_state;
const float PI=3.14159265359;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
vec2 plane(){return (gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);}
float hash(vec2 p){return fract(sin(dot(p,vec2(83.17,217.43)))*19731.731);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float line(float d,float width){float px=1.2/min(u_resolution.x,u_resolution.y);return 1.-smoothstep(width-px,width+px,abs(d));}

float box(vec3 p){vec3 q=abs(p)-vec3(.6,.54,.5);return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-.055;}
vec3 local(vec3 p){p.xz=rot(.47+.1*sin(u_time*.16))*p.xz;p.yz=rot(-.25)*p.yz;return p;}
float model(vec3 p){p=local(p);float b=box(p);float sphere=length(p-vec3((u_control-.5)*1.15,.06,.40))-.57;if(u_mode<.5)return min(b,sphere);if(u_mode>1.5)return max(b,sphere);return max(b,-sphere);}
void main(){
 vec2 p=plane()+vec2(0,-.055);vec3 ro=vec3(0,0,3.3),rd=normalize(vec3(p*2.5,-3.));float travel=0.,hit=0.;
 for(int i=0;i<76;i++){float d=model(ro+rd*travel);if(d<.0015){hit=1.;break;}travel+=max(d*.8,.001);if(travel>5.)break;}
 vec3 color=vec3(.85,.88,.89);
 if(hit>.5){vec3 q=ro+rd*travel;float e=.002;vec3 n=normalize(vec3(model(q+vec3(e,0,0))-model(q-vec3(e,0,0)),model(q+vec3(0,e,0))-model(q-vec3(0,e,0)),model(q+vec3(0,0,e))-model(q-vec3(0,0,e))));vec3 l=normalize(vec3(-.8,1.3,1.8));float dif=max(dot(n,l),0.);float spec=pow(max(dot(n,normalize(l-rd)),0.),72.);float ao=clamp(model(q+n*.09)/.09,.35,1.);color=vec3(.7,.065,.037)*(.2+.8*dif)*ao+spec*.75;}
 gl_FragColor=vec4(color,1.);
}
`

export default function BooleanStudioExample({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})
  const timeRef = useRef(3)
  const contextLeaseRef = useRef(0)
  const modeRef = useRef(1)
  const [mode, setMode] = useState(1)
  const controlRef = useRef(0.6)
  const [control, setControl] = useState(0.6)
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
    const operation = gl.getUniformLocation(program, "u_mode")
    const draw = () => {
      if (disposed || lost) {
        return
      }
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, timeRef.current)
      gl.uniform1f(adjustment, controlRef.current)
      gl.uniform1f(operation, modeRef.current)
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
  }, [active, paused, control, mode])

  return (
    <div
      className="sg-boolean-studio"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        background: "#d9e0e2",
      }}
    >
      <div className="sg-boolean-studio-fallback" aria-hidden="true" />
      {!available && <span className="sg-boolean-studio-unavailable">Static preview</span>}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A lacquer-red solid is joined, cut or intersected by a movable sphere."
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          const b = event.currentTarget.getBoundingClientRect()
          const value = Math.max(0, Math.min(1, (event.clientX - b.left) / b.width))
          controlRef.current = value
          setControl(value)
        }}
        onPointerMove={(event) => {
          if (event.buttons) {
            const b = event.currentTarget.getBoundingClientRect()
            const value = Math.max(0, Math.min(1, (event.clientX - b.left) / b.width))
            controlRef.current = value
            setControl(value)
          }
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: available ? 1 : 0,
          touchAction: "none",
        }}
      />
      {available && (
        <div className="sf-bs-modes" role="group" aria-label="Boolean operation">
          {["Join", "Cut", "Intersect"].map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={mode === i}
              onClick={() => {
                modeRef.current = i
                setMode(i)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {available && (
        <label className="sg-boolean-studio-control">
          <span>Cutter position</span>
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
          className="sg-boolean-studio-pause"
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
.sg-boolean-studio *{box-sizing:border-box}
.sg-boolean-studio-unavailable{position:absolute;bottom:22px;left:24px;color:#9e1f19;font:11px Arial,sans-serif}
.sg-boolean-studio-fallback{position:absolute;inset:0;background:repeating-linear-gradient(135deg,transparent 0 24px,#9e1f1922 25px 26px),#d9e0e2}
.sg-boolean-studio-control{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:10px;padding:0 12px;min-height:44px;background:#d9e0e2ee;color:#9e1f19;font:11px/1.2 Arial,sans-serif}
.sg-boolean-studio-control input{width:78px;max-width:95px;height:44px;margin:0;cursor:pointer;appearance:none;background:transparent;color:inherit}
.sg-boolean-studio-control input::-webkit-slider-runnable-track{height:2px;background:#9e1f1966}
.sg-boolean-studio-control input::-webkit-slider-thumb{appearance:none;width:10px;height:14px;margin-top:-6px;border:1px solid currentColor;border-radius:1px;background:#9e1f19}
.sg-boolean-studio-control input::-moz-range-track{height:2px;background:#9e1f1966}
.sg-boolean-studio-control input::-moz-range-thumb{width:10px;height:14px;border:0;border-radius:1px;background:#9e1f19}
.sg-boolean-studio-pause{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;color:#9e1f19;background:#d9e0e2ee;cursor:pointer}
.sg-boolean-studio-pause:focus-visible,.sg-boolean-studio-control input:focus-visible{outline:2px solid #9e1f19;outline-offset:3px}
.sg-boolean-studio-pause:disabled{opacity:.5;cursor:default}
.sf-bs-modes{position:absolute;top:12px;left:12px;display:flex;gap:4px}.sf-bs-modes button{min-width:60px;height:44px;padding:0 12px;border:1px solid #8b9da244;background:#d9e0e2;color:#632c25;font:11px Arial,sans-serif;cursor:pointer}.sf-bs-modes button[aria-pressed=true]{background:#a22d21;color:white}.sf-bs-modes button:focus-visible{outline:2px solid #642218;outline-offset:2px}`}</style>
    </div>
  )
}
