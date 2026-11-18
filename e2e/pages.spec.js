import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// 주요 화면이 뜨고 내용이 그려지는지, 콘솔 오류 · 가로 스크롤이 없는지 (PC · 390px)
const data = JSON.parse(readFileSync(new URL('../data.json', import.meta.url), 'utf8'))
const firstYear = data.years.find((year) => year.works.some((work) => !work.image.includes('picsum'))).id

const pages = [
  { path: '/', ready: '.chapters a' },
  { path: `/year.html?year=${firstYear}`, ready: '.gallery img' },
  { path: '/catalogs.html', ready: '.shelf a' },
  { path: '/catalog.html', ready: '.cat-book .cat-page, .cat-book .stf__item' }, // id 없이 = 인쇄 QR 이 여는 기본 도록
  { path: '/writings.html', ready: '.writing-list li' },
]

for (const { path, ready } of pages) {
  test(`${path} 이 뜬다`, async ({ page }) => {
    const errors = []
    // 글꼴(Google Fonts · jsdelivr) 같은 바깥 주소는 막는다 — 우리 사이트 파일만 본다
    await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => route.abort())
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      // 실패한 요청은 아래 response 에서 주소와 함께 잡는다 (막은 바깥 글꼴도 여기로 온다)
      if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) errors.push(message.text())
    })
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
    })

    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator(ready).first()).toBeAttached()
    await page.waitForLoadState('networkidle')

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, '가로 스크롤').toBeLessThanOrEqual(0)
    expect(errors, '콘솔 오류').toEqual([])
  })
}
