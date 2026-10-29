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

const MARK = "CHROMA"
// Solver cells per stage height. The word is rasterized SUPERSAMPLE times finer to place its outline.
const CELLS = 128
const SUPERSAMPLE = 2
// Open margin around the stage, in stage heights, so the far field is not pinned to the frame.
const MARGIN = 0.25
// Boundary layer the air keeps around the word's hull, in cells.
const GROWTH = 1.5
// Free-stream speed of the light, in stage heights per second.
const FLOW_SPEED = 0.12
const DEFAULT_ANGLE = 18
const MAX_ANGLE = 38
// Above this angle the flow separates from the back of the word.
const STALL_ANGLE = 22

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_separation;
uniform sampler2D u_flow;
uniform sampler2D u_aux;
uniform vec2 u_grid;
uniform float u_cell;
uniform float u_margin;
uniform float u_aspect;
uniform float u_reach;
uniform float u_tmax;
uniform vec2 u_heading;
uniform float u_lead;
uniform float u_span;

float unpack(vec2 bytes) {
  return dot(bytes, vec2(65280.0, 255.0) / 65535.0);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float bottom = mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x);
  float top = mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x);
  return mix(bottom, top, f.y);
}

// One random level per integer, smoothly joined: each streamline gets its own strand brightness.
float strands(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(vec2(i, 0.0)), hash(vec2(i + 1.0, 0.0)), f * f * (3.0 - 2.0 * f));
}

vec2 texel(vec2 uv) {
  vec4 bytes = texture2D(u_flow, uv);
  return vec2(unpack(bytes.rg), unpack(bytes.ba));
}

// Stream function relative to the word's own streamline, and time of flight, at p, decoded from steer()'s packing.
// Their 16-bit packing cannot be filtered by the GPU, so the four nearest texels are blended here.
vec2 flowAt(vec2 p) {
  vec2 g = (p + u_margin) / u_cell - 0.5;
  vec2 f = fract(g);
  vec2 uv = (floor(g) + 0.5) / u_grid;
  vec2 texelSize = 1.0 / u_grid;
  vec2 bottom = mix(texel(uv), texel(uv + vec2(texelSize.x, 0.0)), f.x);
  vec2 top = mix(texel(uv + vec2(0.0, texelSize.y)), texel(uv + texelSize), f.x);
  vec2 v = mix(bottom, top, f.y);
  return vec2((v.x * 2.0 - 1.0) * u_reach, v.y * u_tmax);
}

float band(float x) {
  return exp(-x * x);
}

// Smooth minimum, so capping the light near the ink leaves no hard contour.
float softMin(float a, float b, float k) {
  float t = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, t) - k * t * (1.0 - t);
}

