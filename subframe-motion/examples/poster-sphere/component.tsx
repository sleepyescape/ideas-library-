"use client"

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
import { useEffect, useRef, useState } from "react"

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_ink;
void main(){
 vec2 p=(gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);
 p.y-=.025;
 vec3 ground=vec3(.84,.889,.929);
 float shadow=exp(-dot(vec2(p.x*2.6,(p.y+.362)*15.0),vec2(p.x*2.6,(p.y+.362)*15.0))*3.0);
 ground*=1.0-shadow*.22;
 float r=.365,dist=length(p),aa=1.2/min(u_resolution.x,u_resolution.y);
 float mask=1.0-smoothstep(r-aa,r+aa,dist);
 vec2 xy=p/r;
 vec3 n=vec3(xy,sqrt(max(0.,1.-dot(xy,xy))));
 vec3 v=n;
 float turn=u_time*.15+u_pointer.x, tilt=u_pointer.y;
 v.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*v.xz;
 v.yz=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*v.yz;
 float engrave=(v.y+.21*sin(v.x*3.7+v.z*2.2))*(14.+u_ink*25.);
 float seam=abs(fract(engrave)-.5);
 float edge=EDGE(engrave)*.7;
 float silver=1.-smoothstep(.115-edge,.115+edge,seam);
 vec3 light=normalize(vec3(-.65,.8,1.4));
 float diffuse=max(0.,dot(n,light));
 float spec=pow(max(0.,dot(reflect(-light,n),vec3(0,0,1))),45.);
 float sky=pow(max(0.,n.y*.6+n.z*.8),4.);
 vec3 enamel=vec3(.008,.035,.085)+vec3(.016,.045,.115)*diffuse+vec3(.035,.07,.12)*sky;
 vec3 metal=mix(vec3(.18,.31,.46),vec3(.79,.9,.96),diffuse)*(.65+.35*n.z);
 vec3 color=mix(enamel,metal,silver);
 color+=vec3(.75,.85,.92)*spec*.72;
 float edgeLight=pow(1.-n.z,5.0)*(.3+.7*max(0.,-n.x));
 color+=vec3(.3,.54,.71)*edgeLight*.4;
 color=mix(color,vec3(.75,.84,.89),pow(max(0.,-n.y),8.)*.12);
 gl_FragColor=vec4(mix(ground,color,mask),1.);
}`

export default function EngravedOrbit({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    pointer = useRef({ x: 0.35, y: 0.45 }),
    time = useRef(0),
    control = useRef(0.5)
  const draw = useRef<() => void>(() => {})
  const drag = useRef<{
    id: number
    x: number
    y: number
    before: { x: number; y: number }
    width: number
    target: HTMLCanvasElement
  } | null>(null)
  const [ink, setInk] = useState(0.5),
    [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(true),
    [available, setAvailable] = useState(false),
    [version, setVersion] = useState(0)
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  const running = useRef(false)
  running.current = active && !paused && !reduced
  useEffect(() => {
    const el = canvas.current,
      gl = el?.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" })
    if (!el || !gl) {
      return
    }
    let frame = 0,
      previous = 0,
      lost = false
    const shaders: WebGLShader[] = []
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) {
        return null
      }
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
    }
    const vertex = compile(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"),
      fragment = compile(
        gl.FRAGMENT_SHADER,
        (gl.getExtension("OES_standard_derivatives")
          ? "#extension GL_OES_standard_derivatives : enable\n#define EDGE(v) max(fwidth(v),0.0001)\n"
          : "#define EDGE(v) (1.4/min(u_resolution.x,u_resolution.y))\n") + FRAGMENT,
      ),
      program = gl.createProgram(),
      buffer = gl.createBuffer()
    if (!vertex || !fragment || !program || !buffer) {
      shaders.forEach((s) => gl.deleteShader(s))
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach((s) => gl.deleteShader(s))
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
      return
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "a")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, "u_resolution"),
      location = gl.getUniformLocation(program, "u_pointer"),
      clock = gl.getUniformLocation(program, "u_time"),
      inks = gl.getUniformLocation(program, "u_ink")
    const paint = () => {
      if (lost) {
        return
      }
      gl.viewport(0, 0, el.width, el.height)
      gl.uniform2f(resolution, el.width, el.height)
      gl.uniform2f(location, pointer.current.x, pointer.current.y)
      gl.uniform1f(clock, time.current)
      gl.uniform1f(inks, control.current)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const tick = (now: number) => {
      if (lost) {
        return
      }
      if (previous && running.current && !document.hidden) {
        time.current += Math.min(50, now - previous) / 1000
      }
      previous = now
      paint()
      if (running.current && !document.hidden) {
        frame = requestAnimationFrame(tick)
      } else {
        frame = 0
      }
    }
    draw.current = () => {
      cancelAnimationFrame(frame)
      previous = 0
      paint()
      frame = running.current && !document.hidden ? requestAnimationFrame(tick) : 0
    }
    const resize = () => {
      const r = el.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3600000 / Math.max(1, r.width * r.height)))
      const nextWidth = Math.max(1, Math.round(r.width * dpr))
      const nextHeight = Math.max(1, Math.round(r.height * dpr))
      if (el.width !== nextWidth || el.height !== nextHeight) {
        el.width = nextWidth
        el.height = nextHeight
      }
      draw.current()
    }
    const contextLost = (e: Event) => {
      e.preventDefault()
      lost = true
      cancelAnimationFrame(frame)
      setAvailable(false)
    }
    const restore = () => setVersion((v) => v + 1)
    el.addEventListener("webglcontextlost", contextLost)
    el.addEventListener("webglcontextrestored", restore)
    const observer = new ResizeObserver(resize)
    const transforms = new MutationObserver(resize)
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
      observer.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", resize)
    const visibility = () => draw.current()
    document.addEventListener("visibilitychange", visibility)
    resize()
    setAvailable(true)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", visibility)
      el.removeEventListener("webglcontextlost", contextLost)
      el.removeEventListener("webglcontextrestored", restore)
      draw.current = () => {}
      shaders.forEach((s) => gl.deleteShader(s))
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [version])
  useEffect(() => {
    if (!active && drag.current) {
      const d = drag.current
      drag.current = null
      pointer.current = { ...d.before }
      if (d.target.hasPointerCapture(d.id)) {
        d.target.releasePointerCapture(d.id)
      }
    }
    draw.current()
  }, [active, paused, reduced])
  const cancelDrag = () => {
    const d = drag.current
    if (!d) {
      return
    }
    drag.current = null
    pointer.current = { ...d.before }
    draw.current()
    if (d.target.hasPointerCapture(d.id)) {
      d.target.releasePointerCapture(d.id)
    }
  }
  return (
    <section className="sf-poster-sphere">
      <canvas
        ref={canvas}
        role="img"
        tabIndex={0}
        aria-label="Engraved sphere. Drag or use arrow keys to rotate."
        onPointerDown={(e) => {
          if (e.button !== 0 || !active) {
            return
          }
          setPaused(true)
          drag.current = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            before: { ...pointer.current },
            width: e.currentTarget.getBoundingClientRect().width,
            target: e.currentTarget,
          }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (d?.id !== e.pointerId) {
            return
          }
          pointer.current = {
            x: d.before.x + ((e.clientX - d.x) / d.width) * 5,
            y: d.before.y + ((e.clientY - d.y) / d.width) * 5,
          }
          draw.current()
        }}
        onPointerUp={(e) => {
          if (drag.current?.id !== e.pointerId) {
            return
          }
          drag.current = null
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
          }
        }}
        onPointerCancel={cancelDrag}
        onLostPointerCapture={cancelDrag}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            cancelDrag()
            return
          }
          const axis =
            e.key === "ArrowLeft" || e.key === "ArrowRight"
              ? "x"
              : e.key === "ArrowUp" || e.key === "ArrowDown"
              ? "y"
              : null
          if (!axis || !active) {
            return
          }
          e.preventDefault()
          setPaused(true)
          pointer.current[axis] += e.key === "ArrowRight" || e.key === "ArrowDown" ? 0.2 : -0.2
          draw.current()
        }}
      />
      {!available && <span className="sf-ps-fallback">WebGL unavailable</span>}
      <div className="sf-ps-footer">
        <button type="button" disabled={!active || reduced} onClick={() => setPaused((v) => !v)} aria-pressed={!paused}>
          {paused ? "Rotate" : "Pause"}
          <span aria-hidden="true">{paused ? "↻" : "Ⅱ"}</span>
        </button>
        <label>
          Pitch
          <input
            type="range"
            disabled={!active}
            aria-label="Engraving pitch"
            min="0"
            max="1"
            step=".01"
            value={ink}
            onChange={(e) => {
              control.current = +e.target.value
              setInk(control.current)
              draw.current()
            }}
          />
        </label>
      </div>
      <style>{`.sf-poster-sphere{position:relative;width:100%;height:100%;min-height:0;overflow:hidden;background:#d6e3ed;color:#19374c;font-family:Arial,sans-serif}.sf-poster-sphere *{box-sizing:border-box}.sf-poster-sphere canvas{width:100%;height:100%;display:block;outline-offset:-7px;cursor:grab;touch-action:none}.sf-ps-footer{position:absolute;left:24px;right:24px;bottom:14px;display:flex;align-items:center;justify-content:space-between}.sf-poster-sphere canvas:active{cursor:grabbing}.sf-ps-footer button:disabled{opacity:.4;cursor:default}.sf-ps-footer button{display:flex;align-items:center;justify-content:space-between;gap:28px;min-height:44px;background:transparent;border:0;color:inherit;font:11px Arial;cursor:pointer;padding:0}.sf-ps-footer label{display:flex;align-items:center;gap:15px;font:10px Arial}.sf-ps-footer input{width:95px;height:44px;accent-color:#244c6a}.sf-poster-sphere :focus-visible{outline:2px solid #244c6a;outline-offset:3px}.sf-poster-sphere canvas:focus-visible{outline-offset:-7px}.sf-ps-fallback{position:absolute;inset:0;display:grid;place-items:center;font-size:12px}`}</style>
    </section>
  )
}
