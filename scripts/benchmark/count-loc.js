#!/usr/bin/env node
/**
 * Conta linhas de código (excluindo linhas em branco e comentários) dos testes
 * e dos arquivos de configuração de cada framework.
 *
 * Uso: node scripts/benchmark/count-loc.js
 * Saída: docs/benchmark/resultados/linhas.json
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')

const GROUPS = {
  Japa: {
    testes: ['tests/frameworks/japa/services.spec.ts'],
    // Arquivos gerados por "node ace configure tests" + suíte registrada no .adonisrc.json
    configuracao: ['test.ts', 'tests/bootstrap.ts', 'contracts/tests.ts', '.adonisrc.json#tests'],
  },
  Jest: {
    testes: ['tests/frameworks/jest/services.spec.ts'],
    configuracao: ['jest.config.js'],
  },
  Vitest: {
    testes: ['tests/frameworks/vitest/services.spec.ts'],
    configuracao: ['vitest.config.mts'],
  },
  Compartilhado: {
    testes: ['tests/frameworks/shared/fakes.ts'],
    configuracao: [],
  },
}

/** Remove comentários de bloco e de linha e conta as linhas não vazias. */
function countLoc(source) {
  // Normaliza CRLF (Windows) para LF: sem isso, o "\r" no fim da linha impede que
  // comentários "//" sejam reconhecidos e eles seriam contados como código.
  const noBlock = source.replace(/\r\n?/g, '\n').replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ''))
  return noBlock
    .split('\n')
    .map((line) => line.replace(/(^|[^:'"])\/\/.*$/, '$1').trim())
    .filter((line) => line.length > 0).length
}

function readSpec(spec) {
  const [file, jsonKey] = spec.split('#')
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8')
  if (!jsonKey) return content
  // Apenas o trecho relevante de um JSON (ex.: a chave "tests" do .adonisrc.json)
  return JSON.stringify(JSON.parse(content)[jsonKey], null, 2)
}

const result = {}
for (const [name, group] of Object.entries(GROUPS)) {
  const detail = {}
  let tests = 0
  let config = 0
  for (const f of group.testes) tests += detail[f] = countLoc(readSpec(f))
  for (const f of group.configuracao) config += detail[f] = countLoc(readSpec(f))
  result[name] = { linhasTestes: tests, linhasConfiguracao: config, arquivos: detail }
}

const outDir = path.join(ROOT, 'docs/benchmark/resultados')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'linhas.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
