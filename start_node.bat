echo off
call pm2 resurrect
timeout /t 1 >nul
call pm2 start all
echo Node Inicializado, pressione uma tecla para continuar
pause >nul
