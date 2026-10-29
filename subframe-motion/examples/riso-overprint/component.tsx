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

// Only Iowan Old Style (Apple) ships a Black Italic. Georgia's Bold Italic is the heaviest common fallback;
// Palatino's is too light to carry the mark.
const SERIF = '"Iowan Old Style", Georgia, "Noto Serif", "DejaVu Serif", serif'
const SANS = '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif'
const WORD = "Pigment."
const STILL_TIME = 9
const PIXEL_BUDGET = 2000000
// Below this container width the colophon would print smaller than about 6px.
const COLOPHON_MIN_WIDTH = 440

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_ink;
uniform float u_pixel;
uniform sampler2D u_plates;

const vec3 PAPER = vec3(.957, .925, .867);
const vec3 ORANGE = vec3(1., .42, .2);
const vec3 BURGUNDY = vec3(.36, .08, .2);

// hash and hash4 adapted from the "Hash without Sine" functions, Copyright (c) 2014 David Hoskins, MIT License:
// sin hashes lose precision at large cell indices on mobile GPUs.
float hash(vec2 p) {
  vec3 q = fract(p.xyx * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
vec4 hash4(vec2 p) {
  vec4 q = fract(p.xyxy * vec4(.1031, .103, .0973, .1099));
  q += dot(q, q.wzxy + 33.33);
  return fract((q.xxyz + q.yzzw) * q.zywx);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + 1.), f.x), f.y);
}

// Stochastic "grain" screen: the stencil is perforated cell by cell, and each hole
// prints a slightly spread dot. Spread dots overlap, so the four cells around the nearest corner are searched.
float screen(vec2 q, float tone, vec2 seed, float aa) {
  vec2 i = floor(q);
  vec2 f = fract(q);
  float spread = mix(.40, .62, u_ink);
  // Dot gain: heavier ink darkens the midtones of the same artwork.
  tone = pow(tone, mix(1.45, .9, u_ink));
  tone += (noise(q / 2.7 + seed) - .5) * .22 * (1. - tone) * tone * 4.;
  // Near full tone the dots spread into each other until the stencil prints solid.
  float swell = 1. + .6 * smoothstep(.78, 1., tone);
  float cover = 0.;
  vec2 corner = step(.5, f) - 1.;
  for (int y = 0; y <= 1; y++) {
    for (int x = 0; x <= 1; x++) {
      vec2 n = corner + vec2(float(x), float(y));
      vec4 h = hash4(i + n + seed);
      float threshold = .03 + .94 * h.z;
      float on = smoothstep(threshold - .03, threshold + .03, tone);
      float radius = spread * (.75 + .5 * h.w) * sqrt(on) * swell;
      vec2 center = n + .5 + (h.xy - .5) * .7;
      cover = max(cover, 1. - smoothstep(radius - aa, radius + aa, length(f - center)));
    }
  }
  return max(cover, smoothstep(.975, .995, tone));
}

// The veil's lower edge, in frame heights from the bottom.
float veilEdge(vec2 s, float t, float limit) {
  return min(.8 + .03 * sin(t * .23) + .05 * sin(s.x * 2.1 - t * .19 + 1.) + .02 * sin(s.x * 4.7 + t * .27 + 2.), limit);
}

float burgundyTone(vec2 s, float e) {
  return smoothstep(e - .09, e + .03, s.y);
}

