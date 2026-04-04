# 🎨 Frontend - El Consejo

Interfaz visual moderna para el sistema multi-agente de IA "El Consejo".

## 🚀 Características

- **Interfaz visual atractiva** con Tailwind CSS
- **Visualización de agentes** como nodos conectados (estilo atómico)
- **Animación de "latido"** cuando un agente está procesando
- **Gestión dinámica de agentes** - agregar/eliminar en tiempo real
- **Configuración flexible** de personalidades y especializaciones
- **Progreso en tiempo real** con polling automático
- **Resultados estructurados** por ronda
- **Síntesis final** con métricas de calidad
- **Notificaciones toast** para feedback al usuario

## 📁 Estructura

```
frontend/
├── index.html          # Página principal
├── css/
│   └── custom.css      # Estilos personalizados y animaciones
├── js/
│   ├── config.js       # Configuración global
│   ├── agents.js       # Gestión de agentes
│   ├── api.js          # Comunicación con backend
│   └── app.js          # Lógica principal de la aplicación
└── README.md           # Esta documentación
```

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **Tailwind CSS** - Estilos utilitarios
- **Vanilla JavaScript** - Sin frameworks pesados
- **Google Fonts** - Inter & Playfair Display
- **SVG dinámico** - Conexiones entre agentes

## 🎯 Uso

1. **Iniciar el servidor backend**:
   ```bash
   npm start
   ```

2. **Abrir el navegador** en `http://localhost:3000`

3. **Configurar el consejo**:
   - Ingresar el problema/proyecto en el textarea
   - Seleccionar número de rondas (1-10)
   - Agregar/eliminar agentes con el botón +
   - Configurar personalidad y especialización por agente

4. **Iniciar consejo** haciendo click en "Iniciar Consejo"

5. **Ver resultados**:
   - Progreso en tiempo real
   - Respuestas por ronda
   - Síntesis final estructurada

## 🎨 Diseño

### Colores por Especialización

- **Frontend**: 🟣 Púrpura (#667eea)
- **Backend**: 🩷 Rosa (#f5576c)
- **DevOps**: 🔵 Azul (#4facfe)
- **Seguridad**: 🟢 Verde (#43e97b)

### Animaciones

- **Latido (heartbeat)**: Cuando un agente está procesando
- **Fade in up**: Al cargar elementos
- **Flow line**: En las conexiones entre agentes

## 📱 Responsive

El diseño es completamente responsive y se adapta a:
- Desktop (1920px+)
- Tablet (768px - 1920px)
- Mobile (< 768px)

## 🔌 Integración con Backend

El frontend se comunica con los siguientes endpoints:

- `GET /api/config` - Obtener configuración
- `POST /api/council` - Iniciar consejo
- `GET /api/council/:id/status` - Consultar estado

## 🧪 Desarrollo

Para modificar el frontend:

1. Los archivos están en `frontend/`
2. Tailwind CSS se carga via CDN (producción)
3. Los estilos personalizados están en `css/custom.css`
4. La lógica está modularizada en `js/`

## 📝 Notas

- El frontend es completamente standalone
- No requiere build process (todo es vanilla JS + Tailwind CDN)
- Se sirve estáticamente desde Express
- Compatible con navegadores modernos

## 🚀 Futuras Mejoras

- [ ] Soporte para modo oscuro/claro
- [ ] Exportar resultados a PDF/Markdown
- [ ] Historial de consejos anteriores
- [ ] Guardar configuraciones favoritas
- [ ] Gráficos de métricas de rendimiento