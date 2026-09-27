import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { scene } from './scene'

gsap.registerPlugin(ScrollTrigger)

export function useChoreography(root: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    let alive = true

    media.add({ desktop: '(min-width: 701px)', mobile: '(max-width: 700px)', reduced: '(prefers-reduced-motion: reduce)' }, (context) => {
      const { desktop, reduced } = context.conditions!
      const element = root.current!
      const select = gsap.utils.selector(element)
      const count = element.querySelector('.signal-value')!
      scene.progress = 0

      gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: element, start: 'top top', end: 'bottom bottom', scrub: true } })

      if (reduced) { count.textContent = '100'; return }

      const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -82 }, stopInertiaOnNavigate: true })
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro.from('.hero-title .line-mask > span', { yPercent: 115, rotation: 3, duration: 1.35, stagger: 0.12 }, 0.12)
        .from('.sculpture', { opacity: 0, scale: 0.82, rotation: -12, duration: 1.7 }, 0.25)
        .from('.hero-eyebrow, .hero-note, .hero-bottom, .sculpture-caption', { y: 15, opacity: 0, duration: 0.85, stagger: 0.1 }, 0.7)

      const hero = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
      hero.to(scene, { progress: 1, ease: 'none' }, 0)
        .to('.hero-title', { y: desktop ? 130 : 50, opacity: 0.1, ease: 'none' }, 0)
        .to('.sculpture-canvas', { yPercent: desktop ? 12 : 7, rotation: 12, ease: 'none' }, 0)

      const feeling = gsap.timeline({ scrollTrigger: { trigger: '.frequency', start: 'top top', end: 'bottom bottom', scrub: 0.65 } })
      feeling.fromTo('.frequency-title > span', { opacity: 0.15, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.7, stagger: 0.38 }, 0)
        .fromTo('.frequency-wave path', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: 'none' }, 0)
        .to('.frequency-orbits', { rotation: 65, scale: desktop ? 1.25 : 0.75, transformOrigin: '0 0', duration: 2.2, ease: 'none' }, 0)
        .from('.frequency-copy', { y: 25, opacity: 0, duration: 0.7 }, 0.9)
        .to('.frequency-progress', { scaleX: 1, duration: 2.2, ease: 'none' }, 0)
      const level = { value: 0 }
      feeling.to(level, { value: 100, duration: 2.2, ease: 'none', onUpdate: () => { count.textContent = String(Math.round(level.value)).padStart(3, '0') } }, 0)

      if (desktop) {
        const track = element.querySelector<HTMLElement>('.release-track')!
        const window = element.querySelector<HTMLElement>('.release-window')!
        const distance = () => Math.max(0, track.scrollWidth - window.clientWidth)
        const gallery = gsap.timeline({ scrollTrigger: { trigger: '.release-pin', start: 'top top', end: () => `+=${Math.max(distance() * 2, globalThis.innerHeight * 1.4)}`, pin: true, scrub: 0.7, invalidateOnRefresh: true } })
        gallery.to(track, { x: () => -distance(), ease: 'none', duration: 1 }, 0)
          .to('.release-scroll-track i', { scaleX: 1, duration: 1, ease: 'none' }, 0)
          .fromTo('.release-artwork .vinyl', { xPercent: 0, rotation: -45 }, { xPercent: 9, rotation: 35, duration: 1, ease: 'none' }, 0)
          .fromTo('.art-composition', { rotation: -12 }, { rotation: 12, duration: 1, ease: 'none' }, 0)
      } else {
        select('.release-card').forEach((card: HTMLElement) => {
          gsap.from(card, { y: 65, opacity: 0.15, rotation: 2, ease: 'none', scrollTrigger: { trigger: card, start: 'top 94%', end: 'top 50%', scrub: 0.4 } })
          gsap.fromTo(card.querySelector('.vinyl'), { xPercent: 0 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: card, start: 'top 80%', end: 'bottom 30%', scrub: 0.4 } })
        })
      }

      gsap.fromTo('.interlude-line:first-child', { xPercent: -5 }, { xPercent: -25, ease: 'none', scrollTrigger: { trigger: '.interlude', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      gsap.fromTo('.interlude-line.outline', { xPercent: -30 }, { xPercent: -5, ease: 'none', scrollTrigger: { trigger: '.interlude', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      gsap.to('.interlude .brand-mark', { rotation: 180, ease: 'none', scrollTrigger: { trigger: '.interlude', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })

      select('[data-reveal]').forEach((heading: HTMLElement) => {
        gsap.from(heading, { y: 70, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: heading, start: 'top 95%', end: 'top 55%', scrub: 0.5 } })
      })
      gsap.from('.turntable', { rotation: 7, y: 95, ease: 'none', scrollTrigger: { trigger: '.listening-deck', start: 'top 95%', end: 'top 40%', scrub: 0.7 } })

      // Native dialogs lock page scrolling, including the smooth-scroll controller.
      const dialog = element.querySelector('dialog')!
      const dialogObserver = new MutationObserver(() => { if (dialog.open) lenis.stop(); else lenis.start() })
      dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] })

      return () => { gsap.ticker.remove(tick); lenis.destroy(); dialogObserver.disconnect() }
    }, root)

    void document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh() })
    return () => { alive = false; media.revert() }
  }, [root])
}
