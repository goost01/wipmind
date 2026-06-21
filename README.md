# 🧠 WipMind

> **Organiza tu estudio. Cuida tu mente.**

WipMind es una plataforma web de gestión de tareas académicas que integra un tablero Scrumban, un algoritmo de densidad cognitiva en tiempo real y un temporizador Pomodoro. Diseñada para estudiantes universitarios bajo los lineamientos del **ODS 3 (Salud y Bienestar)**.

---

## Equipo

| Nombre | Rol |
|---|---|
| Juan Pablo Vega | Desarrollador |
| Fabián Vargas Vilos | Desarrollador |
| Nicolás Silva | Desarrollador |
| Julián García | Desarrollador |
| Luis Ruiz | Desarrollador |

**Profesor:** Rubén Patricio Letelier León — Sección 302, UTEM 2026-1

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Python 3.12+ · Django 5.x |
| API | Django REST Framework |
| Base de datos | SQLite (desarrollo) |
| Frontend | HTML5 · CSS3 · JavaScript Vanilla |
| Auth | Django Sessions + Token Auth |

---

## Requisitos previos

- **Python 3.10 o superior** — [python.org](https://www.python.org/downloads/)
- **pip** (incluido con Python)
- **Git**

> No se necesita Node.js, Docker ni ninguna base de datos externa.

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/wipmind.git
cd wipmind
```

### 2. Crear y activar el entorno virtual

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
```

**Mac / Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

> Si en Windows aparece el error `"la ejecución de scripts está deshabilitada"`, ejecuta esto en PowerShell como administrador:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar la base de datos

```bash
python manage.py migrate
```

Esto crea el archivo `db.sqlite3` con todas las tablas necesarias. La BD **no se sube al repositorio** — se genera localmente en este paso.

### 5. Cargar datos de prueba

```bash
python manage.py loaddata fixtures/datos_prueba.json
```

Esto crea automáticamente:

| Usuario | Contraseña | Rol |
|---|---|---|
| `estudiante` | `Prueba123` | Estudiante con 4 tareas de ejemplo |
| `admin` | `Admin1234` | Superusuario (panel `/admin/`) |

> Si prefieres crear tu propio superusuario: `python manage.py createsuperuser`

### 6. Iniciar el servidor

```bash
python manage.py runserver
```

Abre tu navegador en: **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

## Estructura del proyecto

```
wipmind/
├── backend/
│   ├── apps/
│   │   ├── users/          # Autenticación y perfiles de usuario
│   │   ├── tasks/          # CRUD de tareas y sesiones Pomodoro
│   │   ├── cognitive/      # Algoritmo de densidad académica
│   │   └── notifications/  # Motor de alertas dinámicas
│   ├── wipmind_project/    # Configuración Django (settings, urls, wsgi)
│   ├── fixtures/
│   │   └── datos_prueba.json   # Datos de prueba (usuarios y tareas)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── static/
│   │   ├── css/main.css    # Diseño completo de la aplicación
│   │   └── js/             # Módulos JS: api, board, density, pomodoro, tasks, toast
│   └── templates/          # Páginas HTML: login, register, dashboard, tasks, profile
├── SPEC.md                 # Especificación Spec-First completa
├── .gitignore
└── README.md
```

---

## Páginas disponibles

| URL | Descripción |
|---|---|
| `/` | Redirige al dashboard si hay sesión, o al login |
| `/login/` | Inicio de sesión |
| `/register/` | Registro de nuevo usuario |
| `/dashboard/` | Panel principal con tablero, densidad y Pomodoro |
| `/tasks/` | Lista de tareas con filtros |
| `/profile/` | Perfil y configuración personal |
| `/admin/` | Panel de administración de Django |

---

## API REST

La API está disponible en `/api/`. Requiere autenticación (sesión o token) en todos los endpoints excepto registro y login.

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register/` | Registrar usuario |
| POST | `/api/auth/login/` | Iniciar sesión |
| POST | `/api/auth/logout/` | Cerrar sesión |
| GET/PUT | `/api/auth/profile/` | Ver y editar perfil |
| GET/POST | `/api/tasks/` | Listar y crear tareas |
| GET/PUT/DELETE | `/api/tasks/{id}/` | Detalle, editar, eliminar tarea |
| PATCH | `/api/tasks/{id}/estado/` | Cambiar estado (con validación WIP) |
| GET | `/api/cognitive/density/` | Densidad académica actual |
| GET | `/api/cognitive/density/history/` | Historial de densidad (30 días) |
| GET | `/api/notifications/` | Alertas activas del usuario |

---

## Funcionalidades principales

### Tablero Scrumban
Visualiza tus tareas en 3 columnas: **Por Hacer → En Proceso → Terminado**. Arrastra y suelta para moverlas. El sistema bloquea automáticamente el paso a "En Proceso" si superas tu límite WIP (configurable en el perfil, por defecto 3 tareas).

### Algoritmo de Densidad Académica
Calcula en tiempo real el nivel de carga cognitiva:

```
DA = Σ [ (Peso_Prioridad × Dificultad × Factor_Urgencia) / días_restantes ]
```

| Score | Nivel | Indicador |
|---|---|---|
| 0–33% | BAJO | 🟢 Carga manejable |
| 34–66% | MEDIO | 🟡 Atención recomendada |
| 67–100% | ALTO | 🔴 Sobrecarga cognitiva |

### Temporizador Pomodoro
Sesiones de trabajo cronometradas con descansos automáticos. Configura tus propios tiempos desde el perfil (por defecto: 25 min trabajo / 5 min descanso / 15 min descanso largo cada 4 ciclos).

### Notificaciones Inteligentes
- Tareas que vencen hoy o mañana
- Alerta cuando la densidad académica es ALTO
- Aviso cuando el límite WIP está saturado

---

## Solución de problemas frecuentes

**`ModuleNotFoundError: No module named 'rest_framework'`**
→ El entorno virtual no está activado. Ejecuta `venv\Scripts\Activate.ps1` (Windows) o `source venv/bin/activate` (Mac/Linux) antes de cualquier comando.

**`TemplateSyntaxError: Invalid block tag 'static'`**
→ Ejecuta `python manage.py collectstatic` o verifica que `django.contrib.staticfiles` esté en `INSTALLED_APPS`.

**El servidor arranca pero `/dashboard/` redirige a `/login/`**
→ Carga los datos de prueba: `python manage.py loaddata fixtures/datos_prueba.json` y usa las credenciales indicadas arriba.

**`django.db.utils.OperationalError: no such table`**
→ Ejecuta las migraciones: `python manage.py migrate`

---

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nombre-feature`
3. Commitea tus cambios: `git commit -m "feat: descripción"`
4. Haz push a tu rama: `git push origin feature/nombre-feature`
5. Abre un Pull Request

---

## Licencia

Proyecto académico — UTEM 2026-1, Desarrollo Ágil.
