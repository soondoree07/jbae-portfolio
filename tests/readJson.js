// 저장소 안 JSON · 파일을 테스트에서 읽는다 (경로는 저장소 루트 기준, 사이트와 같은 모양)
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

export const readJson = (path) => JSON.parse(readFileSync(root + path, 'utf8'))
export const fileExists = (path) => existsSync(root + path)
