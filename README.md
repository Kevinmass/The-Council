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

🟡 ETAPA 5 — Especialización de Agentes
🎯 Objetivo

Agregar roles técnicos a las personalidades

⚙️ Features
Cada agente tiene:
- Personalidad (optimista, pesimista, etc.)
- Especialidad técnica (frontend, backend, devops, seguridad)

**Métricas de Calidad para Codeo:**
- **Complejidad**: ¿La solución es mantenible?
- **Performance**: ¿Considera optimizaciones?
- **Seguridad**: ¿Identifica riesgos?
- **Escalabilidad**: ¿Piensa en crecimiento futuro?

🧪 Test
Mismo problema, agentes con distintas especialidades → enfoques diferentes
✅ Éxito

✔️ Especialización clara y útil

🟠 ETAPA 6 — Control del usuario (clave UX)
🎯 Objetivo

El usuario controla el proceso

⚙️ Features

Input:

{
  "package": "...",
  "rounds": 3,
  "agents": 2,
  "specializations": ["frontend", "backend"]
}
🧪 Test
Cambiar rounds cambia output
✅ Éxito

✔️ El sistema responde dinámicamente a configuración

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

🔵 ETAPA 11 — Interfaz (mínima)
🎯 Objetivo

Hacerlo usable

⚙️ Features
UI simple:
input package
selector de rondas
selector de especializaciones
botón "continuar"
Output por ronda
🧪 Test
Usuario interactúa sin tocar código
✅ Éxito

✔️ Flujo completo usable

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
