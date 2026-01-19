# 🏷️ Sistema de Gerenciamento de Tags - FlowCheck

## ✨ Funcionalidade Implementada

### 🎯 **Objetivo Alcançado**
Sistema completo de CRUD (Criar, Ler, Atualizar, Deletar) para gerenciar tags e tags de processo, com controle de acesso por nível de usuário.

---

## 🔐 **Controle de Acesso**

### **Níveis de Permissão:**
- **Nível 2 (Admin):** Acesso completo ao gerenciamento
  - ✅ Criar tags
  - ✅ Editar tags
  - ✅ Deletar tags
  - ✅ Ver interface de gerenciamento

- **Nível 1 (User):** Sem acesso
  - ❌ Não vê o menu "Gerenciar Tags"
  - ❌ Não pode acessar `/tags`
  - ❌ Redirecionado para `/home` se tentar acessar

### **Implementação de Segurança:**
```typescript
// Router Guard
if (requiresLevel2 && userLevel < 2) {
  next('/home') // Bloqueia acesso
}

// Sidebar condicional
<div v-if="user?.nivel === 2" class="admin-section">
  <!-- Menu só aparece para nível 2 -->
</div>
```

---

## 🏗 **Arquitetura Implementada**

### **1. Serviços (src/services/tags.ts)**
```typescript
// CRUD completo para ambas as tabelas
createTag(tag, color)
createTagProcesso(tagProcesso, color)
updateTag(id, tag, color)
updateTagProcesso(id, tagProcesso, color)
deleteTag(id)
deleteTagProcesso(id)
checkTagExists(tag, excludeId?) // Validação de duplicatas
checkTagProcessoExists(tagProcesso, excludeId?)
```

### **2. Views**
- **TagManagementView.vue** - Tela principal de gerenciamento
- **Rota:** `/tags` (protegida por nível)

### **3. Componentes**
- **TagFormModal.vue** - Modal para criar/editar
- **TagDeleteModal.vue** - Modal de confirmação de exclusão
- **TaskTag.vue** - Preview visual das tags

### **4. Navegação**
- **Sidebar.vue** - Menu "Gerenciar Tags" (nível 2 apenas)
- **Router** - Guard de proteção por nível

---

## 🎨 **Interface do Usuário**

### **Tela Principal (`/tags`)**
```
┌─────────────────────────────────────────────────┐
│ 🏷️ Gerenciar Tags                    [← Voltar] │
│ Criar, editar e organizar tags do sistema       │
├─────────────────────────────────────────────────┤
│ [Tags (5)] | [Tags de Processo (3)]  [+ Nova]   │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ [SAP] SAP                    #2563eb ✏️ 🗑️ │ │
│ │ [PowerBI] PowerBI            #f59e0b ✏️ 🗑️ │ │
│ │ [Contratação] Contratação    #dc2626 ✏️ 🗑️ │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### **Modal de Criação/Edição**
```
┌─────────────────────────────────────┐
│ Nova Tag                        [×] │
├─────────────────────────────────────┤
│ 🏷️ Nome da Tag                     │
│ [Digite o nome da tag...]           │
│                                     │
│ 🎨 Cor                              │
│ [🔵] [2563eb] [Preview Tag]         │
│ Digite o código hex sem "#"         │
│                                     │
│              [Cancelar] [Criar]     │
└─────────────────────────────────────┘
```

### **Modal de Exclusão**
```
┌─────────────────────────────────────┐
│ ⚠️ Confirmar Exclusão               │
├─────────────────────────────────────┤
│ Você está prestes a excluir:        │
│                                     │
│        [SAP]                        │
│                                     │
│ ⚠️ Esta tag pode estar associada    │
│    a tasks existentes.              │
│                                     │
│ Deseja realmente excluir?           │
│                                     │
│              [Cancelar] [Excluir]   │
└─────────────────────────────────────┘
```

---

## 🔄 **Fluxos de Operação**

### **1. Criar Tag**
1. Usuário nível 2 acessa "Gerenciar Tags"
2. Clica em "Nova Tag" ou "Nova Tag de Processo"
3. Preenche nome e cor
4. Sistema valida duplicatas
5. Salva no banco
6. Atualiza interface automaticamente
7. Recarrega metadata do sistema

### **2. Editar Tag**
1. Clica no ícone ✏️ da tag
2. Modal abre com dados preenchidos
3. Modifica nome e/ou cor
4. Sistema valida (excluindo própria tag)
5. Salva alterações
6. Atualiza todo o sistema

### **3. Deletar Tag**
1. Clica no ícone 🗑️ da tag
2. Modal de confirmação aparece
3. Usuário confirma exclusão
4. Remove do banco
5. Atualiza interface
6. Recarrega metadata

---

## 🎯 **Funcionalidades Especiais**

### **1. Validação de Duplicatas**
```typescript
// Impede criar tags com mesmo nome
const exists = await tagsService.checkTagExists(name, excludeId)
if (exists) {
  showError('Esta tag já existe')
}
```

### **2. Preview em Tempo Real**
```vue
<!-- Mostra como a tag ficará -->
<TaskTag
  :tag="formData.name || 'Preview'"
  :type="type"
  :color="formData.color"
