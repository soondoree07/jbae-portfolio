import { describe, expect, test } from 'vitest'
import { fileExists, readJson } from './readJson.js'

// 도록 목록 · 도록 내용 파일
const list = readJson('catalogs.json')
const LAYOUTS = ['right', 'big', 'pair', 'portraits', 'portrait-left']

test('기본 도록은 정부청사 도록이다 — 인쇄한 QR(jbae.art/catalog)이 이 도록을 연다', () => {
  expect(list.default).toBe('2027-seoul-gov')
  expect(list.catalogs.map((entry) => entry.id)).toContain(list.default)
})

describe.each(list.catalogs.map((entry) => [entry.id, entry]))('도록 %s', (_id, entry) => {
  const catalog = readJson(entry.source)

  test('표지 · 내용 파일이 있다', () => {
    expect(fileExists(entry.cover), entry.cover).toBe(true)
    expect(fileExists(entry.source), entry.source).toBe(true)
  })

  test('작품 그림은 사이트 data.json 에 크기(w · h)와 함께 있다', () => {
    const siteWorks = new Map()
    for (const year of readJson('data.json').years) for (const work of year.works) siteWorks.set(work.image, work)
    for (const work of catalog.works) expect(siteWorks.get(work.image)?.w, work.image).toBeGreaterThan(0)
  })

  test('펼침면은 아는 배치만 쓰고, 작품 번호가 범위 안이며 한 번씩만 나온다', () => {
    const used = catalog.spreads.flatMap((spread) => spread.works)
    for (const spread of catalog.spreads) expect(LAYOUTS).toContain(spread.layout)
    for (const no of used) expect(no >= 1 && no <= catalog.works.length, `번호 ${no}`).toBe(true)
    expect(new Set(used).size).toBe(used.length)
  })
})
