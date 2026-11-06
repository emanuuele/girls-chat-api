import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Pasta app/ com barras normais, para o alias funcionar também no Windows.
const appDir = fileURLToPath(new URL('./app/', import.meta.url)).replace(/\\/g, '/')

// Configuração do Vitest (benchmark de frameworks de teste unitário).
export default defineConfig({
  resolve: {
    alias: [{ find: /^App\/(.*)$/, replacement: `${appDir}$1` }],
  },
  test: {
    include: ['tests/frameworks/vitest/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/services/ChatsService.ts', 'app/services/UserService.ts'],
    },
  },
})
