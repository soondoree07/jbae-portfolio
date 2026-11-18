import { defineConfig, devices } from '@playwright/test'

// GitHub Pages 처럼 파일을 그대로 내주는 서버로 본다. 포트 = 배정 포트 4102 + 50 (다른 작업과 안 겹치게)
const port = Number(process.env.E2E_PORT ?? 4152)

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'line',
  outputDir: 'logs/e2e-results',
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: [
    { name: 'pc', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    // 포트가 차 있으면 python 이 바로 실패한다 (--strictPort 와 같은 효과)
    command: `python3 -m http.server ${port} --bind 127.0.0.1`,
    url: `http://127.0.0.1:${port}/index.html`,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'ignore', // 요청마다 찍는 줄이 많아서 끈다
    timeout: 30_000,
  },
})
