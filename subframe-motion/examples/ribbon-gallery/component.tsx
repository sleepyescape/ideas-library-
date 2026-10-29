/**
 * MIT License
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
import * as React from "react"

const PRINTS = [
  {
    src: "/motion/assets/suruga-wind.webp",
    title: "Wind",
    alt: "Travelers and reeds swept by wind beneath Mount Fuji",
  },
  { src: "/motion/assets/fuji-storm.webp", title: "Storm", alt: "A red mountain rising above a dramatic black storm" },
  { src: "/motion/assets/plum-garden.webp", title: "Plum", alt: "A curved flowering plum branch against a red sky" },
]
const VERTEX = `precision highp float;attribute vec2 aPosition;attribute vec2 aUv;attribute float aBand;uniform float uProgress;uniform vec2 uScale;varying vec2 vUv;varying float vBand;void main(){vUv=aUv;vBand=aBand;float envelope=sin(uProgress*3.14159265);float edge=pow(abs(aPosition.x),2.5);float wave=sin(aPosition.x*4.0+aBand*1.15+uProgress*4.0);float x=aPosition.x+edge*wave*envelope*.16;float y=aPosition.y+edge*sin(aBand*.63+uProgress*5.0)*envelope*.16;float z=edge*cos(aBand*.72+uProgress*4.0)*envelope*.38;float perspective=1.0/(1.0-z*.35);gl_Position=vec4(x*uScale.x*perspective,y*uScale.y*perspective,0.0,1.0);}`
const FRAGMENT = `precision highp float;uniform sampler2D uFrom;uniform sampler2D uTo;uniform float uProgress;varying vec2 vUv;varying float vBand;void main(){float boundary=uProgress*1.5-.25;float edge=smoothstep(boundary-.11,boundary+.11,vUv.x+sin(vBand*.72)*.09);float blend=1.0-edge;if(uProgress<.001)blend=0.0;if(uProgress>.999)blend=1.0;vec4 color=mix(texture2D(uFrom,vUv),texture2D(uTo,vUv),blend);gl_FragColor=color;}`
export default function Example({ active = true }: { active?: boolean }) {
  const canvas = React.useRef<HTMLCanvasElement>(null),
    draw = React.useRef<() => void>(() => {}),
    request = React.useRef(0),
    current = React.useRef(0),
    next = React.useRef(1),
    progress = React.useRef(0),
    progressBar = React.useRef<HTMLSpanElement>(null),
    quiet = React.useRef(false),
    allowed = React.useRef(active),
    drag = React.useRef<{ id: number; x: number; start: number } | null>(null)
  const [index, setIndex] = React.useState(0),
    [ready, setReady] = React.useState(false),
    [fallback, setFallback] = React.useState(false)
  const resume = React.useRef<() => void>(() => {})
  allowed.current = active
  React.useEffect(() => {
    const el = canvas.current
    if (!el) {
      return
    }
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      sync = () => {
        quiet.current = media.matches
        if (media.matches && progress.current > 0) {
          cancelAnimationFrame(request.current)
          commit(next.current)
        }
      }
    sync()
    media.addEventListener("change", sync)
    const gl = el.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) {
      setFallback(true)
      return () => media.removeEventListener("change", sync)
    }
    let alive = true,
      program: WebGLProgram | null = null,
      buffer: WebGLBuffer | null = null
    const shaders: WebGLShader[] = [],
      textures: WebGLTexture[] = [],
      images: HTMLImageElement[] = []
    try {
      const shader = (kind: number, source: string) => {
        const item = gl.createShader(kind)
        if (!item) {
          throw Error("Shader unavailable")
        }
        shaders.push(item)
        gl.shaderSource(item, source)
        gl.compileShader(item)
        if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) {
          throw Error("Shader unavailable")
        }
        return item
      }
      program = gl.createProgram()
      if (!program) {
        throw Error("Renderer unavailable")
      }
      gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX))
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw Error("Renderer unavailable")
      }
      gl.useProgram(program)
      const data: number[] = [],
        bands = 26,
        segments = 44
      for (let band = 0; band < bands; band++) {
        for (let segment = 0; segment < segments; segment++) {
          const push = (x: number, y: number) => {
            const u = x / segments,
              v = (band + y) / bands
            data.push(u * 2 - 1, 1 - v * 2, u, 1 - v, band)
          }
          push(segment, 0)
          push(segment + 1, 0)
          push(segment, 1)
          push(segment, 1)
          push(segment + 1, 0)
          push(segment + 1, 1)
        }
      }
      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
      for (const [name, length, offset] of [
        ["aPosition", 2, 0],
        ["aUv", 2, 8],
        ["aBand", 1, 16],
      ] as const) {
        const loc = gl.getAttribLocation(program, name)
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, length, gl.FLOAT, false, 20, offset)
      }
      const progressUniform = gl.getUniformLocation(program, "uProgress"),
        scaleUniform = gl.getUniformLocation(program, "uScale"),
        fromUniform = gl.getUniformLocation(program, "uFrom"),
        toUniform = gl.getUniformLocation(program, "uTo")
      const loaded = new Set<number>()
      const aspects: number[] = []
      draw.current = () => {
        if (!alive || !program || !loaded.has(current.current) || !loaded.has(next.current)) {
          return
        }
        gl.viewport(0, 0, el.width, el.height)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.useProgram(program)
        gl.uniform1f(progressUniform, progress.current)
        const imageAspect =
          aspects[current.current] + (aspects[next.current] - aspects[current.current]) * progress.current
        const canvasAspect = el.width / el.height
        gl.uniform2f(
          scaleUniform,
          0.82 * Math.min(1, imageAspect / canvasAspect),
          0.82 * Math.min(1, canvasAspect / imageAspect),
        )
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textures[current.current])
        gl.uniform1i(fromUniform, 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, textures[next.current])
        gl.uniform1i(toUniform, 1)
        gl.drawArrays(gl.TRIANGLES, 0, data.length / 5)
      }
      PRINTS.forEach((print, i) => {
        const texture = gl.createTexture()
        if (!texture) {
          throw Error("Texture unavailable")
        }
        textures.push(texture)
        const img = new Image()
        images.push(img)
        img.onload = () => {
          if (!alive) {
            return
          }
          try {
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
            aspects[i] = img.naturalWidth / img.naturalHeight
            loaded.add(i)
            if (loaded.size === PRINTS.length) {
              setReady(true)
              draw.current()
            }
          } catch {
            setFallback(true)
          }
        }
        img.onerror = () => {
          if (alive) {
            setFallback(true)
          }
        }
        img.src = print.src
      })
    } catch {
      setFallback(true)
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
    const ro = new ResizeObserver(resize)
    const transforms = new MutationObserver(resize)
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
      ro.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    window.addEventListener("resize", resize)
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(request.current)
      } else if (allowed.current && progress.current > 0) {
        resume.current()
      }
    }
    document.addEventListener("visibilitychange", visibility)
    const lost = (event: Event) => {
      event.preventDefault()
      cancelAnimationFrame(request.current)
      setFallback(true)
    }
    el.addEventListener("webglcontextlost", lost)
    return () => {
      alive = false
      cancelAnimationFrame(request.current)
      ro.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", visibility)
      el.removeEventListener("webglcontextlost", lost)
      media.removeEventListener("change", sync)
      images.forEach((img) => {
        img.onload = null
        img.onerror = null
      })
      textures.forEach((t) => gl.deleteTexture(t))
      shaders.forEach((s) => gl.deleteShader(s))
      if (buffer) {
        gl.deleteBuffer(buffer)
      }
      if (program) {
        gl.deleteProgram(program)
      }
      draw.current = () => {}
    }
  }, [])
  React.useEffect(() => {
    if (!active) {
      cancelAnimationFrame(request.current)
      drag.current = null
    } else if (progress.current > 0) {
      resume.current()
    }
  }, [active])
  function syncProgress() {
    if (progressBar.current) {
      progressBar.current.style.transform = `scaleX(${progress.current})`
    }
  }
  function commit(i: number) {
    current.current = (i + PRINTS.length) % PRINTS.length
    next.current = (current.current + 1) % PRINTS.length
    progress.current = 0
    setIndex(current.current)
    if (progressBar.current) {
      progressBar.current.style.transform = "scaleX(0)"
    }
    draw.current()
  }
  function transition(i: number, instant = false) {
    cancelAnimationFrame(request.current)
    const destination = (i + PRINTS.length) % PRINTS.length
    if (instant || quiet.current || fallback || !ready || !active) {
      commit(destination)
      return
    }
    next.current = destination
    const from = progress.current
    let start = 0
    const tick = (t: number) => {
      if (!allowed.current || document.hidden) {
        return
      }
      start ||= t
      const f = Math.min(1, (t - start) / Math.max(80, 650 * (1 - from))),
        e = f * f * (3 - 2 * f)
      progress.current = from + (1 - from) * e
      syncProgress()
      draw.current()
      if (f < 1) {
        request.current = requestAnimationFrame(tick)
      } else {
        commit(destination)
      }
    }
    request.current = requestAnimationFrame(tick)
  }
  resume.current = () => transition(next.current)
  return (
    <div className="sf-ribbon-gallery">
      <header>
        <b>FORM / EDITIONS</b>
        <span>{String(index + 1).padStart(2, "0")} — 03</span>
      </header>
      <div
        className="rg-art"
        onPointerDown={(e) => {
          if (e.button !== 0 || !active || fallback || !ready || quiet.current) {
            return
          }
          cancelAnimationFrame(request.current)
          next.current = (current.current + 1) % PRINTS.length
          drag.current = { id: e.pointerId, x: e.clientX, start: progress.current }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d || d.id !== e.pointerId) {
            return
          }
          progress.current = Math.max(
            0,
            Math.min(0.999, d.start + ((d.x - e.clientX) / e.currentTarget.getBoundingClientRect().width) * 1.5),
          )
          syncProgress()
          draw.current()
        }}
        onPointerUp={() => {
          if (!drag.current) {
            return
          }
          drag.current = null
          if (progress.current > 0.12) {
            transition(next.current)
          } else {
            progress.current = 0
            syncProgress()
            draw.current()
          }
        }}
        onPointerCancel={() => {
          drag.current = null
          progress.current = 0
          syncProgress()
          draw.current()
        }}
        onLostPointerCapture={() => {
          drag.current = null
        }}
      >
        <canvas
          ref={canvas}
          role="img"
          aria-label={PRINTS[index].alt}
          style={{ visibility: ready && !fallback ? "visible" : "hidden" }}
        />
        {(!ready || fallback) && <img className="rg-fallback" src={PRINTS[index].src} alt={PRINTS[index].alt} />}
      </div>
      <footer>
        <div>
          <span>WOODBLOCK STUDIES</span>
          <h3>{PRINTS[index].title}</h3>
        </div>
        <div className="rg-controls">
          <button aria-label="Previous print" onClick={(e) => transition(current.current - 1, e.detail === 0)}>
            ←
          </button>
          <button aria-label="Next print" onClick={(e) => transition(current.current + 1, e.detail === 0)}>
            →
          </button>
        </div>
      </footer>
      <div className="rg-progress" aria-hidden="true">
        <span ref={progressBar} style={{ transform: "scaleX(0)" }} />
      </div>
      <style>{`.sf-ribbon-gallery{position:relative;isolation:isolate;width:100%;height:100%;min-height:280px;overflow:hidden;background:#181716;color:#efe7d7;font-family:Arial,sans-serif;container-type:size}.sf-ribbon-gallery *{box-sizing:border-box}.sf-ribbon-gallery header{position:absolute;top:20px;left:22px;right:22px;display:flex;justify-content:space-between;font:9px monospace;letter-spacing:.02em;z-index:1;pointer-events:none}.sf-ribbon-gallery header b{font-weight:400;letter-spacing:.12em}.sf-ribbon-gallery header>span{color:#a39a8e}.sf-ribbon-gallery .rg-art{position:absolute;inset:35px 0 62px;touch-action:pan-y;cursor:grab}.sf-ribbon-gallery .rg-art:active{cursor:grabbing}.sf-ribbon-gallery canvas{width:100%;height:100%;display:block}.sf-ribbon-gallery .rg-fallback{position:absolute;top:9%;left:9%;width:82%;height:82%;object-fit:contain}.sf-ribbon-gallery footer{position:absolute;left:22px;right:17px;bottom:16px;display:flex;align-items:center;justify-content:space-between}.sf-ribbon-gallery footer>div>span{font:7px monospace;letter-spacing:.11em;color:#a79e92}.sf-ribbon-gallery h3{margin:3px 0 0;font:24px Georgia,serif;font-weight:400;letter-spacing:-.03em}.sf-ribbon-gallery .rg-controls{display:flex;gap:6px}.sf-ribbon-gallery button{height:44px;width:44px;border:1px solid #776e624f;border-radius:50%;background:none;color:inherit;font:18px Arial;cursor:pointer;touch-action:manipulation}.sf-ribbon-gallery button:hover{background:#ffffff0b}.sf-ribbon-gallery button:focus-visible{outline:2px solid #e18c4f;outline-offset:3px}.sf-ribbon-gallery .rg-progress{position:absolute;left:0;right:0;bottom:0;height:2px;background:#ffffff0a}.sf-ribbon-gallery .rg-progress>span{display:block;width:100%;height:100%;background:#f19b5d;transform-origin:left}@container(max-width:400px){.sf-ribbon-gallery header{left:16px;right:16px;font-size:8px}.sf-ribbon-gallery footer{left:16px;right:12px}.sf-ribbon-gallery h3{font-size:22px}}`}</style>
    </div>
  )
}
