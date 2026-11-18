import { describe, expect, test } from 'vitest'
import { flattenWorks, visibleChapters } from '../js/data.js'
import { fileExists, readJson } from './readJson.js'

// data.json — 화면에 걸리는 시기 · 작품마다 필수 칸과 파일이 있는지
const data = readJson('data.json')
const chapters = visibleChapters(data)

test('작가 정보 필수 칸이 있고 전화번호는 없다 (2026-08-22 지움)', () => {
  for (const key of ['name', 'nameEn', 'bio', 'email', 'instagram', 'cv']) expect(data.artist[key], key).toBeTruthy()
  expect(data.artist.phone).toBeUndefined()
})

test('화면에 걸리는 시기가 있고 id 가 겹치지 않는다', () => {
  expect(chapters.length).toBeGreaterThan(0)
  const ids = chapters.map((chapter) => String(chapter.id))
  expect(new Set(ids).size).toBe(ids.length)
})

describe.each(chapters.map((chapter) => [String(chapter.id), chapter]))('시기 %s', (_id, chapter) => {
  test('대표 이미지와 썸네일 파일이 있다', () => {
    expect(fileExists(chapter.thumbnail), chapter.thumbnail).toBe(true)
    expect(fileExists(chapter.thumb), chapter.thumb).toBe(true)
  })

  test('작품마다 제목 · 재료 · 크기 · 이미지 · w · h · 썸네일이 있다 (build_image_meta.py)', () => {
    for (const work of flattenWorks(chapter)) {
      const where = `${chapter.id} ${work.title}`
      for (const key of ['title', 'material', 'size', 'image', 'thumb']) expect(work[key], `${where} ${key}`).toBeTruthy()
      expect(work.w, `${where} w`).toBeGreaterThan(0)
      expect(work.h, `${where} h`).toBeGreaterThan(0)
      expect(fileExists(work.image), `${where} 이미지 파일`).toBe(true)
      expect(fileExists(work.thumb), `${where} 썸네일 파일`).toBe(true)
    }
  })
})
