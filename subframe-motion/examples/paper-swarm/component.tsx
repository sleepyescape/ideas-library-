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

const vertexSource = `#version 300 es
precision highp float;
in vec2 corner;
in vec4 sheet;
uniform float time;
uniform float aspect;
uniform vec2 camera;
out vec2 uv;
out float edition;
out float depth;
void main(){
  float seed=sheet.w;
  float angle=seed*6.283+time*(.16+seed*.22);
  vec3 point=vec3(corner.x*cos(angle),corner.y,corner.x*sin(angle))*(.42+seed*.55);
  float roll=sin(seed*24.+time*.13)*.7;
  point.xy=mat2(cos(roll),-sin(roll),sin(roll),cos(roll))*point.xy;
  point+=vec3(sheet.x,mod(sheet.y+time*(.22+seed*.34)+8.,16.)-8.,sheet.z);
  point.xz=mat2(cos(camera.x),-sin(camera.x),sin(camera.x),cos(camera.x))*point.xz;
  point.yz=mat2(cos(camera.y),-sin(camera.y),sin(camera.y),cos(camera.y))*point.yz;
  float distance=point.z+11.;
  gl_Position=vec4(point.x*1.55/aspect,point.y*1.55,(distance-1.)/18.*2.-1.,distance);
  uv=corner+vec2(.5,.7);uv/=vec2(1.,1.4);edition=seed;depth=clamp((distance-6.)/10.,0.,1.);
}`

const fragmentSource = `#version 300 es
precision highp float;
in vec2 uv;
in float edition;
in float depth;
out vec4 color;
void main(){
  vec3 paper=mix(vec3(.98,.30,.07),vec3(.94,.96,.98),step(.52,edition));
  vec3 ink=vec3(.035,.08,.20);
  float margin=step(.12,uv.x)*step(uv.x,.88);
  float lines=step(.68,fract(uv.y*24.))*step(.12,uv.y)*step(uv.y,.42)*margin;
  float title=step(.61,uv.y)*step(uv.y,.83)*margin;
  float cut=step(.32,uv.x)*step(uv.x,.46);
  title*=1.-cut;
  float fold=smoothstep(.38,.5,uv.x)*.10-smoothstep(.5,.62,uv.x)*.10;
  vec3 paint=mix(paper,ink,max(lines,title));
  paint*=1.-fold;
  color=vec4(mix(paint,vec3(.025,.11,.37),depth*.50),1.);
}`

