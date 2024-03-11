echo off
call pm2 stop all
timeout /t 1 >nul
call pm2 save
echo Node Pausado, pressione uma tecla para continuar
pause >nul