vec3 ramp(float h) {
  vec3 color = mix(vec3(0.066, 0.012, 0.024), vec3(0.235, 0.043, 0.075), smoothstep(0.0, 0.2, h));
  color = mix(color, vec3(0.55, 0.13, 0.095), smoothstep(0.2, 0.42, h));
  color = mix(color, vec3(0.85, 0.4, 0.12), smoothstep(0.42, 0.64, h));
  color = mix(color, vec3(0.955, 0.64, 0.25), smoothstep(0.64, 0.82, h));
  return mix(color, vec3(0.985, 0.88, 0.65), smoothstep(0.82, 1.0, h));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = vec2(uv.x * u_aspect, uv.y);
  vec2 flow = flowAt(p);
  // Air speed relative to the free stream, then distances to the ink and to the word's air body in stage heights.
  vec3 aux = texture2D(u_aux, (p + u_margin) / u_cell / u_grid).rgb * vec3(4.0, 0.12, 0.12);
  float psi = flow.x;
  float speed = aux.r;
  // Past the stall angle the streams over the back of the word lift away from it, leaving a still wake.
  float downstream = (dot(p, u_heading) - u_lead) / u_span;
  float lift = 0.1 * u_separation * smoothstep(0.3, 1.2, downstream);
  // The word's own streamline bounds the wake from below; fading it there keeps the word's interior continuous.
  float wake = smoothstep(0.0, 0.03, lift - psi) * smoothstep(-0.02, 0.0, psi);
  float q = psi > 0.0 ? max(psi - lift, 0.0) : psi;
  float tau = flow.y - u_time * u_speed;

  // Two slow tides, about 24 and 30 seconds long, breathe the streams' width, place and brightness.
  float breath = sin(u_time * 0.26);
  float swell = sin(u_time * 0.21 + 1.3);
  float over = band((q - 0.075 - 0.018 * breath) / (0.05 + 0.012 * swell));
  float under = band((q + 0.11 + 0.018 * breath) / (0.05 - 0.01 * swell));
  // Broad amber gusts drift downstream along the streams at the local air speed.
  float gust = smoothstep(0.3, 0.9, noise(vec2(q * 2.6 + 4.0, tau * 0.5)));
  float strand = strands(q * 5.0 + 1.7 + 0.3 * swell);
  float far = strand * strand * strand * (0.35 + 0.9 * gust);
  // Streams far from the word fall out of focus, which separates the type plane from the atmosphere.
  float focus = exp(-abs(q) * 3.0);
  // The silk fades out before its strands get thinner than a pixel.
  float footprint = speed / u_resolution.y;
  float breaks = (0.25 + 0.75 * focus) * (0.55 + 0.9 * noise(vec2(q * 55.0, tau * 0.9)));
  float silk = 1.0 + 0.5 * breaks * (strands(q * 70.0) - 0.5) * (1.0 - smoothstep(0.22, 0.5, footprint * 70.0));
  float pulse = 0.45 + 1.1 * noise(vec2(q * 12.0, tau * 1.6));
  float light = (over + 0.62 * under + 0.8 * far) * silk * pulse * mix(0.62, 1.45, smoothstep(0.7, 1.9, speed));
  light *= 1.0 - 0.85 * wake;

  // The slow air hugging the word carries madder rather than darkness.
  float sheath = band(q / 0.05);
  float h = 0.19 + 0.09 * gust + 0.04 * smoothstep(-0.5, 0.5, q) + 0.03 * breath + 0.05 * sheath + 0.56 * light;
  h *= 1.0 - 0.22 * dot(uv - 0.5, uv - 0.5);
  // A thin oxblood ring holds the light off the glyph edges, and the bright streams are capped along the word's
  // smooth hull rather than its letters, so their edge stays clean over the cap line.
  float ring = 0.38 + 0.2 * smoothstep(0.004, 0.014, aux.g) + 0.62 * smoothstep(0.014, 0.026, aux.g);
  float ceiling = min(ring, 0.55 + 0.65 * smoothstep(0.006, 0.05, aux.b));
  h = softMin(h, ceiling, 0.1);
  vec3 color = ramp(h);
  color = mix(color, color * vec3(0.92, 0.62, 0.78), (1.0 - focus) * 0.35);
  // Triangular dither: the dark end of the ramp bands visibly in 8 bits without it.
  color += (hash(gl_FragCoord.xy) + hash(gl_FragCoord.xy + vec2(17.3, 9.1)) - 1.0) / 255.0;
  gl_FragColor = vec4(color, 1.0);
}
`

type Grid = { cover: Float32Array; columns: number; rows: number }

type SolveRequest = {
  id: number
  aspect: number
  columns: number
  rows: number
  cell: number
  margin: number
  supersample: number
  growth: number
  degrees: number
  // Ink coverage of the word, SUPERSAMPLE times the grid resolution, bottom row first.
  alpha: Uint8Array
}

type Basis = {
  id: number
  aspect: number
  columns: number
  rows: number
  cell: number
  margin: number
  // Stream functions of unit flow along +x and along +y with the word held at zero, and of unit circulation
  // (one on the word, zero far away). Any heading is a weighted sum, so steering never re-solves.
  alongX: Float32Array
  alongY: Float32Array
  circulation: Float32Array
  // Stage heights to the glyphs' ink and to the word's air body.
  ink: Float32Array
  clearance: Float32Array
  left: number
  right: number
  middle: number
}

type SteerRequest = { id: number; degrees: number }

// Everything the shader needs for one heading of one solved word.
type Steered = {
  id: number
  degrees: number
  aspect: number
  columns: number
  rows: number
  flow: Uint8Array
  aux: Uint8Array
  reach: number
  tmax: number
  lead: number
  span: number
}

type Solver = { basis: Basis | null }

// The functions below also run inside an inline worker as source text, so they may only use their parameters,
// browser globals and each other, never other module-level names.

// Grows the region under a height profile by a disk of the given radius.
function dilate(profile: Float32Array, radius: number) {
  const out = new Float32Array(profile.length).fill(-Infinity)
  const reach = Math.floor(radius)
  for (let i = 0; i < profile.length; i++) {
    for (let d = Math.max(-reach, -i); d <= Math.min(reach, profile.length - 1 - i); d++) {
      out[i] = Math.max(out[i], profile[i + d] + Math.sqrt(radius * radius - d * d))
    }
  }
  return out
}

// Upper convex hull of a height profile, so the air rides over overshoots and letter gaps instead of dipping into them.
function hull(profile: Float32Array) {
  const corners: number[] = []
  for (let x = 0; x < profile.length; x++) {
    if (profile[x] === -Infinity) {
      continue
    }
    while (corners.length > 1) {
      const a = corners[corners.length - 2]
      const b = corners[corners.length - 1]
      if ((profile[b] - profile[a]) * (x - a) > (profile[x] - profile[a]) * (b - a)) {
        break
      }
      corners.pop()
    }
    corners.push(x)
  }
  const out = new Float32Array(profile.length).fill(-Infinity)
  for (let n = 0; n < corners.length; n++) {
    const a = corners[n]
    const b = corners[Math.min(n + 1, corners.length - 1)]
    for (let x = a; x <= b; x++) {
      out[x] = b === a ? profile[a] : profile[a] + ((profile[b] - profile[a]) * (x - a)) / (b - a)
    }
  }
  return out
}

// The air sees the word as one smooth body: the hull of its ink, grown by a boundary layer.
function airBody(alpha: Uint8Array, columns: number, rows: number, s: number, growth: number): Grid {
  const width = columns * s
  const top = new Float32Array(width).fill(-Infinity)
  // Negated, so the bottom edge goes through the same hull and dilation as the top.
  const bottom = new Float32Array(width).fill(-Infinity)
  for (let y = 0; y < rows * s; y++) {
    for (let x = 0; x < width; x++) {
      const a = alpha[y * width + x] / 255
      if (a === 0) {
        continue
      }
      top[x] = Math.max(top[x], y + a)
      bottom[x] = Math.max(bottom[x], a - 1 - y)
    }
  }
  const upper = dilate(hull(top), growth * s)
  const lower = dilate(hull(bottom), growth * s)
  const cover = new Float32Array(columns * rows)
  for (let x = 0; x < width; x++) {
    const high = upper[x] / s
    const low = -lower[x] / s
    if (!(high > low)) {
      continue
    }
    const i = Math.floor(x / s)
    for (let j = Math.max(Math.floor(low), 0); j < Math.min(Math.ceil(high), rows); j++) {
      cover[j * columns + i] += (Math.min(high, j + 1) - Math.max(low, j)) / s
    }
  }
  return { cover, columns, rows }
}

// Two-pass chamfer distance in cells; seed holds each cell's starting distance.
function chamfer(seed: Float32Array, columns: number, rows: number) {
  const distance = seed.slice()
  for (const pass of [1, -1]) {
    // Each pass looks back at the cells it has already finished: behind on the row, and three on the row before.
    const neighbours = [
      [-pass, 0, 1],
      [0, -pass, 1],
      [-1, -pass, Math.SQRT2],
      [1, -pass, Math.SQRT2],
    ]
    for (let n = 0; n < distance.length; n++) {
      const k = pass > 0 ? n : distance.length - 1 - n
      const i = k % columns
      const j = (k - i) / columns
      for (const [di, dj, step] of neighbours) {
        if (i + di < 0 || i + di >= columns || j + dj < 0 || j + dj >= rows) {
          continue
        }
        distance[k] = Math.min(distance[k], distance[k + dj * columns + di] + step)
      }
    }
  }
  return distance
}

// Distance from each cell to a covered region, in stage heights. A partly covered cell starts at its rough distance
// to the region's edge, which keeps the distance sub-cell smooth.
function distance(cover: Float32Array, columns: number, rows: number, cell: number) {
  const seed = cover.map((value) => (value >= 0.5 ? 0 : value > 0 ? 0.5 - value : 1e9))
  return chamfer(seed, columns, rows).map((value) => value * cell)
}

function downsample({ cover, columns, rows }: Grid): Grid {
  const half = { cover: new Float32Array((columns / 2) * (rows / 2)), columns: columns / 2, rows: rows / 2 }
  for (let j = 0; j < half.rows; j++) {
    for (let i = 0; i < half.columns; i++) {
      const k = 2 * j * columns + 2 * i
      half.cover[j * half.columns + i] = 0.25 * (cover[k] + cover[k + 1] + cover[k + columns] + cover[k + columns + 1])
    }
  }
  return half
}

function upsample(source: Float32Array, columns: number, rows: number) {
  const out = new Float32Array(columns * rows)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      out[j * columns + i] = source[(j >> 1) * (columns >> 1) + (i >> 1)]
    }
  }
  return out
}

// Over-relaxed Gauss-Seidel on Laplace's equation; covered cells blend toward the body's value for sub-cell edges.
function relax({ cover, columns, rows }: Grid, fields: Float32Array[], iterations: number) {
  const [alongX, alongY, circulation] = fields
  for (let iteration = 0; iteration < iterations; iteration++) {
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < columns - 1; i++) {
        const k = j * columns + i
        const open = 0.25 * (1 - cover[k])
        const up = k + columns
        const down = k - columns
        alongX[k] += 1.9 * (open * (alongX[k - 1] + alongX[k + 1] + alongX[down] + alongX[up]) - alongX[k])
        alongY[k] += 1.9 * (open * (alongY[k - 1] + alongY[k + 1] + alongY[down] + alongY[up]) - alongY[k])
        circulation[k] +=
          1.9 *
          (open * (circulation[k - 1] + circulation[k + 1] + circulation[down] + circulation[up]) +
            cover[k] -
            circulation[k])
      }
    }
  }
}

// Potential flow past the word in an open domain, solved coarse to fine.
function solveFlow(request: SolveRequest): Basis {
  const { id, aspect, columns, rows, cell, margin, alpha, supersample } = request
  const body = airBody(alpha, columns, rows, supersample, request.growth)
  const levels = [body, downsample(body)]
  levels.push(downsample(levels[1]))
  const iterations = [40, 60, 150]
  let fields: Float32Array[] = []
  for (let level = levels.length - 1; level >= 0; level--) {
    const grid = levels[level]
    const size = cell * 2 ** level
    const coarsest = level === levels.length - 1
    fields = coarsest
      ? [0, 1, 2].map(() => new Float32Array(grid.columns * grid.rows))
      : fields.map((field) => upsample(field, grid.columns, grid.rows))
    for (let j = 0; j < grid.rows; j++) {
      for (let i = 0; i < grid.columns; i++) {
        const edge = i === 0 || j === 0 || i === grid.columns - 1 || j === grid.rows - 1
        if (!edge && !coarsest) {
          continue
        }
        const k = j * grid.columns + i
        fields[0][k] = (j + 0.5) * size - margin
        fields[1][k] = -((i + 0.5) * size - margin)
        fields[2][k] = 0
      }
    }
    relax(grid, fields, iterations[level])
  }

  const inked = new Float32Array(columns * rows)
  const width = columns * supersample
  for (let y = 0; y < rows * supersample; y++) {
    for (let x = 0; x < width; x++) {
      inked[Math.floor(y / supersample) * columns + Math.floor(x / supersample)] +=
        alpha[y * width + x] / (255 * supersample * supersample)
    }
  }
  const ink = distance(inked, columns, rows, cell)
  const clearance = distance(body.cover, columns, rows, cell)

  let weight = 0
  let sum = 0
  let left = columns
  let right = 0
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      const c = body.cover[j * columns + i]
      if (c < 0.5) {
        continue
      }
      weight += c
      sum += c * j
      left = Math.min(left, i)
      right = Math.max(right, i)
    }
  }
  return {
    id,
    aspect,
    columns,
    rows,
    cell,
    margin,
    alongX: fields[0],
    alongY: fields[1],
    circulation: fields[2],
    ink,
    clearance,
    left: left * cell - margin,
    right: (right + 1) * cell - margin,
    middle: (sum / weight + 0.5) * cell - margin,
  }
}

// Time for air at unit free-stream speed to reach each cell: upwind Gauss-Seidel on u·∇t = 1, swept in all four
// orders so the flow may run in any direction, including back under the leading edge at steep angles.
function timeOfFlight(ux: Float32Array, uy: Float32Array, free: Float32Array, columns: number, cell: number) {
  const rows = free.length / columns
  const flight = free.slice()
  for (let round = 0; round < 2; round++) {
    for (const [stepI, stepJ] of [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]) {
      for (let jj = 1; jj < rows - 1; jj++) {
        const j = stepJ > 0 ? jj : rows - 1 - jj
        for (let ii = 1; ii < columns - 1; ii++) {
          const i = stepI > 0 ? ii : columns - 1 - ii
          const k = j * columns + i
          const ax = Math.abs(ux[k])
          const ay = Math.abs(uy[k])
          const upwindX = flight[ux[k] > 0 ? k - 1 : k + 1]
          const upwindY = flight[uy[k] > 0 ? k - columns : k + columns]
          // The slight pull toward free-stream time keeps still air (inside the word, at stagnation points) finite.
          flight[k] = (cell + ax * upwindX + ay * upwindY + 0.02 * free[k]) / (ax + ay + 0.02)
        }
      }
    }
  }
  // Air that grazed a stagnation point lags without bound; easing the lag keeps the light from tearing in the wake.
  for (let k = 0; k < flight.length; k++) {
    flight[k] = free[k] + 0.6 * Math.tanh((flight[k] - free[k]) / 0.6)
  }
  return flight
}

function pack(target: Uint8Array, offset: number, value: number) {
  const scaled = Math.round(Math.min(Math.max(value, 0), 1) * 65535)
  target[offset] = scaled >> 8
  target[offset + 1] = scaled & 255
}

// Combine the basis for one heading, then derive speed and time of flight for the shader.
function steer(basis: Basis, degrees: number): Steered {
  const { columns, rows, cell, margin, alongX, alongY, circulation, ink, clearance } = basis
  const angle = (degrees * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  // Kutta-style choice: the word's streamline leaves from its trailing end, so the flow does not wrap backwards.
  const psi0 = basis.middle * cos - basis.right * sin
  const count = columns * rows
  const psi = new Float32Array(count)
  for (let k = 0; k < count; k++) {
    psi[k] = cos * alongX[k] + sin * alongY[k] + psi0 * circulation[k]
  }
  const ux = new Float32Array(count)
  const uy = new Float32Array(count)
  const free = new Float32Array(count)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      const k = j * columns + i
      ux[k] = (psi[j < rows - 1 ? k + columns : k] - psi[j > 0 ? k - columns : k]) / (2 * cell)
      uy[k] = (psi[i > 0 ? k - 1 : k] - psi[i < columns - 1 ? k + 1 : k]) / (2 * cell)
      free[k] = ((i + 0.5) * cell - margin) * cos + ((j + 0.5) * cell - margin) * sin + 2
    }
  }
  const flight = timeOfFlight(ux, uy, free, columns, cell)
  let reach = 0
  let tmax = 0
  for (let k = 0; k < count; k++) {
    reach = Math.max(reach, Math.abs(psi[k] - psi0))
    tmax = Math.max(tmax, flight[k])
  }
  const flow = new Uint8Array(count * 4)
  const aux = new Uint8Array(count * 4)
  for (let k = 0; k < count; k++) {
    pack(flow, k * 4, (psi[k] - psi0) / reach / 2 + 0.5)
    pack(flow, k * 4 + 2, flight[k] / tmax)
    aux[k * 4] = Math.round(Math.min(Math.sqrt(ux[k] * ux[k] + uy[k] * uy[k]) / 4, 1) * 255)
    aux[k * 4 + 1] = Math.round(Math.min(ink[k] / 0.12, 1) * 255)
    aux[k * 4 + 2] = Math.round(Math.min(clearance[k] / 0.12, 1) * 255)
    aux[k * 4 + 3] = 255
  }
  return {
    id: basis.id,
    degrees,
    aspect: basis.aspect,
    columns,
    rows,
    flow,
    aux,
    reach,
    tmax,
    lead: basis.left * cos + basis.middle * sin,
    span: Math.max((basis.right - basis.left) * cos, 0.1),
  }
}

// Solves when the word changed, then steers; a steer for a superseded word gets no answer.
function respond(solver: Solver, message: SolveRequest | SteerRequest) {
  if ("alpha" in message) {
    solver.basis = solveFlow(message)
  }
  if (!solver.basis || solver.basis.id !== message.id) {
    return null
  }
  return steer(solver.basis, message.degrees)
}

// The template binds respond to a fixed name, because a minifier may rename the original.
const WORKER_SOURCE = `${[dilate, hull, airBody, chamfer, distance, downsample, upsample, relax, solveFlow].join("\n")}
${[timeOfFlight, pack, steer].join("\n")}
const respond = ${respond}
const solver = { basis: null }
onmessage = (event) => {
  const steered = respond(solver, event.data)
  if (steered) {
    postMessage(steered, [steered.flow.buffer, steered.aux.buffer])
  }
}`

// Rasterize the live HTML mark glyph by glyph, so the air follows whatever font actually renders.
function rasterizeMark(stage: HTMLElement, mark: HTMLElement, columns: number, rows: number) {
  const text = mark.firstChild
  if (mark.childNodes.length !== 1 || !(text instanceof Text) || !text.data.trim()) {
    throw new Error("Slipstream's mark must be one non-empty text node for the air to flow around its glyphs.")
  }
  const width = columns * SUPERSAMPLE
  const height = rows * SUPERSAMPLE
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) {
    throw new Error("Slipstream could not create a 2D canvas to rasterize its mark.")
  }
  const box = stage.getBoundingClientRect()
  const scale = box.width / stage.offsetWidth
  const units = (CELLS * SUPERSAMPLE) / stage.offsetHeight
  const offset = MARGIN * CELLS * SUPERSAMPLE
  context.setTransform(units, 0, 0, units, offset, offset)
  context.fillStyle = "#fff"
  const style = getComputedStyle(mark)
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  const range = document.createRange()
  let index = 0
  for (const glyph of Array.from(text.data)) {
    range.setStart(text, index)
    range.setEnd(text, index + glyph.length)
    index += glyph.length
    const rect = range.getBoundingClientRect()
    const ascent = context.measureText(glyph).fontBoundingBoxAscent
    context.fillText(glyph, (rect.left - box.left) / scale, (rect.top - box.top) / scale + ascent)
  }
  const pixels = context.getImageData(0, 0, width, height).data
  const alpha = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      alpha[(height - 1 - y) * width + x] = pixels[(y * width + x) * 4 + 3]
    }
  }
  return alpha
}

// Some engines throw when a content security policy blocks blob: workers; others fire "error" on the worker.
function startWorker(url: string) {
  try {
    return new Worker(url)
  } catch {
    return null
  }
}

function sameBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false
  }
  for (let k = 0; k < a.length; k++) {
    if (a[k] !== b[k]) {
      return false
    }
  }
  return true
}

export default function SlipstreamExample({ active = true }: { active?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})
  const timeRef = useRef(6)
  const contextLeaseRef = useRef(0)
  const angleRef = useRef(DEFAULT_ANGLE)
  const [angle, setAngle] = useState(DEFAULT_ANGLE)
  const [paused, setPaused] = useState(false)
  const [available, setAvailable] = useState(false)
  const [reduced, setReduced] = useState(false)
  runningRef.current = active && !paused

  useEffect(() => {
    const stage = stageRef.current
    const mark = markRef.current
    const canvas = canvasRef.current
    if (!stage || !mark || !canvas) {
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
    let settle = 0
    let request = 0
    let raster: Uint8Array | null = null
    let heading = Number.NaN
    let pending = false
    let ready = false
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduce = preference.matches
    setReduced(reduce)
    const shaders: WebGLShader[] = []
    const compile = (type: number, code: string) => {
      const shader = gl.createShader(type)
      if (!shader) {
        return null
      }
      shaders.push(shader)
      gl.shaderSource(shader, code)
      gl.compileShader(shader)
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
    }
    const vertex = compile(
      gl.VERTEX_SHADER,
      "attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}",
    )
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    const buffer = gl.createBuffer()
    const flowTexture = gl.createTexture()
    const auxTexture = gl.createTexture()
    const release = () => {
      shaders.forEach((shader) => gl.deleteShader(shader))
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
      gl.deleteTexture(flowTexture)
      gl.deleteTexture(auxTexture)
    }
    if (!vertex || !fragment || !program || !buffer || !flowTexture || !auxTexture) {
      release()
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      release()
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      return
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    // The flow texture holds 16-bit pairs that the shader filters itself; the aux bytes filter in hardware.
    for (const [unit, texture, filter] of [
      [0, flowTexture, gl.NEAREST],
      [1, auxTexture, gl.LINEAR],
    ] as const) {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const resolution = uniform("u_resolution")
    const time = uniform("u_time")
    const separation = uniform("u_separation")
    const gridSize = uniform("u_grid")
    const aspectRatio = uniform("u_aspect")
    const streamReach = uniform("u_reach")
    const flightRange = uniform("u_tmax")
    const direction = uniform("u_heading")
    const leading = uniform("u_lead")
    const length = uniform("u_span")
    gl.uniform1i(uniform("u_flow"), 0)
    gl.uniform1i(uniform("u_aux"), 1)
    gl.uniform1f(uniform("u_speed"), FLOW_SPEED)
    gl.uniform1f(uniform("u_cell"), 1 / CELLS)
    gl.uniform1f(uniform("u_margin"), MARGIN)

    const upload = (steered: Steered) => {
      heading = steered.degrees
      const { columns, rows } = steered
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, flowTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, columns, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, steered.flow)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, auxTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, columns, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, steered.aux)
      gl.uniform2f(gridSize, columns, rows)
      gl.uniform1f(aspectRatio, steered.aspect)
      gl.uniform1f(streamReach, steered.reach)
      gl.uniform1f(flightRange, steered.tmax)
      gl.uniform2f(direction, Math.cos((heading * Math.PI) / 180), Math.sin((heading * Math.PI) / 180))
      gl.uniform1f(leading, steered.lead)
      gl.uniform1f(length, steered.span)
      gl.uniform1f(separation, Math.min(Math.max((heading - STALL_ANGLE) / (MAX_ANGLE - STALL_ANGLE), 0), 1))
    }
    const workerUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }))
    let worker = startWorker(workerUrl)
    const local: Solver = { basis: null }
    const draw = () => {
      if (disposed || lost || !ready) {
        return
      }
      // One request in flight at most: a drag steers to wherever the angle is when the last answer lands.
      if (heading !== angleRef.current && !pending) {
        send({ id: request, degrees: angleRef.current })
      }
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, reduce ? 6 : timeRef.current)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const receive = (steered: Steered) => {
      if (disposed || lost || steered.id !== request) {
        return
      }
      pending = false
      ready = true
      upload(steered)
      setAvailable(true)
      draw()
    }
    const send = (message: SolveRequest | SteerRequest) => {
      pending = true
      if (worker) {
        worker.postMessage(message)
        return
      }
      const steered = respond(local, message)
      if (steered) {
        receive(steered)
      }
    }
    worker?.addEventListener("message", (event: MessageEvent<Steered>) => receive(event.data))
    // Re-solve only when the rendered word changed, so unrelated resizes and font loads cost one cheap raster.
    const measure = () => {
      settle = 0
      const width = stage.offsetWidth
      const height = stage.offsetHeight
      if (disposed || lost || !width || !height) {
        return
      }
      const aspect = width / height
      const columns = Math.round(((aspect + 2 * MARGIN) * CELLS) / 4) * 4
      const rows = Math.round(((1 + 2 * MARGIN) * CELLS) / 4) * 4
      const alpha = rasterizeMark(stage, mark, columns, rows)
      if (raster && sameBytes(raster, alpha)) {
        return
      }
      raster = alpha
      request += 1
      send({
        id: request,
        aspect,
        columns,
        rows,
        cell: 1 / CELLS,
        margin: MARGIN,
        supersample: SUPERSAMPLE,
        growth: GROWTH,
        degrees: angleRef.current,
        alpha,
      })
    }
    // Without a worker (a content security policy that blocks blob: workers), solve on the main thread instead.
    worker?.addEventListener("error", () => {
      worker?.terminate()
      worker = null
      raster = null
      measure()
    })
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
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
      if (disposed || lost) {
        return
      }
      draw()
      if (runningRef.current && !reduce && !document.hidden) {
        frame = requestAnimationFrame(tick)
      }
    }
    const schedule = () => {
      window.clearTimeout(settle)
      settle = window.setTimeout(measure, 120)
    }
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) {
        return
      }
      schedule()
      // Size the drawing buffer from displayed pixels, including ancestor scale.
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2400000 / (width * height)))
      const nextWidth = Math.max(1, Math.round(width * ratio))
      const nextHeight = Math.max(1, Math.round(height * ratio))
      if (canvas.width === nextWidth && canvas.height === nextHeight) {
        return
      }
      canvas.width = nextWidth
      canvas.height = nextHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      draw()
    }
    const updatePreference = () => {
      reduce = preference.matches
      setReduced(reduce)
      sync()
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      lost = true
      cancelAnimationFrame(frame)
      setAvailable(false)
    }
    // Keep the static artwork after context loss. Remount to create fresh GPU resources.
    canvas.addEventListener("webglcontextlost", contextLost)
    preference.addEventListener("change", updatePreference)
    document.addEventListener("visibilitychange", sync)
    document.fonts.addEventListener("loadingdone", schedule)
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
    measure()
    sync()
    const releaseContext = () => {
      if (contextLeaseRef.current === lease) {
        gl.getExtension("WEBGL_lose_context")?.loseContext()
      }
    }
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      worker?.terminate()
      URL.revokeObjectURL(workerUrl)
      syncRef.current = () => {}
      observer.disconnect()
      transforms.disconnect()
      window.removeEventListener("resize", resize)
      document.fonts.removeEventListener("loadingdone", schedule)
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
  }, [active, paused, angle])

  return (
    <div
      ref={stageRef}
      className="sg-slipstream"
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        minHeight: 240,
        overflow: "hidden",
        containerType: "size",
        background: "#24080d",
        color: "#f6ead8",
      }}
    >
      <div className="sg-slipstream-fallback" aria-hidden="true">
        <span className="sg-slipstream-type">{MARK}</span>
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: available ? 1 : 0,
          transition: reduced ? "none" : "opacity .4s",
        }}
      />
      <div ref={markRef} className="sg-slipstream-type">
        {MARK}
      </div>
      {available && (
        <label className="sg-slipstream-control">
          <span>Wind angle</span>
          <input
            type="range"
            min="0"
            max={MAX_ANGLE}
            step="1"
            value={angle}
            aria-valuetext={`${angle} degrees`}
            onChange={(event) => {
              const value = Number(event.currentTarget.value)
              angleRef.current = value
              setAngle(value)
            }}
          />
          <output aria-hidden="true">{angle}°</output>
        </label>
      )}
      {available && !reduced && (
        <button
          className="sg-slipstream-pause"
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
.sg-slipstream *{box-sizing:border-box}
.sg-slipstream-type{position:absolute;left:8.5cqw;top:54%;transform:translateY(-50%);margin:0;white-space:nowrap;font:800 min(15.5cqw,31cqh)/1 "Avenir Next","Segoe UI","Noto Sans",Roboto,"Helvetica Neue",Arial,sans-serif;letter-spacing:-.035em}
.sg-slipstream-fallback{position:absolute;inset:0;overflow:hidden;background:radial-gradient(55% 45% at 80% 22%,#b8461c66,transparent 70%),radial-gradient(60% 50% at 12% 88%,#a83a1a55,transparent 70%),linear-gradient(172deg,#4c0f13 0%,#80201a 42%,#701b16 64%,#300a0d 100%)}
.sg-slipstream-fallback .sg-slipstream-type{color:transparent}
.sg-slipstream-fallback .sg-slipstream-type::before{content:"";position:absolute;left:-.34em;right:-100cqw;top:-.34em;bottom:-1.2em;border:.15em solid #f9dca4;border-right:0;border-bottom:0;border-top-left-radius:.75em .7em;filter:blur(.03em);box-shadow:-.03em -.03em .4em #e8862ecc,inset .03em .03em .3em #e8862e88;transform:skewY(-4deg);transform-origin:0 0;-webkit-mask-image:linear-gradient(#000 35%,transparent 75%);mask-image:linear-gradient(#000 35%,transparent 75%)}
.sg-slipstream-fallback .sg-slipstream-type::after{content:"";position:absolute;left:-.2em;right:-100cqw;top:1.14em;height:.09em;background:linear-gradient(90deg,transparent,#d0622a 30%,#e07a34 65%,#c4542433);filter:blur(.04em);transform:skewY(-2deg);transform-origin:0 0}
.sg-slipstream-control{position:absolute;bottom:14px;left:14px;display:flex;align-items:center;gap:10px;padding:0 14px;min-height:44px;border-radius:22px;background:#1b0609cc;color:#f6ead8;font:11px/1.2 Arial,sans-serif;backdrop-filter:blur(6px)}
.sg-slipstream-control input{width:84px;max-width:23vw;height:44px;margin:0;accent-color:#f0a33c;cursor:pointer}
.sg-slipstream-control output{min-width:3ch;font-variant-numeric:tabular-nums;opacity:.8}
.sg-slipstream-pause{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;color:#f6ead8;background:#1b0609cc;backdrop-filter:blur(6px);cursor:pointer}
.sg-slipstream-pause:focus-visible,.sg-slipstream-control input:focus-visible{outline:2px solid #f6ead8;outline-offset:3px}
.sg-slipstream-pause:disabled{opacity:.5;cursor:default}
      `}</style>
    </div>
  )
}
