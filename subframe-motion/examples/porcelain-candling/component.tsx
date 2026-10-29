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

export const DEFAULT_CONFIG = { wallThickness: 3, lightRadius: 0.15, absorption: 1.4 }

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_wall,u_radius,u_absorption,u_lightX,u_lightY;

float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float box(vec3 p,vec3 b,float radius) {
  vec3 q=abs(p)-b+radius;
  return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-radius;
}
mat2 turn(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
vec3 encode(vec3 c) { return pow(max(c,0.),vec3(1./2.2)); }

float thicknessField(vec3 p) {
  float angle=atan(p.x,p.z);
  return .78+.16*sin(angle*7.+p.y*7.)+.09*sin(angle*13.-p.y*11.)+.12*cos(p.y*3.);
}
float vessel(vec3 p) {
  float radius=.56+.065*(p.y+.8)+.025*cos(p.y*2.5);
  vec2 outer=vec2(length(p.xz)-radius,abs(p.y)-.74);
  float shell=length(max(outer,0.))+min(max(outer.x,outer.y),0.)-.035;
  float inner=radius-u_wall*.017*thicknessField(p);
  float cavity=max(length(p.xz)-inner,-p.y-.615);
  float cup=max(shell,-cavity);
  vec2 foot=vec2(length(p.xz)-.465,abs(p.y+.79)-.035);
  float footRing=length(max(foot,0.))+min(max(foot.x,foot.y),0.)-.012;
  return min(cup,footRing);
}
vec3 normalAt(vec3 p) {
  const float e=.0008;
  return normalize(vec3(vessel(p+vec3(e,0,0))-vessel(p-vec3(e,0,0)),vessel(p+vec3(0,e,0))-vessel(p-vec3(0,e,0)),vessel(p+vec3(0,0,e))-vessel(p-vec3(0,0,e))));
}
void main() {
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;uv.y-=.11;
  vec3 eye=vec3(1.8,1.45,4.7),rd=normalize(-eye),right=normalize(cross(rd,vec3(0,1,0))),up=cross(right,rd);
  vec3 ro=eye+(right*uv.x+up*uv.y)*2.9;
  float t=0.;bool hit=false;
  for(int i=0;i<110;i++) {float d=vessel(ro+rd*t);if(d<.00065){hit=true;break;}t+=max(d*.72,.0004);if(t>8.)break;}
  vec3 color=vec3(.009,.0075,.0065);
  float floorT=(-.84-ro.y)/rd.y;
  if(floorT>0.) {
    vec3 p=ro+rd*floorT;
    float contact=exp(-dot(p.xz,p.xz)*3.);
    color=vec3(.014,.011,.0085)*(1.-.75*contact);
  }
  if(hit) {
    vec3 p=ro+rd*t,n=normalAt(p);
    vec3 key=normalize(vec3(-3.,4.,4.));
    float diffuse=max(dot(n,key),0.);
    float occlusion=clamp(vessel(p+n*.07)/.07,.15,1.);
    vec3 ivory=vec3(.72,.66,.54);
    float mark=0.;
    vec3 lamp=vec3(u_lightX,u_lightY,-.85);
    vec3 toLight=normalize(lamp-p);
    float backlight=pow(max(dot(-n,toLight),0.),.8);
    float falloff=exp(-dot(p.xy-lamp.xy,p.xy-lamp.xy)/pow(.33+u_radius,2.));
    float wall=u_wall*thicknessField(p);
    float transmitted=exp(-wall*u_absorption*.40)*falloff*backlight;
    float rim=pow(1.-max(dot(n,-rd),0.),3.);
    vec3 halfVector=normalize(key-rd);
    float spec=pow(max(dot(n,halfVector),0.),75.)*.18;
    color=ivory*(.10+.62*diffuse)*(.48+.52*occlusion)+spec;
    color+=vec3(1.,.40,.11)*transmitted*2.1*(1.-mark*.85);
    color+=vec3(.19,.12,.065)*rim*max(dot(n,normalize(vec3(-1,2,-3))),0.);
    color*=.99+.02*hash(floor(p*1100.));
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

export default function PorcelainCandling({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<typeof DEFAULT_CONFIG>
}) {
  const [light, setLight] = useState({ x: 0.16, y: 0.12 })
  const dragging = useRef(false)
  const { canvas, available } = useSurface(
    {
      u_wall: bounded(config?.wallThickness, 3, 1, 8),
      u_radius: bounded(config?.lightRadius, 0.15, 0.04, 0.35),
      u_absorption: bounded(config?.absorption, 1.4, 0.2, 3),
      u_lightX: light.x,
      u_lightY: light.y,
    },
    active,
  )
  const move = (x: number, y: number) => {
    const rect = canvas.current?.getBoundingClientRect()
    if (rect) {
      setLight({
        x: Math.max(-1.1, Math.min(1.1, ((x - rect.left - rect.width / 2) / rect.height) * 2.9)),
        y: Math.max(-0.5, Math.min(0.65, (0.5 - (y - rect.top) / rect.height) * 2.9)),
      })
    }
  }
  return (
    <section className="sf-candling" aria-label="Porcelain transmission study">
      {!available && (
        <div className="sf-candling-fallback">
          <svg viewBox="0 0 600 375" aria-hidden="true">
            <path d="M231 100q69-20 138 0l-15 154q-53 22-108 0Z" fill="#dad4c5" />
            <ellipse cx="300" cy="100" rx="69" ry="16" fill="#918a79" />
            <ellipse cx="300" cy="100" rx="63" ry="11" fill="#28251d" />
          </svg>
          <span>Interactive candling requires WebGL.</span>
        </div>
      )}
      <canvas
        ref={canvas}
        role="img"
        aria-label="An ivory vessel transmits a warm backlight through its thinner ceramic walls"
        style={{ opacity: available ? 1 : 0 }}
        onPointerDown={(event) => {
          dragging.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          move(event.clientX, event.clientY)
        }}
        onPointerMove={(event) => {
          if (dragging.current) {
            move(event.clientX, event.clientY)
          }
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
      />
      <label className="sf-candling-control">
        <span>Backlight</span>
        <input
          aria-label="Backlight horizontal position"
          aria-description="Left and right move the light horizontally. Page Up and Page Down move it vertically."
          onKeyDown={(event) => {
            if (event.key === "PageUp" || event.key === "PageDown") {
              event.preventDefault()
              const direction = event.key === "PageUp" ? 1 : -1
              setLight((point) => ({ ...point, y: Math.max(-0.5, Math.min(0.65, point.y + direction * 0.08)) }))
            }
          }}
          type="range"
          min="-1.1"
          max="1.1"
          step="0.01"
          value={light.x}
          onChange={(event) => setLight((point) => ({ ...point, x: Number(event.target.value) }))}
        />
        <span aria-hidden="true">↔</span>
      </label>
      <style>{`.sf-candling{position:relative;isolation:isolate;width:100%;height:100%;min-height:200px;overflow:hidden;background:#181510;color:#e0d8c7;font:11px Arial,sans-serif}.sf-candling canvas,.sf-candling-fallback{position:absolute;inset:0;width:100%;height:100%}.sf-candling canvas{display:block;touch-action:none;cursor:move}.sf-candling-control{position:absolute;bottom:20px;left:32px;right:32px;display:flex;align-items:center;gap:16px;height:32px}.sf-candling-control input{flex:1;min-width:0;accent-color:#d9b784;height:28px;cursor:ew-resize}.sf-candling-control input:focus-visible{outline:2px solid #e3c89d;outline-offset:4px}.sf-candling-fallback svg{width:100%;height:100%}.sf-candling-fallback span{position:absolute;bottom:66px;left:0;right:0;text-align:center;color:#a19a8a;font-size:11px}`}</style>
    </section>
  )
}
