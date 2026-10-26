import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/loan-sim/' : '/',
  test: { include: ['src/**/*.test.ts'] },
})
