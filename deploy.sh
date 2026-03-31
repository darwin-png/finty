#!/bin/bash
# ===========================================
# Script de deploy para Finty en VPS
# ===========================================
# Uso: ./deploy.sh
# Prerequisitos: Docker + Docker Compose instalados

set -e

echo "🔨 Construyendo Finty..."
docker compose build

echo "🚀 Levantando Finty..."
docker compose up -d

echo "✅ Finty corriendo en puerto 3000"
echo ""
echo "Siguiente paso: configurar Nginx + SSL"
echo "  sudo apt install nginx certbot python3-certbot-nginx"
echo "  sudo certbot --nginx -d tu-dominio.cl"
