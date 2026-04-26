import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist')

const ROUTES = [
  { path: '/', out: 'index.html' },
  { path: '/about', out: 'about/index.html' },
  { path: '/preise', out: 'preise/index.html' },
  { path: '/anfragen', out: 'anfragen/index.html' },
  { path: '/impressum', out: 'impressum/index.html' },
  { path: '/datenschutz', out: 'datenschutz/index.html' },
  { path: '/_prerender-404', out: '404.html' },
]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  let fp = path.join(DIST, decodeURIComponent(url.pathname))
  try {
    const stat = fs.statSync(fp)
    if (stat.isDirectory()) fp = path.join(fp, 'index.html')
  } catch {
    fp = path.join(DIST, 'index.html')
  }
  try {
    const data = fs.readFileSync(fp)
    res.writeHead(200, {
      'content-type': MIME[path.extname(fp)] || 'application/octet-stream',
    })
    res.end(data)
  } catch {
    res.writeHead(404).end('Not found')
  }
})

const PORT = 4173
await new Promise((resolve) => server.listen(PORT, resolve))
console.log(`[prerender] serving dist/ on http://localhost:${PORT}`)

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

let failed = 0
try {
  for (const route of ROUTES) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    try {
      await page.goto(`http://localhost:${PORT}${route.path}`, {
        waitUntil: 'networkidle0',
        timeout: 60_000,
      })
      await new Promise((r) => setTimeout(r, 400))

      let html = await page.evaluate(
        () => '<!DOCTYPE html>\n' + document.documentElement.outerHTML,
      )

      // Strip runtime-injected modulepreload hints for chunks that are only
      // needed on user interaction (modals) or on other routes (lazy views).
      // These don't help LCP on the current page and compete for bandwidth.
      html = html.replace(
        /<link\s+rel="modulepreload"[^>]*href="[^"]*\/(AboutModal|ContactModal|PricingModal|AboutPage|ContactPage|PricingPage|calendar|gl|icons|Modal)-[^"]+\.js"[^>]*>/g,
        ''
      )

      // The homepage FAQPage (identified by its @id) can leak into
      // sibling prerendered routes via @vueuse/head. Scrub only that
      // specific schema block from non-root routes — page-specific
      // FAQPages (e.g. /preise) are kept.
      if (route.path !== '/') {
        html = html.replace(
          /<script[^>]*type="application\/ld\+json"[^>]*>\s*\{[^{}]*"@id"\s*:\s*"https:\/\/pulk\.space\/#faq"[\s\S]*?<\/script>/g,
          ''
        )
      }

      const outPath = path.join(DIST, route.out)
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, html, 'utf8')
      const rel = path.relative(path.resolve(DIST, '..'), outPath)
      console.log(`[prerender] OK  ${route.path.padEnd(18)} → ${rel}`)
    } catch (err) {
      failed += 1
      console.error(`[prerender] FAIL ${route.path}: ${err.message}`)
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
  server.close()
}

if (failed > 0) {
  console.error(`[prerender] ${failed} route(s) failed`)
  process.exit(1)
}
console.log(`[prerender] done (${ROUTES.length} routes)`)
