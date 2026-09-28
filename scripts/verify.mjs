/**
 * End-to-end verification for the F1 site.
 *
 *   node scripts/verify.mjs [baseUrl]
 *
 * Desktop (1440×900), mobile (390×844 touch) and reduced-motion runs:
 * console cleanliness, 3D stage, routing, filters, livery/parts UI, contact
 * form. Screenshots land in ./verification.
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.argv[2] || 'http://127.0.0.1:4174/'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'verification')

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const problems = []
const notes = []
const fail = (m) => problems.push(m)
const ok = (m) => notes.push(m)

const IGNORE = [
  /GL Driver Message/,
  /GPU stall due to ReadPixels/,
  /Download the React DevTools/,
  /\[vite\]/,
  /favicon/,
]

async function launch() {
  return puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      '--no-sandbox',
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      '--hide-scrollbars',
    ],
  })
}

function watch(page, label) {
  const messages = []
  page.on('console', (m) => messages.push({ level: m.type(), text: m.text() }))
  page.on('pageerror', (e) => messages.push({ level: 'pageerror', text: String(e) }))
  page.on('requestfailed', (r) =>
    messages.push({ level: 'requestfailed', text: `${r.url()} — ${r.failure()?.errorText}` }),
  )
  return () => {
    const clean = messages.filter((m) => !IGNORE.some((re) => re.test(m.text)))
    const bad = clean.filter((m) => !['log', 'debug', 'info'].includes(m.level))
    if (bad.length) fail(`${label}: console errors → ${bad.map((m) => `${m.level}: ${m.text}`).join(' | ')}`)
    else ok(`${label}: no console errors`)
    const warnings = clean.filter((m) => m.level === 'warning')
    if (warnings.length) fail(`${label}: console warnings → ${warnings.map((m) => m.text).join(' | ')}`)
    else ok(`${label}: no console warnings`)
  }
}

async function stageState(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const fallback = document.body.innerText.includes('3D unavailable')
    return {
      canvas: canvas
        ? {
            attrW: canvas.width,
            attrH: canvas.height,
            cssW: Math.round(canvas.getBoundingClientRect().width),
            cssH: Math.round(canvas.getBoundingClientRect().height),
            styled: canvas.style.width !== '',
          }
        : null,
      fallback,
    }
  })
}

async function layoutState(page) {
  return page.evaluate(() => ({
    innerWidth,
    clientW: document.documentElement.clientWidth,
    scrollW: document.documentElement.scrollWidth,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    h1: document.querySelector('h1')?.innerText?.replace(/\n/g, ' / '),
  }))
}

async function desktopRun() {
  const browser = await launch()
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
    const done = watch(page, 'desktop')
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
    await wait(4500)

    // ---- stage ----
    const stage = await stageState(page)
    if (stage.fallback) fail('desktop: WebGL fallback shown')
    else if (!stage.canvas || !stage.canvas.styled || stage.canvas.cssW < 400)
      fail(`desktop: canvas not sized → ${JSON.stringify(stage)}`)
    else ok(`desktop: canvas ${stage.canvas.cssW}×${stage.canvas.cssH} (buffer ${stage.canvas.attrW}×${stage.canvas.attrH})`)

    const l0 = await layoutState(page)
    if (l0.overflowX > 1) fail(`desktop: horizontal overflow ${l0.overflowX}px`)
    else ok('desktop: no horizontal overflow')
    if (!/grid/i.test(l0.h1 ?? '')) fail(`desktop: unexpected h1 "${l0.h1}"`)
    await page.screenshot({ path: join(OUT, 'desktop-home.png') })

    // ---- livery switch ----
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'McLaren')
      btn?.click()
    })
    await wait(600)
    const livery = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'McLaren')
      return btn?.getAttribute('aria-pressed')
    })
    if (livery !== 'true') fail('desktop: livery selector did not switch to McLaren')
    else ok('desktop: livery selector works')

    // ---- part chip → detail panel ----
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Halo')
      btn?.click()
    })
    await wait(500)
    const panel = await page.evaluate(() => ({
      open: !!document.querySelector('[role="dialog"]'),
      text: document.querySelector('[role="dialog"]')?.innerText?.slice(0, 60),
    }))
    if (!panel.open) fail('desktop: part detail panel did not open')
    else ok(`desktop: part panel opens — "${panel.text?.split('\n')[1] ?? ''}"`)
    await page.screenshot({ path: join(OUT, 'desktop-part-panel.png') })
    await page.evaluate(() => document.querySelector('[role="dialog"] button[aria-label="Close part details"]')?.click())
    await wait(400)

    // ---- explore mode ----
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Explore in 3D'))
      btn?.click()
    })
    await wait(300)
    const explore = await page.evaluate(() =>
      [...document.querySelectorAll('button')].some((b) => b.textContent?.includes('Zoom mode on')),
    )
    if (!explore) fail('desktop: explore mode did not toggle')
    else ok('desktop: explore/zoom mode toggles')

    // ---- drivers page ----
    await page.click('nav a[href="#/drivers"]')
    await page.waitForSelector('input[type="search"]', { timeout: 15000 })
    await wait(800)
    const drivers = await page.evaluate(() => ({
      hash: location.hash,
      cards: document.querySelectorAll('article [class*="aspect"]').length,
      h1: document.querySelector('h1')?.innerText,
    }))
    if (drivers.hash !== '#/drivers') fail(`desktop: nav failed → ${drivers.hash}`)
    const count = await page.evaluate(() => document.querySelectorAll('button[aria-pressed]').length)
    if (count < 5) fail(`desktop: driver cards missing (pressed-buttons=${count})`)
    else ok(`desktop: drivers page loads (h1 "${drivers.h1}")`)
    await page.screenshot({ path: join(OUT, 'desktop-drivers.png') })

    // ---- search + filters ----
    await page.type('input[type="search"]', 'hamilton')
    await wait(400)
    let shown = await page.evaluate(() => document.querySelectorAll('p[role="status"]')[0]?.textContent)
    if (!/1 driver/.test(shown ?? '')) fail(`desktop: search should show 1 driver, got "${shown}"`)
    else ok('desktop: search filters to 1 driver')

    await page.evaluate(() => {
      const input = document.querySelector('input[type="search"]')
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      setter.call(input, '')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await wait(300)
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Mercedes')
      btn?.click()
    })
    await wait(400)
    shown = await page.evaluate(() => document.querySelector('p[role="status"]')?.textContent)
    if (!/2 drivers/.test(shown ?? '')) fail(`desktop: Mercedes filter should show 2, got "${shown}"`)
    else ok('desktop: team filter works')

    // ---- card flip ----
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label^="Show stats"]')
      btn?.click()
    })
    await wait(900)
    const flipped = await page.evaluate(() => document.querySelector('button[aria-label^="Hide stats"]') !== null)
    if (!flipped) fail('desktop: driver card did not flip to stats')
    else ok('desktop: driver card flips to reveal stats')
    await page.screenshot({ path: join(OUT, 'desktop-card-flip.png') })

    // ---- detail page ----
    await page.evaluate(() => {
      const clear = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Clear')
      clear?.click()
    })
    await wait(500)
    await page.click('a[href="#/drivers/lewis-hamilton"]')
    await page.waitForFunction(() => location.hash === '#/drivers/lewis-hamilton', { timeout: 15000 })
    await page.waitForFunction(
      () => /Lewis/i.test(document.querySelector('h1')?.innerText ?? ''),
      { timeout: 15000 },
    )
    await wait(700)
    const detail = await page.evaluate(() => ({
      hash: location.hash,
      title: document.title,
      h1: document.querySelector('h1')?.innerText?.replace(/\n/g, ' '),
      instagram: document.querySelector('a[href*="instagram.com/lewishamilton"]')?.getAttribute('href'),
      tiles: [...document.querySelectorAll('h2')].length,
    }))
    if (detail.hash !== '#/drivers/lewis-hamilton') fail(`detail: bad hash ${detail.hash}`)
    else if (!/Lewis Hamilton/i.test(detail.h1 ?? '')) fail(`detail: h1 "${detail.h1}"`)
    else if (detail.title !== 'Lewis Hamilton — APEX 26') fail(`detail: title "${detail.title}"`)
    else if (!detail.instagram) fail('detail: instagram link missing')
    else ok(`detail page ok — ${detail.tiles} sections, IG → ${detail.instagram}`)
    await page.screenshot({ path: join(OUT, 'desktop-driver-detail.png'), fullPage: false })

    // ---- teams page + deep link ----
    await page.click('nav a[href="#/teams"]')
    await page.waitForSelector('article', { timeout: 15000 })
    await wait(700)
    const teams = await page.evaluate(() => ({
      cards: document.querySelectorAll('article').length,
      hash: location.hash,
    }))
    if (teams.cards < 4) fail(`teams: expected 4 cards, got ${teams.cards}`)
    else ok('teams page: 4 team cards')
    await page.screenshot({ path: join(OUT, 'desktop-teams.png') })

    await page.evaluate(() => {
      const a = [...document.querySelectorAll('a')].find((x) => x.textContent?.includes('View livery in 3D'))
      a?.click()
    })
    await page.waitForFunction(() => /team=/.test(decodeURIComponent(location.hash)), { timeout: 15000 })
    await wait(1200)
    const deep = await page.evaluate(() => ({
      hash: decodeURIComponent(location.hash),
      pressed: [...document.querySelectorAll('button[aria-pressed="true"]')]
        .map((b) => b.textContent?.trim())
        .filter((t) => ['Ferrari', 'McLaren', 'Mercedes', 'Red Bull'].includes(t ?? '')),
    }))
    if (!deep.hash.includes('team=')) fail(`teams: deep link failed → ${deep.hash}`)
    else if (deep.pressed.length !== 1) fail(`teams: livery not preselected → ${JSON.stringify(deep.pressed)}`)
    else ok(`teams: “view in 3D” deep-links home with ${deep.pressed[0]} livery`)

    // ---- contact form ----
    await page.click('nav a[href="#/about"]')
    await page.waitForSelector('button[type="submit"]', { timeout: 15000 })
    await wait(500)
    await page.click('button[type="submit"]')
    await wait(400)
    const errs = await page.evaluate(
      () => [...document.querySelectorAll('form p')].map((p) => p.textContent).length,
    )
    if (errs !== 3) fail(`about: expected 3 validation errors, saw ${errs}`)
    else ok('about: empty submit shows 3 validation errors')

    await page.evaluate(() => {
      const set = (id, v) => {
        const el = document.getElementById(id)
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
      set('contact-name', 'Test Person')
      set('contact-email', 'test@example.com')
      set('contact-message', 'Hello, this is a test message long enough to validate.')
    })
    await wait(300)
    await page.click('button[type="submit"]')
    await wait(1400)
    const sent = await page.evaluate(() => document.querySelector('[role="status"]')?.innerText ?? null)
    if (!sent) fail('about: success state missing')
    else ok('about: valid submit → success state')
    await page.screenshot({ path: join(OUT, 'desktop-about.png') })

    done()
  } finally {
    await browser.close()
  }
}

async function mobileRun() {
  const browser = await launch()
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    const done = watch(page, 'mobile')
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
    await wait(4500)

    // layout viewport must NOT blow out (portfolio regression check)
    const l = await layoutState(page)
    if (l.innerWidth !== 390 || l.clientW !== 390)
      fail(`mobile: layout viewport expanded (${l.innerWidth}/${l.clientW})`)
    else ok('mobile: layout viewport stays 390px')
    if (l.overflowX > 1) fail(`mobile: horizontal overflow ${l.overflowX}px`)
    else ok('mobile: no horizontal overflow')

    const stage = await stageState(page)
    if (stage.fallback) fail('mobile: WebGL fallback shown')
    else if (!stage.canvas?.styled) fail(`mobile: canvas not sized → ${JSON.stringify(stage)}`)
    else ok(`mobile: canvas ${stage.canvas.cssW}×${stage.canvas.cssH}`)

    const menuBtn = await page.$('button[aria-controls="mobile-menu"]')
    const menuBox = menuBtn ? await menuBtn.boundingBox() : null
    if (!menuBox || menuBox.x < 0 || menuBox.x + menuBox.width > 390)
      fail(`mobile: hamburger off-screen → ${JSON.stringify(menuBox)}`)
    else ok(`mobile: hamburger on-screen at x=${Math.round(menuBox.x)}`)

    await page.screenshot({ path: join(OUT, 'mobile-home.png') })

    // menu → navigate
    await page.click('button[aria-controls="mobile-menu"]')
    await wait(500)
    const menuOpen = await page.evaluate(() => !!document.getElementById('mobile-menu'))
    if (!menuOpen) fail('mobile: menu did not open')
    else ok('mobile: menu opens')
    await page.screenshot({ path: join(OUT, 'mobile-menu.png') })

    await page.evaluate(() => document.querySelector('#mobile-menu a[href="#/drivers"]')?.click())
    await page.waitForFunction(() => location.hash === '#/drivers', { timeout: 15000 })
    await page.waitForSelector('button[aria-label^="Show stats"]', { timeout: 15000 })
    await wait(600)
    const after = await page.evaluate(() => ({
      hash: location.hash,
      menuOpen: !!document.getElementById('mobile-menu'),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      cards: document.querySelectorAll('button[aria-label^="Show stats"]').length,
    }))
    if (after.hash !== '#/drivers') fail(`mobile: navigation failed → ${after.hash}`)
    else if (after.menuOpen) fail('mobile: menu stayed open')
    else if (after.overflowX > 1) fail(`mobile: overflow after nav → ${after.overflowX}`)
    else ok(`mobile: menu navigation works (${after.cards} cards)`)
    await page.screenshot({ path: join(OUT, 'mobile-drivers.png') })

    // tap flip button
    await page.evaluate(() => document.querySelector('button[aria-label^="Show stats"]')?.click())
    await wait(900)
    const flipped = await page.evaluate(() => document.querySelector('button[aria-label^="Hide stats"]') !== null)
    if (!flipped) fail('mobile: card flip failed on tap')
    else ok('mobile: tap flips driver card')

    done()
  } finally {
    await browser.close()
  }
}

async function reducedRun() {
  const browser = await launch()
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    const done = watch(page, 'reduced-motion')
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
    await wait(4000)

    const state = await page.evaluate(() => ({
      canvas: !!document.querySelector('canvas')?.style.width,
      h1Opacity: getComputedStyle(document.querySelector('h1')).opacity,
      h1: document.querySelector('h1')?.innerText?.split('\n')[0],
    }))
    if (!state.canvas) fail('reduced-motion: canvas missing')
    else ok('reduced-motion: scene still renders')
    if (Number(state.h1Opacity) < 0.9) fail(`reduced-motion: hero hidden (${state.h1Opacity})`)
    else ok('reduced-motion: hero content visible')
    done()
  } finally {
    await browser.close()
  }
}

await mkdir(OUT, { recursive: true })
await desktopRun()
await mobileRun()
await reducedRun()

console.log('\n── OK ──')
notes.forEach((n) => console.log('  ✓ ' + n))
console.log('\n── PROBLEMS ──')
if (problems.length === 0) console.log('  none 🎉')
else problems.forEach((p) => console.log('  ✗ ' + p))
console.log(`\nScreenshots: ${OUT}`)
process.exit(problems.length ? 1 : 0)
