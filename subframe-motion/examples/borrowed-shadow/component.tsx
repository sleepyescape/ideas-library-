"use client"

/**
 * MIT License
 * Copyright (c) 2026 Subframe
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions: The above copyright notice and this
 * permission notice shall be included in all copies or substantial portions of
 * the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

import { useEffect, useRef, useState } from "react"

export const DEFAULT_CONFIG = { lightSize: 0.18, blockerHeight: 0.3, lightAzimuth: -35 }
const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_size,u_height,u_angle,u_x,u_y;
float shape(vec2 p) {
  float upper=max(length(p-vec2(-.12,.27))-.55,-(length(p-vec2(.13,.40))-.46));
  float lower=max(length(p-vec2(.12,-.27))-.55,-(length(p-vec2(-.13,-.40))-.46));
  return min(upper,lower);
}
float grain(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y*2.8;
  vec2 center=vec2(u_x,u_y);
  float aa=2.8/u_resolution.y;
  vec2 lamp=vec2(sin(radians(u_angle))*2.3,1.9);
  float shadow=0.;
  for(int i=0;i<40;i++){
    float f=(float(i)+.5)/40.,a=float(i)*2.399963;
    vec2 source=lamp+u_size*2.1*vec2(cos(a),sin(a))*sqrt(f);
    vec2 hit=p+(source-p)*(u_height/2.7);
    shadow+=1.-smoothstep(-aa,aa,shape(hit-center));
  }
  shadow/=40.;
  vec3 paper=vec3(.86,.845,.80);
  float spot=exp(-dot(p-vec2(-.7,.9),p-vec2(-.7,.9))*.16);
  vec3 color=paper*(.82+.18*spot)*(1.-shadow*.66);
  vec2 q=p-center;
  float side=1.-smoothstep(-aa,aa,shape(q-vec2(.014,-.018)));
  color=mix(color,vec3(.16,.025,.009),side);
  float d=shape(q),object=1.-smoothstep(-aa,aa,d);
  float e=.0008;
  vec2 gradient=normalize(vec2(shape(q+vec2(e,0))-shape(q-vec2(e,0)),shape(q+vec2(0,e))-shape(q-vec2(0,e))));
  float bevel=exp(-abs(d)*180.);
  float rim=dot(gradient,normalize(lamp));
  vec3 enamel=vec3(.62,.041,.012)*(.88+.12*q.y)+bevel*max(rim,0.)*vec3(.30,.13,.06)-bevel*max(-rim,0.)*.06;
  float broad=exp(-pow((q.x*.3+q.y-.39)*3.,2.));
  enamel+=vec3(.08,.025,.012)*broad;
  color=mix(color,enamel,object);
  float wire=1.-smoothstep(.001,.0025,abs(p.x-(center.x-.29)));
  wire*=smoothstep(center.y+.77,center.y+.79,p.y);
  color=mix(color,vec3(.3,.28,.24),wire*.65);
  color+=(grain(gl_FragCoord.xy)-.5)/500.;
  gl_FragColor=vec4(pow(max(color,0.),vec3(1./2.2)),1.);
}
`

function bounded(value: number | undefined, fallback: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value as number)) : fallback
}

type PaintStep = (dt: number, reduced: boolean) => { image: HTMLCanvasElement; again: boolean }

function useSurface(uniforms: Record<string, number>, active: boolean, step?: PaintStep) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const live = useRef({ uniforms, active, step })
  const request = useRef<() => void>(() => {})
  const lease = useRef(0)
  const [available, setAvailable] = useState(false)
  live.current = { uniforms, active, step }
  useEffect(() => {
    const element = canvas.current
    if (!element) {
      return
    }
    const gl = element.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" })
    if (!gl) {
      return
    }
    const owner = ++lease.current
    const leaseRef = lease
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let texture: WebGLTexture | null = null
    let shaders: WebGLShader[] = []
    let locations: Record<string, WebGLUniformLocation | null> = {}
    let frame = 0
    let previous = 0
    let disposed = false
    let lost = false
    const media = matchMedia("(prefers-reduced-motion: reduce)")
    const clear = () => {
      if (program) {
        gl.deleteProgram(program)
      }
      if (buffer) {
        gl.deleteBuffer(buffer)
      }
      if (texture) {
        gl.deleteTexture(texture)
      }
      shaders.forEach((shader) => gl.deleteShader(shader))
      program = null
      buffer = null
      texture = null
      shaders = []
    }
    const draw = (now: number) => {
      frame = 0
      if (disposed || lost || !program) {
        return
      }
      const state = live.current
      const running = state.active && !document.hidden
      const dt = running && previous ? Math.min((now - previous) / 1000, 0.05) : 0
      previous = running ? now : 0
      const result = state.step?.(media.matches ? 0 : dt, media.matches)
      gl.useProgram(program)
      gl.uniform2f(locations.u_resolution, element.width, element.height)
      Object.entries(state.uniforms).forEach(([key, value]) => gl.uniform1f(locations[key], value))
      if (texture && result) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, result.image)
        gl.uniform1i(locations.u_mask, 0)
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (running && !media.matches && result?.again) {
        frame = requestAnimationFrame(draw)
      }
    }
    const wake = () => {
      cancelAnimationFrame(frame)
      previous = 0
      draw(performance.now())
    }
    const resize = () => {
      if (disposed || lost || !program) {
        return
      }
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) {
        return
      }
      const ratio = Math.min(devicePixelRatio || 1, 2, Math.sqrt(2400000 / (rect.width * rect.height)))
      const width = Math.max(1, Math.round(rect.width * ratio)),
        height = Math.max(1, Math.round(rect.height * ratio))
      if (element.width !== width || element.height !== height) {
        element.width = width
        element.height = height
      }
      gl.viewport(0, 0, width, height)
      wake()
    }
    const initialize = () => {
      clear()
      const compile = (kind: number, source: string) => {
        const shader = gl.createShader(kind)
        if (!shader) {
          return null
        }
        shaders.push(shader)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
      }
      const vertex = compile(gl.VERTEX_SHADER, "attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}")
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT)
      program = gl.createProgram()
      buffer = gl.createBuffer()
      if (!vertex || !fragment || !program || !buffer) {
        clear()
        setAvailable(false)
        return
      }
      gl.attachShader(program, vertex)
      gl.attachShader(program, fragment)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        clear()
        setAvailable(false)
        return
      }
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
      const position = gl.getAttribLocation(program, "position")
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
      for (const name of ["u_resolution", "u_mask", ...Object.keys(live.current.uniforms)]) {
        locations[name] = gl.getUniformLocation(program, name)
      }
      if (live.current.step) {
        texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      }
      resize()
      setAvailable(true)
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      lost = true
      cancelAnimationFrame(frame)
      program = null
      buffer = null
      texture = null
      shaders = []
      setAvailable(false)
    }
    const contextRestored = () => {
      lost = false
      initialize()
    }
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        previous = 0
      } else {
        wake()
      }
    }
    const observer = new ResizeObserver(resize)
    const transforms = new MutationObserver(resize)
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      observer.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    element.addEventListener("webglcontextlost", contextLost)
    element.addEventListener("webglcontextrestored", contextRestored)
    document.addEventListener("visibilitychange", visibility)
    media.addEventListener("change", wake)
    window.addEventListener("resize", resize)
    request.current = wake
    initialize()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      request.current = () => {}
      observer.disconnect()
      transforms.disconnect()
      element.removeEventListener("webglcontextlost", contextLost)
      element.removeEventListener("webglcontextrestored", contextRestored)
      document.removeEventListener("visibilitychange", visibility)
      media.removeEventListener("change", wake)
      window.removeEventListener("resize", resize)
      clear()
      queueMicrotask(() => {
        if (leaseRef.current === owner) {
          gl.getExtension("WEBGL_lose_context")?.loseContext()
        }
      })
    }
  }, [])
  useEffect(() => {
    request.current()
  }, [uniforms, active, step])
  return { canvas, available, invalidate: () => request.current() }
}

export default function BorrowedShadow({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<typeof DEFAULT_CONFIG>
}) {
  const [position, setPosition] = useState({ x: -0.26, y: 0.18 })
  const pointer = useRef<{ id: number; x: number; y: number; startX: number; startY: number } | null>(null)
  useEffect(() => {
    if (!active) {
      pointer.current = null
    }
  }, [active])
  const { canvas, available } = useSurface(
    {
      u_size: bounded(config?.lightSize, 0.18, 0.02, 0.5),
      u_height: bounded(config?.blockerHeight, 0.3, 0.05, 0.8),
      u_angle: bounded(config?.lightAzimuth, -35, -80, 80),
      u_x: position.x,
      u_y: position.y,
    },
    active,
  )
  const place = (x: number, y: number) =>
    setPosition({ x: Math.max(-0.9, Math.min(0.85, x)), y: Math.max(-0.28, Math.min(0.43, y)) })
  return (
    <section className="sf-borrowed" aria-label="Suspended cutout and its shadow">
      <canvas ref={canvas} aria-hidden="true" />
      {!available && (
        <div className="sf-borrowed-fallback">
          <span>Shadow study requires WebGL.</span>
        </div>
      )}
      <div
        className="sf-borrowed-position"
        style={{ transform: `translate(${(position.x / 2.8) * 62.5}%, ${-(position.y / 2.8) * 100}%)` }}
      >
        <button
          className="sf-borrowed-object"
          aria-label="Move suspended cutout. Drag or use arrow keys."
          disabled={!active || !available}
          onPointerDown={(event) => {
            if (event.button !== 0) {
              return
            }
            pointer.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              startX: position.x,
              startY: position.y,
            }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            const drag = pointer.current,
              rect = canvas.current?.getBoundingClientRect()
            if (!drag || drag.id !== event.pointerId || !rect) {
              return
            }
            place(
              drag.startX + ((event.clientX - drag.x) / rect.height) * 2.8,
              drag.startY - ((event.clientY - drag.y) / rect.height) * 2.8,
            )
          }}
          onPointerUp={() => {
            pointer.current = null
          }}
          onPointerCancel={() => {
            pointer.current = null
          }}
          onLostPointerCapture={() => {
            pointer.current = null
          }}
          onKeyDown={(event) => {
            const delta = event.shiftKey ? 0.12 : 0.035
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) {
              return
            }
            event.preventDefault()
            if (event.key === "Home") {
              place(-0.26, 0.18)
            } else {
              place(
                position.x + (event.key === "ArrowLeft" ? -delta : event.key === "ArrowRight" ? delta : 0),
                position.y + (event.key === "ArrowUp" ? delta : event.key === "ArrowDown" ? -delta : 0),
              )
            }
          }}
        />
      </div>
      <span className="sf-borrowed-hint" aria-hidden="true">
        Move the cutout
      </span>
      <style>{`
      .sf-borrowed{position:relative;width:100%;height:100%;overflow:hidden;background:#e9e6dc;font-family:Arial,sans-serif}
      .sf-borrowed canvas{width:100%;height:100%;display:block}
      .sf-borrowed-position{position:absolute;inset:0;pointer-events:none}
      .sf-borrowed-object{position:absolute;left:50%;top:50%;width:32%;height:60%;transform:translate(-50%,-50%);border:0;border-radius:50%;background:transparent;cursor:grab;touch-action:none;pointer-events:auto;-webkit-tap-highlight-color:transparent}
      .sf-borrowed-object:active{cursor:grabbing}.sf-borrowed-object:focus-visible{outline:2px solid #252320;outline-offset:9px}
      .sf-borrowed-hint{position:absolute;bottom:25px;left:28px;color:#706a5f;font-size:11px;letter-spacing:.02em;pointer-events:none}
      .sf-borrowed-fallback{position:absolute;inset:0;display:grid;place-items:center;color:#575045;font-size:12px;background:radial-gradient(circle at 47% 45%,#b44025 0 20%,transparent 21%),#e9e6dc}
    `}</style>
    </section>
  )
}
