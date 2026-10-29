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

export const DEFAULT_CONFIG = { brushRadius: 0.12, dryRoughness: 0.85, wetRoughness: 0.12, dryingTime: 12 }
const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform sampler2D u_mask;
uniform float u_dry,u_wet;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float relief(vec2 p){
  vec2 q=vec2(p.x*.8+p.y*.38,p.y*1.3);
  float coarse=noise(q*5.3)*.09+noise(q*15.7)*.037;
  float grain=noise(q*vec2(51.,83.))*.015+noise(q*vec2(137.,221.))*.006;
  float bend=noise(q*5.1)*.13+noise(q*13.7)*.025;
  float fracture=min(abs(q.y+.77*q.x+bend-.43),min(abs(q.y+.57*q.x+bend+.20),abs(q.y+.82*q.x+bend+.89)));
  float cleft=exp(-fracture*190.)*.035;
  return coarse+grain-cleft;
}
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){
  vec2 screen=gl_FragCoord.xy/u_resolution;
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y*2.7;
  vec2 p=uv;
  float d=box(p,vec2(1.58,1.02),.025),aa=3./u_resolution.y;
  vec3 color=vec3(.012,.021,.017);
  float sh=box(p-vec2(.035,-.045),vec2(1.6,1.02),.035);
  color*=1.-.65*exp(-max(sh,0.)*38.);
  float side=1.-smoothstep(-aa,aa,box(p-vec2(.012,-.026),vec2(1.58,1.02),.025));
  color=mix(color,vec3(.025,.027,.027),side);
  float h=relief(p),e=.0025;
  vec2 slope=vec2(relief(p+vec2(e,0))-relief(p-vec2(e,0)),relief(p+vec2(0,e))-relief(p-vec2(0,e)))/(2.*e);
  vec3 normal=normalize(vec3(-slope*.10,1.));
  vec2 brushUv=vec2(screen.x,1.-screen.y)+vec2(noise(p*23.)-.5,noise(p*29.+7.)-.5)*.0045;
  float wet=texture2D(u_mask,brushUv).a;
  wet=clamp(wet+(.5-noise(p*94.))*.055,0.,1.);
  float wetness=smoothstep(.06,.85,wet);
  float diffuse=max(dot(normal,normalize(vec3(-.2,.8,1.))),0.);
  vec3 mineral=vec3(.024,.078,.051)*(.65+3.2*h)*(.35+.7*diffuse);
  float veinDistance=min(abs(p.y+.7*p.x+noise(p*7.)*.16-.52),abs(p.x-.31*p.y+noise(p*9.)*.11-.6));
  float veins=exp(-veinDistance*210.)*(.3+.7*noise(p*21.));
  mineral+=vec3(.09,.11,.09)*veins;
  mineral*=mix(1.,.43,wetness);
  float line=p.x*.72-p.y*.45+.04;
  float dryWidth=.18+u_dry*.62;
  float dryLight=exp(-pow((line+normal.x*.13)/dryWidth,2.))*.022/u_dry;
  mineral+=vec3(.87,.92,.97)*dryLight*(1.-wetness*.75);
  float coatWidth=.014+u_wet*.23;
  float coatLine=line+normal.x*.008;
  float coat=exp(-pow(coatLine/coatWidth,2.));
  float broad=exp(-pow((coatLine-.055)/(.08+u_wet*.6),2.));
  float fresnel=.25+.2*(1.-abs(normal.z));
  mineral+=vec3(.83,.91,1.)*wetness*(coat*(1.2-u_wet*1.5)+broad*.15)*fresnel*2.4;
  float bevel=exp(-abs(d)*190.);
  mineral+=vec3(.045)*bevel*(.4+.6*step(0.,p.y));
  color=mix(color,mineral,1.-smoothstep(-aa,aa,d));
  color+=(hash(gl_FragCoord.xy)-.5)/1000.;
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

export default function WetFinish({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<typeof DEFAULT_CONFIG>
}) {
  const mask = useRef<HTMLCanvasElement | null>(null)
  const life = useRef(0)
  const last = useRef<{ x: number; y: number; id: number } | null>(null)
  const [cursor, setCursor] = useState({ x: 0.52, y: 0.49 })
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (!active) {
      last.current = null
    }
  }, [active])
  const radius = bounded(config?.brushRadius, 0.12, 0.03, 0.25)
  const dryingTime = bounded(config?.dryingTime, 12, 2, 30)
  const ensureMask = () => {
    if (!mask.current) {
      mask.current = document.createElement("canvas")
      mask.current.width = 600
      mask.current.height = 375
      const context = mask.current.getContext("2d")
      if (context) {
        context.lineCap = "round"
        context.lineWidth = 84
        context.strokeStyle = "#fff"
        context.shadowColor = "#fff"
        context.shadowBlur = 3
        context.beginPath()
        context.moveTo(135, 232)
        context.bezierCurveTo(230, 190, 288, 154, 410, 127)
        context.stroke()
      }
      life.current = 1
    }
    return mask.current
  }
  const step: PaintStep = (dt) => {
    const image = ensureMask(),
      context = image.getContext("2d")
    if (context && dt > 0 && life.current > 0 && !last.current) {
      context.shadowBlur = 0
      context.globalCompositeOperation = "destination-out"
      context.fillStyle = `rgba(0,0,0,${1 - Math.exp((-dt * 3) / dryingTime)})`
      context.fillRect(0, 0, 600, 375)
      context.globalCompositeOperation = "source-over"
      life.current = Math.max(0, life.current - dt / dryingTime)
      if (!life.current) {
        context.clearRect(0, 0, 600, 375)
      }
    }
    return { image, again: life.current > 0 }
  }
  const { canvas, available, invalidate } = useSurface(
    { u_dry: bounded(config?.dryRoughness, 0.85, 0.5, 1), u_wet: bounded(config?.wetRoughness, 0.12, 0.02, 0.4) },
    active,
    step,
  )
  const paint = (x: number, y: number, from?: { x: number; y: number }) => {
    const context = ensureMask().getContext("2d")
    if (!context) {
      return
    }
    const r = radius * 375
    context.globalCompositeOperation = "source-over"
    context.strokeStyle = "#fff"
    context.fillStyle = "#fff"
    context.lineWidth = r * 2
    context.lineCap = "round"
    context.shadowColor = "#fff"
    context.shadowBlur = 2
    context.beginPath()
    context.moveTo((from?.x ?? x) * 600, (from?.y ?? y) * 375)
    context.lineTo(x * 600, y * 375)
    context.stroke()
    context.beginPath()
    context.arc(x * 600, y * 375, r, 0, Math.PI * 2)
    context.fill()
    life.current = 1
    invalidate()
  }
  const point = (event: { clientX: number; clientY: number }) => {
    const rect = canvas.current?.getBoundingClientRect()
    return rect
      ? {
          x: Math.max(0.12, Math.min(0.88, (event.clientX - rect.left) / rect.width)),
          y: Math.max(0.12, Math.min(0.88, (event.clientY - rect.top) / rect.height)),
        }
      : cursor
  }
  return (
    <section className="sf-wet" aria-label="Brush water onto green stone">
      <canvas ref={canvas} aria-hidden="true" />
      {!available && <div className="sf-wet-fallback">Interactive material requires WebGL.</div>}
      <button
        className="sf-wet-surface"
        aria-label="Wet the stone. Drag to paint; arrow keys move the brush, Space paints."
        disabled={!active || !available}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return
          }
          const p = point(event)
          setCursor(p)
          last.current = { ...p, id: event.pointerId }
          paint(p.x, p.y)
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!active || !available) {
            return
          }
          const p = point(event)
          setCursor(p)
          if (last.current?.id === event.pointerId) {
            paint(p.x, p.y, last.current)
            last.current = { ...p, id: event.pointerId }
          }
        }}
        onPointerUp={() => {
          last.current = null
          invalidate()
        }}
        onPointerCancel={() => {
          last.current = null
          invalidate()
        }}
        onLostPointerCapture={() => {
          last.current = null
        }}
        onKeyDown={(event) => {
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter", "Home"].includes(event.key)) {
            event.preventDefault()
          } else {
            return
          }
          if (event.key === " " || event.key === "Enter") {
            paint(cursor.x, cursor.y)
            return
          }
          setCursor(
            event.key === "Home"
              ? { x: 0.52, y: 0.49 }
              : {
                  x: Math.max(
                    0.12,
                    Math.min(
                      0.88,
                      cursor.x + (event.key === "ArrowLeft" ? -0.035 : event.key === "ArrowRight" ? 0.035 : 0),
                    ),
                  ),
                  y: Math.max(
                    0.12,
                    Math.min(
                      0.88,
                      cursor.y + (event.key === "ArrowUp" ? -0.035 : event.key === "ArrowDown" ? 0.035 : 0),
                    ),
                  ),
                },
          )
        }}
      >
        <span
          className="sf-wet-brush-position"
          style={{ transform: `translate(${cursor.x * 100}%, ${cursor.y * 100}%)` }}
          aria-hidden="true"
        >
          <span
            className="sf-wet-brush"
            style={{
              width: `${radius * 125}%`,
              height: `${radius * 200}%`,
              opacity: focused ? 1 : undefined,
            }}
          />
        </span>
      </button>
      <div className="sf-wet-footer">
        <span>Brush to wet</span>
        <button
          onClick={() => {
            ensureMask().getContext("2d")?.clearRect(0, 0, 600, 375)
            life.current = 0
            invalidate()
          }}
          disabled={!active || !available}
        >
          Dry surface
        </button>
      </div>
      <style>{`
      .sf-wet{position:relative;width:100%;height:100%;overflow:hidden;background:#24372e;color:#c6c8c2;container-type:inline-size;font-family:Arial,sans-serif}
      .sf-wet canvas{width:100%;height:100%;display:block}.sf-wet-surface{position:absolute;inset:0;width:100%;height:100%;padding:0;border:0;background:transparent;cursor:crosshair;touch-action:none;-webkit-tap-highlight-color:transparent}
      .sf-wet-surface:focus-visible{outline:2px solid #dfed80;outline-offset:-8px}.sf-wet-brush-position{position:absolute;inset:0;pointer-events:none}.sf-wet-brush{position:absolute;left:0;top:0;transform:translate(-50%,-50%);border:1px solid #fff8;border-radius:50%;box-shadow:0 0 0 1px #0005;pointer-events:none;opacity:0}
      @media(hover:hover){.sf-wet-surface:hover .sf-wet-brush{opacity:1}}
      .sf-wet-footer{position:absolute;bottom:23px;left:25px;right:25px;display:flex;align-items:center;justify-content:space-between;font-size:11px;pointer-events:none}
      .sf-wet-footer button{display:flex;gap:12px;align-items:center;border:1px solid #ffffff16;background:#1b1d1b;padding:8px 10px;color:#dce4b0;border-radius:3px;pointer-events:auto;cursor:pointer}.sf-wet-footer button:active{background:#30342b}.sf-wet-footer button:focus-visible{outline:2px solid #dfed80;outline-offset:3px}
      @container(max-width:450px){.sf-wet-footer{bottom:12px;left:16px;right:16px;font-size:10px}.sf-wet-footer button{padding:6px 9px;line-height:12px}}
      .sf-wet-fallback{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(130deg,#282c2c,#080a0a 60%,#434745);font-size:12px}
    `}</style>
    </section>
  )
}
