🧭 ROADMAP – “El Consejo” (Multi-Agente IA)
🎯 Caso de Uso Principal: Asistente de Desarrollo de Software
💡 El sistema está diseñado para codeo pero es extensible a cualquier dominio

## Stack Tecnológico Recomendado
- **Backend**: Node.js + Express (para desarrollo rápido y flexible)
- **Base de Datos**: SQLite (para persistencia ligera desde el inicio)
- **IA Providers**: Ollama (local), Groq, Together AI (cloud)
- **Arquitectura**: Modular con agentes como "plug-ins"

🟢 ETAPA 0 — Setup base (infra mínima)
🎯 Objetivo

Tener un entorno donde puedas hacer llamadas a IAs gratis.

⚙️ Features
Backend básico (Node.js + Express)
Integración con:
Ollama (obligatorio)
Opcional:
Groq
Together AI

Endpoint simple:

POST /generate
🧪 Test
Mandás un prompt
Recibís respuesta del modelo
✅ Éxito

✔️ Podés hacer 1 llamada a un modelo y responde correctamente

🟢 ETAPA 1 — Agente único con personalidad
🎯 Objetivo

Probar el concepto de "personalidad" con casos de uso de codeo

⚙️ Features
Definir roles:
optimista
pesimista
creativo
obsesivo

Prompt dinámico:

Eres un agente con personalidad: {ROL}
Input: {package}
🧪 Test

Mismo input, distintos roles → respuestas distintas

**Ejemplos de Testing (Codeo):**
- "¿Cómo implementarías un sistema de autenticación JWT?"
- "¿Qué problemas de seguridad podrías encontrar en JWT?"
- "¿Qué enfoques alternativos hay para la autenticación?"
- "¿Qué validaciones y edge cases deberías considerar?"

✅ Éxito

✔️ Se nota claramente el cambio de personalidad

🟡 ETAPA 2 — Consejo básico (multi-agente secuencial)
🎯 Objetivo

Simular el "consejo" con agentes especializados

⚙️ Features
2 agentes (no más todavía)
Ejecución secuencial:
agente A responde
agente B responde usando respuesta de A

**Especializaciones Técnicas (ejemplo):**
- **Frontend**: UI/UX, frameworks
- **Backend**: APIs, bases de datos, arquitectura
- **DevOps**: Deploy, CI/CD, performance
- **Seguridad**: Best practices, vulnerabilidades

🧪 Test

Input:

"quiero una app de delivery con drones"

Salida:

A opina (desde su especialidad)
B responde a A (considerando su especialidad)

✅ Éxito

✔️ Hay interacción real (no respuestas aisladas)

🟡 ETAPA 3 — Sistema de rondas ✅ COMPLETADA
🎯 Objetivo

Implementar el concepto clave: rondas donde cada agente habla 1 vez por ronda durante N rondas

⚙️ Features

Parámetro:

rounds = N

Loop:

for round in N:
  cada agente habla 1 vez
  contexto se acumula entre rondas

🔧 Implementación

- Nuevo método `executeRounds()` en AgentService
- Validación de parámetro rounds (debe ser >= 1)
- Contexto acumulado entre rondas
- Registro detallado en base de datos por ronda
- Respuestas estructuradas por rondas

🧪 Test
Rounds = 2
Cada agente responde 2 veces
Contexto se mantiene entre rondas
✅ Éxito

✔️ Se respeta la estructura de rondas
✔️ Cada agente responde exactamente 1 vez por ronda
✔️ El parámetro "rounds = N" controla el número de rondas
✔️ El contexto se acumula y se pasa entre rondas
✔️ Sistema maneja correctamente múltiples rondas (1, 2, 3+)

🚀 Endpoint Actualizado

POST /api/council
{
  "package": "input del usuario",
  "agents": [
    {"personality": "optimista", "specialization": "frontend"},
    {"personality": "pesimista", "specialization": "backend"}
  ],
  "rounds": 3
}

📋 Ejemplo de Flujo

Ronda 1: Agente 1 → Agente 2
Ronda 2: Agente 1 → Agente 2  
Ronda 3: Agente 1 → Agente 2

Cada agente responde exactamente 3 veces (una por ronda)

🟡 ETAPA 4 — Síntesis Final ✅ IMPLEMENTADA
🎯 Objetivo

Generar una conclusión estructurada después de todas las rondas del consejo

⚙️ Features
- **Síntesis automática** al finalizar todas las rondas
- **Modelo especializado**: qwen3:4b con personalidad neutral
- **Estructura de salida**:
  - Resumen general (2-3 oraciones)
  - Puntos clave (3-5 items)
  - Acuerdos y desacuerdos entre agentes
  - Recomendaciones prácticas (2-4 items)
  - Plan de acción paso a paso (3-5 pasos)
