# RESONANT — Template 4

An original, animated website for a fictional independent electronic label. Warm ivory, charcoal, and signal orange; condensed typography; a real-time chrome sculpture; original geometric record sleeves; and an actual listening room.

## Run

```sh
pnpm install
pnpm dev       # http://localhost:5175
pnpm build     # TypeScript + production bundle
pnpm preview
pnpm lint
```

## The experience

- **Opening:** staggered type masks, a ray-marched chrome torus with studio reflections, subtle pointer movement, and a scroll-driven rotation. The sculpture reacts to audio energy when sound is on.
- **Our frequency:** a pinned manifesto, rotating orbital lines, a drawn waveform, and a live scroll counter.
- **Releases:** a desktop horizontal gallery with animated sleeve compositions and physical vinyl reveals. Mobile becomes a vertical sequence. Keyboard focus scrolls off-screen records into view.
- **Intermission:** oversized orange-and-ink typography moves in opposing directions as the visitor scrolls.
- **Listening room:** a rotating CSS turntable and a native dialog with three original synthesized sketches, next/previous controls, volume, and a live frequency visualizer. Audio starts only after an explicit play action.
- **Closing:** a moving identity ribbon and a typographic invitation to keep listening.

The main choreography is scroll-driven, so the page works as a continuous screen recording. Let the opening settle, then scroll slowly; switch sound on to animate the deck and hear the sketches. All artwork, fonts, and audio generation are local. There are no external asset requests, API keys, tracking scripts, or backend services.

## Customize

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Sections, navigation, copy, and player entry points |
| `src/index.css` | Color tokens, responsive layouts, artwork, and turntable |
| `src/data/releases.ts` | Artists, releases, sleeve colors, BPM, and note patterns |
| `src/lib/useChoreography.ts` | GSAP timelines, Lenis, and responsive scroll behavior |
| `src/components/Sculpture.tsx` | Original WebGL shader and render lifecycle |
| `src/lib/useAudio.ts` | Opt-in synthesis, scheduling, delay, and output limiting |
| `src/components/Player.tsx` | Accessible native listening-room dialog |

The artist names and releases are fictional. The listening room generates continuous musical sketches in the browser; these are not licensed recordings or downloadable albums. Fonts are Barlow Condensed and DM Sans, distributed with their SIL Open Font License files under `public/fonts/`.

## Accessibility and performance

Semantic navigation and headings, a skip link, visible keyboard focus, labeled controls, a focus-trapping native dialog, and a mobile menu. `prefers-reduced-motion` disables smooth scrolling, pinning, motion effects, and continuous decorative animation while leaving the complete page usable. WebGL failures fall back to a CSS chrome sculpture.

The shader is capped at 30 fps and 1,100 pixels on its longest edge, pauses off screen and in background tabs, and uses GSAP's shared ticker. The audio scheduler avoids bursts after background-tab throttling. Effects, observers, audio contexts, and event listeners clean up on unmount. All assets are self-hosted.

## Browser checks

```sh
pnpm exec playwright install chromium
pnpm test
```

Playwright runs desktop and mobile checks for rendering, local asset loading, viewport overflow, actual audio output, playback controls, modal focus restoration, navigation offsets, gallery reachability, reduced motion, and the WebGL fallback. `tests/visual-review.mjs` captures a set of screenshots against the dev server on port 5175; its output lives in the ignored `artifacts/` directory.

Built with React, TypeScript, Vite, GSAP, Lenis, WebGL, and the Web Audio API.
