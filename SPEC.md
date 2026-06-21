# WipMind — Especificación Completa (Spec-First)

---

## PARTE 1 — ESPECIFICACIÓN DEL PRODUCTO

---

### 1. VISIÓN DEL PRODUCTO

**Nombre:** WipMind  
**Tagline:** _Organiza tu estudio. Cuida tu mente._

WipMind es una plataforma web de gestión de tareas académicas que integra herramientas de productividad con indicadores de salud mental y carga cognitiva. Su propósito es optimizar el rendimiento académico y promover el bienestar emocional de estudiantes universitarios, alineado con el ODS 3 (Salud y Bienestar) de la ONU.

**Problema raíz:** Los estudiantes universitarios acumulan tareas sin visibilidad de su carga cognitiva real, lo que deriva en estrés, agotamiento mental y bajo rendimiento.

**Solución:** Un sistema que combina un tablero Scrumban con límites WIP (Work In Progress), un algoritmo de densidad académica en tiempo real, y un módulo de pausas activas que interviene antes del agotamiento.

**Métricas clave (North Star):**
- Tasa de retención de usuarios activos semanales organizando tareas saludablemente
- Porcentaje de reducción de estrés autodeclarado

---

### 2. USUARIOS Y CASOS DE USO

#### 2.1 Perfil de Usuario Principal

| Atributo | Descripción |
|---|---|
| Tipo | Estudiante universitario |
| Edad | 18–30 años |
| Contexto | Múltiples asignaturas con fechas de entrega simultáneas |
| Dolor | Acumulación de tareas, incapacidad de priorizar, sesiones de estudio sin descanso |
| Meta | Organizar su carga académica y estudiar de forma sostenible |

#### 2.2 Casos de Uso Principales

| ID | Caso de Uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Registrarse en la plataforma | Estudiante nuevo | Crear cuenta con datos básicos y preferencias de estudio |
| CU-02 | Iniciar sesión | Estudiante registrado | Acceder de forma segura a su tablero personal |
| CU-03 | Gestionar tareas | Estudiante | Crear, editar, categorizar y eliminar tareas académicas |
| CU-04 | Visualizar tablero Scrumban | Estudiante | Ver y mover tareas entre columnas (Por Hacer / En Proceso / Terminado) |
| CU-05 | Activar temporizador Pomodoro | Estudiante | Iniciar sesión de estudio cronometrada con alertas de pausa |
| CU-06 | Recibir alertas de pausa | Sistema → Estudiante | Notificación automática al superar tiempo saludable continuo |
| CU-07 | Ver densidad académica | Estudiante | Visualizar indicador de carga cognitiva (color/porcentaje) |
| CU-08 | Editar perfil y preferencias | Estudiante | Actualizar datos personales y configuración de tiempos |

---

### 3. FUNCIONALIDADES POR MÓDULO

#### MÓDULO 1: Gestión de Identidad (Sprint 1 — MVP 1)

| ID | Funcionalidad | Descripción |
|---|---|---|
| F-1.1 | Registro de usuario | Formulario con nombre, email, contraseña, carrera y preferencias de descanso |
| F-1.2 | Login / Logout | Autenticación segura con sesión persistente |
| F-1.3 | Perfil de usuario | Vista y edición de datos personales y configuración de tiempos Pomodoro |
| F-1.4 | Recuperación de contraseña | Flujo de reset por email (MVP futuro, placeholder en v1) |

**Criterios de aceptación F-1.1:**
- El sistema valida email único, contraseña ≥ 8 caracteres con al menos un número
- Al registrarse, el usuario es redirigido al dashboard con un mensaje de bienvenida
- Se crean preferencias predeterminadas: 25 min estudio / 5 min descanso

#### MÓDULO 2: Gestión de Tareas — CRUD (Sprint 1 — MVP 1)

| ID | Funcionalidad | Descripción |
|---|---|---|
| F-2.1 | Crear tarea | Formulario: título, descripción, asignatura, fecha de entrega, prioridad, dificultad estimada |
| F-2.2 | Editar tarea | Modificar cualquier campo de una tarea existente |
| F-2.3 | Eliminar tarea | Confirmación antes de borrar; acción irreversible |
| F-2.4 | Listar tareas | Vista de lista con filtros por estado, prioridad y fecha |
| F-2.5 | Cambiar estado de tarea | Mover entre: `TODO` → `IN_PROGRESS` → `DONE` |

