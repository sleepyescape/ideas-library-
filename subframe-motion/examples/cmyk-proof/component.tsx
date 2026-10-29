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

vec3 artwork(vec2 p){
 float a=u_time*.08;vec2 q=rot(a)*p;
 float fruit=1.-smoothstep(.256,.264,length(q-vec2(.025,-.035)));
 vec3 c=mix(vec3(1.),vec3(.97,.23,.035),fruit);
 float highlight=exp(-dot(q-vec2(-.10,.08),q-vec2(-.10,.08))*130.)*fruit;c=mix(c,vec3(1.,.76,.16),highlight*.85);
 vec2 leaf=rot(-.48)*(q-vec2(.13,.25));float shape=1.-smoothstep(.98,1.02,length(leaf/vec2(.15,.06)));c=mix(c,vec3(.09,.30,.10),shape);
 float shadow=exp(-pow((q.y+.31)/.025,2.)-pow(q.x/.25,2.))*.25;c*=1.-shadow;return c;
}
float ink(vec2 p,float angle,float channel,vec2 offset){
 vec2 v=rot(angle)*(p-offset)*58.;vec2 center=(floor(v)+.5)/58.;vec2 back=rot(-angle)*center+offset;
 vec3 rgb=artwork(back);float k=1.-max(max(rgb.r,rgb.g),rgb.b);vec3 cmy=(1.-rgb-k)/max(.001,1.-k);
 float amount=channel<.5?cmy.x:channel<1.5?cmy.y:channel<2.5?cmy.z:k;
 if(amount<.0001)return 0.;float dotRadius=.49*sqrt(clamp(amount,0.,1.));return 1.-smoothstep(dotRadius-.065,dotRadius+.065,length(fract(v)-.5));
}
void main(){vec2 p=plane()+vec2(0,-.025);float offset=(u_control-.1)*.039;vec3 c=vec3(.98,.97,.93);
 float cyan=ink(p,.26,0.,vec2(-offset,0));float magenta=ink(p,1.31,1.,vec2(offset,offset*.5));float yellow=ink(p,0.,2.,vec2(0,-offset));float black=ink(p,.785,3.,vec2(0));
 c*=mix(vec3(1),vec3(.03,.74,.83),cyan);c*=mix(vec3(1),vec3(.90,.04,.36),magenta);c*=mix(vec3(1),vec3(.99,.86,.015),yellow);c*=1.-black*.9;
 gl_FragColor=vec4(c,1.);}
`

export default function CmykProofExample({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})
  const timeRef = useRef(3)
  const contextLeaseRef = useRef(0)
  const modeRef = useRef(1)
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
  }, [active, paused, control])

  return (
    <div
      className="sg-cmyk-proof"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        background: "#f7f5e9",
      }}
    >
      <div className="sg-cmyk-proof-fallback" aria-hidden="true" />
      {!available && <span className="sg-cmyk-proof-unavailable">Static preview</span>}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A printed citrus study separates into four angled screens as its color plates slip out of register."
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      {available && (
        <label className="sg-cmyk-proof-control">
          <span>Registration</span>
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
          className="sg-cmyk-proof-pause"
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
.sg-cmyk-proof *{box-sizing:border-box}
.sg-cmyk-proof-unavailable{position:absolute;bottom:22px;left:24px;color:#272527;font:11px Arial,sans-serif}
.sg-cmyk-proof-fallback{position:absolute;inset:0;background:repeating-linear-gradient(135deg,transparent 0 24px,#27252722 25px 26px),#f7f5e9}
.sg-cmyk-proof-control{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:10px;padding:0 12px;min-height:44px;background:#f7f5e9ee;color:#272527;font:11px/1.2 Arial,sans-serif}
.sg-cmyk-proof-control input{width:78px;max-width:95px;height:44px;margin:0;cursor:pointer;appearance:none;background:transparent;color:inherit}
.sg-cmyk-proof-control input::-webkit-slider-runnable-track{height:2px;background:#27252766}
.sg-cmyk-proof-control input::-webkit-slider-thumb{appearance:none;width:10px;height:14px;margin-top:-6px;border:1px solid currentColor;border-radius:1px;background:#272527}
.sg-cmyk-proof-control input::-moz-range-track{height:2px;background:#27252766}
.sg-cmyk-proof-control input::-moz-range-thumb{width:10px;height:14px;border:0;border-radius:1px;background:#272527}
.sg-cmyk-proof-pause{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;color:#272527;background:#f7f5e9ee;cursor:pointer}
.sg-cmyk-proof-pause:focus-visible,.sg-cmyk-proof-control input:focus-visible{outline:2px solid #272527;outline-offset:3px}
.sg-cmyk-proof-pause:disabled{opacity:.5;cursor:default}
`}</style>
    </div>
  )
}
