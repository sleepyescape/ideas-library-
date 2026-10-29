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

export const DEFAULT_CONFIG = { markScale: 0.28, rotation: 0, edgeFeather: 0.3 }

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_scale,u_rotation,u_edge,u_markAngle,u_markY,u_orbit,u_dragging;

float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float box(vec3 p,vec3 b,float radius) {
  vec3 q=abs(p)-b+radius;
  return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-radius;
}
mat2 turn(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
vec3 encode(vec3 c) { return pow(max(c,0.),vec3(1./2.2)); }

vec3 local(vec3 p) {p.xz=turn(u_orbit)*p.xz;return p;}
float cylinder(vec3 p,float radius,float height,float rounding) {
  vec2 d=vec2(length(p.xz)-radius+rounding,abs(p.y)-height+rounding);
  return length(max(d,0.))+min(max(d.x,d.y),0.)-rounding;
}
float canister(vec3 p) {
  float body=cylinder(p,.62,.82,.055);
  float seam=max(abs(p.y-.65)-.013,length(p.xz)-.606);
  return max(body,-seam);
}
vec3 normalAt(vec3 p) {
  const float e=.0007;
  return normalize(vec3(canister(p+vec3(e,0,0))-canister(p-vec3(e,0,0)),canister(p+vec3(0,e,0))-canister(p-vec3(0,e,0)),canister(p+vec3(0,0,e))-canister(p-vec3(0,0,e))));
}
float mark(vec2 p) {
  float block=max(abs(p.x)-.5,abs(p.y)-.43);
  float left=max(abs(p.x+.17)-.075,abs(p.y-.18)-.38);
  float right=max(abs(p.x-.17)-.075,abs(p.y-.18)-.38);
  return max(block,-min(left,right));
}
void main() {
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;uv.y-=.09;
  vec3 eye=vec3(2.2,1.5,4.6),rd=normalize(-eye),right=normalize(cross(rd,vec3(0,1,0))),up=cross(right,rd);
  vec3 ro=eye+(right*uv.x+up*uv.y)*3.05;
  float t=0.;bool hit=false;
  for(int i=0;i<80;i++){float d=canister(ro+rd*t);if(d<.0007){hit=true;break;}t+=max(d*.85,.0004);if(t>8.)break;}
  vec3 color=vec3(.82,.80,.74);
  float ground=(-.835-ro.y)/rd.y;
  if(ground>0.) {
    vec3 p=ro+rd*ground;
    float shadow=exp(-dot(p.xz-vec2(.22,-.28),(p.xz-vec2(.22,-.28))*vec2(2.7,1.9)));
    color*=1.-.32*shadow;
    color*=1.-.26*exp(-dot(p.xz,p.xz)*8.);
  }
  if(hit) {
    vec3 p=ro+rd*t,q=local(p),n=normalAt(p);
    float angle=atan(q.x,q.z);
    float angular=atan(sin(angle-u_markAngle),cos(angle-u_markAngle));
    vec2 graphic=turn(u_rotation)*vec2(angular*.62,q.y-u_markY)/(u_scale*1.7);
    float edge=(.65+u_edge)*3.05/u_resolution.y/(u_scale*1.7);
    float ink=(1.-smoothstep(-edge,edge,mark(graphic)))*(1.-smoothstep(.56,.60,abs(q.y)));
    vec3 albedo=mix(vec3(.012,.045,.38),vec3(.93,.88,.69),ink);
    vec3 light=normalize(vec3(-3.,4.,4.));
    float diffuse=max(dot(n,light),0.);
    float spec=pow(max(dot(n,normalize(light-rd)),0.),38.)*.12;
    float top=step(.72,p.y);
    color=albedo*(.16+.77*diffuse)+spec;
    color+=vec3(.016,.035,.12)*pow(max(n.x,0.),3.);
    color*=.985+.03*hash(floor(p*750.));
    color*=1.-.30*(1.-smoothstep(.009,.025,abs(p.y-.65)));
    color+=vec3(.015,.025,.06)*top;
    float pin=1.-smoothstep(.022,.028,length(vec2(angular*.62,q.y-u_markY)));
    color=mix(color,vec3(.85,.045,.018),pin*u_dragging);
  }
  gl_FragColor=vec4(encode(color),1.);
}
`

const EDGE_FRAGMENT = `
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_size;
void main() {
  vec2 uv=gl_FragCoord.xy/u_size,pixel=1./u_size;
  vec3 center=texture2D(u_image,uv).rgb;
  vec3 nw=texture2D(u_image,uv+pixel*vec2(-1,1)).rgb;
  vec3 ne=texture2D(u_image,uv+pixel*vec2(1,1)).rgb;
  vec3 sw=texture2D(u_image,uv+pixel*vec2(-1,-1)).rgb;
  vec3 se=texture2D(u_image,uv+pixel*vec2(1,-1)).rgb;
  vec3 weights=vec3(.299,.587,.114);
  float a=dot(nw,weights),b=dot(ne,weights),c=dot(sw,weights),d=dot(se,weights),middle=dot(center,weights);
  float lo=min(middle,min(min(a,b),min(c,d))),hi=max(middle,max(max(a,b),max(c,d)));
  if(hi-lo<.035){gl_FragColor=vec4(center,1);return;}
  vec2 tangent=vec2(c+d-a-b,a+c-b-d);
  float stabilizer=max((a+b+c+d)*.03125,.008);
  tangent=clamp(tangent/(min(abs(tangent.x),abs(tangent.y))+stabilizer),-3.,3.)*pixel;
  vec3 inner=.5*(texture2D(u_image,uv-tangent/6.).rgb+texture2D(u_image,uv+tangent/6.).rgb);
  vec3 outer=.5*inner+.25*(texture2D(u_image,uv-tangent*.5).rgb+texture2D(u_image,uv+tangent*.5).rgb);
  float test=dot(outer,weights);
  gl_FragColor=vec4(test<lo||test>hi?inner:outer,1);
}
`

function bounded(value: number | undefined, fallback: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value as number)) : fallback
}

function useSurface(uniforms: Record<string, number>, active: boolean, followKey = "", followMs = 0) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const live = useRef({ uniforms, active, followKey, followMs })
  const request = useRef<() => void>(() => {})
  const lease = useRef(0)
  const [available, setAvailable] = useState(false)
  live.current = { uniforms, active, followKey, followMs }

  useEffect(() => {
    const element = canvas.current
    if (!element) {
      return
    }
    const gl = element.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" })
    if (!gl) {
      return
    }
    const leaseOwner = lease
    const currentLease = ++leaseOwner.current
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let edgeProgram: WebGLProgram | null = null
    let texture: WebGLTexture | null = null
    let target: WebGLFramebuffer | null = null
    let targetWidth = 0
    let targetHeight = 0
    let edgeSize: WebGLUniformLocation | null = null
    let edgeImage: WebGLUniformLocation | null = null
    let mainPosition = 0
    let edgePosition = 0
    let shaders: WebGLShader[] = []
    let locations: Record<string, WebGLUniformLocation | null> = {}
    let frame = 0
    let previous = 0
    let disposed = false
    let lost = false
    let followed = live.current.uniforms[live.current.followKey] ?? 0
    const media = matchMedia("(prefers-reduced-motion: reduce)")

    const clear = () => {
      if (buffer) {
        gl.deleteBuffer(buffer)
      }
      if (program) {
        gl.deleteProgram(program)
      }
      if (edgeProgram) {
        gl.deleteProgram(edgeProgram)
      }
      if (texture) {
        gl.deleteTexture(texture)
      }
      if (target) {
        gl.deleteFramebuffer(target)
      }
      edgeProgram = null
      texture = null
      target = null
      targetWidth = 0
      targetHeight = 0
      shaders.forEach((shader) => gl.deleteShader(shader))
      buffer = null
      program = null
      shaders = []
    }
    const paint = () => {
      if (disposed || lost || !program) {
        return
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, target)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(mainPosition)
      gl.vertexAttribPointer(mainPosition, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(locations.u_resolution, element.width, element.height)
      for (const [key, value] of Object.entries(live.current.uniforms)) {
        gl.uniform1f(locations[key], key === live.current.followKey ? followed : value)
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.useProgram(edgeProgram)
      gl.enableVertexAttribArray(edgePosition)
      gl.vertexAttribPointer(edgePosition, 2, gl.FLOAT, false, 0, 0)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(edgeImage, 0)
      gl.uniform2f(edgeSize, element.width, element.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const tick = (now: number) => {
      frame = 0
      const state = live.current
      if (disposed || lost || document.hidden || !state.active) {
        return
      }
      const target = state.uniforms[state.followKey]
      const dt = previous ? Math.min(now - previous, 48) : 16
      previous = now
      followed += (target - followed) * (1 - Math.exp(-dt / Math.max(1, state.followMs)))
      if (Math.abs(target - followed) < 0.0002) {
        followed = target
      }
      paint()
      if (followed !== target) {
        frame = requestAnimationFrame(tick)
      }
    }
    const wake = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      const state = live.current
      if (!state.followKey || media.matches || state.followMs === 0) {
        followed = state.uniforms[state.followKey] ?? 0
      }
      paint()
      if (
        state.followKey &&
        state.active &&
        !media.matches &&
        !document.hidden &&
        followed !== state.uniforms[state.followKey]
      ) {
        frame = requestAnimationFrame(tick)
      }
    }
    const resize = () => {
      if (disposed || lost) {
        return
      }
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) {
        return
      }
      const ratio = Math.min(devicePixelRatio || 1, 3, Math.sqrt(4000000 / (rect.width * rect.height)))
      const width = Math.max(1, Math.round(rect.width * ratio))
      const height = Math.max(1, Math.round(rect.height * ratio))
      if (width !== element.width || height !== element.height) {
        element.width = width
        element.height = height
      }
      if (texture && target && (targetWidth !== width || targetHeight !== height)) {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, target)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        targetWidth = width
        targetHeight = height
      }
      gl.viewport(0, 0, width, height)
      paint()
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
      const edgeFragment = compile(gl.FRAGMENT_SHADER, EDGE_FRAGMENT)
      edgeProgram = gl.createProgram()
      texture = gl.createTexture()
      target = gl.createFramebuffer()
      program = gl.createProgram()
      buffer = gl.createBuffer()
      if (!vertex || !fragment || !edgeFragment || !program || !buffer || !edgeProgram || !texture || !target) {
        clear()
        setAvailable(false)
        return
      }
      gl.attachShader(program, vertex)
      gl.attachShader(program, fragment)
      gl.linkProgram(program)
      gl.attachShader(edgeProgram, vertex)
      gl.attachShader(edgeProgram, edgeFragment)
      gl.linkProgram(edgeProgram)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS) || !gl.getProgramParameter(edgeProgram, gl.LINK_STATUS)) {
        clear()
        setAvailable(false)
        return
      }
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
      mainPosition = gl.getAttribLocation(program, "position")
      edgePosition = gl.getAttribLocation(edgeProgram, "position")
      edgeSize = gl.getUniformLocation(edgeProgram, "u_size")
      edgeImage = gl.getUniformLocation(edgeProgram, "u_image")
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      locations = {}
      for (const name of ["u_resolution", ...Object.keys(live.current.uniforms)]) {
        locations[name] = gl.getUniformLocation(program, name)
      }
      resize()
      setAvailable(true)
      wake()
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      lost = true
      program = null
      edgeProgram = null
      buffer = null
      texture = null
      target = null
      shaders = []
      targetWidth = 0
      targetHeight = 0
      cancelAnimationFrame(frame)
      setAvailable(false)
    }
    const contextRestored = () => {
      lost = false
      initialize()
    }
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
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
    media.addEventListener("change", wake)
    document.addEventListener("visibilitychange", visibility)
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
      media.removeEventListener("change", wake)
      document.removeEventListener("visibilitychange", visibility)
      window.removeEventListener("resize", resize)
      clear()
      queueMicrotask(() => {
        if (leaseOwner.current === currentLease) {
          gl.getExtension("WEBGL_lose_context")?.loseContext()
        }
      })
    }
  }, [])

  useEffect(() => {
    request.current()
  }, [uniforms, active, followKey, followMs])
  return { canvas, available }
}

export default function WrapAMark({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<typeof DEFAULT_CONFIG>
}) {
  const [placement, setPlacement] = useState({ angle: 0.45, y: -0.08 })
  const [orbit, setOrbit] = useState(0)
  const [dragging, setDragging] = useState(false)
  const markScale = bounded(config?.markScale, 0.28, 0.1, 0.5)
  const markRotation = (bounded(config?.rotation, 0, -90, 90) * Math.PI) / 180
  const verticalExtent =
    markScale * 1.7 * (0.5 * Math.abs(Math.sin(markRotation)) + 0.43 * Math.abs(Math.cos(markRotation)))
  const verticalLimit = Math.max(0.08, 0.58 - verticalExtent)
  const { canvas, available } = useSurface(
    {
      u_scale: markScale,
      u_rotation: markRotation,
      u_edge: bounded(config?.edgeFeather, 0.3, 0, 1),
      u_markAngle: placement.angle,
      u_markY: Math.max(-verticalLimit, Math.min(verticalLimit, placement.y)),
      u_orbit: orbit,
      u_dragging: dragging ? 1 : 0,
    },
    active,
  )
  const place = (clientX: number, clientY: number) => {
    const rect = canvas.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    const length = Math.hypot(2.2, 1.5, 4.6)
    const direction = [-2.2 / length, -1.5 / length, -4.6 / length]
    const rightLength = Math.hypot(direction[0], direction[2])
    const right = [-direction[2] / rightLength, 0, direction[0] / rightLength]
    const up = [-right[2] * direction[1], right[2] * direction[0] - right[0] * direction[2], right[0] * direction[1]]
    const x = ((clientX - rect.left - rect.width / 2) / rect.height) * 3.05
    const y = ((rect.height / 2 - clientY + rect.top) / rect.height - 0.09) * 3.05
    const origin = [2.2 + right[0] * x + up[0] * y, 1.5 + up[1] * y, 4.6 + right[2] * x + up[2] * y]
    const a = direction[0] ** 2 + direction[2] ** 2
    const b = 2 * (origin[0] * direction[0] + origin[2] * direction[2])
    const c = origin[0] ** 2 + origin[2] ** 2 - 0.62 ** 2
    const discriminant = b * b - 4 * a * c
    if (discriminant < 0) {
      return
    }
    const distance = (-b - Math.sqrt(discriminant)) / (2 * a)
    const surface = [
      origin[0] + direction[0] * distance,
      origin[1] + direction[1] * distance,
      origin[2] + direction[2] * distance,
    ]
    if (Math.abs(surface[1]) > 0.63) {
      return
    }
    setPlacement({
      angle: Math.atan2(surface[0], surface[2]) + orbit,
      y: Math.max(-verticalLimit, Math.min(verticalLimit, surface[1])),
    })
  }
  return (
    <section className="sf-wrap-mark" aria-label="Curved-surface mark placement">
      {!available && (
        <div className="sf-wrap-mark-fallback">
          <svg viewBox="0 0 600 375" aria-hidden="true">
            <path d="M238 91v172q62 34 124 0V91Z" fill="#234eaf" />
            <ellipse cx="300" cy="91" rx="62" ry="21" fill="#5980c9" />
            <path d="M274 163v48h52v-48h-10v32h-11v-32h-10v32h-11v-32Z" fill="#f3e9cb" />
          </svg>
          <span>Interactive placement requires WebGL.</span>
        </div>
      )}
      <canvas
        ref={canvas}
        role="group"
        tabIndex={0}
        aria-label="Mark placement. Drag on the canister or use arrow keys to move the mark. Use the turn buttons to inspect the side."
        style={{ opacity: available ? 1 : 0 }}
        onPointerDown={(event) => {
          setDragging(true)
          event.currentTarget.focus({ preventScroll: true })
          event.currentTarget.setPointerCapture(event.pointerId)
          place(event.clientX, event.clientY)
        }}
        onPointerMove={(event) => {
          if (dragging) {
            place(event.clientX, event.clientY)
          }
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onBlur={() => setDragging(false)}
        onKeyDown={(event) => {
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-0.065, 0],
            ArrowRight: [0.065, 0],
            ArrowUp: [0, 0.035],
            ArrowDown: [0, -0.035],
          }
          const delta = moves[event.key]
          if (delta) {
            event.preventDefault()
            setPlacement((point) => ({
              angle: point.angle + delta[0],
              y: Math.max(-verticalLimit, Math.min(verticalLimit, point.y + delta[1])),
            }))
          }
        }}
      />
      <div className="sf-wrap-mark-controls">
        <span>Drag the mark</span>
        <div>
          <button type="button" aria-label="Turn canister left" onClick={() => setOrbit((angle) => angle - 0.35)}>
            ←
          </button>
          <span>Turn</span>
          <button type="button" aria-label="Turn canister right" onClick={() => setOrbit((angle) => angle + 0.35)}>
            →
          </button>
        </div>
      </div>
      <style>{`.sf-wrap-mark{position:relative;isolation:isolate;width:100%;height:100%;min-height:200px;overflow:hidden;background:#e9e6dd;color:#253a67;font:11px Arial,sans-serif}.sf-wrap-mark canvas,.sf-wrap-mark-fallback{position:absolute;inset:0;width:100%;height:100%}.sf-wrap-mark canvas{display:block;touch-action:none;cursor:grab;outline:none}.sf-wrap-mark canvas:active{cursor:grabbing}.sf-wrap-mark canvas:focus-visible{box-shadow:inset 0 0 0 2px #2f59b5}.sf-wrap-mark-controls{position:absolute;bottom:15px;left:32px;right:24px;display:flex;align-items:center;justify-content:space-between;height:44px;pointer-events:none}.sf-wrap-mark-controls>div{display:flex;align-items:center;gap:4px;pointer-events:auto}.sf-wrap-mark-controls button{width:44px;height:44px;border:0;background:none;color:#24467f;font-size:20px;cursor:pointer;border-radius:50%}.sf-wrap-mark-controls button:focus-visible{outline:2px solid #375fa7;outline-offset:-4px}.sf-wrap-mark-controls button:active{background:#254c9a14}.sf-wrap-mark-fallback svg{width:100%;height:100%}.sf-wrap-mark-fallback span{position:absolute;bottom:66px;left:0;right:0;text-align:center;color:#5f7091;font-size:11px}`}</style>
    </section>
  )
}
