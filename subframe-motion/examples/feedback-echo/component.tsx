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
uniform float u_step;
uniform sampler2D u_state;
const float PI=3.14159265359;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
vec2 plane(){return (gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);}
float hash(vec2 p){return fract(sin(dot(p,vec2(83.17,217.43)))*19731.731);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float line(float d,float width){float px=1.2/min(u_resolution.x,u_resolution.y);return 1.-smoothstep(width-px,width+px,abs(d));}

void main(){
 vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=plane();
 vec2 previous=(uv-.5)*pow(1.003,max(.05,u_step))+.5;previous.x+=.0008*u_step;
 vec3 old=texture2D(u_state,previous).rgb;
 vec2 q=p-vec2(.17*cos(u_time*.31),.11*sin(u_time*.43));q=rot(u_time*.22)*q;
 float ring=line(length(q/vec2(1.,.62))-.23,.0045);float bar=line(q.y,.002)*step(abs(q.x),.235);
 vec3 bg=vec3(.025,.12,.13);vec3 trace=mix(vec3(.97,.82,.50),vec3(.15,.66,.68),.5+.5*sin(u_time*.12));
 vec3 decay=mix(bg,old,pow(.86+u_control*.131,max(.05,u_step)));vec3 col=max(decay,trace*max(ring,bar*.6));
 gl_FragColor=vec4(col,1.);
}
`

export default function FeedbackEchoExample({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})
  const timeRef = useRef(3)
  const contextLeaseRef = useRef(0)
  const modeRef = useRef(1)
  const frameStepRef = useRef(1)
  const controlRef = useRef(0.73)
  const [control, setControl] = useState(0.73)
  const [paused, setPaused] = useState(false)
  const [available, setAvailable] = useState(false)
  const [reduced, setReduced] = useState(false)
  runningRef.current = active && !paused

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" })
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
    const frameStep = gl.getUniformLocation(program, "u_step")

    const stateTexture = gl.createTexture()
    if (!stateTexture) {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      shaders.forEach((shader) => gl.deleteShader(shader))
      return
    }
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, stateTexture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(gl.getUniformLocation(program, "u_state"), 0)
    let historyWidth = 0,
      historyHeight = 0
    const allocateHistory = () => {
      if (historyWidth === canvas.width && historyHeight === canvas.height) {
        return false
      }
      historyWidth = canvas.width
      historyHeight = canvas.height
      gl.bindTexture(gl.TEXTURE_2D, stateTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, historyWidth, historyHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      return true
    }

    const draw = (sampleTime = timeRef.current) => {
      if (disposed || lost) {
        return
      }
      allocateHistory()
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, sampleTime)
      gl.uniform1f(frameStep, frameStepRef.current)
      gl.uniform1f(adjustment, controlRef.current)
      gl.uniform1f(operation, modeRef.current)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      gl.bindTexture(gl.TEXTURE_2D, stateTexture)
      gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, canvas.width, canvas.height)
    }
    const tick = (now: number) => {
      if (disposed || lost || reduce || !runningRef.current || document.hidden) {
        frame = 0
        last = 0
        return
      }
      if (last) {
        const delta = Math.min((now - last) / 1000, 0.05)
        timeRef.current += delta
        frameStepRef.current = delta * 60
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
      if (allocateHistory()) {
        frameStepRef.current = 1
        for (let i = 0; i < 36; i++) {
          draw(timeRef.current - (35 - i) / 60)
        }
      }
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
      gl.deleteTexture(stateTexture)
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
      className="sg-feedback-echo"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        background: "#09282c",
      }}
    >
      <div className="sg-feedback-echo-fallback" aria-hidden="true" />
      {!available && <span className="sg-feedback-echo-unavailable">Static preview</span>}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A precise luminous orbit leaves a retained echo that slowly stretches and fades."
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      {available && (
        <label className="sg-feedback-echo-control">
          <span>Persistence</span>
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
          className="sg-feedback-echo-pause"
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
.sg-feedback-echo *{box-sizing:border-box}
.sg-feedback-echo-unavailable{position:absolute;bottom:22px;left:24px;color:#e8e4cc;font:11px Arial,sans-serif}
.sg-feedback-echo-fallback{position:absolute;inset:0;background:repeating-linear-gradient(135deg,transparent 0 24px,#e8e4cc22 25px 26px),#09282c}
.sg-feedback-echo-control{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:10px;padding:0 12px;min-height:44px;background:#09282cee;color:#e8e4cc;font:11px/1.2 Arial,sans-serif}
.sg-feedback-echo-control input{width:78px;max-width:95px;height:44px;margin:0;cursor:pointer;appearance:none;background:transparent;color:inherit}
.sg-feedback-echo-control input::-webkit-slider-runnable-track{height:2px;background:#e8e4cc66}
.sg-feedback-echo-control input::-webkit-slider-thumb{appearance:none;width:10px;height:14px;margin-top:-6px;border:1px solid currentColor;border-radius:1px;background:#e8e4cc}
.sg-feedback-echo-control input::-moz-range-track{height:2px;background:#e8e4cc66}
.sg-feedback-echo-control input::-moz-range-thumb{width:10px;height:14px;border:0;border-radius:1px;background:#e8e4cc}
.sg-feedback-echo-pause{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;color:#e8e4cc;background:#09282cee;cursor:pointer}
.sg-feedback-echo-pause:focus-visible,.sg-feedback-echo-control input:focus-visible{outline:2px solid #e8e4cc;outline-offset:3px}
.sg-feedback-echo-pause:disabled{opacity:.5;cursor:default}
`}</style>
    </div>
  )
}
