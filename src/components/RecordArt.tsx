import type { Release } from '../data/releases'

export function RecordArt({ release, small = false }: { release: Release; small?: boolean }) {
  return <div className={`record-art art-${release.shape} ${small ? 'art-small' : ''}`} style={{ backgroundColor: release.color }} aria-hidden="true">
    <div className="art-top"><span>RESONANT®</span><span>{release.id}</span></div>
    <div className="art-composition">
      {release.shape === 'orbit' && <div className="art-orbits">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 20}deg)` }} />)}</div>}
      {release.shape === 'fold' && <div className="art-folds">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ transform: `translate(-50%, -50%) rotate(${i * 15}deg)` }} />)}</div>}
      {release.shape === 'ripple' && <div className="art-ripples">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ width: `${26 + i * 4.7}%`, height: `${26 + i * 4.7}%`, transform: `translate(-50%, -50%) rotate(${i * 4}deg)` }} />)}</div>}
    </div>
    <div className="art-bottom"><strong>{release.artist}</strong><span>{release.title}<br />33⅓ RPM / STEREO</span></div>
  </div>
}
