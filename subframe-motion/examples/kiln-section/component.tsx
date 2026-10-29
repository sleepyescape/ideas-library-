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

export const DEFAULT_CONFIG = { wallThickness: 8, cutAngle: 18, capRoughness: 0.65 }

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_depth,u_wall,u_angle,u_roughness;

float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float box(vec3 p,vec3 b,float radius) {
  vec3 q=abs(p)-b+radius;
  return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-radius;
}
mat2 turn(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
vec3 encode(vec3 c) { return pow(max(c,0.),vec3(1./2.2)); }

float ceramic(vec3 p) {
  vec2 q=turn(p.y*.48)*p.xz;
  float angle=atan(q.y,q.x);
  float radius=.70+.09*cos(p.y*1.7)+.025*sin(p.y*3.1);
  float flutes=.075*cos(angle*6.)+.009*cos(angle*30.);
  vec2 shell=vec2(length(q)-radius-flutes,abs(p.y)-1.02);
  float outer=min(max(shell.x,shell.y),0.)+length(max(shell,0.))-.012;
  float holes=length(q)-(.29-u_wall*.005);
  for(int i=0;i<6;i++) {
    float a=float(i)*1.04719755;
    vec2 center=vec2(cos(a),sin(a))*(.50+.018*sin(p.y*2.));
    holes=min(holes,length(q-center)-(.196-u_wall*.005));
  }
  return max(outer,-holes);
}
vec3 planeNormal() { return normalize(vec3(sin(u_angle),cos(u_angle),.18*sin(u_angle))); }
float scene(vec3 p) { return max(ceramic(p),dot(p,planeNormal())-u_depth); }
vec3 normalAt(vec3 p) {
  const float e=.001;
  return normalize(vec3(scene(p+vec3(e,0,0))-scene(p-vec3(e,0,0)),scene(p+vec3(0,e,0))-scene(p-vec3(0,e,0)),scene(p+vec3(0,0,e))-scene(p-vec3(0,0,e))));
}
float shadow(vec3 p,vec3 l) {
  float t=.015,res=1.;
  for(int i=0;i<32;i++) { float h=scene(p+l*t);res=min(res,6.*h/t);t+=clamp(h,.012,.14);if(h<.001||t>3.)break; }
  return clamp(res,.12,1.);
}
void main() {
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;
  uv.y-=.08;
  vec3 eye=vec3(2.6,3.5,4.8),direction=normalize(-eye),right=normalize(cross(direction,vec3(0,1,0))),up=cross(right,direction);
  vec3 ro=eye+(right*uv.x+up*uv.y)*3.5,rd=direction;
  float t=0.;bool hit=false;
  for(int i=0;i<160;i++) { float d=scene(ro+rd*t);if(d<max(.0007,1.3/u_resolution.y)){hit=true;break;}t+=max(d*.5,.0003);if(t>9.)break; }
  vec3 color=vec3(.80,.79,.765);
  float ground=(-1.037-ro.y)/rd.y;
  if(ground>0.) {
    vec3 floorPoint=ro+rd*ground;
    float contact=exp(-dot(floorPoint.xz, floorPoint.xz*vec2(.85,1.2))*1.3);
    color=vec3(.80,.79,.765)*(1.-contact*.12);
    color*=.75+.25*shadow(floorPoint+vec3(0,.004,0),normalize(vec3(-3.,5.,4.)));
  }
  if(hit) {
    vec3 p=ro+rd*t,n=normalAt(p),light=normalize(vec3(-3.,5.,4.));
    float cut=dot(p,planeNormal())-u_depth;
    float cap=step(ceramic(p),cut+.0015);
    vec3 albedo=mix(vec3(.014,.040,.57),vec3(.19,.38,.86),cap);
    float diffuse=max(dot(n,light),0.);
    float ao=1.;
    ao-=max(0.,.10-scene(p+n*.10))*2.1;
    ao-=max(0.,.24-scene(p+n*.24))*1.2;
    ao-=max(0.,.42-scene(p+n*.42))*.7;
    ao=clamp(ao,.16,1.);
    vec3 cell=floor(p*180.);
    vec3 grainNormal=vec3(hash(cell),hash(cell+vec3(19,7,3)),hash(cell+vec3(5,23,11)))*2.-1.;
    n=normalize(n+(grainNormal-n*dot(grainNormal,n))*(.009+cap*.012));
    float rough=mix(.18,u_roughness,cap);
    vec3 halfVector=normalize(light-rd);
    diffuse=max(dot(n,light),0.);
    float spec=pow(max(dot(n,halfVector),0.),mix(110.,9.,rough))*(1.-rough)*.5;
    float ceramicGrain=hash(floor(p*650.));
    color=albedo*(.20+.85*diffuse*shadow(p+n*.004,light))*ao;
    color+=vec3(.025,.045,.11)*pow(max(n.x,0.),2.)*ao;
    float reflection=pow(max(dot(reflect(rd,n),normalize(vec3(-.8,.7,2.))),0.),45.);
    color+=vec3(.25,.32,.45)*reflection*(1.-cap);
    color+=spec;
    color*=.98+ceramicGrain*.035;
    color*=1.-cap*pow(hash(floor(p*250.)),18.)*.18;
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

export default function KilnSection({
  active = true,
  config,
}: {
  active?: boolean
  config?: Partial<typeof DEFAULT_CONFIG>
}) {
  const [depth, setDepth] = useState(0.58)
  const dragging = useRef<{ y: number; depth: number } | null>(null)
  useEffect(() => {
    if (!active) {
      dragging.current = null
    }
  }, [active])
  const { canvas, available } = useSurface(
    {
      u_depth: depth,
      u_wall: bounded(config?.wallThickness, 8, 3, 18),
      u_angle: (bounded(config?.cutAngle, 18, -45, 45) * Math.PI) / 180,
      u_roughness: bounded(config?.capRoughness, 0.65, 0.1, 1),
    },
    active,
  )
  const change = (clientY: number) => {
    const rect = canvas.current?.getBoundingClientRect()
    if (rect && dragging.current) {
      setDepth(
        Math.max(-0.82, Math.min(0.96, dragging.current.depth - ((clientY - dragging.current.y) / rect.height) * 2.6)),
      )
    }
  }
  return (
    <section className="sf-kiln" aria-label="Ceramic cross-section study">
      {!available && (
        <div className="sf-kiln-fallback">
          <span>Interactive section requires WebGL.</span>
        </div>
      )}
      <canvas
        ref={canvas}
        aria-label="A fluted cobalt ceramic column with seven twisting channels and a light-blue cut face"
        role="img"
        style={{ opacity: available ? 1 : 0 }}
        onPointerDown={(event) => {
          if (!active || !available || event.button !== 0) {
            return
          }
          dragging.current = { y: event.clientY, depth }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (active && dragging.current) {
            change(event.clientY)
          }
        }}
        onPointerUp={() => {
          dragging.current = null
        }}
        onPointerCancel={() => {
          dragging.current = null
        }}
        onLostPointerCapture={() => {
          dragging.current = null
        }}
      />
      <label className="sf-kiln-control">
        <span>Section</span>
        <input
          aria-label="Section height"
          type="range"
          min="-0.82"
          max="0.96"
          step="0.01"
          value={depth}
          disabled={!active || !available}
          onChange={(event) => setDepth(Number(event.target.value))}
        />
        <output>{Math.round((depth + 0.98) * 50)} mm</output>
      </label>
      <style>{`.sf-kiln{position:relative;isolation:isolate;width:100%;height:100%;min-height:200px;overflow:hidden;background:#e7e5e0;color:#373a43;font:11px Arial,sans-serif}.sf-kiln canvas,.sf-kiln-fallback{position:absolute;inset:0;width:100%;height:100%}.sf-kiln canvas{display:block;touch-action:none;cursor:ns-resize}.sf-kiln-control{position:absolute;bottom:20px;left:32px;right:32px;display:flex;align-items:center;gap:16px;height:32px}.sf-kiln-control input{flex:1;min-width:0;appearance:none;background:transparent;cursor:ew-resize;height:32px}.sf-kiln-control input::-webkit-slider-runnable-track{height:2px;background:#b5b7bd;border-radius:2px}.sf-kiln-control input::-webkit-slider-thumb{appearance:none;width:13px;height:13px;margin-top:-5.5px;border-radius:50%;background:#374dc6;box-shadow:0 1px 2px #0003}.sf-kiln-control input::-moz-range-track{height:2px;background:#b5b7bd}.sf-kiln-control input::-moz-range-thumb{border:0;width:13px;height:13px;border-radius:50%;background:#374dc6}.sf-kiln-control input:disabled{cursor:default;opacity:.5}.sf-kiln-control output{width:45px;text-align:right;font-variant-numeric:tabular-nums}.sf-kiln-control input:focus-visible{outline:2px solid #374dc6;outline-offset:4px}.sf-kiln-fallback svg{width:100%;height:100%}.sf-kiln-fallback span{position:absolute;bottom:66px;left:0;right:0;text-align:center;color:#686c73;font-size:11px}`}</style>
    </section>
  )
}