**Campos de una Tarea:**
- `título` (str, requerido, max 200 chars)
- `descripción` (text, opcional)
- `asignatura` (str, requerido)
- `fecha_entrega` (date, requerido)
- `prioridad` (enum: ALTA / MEDIA / BAJA)
- `dificultad_estimada` (int 1–5)
- `estado` (enum: TODO / IN_PROGRESS / DONE)
- `tiempo_estimado_horas` (float, opcional)

**Criterios de aceptación F-2.1:**
- No se pueden crear tareas sin título, asignatura o fecha de entrega
- La fecha de entrega no puede ser anterior al día actual
- Al crear, la tarea aparece en columna "Por Hacer" del tablero Scrumban

#### MÓDULO 3: Tablero Visual Scrumban (Sprint 2 — MVP 2)

| ID | Funcionalidad | Descripción |
|---|---|---|
| F-3.1 | Tablero Kanban con 3 columnas | Visualización de tareas en: Por Hacer / En Proceso / Terminado |
| F-3.2 | Drag & Drop de tareas | Mover tarjetas entre columnas con interacción de arrastrar y soltar |
| F-3.3 | Límite WIP | Bloquear el paso a "En Proceso" si se supera el límite configurado (default: 3) |
| F-3.4 | Indicador visual de WIP | Mostrar contador `N/MAX` en columna "En Proceso" con color rojo al alcanzar el límite |
| F-3.5 | Alerta de bloqueo WIP | Mensaje de error claro cuando el usuario intenta superar el límite WIP |

**Criterios de aceptación F-3.3:**
- El límite WIP por defecto es 3 tareas en "En Proceso"
- El usuario puede configurar su propio límite WIP (1–10) desde el perfil
- Al intentar mover una tarea a "En Proceso" con el límite alcanzado, el sistema rechaza la acción con un mensaje: _"Límite WIP alcanzado. Termina una tarea antes de comenzar otra."_
- La tarea vuelve a su columna original visualmente

#### MÓDULO 4: Temporizador de Estudio — Pomodoro (Sprint 3 — MVP 3)

| ID | Funcionalidad | Descripción |
|---|---|---|
| F-4.1 | Temporizador configurable | Inicio / Pausa / Reset con conteo regresivo visible |
| F-4.2 | Ciclo Pomodoro | Alterna automáticamente entre sesión de trabajo y descanso corto |
| F-4.3 | Configuración de tiempos | El usuario define minutos de trabajo y descanso desde su perfil |
| F-4.4 | Contador de ciclos | Muestra cuántos Pomodoros completos se han realizado en la sesión |

**Valores predeterminados:**
- Trabajo: 25 minutos
- Descanso corto: 5 minutos
- Después de 4 ciclos: descanso largo de 15 minutos

#### MÓDULO 5: Alertas y Notificaciones Inteligentes (Sprint 3 — MVP 3)

| ID | Funcionalidad | Descripción |
|---|---|---|
| F-5.1 | Alerta de fin de sesión Pomodoro | Notificación visual + sonido al terminar un ciclo de trabajo |
| F-5.2 | Alerta de pausa activa | Si el usuario ignora el descanso y sigue activo, nueva alerta a los 5 min adicionales |
| F-5.3 | Notificación de tarea próxima | Alerta cuando una tarea vence en menos de 24 horas |
| F-5.4 | Banner de saturación cognitiva | Mensaje de advertencia si la densidad académica supera el umbral ALTO |

#### MÓDULO 6: Algoritmo de Densidad Académica (Sprint 4 — MVP Final)

| ID | Funcionalidad | Descripción |
|---|---|---|
| F-6.1 | Cálculo de densidad | Motor de cálculo de carga cognitiva en tiempo real al crear/modificar tareas |
| F-6.2 | Indicador visual | Barra de progreso con código de colores: Verde / Amarillo / Rojo |
| F-6.3 | Score numérico | Porcentaje de saturación visible en el dashboard (0–100%) |
| F-6.4 | Historial de densidad | Registro histórico para visualizar tendencias semanales |

**Fórmula del Algoritmo de Densidad Académica:**

```
DA = Σ [ (Peso_Prioridad × Peso_Dificultad × Factor_Urgencia) / dias_restantes ]
```