/>
```

### **3. Color Picker + Hex Input**
```vue
<!-- Dupla entrada de cor -->
<input type="color" v-model="colorValue" />
<input type="text" v-model="formData.color" pattern="[0-9A-Fa-f]{6}" />
```

### **4. Integração Automática**
- Após qualquer operação CRUD:
  - ✅ Recarrega `useMetadata()`
  - ✅ Atualiza filtros automaticamente
  - ✅ Atualiza cards existentes
  - ✅ Atualiza dropdowns de seleção

---

## 📊 **Estrutura de Dados**

### **Tabelas Gerenciadas:**
```sql
-- Tabela: public.tags
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  tag TEXT,
  color TEXT  -- hex sem "#": "2563eb"
);

-- Tabela: public.tags_processo  
CREATE TABLE tags_processo (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  tag_processo TEXT,
  color TEXT  -- hex sem "#": "059669"
);
```

### **Campos Editáveis:**
- ✅ **Nome:** `tag` ou `tag_processo`
- ✅ **Cor:** `color` (hex sem #)

### **Campos Protegidos:**
- 🔒 **ID:** Não editável
- 🔒 **Created At:** Não editável

---

## 🚀 **Integração com Sistema Existente**

### **Filtros Atualizados:**
```typescript
// FilterPanel carrega tags com cores
const [tagsData, tagsProcessoData] = await Promise.all([
  tagsService.getTags(),
  tagsService.getTagsProcesso()
])

// Mapeia para formato com cores
availableTags.value = tagsData.map(tag => ({
  name: tag.tag!,
  color: tag.color
}))
```

### **Cards Atualizados:**
```typescript
// TaskCard busca cores via metadata
const tagColor = metadata.getTagColor(tagName)
const tagProcessoColor = metadata.getTagProcessoColor(tagName)
```

### **Metadata Sincronizada:**
```typescript
// useMetadata fornece cores
getTagColor(tagName): string | null
getTagProcessoColor(tagName): string | null
```

---

## 🔒 **Segurança e Validações**

### **Validações Frontend:**
- ✅ Nome obrigatório
- ✅ Cor hex válida (6 caracteres)
- ✅ Sem duplicatas
- ✅ Máximo 50 caracteres no nome

### **Validações Backend:**
- ✅ RLS (Row Level Security) mantido
- ✅ Permissões por nível de usuário
- ✅ Validação de tipos de dados

### **Controle de Acesso:**
- ✅ Router guard por nível
- ✅ UI condicional por nível
- ✅ Redirecionamento automático

---

## 📱 **Responsividade**

### **Desktop:**
- Grid de tags em múltiplas colunas
- Modais centralizados
- Sidebar completa

### **Mobile:**
- Grid de uma coluna
- Modais full-width
- Sidebar colapsável
- Botões touch-friendly

---

## 🎯 **Resultado Final**

### **Para Administradores (Nível 2):**
- ✅ Controle total sobre tags
- ✅ Interface intuitiva e moderna
- ✅ Validações em tempo real
- ✅ Preview visual das mudanças
- ✅ Integração automática com sistema

### **Para Usuários (Nível 1):**
- ✅ Continuam usando tags normalmente
- ✅ Veem cores atualizadas automaticamente
- ✅ Não têm acesso à administração
- ✅ Sistema transparente

### **Benefícios:**
- 🎨 **Tags dinâmicas:** Cores gerenciadas pelo banco
- 🔒 **Segurança:** Controle por nível de acesso
- 🚀 **Performance:** Atualizações automáticas
- 💡 **UX:** Interface administrativa profissional
- 🔄 **Integração:** Funciona com todo o sistema existente

---

**🎉 Sistema de gerenciamento de tags implementado com sucesso!**
*Controle total, segurança por nível e integração perfeita com o FlowCheck.*