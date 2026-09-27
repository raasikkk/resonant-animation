import { useEffect, useRef } from 'react'
import { ArrowUpRight, Pause, Play, SkipBack, SkipForward, Volume2, X } from 'lucide-react'
import { releases } from '../data/releases'
import type { AudioControls } from '../lib/useAudio'
import { RecordArt } from './RecordArt'
import { Visualizer } from './Visualizer'

export function Player({ open, onClose, audio }: { open: boolean; onClose: () => void; audio: AudioControls }) {
  const ref = useRef<HTMLDialogElement>(null)
  const release = releases[audio.track]
  useEffect(() => {
    const dialog = ref.current!
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return <dialog ref={ref} className="player" onClose={onClose} aria-labelledby="player-title" data-lenis-prevent onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="player-inner">
      <div className="player-header"><span className="eyebrow">RESONANT® / LISTENING ROOM</span><button className="icon-button" onClick={onClose} aria-label="Close listening room"><X size={21} /></button></div>
      <div className="player-main">
        <RecordArt release={release} />
        <div className="player-details">
          <span className="eyebrow">{release.id} / {release.genre}</span>
          <h2 id="player-title">{release.title}</h2>
          <p className="player-artist">{release.artist}</p>
          <p className="player-description">{release.description}</p>
          <Visualizer audio={audio} />
          <div className="session-label eyebrow"><span><i className={audio.playing ? 'status-dot live' : 'status-dot'} />{audio.playing ? 'SESSION IS LIVE' : 'PRESS PLAY. BE HERE.'}</span><span>{release.bpm} BPM</span></div>
          <div className="player-controls">
            <button className="icon-button" aria-label="Previous track" onClick={() => audio.select(audio.track - 1)}><SkipBack size={20} /></button>
            <button className="round-play" aria-label={audio.playing ? 'Pause playback' : 'Start playback'} onClick={audio.toggle}>{audio.playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
            <button className="icon-button" aria-label="Next track" onClick={() => audio.select(audio.track + 1)}><SkipForward size={20} /></button>
            <label className="volume-control"><Volume2 size={18} /><span className="sr-only">Volume</span><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={audio.volume} onChange={(event) => audio.changeVolume(Number(event.target.value))} /></label>
          </div>
          <p className="player-note">Original generative sketches. Every session is a little different.</p>
          {audio.error && <p role="alert" className="audio-error">{audio.error}</p>}
        </div>
      </div>
      <div className="player-tracklist">{releases.map((item, index) => <button key={item.id} className={index === audio.track ? 'selected' : ''} onClick={() => audio.select(index)} aria-pressed={index === audio.track}><span className="eyebrow">0{index + 1}</span><span>{item.artist} <span className="tracklist-title">/ {item.title}</span></span><ArrowUpRight size={17} /></button>)}</div>
    </div>
  </dialog>
}
