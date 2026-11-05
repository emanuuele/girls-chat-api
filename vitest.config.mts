import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Configuração do Vitest (benchmark de frameworks de teste unitário).
export default defineConfig({
  resolve: {
    alias: [{ find: /^App\/(.*)$/, replacement: fileURLToPath(new URL('./app/$1', import.meta.url)) }],
  },
  test: {
    include: ['tests/frameworks/vitest/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/services/ChatsService.ts', 'app/services/UserService.ts'],
    },
  },
})
