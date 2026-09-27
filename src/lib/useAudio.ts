import { useCallback, useEffect, useRef, useState } from 'react'
import { releases } from '../data/releases'
import type { Release } from '../data/releases'
import { scene } from './scene'

class SoundEngine {
  context: AudioContext
  output: GainNode
  analyser: AnalyserNode
  delay: DelayNode
  timer: ReturnType<typeof setInterval> | undefined
  voices = new Set<OscillatorNode>()
  step = 0
  nextNote = 0

  constructor() {
    this.context = new AudioContext()
    this.output = this.context.createGain()
    this.output.gain.value = 0
    const limiter = this.context.createDynamicsCompressor()
    limiter.threshold.value = -18
    limiter.ratio.value = 8
    this.analyser = this.context.createAnalyser()
    this.analyser.fftSize = 128
    this.output.connect(limiter)
    limiter.connect(this.analyser)
    this.analyser.connect(this.context.destination)
    this.delay = this.context.createDelay(2)
    this.delay.delayTime.value = 0.416
    const feedback = this.context.createGain()
    feedback.gain.value = 0.28
    const wet = this.context.createGain()
    wet.gain.value = 0.27
    this.delay.connect(feedback)
    feedback.connect(this.delay)
    this.delay.connect(wet)
    wet.connect(this.output)
  }

  tone(frequency: number, time: number, duration: number, gain: number, type: OscillatorType = 'sine') {
    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    const filter = this.context.createBiquadFilter()
    oscillator.type = type
    oscillator.frequency.value = frequency
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(frequency * 4, time)
    filter.frequency.exponentialRampToValueAtTime(Math.max(60, frequency), time + duration)
    envelope.gain.setValueAtTime(0.0001, time)
    envelope.gain.exponentialRampToValueAtTime(gain, time + 0.025)
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    oscillator.connect(filter)
    filter.connect(envelope)
    envelope.connect(this.output)
    envelope.connect(this.delay)
    this.voices.add(oscillator)
    oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); filter.disconnect(); envelope.disconnect() }
    oscillator.start(time)
    oscillator.stop(time + duration + 0.05)
  }

  start(release: Release, volume: number) {
    this.stop()
    this.step = 0
    this.nextNote = this.context.currentTime + 0.05
    this.delay.delayTime.value = (60 / release.bpm) * 0.75
    this.setVolume(volume)
    const schedule = () => {
      // Background-tab throttling must never schedule a burst of overdue notes.
      this.nextNote = Math.max(this.nextNote, this.context.currentTime + 0.01)
      while (this.nextNote < this.context.currentTime + 0.15) {
        const note = release.notes[this.step % release.notes.length]
        const octave = Math.floor(this.step / 24) % 3 === 2 ? 2 : 1
        this.tone(release.root * 2 ** (note / 12) * octave, this.nextNote, 1.6, 0.12, 'triangle')
        if (this.step % 4 === 0) this.tone(release.root / 2, this.nextNote, 2.7, 0.18)
        if (this.step % 8 === 0) {
          this.tone(release.root * 2, this.nextNote, 3.5, 0.045)
          this.tone(release.root * 2 ** (19 / 12), this.nextNote, 3.5, 0.035)
        }
        if (release.bpm > 80 && this.step % 2 === 0) this.tone(48, this.nextNote, 0.16, 0.18)
        this.step++
        this.nextNote += 60 / release.bpm / 2
      }
    }
    schedule()
    this.timer = setInterval(schedule, 50)
  }

  setVolume(value: number) {
    this.output.gain.cancelScheduledValues(this.context.currentTime)
    this.output.gain.setTargetAtTime(value * 0.6, this.context.currentTime, 0.08)
  }

  stop() {
    clearInterval(this.timer)
    this.timer = undefined
    this.output.gain.cancelScheduledValues(this.context.currentTime)
    this.output.gain.setTargetAtTime(0, this.context.currentTime, 0.03)
    for (const voice of this.voices) {
      try { voice.stop(this.context.currentTime + 0.04) } catch { /* Already ended. */ }
    }
    this.voices.clear()
    scene.energy = 0
  }

  destroy() { this.stop(); void this.context.close() }
}

export function useAudio() {
  const engine = useRef<SoundEngine | null>(null)
  const request = useRef(0)
  const [track, setTrack] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.55)
  const [error, setError] = useState('')

  const play = useCallback(async (index: number) => {
    const operation = ++request.current
    setError('')
    try {
      if (!('AudioContext' in window)) throw new Error('This browser does not support the listening room. Try a recent version of Chrome, Safari, or Firefox.')
      engine.current ??= new SoundEngine()
      await engine.current.context.resume()
      if (operation !== request.current) return
      engine.current.start(releases[index], volume)
      setTrack(index)
      setPlaying(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sound could not start. Please try again.')
      setPlaying(false)
    }
  }, [volume])

  const pause = useCallback(() => {
    request.current++
    engine.current?.stop()
    setPlaying(false)
  }, [])

  const select = (index: number) => {
    const next = (index + releases.length) % releases.length
    setTrack(next)
    if (playing) void play(next)
  }

  const changeVolume = (value: number) => {
    setVolume(value)
    if (playing) engine.current?.setVolume(value)
  }

  useEffect(() => () => { request.current++; engine.current?.destroy(); engine.current = null }, [])

  return { engine, track, playing, volume, error, play, pause, select, changeVolume, toggle: () => playing ? pause() : void play(track) }
}

export type AudioControls = ReturnType<typeof useAudio>
