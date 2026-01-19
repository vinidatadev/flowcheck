#!/bin/bash

# Script de deploy para EasyPanel
echo "🚀 Iniciando deploy do FlowCheck..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas"
    echo "💡 Crie um arquivo .env com essas variáveis ou defina-as no sistema"
    exit 1
fi

# Build da aplicação
echo "📦 Fazendo build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build da aplicação"
    exit 1
fi

# Build da imagem Docker
echo "🐳 Construindo imagem Docker..."
docker build \
    --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
    -t flowcheck:latest .

if [ $? -ne 0 ]; then
    echo "❌ Erro ao construir imagem Docker"
    exit 1
fi

echo "✅ Deploy preparado com sucesso!"
echo "📋 Próximos passos:"
echo "1. Faça push do código para seu repositório Git"
echo "2. No EasyPanel, crie uma nova aplicação"
echo "3. Configure as variáveis de ambiente no EasyPanel"
echo "4. Use o arquivo easypanel.yml como referência"