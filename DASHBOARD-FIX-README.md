# Correção dos Indicadores do Dashboard

## ✅ Problema Resolvido

Os números dos cards de indicadores não batiam devido a um bug no filtro de tags "Standby".

### Sintoma
**Com Standby OCULTO:**
- Total Geral mostrava: **170** (deveria ser **192**)
- Concluídos mostrava: **138** (deveria ser **155**)
- Faltavam 22 tasks nos contadores

**Com Standby VISÍVEL:**
- Todos os números corretos: 211 total, 155 concluídos

### Causa Raiz

O filtro de Standby no `getTotalTaskCount` estava excluindo também as **22 tasks com `tag = NULL`**.

O operador Supabase `NOT (tag cs '{Standby}')` retorna `false` para tags NULL, excluindo essas tasks incorretamente.

**Distribuição das tasks:**
- Com tag Standby: 19 tasks (todas pendentes)
- Com outras tags: 170 tasks
- **Com tag NULL: 22 tasks** (17 concluídas + 5 pendentes) ← eram ignoradas

## Solução Implementada

Mudamos a estratégia de filtrar no banco para **filtrar no código JavaScript**:

### Antes (bugado):
```typescript
// Tentava filtrar no Supabase com operador OR complexo
query.or('tag.is.null,not.tag.cs.{Standby}')
// Resultado: erro 400 Bad Request
```

### Depois (correto):
```typescript
// Busca todas as tasks com o campo tag
const result = await supabase
  .from('tasks')
  .select('tag')
  .in('id_bucket', bucketIds)

// Filtra no código: exclui apenas as que TÊM Standby
const count = tasks.filter(t => !t.tag || !t.tag.includes('Standby')).length
```

## Validação Final

### Com Standby VISÍVEL:
- 📊 Total Geral: **211** ✅
- 📋 Total Pendente: **56** (10 + 46) ✅
- ⚡ Em Andamento: **10** ✅
- 🕐 Não Iniciado: **46** ✅
- 🔥 Alta Prioridade: **17** ✅
- ✅ Concluídos: **155** ✅

### Com Standby OCULTO:
- 📊 Total Geral: **192** (211 - 19) ✅
- 📋 Total Pendente: **37** (192 - 155) ✅
- ⚡ Em Andamento: **8** (10 - 2) ✅
- 🕐 Não Iniciado: **29** (46 - 17) ✅
- 🔥 Alta Prioridade: **13** (17 - 4) ✅
- ✅ Concluídos: **155** ✅

**Matemática:**
- ✅ Total Geral - Concluídos = Total Pendente (192 - 155 = 37)
- ✅ Em Andamento + Não Iniciado = Total Pendente (8 + 29 = 37)

## Arquivos Alterados

- ✅ `src/services/dashboard.ts` - Corrigido filtro de Standby em `getTotalTaskCount`
- ✅ `src/composables/useDashboard.ts` - Adicionado filtro por `status_concluido` nos KPIs

## Benefícios

1. **Precisão**: Todos os indicadores agora refletem os dados reais do banco
2. **Confiabilidade**: Filtro em JavaScript é mais previsível que operadores complexos do Supabase
3. **Performance**: Busca apenas o campo `tag`, não toda a tabela
4. **Manutenibilidade**: Lógica de filtro clara e fácil de entender
