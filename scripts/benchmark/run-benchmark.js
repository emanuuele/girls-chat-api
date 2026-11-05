#!/usr/bin/env node
/**
 * Benchmark de tempo de execução: Japa x Jest x Vitest.
 *
 * Método: para cada framework, 1 execução de aquecimento (descartada) seguida de
 * N execuções consecutivas (padrão 5) da mesma suíte de 12 testes. Mede-se:
 *  - tempo total de parede (wall-clock) do processo, do spawn ao término;
 *  - tempo interno relatado pelo próprio framework (extraído da saída).
 *
 * Uso: node scripts/benchmark/run-benchmark.js [execuções=5]
 * Saída: docs/benchmark/resultados/tempos.csv e tempos.json
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')
const RUNS = Number(process.argv[2] || 5)
const EXPECTED_TESTS = 12
const OUT_DIR = path.join(ROOT, 'docs/benchmark/resultados')
const bin = (name) => path.join(ROOT, 'node_modules/.bin', name)
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '')

const FRAMEWORKS = [
  {
    name: 'Japa',
    cmd: 'node',
    args: ['ace', 'test', 'frameworks'],
    // "Time    : 40ms"
    internal: (out) => toMs(out.match(/Time\s*:\s*([\d.]+)\s*(ms|s)/)),
    passed: (out) => Number((out.match(/Tests\s*:\s*(\d+) passed/) || [])[1]),
  },
  {
    name: 'Jest',
    cmd: bin('jest'),
    args: [],
    // "Time:        0.43 s"
    internal: (out) => toMs(out.match(/Time:\s*([\d.]+)\s*(ms|s)/)),
    passed: (out) => Number((out.match(/Tests:\s*(\d+) passed/) || [])[1]),
  },
  {
    name: 'Vitest',
    cmd: bin('vitest'),
    args: ['run'],
    // "Duration  151ms"
    internal: (out) => toMs(out.match(/Duration\s+([\d.]+)\s*(ms|s)/)),
    passed: (out) => Number((out.match(/Tests\s+(\d+) passed/) || [])[1]),
  },
]

function toMs(match) {
  if (!match) return null
  const value = Number(match[1])
  return match[2] === 's' ? value * 1000 : value
}

function runOnce(fw) {
  const start = process.hrtime.bigint()
  const result = spawnSync(fw.cmd, fw.args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, CI: 'true', FORCE_COLOR: '0', NO_COLOR: '1' },
  })
  const wallMs = Number(process.hrtime.bigint() - start) / 1e6
  const out = stripAnsi(`${result.stdout}\n${result.stderr}`)
  if (result.status !== 0) {
    console.error(out)
    throw new Error(`${fw.name} terminou com código ${result.status}`)
  }
  const passed = fw.passed(out)
  // O plugin runFailedTests do Japa reexecuta só os testes que falharam na rodada
  // anterior; garantimos que toda medição executou a suíte completa.
  if (passed !== EXPECTED_TESTS) {
    throw new Error(`${fw.name} executou ${passed} testes (esperado: ${EXPECTED_TESTS})`)
  }
  return { wallMs, internalMs: fw.internal(out), passed }
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length
const stdev = (xs) => {
  const m = mean(xs)
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1 || 1))
}

const environment = {
  date: new Date().toISOString(),
  node: process.version,
  platform: `${os.type()} ${os.release()} (${os.arch()})`,
  cpu: os.cpus()[0]?.model,
  cpus: os.cpus().length,
  memoryGb: +(os.totalmem() / 1024 ** 3).toFixed(1),
  runs: RUNS,
}

const rows = []
const summary = {}
for (const fw of FRAMEWORKS) {
  process.stdout.write(`${fw.name}: aquecimento... `)
  runOnce(fw)
  const runs = []
  for (let i = 1; i <= RUNS; i++) {
    const r = runOnce(fw)
    runs.push(r)
    rows.push({ framework: fw.name, execucao: i, ...r })
    process.stdout.write(`#${i} ${r.wallMs.toFixed(0)}ms `)
  }
  const wall = runs.map((r) => r.wallMs)
  const internal = runs.map((r) => r.internalMs)
  summary[fw.name] = {
    testes: runs[0].passed,
    paredeMediaMs: +mean(wall).toFixed(1),
    paredeDesvioMs: +stdev(wall).toFixed(1),
    internoMediaMs: +mean(internal).toFixed(1),
  }
  console.log(`\n  média parede: ${summary[fw.name].paredeMediaMs} ms ± ${summary[fw.name].paredeDesvioMs}`)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
const csv = ['framework,execucao,tempo_parede_ms,tempo_interno_ms,testes_aprovados']
for (const r of rows) {
  csv.push([r.framework, r.execucao, r.wallMs.toFixed(1), r.internalMs, r.passed].join(','))
}
fs.writeFileSync(path.join(OUT_DIR, 'tempos.csv'), csv.join('\n') + '\n')
fs.writeFileSync(
  path.join(OUT_DIR, 'tempos.json'),
  JSON.stringify({ ambiente: environment, resumo: summary, execucoes: rows }, null, 2) + '\n'
)
console.table(summary)
