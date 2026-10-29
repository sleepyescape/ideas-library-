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
function useReduced() {
  const [reduced, setReduced] = React.useState(true)
  React.useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return reduced
}

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`
const FRAG = `
precision highp float;
uniform vec2 uSize;
uniform float uTime,uEnergy,uState;
float band(float x,float w){return 1.-smoothstep(w,w+.035,abs(x));}
void main(){
 vec2 p=(gl_FragCoord.xy*2.-uSize)/min(uSize.x,uSize.y);
 p*=1.12;
 float theta=atan(p.y,p.x), r=length(p);
 float listening=1.-smoothstep(.0,.65,abs(uState-1.));
 float speaking=smoothstep(1.,1.9,uState);
 float power=uEnergy;
 float phrase=.55+.25*sin(uTime*5.1)+.2*sin(uTime*8.7+.8);
 float edge=.73+speaking*power*(.095*phrase+.115*sin(theta*5.+uTime*3.2)*sin(theta*3.-uTime*1.7));
 edge+=listening*.012*power*sin(theta*4.+uTime*.6);
 float cover=1.-smoothstep(edge-.003,edge+.004,r);
 float z=sqrt(max(0.,1.-pow(r/edge,2.)));
 vec3 n=normalize(vec3(p/edge,z));
 float drift=uTime*(.14+speaking*.48);
 float twist=n.y*5.2+sin(n.x*3.1+drift)*1.7;
 float a=atan(n.x,n.z)+twist*.45;
 float layers=sin(a*(7.+speaking*6.)+sin(n.y*8.-drift*1.4)*(.8+power*2.4)+drift);
 float ink=smoothstep(-.4,.8,layers);
 float fold=pow(max(0.,1.-abs(layers)),5.);
 float light=max(0.,dot(n,normalize(vec3(-.6,.7,1.))));
 vec3 dark=vec3(.025,.18,.41), blue=vec3(.075,.42,.91), pale=vec3(.66,.86,.98);
 vec3 c=mix(dark,blue,ink);
 c=mix(c,c*vec3(.84,1.2,1.07),speaking*.5);
 c=mix(c,pale,fold*(.4+.5*light));
 c*=.65+light*.5;
 float fresnel=pow(1.-max(n.z,0.),3.);
 c=mix(c,vec3(.40,.78,.98),fresnel*.75);
 float intake=band(sin(r*34.+uTime*2.5+sin(theta*3.+uTime*.4)*.75),.06);
 c=mix(c,vec3(.70,.94,1.),intake*listening*(.09+power*.20));
 float syllable=band(sin(theta*8.+sin(r*12.-uTime*5.)*1.9),.15);
 c+=syllable*speaking*power*.22*vec3(.22,.72,1.);
 float spec=pow(max(0.,dot(reflect(-normalize(vec3(-.4,.7,1.)),n),vec3(0.,0.,1.))),30.);
 c+=spec*.75;
 vec3 bg=vec3(.941,.957,.965);
 float halo=exp(-pow((r-edge)*9.,2.))*.13;
 bg=mix(bg,vec3(.31,.59,.84),halo);
 float ripple=band(sin((r-edge)*24.-uTime*5.),.045)*smoothstep(edge+.025,edge+.09,r)*(1.-smoothstep(.89,1.08,r));
 bg=mix(bg,vec3(.32,.61,.86),ripple*speaking*power*.36);
 gl_FragColor=vec4(mix(bg,c,cover),1.);
}`
export default function Example({ active = true }: { active?: boolean }) {
  const canvas = React.useRef<HTMLCanvasElement>(null),
    [state, setState] = React.useState(1),
    [energy, setEnergy] = React.useState(0.55),
    [lost, setLost] = React.useState(0),
    [error, setError] = React.useState(false)
  const reduced = useReduced(),
    config = React.useRef({ state, energy, active, reduced })
  config.current = { state, energy, active, reduced }
  React.useEffect(() => {
    const c = canvas.current
    if (!c) {
      return
    }
    const gl = c.getContext("webgl", { alpha: false, antialias: true })
    if (!gl) {
      setError(true)
      return
    }
    let frame = 0,
      dead = false,
      phase = 0,
      last = 0,
      smoothedState = 1,
      smoothedEnergy = 0.55
    const shaders: WebGLShader[] = []
    function compile(type: number, source: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, source)
      gl!.compileShader(s)
      shaders.push(s)
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      setError(true)
      shaders.forEach((s) => gl.deleteShader(s))
      gl.deleteProgram(p)
      return
    }
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    gl.useProgram(p)
    const a = gl.getAttribLocation(p, "a")
    gl.enableVertexAttribArray(a)
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
    const uSize = gl.getUniformLocation(p, "uSize"),
      uTime = gl.getUniformLocation(p, "uTime"),
      uEnergy = gl.getUniformLocation(p, "uEnergy"),
      uState = gl.getUniformLocation(p, "uState")
    function draw(now: number) {
      if (dead) {
        return
      }
      const v = config.current
      if (last && v.active && !v.reduced && !document.hidden) {
        phase += Math.min(50, now - last) / 1000
      }
      const dt = last ? Math.min(50, now - last) / 1000 : 0
      last = now
      const blend = v.reduced || !v.active ? 1 : 1 - Math.exp(-dt * 8)
      smoothedState += (v.state - smoothedState) * blend
      smoothedEnergy += ((v.state === 0 ? 0.06 : v.energy) - smoothedEnergy) * blend
      gl!.uniform2f(uSize, c!.width, c!.height)
      gl!.uniform1f(uTime, phase)
      gl!.uniform1f(uEnergy, smoothedEnergy)
      gl!.uniform1f(uState, smoothedState)
      gl!.drawArrays(gl!.TRIANGLES, 0, 6)
      if (v.active && !v.reduced && !document.hidden) {
        frame = requestAnimationFrame(draw)
      }
    }
    const refresh = () => {
      cancelAnimationFrame(frame)
      last = 0
      draw(performance.now())
    }
    const resize = () => {
      if (dead) {
        return
      }
      const r = c!.getBoundingClientRect()
      if (!r.width || !r.height) {
        return
      }
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3600000 / (r.width * r.height))),
        w = Math.max(1, Math.round(r.width * dpr)),
        h = Math.max(1, Math.round(r.height * dpr))
      if (c!.width !== w || c!.height !== h) {
        c!.width = w
        c!.height = h
        gl!.viewport(0, 0, w, h)
      }
      refresh()
    }
    const ro = new ResizeObserver(resize)
    const transforms = new MutationObserver(resize)
    for (let node: HTMLElement | null = c; node; node = node.parentElement) {
      ro.observe(node)
      transforms.observe(node, { attributes: true, attributeFilter: ["style", "class"] })
    }
    document.addEventListener("visibilitychange", refresh)
    window.addEventListener("resize", resize)
    const loss = (e: Event) => {
        e.preventDefault()
        dead = true
        cancelAnimationFrame(frame)
        setError(true)
      },
      restore = () => {
        setError(false)
        setLost((v) => v + 1)
      }
    c.addEventListener("webglcontextlost", loss)
    c.addEventListener("webglcontextrestored", restore)
    ;(c as HTMLCanvasElement & { refresh?: () => void }).refresh = refresh
    resize()
    return () => {
      dead = true
      cancelAnimationFrame(frame)
      ro.disconnect()
      transforms.disconnect()
      document.removeEventListener("visibilitychange", refresh)
      window.removeEventListener("resize", resize)
      c.removeEventListener("webglcontextlost", loss)
      c.removeEventListener("webglcontextrestored", restore)
      delete (c as HTMLCanvasElement & { refresh?: () => void }).refresh
      gl.deleteBuffer(buffer)
      shaders.forEach((s) => gl.deleteShader(s))
      gl.deleteProgram(p)
    }
  }, [lost])
  React.useEffect(() => {
    ;(canvas.current as (HTMLCanvasElement & { refresh?: () => void }) | null)?.refresh?.()
  }, [state, energy, active, reduced])
  return (
    <div className="sf-sonic-orb">
      <section className="avatar">
        <canvas ref={canvas} role="img" aria-label={"Voice avatar: " + ["idle", "listening", "speaking"][state]} />
        {error && <p className="error">WebGL is unavailable.</p>}
        <nav aria-label="Voice state preview">
          {["Idle", "Listen", "Speak"].map((s, i) => (
            <button disabled={!active} key={s} aria-pressed={state === i} onClick={() => setState(i)}>
              {s}
            </button>
          ))}
        </nav>
        <label>
          <span>Energy</span>
          <input
            disabled={!active || state === 0}
            aria-label="Voice energy"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={energy}
            onChange={(e) => setEnergy(+e.target.value)}
          />
          <output>{Math.round(energy * 100)}%</output>
        </label>
      </section>
      <style>{`.sf-sonic-orb{width:100%;height:100%;min-height:260px;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:16px;background:#f4f4f3;color:#191a1b;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;isolation:isolate;overflow:hidden;container-type:inline-size}.sf-sonic-orb *{box-sizing:border-box}.sf-sonic-orb button,.sf-sonic-orb input,.sf-sonic-orb select,.sf-sonic-orb textarea{font:inherit;color:inherit}.sf-sonic-orb button{cursor:pointer;touch-action:manipulation}.sf-sonic-orb button:disabled{cursor:default;opacity:.45}.sf-sonic-orb :focus-visible{outline:2px solid #2767dc;outline-offset:3px}.sf-sonic-orb input[type=range]{min-height:44px;accent-color:currentColor;min-width:0}.sf-sonic-orb .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sf-sonic-orb[data-paused=true] *{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){.sf-sonic-orb *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}.sf-sonic-orb{background:#f0f4f6;padding:14px;color:#314661}.sf-sonic-orb .avatar{width:min(100%,420px);position:relative}.sf-sonic-orb canvas{width:100%;height:258px;display:block}.sf-sonic-orb nav{display:flex;justify-content:center;gap:4px;margin-top:-9px}.sf-sonic-orb button{min-width:71px;min-height:44px;background:none;border:0;border-radius:6px;color:#778493;font-size:11px}.sf-sonic-orb button[aria-pressed=true]{color:#254470;background:#dce7ef;box-shadow:inset 0 1px 2px #5b799622,0 1px 0 #fff}.sf-sonic-orb label{display:flex;align-items:center;gap:13px;font-size:10px;padding:0 74px;color:#8795a6}.sf-sonic-orb input{width:100%;accent-color:#426aa1}.sf-sonic-orb output{font:10px ui-monospace,monospace;min-width:25px}.sf-sonic-orb .error{position:absolute;top:90px;left:0;right:0;text-align:center;font-size:12px}@container(max-width:330px){.sf-sonic-orb canvas{height:240px}}`}</style>
    </div>
  )
}
