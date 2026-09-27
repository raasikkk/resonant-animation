import { useRef, useState } from 'react'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUp, ArrowUpRight, Headphones, Menu, Pause, Play, X } from 'lucide-react'
import { Mark } from './components/Mark'
import { Player } from './components/Player'
import { RecordArt } from './components/RecordArt'
import { Sculpture } from './components/Sculpture'
import { Visualizer } from './components/Visualizer'
import { releases } from './data/releases'
import { useAudio } from './lib/useAudio'
import { useChoreography } from './lib/useChoreography'

const wave = Array.from({ length: 161 }, (_, i) => {
  const x = i * 9
  const envelope = Math.sin((i / 160) * Math.PI) ** 2
  return `${i === 0 ? 'M' : 'L'}${x},${100 + Math.sin(i * 0.45) * envelope * 82}`
}).join(' ')

function App() {
  const root = useRef<HTMLDivElement>(null)
  const audio = useAudio()
  const [playerOpen, setPlayerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useChoreography(root)

  const openRelease = (index: number) => { audio.select(index); setPlayerOpen(true) }

  return <div ref={root} className={audio.playing ? 'site is-playing' : 'site'}>
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="scroll-progress" aria-hidden="true" />
    <header className="header">
      <a href="#top" className="logo" aria-label="Resonant home"><Mark /><span>RESONANT<sup>®</sup></span></a>
      <nav aria-label="Main navigation" className={menuOpen ? 'navigation is-open' : 'navigation'}>
        <a href="#frequency" onClick={() => setMenuOpen(false)}>Our frequency<span>01</span></a>
        <a href="#releases" onClick={() => setMenuOpen(false)}>The releases<span>02</span></a>
        <a href="#listening" onClick={() => setMenuOpen(false)}>Listening room<span>03</span></a>
      </nav>
      <div className="header-actions">
        <button className="sound-toggle eyebrow" onClick={audio.toggle} aria-pressed={audio.playing} aria-label={audio.playing ? 'Turn sound off' : 'Turn sound on'}><span className="equalizer" aria-hidden="true"><i /><i /><i /><i /></span><span>SOUND {audio.playing ? 'ON' : 'OFF'}</span></button>
        <button className="menu-toggle icon-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </header>

    <main id="main">
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-eyebrow eyebrow"><span><i className="status-dot" />INDEPENDENT SOUND. COLLECTIVE FEELING.</span><span>EST. 2020 <span className="muted">/</span> EVERYWHERE</span></div>
        <div className="hero-main">
          <h1 id="hero-title" className="hero-title"><span className="line-mask"><span>SOUND</span></span><span className="line-mask"><span>BEYOND</span></span><span className="line-mask"><span>ORDINARY<span className="orange">.</span></span></span></h1>
          <Sculpture />
          <div className="sculpture-caption eyebrow"><span className="crosshair">+</span> FIG. 001 — A SOUND WITH NO EDGES</div>
          <div className="hero-note"><span className="eyebrow">NO ALGORITHMS.<br />JUST INSTINCT.</span><ArrowDownRight size={26} strokeWidth={1.3} /></div>
        </div>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#frequency"><span className="circle-arrow"><ArrowDown size={20} /></span><span className="eyebrow">SCROLL TO<br />FEEL SOMETHING</span></a>
          <p>A home for the beautifully undefined.<br />For sounds that stay with you.<br />And the people who feel them.</p>
          <button className="hero-listen" onClick={() => setPlayerOpen(true)}><span className="round-play"><Play size={18} fill="currentColor" /></span><span><span className="eyebrow">TUNE INTO RESONANT</span><strong>Find your frequency <ArrowUpRight size={18} /></strong></span></button>
        </div>
        <div className="hero-rule"><span>LESS NOISE. MORE FEELING.</span><span>SCROLL-LED / SOUND-ON / OPEN-MINDED</span><span>VOL. 004</span></div>
      </section>

      <section id="frequency" className="frequency" aria-labelledby="frequency-title">
        <div className="frequency-stage">
          <div className="section-top eyebrow"><span>01 / OUR FREQUENCY</span><span>A FEELING, NOT A FORMULA.</span><Mark /></div>
          <div className="frequency-orbits" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ transform: `translate(-50%, -50%) rotate(${i * 18}deg)` }} />)}</div>
          <h2 id="frequency-title" className="frequency-title"><span>NOT MORE</span><span className="frequency-noise">NOISE.</span><span>MORE <em>FEELING.</em></span></h2>
          <div className="frequency-copy"><p>Some things can’t be explained.<br />A bassline. A goosebump. A room full of strangers.<br />We make space for that.</p></div>
          <svg className="frequency-wave" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true"><path d={wave} pathLength="1" /></svg>
          <div className="frequency-bottom eyebrow"><span>LEAVE THE NOISE BEHIND <ArrowRight size={17} /></span><div className="signal-meter"><span>FEELING LEVEL</span><span className="signal-value">000</span><span>%</span></div><span className="signal-status"><i className="status-dot live" />SIGNAL FOUND</span></div>
          <div className="frequency-progress" aria-hidden="true" />
        </div>
      </section>

      <section id="releases" className="releases" aria-labelledby="releases-title">
        <div className="release-pin">
          <div className="releases-heading"><div><span className="eyebrow">02 / THE RELEASES</span><h2 id="releases-title">OUT OF THE<br /><span className="serif-word">ordinary.</span></h2></div><div className="releases-intro"><p>Different worlds.<br />One shared frequency.</p><span className="eyebrow">SELECTED RELEASES / 001—003 <ArrowRight size={17} /></span></div></div>
          <div className="release-window"><div className="release-track">{releases.map((release, index) => <article className="release-card" key={release.id}>
            <button className="release-artwork" onClick={() => openRelease(index)} aria-label={`Explore ${release.title} by ${release.artist}`}><div className="vinyl" aria-hidden="true"><div style={{ background: release.color }}><Mark /><span>{release.artist}</span></div></div><RecordArt release={release} /><span className="art-open"><ArrowUpRight size={21} /></span></button>
            <div className="release-info"><div><span className="eyebrow">{release.id} / {release.genre}</span><h3>{release.artist}<span> — {release.title}</span></h3></div><button className="release-play icon-button" aria-label={`Play ${release.title}`} onClick={() => { void audio.play(index); setPlayerOpen(true) }}><Play size={19} /></button></div>
          </article>)}</div></div>
          <div className="release-footer eyebrow"><span>INDEPENDENT BY NATURE. CURIOUS BY DEFAULT.</span><div className="release-scroll-track"><i /></div><span>KEEP EXPLORING <ArrowRight size={16} /></span></div>
        </div>
      </section>

      <section className="interlude" aria-labelledby="interlude-title">
        <div className="section-top eyebrow"><span>NO BORDERS. NO BOXES.</span><span>JUST GOOD VIBRATIONS.</span></div>
        <div className="interlude-type" id="interlude-title" role="heading" aria-level={2} aria-label="Feel it all."><div className="interlude-line">FEEL IT <Mark /> FEEL IT <Mark /></div><div className="interlude-line outline">ALL. ALL. ALL. ALL.</div></div>
        <div className="interlude-bottom"><p>From the first note to the last person on the floor.<br />Music is a place. Find your people.</p><a href="#listening" className="circle-arrow" aria-label="Explore the listening room"><ArrowDownRight size={30} /></a></div>
      </section>

      <section id="listening" className="listening" aria-labelledby="listening-title">
        <div className="section-top eyebrow"><span>03 / THE LISTENING ROOM</span><span><Headphones size={15} /> HEADPHONES RECOMMENDED</span></div>
        <div className="listening-grid">
          <div className="listening-copy"><span className="eyebrow orange">NO RUSH. YOU’RE HERE NOW.</span><h2 id="listening-title" data-reveal>A LITTLE<br />LESS SCROLL.<br />A LITTLE<br /><span className="serif-word">more soul.</span></h2><p>Close the other tabs. Let a thought wander.<br />This one’s just for you.</p><button className="text-button" onClick={() => setPlayerOpen(true)}>Enter the listening room <ArrowUpRight size={22} /></button></div>
          <div className="listening-deck">
            <div className="turntable"><div className="deck-label eyebrow"><span>RSN / DIRECT DRIVE</span><span>33⅓</span></div><div className="turntable-record"><div className="record-label" style={{ background: releases[audio.track].color }}><Mark /><strong>{releases[audio.track].artist}</strong><span>RESONANT® RECORDINGS</span></div></div><div className="tonearm" aria-hidden="true"><i /><b /></div><button className="deck-play round-play" aria-label={audio.playing ? 'Pause record' : 'Play record'} onClick={audio.toggle}>{audio.playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button><span className="deck-light eyebrow"><i className={audio.playing ? 'status-dot live' : 'status-dot'} />{audio.playing ? 'NOW PLAYING' : 'READY WHEN YOU ARE'}</span></div>
            <div className="deck-track"><div><span className="eyebrow">ON THE TURNTABLE</span><p>{releases[audio.track].artist} <span>/ {releases[audio.track].title}</span></p></div><Visualizer audio={audio} /></div>
            <div className="listening-tracks">{releases.map((release, index) => <button key={release.id} className={audio.track === index ? 'selected' : ''} onClick={() => audio.select(index)} aria-pressed={audio.track === index}><span className="eyebrow">0{index + 1}</span><span>{release.title}</span><span className="eyebrow">{release.bpm} BPM</span><span className="track-dot" /></button>)}</div>
            {audio.error && <p className="audio-error" role="alert">{audio.error}</p>}
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true"><div>{Array.from({ length: 4 }, (_, i) => <span key={i}>INDEPENDENT SOUND <Mark /> HUMAN CONNECTION <Mark /></span>)}</div></div>

      <footer className="footer">
        <div className="section-top eyebrow"><span>END OF SIDE A.</span><span>THERE’S ALWAYS ANOTHER SIDE.</span></div>
        <div className="footer-headline"><h2 data-reveal>THE WORLD<br /><span className="serif-word">can wait.</span></h2><button className="footer-listen" onClick={() => setPlayerOpen(true)}><Headphones size={32} strokeWidth={1.2} /><span>STAY A LITTLE<br />LONGER</span><ArrowUpRight size={25} /></button></div>
        <div className="footer-bottom"><a href="#top" className="logo"><Mark /><span>RESONANT<sup>®</sup></span></a><p>Independent in spirit.<br />Connected by sound.</p><a href="#top" className="back-top eyebrow">BACK TO THE SURFACE <ArrowUp size={18} /></a></div>
        <div className="footer-credit eyebrow"><span>© RESONANT 2026</span><span>A FICTIONAL LABEL. A REAL FEELING.</span><span>DESIGN & CODE — JOIN WAY</span></div>
      </footer>
    </main>
    {audio.playing && !playerOpen && <div className="mini-player"><button onClick={() => setPlayerOpen(true)}><span className="equalizer" aria-hidden="true"><i /><i /><i /><i /></span><span>{releases[audio.track].artist}<small>{releases[audio.track].title}</small></span></button><button className="icon-button" onClick={audio.pause} aria-label="Pause audio"><Pause size={18} /></button></div>}
    <Player open={playerOpen} onClose={() => setPlayerOpen(false)} audio={audio} />
  </div>
}

export default App
