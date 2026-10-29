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
uniform float u_time,u_control;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
// Each convex cell is intersected analytically: no depth-step edges.
vec4 cellHit(vec2 p,vec2 view,vec2 id){
 if(id.x<0.||id.x>5.||id.y<0.||id.y>3.)return vec4(0.,0.,1.,-1.);
 vec2 peak=vec2(.3+.4*hash(id+1.7),.3+.4*hash(id+9.2));
 vec2 f=(p+vec2(.54,.31))/vec2(.18,.155)-id;
 float h=.057+.041*hash(id+3.1);
 vec4 slope=vec4(h/(.18*peak.x),-h/(.18*(1.-peak.x)),h/(.155*peak.y),-h/(.155*(1.-peak.y)));
 vec4 zs=(vec4(.005)+h*vec4(f.x/peak.x,(1.-f.x)/(1.-peak.x),f.y/peak.y,(1.-f.y)/(1.-peak.y)))/(vec4(1.)-slope*view.xxyy);
 float z=min(min(zs.x,zs.y),min(zs.z,zs.w));
 if(z<.005)return vec4(0.,0.,1.,-1.);
 vec3 n=zs.x==z?vec3(-slope.x,0.,1.):zs.y==z?vec3(-slope.y,0.,1.):zs.z==z?vec3(0.,-slope.z,1.):vec3(0.,-slope.w,1.);
 return vec4(normalize(n),z);
}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;
 p.y-=.035;
 vec3 bg=vec3(.035,.045,.08);
 vec2 view=vec2(.38,-.32);
 vec2 id=floor((p+vec2(.54,.31))/vec2(.18,.155));
 vec4 surface=cellHit(p,view,id);
 for(int i=1;i<4;i++){
  vec2 offset=i==1?vec2(1.,0.):i==2?vec2(0.,-1.):vec2(1.,-1.);
  vec4 candidate=cellHit(p,view,id+offset);
  if(candidate.w>surface.w)surface=candidate;
 }
 float z=surface.w;
 vec2 q=p+view*z;
 vec3 color=bg;
 if(z>=.005){
  vec3 n=surface.xyz;
  float angle=u_control*6.28318+u_time*.12;
  vec3 pointLight=vec3(cos(angle)*.75,sin(angle)*.68,.46);
  vec3 light=normalize(pointLight-vec3(q,z));
  vec3 eye=normalize(vec3(-view,1.));
  float diffuse=max(dot(n,light),0.);
  float spec=pow(max(dot(n,normalize(light+eye)),0.),40.);
  float ambient=.20+min(1.,z/.075)*.13;
  vec3 cobalt=vec3(.055,.15,.48);
  color=cobalt*(ambient+diffuse*1.45)+vec3(.58,.76,1.)*spec*.75;
  vec2 tile=(q+vec2(.54,.31))/vec2(.18,.155),f=fract(tile);
  float seam=min(min(f.x,f.y),min(1.-f.x,1.-f.y));
  color*=.65+.35*smoothstep(.0,.025,seam);
  float ribs=sin((q.x-q.y)*760.);
  color+=ribs*.006*diffuse;
  color+=(hash(gl_FragCoord.xy)-.5)*.008;
 }else{
  vec2 d=max(abs(p-vec2(.012,-.028))-vec2(.54,.31),0.);
  color*=1.-.25*exp(-length(d)*45.);
 }
 gl_FragColor=vec4(color,1.);
}
`

export default function FoldedPaperLightExample({ active = true }: { active?: boolean }) {
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
      className="sg-folded-paper-light"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        background: "#cfcbc3",
      }}
    >
      <div className="sg-folded-paper-light-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Raised ultramarine facets catch a moving light."
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      {available && (
        <label className="sg-folded-paper-light-control">
          <span>Light</span>
          <input
            type="range"
            disabled={!active}
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
          className="sg-folded-paper-light-pause"
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
.sg-folded-paper-light *{box-sizing:border-box}
.sg-folded-paper-light-fallback{position:absolute;inset:0;background:radial-gradient(ellipse at 38% 35%,#f3f0e055,transparent 55%),linear-gradient(145deg,#cfcbc3,#27313b)}
.sg-folded-paper-light-control{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:10px;padding:0 12px;min-height:44px;border-radius:22px;background:#101c40;color:#d1deff;font:11px/1.2 Arial,sans-serif;box-shadow:0 2px 8px #0002}
.sg-folded-paper-light-control input{width:164px;max-width:35vw;height:44px;margin:0;accent-color:#a3bafa;cursor:pointer}
.sg-folded-paper-light-pause{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;color:#d1deff;background:#101c40;box-shadow:0 2px 8px #0002;cursor:pointer}
.sg-folded-paper-light-pause:focus-visible,.sg-folded-paper-light-control input:focus-visible{outline:2px solid #386bd8;outline-offset:3px}
.sg-folded-paper-light-pause:disabled{opacity:.5;cursor:default}
      `}</style>
    </div>
  )
}