export default function PaperSwarm({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const phase = useRef(9)
  const control = useRef({ active, reduced: true, speed: 1, count: 150, x: 0, y: 0 })
  const wake = useRef<() => void>(() => {})
  const [reduced, setReduced] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [failed, setFailed] = useState(false)
  const id = useId()

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    control.current = { ...control.current, active, reduced, speed }
    wake.current()
  }, [active, reduced, speed])

  useEffect(() => {
    const element = canvas.current
    const gl = element?.getContext("webgl2", { alpha: false, antialias: true })
    if (!element || !gl) {
      setFailed(true)
      return
    }
    const shaders: WebGLShader[] = []
    const buffers: WebGLBuffer[] = []
    let program: WebGLProgram | null = null
    let vao: WebGLVertexArrayObject | null = null
    let frame = 0,
      last = 0,
      stopped = false
    function cleanup() {
      stopped = true
      cancelAnimationFrame(frame)
      for (const buffer of buffers) {
        gl!.deleteBuffer(buffer)
      }
      for (const shader of shaders) {
        gl!.deleteShader(shader)
      }
      if (program) {
        gl!.deleteProgram(program)
      }
      if (vao) {
        gl!.deleteVertexArray(vao)
      }
    }
    try {
      const compile = (kind: number, source: string) => {
        const shader = gl.createShader(kind)
        if (!shader) {
          throw new Error("No shader")
        }
        shaders.push(shader)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw new Error("Shader unavailable")
        }
        return shader
      }
      program = gl.createProgram()
      if (!program) {
        throw new Error("No program")
      }
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("No link")
      }
      gl.useProgram(program)
      vao = gl.createVertexArray()
      gl.bindVertexArray(vao)
      const attribute = (name: string, data: Float32Array, size: number, divisor: number) => {
        const buffer = gl.createBuffer()
        if (!buffer) {
          throw new Error("No buffer")
        }
        buffers.push(buffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
        const location = gl.getAttribLocation(program!, name)
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
        gl.vertexAttribDivisor(location, divisor)
      }
      attribute("corner", new Float32Array([-0.5, -0.7, 0.5, -0.7, -0.5, 0.7, -0.5, 0.7, 0.5, -0.7, 0.5, 0.7]), 2, 0)
      const sheets = new Float32Array(150 * 4)
      let seed = 31
      const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0
        return seed / 4294967296
      }
      for (let i = 0; i < 150; i++) {
        sheets.set([(random() - 0.5) * 21, (random() - 0.5) * 16, (random() - 0.5) * 9, random()], i * 4)
      }
      attribute("sheet", sheets, 4, 1)
      const timeUniform = gl.getUniformLocation(program, "time")
      const aspectUniform = gl.getUniformLocation(program, "aspect")
      const cameraUniform = gl.getUniformLocation(program, "camera")
      gl.enable(gl.DEPTH_TEST)
      gl.clearColor(0.025, 0.11, 0.37, 1)
      let cameraX = 0,
        cameraY = 0
      const render = (now: number) => {
        frame = 0
        if (stopped || gl.isContextLost()) {
          return
        }
        const state = control.current
        const playing = state.active && !state.reduced && !document.hidden
        const dt = last ? Math.min((now - last) / 1000, 0.04) : 0
        last = playing ? now : 0
        if (playing) {
          phase.current += dt * state.speed
          const ease = 1 - Math.exp(-7 * dt)
          cameraX += (state.x - cameraX) * ease
          cameraY += (state.y - cameraY) * ease
        }
        gl.viewport(0, 0, element.width, element.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniform1f(timeUniform, phase.current)
        gl.uniform1f(aspectUniform, element.width / element.height)
        gl.uniform2f(cameraUniform, cameraX, cameraY)
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, state.count)
        if (playing && state.speed !== 0) {
          frame = requestAnimationFrame(render)
        }
      }
      const request = () => {
        if (!frame && !stopped) {
          frame = requestAnimationFrame(render)
        }
      }
      wake.current = request
      const resize = () => {
        const rect = element.getBoundingClientRect()
        const ratio = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3600000 / Math.max(1, rect.width * rect.height)))
        const nextWidth = Math.max(1, Math.round(rect.width * ratio))
        const nextHeight = Math.max(1, Math.round(rect.height * ratio))
        if (element.width !== nextWidth || element.height !== nextHeight) {
          element.width = nextWidth
          element.height = nextHeight
        }
        request()
      }
      const observer = new ResizeObserver(resize)
      const transforms = new MutationObserver(resize)
      for (let node: HTMLElement | null = element; node; node = node.parentElement) {
        observer.observe(node)
        transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
      }
      window.addEventListener("resize", resize)
      const lost = (event: Event) => {
        event.preventDefault()
        cancelAnimationFrame(frame)
        frame = 0
        setFailed(true)
      }
      element.addEventListener("webglcontextlost", lost)
      document.addEventListener("visibilitychange", request)
      resize()
      return () => {
        wake.current = () => {}
        observer.disconnect()
        transforms.disconnect()
        window.removeEventListener("resize", resize)
        document.removeEventListener("visibilitychange", request)
        element.removeEventListener("webglcontextlost", lost)
        cleanup()
      }
    } catch {
      cleanup()
      setFailed(true)
    }
  }, [])

  return (
    <section
      className="sf-paper-swarm"
      aria-label="Floating printed sheets"
      onPointerMove={(event) => {
        if (!active || reduced || event.pointerType === "touch") {
          return
        }
        const bounds = event.currentTarget.getBoundingClientRect()
        control.current.x = ((event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 0.48
        control.current.y = ((event.clientY - bounds.top - bounds.height / 2) / bounds.height) * 0.24
        wake.current()
      }}
      onPointerLeave={() => {
        control.current.x = 0
        control.current.y = 0
        wake.current()
      }}
    >
      <canvas
        ref={canvas}
        role="img"
        aria-label="Orange and silver printed sheets rotating through a blue volume"
        style={{ visibility: failed ? "hidden" : "visible" }}
      />
      {failed && (
        <div className="ps-fallback" aria-label="Static paper composition">
          {Array.from({ length: 12 }, (_, i) => (
            <i
              key={i}
              style={{ left: `${(i * 31) % 91}%`, top: `${(i * 19) % 75}%`, transform: `rotate(${i * 37}deg)` }}
            />
          ))}
        </div>
      )}
      <label htmlFor={`${id}-flow`}>
        Flow{" "}
        <input
          id={`${id}-flow`}
          type="range"
          min="-2"
          max="2"
          step=".1"
          value={speed}
          onChange={(event) => setSpeed(+event.target.value)}
        />
        <output htmlFor={`${id}-flow`}>{speed.toFixed(1)}×</output>
      </label>
      <style>{`.sf-paper-swarm{position:relative;width:100%;height:100%;min-height:280px;overflow:hidden;isolation:isolate;background:#061c5e;color:white;font:11px Arial,sans-serif;box-sizing:border-box}.sf-paper-swarm *{box-sizing:border-box}.sf-paper-swarm canvas{display:block;width:100%;height:100%}.sf-paper-swarm label{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:14px;width:min(250px,80%);height:44px;padding:0 14px;background:#031642d9;border:1px solid #eff6ff35;backdrop-filter:blur(8px)}.sf-paper-swarm input{min-width:0;width:100%;height:44px;accent-color:#ff6535}.sf-paper-swarm output{flex:none;font:10px monospace;min-width:32px;text-align:right;font-variant-numeric:tabular-nums}.sf-paper-swarm input:focus-visible{outline:2px solid white;outline-offset:3px}.sf-paper-swarm .ps-fallback{position:absolute;inset:0}.sf-paper-swarm .ps-fallback i{position:absolute;width:46px;height:65px;background:repeating-linear-gradient(0deg,#eaeef3 0 4px,#1d294d 4px 5px);border:8px solid #eaeef3}.sf-paper-swarm .ps-fallback i:nth-child(2n){background:#fc6c26;border-color:#fc6c26}`}</style>
    </section>
  )
}