Donde:
- `Peso_Prioridad`: ALTA=3, MEDIA=2, BAJA=1
- `Peso_Dificultad`: valor 1–5 ingresado por el usuario
- `Factor_Urgencia`: 3.0 si quedan ≤2 días / 1.5 si ≤7 días / 1.0 si >7 días
- `dias_restantes`: max(1, fecha_entrega - hoy)

**Umbrales de Clasificación:**
| Score Normalizado | Nivel | Color |
|---|---|---|
| 0–33% | BAJO — Carga manejable | Verde (#22c55e) |
| 34–66% | MEDIO — Atención recomendada | Amarillo (#eab308) |
| 67–100% | ALTO — Sobrecarga cognitiva | Rojo (#ef4444) |

La normalización se basa en el score máximo histórico del usuario (con mínimo de referencia = 15).

---

### 4. FLUJOS DE USUARIO

#### FLUJO 1: Registro y Primer Acceso

```
1. Usuario visita /register
2. Completa formulario (nombre, email, contraseña, carrera)
3. Sistema valida datos
   ├── Error: email ya existe → "Este correo ya está registrado"
   ├── Error: contraseña débil → "La contraseña debe tener al menos 8 caracteres y un número"
   └── OK: crea usuario + perfil con preferencias predeterminadas
4. Redirige a /dashboard con mensaje "¡Bienvenido a WipMind!"
5. Muestra tutorial/overlay con guía de primeros pasos
```

#### FLUJO 2: Crear Tarea

```
1. Usuario hace clic en "+ Nueva Tarea" (dashboard o lista)
2. Se abre modal/formulario con campos
3. Usuario completa: título*, asignatura*, fecha*, prioridad, dificultad
4. Sistema valida
   ├── Error: campos requeridos vacíos → resalta en rojo con mensaje
   ├── Error: fecha pasada → "La fecha de entrega no puede ser anterior a hoy"
   └── OK: guarda tarea en estado TODO
5. Recalcula densidad académica
6. Actualiza tablero y barra de densidad en tiempo real
7. Si densidad pasa a ALTO → muestra banner de advertencia
```

#### FLUJO 3: Mover Tarea en Tablero (con WIP)

```
1. Usuario arrastra tarjeta hacia columna "En Proceso"
2. Sistema verifica límite WIP
   ├── WIP < límite → acepta movimiento, actualiza estado a IN_PROGRESS
   └── WIP ≥ límite → rechaza, tarjeta vuelve al origen
              → muestra alerta: "Límite WIP alcanzado (3/3). Termina una tarea primero."
3. Si acepta: recalcula densidad académica
```

#### FLUJO 4: Sesión Pomodoro

```
1. Usuario hace clic en "Iniciar Pomodoro" en el dashboard
2. Temporizador inicia cuenta regresiva (25:00 por defecto)
3. Usuario estudia
4. Al llegar a 00:00:
   ├── Alerta visual + sonido → "¡Tiempo de descanso! (5 min)"
   └── Temporizador cambia a cuenta de descanso
5. Al terminar el descanso → nueva alerta → siguiente ciclo de trabajo
6. Después de 4 ciclos → "¡Descanso largo! (15 min)"
7. Usuario puede pausar/reiniciar en cualquier momento
8. Si ignora descanso 5 min extra → segunda alerta más urgente
```

#### FLUJO 5: Ver Densidad Académica

```
1. Al cargar dashboard, sistema calcula DA automáticamente
2. Muestra barra de progreso coloreada + porcentaje
3. Tooltip explica cómo se calcula
4. Si nivel = ALTO:
   ├── Barra pulsante en rojo
   └── Banner: "Tu carga es alta. Considera priorizar o eliminar tareas."
5. Al completar tarea → densidad baja → animación de actualización
```

---

### 5. ARQUITECTURA

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                  │
│  HTML/CSS/JS Vanilla │ Templates Django │ Fetch API  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / JSON
┌──────────────────────▼──────────────────────────────┐
│                  DJANGO WEB SERVER                   │
│  ┌────────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │ Auth Views │  │Task Views│  │ Cognitive Engine │  │
│  └────────────┘  └──────────┘  └─────────────────┘  │
│  ┌──────────────────────────────────────────────┐    │
│  │           Django REST Framework (API)        │    │
│  └──────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────┐    │
│  │          Django ORM / Models                 │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  SQLite (dev) / PostgreSQL (prod)    │
└─────────────────────────────────────────────────────┘
```

**Stack Tecnológico:**
| Capa | Tecnología | Justificación |
|---|---|---|
| Backend | Django 5.x + Python 3.12 | "Batteries included", ORM robusto, admin gratis |
| API | Django REST Framework | Serialización, autenticación por token |
| Base de datos | SQLite (dev) | Cero configuración para desarrollo |
| Frontend | HTML5 + CSS3 + JS Vanilla | Sin dependencias externas pesadas, carga rápida |
| Estilos | CSS Custom Properties + Grid/Flex | Responsivo sin frameworks |
| Auth | Django Sessions + CSRF | Seguridad nativa de Django |

---

### 6. REQUISITOS NO FUNCIONALES

| ID | Requisito | Especificación |
|---|---|---|
| RNF-01 | Rendimiento | Carga inicial del dashboard < 2 segundos en conexión estándar |
| RNF-02 | Responsividad | Diseño adaptable a pantallas ≥ 320px (móvil, tablet, desktop) |
| RNF-03 | Seguridad | Protección CSRF en todos los formularios; contraseñas hasheadas con bcrypt |
| RNF-04 | Disponibilidad | Disponible 24/7; sin dependencias de servicios externos en v1 |
| RNF-05 | Usabilidad | Un usuario nuevo puede crear su primera tarea en < 2 minutos sin guía |
| RNF-06 | Escalabilidad | Arquitectura preparada para migrar a PostgreSQL + gunicorn en producción |
| RNF-07 | Accesibilidad | Contraste mínimo WCAG AA; etiquetas ARIA en elementos interactivos |
| RNF-08 | Mantenibilidad | Código modular por apps Django; funciones < 40 líneas |

---

## PARTE 2 — DISEÑO TÉCNICO

---

### MODELOS DE DATOS (Django ORM)

```python
# Entidades principales y relaciones:

UserProfile (1) ──── (1) User [Django built-in]
     │
     └── wip_limit: int
     └── pomodoro_work_minutes: int
     └── pomodoro_break_minutes: int
     └── carrera: str

Task (N) ──── (1) User
     │
     └── titulo, descripcion, asignatura
     └── fecha_entrega, prioridad, dificultad_estimada
     └── estado: TODO | IN_PROGRESS | DONE
     └── tiempo_estimado_horas

AcademicDensityLog (N) ──── (1) User
     └── score, nivel, timestamp

PomodoroSession (N) ──── (1) User
     └── inicio, fin, ciclos_completados, tarea_asociada (FK nullable)
```

### API ENDPOINTS

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/register/` | Registrar nuevo usuario | No |
| POST | `/api/auth/login/` | Login, retorna token/session | No |
| POST | `/api/auth/logout/` | Cerrar sesión | Sí |
| GET | `/api/profile/` | Ver perfil y preferencias | Sí |
| PUT | `/api/profile/` | Actualizar perfil | Sí |
| GET | `/api/tasks/` | Listar tareas del usuario | Sí |
| POST | `/api/tasks/` | Crear nueva tarea | Sí |
| GET | `/api/tasks/{id}/` | Ver detalle de tarea | Sí |
| PUT | `/api/tasks/{id}/` | Editar tarea | Sí |
| PATCH | `/api/tasks/{id}/estado/` | Cambiar estado (con validación WIP) | Sí |
| DELETE | `/api/tasks/{id}/` | Eliminar tarea | Sí |
| GET | `/api/cognitive/density/` | Calcular densidad académica actual | Sí |
| GET | `/api/cognitive/history/` | Historial de densidad (últimos 30 días) | Sí |
| POST | `/api/pomodoro/start/` | Iniciar sesión Pomodoro | Sí |
| POST | `/api/pomodoro/complete/` | Registrar ciclo completado | Sí |

### COMPONENTES FRONTEND

| Componente | Archivo | Responsabilidad |
|---|---|---|
| Dashboard principal | `dashboard.html` | Layout con tablero + densidad + pomodoro |
| Tablero Scrumban | `board.js` | Drag & drop, validación WIP, actualización de estado |
| Temporizador | `pomodoro.js` | Cuenta regresiva, ciclos, alertas |
| Densidad académica | `density.js` | Cálculo visual, barra de progreso, colores |
| Gestor de tareas | `tasks.js` | CRUD modal, validaciones, fetch API |
| Notificaciones | `notifications.js` | Sistema de alertas in-app, banners |
| Auth | `auth.js` | Login/registro, manejo de sesión |
