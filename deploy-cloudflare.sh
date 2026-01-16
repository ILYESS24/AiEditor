#!/bin/bash

# Script de déploiement AiEditor sur Cloudflare Pages
echo "🚀 Déploiement AiEditor sur Cloudflare Pages..."

# Build the project
echo "📦 Construction du projet..."
npm run build:demo

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build. Arrêt du déploiement."
    exit 1
fi

# Deploy to Cloudflare Pages
echo "☁️ Déploiement sur Cloudflare Pages..."
npx wrangler pages deploy dist-demo --project-name=aieditor --commit-dirty=true

if [ $? -eq 0 ]; then
    echo "✅ Déploiement réussi !"
    echo "🌐 URL : https://1bf06947.aieditor.pages.dev"
else
    echo "❌ Erreur lors du déploiement."
    exit 1
fi
