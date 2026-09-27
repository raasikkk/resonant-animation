export const releases = [
  { id: 'RSN—001', artist: 'AURA', title: 'Soft currents', genre: 'Ambient / Electronic', year: '2026', color: '#b5bea5', shape: 'orbit', bpm: 72, root: 130.81, notes: [0, 7, 12, 16, 19, 12, 7, 4], description: 'A slow exhale. Warm analogue tones drift through an open, unhurried space.' },
  { id: 'RSN—002', artist: 'KŌDA', title: 'In between', genre: 'Dub / Experimental', year: '2026', color: '#ec542f', shape: 'fold', bpm: 96, root: 110, notes: [0, 12, 7, 10, 0, 15, 7, 12], description: 'A little tension. A lot of space. Rounded bass and delayed fragments, somewhere between motion and stillness.' },
  { id: 'RSN—003', artist: 'SINE', title: 'A different light', genre: 'Minimal / Electronica', year: '2026', color: '#b8aec8', shape: 'ripple', bpm: 112, root: 146.83, notes: [0, 3, 7, 12, 10, 7, 3, 15], description: 'Small patterns become something bigger. A restless pulse, refracted into a hundred shades of light.' },
] as const

export type Release = typeof releases[number]
