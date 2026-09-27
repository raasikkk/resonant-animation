import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { scene } from '../lib/scene'

const vertexSource = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

// An original ray-marched sculpture. No model, image, texture or network request.
const fragmentSource = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float progress;
uniform float energy;
uniform vec2 pointer;

mat2 rotate(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }

float surface(vec3 p) {
  p.xz = rotate(-0.28 + sin(time * 0.16) * 0.19 + pointer.x * 0.1 + progress * 1.7) * p.xz;
  p.yz = rotate(0.48 + cos(time * 0.12) * 0.14 + pointer.y * 0.1) * p.yz;
  p.xy = rotate(time * 0.1 + progress * 1.1) * p.xy;
  float a = atan(p.y, p.x);
  float major = 1.05 + 0.1 * cos(a * 3.0 + time * 0.18);
  float tube = 0.345 + 0.025 * sin(a * 6.0 - time * 0.4) + energy * 0.06;
  return length(vec2(length(p.xy) - major, p.z)) - tube;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.001, -0.001);
  return normalize(e.xyy * surface(p + e.xyy) + e.yyx * surface(p + e.yyx)
    + e.yxy * surface(p + e.yxy) + e.xxx * surface(p + e.xxx));
}

vec3 environment(vec3 r) {
  vec3 color = mix(vec3(0.085, 0.10, 0.095), vec3(0.78, 0.8, 0.75), smoothstep(-0.5, 0.75, r.y));
  float key = smoothstep(0.68, 0.76, dot(r, normalize(vec3(-0.6, 1.0, 0.65))));
  float strip = smoothstep(0.91, 0.945, abs(dot(r, normalize(vec3(0.9, 0.12, 0.3)))));
  float dark = smoothstep(0.055, 0.01, abs(r.y + r.x * 0.28 - 0.13));
  color = mix(color, vec3(0.028, 0.038, 0.033), dark * 0.96);
  color += key * vec3(1.15, 1.1, 1.0) + strip * vec3(0.82, 0.88, 0.9);
  float warm = pow(max(dot(r, normalize(vec3(0.9, -0.45, 0.2))), 0.0), 16.0);
  color += warm * vec3(0.95, 0.17, 0.035) * 0.65;
  return color;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  vec3 ro = vec3(0.0, 0.0, 4.5);
  vec3 rd = normalize(vec3(uv * 1.6, -4.2));
  float t = 0.0;
  float d = 1.0;
  for (int i = 0; i < 80; i++) {
    d = surface(ro + rd * t);
    if (d < 0.0015 || t > 7.0) break;
    t += d * 0.8;
  }
  if (t > 7.0 || d > 0.012) { gl_FragColor = vec4(0.0); return; }
  vec3 p = ro + rd * t;
  vec3 n = normalAt(p);
  vec3 reflection = reflect(rd, n);
  vec3 col = environment(reflection);
  float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
  float ao = clamp(surface(p + n * 0.22) / 0.22, 0.35, 1.0);
  col *= mix(0.69, 1.0, ao);
  col += fresnel * 0.15;
  col = col / (col * 0.36 + 0.75);
  col = pow(col, vec3(0.88));
  gl_FragColor = vec4(col, 1.0);
}
`

export function Sculpture() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' })
    if (!gl) return
    const resources: WebGLShader[] = []
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      resources.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
    }
    const vertex = compile(gl.VERTEX_SHADER, vertexSource)
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)
    if (!vertex || !fragment) { resources.forEach((s) => gl.deleteShader(s)); return }
    const program = gl.createProgram()!
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      resources.forEach((s) => gl.deleteShader(s))
      gl.deleteProgram(program)
      return
    }
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const uniforms = Object.fromEntries(['resolution', 'time', 'progress', 'energy', 'pointer'].map((name) => [name, gl.getUniformLocation(program, name)]))
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = motionQuery.matches
    let visible = true
    let lost = false
    let lastFrame = 0
    let elapsed = 0
    const pointer = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    const draw = (time: number) => {
      if (lost || !visible || document.hidden || time - lastFrame < 1 / 30) return
      const delta = Math.min(time - lastFrame, 0.05)
      lastFrame = time
      if (!reduced) elapsed += delta
      pointer.x += (target.x - pointer.x) * 0.05
      pointer.y += (target.y - pointer.y) * 0.05
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.time, reduced ? 2 : elapsed)
      gl.uniform1f(uniforms.progress, reduced ? 0 : scene.progress)
      gl.uniform1f(uniforms.energy, reduced ? 0 : scene.energy)
      gl.uniform2f(uniforms.pointer, reduced ? 0 : pointer.x, reduced ? 0 : pointer.y)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      canvas.dataset.ready = 'true'
    }
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio, 1.5, 1100 / Math.max(width, height))
      canvas.width = Math.max(1, Math.round(width * ratio))
      canvas.height = Math.max(1, Math.round(height * ratio))
      gl.viewport(0, 0, canvas.width, canvas.height)
      lastFrame = 0
      draw(performance.now() / 1000)
    }
    const onPointer = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2
      target.y = (event.clientY / window.innerHeight - 0.5) * 2
    }
    const onMotion = () => {
      reduced = motionQuery.matches
      gsap.ticker.remove(draw)
      if (!reduced) gsap.ticker.add(draw)
      lastFrame = 0
      draw(performance.now() / 1000)
    }
    const onLost = (event: Event) => { event.preventDefault(); lost = true; delete canvas.dataset.ready }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { rootMargin: '100px' })
    observer.observe(canvas)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('pointermove', onPointer, { passive: true })
    motionQuery.addEventListener('change', onMotion)
    canvas.addEventListener('webglcontextlost', onLost)
    resize()
    if (!reduced) gsap.ticker.add(draw)
    return () => {
      gsap.ticker.remove(draw)
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointer)
      motionQuery.removeEventListener('change', onMotion)
      canvas.removeEventListener('webglcontextlost', onLost)
      gl.deleteBuffer(buffer)
      resources.forEach((shader) => gl.deleteShader(shader))
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <div className="sculpture" aria-hidden="true">
      <div className="sculpture-shadow" />
      <canvas ref={canvasRef} className="sculpture-canvas" />
      <div className="sculpture-fallback"><div /></div>
    </div>
  )
}
