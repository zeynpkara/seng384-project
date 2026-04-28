@echo off
echo Baslatiliyor: PostgreSQL Veritabani...
cd backend\scratch\pgsql
bin\pg_ctl.exe -D data start
echo Veritabani calisiyor! Port: 5432
pause
