# 🚀 Deploy FlowCheck no EasyPanel

## Pré-requisitos

1. **Docker Desktop** instalado no Windows
2. **Node.js** e **npm** instalados
3. **Git** configurado
4. **EasyPanel** configurado no seu servidor Ubuntu
5. **Cloudflare Tunnel** configurado

## 📋 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

Ou defina no PowerShell:
```powershell
$env:VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
$env:VITE_SUPABASE_ANON_KEY="sua_chave_anonima_aqui"
```

### 2. Executar o Script de Deploy

```powershell
.\deploy.ps1
```

### 3. Fazer Push para o Git

```bash
git add .
git commit -m "feat: adicionar configuração de deploy"
git push origin main
```

### 4. Configurar no EasyPanel

1. Acesse seu EasyPanel
2. Clique em "Create Service" → "App"
3. Configure:
   - **Name**: flowcheck
   - **Source**: Git Repository
   - **Repository URL**: URL do seu repositório
   - **Branch**: main
   - **Build Type**: Dockerfile

4. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   ```

5. **Domain**: Configure seu domínio ou use o subdomínio do EasyPanel

### 5. Configurar Cloudflare Tunnel

No seu servidor Ubuntu, adicione o domínio ao tunnel:

```yaml
# ~/.cloudflared/config.yml
tunnel: seu-tunnel-id
credentials-file: /home/user/.cloudflared/seu-tunnel-id.json

ingress:
  - hostname: flowcheck.seudominio.com
    service: http://localhost:porta-do-easypanel
  - service: http_status:404
```

Reinicie o tunnel:
```bash
sudo systemctl restart cloudflared
```

## 🔧 Comandos Úteis

### Testar localmente com Docker
```powershell
docker run -p 3000:80 flowcheck:latest
```

### Ver logs do container
```powershell
docker logs container-id
```

### Rebuild da aplicação
```powershell
npm run build
```

## 🐛 Troubleshooting

### Erro de build
- Verifique se todas as dependências estão instaladas: `npm install`
- Verifique se as variáveis de ambiente estão definidas

### Erro de Docker
- Certifique-se que o Docker Desktop está rodando
- Verifique se há espaço em disco suficiente

### Erro no EasyPanel
- Verifique os logs da aplicação no painel
- Confirme se as variáveis de ambiente estão corretas
- Verifique se a porta 80 está exposta

## 📱 Acesso

Após o deploy, sua aplicação estará disponível em:
- `https://flowcheck.seudominio.com` (via Cloudflare Tunnel)
- `http://seu-ip-easypanel:porta` (acesso direto)

## 🔄 Atualizações

Para atualizar a aplicação:
1. Faça as alterações no código
2. Execute `.\deploy.ps1`
3. Faça push para o Git
4. O EasyPanel fará o redeploy automaticamente