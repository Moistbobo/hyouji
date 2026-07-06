/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => {
  const base =
    command === 'build' && process.env.GITHUB_PAGES === 'true'
      ? '/hyouji/'
      : '/'

  return {
    base,
    plugins: [react(), tailwindcss()],
  }
})
