# Dashboard de Seguimiento de Aplicación - Memoria del Proyecto

## Estado Actual
- El proyecto cuenta con un `index.html` estático con diseño Tailwind CSS y Material Symbols.
- Se requiere refactorizar para conectar con un webhook de n8n, implementar lógica dinámica y optimizar la interfaz.

## Historial de Cambios
- [2026-04-15] Refactorización y Pulido de Interactividad.
  - Se implementó selección recíproca persistente entre mapa y tabla.
  - Se corrigió la deriva de marcadores (Leaflet transform preservation).
  - Se habilitó visualización completa de pilotos postulados (sin filtros restrictivos).
  - Ajustes de UX: scroll localizado (`block: 'nearest'`) y escalado de iconos sincronizado.

## Procesos y Tareas
- [x] Crear plan de implementación.
- [x] Implementar Loader y `fetchDashboardData()`.
- [x] Integrar Leaflet y renderizado dinámico de marcadores.
- [x] Implementar Filtros (Buscador y Toggle Active).
- [x] Refactorizar Tablas para renderizado dinámico.
- [x] Lógica de Modales (Detalle y Asignación).
- [x] Tabla Global de Pilotos.
- [x] Ajuste de Z-index y Mapeo de Campos.
- [x] Interactividad Persistente y Solución de Bugs (Scroll, Escala, Filtros).

## Notas Técnicas
- URL Webhook Obtención: `https://n8n-nube-jw30.onrender.com/webhook-test/obtener-datos-dashboard`
- URL Webhook Asignación: `https://n8n-nube-jw30.onrender.com/webhook-test/asignar-vuelo-operativo`
- Cuerpo POST Asignación: `{ row_postulacion: pilot.row_number, row_solicitud: flight.row_number, tipo_vuelo, id_solicitud }`
- Selección: `window.selectedFlightId`, `window.markerInstances`.
- CSS Activo: `.row-active`, `.marker-active`.
- Scroll Behavior: `block: 'nearest'` para evitar saltos de pantalla global.
- Modal Postulados: `max-h-[480px]` con scroll interno.
