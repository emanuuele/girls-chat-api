# Benchmark de frameworks de teste unitário: Japa × Jest × Vitest

Grupo 01, Qualidade de Software (Profa. Carol Melo).
Equipe: Ana Alícia, Emanuele Maria, Fábio Henrique, Joserlan Gonçalves e Joel Fentes.

## Entregáveis

| Arquivo | Conteúdo |
|---|---|
| [`relatorio-tecnico.pdf`](relatorio-tecnico.pdf) | Relatório técnico (ainda com os números da versão de 12 testes; atualização na Tarefa B) |
| [`dados-brutos.xlsx`](dados-brutos.xlsx) | Planilha de dados brutos (idem) |
| [`apresentacao.pptx`](apresentacao.pptx) | Slides para 10 a 15 minutos (idem) |
| [`resultados/linux/`](resultados/linux) | Medição atual (45 testes): tempos e cobertura na VM/contêiner Linux em nuvem |
| `resultados/windows/` | Medição atual no Windows pessoal: gerada ao rodar `npm run benchmark` no Windows |
| [`resultados/`](resultados) | Dados que não dependem do ambiente: linhas de código, configuração/dependências e notas qualitativas |
| [`resultados/historico/`](resultados/historico) | Medições anteriores (12 testes em Linux e Windows; 34 testes no Windows do Fábio) |
| [`mensagens-de-erro/`](mensagens-de-erro) | Saída real de cada framework para duas falhas introduzidas de propósito |

## Sistema-alvo e testes

Os serviços `app/services/ChatsService.ts` e `app/services/UserService.ts`, sem alterações no código de produção.
Os mesmos **45 casos de teste** estão implementados, idênticos, nos três frameworks. A primeira versão tinha 12 casos; a Tarefa C (Fábio Henrique) ampliou para 34, e a complementação igualou os três frameworks e chegou a 45.

```
tests/frameworks/
├── shared/fakes.ts          # dublês independentes de framework (query builder, models)
├── japa/services.spec.ts    # Japa 2 + Sinon (suíte "frameworks" no .adonisrc.json)
├── jest/services.spec.ts    # Jest 30 + ts-jest (jest.config.js)
└── vitest/services.spec.ts  # Vitest 5 (vitest.config.mts)
```

Nenhum teste acessa banco de dados: os models Lucid são substituídos por dublês (`sinon.stub`, `jest.mock` e `vi.mock`).

## Como rodar

```bash
npm ci
npm run test:frameworks          # roda os 45 testes em cada framework
npm run japa:coverage            # cobertura (também jest:coverage e vitest:coverage)
npm run benchmark                # 1 aquecimento + 5 execuções por framework, mais a contagem de linhas
```

O `npm run benchmark` grava os tempos em `resultados/<linux|windows|macos>/`, conforme o sistema operacional, sem sobrescrever as medições dos outros ambientes.

O workflow `.github/workflows/frameworks-teste-unitario.yml` roda os três frameworks com cobertura e o benchmark no GitHub Actions.

## Resultados (versão atual: 45 testes)

### Tempo de execução: VM/contêiner Linux em nuvem (média de 5 execuções após 1 aquecimento)

| Framework | Parede (ms) | Interno (ms) |
|---|---:|---:|
| Japa | 1.205,5 ± 67,5 | 101,0 |
| Jest | 712,2 ± 27,5 | 403,4 |
| Vitest | **492,4 ± 29,6** | 193,0 |

A ordem é a mesma da versão de 12 testes: **Vitest < Jest < Japa**. A medição no Windows pessoal deve ser refeita com os 45 testes (`npm run benchmark` no CMD), gravando em `resultados/windows/`.

### Indicadores que não dependem do ambiente

| Indicador | Japa | Jest | Vitest |
|---|---:|---:|---:|
| Testes (idênticos nos 3) | 45 | 45 | 45 |
| Linhas de teste | 460 | 401 | **399** |
| Linhas de configuração | 71 | **10** | 15 |
| Cobertura de linhas | 98,45% | 98,45% | **98,79%*** |
| Cobertura de ramos | 97,87% | 97,87% | **98,73%** |
| Dependências transitivas | 366 | 322 | **36** |
| Média qualitativa (1–5) | 3,13 | **4,25** | **4,25** |

\* O Vitest conta linhas pela AST (ignora linhas sem instrução); a diferença vem da ferramenta, não dos testes.

Os três arquivos de teste foram formatados com a mesma configuração do Prettier (`--no-semi --single-quote --print-width 100 --trailing-comma es5`), para que a contagem de linhas compare o código e não o estilo de formatação.

### Evolução da cobertura de linhas

| Versão | Japa | Jest | Vitest |
|---|---:|---:|---:|
| 12 testes (inicial) | 44,98% | 44,98% | 37,34% |
| 34 testes (Tarefa C, Fábio) | 83,54% | 71,20%** | 78,31% |
| 45 testes (atual) | **98,45%** | **98,45%** | **98,79%** |

\*\* Na versão de 34 testes, o Jest tinha 5 casos a menos e 3 duplicados em relação ao Japa e ao Vitest.

As medições anteriores estão em [`resultados/historico/`](resultados/historico).

## Achados práticos

- O plugin `runFailedTests` do Japa faz a execução seguinte rodar **só os testes que falharam**. O script de benchmark aborta se uma execução não rodar exatamente 45 testes.
- No Japa, `assert.rejects(fn, 'texto')` exige a mensagem **exata**; para ter a mesma semântica de substring do `toThrow` do Jest/Vitest, os testes usam RegExp.
- O Japa não tem mocking nem cobertura embutidos (foram usados Sinon e c8), mas é o único que inicializa a aplicação Adonis (IoC, HTTP, banco).
