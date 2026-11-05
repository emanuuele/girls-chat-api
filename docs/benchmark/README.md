# Benchmark de frameworks de teste unitário: Japa × Jest × Vitest

Grupo 01, Qualidade de Software (Profa. Carol Melo).
Equipe: Ana Alícia, Emanuele Maria, Fábio Henrique, Joserlan Gonçalves e Joel Fentes.

## Entregáveis

| Arquivo | Conteúdo |
|---|---|
| [`relatorio-tecnico.pdf`](relatorio-tecnico.pdf) | Relatório técnico completo (o `.html` é a fonte do PDF) |
| [`dados-brutos.xlsx`](dados-brutos.xlsx) | Tempos de cada execução, linhas, cobertura, configuração, notas qualitativas e tabela comparativa (com fórmulas) |
| [`apresentacao.pptx`](apresentacao.pptx) | Slides para 10 a 15 minutos, com notas do apresentador |
| [`resultados/`](resultados) | Dados brutos em CSV/JSON gerados pelos scripts |
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

O workflow `.github/workflows/frameworks-teste-unitario.yml` roda os três frameworks com cobertura e o benchmark no GitHub Actions.

## Resultados (Node 22, Linux, 4 vCPUs)

| Indicador | Japa | Jest | Vitest |
|---|---:|---:|---:|
| Tempo médio de parede (ms) | 976,7 | 629,5 | **408,7** |
| Tempo interno relatado (ms) | **38,6** | 342,8 | 168,6 |
| Linhas de teste | 130 | 125 | **123** |
| Linhas de configuração | 71 | **10** | 14 |
| Cobertura de linhas | 44,98% | 44,98% | 37,34%* |
| Dependências transitivas | 366 | 322 | **36** |
| Média qualitativa (1–5) | 3,13 | **4,25** | **4,25** |

\* O Vitest conta linhas pela AST (ignora linhas sem instrução); a diferença vem da ferramenta, não dos testes.

## Achados práticos

- O plugin `runFailedTests` do Japa faz a execução seguinte rodar **só os testes que falharam**. O script de benchmark aborta se uma execução não rodar exatamente 12 testes.
- No Japa, `assert.rejects(fn, 'texto')` exige a mensagem **exata**; para ter a mesma semântica de substring do `toThrow` do Jest/Vitest, os testes usam RegExp.
- O Japa não tem mocking nem cobertura embutidos (foram usados Sinon e c8), mas é o único que inicializa a aplicação Adonis (IoC, HTTP, banco).
