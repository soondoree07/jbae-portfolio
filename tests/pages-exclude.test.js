// GitHub Pages(Jekyll)가 jbae.art 에 낼 파일 — 개발 파일은 빼고, 사이트가 읽는 파일은 남긴다 (_config.yml 의 exclude)
import { readdirSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { fileExists, readJson } from './readJson.js'

const root = new URL('..', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

/** _config.yml 의 `exclude:` 아래 `- 항목` 줄만 읽는다 (설정이 짧아 YAML 도구를 들이지 않는다) */
function excludeList() {
  if (!fileExists('_config.yml')) return []
  const lines = read('_config.yml').split('\n')
  const start = lines.findIndex((line) => /^exclude:\s*$/.test(line))
  if (start < 0) return []
  const items = []
  for (const line of lines.slice(start + 1)) {
    const item = line.match(/^\s+-\s+"?([^"#]+?)"?\s*(#.*)?$/)
    if (item) items.push(item[1])
    else if (line.trim() && !line.trim().startsWith('#')) break
  }
  return items
}

const excluded = excludeList()
const isExcluded = (path) =>
  excluded.some((entry) => {
    const name = entry.replace(/\/$/, '')
    return path === name || path.startsWith(name + '/')
  })

/** 사이트 html · js 가 읽는 저장소 안 파일 (src · href · fetch 하는 'x.json' 같은 이름) */
function siteReferences() {
  const htmlFiles = readdirSync(root).filter((name) => name.endsWith('.html'))
  const jsFiles = readdirSync(new URL('js/', root)).filter((name) => name.endsWith('.js')).map((name) => 'js/' + name)
  const refs = new Set(htmlFiles)
  for (const file of [...htmlFiles, ...jsFiles]) {
    for (const [, path] of read(file).matchAll(/(?:src|href)="([^"#?:]+)/g)) refs.add(path)
    for (const [, path] of read(file).matchAll(/['"`]([\w./-]+\.(?:json|js|css|png|jpe?g|webp|ico|svg))['"`]/g)) refs.add(path)
  }
  for (const entry of readJson('catalogs.json').catalogs) refs.add(entry.source).add(entry.cover)
  // data.json 의 그림 주소는 화면이 이어 붙여 쓴다 (images/…)
  for (const [, path] of JSON.stringify(readJson('data.json')).matchAll(/"((?:images|catalogs)\/[^"]+)"/g)) refs.add(path)
  return [...refs].filter((path) => !path.startsWith('/') && !path.startsWith('http'))
}

test('_config.yml 이 개발 파일 · 문서를 jbae.art 에서 뺀다', () => {
  const devFiles = [
    'package.json', 'package-lock.json', 'playwright.config.js', 'vitest.config.js', 'harness.json',
    'tests/data-js.test.js', 'e2e/pages.spec.js', 'tools/build_qr.py', 'docs/exec-plans/tech-debt-tracker.md',
    'logs/x/verify-report.md', 'node_modules/vitest/package.json',
    'README.md', 'CHANGELOG.md', 'CLAUDE.md', 'ARCHITECTURE.md', 'RESUME.md', 'LAST_CHAT.md',
  ]
  for (const path of devFiles) expect(isExcluded(path), path).toBe(true)
})

test('Jekyll 기본 제외 목록도 다시 적혀 있다 (exclude 를 쓰면 기본값이 덮어써진다)', () => {
  for (const entry of ['.sass-cache/', '.jekyll-cache/', 'gemfiles/', 'Gemfile', 'Gemfile.lock', 'node_modules/',
    'vendor/bundle/', 'vendor/cache/', 'vendor/gems/', 'vendor/ruby/']) expect(excluded, entry).toContain(entry)
})

test('사이트가 읽는 파일은 하나도 빠지지 않는다', () => {
  const refs = siteReferences()
  expect(refs).toEqual(expect.arrayContaining(['data.json', 'writings.json', 'catalogs.json', 'catalog.html', 'js/home.js']))
  const always = ['CNAME', 'favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'og-nabi.jpg', 'catalog-v1.json']
  for (const path of [...refs, ...always]) expect(isExcluded(path), path).toBe(false)
})