- **Sistema de calidad**: Validación automática del parseo con métricas de calidad
- **Fallback robusto**: Manejo de errores y respuestas parciales
- **Persistencia**: Todo se guarda en SQLite para auditoría

🧪 Test
- Ejecutar consejo con múltiples rondas
- Verificar que la síntesis se genera automáticamente
- Validar estructura de la síntesis (resumen, puntos clave, etc.)
- Verificar métricas de calidad (score >= 60 para aprobación)
✅ Éxito

✔️ La síntesis se ejecuta automáticamente al finalizar las rondas
✔️ El formato de salida es estructurado y consistente
✔️ El sistema de parseo maneja variaciones en el formato
✔️ Las métricas de calidad permiten evaluar la síntesis
✔️ El fallback garantiza que siempre haya una respuesta usable
✔️ Persistencia completa en base de datos

🟡 ETAPA 5 — Especialización de Agentes ✅ IMPLEMENTADA
🎯 Objetivo

Agregar roles técnicos a las personalidades + identificación progresiva de modelos de IA

⚙️ Features
Cada agente tiene:
- Personalidad (optimista, pesimista, etc.)
- Especialidad técnica (frontend, backend, devops, seguridad)
- Modelo de IA asignado según especialización
- Identificación de modelo al finalizar cada respuesta

**Distribución de Modelos por Especialización:**
- **Frontend**: `qwen3:4b` - Optimizado para UI/UX y frameworks
- **Backend**: `gemma3:4b` - Optimizado para lógica y arquitectura
- **DevOps**: `qwen3:4b` - Optimizado para infraestructura
- **Seguridad**: `gemma3:4b` - Optimizado para análisis de riesgos
- **Sintetizador**: `qwen3:4b` - Optimizado para síntesis neutral

**Sistema de Identificación Progresiva:**
Cada agente, al finalizar su respuesta, identifica:
- Modelo actual que está utilizando
- Modelo que utilizó en la ronda anterior (si aplica)

Ejemplo de salida:
```
[Respuesta del agente...]
---
[Modelo: gemma3:4b | Anterior: gemma3:4b]
```

**Métricas de Calidad por Especialización:**

**Frontend:**
- **UX/UI**: ¿La solución es intuitiva y accesible?
- **Performance**: ¿Optimiza renderizado y carga?
- **Mantenibilidad**: ¿El código es limpio y modular?
- **Compatibilidad**: ¿Funciona en múltiples navegadores?

**Backend:**
- **Arquitectura**: ¿Es escalable y bien estructurada?
- **Seguridad**: ¿Protege datos y previene ataques?
- **Performance**: ¿Optimiza consultas y recursos?
- **API Design**: ¿Es RESTful y bien documentada?

**DevOps:**
- **Automatización**: ¿CI/CD eficiente?
- **Monitoreo**: ¿Logs y métricas adecuadas?
- **Escalabilidad**: ¿Soporta crecimiento?
- **Recuperación**: ¿Plan de disaster recovery?

**Seguridad:**
- **Vulnerabilidades**: ¿Identifica OWASP Top 10?
- **Autenticación**: ¿Gestión segura de sesiones?
- **Autorización**: ¿Control de acceso adecuado?
- **Datos**: ¿Encriptación y protección?

🧪 Test
Mismo problema, agentes con distintas especialidades → enfoques diferentes
Verificar identificación de modelos en cada respuesta
✅ Éxito

✔️ Especialización clara y útil
✔️ Cada agente identifica su modelo de IA
✔️ Se puede rastrear evolución de modelos entre rondas

🟠 ETAPA 6 — Control del usuario (clave UX) ✅ COMPLETADA
🎯 Objetivo

El usuario controla el proceso completamente

⚙️ Features

Input:

{
  "package": "...",
  "rounds": 3,
  "agents": [
    {"personality": "optimista", "specialization": "frontend"},
    {"personality": "pesimista", "specialization": "backend"}
  ]
}

**Novedades ETAPA 6:**
- Soporte para N agentes (2-10)
- Validación mejorada de parámetros
- Endpoint unificado `/api/config` para configuración
- Endpoint `/api/council/:id/status` para polling de progreso
- Metadata completa en respuestas

🧪 Test
- Cambiar rounds cambia output
- Agregar/eliminar agentes dinámicamente
- Validación de límites (min 2, max 10 agentes)
✅ Éxito

✔️ El sistema responde dinámicamente a configuración
✔️ Soporte para múltiples agentes (no limitado a 2)
✔️ Validación robusta con mensajes de error descriptivos

🟠 ETAPA 7 — Rotación de personalidades
🎯 Objetivo

Tu diferencial fuerte

