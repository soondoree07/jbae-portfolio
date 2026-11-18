import { expect, test } from 'vitest'
import { artRatio, chapterLabel, esc, hasRealWorks, instagramHandle, isPanorama, spanOf, titleText } from '../js/data.js'

// js/data.js — 화면 계산 (작품 비율 · 칸 수 · 글자 다듬기)
test('작품 크기는 세로×가로로 읽고, 연작 낱장 표기는 비율로 쓰지 않는다', () => {
  expect(artRatio({ size: '112×162cm' })).toBeCloseTo(162 / 112)
  expect(artRatio({ size: '100×45cm (15pieces)' })).toBeNull()
  expect(artRatio({ size: '' })).toBeNull()
})

test('칸 수: 손으로 적은 span 이 먼저, 3:1 넘으면 한 줄 전체, 1.55 넘으면 두 칸', () => {
  expect(spanOf({ span: 1, size: '10×100cm' })).toBe(1)
  expect(spanOf({ size: '10×40cm' })).toBe('full')
  expect(spanOf({ size: '100×160cm' })).toBe(2)
  expect(spanOf({ size: '100×100cm' })).toBe(1)
  expect(spanOf({ w: 800, h: 100 })).toBe('full')
  expect(isPanorama({ w: 800, h: 100 })).toBe(true)
})

test('자리표시(picsum)만 있는 시기는 숨긴다', () => {
  expect(hasRealWorks({ works: [{ image: 'https://picsum.photos/1' }] })).toBe(false)
  expect(hasRealWorks({ works: [{ image: 'images/2022/a.jpg' }] })).toBe(true)
  expect(hasRealWorks({})).toBe(false)
})

test('글자 다듬기: 시기 이름 · 인스타 아이디 · 태그 막기 · 제목 한 줄', () => {
  expect(chapterLabel({ id: '2025-2026' })).toBe('2025–2026')
  expect(instagramHandle('https://www.instagram.com/artist_jbae/')).toBe('@artist_jbae')
  expect(instagramHandle('')).toBe('')
  expect(esc('<b>"&')).toBe('&lt;b&gt;&quot;&amp;')
  expect(titleText('구름에\n 기대')).toBe('구름에 기대')
})
