import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('artifacts', { recursive: true })
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
await page.goto('http://localhost:5175', { waitUntil: 'networkidle' })
await page.waitForTimeout(2600)
await page.screenshot({ path: 'artifacts/desktop-hero.png' })
console.log('Initial:', await page.evaluate(() => ({ title: document.title, width: document.documentElement.scrollWidth, viewport: innerWidth, shader: document.querySelector('canvas').dataset.ready, height: document.documentElement.scrollHeight })))
for (const [name, selector, fraction] of [['frequency', '#frequency', .3], ['releases', '#releases', .35], ['interlude', '.interlude', 0], ['listening', '#listening', 0], ['footer', '.footer', 0]]) {
  const top = await page.locator(selector).evaluate((element, fraction) => element.getBoundingClientRect().top + scrollY + (element.offsetHeight - innerHeight) * fraction - (fraction ? 0 : 83), fraction)
  await page.evaluate((y) => window.scrollTo(0, y), top)
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `artifacts/desktop-${name}.png` })
}
await page.getByRole('button', { name: 'STAY A LITTLE LONGER' }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: 'artifacts/desktop-player.png' })
await page.keyboard.press('Escape')
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(2200)
await page.screenshot({ path: 'artifacts/mobile-hero.png', fullPage: false })
console.log('Mobile:', await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, height: document.documentElement.scrollHeight })))
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.waitForTimeout(400)
await page.screenshot({ path: 'artifacts/mobile-full.png', fullPage: true })
console.log('Errors:', errors)
await browser.close()