⚙️ Features

Rotación por ronda:

roles = [optimista, pesimista, creativo, obsesivo]
shift roles cada ronda
🧪 Test
Mismo agente cambia comportamiento entre rondas
✅ Éxito

✔️ Se percibe cambio de enfoque en el tiempo

🔴 ETAPA 8 — Resumen automático (optimización)
🎯 Objetivo

Reducir costo y mejorar calidad

⚙️ Features
Al final de cada ronda:
generar resumen
Usar resumen en lugar de historial completo
🧪 Test
Comparar:
sin resumen vs con resumen
✅ Éxito

✔️ Menos tokens + coherencia mantenida

🔴 ETAPA 9 — Multi-provider (free tier real)
🎯 Objetivo

Simular "IA distintas"

⚙️ Features
Agente A → Ollama
Agente B → Groq
Agente C → Together AI
🧪 Test
Diferencias reales de estilo/calidad
✅ Éxito

✔️ Consejo heterogéneo (no clones)

🔵 ETAPA 10 — Moderador / Juez (MUY PRO)
🎯 Objetivo

Agregar inteligencia global

⚙️ Features
Nuevo agente:
resume
evalúa
decide mejor propuesta
🧪 Test
Output final con "veredicto"
✅ Éxito

✔️ Resultado claro y usable

🔵 ETAPA 11 — Interfaz (mínima) ✅ IMPLEMENTADA
🎯 Objetivo

Hacerlo usable con una interfaz visual atractiva

⚙️ Features
- **Interfaz visual moderna** con Tailwind CSS
- **Visualización de agentes** como nodos conectados (estilo atómico)
- **Animación de "latido"** cuando un agente está pensando
- **UI interactiva**:
  - Input para package/problema
  - Selector de rondas (1-10)
  - Gestión dinámica de agentes (agregar/eliminar)
  - Selectores de personalidad y especialización por agente
- **Progreso en tiempo real** con polling
- **Resultados estructurados** por ronda
- **Síntesis final** con métricas de calidad
- **Notificaciones toast** para feedback

🧪 Test
- Usuario interactúa sin tocar código
- Agregar/eliminar agentes dinámicamente
- Ver animación de latido durante procesamiento
- Resultados se muestran correctamente
✅ Éxito

✔️ Flujo completo usable
✔️ Interfaz visualmente atractiva y moderna
✔️ Experiencia de usuario intuitiva
✔️ Animaciones y feedback visual

🔵 ETAPA 12 — Feedback del Usuario
🎯 Objetivo

Mejorar iterativamente el sistema

⚙️ Features
Sistema de calificación de respuestas
Feedback cualitativo
Ajuste de parámetros basado en feedback
🧪 Test
El sistema mejora con el uso
✅ Éxito

✔️ Sistema auto-mejorable

🔵 ETAPA 13 — Persistencia de Configuraciones
🎯 Objetivo

Reutilizar configuraciones exitosas

⚙️ Features
Guardar "consejos" exitosos
Cargar configuraciones previas
Templates de configuración
🧪 Test
Reutilizar configuraciones para problemas similares
✅ Éxito

✔️ Configuraciones reutilizables

## 🖥️ Interfaz Web

SPA en **React + Vite** (`frontend/`), servida por Express desde `frontend/dist`:

- **`/`** — landing formal: hero, qué es, cómo funciona, roles, roadmap, CTA.
- **`/app`** — la herramienta: configurás el problema y el panel de agentes, corrés el
  consejo y ves la deliberación por ronda + la síntesis final con métrica de calidad.

