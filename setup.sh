#!/bin/bash
# WipMind — Script de configuración inicial (Bash/Mac/Linux)

set -e
echo "=== WipMind Setup ==="

cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python manage.py makemigrations users tasks cognitive notifications
python manage.py migrate

echo ""
read -p "¿Crear superusuario admin? (s/n): " resp
if [ "$resp" = "s" ]; then
    python manage.py createsuperuser
fi

echo ""
echo "=== Setup completado ==="
echo "Inicia con: cd backend && python manage.py runserver"
echo "Abre: http://127.0.0.1:8000/"
