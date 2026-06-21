# WipMind — Script de configuración inicial (PowerShell)
# Ejecutar desde: wipmind/

Write-Host "=== WipMind Setup ===" -ForegroundColor Cyan

Set-Location backend

# Crear entorno virtual
if (-not (Test-Path "venv")) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    python -m venv venv
}

# Activar entorno
Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
pip install -r requirements.txt

# Crear migraciones y base de datos
Write-Host "Creando migraciones..." -ForegroundColor Yellow
python manage.py makemigrations users tasks cognitive notifications
python manage.py migrate

# Crear superusuario opcional
$resp = Read-Host "¿Crear superusuario admin? (s/n)"
if ($resp -eq "s") {
    python manage.py createsuperuser
}

Write-Host ""
Write-Host "=== Setup completado ===" -ForegroundColor Green
Write-Host "Inicia el servidor con:" -ForegroundColor Cyan
Write-Host "  cd backend && python manage.py runserver" -ForegroundColor White
Write-Host "Luego abre: http://127.0.0.1:8000/" -ForegroundColor White
