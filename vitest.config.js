import { defineConfig } from 'vitest/config'

// 단위 테스트는 tests/ 의 *.test.js 만. 화면은 e2e/ (Playwright)
export default defineConfig({
  test: { include: ['tests/**/*.test.js'], environment: 'node' },
})
