/** Configuração do Jest (benchmark de frameworks de teste unitário). */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/frameworks/jest'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { isolatedModules: true } }],
  },
  moduleNameMapper: { '^App/(.*)$': '<rootDir>/app/$1' },
  collectCoverageFrom: ['app/services/ChatsService.ts', 'app/services/UserService.ts'],
  coverageProvider: 'v8',
}
