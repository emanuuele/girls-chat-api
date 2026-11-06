# Benchmark de frameworks de teste unitário: Japa × Jest × Vitest

Grupo 01, Qualidade de Software (Profa. Carol Melo).
Equipe: Ana Alícia, Emanuele Maria, Fábio Henrique, Joserlan Gonçalves e Joel Fentes.

## Entregáveis

| Arquivo | Conteúdo |
|---|---|
| [`relatorio-tecnico.pdf`](relatorio-tecnico.pdf) | Relatório técnico completo (o `.html` é a fonte do PDF) |
| [`dados-brutos.xlsx`](dados-brutos.xlsx) | Tempos de cada execução, linhas, cobertura, configuração, notas qualitativas e tabela comparativa (com fórmulas) |
| [`apresentacao.pptx`](apresentacao.pptx) | Slides para 10 a 15 minutos, com notas do apresentador |
| [`resultados/linux/`](resultados/linux) | Medição 1: tempos e cobertura no ambiente Linux (VM/contêiner em nuvem) |
| [`resultados/windows/`](resultados/windows) | Medição 2: tempos e cobertura no computador pessoal com Windows |
| [`resultados/`](resultados) | Dados que não dependem do ambiente: linhas de código, configuração/dependências e notas qualitativas |
| [`mensagens-de-erro/`](mensagens-de-erro) | Saída real de cada framework para duas falhas introduzidas de propósito |

## Sistema-alvo e testes

Os serviços `app/services/ChatsService.ts` e `app/services/UserService.ts`, sem alterações no código de produção.
Os mesmos 12 casos de teste (5 de sucesso e 7 de falha/exceção) estão implementados em:

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
npm run test:frameworks          # roda os 12 testes em cada framework
npm run japa:coverage            # cobertura (também jest:coverage e vitest:coverage)
npm run benchmark                # 1 aquecimento + 5 execuções por framework, mais a contagem de linhas
```

O `npm run benchmark` grava os tempos em `resultados/<linux|windows|macos>/`, conforme o sistema operacional, sem sobrescrever as medições dos outros ambientes.

O workflow `.github/workflows/frameworks-teste-unitario.yml` roda os três frameworks com cobertura e o benchmark no GitHub Actions.

## Resultados

As medições de tempo foram feitas em dois ambientes:

- **Medição 1: VM/contêiner Linux em nuvem** (ambiente onde o estudo foi montado), em [`resultados/linux/`](resultados/linux)
- **Medição 2: Windows pessoal (testes via CMD)**, em [`resultados/windows/`](resultados/windows)

### Tempo de execução (média de 5 execuções após 1 aquecimento)

| Framework | Linux: parede (ms) | Linux: interno (ms) | Windows: parede (ms) | Windows: interno (ms) |
|---|---:|---:|---:|---:|
| Japa | 976,7 ± 66,6 | 38,6 | 5.238,3 ± 267,3 | 55,2 |
| Jest | 629,5 ± 54,9 | 342,8 | 1.019,8 ± 27,1 | 610,8 |
| Vitest | **408,7 ± 45,0** | 168,6 | **794,0 ± 23,3** | 303,2 |

Os valores absolutos diferem porque as medições vêm de ambientes diferentes. A ordem é a mesma nos dois: **Vitest < Jest < Japa** no tempo de parede.

### Indicadores que não dependem do ambiente

| Indicador | Japa | Jest | Vitest |
|---|---:|---:|---:|
| Linhas de teste | 130 | 125 | **123** |
| Linhas de configuração | 71 | **10** | 15 |
| Cobertura de linhas | 44,98% | 44,98% | 37,34%* |
| Dependências transitivas | 366 | 322 | **36** |
| Média qualitativa (1–5) | 3,13 | **4,25** | **4,25** |

\* O Vitest conta linhas pela AST (ignora linhas sem instrução); a diferença vem da ferramenta, não dos testes. A cobertura do Vitest foi medida nos dois ambientes e deu 37,34% em ambos.

## Achados práticos

- O plugin `runFailedTests` do Japa faz a execução seguinte rodar **só os testes que falharam**. O script de benchmark aborta se uma execução não rodar exatamente 12 testes.
- No Japa, `assert.rejects(fn, 'texto')` exige a mensagem **exata**; para ter a mesma semântica de substring do `toThrow` do Jest/Vitest, os testes usam RegExp.
- O Japa não tem mocking nem cobertura embutidos (foram usados Sinon e c8), mas é o único que inicializa a aplicação Adonis (IoC, HTTP, banco).
