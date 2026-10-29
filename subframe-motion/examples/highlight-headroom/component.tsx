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

export const DEFAULT_CONFIG = { shoulderStart: 0.75, shoulderStrength: 0.6, emitterWidth: 0.2, huePreservation: 0.8 }

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_start,u_strength,u_emitter,u_hue,u_exposure;

float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float box(vec3 p,vec3 b,float radius) {
  vec3 q=abs(p)-b+radius;
  return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-radius;
}
mat2 turn(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
vec3 encode(vec3 c) { return pow(max(c,0.),vec3(1./2.2)); }

vec3 local(vec3 p) { p.yz=turn(.28)*p.yz;p.xz=turn(-.34)*p.xz;return p; }
float enamel(vec3 p) {vec3 q=local(p);return length(vec2(length(q.xy)-.78,q.z))-.225;}
vec3 normalAt(vec3 p) {
  const float e=.0008;
  return normalize(vec3(enamel(p+vec3(e,0,0))-enamel(p-vec3(e,0,0)),enamel(p+vec3(0,e,0))-enamel(p-vec3(0,e,0)),enamel(p+vec3(0,0,e))-enamel(p-vec3(0,0,e))));
}
float shoulder(float value) {
  float excess=max(value-u_start,0.);
  float headroom=1.-u_start;
  return min(value,u_start)+headroom*(1.-exp(-excess/(headroom*(1.+u_strength*5.))));
}
vec3 toneMap(vec3 radiance) {
  vec3 channels=vec3(shoulder(radiance.r),shoulder(radiance.g),shoulder(radiance.b));
  float peak=max(radiance.r,max(radiance.g,radiance.b));
  vec3 chromatic=radiance*(shoulder(peak)/max(peak,.0001));
  return mix(channels,chromatic,u_hue);
}
void main() {
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;uv.y-=.09;
  vec3 ro=vec3(uv*3.05,4.),rd=vec3(0,0,-1);
  float t=0.;bool hit=false;
  for(int i=0;i<80;i++){float d=enamel(ro+rd*t);if(d<.0007){hit=true;break;}t+=max(d*.9,.0004);if(t>7.)break;}
  vec3 color=vec3(.006,.008,.013);
  if(hit) {
    vec3 p=ro+rd*t,q=local(p),n=normalAt(p);
    vec3 light=normalize(vec3(.9,1.4,3.));
    float diffuse=max(dot(n,light),0.);
    float stripe=1.-smoothstep(.08,.095,abs(q.y-.28));
    vec3 albedo=mix(vec3(.80,.83,.88),vec3(.012,.055,.78),stripe);
    vec3 halfVector=normalize(light-rd);
    float specular=exp(-(1.-max(dot(n,halfVector),0.))/(.003+u_emitter*.065))*3.8;
    float fineReflection=exp(-pow((n.x-.12)*13.,2.))*pow(max(n.z,0.),12.)*.3;
    vec3 radiance=albedo*(.09+.62*diffuse)+vec3(specular+fineReflection);
    radiance+=vec3(.035,.05,.11)*pow(max(-n.x,0.),2.);
    radiance*=exp2(u_exposure);
    color=gl_FragCoord.x/u_resolution.x>.60 ? clamp(radiance,0.,1.) : toneMap(radiance);
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

export default function HighlightHeadroom({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<typeof DEFAULT_CONFIG>
}) {
  const [exposure, setExposure] = useState(0.4)
  const drag = useRef<{ x: number; exposure: number } | null>(null)
  const { canvas, available } = useSurface(
    {
      u_start: bounded(config?.shoulderStart, 0.75, 0.5, 0.95),
      u_strength: bounded(config?.shoulderStrength, 0.6, 0.1, 1),
      u_emitter: bounded(config?.emitterWidth, 0.2, 0.05, 0.5),
      u_hue: bounded(config?.huePreservation, 0.8, 0, 1),
      u_exposure: exposure,
    },
    active,
  )
  return (
    <section className="sf-headroom" aria-label="Highlight compression comparison">
      {!available && (
        <div className="sf-headroom-fallback">
          <svg viewBox="0 0 600 375" aria-hidden="true">
            <ellipse cx="300" cy="176" rx="94" ry="110" fill="none" stroke="#e3e6ec" strokeWidth="45" />
            <path d="M207 146h34m118 0h34" stroke="#1453ef" strokeWidth="19" />
          </svg>
          <span>Interactive exposure requires WebGL.</span>
        </div>
      )}
      <canvas
        ref={canvas}
        role="img"
        aria-label="A white enamel loop with a blue stripe; its right-hand sliver hard-clips while the left compresses bright detail"
        style={{ opacity: available ? 1 : 0 }}
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, exposure }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (drag.current) {
            const width = event.currentTarget.getBoundingClientRect().width
            setExposure(
              Math.max(-2, Math.min(2, drag.current.exposure + ((event.clientX - drag.current.x) / width) * 4)),
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
      <div className="sf-headroom-divider" aria-hidden="true" />
      <div className="sf-headroom-labels" aria-hidden="true">
        <span>Roll-off</span>
        <span>Clip</span>
      </div>
      <label className="sf-headroom-control">
        <span>Exposure</span>
        <input
          aria-label="Exposure compensation in EV"
          type="range"
          min="-2"
          max="2"
          step="0.05"
          value={exposure}
          onChange={(event) => setExposure(Number(event.target.value))}
        />
        <output>
          {exposure > 0 ? "+" : ""}
          {exposure.toFixed(1)} EV
        </output>
      </label>
      <style>{`.sf-headroom{position:relative;isolation:isolate;width:100%;height:100%;min-height:200px;overflow:hidden;background:#10151f;color:#ccd2df;font:11px Arial,sans-serif}.sf-headroom canvas,.sf-headroom-fallback{position:absolute;inset:0;width:100%;height:100%}.sf-headroom canvas{display:block;touch-action:none;cursor:ew-resize}.sf-headroom-divider{position:absolute;left:60%;top:29px;bottom:77px;border-left:1px solid #9ba6bb3b;pointer-events:none}.sf-headroom-labels{position:absolute;top:20px;left:32px;right:32px;display:flex;justify-content:space-between;pointer-events:none;color:#8995aa;font-size:10px}.sf-headroom-control{position:absolute;bottom:20px;left:32px;right:32px;display:flex;align-items:center;gap:16px;height:32px}.sf-headroom-control input{flex:1;min-width:0;accent-color:#7898f5;height:28px;cursor:ew-resize}.sf-headroom-control output{width:52px;text-align:right;font-variant-numeric:tabular-nums}.sf-headroom-control input:focus-visible{outline:2px solid #9ab3ff;outline-offset:4px}.sf-headroom-fallback svg{width:100%;height:100%}.sf-headroom-fallback span{position:absolute;bottom:66px;left:0;right:0;text-align:center;color:#8995aa;font-size:11px}`}</style>
    </section>
  )
}
