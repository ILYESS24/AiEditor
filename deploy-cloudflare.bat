@echo off
echo 🚀 Déploiement AiEditor sur Cloudflare Pages...

REM Build the project
echo 📦 Construction du projet...
npm run build:demo

REM Check if build was successful
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du build. Arrêt du déploiement.
    exit /b 1
)

REM Deploy to Cloudflare Pages
echo ☁️ Déploiement sur Cloudflare Pages...
npx wrangler pages deploy dist-demo --project-name=aieditor --commit-dirty=true

if %errorlevel% equ 0 (
    echo ✅ Déploiement réussi !
    echo 🌐 URL : https://1bf06947.aieditor.pages.dev
) else (
    echo ❌ Erreur lors du déploiement.
    exit /b 1
)