Estética "dark premium": fondo WebGL (Aurora, adaptado de [reactbits.dev](https://reactbits.dev)
+ `ogl`), tipografía protagonista (Instrument Serif + Geist), acento de oro contenido.
Muestra un badge de **modo simulado** cuando no hay Ollama. Detalles en
[frontend/README.md](frontend/README.md).

## ▶️ Cómo se ejecuta

El proyecto corre **100 % local** con Node.js. No requiere Docker (pero se puede, ver abajo).

```bash
# 1. Backend
npm install
npm start                     # http://localhost:3000  (entry: src/index.js)

# 2. Frontend — build una vez y lo sirve el backend en /
npm run frontend:install
npm run frontend:build        # genera frontend/dist

# …o, para iterar el frontend con hot-reload (otra terminal):
npm run frontend:dev          # http://localhost:5173  (proxya /api al backend)
```

Las respuestas de los agentes las genera **Ollama** (local, en `http://127.0.0.1:11434`)
con los modelos `qwen3:4b` y `gemma3:4b`. Ver [Modo offline](#-modo-offline-sin-ollama)
si todavía no lo tenés instalado.

Estructura:

```
src/         código del servidor Express (index.js, app.js, config.js, routes/, services/)
frontend/    SPA React + Vite (build en frontend/dist, servido por Express en /)
tests/       scripts de integración
docs/        documentación y notas de diseño
data/        base SQLite (se crea sola)
```

## 🔌 Modo offline (sin Ollama)

Se puede levantar y usar todo el flujo **sin Ollama corriendo ni modelos descargados**.
Sirve para trabajar el frontend en un equipo nuevo.

| Variable | Default | Efecto |
|---|---|---|
| `MOCK_LLM` | `false` | `true` → nunca contacta a Ollama, responde siempre simulado |
| `LLM_FALLBACK_MOCK` | `true` | si Ollama no responde o el modelo no está instalado, responde simulado en vez de fallar |

Con los valores por defecto, `npm start` ya funciona sin Ollama: `/api/council` y
`/api/generate` devuelven respuestas simuladas deterministas (marcadas con `mock: true`
en la respuesta, y `mode: "mock-fallback"` en `GET /api/health`). En cuanto se inicia
Ollama con los modelos, se vuelven a usar respuestas reales automáticamente.

```bash
npm run start:mock                 # fuerza modo simulado (multiplataforma)
# o:
MOCK_LLM=true npm start            # bash
$env:MOCK_LLM='true'; npm start    # PowerShell
```

## 🐳 Docker

La imagen **compila el frontend adentro** (stage Vite), así que un solo `docker compose up`
sirve landing + app ya construidas.

```bash
# App sola, modo simulado — no necesita Ollama:
docker compose up --build
#   -> http://localhost:3000

# App + Ollama real:
docker compose --profile full up --build -d
docker compose --profile full --profile setup run --rm pull-models   # baja los modelos (1 vez)
```

- `Dockerfile`: build multi-stage sobre `node:22-bookworm-slim` — un stage compila `sqlite3`
  desde el código, otro corre `vite build`, y la imagen final (sin toolchain, usuario no-root)
  solo lleva `node_modules` + `src` + `frontend/dist`. `HEALTHCHECK` contra `/api/health`.
- La base SQLite persiste en el volumen `council-data`; los modelos de Ollama en `ollama-models`.
- Variables (`MOCK_LLM`, `LLM_FALLBACK_MOCK`, `OLLAMA_BASE_URL`, …) se pueden pasar por `.env` o entorno: `MOCK_LLM=true docker compose up`.

## 🚀 CI/CD con GitHub Actions

Este proyecto cuenta con integración continua automatizada mediante GitHub Actions.

### Configuración del Workflow

El workflow está configurado en `.github/workflows/ci.yml` e incluye:

- **Trigger**: Se ejecuta automáticamente en cada push a `main`/`master` y en pull requests
- **Entorno**: Ubuntu latest con Node.js 18
- **Ollama**: Instalación automática y descarga del modelo `gemma3:4b`
- **Tests**: Ejecución automática de todos los tests de integración

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests individuales
npm run test:council      # Test del consejo básico
npm run test:rondas       # Test del sistema de rondas
npm run test:sintesis     # Test de síntesis final
npm run test:contexto     # Test de contexto del consejo
npm run test:identificacion  # Test de identificación de modelos (ETAPA 5)

# Iniciar servidor en modo test
npm run start:test
```

### Variables de Entorno

El proyecto utiliza las siguientes variables de entorno (ver `.env.example`):

```bash
# Server Configuration
PORT=3000
HOST=localhost

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# Database Configuration
DB_PATH=./data/council.db
```

### Requisitos para CI/CD

1. **Ollama**: El workflow instala automáticamente Ollama en el runner
2. **Modelos**: Se descarga automáticamente el modelo `gemma3:4b`
3. **Puertos**: El servidor usa el puerto 3000 y Ollama el 11434

### Flujo del Workflow

1. Checkout del código
2. Setup de Node.js con cache de npm
3. Instalación de dependencias
4. Instalación de Ollama
5. Descarga del modelo AI
6. Inicialización de la base de datos
7. Inicio del servidor en background
8. Health check del servidor
9. Ejecución de tests de integración
10. Limpieza de procesos
11. Upload de resultados (si fallan)

### Contribuir

Al hacer un pull request, el workflow de CI se ejecutará automáticamente para validar que:
- El código compila correctamente
- Las dependencias se instalan sin errores
- Los tests de integración pasan
- El servidor inicia correctamente

### Badge de Estado

Puedes agregar este badge a tu README para mostrar el estado del CI:

```markdown
[![CI - Tests & Build](https://github.com/Kevinmass/The-Council/actions/workflows/ci.yml/badge.svg)](https://github.com/Kevinmass/The-Council/actions/workflows/ci.yml)
```
