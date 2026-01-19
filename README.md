# 📋 FlowCheck - Gerenciador de Tarefas

Um aplicativo moderno de gerenciamento de tarefas construído com Vue 3, TypeScript e Supabase.

## ✨ Funcionalidades

- ✅ Criar, editar e excluir tarefas
- 🏷️ Sistema de tags personalizáveis
- 👥 Gerenciamento de usuários
- 🎨 Interface moderna e responsiva
- 📱 Funciona em desktop e mobile
- 🔄 Sincronização em tempo real com Supabase

## 🚀 Tecnologias

- **Frontend**: Vue 3 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Styling**: CSS3 com design moderno
- **Deploy**: Docker + EasyPanel

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/flowcheck.git
cd flowcheck
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

4. Execute o projeto:
```bash
npm run dev
```

## 📦 Deploy

Veja o arquivo [DEPLOY.md](./DEPLOY.md) para instruções completas de deploy no EasyPanel.

## 🗃️ Estrutura do Banco de Dados

### Tabela: users
```sql
- id (uuid, primary key)
- name (text)
- email (text, unique)
- created_at (timestamp)
```

### Tabela: tasks
```sql
- id (uuid, primary key)
- title (text)
- description (text)
- completed (boolean)
- user_id (uuid, foreign key)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabela: tags
```sql
- id (uuid, primary key)
- name (text)
- color (text)
- user_id (uuid, foreign key)
- created_at (timestamp)
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]