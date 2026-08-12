@echo off
title Realizzare Mail - Servidor de Desenvolvimento
echo ===================================================
echo   INICIANDO SERVIDOR DO REALIZZARE MAIL
echo ===================================================
echo.
echo Limpando cache do Next.js para evitar erros 404 de rotas...
if exist .next (
    rd /s /q .next 2>nul
)
echo.
echo   Acesse no seu navegador:
echo   - http://localhost:3000
echo   - ou http://localhost:3001 (caso a porta 3000 ja esteja em uso)
echo.
echo   Pressione Ctrl+C para encerrar o servidor.
echo ===================================================
echo.
npm run dev
pause
