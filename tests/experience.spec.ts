import { expect, test } from '@playwright/test'

test('loads local assets, renders the sculpture, and fits the viewport', async ({ page }) => {
  const errors: string[] = []
  const external: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('requestfailed', (request) => errors.push(request.url()))
  page.on('request', (request) => { if (!request.url().startsWith('http://localhost:5175')) external.push(request.url()) })
  await page.goto('/')
  await expect(page.locator('.sculpture-canvas')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ORDINARY')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute('aria-pressed', 'false')
  expect(errors).toEqual([])
  expect(external).toEqual([])
})

test('listening room supports playback, track selection, volume, Escape, and focus restoration', async ({ page }) => {
  await page.goto('/')
  const entry = page.locator('.hero-listen')
  await entry.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading')).toHaveText('Soft currents')
  await dialog.getByRole('button', { name: 'Start playback' }).click()
  await expect(dialog.getByRole('button', { name: 'Pause playback' })).toBeVisible()
  await dialog.getByRole('button', { name: 'Next track' }).click()
  await expect(dialog.getByRole('heading')).toHaveText('In between')
  await dialog.getByRole('button', { name: 'Previous track' }).click()
  await expect(dialog.getByRole('heading')).toHaveText('Soft currents')
  await dialog.getByRole('slider', { name: 'Volume' }).fill('0.25')
  await expect(dialog.getByRole('slider', { name: 'Volume' })).toHaveValue('0.25')
  await dialog.getByRole('button', { name: 'Pause playback' }).click()
  await expect(dialog.getByRole('button', { name: 'Start playback' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(entry).toBeFocused()
})

test('the sound switch produces actual audio and stops it', async ({ page }) => {
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createAnalyser
    AudioContext.prototype.createAnalyser = function () {
      const analyser = original.call(this)
      const target = window as Window & { testAnalyser?: AnalyserNode }
      target.testAnalyser = analyser
      return analyser
    }
  })
  await page.goto('/')
  expect(await page.evaluate(() => Boolean((window as Window & { testAnalyser?: AnalyserNode }).testAnalyser))).toBe(false)
  await page.getByRole('button', { name: 'Turn sound on' }).click()
  await expect.poll(() => page.evaluate(() => {
    const analyser = (window as Window & { testAnalyser?: AnalyserNode }).testAnalyser
    if (!analyser) return 0
    const samples = new Float32Array(analyser.fftSize)
    analyser.getFloatTimeDomainData(samples)
    return Math.max(...samples.map(Math.abs))
  })).toBeGreaterThan(0.001)
  await page.getByRole('button', { name: 'Turn sound off' }).click()
  await expect.poll(() => page.evaluate(() => {
    const analyser = (window as Window & { testAnalyser?: AnalyserNode }).testAnalyser!
    const samples = new Float32Array(analyser.fftSize)
    analyser.getFloatTimeDomainData(samples)
    return Math.max(...samples.map(Math.abs))
  })).toBeLessThan(0.001)
})

test('navigation reaches the listening room and returns to the opening', async ({ page }, testInfo) => {
  await page.goto('/')
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.getByRole('navigation').getByRole('link', { name: 'Listening room' }).click()
  await expect.poll(() => page.locator('#listening').evaluate((element) => Math.abs(element.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)))).toBeLessThan(3)
  if (testInfo.project.name === 'mobile') await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false')
  await page.getByRole('link', { name: 'Resonant home' }).click()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3)
  await expect.poll(() => page.locator('.hero-title').evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.99)
})

test('the final release is reachable and opens the right record', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.waitForFunction(() => document.fonts.status === 'loaded')
  if (testInfo.project.name === 'desktop') {
    await page.evaluate(() => {
      const releases = document.querySelector('#releases')!
      window.scrollTo(0, releases.getBoundingClientRect().bottom + scrollY - innerHeight - 12)
    })
  } else await page.locator('.release-card').last().scrollIntoViewIfNeeded()
  const button = page.getByRole('button', { name: 'Play A different light' })
  await expect(button).toBeInViewport()
  await button.click()
  await expect(page.getByRole('dialog').getByRole('heading')).toHaveText('A different light')
  await expect(page.getByRole('button', { name: 'Pause playback' })).toBeVisible()
})

test('reduced motion keeps content visible and removes the pinned gallery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(page.locator('.hero-title')).toHaveCSS('opacity', '1')
  await expect(page.locator('.frequency-stage')).toHaveCSS('position', 'relative')
  await expect(page.locator('.signal-value')).toHaveText('100')
  await expect(page.locator('.turntable-record')).toHaveCSS('animation-name', 'none')
  for (const heading of await page.locator('main h2').all()) await expect(heading).toHaveCSS('opacity', '1')
  await page.getByRole('button', { name: 'STAY A LITTLE LONGER' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('the chrome fallback appears when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (kind: string, ...args: unknown[]) {
      if (kind === 'webgl' || kind === 'webgl2') return null
      return Reflect.apply(original, this, [kind, ...args])
    } as typeof original
  })
  await page.goto('/')
  await expect(page.locator('.sculpture-fallback')).toBeVisible()
  await page.locator('.hero-listen').click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('compact screens keep the gallery controls and player inside the viewport', async ({ page }, testInfo) => {
  const desktop = testInfo.project.name === 'desktop'
  await page.setViewportSize(desktop ? { width: 1366, height: 768 } : { width: 320, height: 740 })
  await page.goto('/')
  if (desktop) {
    await page.getByRole('navigation').getByRole('link', { name: 'The releases' }).click()
    await expect(page.getByRole('button', { name: 'Play Soft currents' })).toBeInViewport()
    await expect.poll(() => page.locator('.release-footer').evaluate((element) => element.getBoundingClientRect().bottom <= innerHeight)).toBe(true)
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Resonant home' }).click()
  await page.locator('.hero-listen').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  await expect(dialog.getByRole('slider', { name: 'Volume' })).toBeInViewport()
})

test('keyboard focus brings off-screen release controls into view', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Mobile releases use native vertical document flow.')
  await page.goto('/')
  await page.getByRole('navigation').getByRole('link', { name: 'The releases' }).click()
  const covers = page.locator('.release-artwork')
  await covers.first().focus()
  for (let index = 0; index < 3; index++) {
    await expect(covers.nth(index)).toBeFocused()
    await expect(covers.nth(index)).toBeInViewport({ ratio: 0.9 })
    await page.keyboard.press('Tab')
    await expect(page.locator('.release-play').nth(index)).toBeFocused()
    await expect(page.locator('.release-play').nth(index)).toBeInViewport()
    if (index < 2) await page.keyboard.press('Tab')
  }
})
