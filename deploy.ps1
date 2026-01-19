# Script de deploy para EasyPanel no Windows
Write-Host "🚀 Iniciando deploy do FlowCheck..." -ForegroundColor Green

# Verificar se as variáveis de ambiente estão definidas
if (-not $env:VITE_SUPABASE_URL -or -not $env:VITE_SUPABASE_ANON_KEY) {
    Write-Host "❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas" -ForegroundColor Red
    Write-Host "💡 Crie um arquivo .env com essas variáveis ou defina-as no sistema" -ForegroundColor Yellow
    Write-Host "Exemplo:" -ForegroundColor Yellow
    Write-Host "`$env:VITE_SUPABASE_URL='sua_url_aqui'" -ForegroundColor Cyan
    Write-Host "`$env:VITE_SUPABASE_ANON_KEY='sua_chave_aqui'" -ForegroundColor Cyan
    exit 1
}

# Verificar se npm está instalado
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Erro: npm não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Erro: Docker não encontrado. Instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Build da aplicação
Write-Host "📦 Fazendo build da aplicação..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build da aplicação" -ForegroundColor Red
    exit 1
}

# Build da imagem Docker
Write-Host "🐳 Construindo imagem Docker..." -ForegroundColor Blue
docker build --build-arg VITE_SUPABASE_URL="$env:VITE_SUPABASE_URL" --build-arg VITE_SUPABASE_ANON_KEY="$env:VITE_SUPABASE_ANON_KEY" -t flowcheck:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao construir imagem Docker" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deploy preparado com sucesso!" -ForegroundColor Green
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Faça push do código para seu repositório Git" -ForegroundColor White
Write-Host "2. No EasyPanel, crie uma nova aplicação" -ForegroundColor White
Write-Host "3. Configure as variáveis de ambiente no EasyPanel" -ForegroundColor White
Write-Host "4. Use o arquivo easypanel.yml como referência" -ForegroundColor White