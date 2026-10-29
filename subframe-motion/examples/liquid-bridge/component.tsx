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

export const DEFAULT_CONFIG = { fieldBlend: 0.35, followLag: 120, radiusRatio: 0.7 }

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_separation,u_blend,u_ratio;

float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float box(vec3 p,vec3 b,float radius) {
  vec3 q=abs(p)-b+radius;
  return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-radius;
}
mat2 turn(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
vec3 encode(vec3 c) { return pow(max(c,0.),vec3(1./2.2)); }

float merge(float a,float b,float k) {
  float h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(b,a,h)-k*h*(1.-h);
}
float drops(vec3 p) {
  float radius=.64*u_ratio;
  float a=length(p-vec3(-u_separation*.5,-.01,0.))-.64;
  float b=length(p-vec3(u_separation*.5,radius-.65,0.))-radius;
  return merge(a,b,u_blend);
}
vec3 normalAt(vec3 p) {
  const float e=.0008;
  return normalize(vec3(drops(p+vec3(e,0,0))-drops(p-vec3(e,0,0)),drops(p+vec3(0,e,0))-drops(p-vec3(0,e,0)),drops(p+vec3(0,0,e))-drops(p-vec3(0,0,e))));
}
float shadow(vec3 p,vec3 l) {
  float t=.015,res=1.;
  for(int i=0;i<28;i++){float h=drops(p+l*t);res=min(res,9.*h/t);t+=clamp(h,.02,.17);if(h<.001||t>3.5)break;}
  return clamp(res,.12,1.);
}
void main() {
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;uv.y-=.12;
  vec3 eye=vec3(0.,1.65,4.7),rd=normalize(-eye),right=vec3(1,0,0),up=cross(right,rd);
  vec3 ro=eye+(right*uv.x+up*uv.y)*3.25;
  float t=0.;bool hit=false;
  for(int i=0;i<80;i++){float d=drops(ro+rd*t);if(d<.00075){hit=true;break;}t+=max(d*.85,.0004);if(t>8.)break;}
  vec3 light=normalize(vec3(-2.5,4.,3.));
  vec3 color=vec3(.84,.81,.73);
  float plane=(-.66-ro.y)/rd.y;
  if(plane>0.) {
    vec3 point=ro+rd*plane;
    float shade=shadow(point,light);
    color*=.70+.30*shade;
    float contact=exp(-pow(drops(point)*7.,2.));
    color*=1.-contact*.25;
  }
  if(hit) {
    vec3 p=ro+rd*t,n=normalAt(p),reflection=reflect(rd,n);
    float diffuse=max(dot(n,light),0.);
    float fresnel=.035+.965*pow(1.-max(dot(-rd,n),0.),5.);
    vec3 reflectPoint=p+reflection*((3.5-p.y)/max(reflection.y,.001));
    float panel=(1.-smoothstep(.73,.78,abs(reflectPoint.x+1.6)))*(1.-smoothstep(1.05,1.12,abs(reflectPoint.z-2.4)))*step(.01,reflection.y);
    float broad=pow(max(dot(n,normalize(light-rd)),0.),36.);
    color=vec3(.37,.006,.004)*(.12+.88*diffuse);
    color+=vec3(1.,.91,.76)*broad*.24;
    float rim=pow(1.-max(dot(-rd,n),0.),2.5);
    color+=vec3(.20,.018,.008)*rim*.42;
    color=mix(color,vec3(.94,.90,.81),panel*(.68+fresnel*.3));
    color+=vec3(.10,.012,.009)*pow(max(-n.x,0.),3.);
    color=mix(color,vec3(.75,.66,.54),fresnel*.34);
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

export default function LiquidBridge({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<typeof DEFAULT_CONFIG>
}) {
  const [separation, setSeparation] = useState(1.16)
  const drag = useRef<{ x: number; separation: number } | null>(null)
  const { canvas, available } = useSurface(
    {
      u_separation: separation,
      u_blend: bounded(config?.fieldBlend, 0.35, 0.05, 0.7),
      u_ratio: bounded(config?.radiusRatio, 0.7, 0.35, 1),
    },
    active,
    "u_separation",
    bounded(config?.followLag, 120, 0, 300),
  )
  return (
    <section className="sf-liquid-bridge" aria-label="Liquid neck formation study">
      {!available && (
        <div className="sf-liquid-bridge-fallback">
          <svg viewBox="0 0 600 375" aria-hidden="true">
            <path
              d="M171 186a75 75 0 1 1 135-45q18 25 42 16a53 53 0 1 1-1 90q-35-17-58-1a75 75 0 0 1-118-60Z"
              fill="#a51f18"
            />
            <path d="M191 148q22-31 53-21" stroke="#fff4db" strokeWidth="12" fill="none" />
          </svg>
          <span>Interactive drops require WebGL.</span>
        </div>
      )}
      <canvas
        ref={canvas}
        role="img"
        aria-label="Two unequal red lacquer drops join through a smooth neck as their separation decreases"
        style={{ opacity: available ? 1 : 0 }}
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, separation }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (drag.current) {
            const rect = event.currentTarget.getBoundingClientRect()
            setSeparation(
              Math.max(
                0.2,
                Math.min(2.3, drag.current.separation + ((event.clientX - drag.current.x) / rect.height) * 3.25),
              ),
            )
          }
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
      />
      <label className="sf-liquid-bridge-control">
        <span>Separation</span>
        <input
          type="range"
          aria-label="Drop separation"
          min="0.2"
          max="2.3"
          step="0.01"
          value={separation}
          onChange={(event) => setSeparation(Number(event.target.value))}
        />
        <span aria-hidden="true">↔</span>
      </label>
      <style>{`.sf-liquid-bridge{position:relative;isolation:isolate;width:100%;height:100%;min-height:200px;overflow:hidden;background:#eae6d7;color:#4d2f26;font:11px Arial,sans-serif}.sf-liquid-bridge canvas,.sf-liquid-bridge-fallback{position:absolute;inset:0;width:100%;height:100%}.sf-liquid-bridge canvas{display:block;touch-action:none;cursor:ew-resize}.sf-liquid-bridge-control{position:absolute;bottom:20px;left:32px;right:32px;display:flex;align-items:center;gap:16px;height:32px}.sf-liquid-bridge-control input{flex:1;min-width:0;accent-color:#aa241b;height:28px;cursor:ew-resize}.sf-liquid-bridge-control input:focus-visible{outline:2px solid #9a231a;outline-offset:4px}.sf-liquid-bridge-fallback svg{width:100%;height:100%}.sf-liquid-bridge-fallback span{position:absolute;bottom:66px;left:0;right:0;text-align:center;color:#756353;font-size:11px}`}</style>
    </section>
  )
}