float orangeTone(vec2 s, float e, float t, float aspect) {
  float tilt = (s.x - aspect * .5) * .16;
  float low = .66 - .03 * sin(t * .17 + 1.) + .07 * sin(s.x * 1.7 + t * .16 + .4) + .03 * sin(s.x * 3.9 - t * .24 + 1.7);
  // The swell always reaches up under the veil, so the veil's grain overprints orange instead of spraying onto bare paper.
  low = min(low, e + tilt - .1);
  return smoothstep(low - .22, low + .02, s.y + tilt) * (1. - smoothstep(e + .02, e + .16, s.y));
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 middle = .5 * u_resolution;
  // The orange drum is fed slightly out of register with the burgundy drum.
  vec2 fo = mat2(1., .0024, -.0024, 1.) * (fc - middle) + middle + u_pixel * vec2(1.5, -1.);
  float aspect = u_resolution.x / u_resolution.y;
  // Grain follows the composition but never drops below two device pixels, where dots would alias.
  float cell = max(u_pixel * 1.3, 2.);
  float aa = .75 / cell;
  vec2 feed = fc / u_pixel;

  vec4 platesB = texture2D(u_plates, fc / u_resolution);
  vec4 platesO = texture2D(u_plates, fo / u_resolution);
  float tooth = noise(feed / 1.4);
  // Line art spreads with heavy ink and breaks up when the drum is starved.
  float stroke = mix(.6, .36, u_ink);
  float letterB = smoothstep(stroke - .12, stroke + .12, platesB.r + (tooth - .5) * .22);
  float letterO = smoothstep(stroke - .12, stroke + .12, platesO.r + (tooth - .5) * .22);
  float knockB = smoothstep(.3, .7, platesB.g);
  float knockO = smoothstep(.3, .7, platesO.g);

  vec2 s = fc / u_resolution.y;
  // Short frames lower the veil so it still grounds the paper-tone controls in the top 44px.
  float e = veilEdge(s, u_time, 1. - 44. * u_pixel / u_resolution.y);
  float toneO = orangeTone(fo / u_resolution.y, e, u_time, aspect);
  float toneB = burgundyTone(s, e);
  // Burgundy takes poorly on the still-wet orange, so its grain thins where the two overprint.
  toneB *= 1. - .85 * toneO * (1. - toneB);
  float coverO = screen(fo / cell, toneO, vec2(13., 7.), aa);
  float coverB = screen(fc / cell, toneB, vec2(-41., 23.), aa);
  coverO = max(coverO, letterO) * (1. - knockO);
  coverB = max(coverB, letterB) * (1. - knockB);

  // Ink lays down unevenly across the drum, in soft streaks that follow the paper feed.
  float mottleO = noise(feed / vec2(120., 34.)) * .6 + noise(feed / vec2(26., 12.) + 17.) * .4;
  float mottleB = noise(feed / vec2(120., 34.) + 41.) * .6 + noise(feed / vec2(26., 12.) + 63.) * .4;
  // Pinholes: rare valleys in the paper tooth that the orange drum never reaches, even in solids.
  vec2 pits = feed / 2.4;
  vec4 pit = hash4(floor(pits) + vec2(91., 17.));
  float pitRadius = (.12 + .16 * pit.w) * step(mix(.95, .997, sqrt(u_ink)), pit.z);
  float bare = 1. - smoothstep(pitRadius - .15, pitRadius + .1, length(fract(pits) - .5 - (pit.xy - .5) * .3));
  // Low density starves broad tints far more than line art, so the mark stays legible.
  float density = mix(.72, 1., sqrt(u_ink));
  float starved = mix(.26, .06, sqrt(u_ink));
  float line = mix(.88, 1., sqrt(u_ink));
  float tintO = density * (1. - starved + starved * mottleO) * (1. - .65 * bare);
  float tintB = density * (1. - starved + starved * mottleB) * (1. - .5 * coverO);
  float alphaO = mix(tintO, line * (.95 + .05 * mottleO), letterO);
  float alphaB = mix(tintB, line * (.95 + .05 * mottleB), letterB);

  float formation = noise(feed / 38. + 9.);
  vec3 color = PAPER * (1. + (formation - .5) * .03 + (tooth - .5) * .025);
  color *= mix(vec3(1.), ORANGE, coverO * alphaO);
  color *= mix(vec3(1.), BURGUNDY, coverB * alphaB);
  gl_FragColor = vec4(color, 1.);
}
`

type Uniforms = {
  resolution: WebGLUniformLocation | null
  time: WebGLUniformLocation | null
  ink: WebGLUniformLocation | null
  pixel: WebGLUniformLocation | null
}

// Both inks share one stencil sheet: red prints in both drums, green is knocked out of both.
// Layout is in CSS layout pixels so it agrees with the HTML controls under ancestor transforms.
function paintPlates(context: CanvasRenderingContext2D, layoutWidth: number, layoutHeight: number) {
  const { width, height } = context.canvas
  context.setTransform(width / layoutWidth, 0, 0, height / layoutHeight, 0, 0)
  context.fillStyle = "#000"
  context.fillRect(0, 0, layoutWidth, layoutHeight)
  context.globalCompositeOperation = "lighter"
  const pad = 0.04 * layoutWidth

  context.fillStyle = "#f00"
  let size = Math.min(layoutWidth * 0.19, layoutHeight * 0.3)
  context.font = `italic 900 ${size}px ${SERIF}`
  context.letterSpacing = `${-0.03 * size}px`
  // Keep the period clear of the 44px pause control in narrow frames.
  const room = layoutWidth - pad - 72
  const measured = context.measureText(WORD).width
  if (measured > room) {
    size *= room / measured
    context.font = `italic 900 ${size}px ${SERIF}`
    context.letterSpacing = `${-0.03 * size}px`
  }
  context.fillText(WORD, pad, layoutHeight - 0.42 * size)
  if (layoutWidth < COLOPHON_MIN_WIDTH) {
    return
  }

  context.fillStyle = "#0f0"
  const unit = Math.min(layoutWidth / 600, layoutHeight / 375)
  const small = Math.min(8.5 * unit, 11)
  context.font = `600 ${small}px ${SANS}`
  context.letterSpacing = `${0.19 * small}px`
  // Caps centre on the 44px ink control that shares the top row.
  context.fillText("SUBFRAME PRINT ROOM", pad, 36 + 0.36 * small)
}

// The sheet is CPU-backed so the upload skips a GPU readback, and emptied afterwards so its RGBA store is not kept alive.
function uploadPlates(gl: WebGLRenderingContext, layoutWidth: number, layoutHeight: number) {
  const plates = document.createElement("canvas")
  plates.width = gl.drawingBufferWidth
  plates.height = gl.drawingBufferHeight
  const context = plates.getContext("2d", { willReadFrequently: true })
  if (!context) {
    return false
  }
  paintPlates(context, layoutWidth, layoutHeight)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plates)
  plates.width = 0
  plates.height = 0
  return true
}

export default function RisoOverprintExample({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})
  const timeRef = useRef(STILL_TIME)
  const contextLeaseRef = useRef(0)
  const inkRef = useRef(3)
  const [ink, setInk] = useState(3)
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
    let uniforms: Uniforms | null = null
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduce = preference.matches
    setReduced(reduce)
    // Link status is polled on later frames so the shader compiles without blocking the main thread.
    const parallel = gl.getExtension("KHR_parallel_shader_compile")
    const shaders: WebGLShader[] = []
    const compile = (type: number, code: string) => {
      const shader = gl.createShader(type)
      if (!shader) {
        return null
      }
      shaders.push(shader)
      gl.shaderSource(shader, code)
      gl.compileShader(shader)
      return shader
    }
    const vertex = compile(
      gl.VERTEX_SHADER,
      "attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}",
    )
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    const buffer = gl.createBuffer()
    const texture = gl.createTexture()
    const release = () => {
      shaders.forEach((shader) => gl.deleteShader(shader))
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
      gl.deleteTexture(texture)
    }
    if (!vertex || !fragment || !program || !buffer || !texture) {
      release()
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.bindAttribLocation(program, 0, "a_position")
    gl.linkProgram(program)
    gl.flush()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    let pixel = 1
    const fail = () => {
      lost = true
      cancelAnimationFrame(frame)
      setAvailable(false)
    }
    const draw = () => {
      if (disposed || lost || !uniforms) {
        return
      }
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.time, reduce ? STILL_TIME : timeRef.current)
      gl.uniform1f(uniforms.ink, (inkRef.current - 1) / 4)
      gl.uniform1f(uniforms.pixel, pixel)
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
      if (disposed || lost || !uniforms) {
        return
      }
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
      draw()
      if (runningRef.current && !reduce && !document.hidden) {
        frame = requestAnimationFrame(tick)
      }
    }
    const resize = () => {
      if (disposed || lost) {
        return
      }
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) {
        return
      }
      // Size the drawing buffer from displayed pixels, including ancestor scale.
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)))
      const nextWidth = Math.max(1, Math.round(width * ratio))
      const nextHeight = Math.max(1, Math.round(height * ratio))
      if (canvas.width === nextWidth && canvas.height === nextHeight) {
        return
      }
      canvas.width = nextWidth
      canvas.height = nextHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      pixel = canvas.width / canvas.clientWidth
      if (!uploadPlates(gl, canvas.clientWidth, canvas.clientHeight)) {
        fail()
        return
      }
      draw()
    }
    const start = () => {
      frame = 0
      if (disposed || lost) {
        return
      }
      if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
        frame = requestAnimationFrame(start)
        return
      }
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        release()
        gl.getExtension("WEBGL_lose_context")?.loseContext()
        return
      }
      gl.useProgram(program)
      gl.uniform1i(gl.getUniformLocation(program, "u_plates"), 0)
      uniforms = {
        resolution: gl.getUniformLocation(program, "u_resolution"),
        time: gl.getUniformLocation(program, "u_time"),
        ink: gl.getUniformLocation(program, "u_ink"),
        pixel: gl.getUniformLocation(program, "u_pixel"),
      }
      setAvailable(true)
      sync()
    }
    const updatePreference = () => {
      reduce = preference.matches
      setReduced(reduce)
      sync()
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      fail()
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
    frame = requestAnimationFrame(start)
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
      release()
      // Defer context release so React Strict Mode can reacquire this canvas.
      queueMicrotask(releaseContext)
    }
  }, [])

  useEffect(() => {
    syncRef.current()
  }, [active, paused, ink])

  return (
    <div
      className="sg-riso-overprint"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        containerType: "size",
        background: "#f4ecdd",
        color: "#5c1218",
      }}
    >
      <div className="sg-riso-overprint-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A two-color risograph print: an orange swell and a burgundy veil drift slowly and overprint into rust above the word Pigment, printed in both inks."
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: available ? 1 : 0 }}
      />
      {!available && (
        <svg className="sg-riso-overprint-proof" aria-hidden="true">
          <text x="4%" y="100%" dy="-0.42em">
            {WORD}
          </text>
        </svg>
      )}
      {!available && (
        <span className="sg-riso-overprint-colophon" aria-hidden="true">
          SUBFRAME PRINT ROOM
        </span>
      )}
      {available && (
        <label className="sg-riso-overprint-control">
          <span>Ink</span>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={ink}
            aria-valuetext={`Print density ${ink} of 5`}
            onChange={(event) => {
              const value = Number(event.currentTarget.value)
              inkRef.current = value
              setInk(value)
            }}
          />
          <output aria-hidden="true">{ink}</output>
        </label>
      )}
      {available && !reduced && (
        <button
          className="sg-riso-overprint-pause"
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
.sg-riso-overprint *{box-sizing:border-box}
.sg-riso-overprint-fallback{position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 -2.2 2.3 0 0 0 -2.2 2.3 0 0 0 -2.2 2.3 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E"),linear-gradient(#743447 0 5%,#9a4235 11%,#c4533380 15%,transparent 19%),linear-gradient(190deg,#e0653b 0 21%,#f27543 26% 36%,#f3946c 40%,#f3b495 45%,#f1d4c0 50%,transparent 56%);background-color:#f4ecdd;background-blend-mode:multiply,normal,normal}
.sg-riso-overprint-proof{position:absolute;inset:0;width:100%;height:100%;overflow:visible;font:italic 900 min(19cqw,30cqh) ${SERIF};letter-spacing:-.03em;fill:currentColor}
.sg-riso-overprint-colophon{position:absolute;left:4cqw;top:calc(36px - .6em);color:#f4ecdd;font:600 min(1.42cqw,2.27cqh,11px)/1 ${SANS};letter-spacing:.19em}
.sg-riso-overprint-control{position:absolute;top:14px;right:10px;display:flex;align-items:center;gap:10px;min-height:44px;padding:0 4px;color:#f4ecdd;font:600 10px/1.2 ${SANS};letter-spacing:.14em;text-transform:uppercase}
.sg-riso-overprint-control input{width:72px;height:44px;margin:0;cursor:pointer;appearance:none;background:transparent;color:inherit}
.sg-riso-overprint-control input::-webkit-slider-runnable-track{height:1px;background:#f4ecdd88}
.sg-riso-overprint-control input::-webkit-slider-thumb{appearance:none;width:8px;height:14px;margin-top:-6.5px;border:0;border-radius:1px;background:currentColor}
.sg-riso-overprint-control input::-moz-range-track{height:1px;background:#f4ecdd88}
.sg-riso-overprint-control input::-moz-range-thumb{width:8px;height:14px;border:0;border-radius:1px;background:currentColor}
.sg-riso-overprint-control output{min-width:1ch;font-variant-numeric:tabular-nums;letter-spacing:0}
@container (width < ${COLOPHON_MIN_WIDTH}px){.sg-riso-overprint-colophon{display:none}.sg-riso-overprint-control{gap:8px}.sg-riso-overprint-control input{width:52px}}
.sg-riso-overprint-pause{position:absolute;right:8px;bottom:8px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;color:inherit;background:transparent;cursor:pointer}
.sg-riso-overprint-pause::before{content:"";position:absolute;inset:6px;border:1px solid currentColor}
.sg-riso-overprint-pause:focus-visible,.sg-riso-overprint-control input:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.sg-riso-overprint-pause:disabled{opacity:.5;cursor:default}
`}</style>
    </div>
  )
}
