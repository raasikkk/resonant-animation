import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import type { AudioControls } from '../lib/useAudio'
import { scene } from '../lib/scene'

export function Visualizer({ audio }: { audio: AudioControls }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { engine, playing } = audio
  useEffect(() => {
    const canvas = ref.current!
    const context = canvas.getContext('2d')!
    const data = new Uint8Array(64)
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduced = query.matches
    const render = () => {
      const width = canvas.width
      const height = canvas.height
      context.clearRect(0, 0, width, height)
      if (playing && engine.current) engine.current.analyser.getByteFrequencyData(data)
      else data.fill(0)
      scene.energy = playing ? data.reduce((sum, value) => sum + value, 0) / data.length / 255 : 0
      context.fillStyle = '#ff4b23'
      for (let i = 0; i < 56; i++) {
        const base = 5 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) * 30
        const bar = reduced || !playing ? base : Math.max(4, (data[i] / 255) * height * 0.9)
        context.fillRect(i * width / 56, (height - bar) / 2, Math.max(2, width / 56 - 4), bar)
      }
    }
    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 2))
      canvas.height = Math.round(canvas.clientHeight * Math.min(devicePixelRatio, 2))
      render()
    }
    const onMotion = () => { reduced = query.matches; gsap.ticker.remove(render); if (playing && !reduced) gsap.ticker.add(render); render() }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    query.addEventListener('change', onMotion)
    if (playing && !reduced) gsap.ticker.add(render)
    resize()
    return () => { gsap.ticker.remove(render); observer.disconnect(); query.removeEventListener('change', onMotion) }
  }, [engine, playing])
  return <canvas className="visualizer" ref={ref} aria-hidden="true" />
}
